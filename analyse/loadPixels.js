
var async, fs, path, pixels, convert,
	output;

async = require('async');
fs = require('fs');
path = require('path');
pixels = require('get-pixels');
convert = require('color-convert');

output = [];

module.exports = function(folder, callback) {

	fs.readdir(folder, function(err, files){
		if (err) {
			callback(err);
		}

		files = files.filter(function(d){
			return d.indexOf('.jpg') > 0;
		});

		// Smaller set for testing
		// files = files.slice(0, 2);

		files = files.map(function(d) {
			return path.join(folder, d);
		});

		async.each(files, loadData, function(err) {
			callback(err, output);
		});

	});
}

function loadData(file, cb) {
	pixels(file, function(err, px) {

		if(err) {
			cb(err);
			return;
		}
		
		var i, x, y, color, n, shape, moments, s, max, out;

		shape = px.shape.slice();
		n = shape[0] * shape[1];
		out = {
			file: file.substr(file.lastIndexOf('/')+1),
			pixels: []
		}
		
		for(x=0; x < px.shape[0]; ++x) {
			for(var y=0; y<px.shape[1]; ++y) {
				// all operations performed in the Lab colour space.
				out.pixels.push([
					px.data[px.pick(x,y).offset],
					px.data[px.pick(x,y).offset+1],
					px.data[px.pick(x,y).offset+2]
				]);
			}
		}

		output.push(out);

		console.log("Loaded: ",file);
		cb();
	});
}