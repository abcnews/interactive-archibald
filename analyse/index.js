
var moments, clusters, predictors, async, loadPixels, fs,
	output, winnersMap, finalistsMap;

Moments = require('./moments');
Cluster = require('./cluster');
predictors = require('./predictors');
async = require('async');
loadPixels = require('./loadPixels');
fs = require('fs');

// a lookup so we can load more stuff into a winner, mapped by file name
winnersMap = {};
finalistsMap = {};

output = {
	winners: [],
	finalists: []
}

// process winners
loadPixels('analyse/winners/small/', processWinners);

// process finalists
predictors(function(predictors){
	predictors.forEach(function(d){
		var finalist;
		finalist = {
			file: d.image,
			predictors: d.predictors,
			predictorValues: d.predictorValues
		};
		finalistsMap[d.image] = finalist;
		output.finalists.push(finalist);
	});
});

function processWinners(err, pixels) {
	
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
				var moments;
				moments = new Moments(img.pixels);
				winnersMap[img.file].hueHistogram = moments.hueHistogram();
				cb();
			}, function(err) {
				cb(err);
			});
		},

		// palettes
		function(cb) {
			async.each(pixels, function(img, cb){
				var palette;
				palette = new Cluster(img.pixels);
				winnersMap[img.file].palette = palette.rgb();
				cb();
			}, function(err) {
				cb(err);
			});
		}

	], organise);

}

function organise(err, results) {
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