
var w, h, 
	data, current,
	animationSpeed,
	container, svg, hue, palette;

function init(settings) {
	container = d3.select(settings.container);
	palette = container.append('div').attr('class', 'palette');
	palette.append('h4').text('Dominant colours');
	container.insert('h4', 'svg').text('Hues');
	svg = container.append('svg');
	hue = svg.append('g');
	
	setSize();

	animationSpeed = 1000;

	data = settings.data.sort(function(a,b){
		return a.year-b.year;
	});

	// Start with something
	current = data[0];

	// update chart frequently
	setInterval(cycleHueChart, animationSpeed);

	// change with the times
	d3.select(window).on('resize', setSize);
}

function setSize() {
	w = Math.min(700, parseInt(container.style('width'), 10));
	h = w;
	
	svg.attr('width', w).attr('height', h);
	hue.attr('transform', 'translate(' + [w/2,h/2] + ')')
}

function cycleHueChart() {

	// Re-arrange data
	data.push(current);
	current = data.shift();

	// Update the bars
	hue.selectAll('.bar').data(current.hueHistogram).call(updateHueChart);

	// update the year
	hue.selectAll('.year').data([current.year]).call(updateYear);

	// update the swatchs
	palette.selectAll('.swatch').data(current.palette).call(updateSwatches);
}

function updateYear(s) {
	function enter(s) {
		var g;
		g = s.append('g').attr('class', 'year');
		g.append('circle')
			.attr('r', '30')
			.attr('fill', '#ccc');
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
		.range([30, Math.max(w,h)/2])
		.domain([0.001,Math.max.apply(null, current.hueHistogram)]);
		// .base(2);

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
		var bar;

		bar = s.append('g');
		bar.append('path')
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

module.exports = init;