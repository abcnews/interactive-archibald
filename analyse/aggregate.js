
var pixels, fs, path, tinycolor, imagesPath, outputPath, allData;

// Requirements
pixels = require('get-pixels');
fs = require('fs');
path = require('path');
tinycolor = require('tinycolor2');
async = require('async');

// Data
allData = [];

module.exports = function(images, cb) {
	imagesPath = images;
	fs.readdir(imagesPath, function(err, files){
		if (err) {
			cb(err);
		}

		async.each(files, analyseFile, function(err) {
			cb(err, allData);
		});
	});
}

function getBrightness(rgb) {
    return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
}

// `rgbToHsl`
// Converts an RGB color value to HSL.
// *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
// *Returns:* { h, s, l } in [0,1]
function rgbToHsl(rgb) {

    var max = Math.max.apply(null, rgb),
    	min = Math.min.apply(null, rgb),
    	h, s, l = (max + min) / 2;

    if(max == min) {
        h = s = 0; // achromatic
    }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case rgb[0]: h = (rgb[1] - rgb[2]) / d + (rgb[1] < rgb[2] ? 6 : 0); break;
            case rgb[1]: h = (rgb[2] - rgb[0]) / d + 2; break;
            case rgb[2]: h = (rgb[0] - rgb[1]) / d + 4; break;
        }

        h /= 6;
    }

    return { h: h, s: s, l: l };
}

function analyseFile(file, cb){
	
	pixels(path.join(imagesPath, file), function(err, px) {

		if(err) {
			cb(err);
			return;
		}
		
		var i, x, y, color, hues, saturations, brightness, brigthnesses, darks, lights, blackOrWhite;

		hues = [];
		brigthnesses = [];

		// Initialize arrays
		i = 0;
		while (i<=360) {
			hues[i++] = 0;
		}
		i = 0;
		while (i<256) {
			brigthnesses[i++] = 0;
		}
		darks = 0;
		lights = 0;

		for(x=0; x < px.shape[0]; ++x) {
			for(var y=0; y<px.shape[1]; ++y) {
				rgb = [
					px.data[px.pick(x,y).offset],
					px.data[px.pick(x,y).offset+1],
					px.data[px.pick(x,y).offset+2]
				];

				blackOrWhite = ((rgb[0]+rgb[1]+rgb[2]) === 0 || (rgb[0]+rgb[1]+rgb[2]) === 765);

				brightness = Math.round(getBrightness(rgb));

				brigthnesses[brightness]++;


				if (!blackOrWhite) {
					// console.log(rgbToHsl(rgb));
					hues[Math.round(rgbToHsl(rgb).h*360)]++;
				}
				// brigthnesses[color];
			}
		}

		allData.push({
			file: file,
			hues: hues,
			brigthnesses: brigthnesses
		});
		console.log(file + ' analysed!');
		cb();
	});
}


	