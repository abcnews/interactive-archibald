
var Moments, Clusters, Predictors, async, loadPixels, fs, Histogram,
	winnersData, finalistsData,
	output, winnersMap, finalistsMap;

Moments = require('./moments');
Palette = require('./palette');
Histogram = require('./histogram');
Predictors = require('./predictors');
async = require('async');
loadPixels = require('./loadPixels');
fs = require('fs');

// data
winnersData = require('./data/winners.json');
finalistsData = require('./data/finalists.json');

// a lookup so we can load more stuff into a winner, mapped by file name
winnersMap = {};
finalistsMap = {};

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

	
function processFinalists(pixels) {

	var predictors;

	
	// might as well map them here
	pixels.forEach(function(d){
		var finalist;
		finalist = {
			file: d.file
		};
		finalistsMap[d.file] = finalist;
		output.finalists.push(finalist);
	});
	console.log(finalistsMap);
	predictors = Predictors(winnersData.elements);
	finalistsData.elements.forEach(function(d){
		var factors, values, id, name;
		id = d.image
			.replace('http://www.artgallery.nsw.gov.au/media/thumbnails/prize_images/','')
			.replace(/\.[0-9]+x.*$/, '');
		
		factors = predictors.factors(d);
		values = predictors.values(d);
		name = d.artistname.split(' ');

		if (finalistsMap[id]) {
			finalistsMap[id].predictors = factors;
			finalistsMap[id].image = name[name.length-1] + '.jpg';
		} else {
			console.log('Error: missing finalist (' + id + ')');
		}
		
	});

	// predictors(function(predictors){
	// 	predictors.forEach(function(d){
	// 		var finalist;
	// 		finalist = {
	// 			file: d.image,
	// 			predictors: d.predictors,
	// 			predictorValues: d.predictorValues
	// 		};
	// 		finalistsMap[d.image] = finalist;
	// 		output.finalists.push(finalist);
	// 	});
		
	// });


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