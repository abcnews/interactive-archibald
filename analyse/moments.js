
var convert, async, atoll;

// Requirements
convert = require('color-convert');
async = require('async');
atoll = require('atoll');

module.exports = Moments;

function Moments(pixels) {
	this.pixels = pixels;
	return this;
}

Moments.prototype.hueHistogram = function() {
	var pixels, i, histogram;

	pixels = this.pixels.map(function(d){
		var hsv = convert.rgb2hsv(d);
		// hsv[0] = hsv[0]/360;
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

function circularMean(vector) {
	var a, cartesian, sin, cos, mean;

	cartesian = vector.map(function(pct){
		var rad;
		rad = pct/100*360*(Math.PI/180);
		return [Math.cos(rad), Math.sin(rad)];
	});

	// cos == x axis
	// sin == y axis
	
	cos = atoll(cartesian.map(function(d){return d[0]}));
	sin = atoll(cartesian.map(function(d){return d[1]}));

	// Mean angle in radians
	// atan2 takes the y param first
	return Math.atan2(sin.mean(), cos.mean());
}

function analyse(pixels) {
	
	var i, x, y, color, n, shape, hsv, moments, s, max;
	
	hsv = [[],[],[]];

	moments = [];
	histograms = [];
	[hsv[0]].forEach(function(channel, idx){
		var a, i, ii, hist, theseMoments, validHues;

		// bin values for histograms
		i = channel.length;
		hist = [];
		validHues = [];
		while (--i) {
			ii = Math.floor((idx === 0) ? channel[i]*360 : channel[i]*50);
			if (
				(idx === 0 && hsv[1][i] > 0.2 && hsv[2][i] > 0.2) || 
				(idx === 1 && hsv[2][i] > 0.2) || 
				(idx === 2)
			) {
				hist[ii] = hist[ii]+1 || 1;
				if (idx === 0) {
					validHues.push(ii);
				}
			}
		}

		

		// calculate moments
		a = atoll(channel);
		theseMoments = [
			(idx === 0) ? circularMean(validHues) : a.mean(),
			a.stdDevPop(),
			a.skewnessPop()
		];

		moments.push(theseMoments);
		histograms.push(hist);
	});

	allData.push({
		file: file,
		year: file.substr(0, 4),
		moments: moments,
		histograms: histograms
	});
	
	console.log(file + ' analysed!');
	
}


