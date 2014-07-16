
var cluster, convert;

// Requirements
cluster = require('clusterfck');
convert = require('color-convert');

function Palette(pixels, clusters) {

	if ( !(this instanceof Palette) ) {
		return new Palette(pixels, clusters);
	}

	clusters = clusters || 5;

	this.pixels = pixels.map(function(d){
		return convert.rgb2lab(d);
	});
	this.palette = palette(this.pixels, clusters);
	
	return this;
}

Palette.prototype.rgb = function(){
	return this.palette.map(function(d){
		return convert.lab2rgb(d);
	});
};

module.exports = Palette;

function palette(pixels, count) {
	var clusters, palette;
	clusters = cluster.kmeans(pixels, count);
	clusters.sort(function(a,b){
		return b.length - a.length;
	});
	palette = clusters.map(function(d){
		var color, n, sums;
		n = d.length;
		sums = [0,0,0];
		while(color = d.pop()) {
			sums[0] += color[0];
			sums[1] += color[1];
			sums[2] += color[2];
		}
		return [sums[0]/n,sums[1]/n,sums[2]/n];
	});
	
	return palette;
}