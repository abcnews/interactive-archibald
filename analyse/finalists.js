var pixels, fs, path, tinycolor, imagesPath, outputPath, allData;

// Requirements
pixels = require('get-pixels');
fs = require('fs');
path = require('path');
tinycolor = require('tinycolor2');
async = require('async');
atoll = require('atoll');

// Settings
imagesPath = 'analyse/finalists/';
outputPath = 'src/data/finalists.json';

// Data
allData = [];

// console.log(jStat);

fs.readdir(imagesPath, function(err, files){
	if (err) {
		console.log(err);
	}

	files.forEach(function(file) {
		allData.push({
			file: file
		});
	})

	fs.writeFile(outputPath, JSON.stringify(allData), function(err) {
		if (err) console.log(err);
		console.log("Done");
	});

	// async.each(files, processFile, function(err) {
	// 	if (err) {
	// 		console.log(err);
	// 	} else {
	// 		fs.writeFile(outputPath, JSON.stringify(allData), function(err) {
	// 			if (err) {
	// 				console.log(err);
	// 			} else {
	// 				console.log('Done.');
	// 			}
	// 		});
	// 	}
	// });
});

// function processFile(file, cb) {

// }