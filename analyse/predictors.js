// Generate and output a json file with prediction data for all finalists based
// on previous winners.

// vars
var Stats, async, // dependencies
	stats, finalists,
	output,
	tabletop,
	googleDocsKey,
	predictors;

// requirements
Stats = require('./stats');
async = require('async');

// define a list of predictors
predictors = [{
	id: 'gender-artist',
	field: 'genderartist',
	method: 'percentage'
},{
	id: 'gender-subject',
	field: 'gendersubject',
	method: 'percentage'
},{
	id: 'ethnicity-artist',
	field: 'artistethnicity',
	method: 'percentage',
},{
	id: 'ethnicity-subject',
	field: 'subjectethnicity',
	method: 'percentage'
},{
	id: 'occupation-subject',
	field: 'subjectoccupation',
	method: 'percentage'
},{
	id: 'canvas-size',
	method: 'meandistance'
},{
	id: 'panels',
	method: 'percentage'
},{
	id: 'location-state',
	method: 'percentage'
},{
	id: 'location-city',
	method: 'percentage'
},{
	id: 'colour-profile'
},{
	id: 'aspect-ratio',
	method: 'meandistance'
},{
	id: 'previous-entries'
},{
	id: 'previous-wins'
},{
	id: 'previous-hangings'
},{
	id: 'medium',
	method: 'percentage'
},{
	id: 'canvas',
	method: 'percentage',
	weight: 0.5
},{
	id: 'style',
	method: 'percentage',
	weight: 1.5
},{
	id: 'artist-age',
	method: 'meandistance'
}];

function Predictors(winnersData) {
	if ( !(this instanceof Predictors) ) {
		return new Predictors(winnersData);
	}

	this.stats = Stats(preProcessWinnersData(winnersData));
	
	return this;
}

Predictors.prototype.factors = function(finalistData) {
	var result, _this;
	_this = this;
	finalistData = preProcessFinalistData(finalistData);
	result = {};
	predictors.forEach(caclulateFactors);
	return result;

	function caclulateFactors(predictor) {
		var field, weight;
		if (predictor.method && typeof _this.stats[predictor.method] === 'function') {
			field = predictor.field || predictor.id;
			weight = predictor.weight || 1;
			result[predictor.id] = weight * _this.stats[predictor.method](field, finalistData[field]);
		}
	}
};

Predictors.prototype.values = function(finalistData) {
	var result;
	finalistData = preProcessFinalistData(finalistData);
	result = {};
	predictors.forEach(getValues);
	return result;

	function getValues(predictor) {
		var field;
		field = predictor.field || predictor.id;
		result[predictor.id] = finalistData[field];
	}
};

module.exports = Predictors;

function processFinalists(finalist) {
	var name = finalist.artistname.split(' ');

	result = {
		// image: finalist.image
		// 	.replace('http://www.artgallery.nsw.gov.au/media/thumbnails/prize_images/','')
		// 	.replace(/\.[0-9]+x.*$/, '')
		image: name[name.length-1] + '.jpg'
	};
	
	result.predictors = {};
	result.predictorValues = {};
	

	return result;

	
}

function normaliseSize(widths, heights) {
	var result;
	widths = widths.split(',');
	heights = heights.split(',');
	
	result = 0;
	for (i=widths.length;i--;) {
		result += +widths[i] * +heights[i];
	}
	return result;
}

function normaliseAspectRatio(widths, heights) {
	
	widths = widths.split(',');
	heights = heights.split(',');
	
	return widths.reduce(function(r, d){return r+(+d);},0)/Math.max.apply(Math,heights);
}

// pre-process to combine, sanitise and otherwise modify the raw data coming in from Google Spreadsheets
function preProcessWinnersData(data) {
	data.forEach(function(d){
		var i, location, medium, widths, heights, widthSum;

		d['aspect-ratio'] = normaliseAspectRatio(d.width, d.height);
		d['canvas-size'] = normaliseSize(d.width, d.height);

		// console.log(d['aspect-ratio']);
		location = d.artistlocation.toLowerCase().split(', ');
		d['location-city'] = location[0];
		d['location-state'] = location[1];

		d['panels'] = d['width'].split(',').length + '';

		d['artist-age'] = d['ageofartist'];
		
		medium = d.medium.split(' on ');
		d.medium = medium[0];
		d.canvas = medium[1] || '';
	});
	return data;
}

// pre-process to combine, sanitise and otherwise modify the raw data coming in from Google Spreadsheets
function preProcessFinalistData(d) {
	var location, medium;

	d['aspect-ratio'] = normaliseAspectRatio(d.width, d.height);
	d['canvas-size'] = normaliseSize(d.width, d.height);
	
	location = d.artistlocation.toLowerCase().split(', ');
	d['location-city'] = location[0];
	d['location-state'] = location[1];

	d['panels'] = d['width'].split(',').length + '';

	d['artist-age'] = d['artistage'];

	medium = d.medium.split(' on ');
	d.medium = medium[0];
	d.canvas = medium[1] || '';
	return d;
}

// Save the output
function save(object) {
	fs.writeFile(outputPath, JSON.stringify(object), function(err) {
		if (err) console.log(err);
		console.log("Output saved!");
	});
}