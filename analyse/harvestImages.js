// Generate and output a json file with prediction data for all finalists based
// on previous winners.

// vars
var fs, request, async, path;

// requirements
fs = require('fs');
path = require('path');
request = require('request');
async = require('async');
	
function getImages(images, outputDir, callback) {
	async.eachLimit(images, 5, function(image, cb) {
		request('http://www.artgallery.nsw.gov.au/media/prize_images/'+image, cb)
			.pipe(fs.createWriteStream(path.join(outputDir, image)));
	}, callback);
}

return getImages;