/*!
 * news-interactive-archibald
 *
 * @version development
 * @author Simon Elvery <elvery.simon@abc.net.au>
 */

var container,
	h, w,
	x, y, hueScale;

h = 100;
w = 100;

x = d3.scale.ordinal()
    .rangeRoundBands([0, w], 0);

y = d3.scale.pow()
    .range([0, h]);

hueScale = d3.scale.linear()
	.clamp(true)
	.range([5, Math.max(w,h)/2])
	.domain([0.001,1]);
	// .base(2);

function updateContainers(s) {
	function enter(s) {
		var container, hue, sat;
		
		container = s.append('div')
			.attr('class', 'image-container');

		container.append('img')
			.attr('src', function(d){
				return '/images/winners-small/' + d.file;
			})
			.style({
				width: w + 'px',
				height: 'auto'
			});

		// Palette
		palette = container.append('div')
			.attr('class', 'palette');
		palette.selectAll('.swatch').data(function(d){
			console.log(d);
			return d.palette;
		}).call(updatePalette);

		// Hue
		hue = container.append('svg')
			.attr('class', 'hue')
			.style({
				width: w,
				height: h
			});
		hue.selectAll('.bar').data(function(d){
				return d.hueHistogram;
			}).call(updateHueChart);

		// var arcGenerator = d3.svg.arc()
		// 	.innerRadius(function(){
		// 		return 0;
		// 	})
		// 	.outerRadius(function(){
		// 		return w/3;
		// 	})
		// 	.startAngle(function(d){
		// 		console.log(d);
		// 		return d.moments[0][0];
		// 	})
		// 	.endAngle(function(d){
		// 		return d.moments[0][0];
		// 	});
		// hue.append('path')
		// 	.attr('d', arcGenerator)
		// 	.attr('transform', 'translate(' + [w/2,h/2] + ')')
		// 	.style('fill', '#f00')
		// 	.attr('stroke', '#f00')
		// 	.attr('stroke-weight', '1');
		// hue.append('line')
		// 	.attr('x1', w/2)
		// 	.attr('y1', h/2)
		// 	.attr('x2', function(d) {
		// 		return w/3*Math.cos(d.moments[0][0]);
		// 	})
		// 	.attr('y2', function(d) {
		// 		return w/3*Math.sin(d.moments[0][0]);
		// 	})
		// 	.attr('stroke', '#f00')
		// 	.attr('stroke-weight', '1');

		// Saturation
		// sat = container.append('svg')
		// 	.attr('class', 'saturation')
		// 	.style({
		// 		width: w,
		// 		height: h
		// 	});
		// sat.selectAll('.bar').data(function(d){
		// 		return d.histograms[1];
		// 	}).call(updateBarChart);
		// sat.append('line')
		// 	.attr('stroke', '#f00')
		// 	.attr('stroke-weight', 1)
		// 	.attr('x1', 0)
		// 	.attr('x2', w)
		// 	.attr('y1', y(0.8))
		// 	.attr('y2', y(0.8));

		// // Brightness
		// vib = container.append('svg')
		// 	.attr('class', 'brightness')
		// 	.style({
		// 		width: w,
		// 		height: h
		// 	});
		// vib.selectAll('.bar').data(function(d){
		// 		return d.histograms[2];
		// 	}).call(updateBarChart);
		// vib.append('line')
		// 	.attr('stroke', '#f00')
		// 	.attr('stroke-weight', 1)
		// 	.attr('x1', 0)
		// 	.attr('x2', w)
		// 	.attr('y1', y(0.8))
		// 	.attr('y2', y(0.8));
	}

	s.enter().call(enter);
}

function updateHueChart(s) {

	var arcGenerator;

	function torad(deg) {
		return deg*Math.PI/180;
	}

	arcGenerator = d3.svg.arc()
		.innerRadius(function() {
			return hueScale(0);
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

	function enter(s) {
		var bar;

		bar = s.append('g');
		bar.append('path')
			.attr('d', arcGenerator)
			.attr('transform', 'translate(' + [w/2,h/2] + ')')
			.style('fill', function(d, i) {
				return d3.hsl(i, 0.5, 0.5);
			});
	}

	s.enter().call(enter);
}

function updatePalette(s) {
	function enter(s) {
		s.append('div')
			.attr('class', 'swatch')
			.style('background-color', function(d){
				return 'rgb('+d+')';
			});
	}

	s.enter().call(enter);
}

function updateBarChart(s) {
	function enter(s) {
		var bar;
	
		bar = s.append('g');
		bar.append('rect')
			.attr("x", function(d, i) { return x(i); })
			.attr("y", function(d) {
				return h-y(d);
			})
			.attr("height", function(d) { return y(d); })
			.attr("width", x.rangeBand())
			.attr('fill', function() {
				return '#000';
			});
	}

	s.enter().call(enter);
}

d3.json('/data/all.json', function(err, data) {
	var i, j;

	function normalise(vector) {
		var max, i;
		max = Math.max.apply(null, vector);
		for (i=vector.length;i--;){
			vector[i] = vector[i]/max;
		}
		return vector;
	}

	var images = data.winners;

	// coerce and normalise data
	for(i=images.length;i--;) {

		// normalize histogram
		for (j=images[i].hueHistogram.length; j--;) {
			images[i].hueHistogram = normalise(images[i].hueHistogram);
		}

		// get associated palette
		var palette = data.clusters.winners.filter(function(d){
			return d.file === images[i].file
		});
		images[i].palette = (palette[0]) ? palette[0].palette : [];
	}

	x.domain(images[0].hueHistogram.map(function(d, i){return i;}));
	y.domain([0, 1]);

	container = d3.select('body').append('div');

	var aggregate = container.append('div')
		.attr('class', 'aggregate');
	aggregate.selectAll('.swatch').data(data.clusters.agregate).call(updatePalette);
	// aggregate.append('svg').attr('class', 'histogram')

	container.selectAll('.image-container').data(images).call(updateContainers);

});
