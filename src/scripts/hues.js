
var w, h, 
	data, current,
	animationSpeed,
	cycleTimer,
	Slider,
	yearsMap,
	yearsSlider,
	container, svg, hue, palette;

Slider = require('news-interactive-component-ordinal-range-slider');

function init(settings) {
	
	var i, years;

	container = d3.select(settings.container);
	svg = container.append('svg');
	palette = container.append('div').attr('class', 'palette');
	palette.append('h4').text('Dominant palette');
	hue = svg.append('g');
	insertFilter(svg);
	setSize();

	yearsMap = {};
	for (i=settings.data.length; i--;) {
		yearsMap[settings.data[i].year] = settings.data[i];
	}

	years = settings.data.map(function(d){
		return d.year;
	}).sort();

	$yearsSliderEl = $('<div></div>').appendTo(settings.container);
	yearsSlider = new Slider($yearsSliderEl.get(0), years, function (year) {
		displayYear(yearsMap[year]);
	});

	$yearsSliderEl.on('mousedown keydown', pauseAnimation);

	$('.OrdinalRangeSlider-handle').on('mouseenter', pauseAnimation);

	animationSpeed = 1000;

	data = settings.data.sort(function(a,b){
		return a.year-b.year;
	});

	// Start with something
	current = 0;

	cycleHueChart();

	$.waypoints('refresh');

	// change with the times
	d3.select(window).on('resize', setSize);
}

function pauseAnimation(){
	clearTimeout(cycleTimer);
	cycleTimer = setTimeout(cycleHueChart, 10000);
}

function insertFilter(svg) {
	var filter, merge;
	filter = svg.insert('filter')
		.attr('id', 'dropshadow')
		.attr('height', '130%');

	filter.append('feGaussianBlur')
		.attr('in', 'SourceAlpha')
		.attr('stdDeviation', '3');
	filter.append('feOffset')
		.attr('dx', '0')
		.attr('dy', '0')
		.attr('result', 'offsetblur');

	merge = filter.append('feMerge');

	merge.append('feMergeNode');
	merge.append('feMergeNode')
		.attr('in', 'SourceGraphic');
}

function setSize() {
	w = Math.min(700, parseInt(container.style('width'), 10));
	h = w;
	
	svg.attr('width', w).attr('height', h);
	hue.attr('transform', 'translate(' + [w/2,h/2] + ')')
}

function startHueChartCycle() {
	// update chart frequently
	cycleTimer = setTimeout(cycleHueChart, animationSpeed);
}

function cycleHueChart() {

	// Re-arrange data
	current++;
	if (current >= data.length) {
		current = 0;
	}

	yearsSlider.setCategory(data[current].year);

	requestAnimationFrame(function(){
		cycleTimer = setTimeout(cycleHueChart, animationSpeed);
	});
}

function displayYear(dataYear) {

	current = data.indexOf(dataYear);

	// Update the bars
	hue.selectAll('.bar').data(dataYear.hueHistogram).call(updateHueChart);

	// update the year
	hue.selectAll('.year').data([dataYear.year]).call(updateYear);

	// update the swatchs
	palette.selectAll('.swatch').data(dataYear.palette).call(updateSwatches);

}

function updateYear(s) {
	function enter(s) {
		var g;
		g = s.append('g').attr('class', 'year');
		g.append('circle')
			.attr('r', '30')
			.style('filter', 'url(#dropshadow)')
			.attr('fill', '#fff');
		g.append('text')
			.attr('text-anchor', 'middle')
			.attr('alignment-baseline', 'middle');
	}

	s.enter().call(enter);
	setTimeout(function(){
		s.select('text').text(function(d){return d;});
	}, animationSpeed/2);
	
}

function updateSwatches(s) {
	function enter(s) {
		s.append('div')
			.attr('class', 'swatch');
	}

	s.enter().call(enter);

	s.transition().duration(animationSpeed)
		.style('background-color', function(d) {
			return d3.rgb(d[0],d[1],d[2]);
		});
}


function updateHueChart(s) {

	var arcGenerator, maxRadius, hueScale;

	hueScale = d3.scale.linear()
		.clamp(true)
		.range([30, Math.max(w,h)/2-30])
		.domain([0.001,Math.max.apply(null, data[current].hueHistogram)]);

	arcGenerator = d3.svg.arc()
		.innerRadius(function() {
			return hueScale(0.001);
		})
		.outerRadius(function(d) {
			return hueScale(d);
		})
		.startAngle(function(d, i){
			return torad(i);
		})
		.endAngle(function(d, i){
			return torad(i+1);
		});

	function torad(deg) {
		return deg*Math.PI/180;
	}	

	function enter(s) {
		s.append('path')
			.attr('class', 'bar')
			.attr('d', arcGenerator)
			.style('fill', function(d, i) {
				return d3.hsl(i, 0.5, 0.5);
			});
	}
	s.enter().call(enter);

	// Update bar if data has changed
	s.transition().duration(animationSpeed)
		.attr('d', arcGenerator);
}

module.exports = {
	init: init,
	pause: pauseAnimation,
	play: cycleHueChart
};