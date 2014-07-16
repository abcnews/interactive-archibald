
var Moments, Clusters, Predictors, async, loadPixels, fs, Histogram, vectorDistance,
	winnersData, finalistsData,
	output, winnersMap, finalistsMap, colourDistances;

Moments = require('./moments');
Palette = require('./palette');
Histogram = require('./histogram');
Predictors = require('./predictors');
async = require('async');
loadPixels = require('./loadPixels');
vectorDistance = require('../node_modules/clusterfck/lib/distance');
fs = require('fs');

// data
winnersData = require('./data/winners.json');
finalistsData = require('./data/finalists.json');

// a lookup so we can load more stuff into a winner, mapped by file name
winnersMap = {};
finalistsMap = {};
colourDistances = {};

output = {
	winners: [],
	finalists: []
}

async.series([
	function(cb) {
		loadPixels('analyse/winners/small/', function(err, pixels){
			processWinners(pixels);
			cb();
		});
	},
	function(cb) {
		loadPixels('analyse/finalists/small/', function(err, pixels) {

			pixels.forEach(function(d){
				var finalist;
				finalist = {
					file: d.file
				};
				finalistsMap[d.file] = finalist;
				
				output.finalists.push(finalist);
			});

			generateFinalistColourDistances(pixels);
			processFinalists(pixels);
			cb();
		});
	}
], function(err) {
	if (err) {
		console.log(err);
	}
	saveOutput();	
});

function generateFinalistColourDistances(pixels) {

	var raw, maxDistance;

	raw = [];
	maxDistance = 0;

	pixels.forEach(function(d){
		var thisRaw, palette;

		thisRaw = {};

		thisRaw.file = d.file;
		thisRaw.totalDistance = 0;

		colourDistances[d.file] = thisRaw;

		palette = Palette(d.pixels).rgb();

		output.winners.forEach(function(winner){
			thisRaw.totalDistance += vectorDistance.euclidean(winner.palette[0], palette[0]);
		});

		if (thisRaw.totalDistance > maxDistance) {
			maxDistance = thisRaw.totalDistance;
		}
	});

	finalistsData.elements.forEach(function(d){
		var id, out;

		id = getId(d.image);

		if (colourDistances[id]) {
			out = colourDistances[id].totalDistance/maxDistance;
		} else {
			console.log('Error: missing colour distance (' + id + ')');
			out = 1;
		}
		d['colour-profile'] = 1-out;
	});
}
	
function processFinalists(pixels) {

	var predictors;
	
	predictors = Predictors(winnersData.elements);
	finalistsData.elements.forEach(function(d){
		var factors, values, id, name, finalistOutput;

		id = getId(d.image);

		if (finalistsMap[id]) {
			finalistOutput = finalistsMap[id];
		} else {
			console.log('Error: missing finalist (' + id + ')');
			return;
		}

		
		factors = predictors.factors(d);
		values = predictors.values(d);
		name = d.artistname.split(' ');

		factors['colour-profile'] = d['colour-profile'];

		finalistOutput.predictors = factors;
		finalistOutput.image = name[name.length-1] + '.jpg';
		finalistOutput.artist = d.artistname;
		finalistOutput.title = d.title;
		finalistOutput.cmid = d.coremediaid;
		
	});

}

function getId(url) {
	return url
		.replace('http://www.artgallery.nsw.gov.au/media/thumbnails/prize_images/','')
		.replace(/\.[0-9]+x.*$/, '');
}

function processWinners(pixels) {
	
	// might as well map the winners here
	pixels.forEach(function(d){
		var winner;
		winner = {
			file: d.file,
			year: d.file.substr(0, 4)
		};
		winnersMap[d.file] = winner;
		output.winners.push(winner);
	});
	
	async.parallel([

		// moments
		function(cb) {
			async.each(pixels, function(img, cb){
				winnersMap[img.file].hueHistogram = Histogram(img.pixels).hue();
				cb();
			}, function(err) {
				cb(err);
			});
		},

		// palettes
		function(cb) {
			async.each(pixels, function(img, cb){
				winnersMap[img.file].palette = Palette(img.pixels).rgb();
				cb();
			}, function(err) {
				cb(err);
			});
		}
	]);
}

function saveOutput() {
	var key;
	
	for (key in output) {
		save(output[key], 'src/data/' + key + '.json');
	}
}

// Save the output
function save(object, file) {
	fs.writeFile(file, JSON.stringify(object), function(err) {
		if (err) console.log(err);
		console.log("Output saved (" + file + ")!");
	});
}