// Generate and output a json file with prediction data for all finalists based
// on previous winners.

// vars
var outputPath, 
	fs, Stats, Tabletop, request, async, // dependencies
	stats, finalists,
	output,
	tabletop,
	googleDocsKey,
	predictors;

// requirements
Stats = require('./stats');
Tabletop = require('tabletop');
fs = require('fs');
request = require('request');
async = require('async');

// settings
outputPath = 'src/data/finalists.json';
googleDocsKey = '1p0GPaaAa6uFuSwUh2x6GMY2yYNPH3pWxYRpZuTP3i1c';

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
}];

output = [];

module.exports = function(cb) {
	console.log('Running predictors.js');

	tabletop = Tabletop.init({
		key: googleDocsKey,
		callback: function (data, tabletop) {
			stats = new Stats(preProcessWinnersData(tabletop.sheets("winners").all()));
			finalists = preProcessFinalistsData(tabletop.sheets('finalists').all());
			finalists.forEach(processFinalists);
			
			cb(output);
		}
	});
}
	

function getImages(data) {
	async.eachLimit(data, 5, function(image, cb) {
		request('http://www.artgallery.nsw.gov.au/media/prize_images/'+image.image, cb)
			.pipe(fs.createWriteStream('analyse/finalists/'+image.image));
	}, function(err){
		console.log('Downloaded images.');
	});
}

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
	predictors.forEach(caclulateFactors);
	output.push(result);

	function caclulateFactors(predictor) {
		var field, weight;
		if (predictor.method && typeof stats[predictor.method] === 'function') {
			field = predictor.field || predictor.id;
			weight = predictor.weight || 1;
			result.predictorValues[predictor.id] = finalist[field];
			result.predictors[predictor.id] = weight * stats[predictor.method](field, finalist[field]);
		}
	}
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
		
		medium = d.medium.split(' on ');
		d.medium = medium[0];
		d.canvas = medium[1] || '';
	});
	return data;
}

// pre-process to combine, sanitise and otherwise modify the raw data coming in from Google Spreadsheets
function preProcessFinalistsData(data) {
	data.forEach(function(d){
		var location, medium;

		d['aspect-ratio'] = normaliseAspectRatio(d.width, d.height);
		d['canvas-size'] = normaliseSize(d.width, d.height);
		
		location = d.artistlocation.toLowerCase().split(', ');
		d['location-city'] = location[0];
		d['location-state'] = location[1];

		d['panels'] = d['width'].split(',').length + '';

		medium = d.medium.split(' on ');
		d.medium = medium[0];
		d.canvas = medium[1] || '';
	});
	return data;
}

// Save the output
function save(object) {
	fs.writeFile(outputPath, JSON.stringify(object), function(err) {
		if (err) console.log(err);
		console.log("Output saved!");
	});
}