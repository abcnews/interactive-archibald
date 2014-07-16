
var convert, async, atoll;

// Requirements
convert = require('color-convert');

module.exports = Histogram;

function Histogram(pixels) {
	
	if ( !(this instanceof Histogram) ) {
		return new Histogram(pixels);
	}

	this.pixels = pixels;
	return this;
}

Histogram.prototype.hue = function() {
	var pixels, i, histogram;

	pixels = this.pixels.map(function(d){
		var hsv = convert.rgb2hsv(d);
		return hsv;
	});

	// filter invalid hues due to either low intensity or saturation
	pixels = pixels.filter(function(d){
		return (d[1] > 10 && d[2] > 10);
	});

	i = pixels.length;
	histogram = [];
	while (--i) {
		histogram[pixels[i][0]] = histogram[pixels[i][0]]+1 || 1;
	}
	return histogram;
};


