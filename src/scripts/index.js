/*!
 * news-interactive-archibald
 *
 * @version development
 * @author Simon Elvery <elvery.simon@abc.net.au>
 */

var archibald, // namespace
	$sections,
	slider, domready, sectionify, ns, waypoints; // dependencies
	

// requirements
sectionify = require('news-interactive-util-sectionify-article');
domready = require('domready');
ns = require('simple-namespace');
waypoints = require('./waypoints');
hues = require('./hues');
require('./raf');
slider = require('news-interactive-component-ordinal-range-slider');

archibald = {
	version: require('./version')
};

archibald.init = function(config) {
	this.config = config;
	domready(init);
}

// Export
ns('ABC.News.interactive', window).archibald = archibald;

// DOM is ready
function init() {

	var $container, $finalists, seen;

	// Attach waypoints to jquery
	waypoints($, window);

	// Sort out all the markup
	$sections = $(sectionify());
	$sections.addClass('archibald-section');
	$container = $('<div class="archibald-container">')
		.insertBefore($sections.first());

	$finalists = $('<div class="archibald-finalists-container"><h3>Similarity to previous winners</h3><h4>2014 finalists</h4><div class="archibald-finalists"></div></div>').appendTo($container);
	$sections.appendTo($container);

	// Setup section waypoints
	archibald.seen = [];
	$sections.waypoint(changeSection, {
		offset: function() {
			return Math.min($finalists.height()/2, $(window).height()/3);
		}
	});

	// fix finalists on scroll
	// setTimeout is so a page refresh with browser scrolled down has a chance
	// to move the page before waypoints is activated.
	setTimeout(function() {
		$sections.first().waypoint(function(d){
			if (d === 'down') {
				$finalists.addClass('fixed');
			} else {
				$finalists.removeClass('fixed');
			}
		}, {
			offset: -10
		});
		$sections.last().waypoint(function(d){
			if (d === 'down') {
				$finalists.css({
					position: 'absolute',
					top: $sections.last().position().top + 30
				});
			} else {
				$finalists.css({
					position: "",
					top: ""
				});
			}
		}, {
			offset: 0
		});
	}, 1000);

	// Fetch the data before we go any further
	$.getJSON(archibald.config.assets + '/data/all.json', dataFetched);
}

function changeSection(direction) {
	$sections.removeClass('current');
	// This works more reliably than $.waypoints('before');
	if (direction === 'down') {
		archibald.seen.push($(this).attr('id'));
		$(this).addClass('current');
	} else {
		archibald.seen.pop();
		$(this).prev('.archibald-section').addClass('current');
	}
	updateFinalistsPanel();
}

function updateFinalistsPanel() {
	if (archibald.data && archibald.finalists) {
		archibald.currentPredictors = getPredictors(archibald.seen);
		archibald.finalists.data(archibald.data.finalists).call(updateFinalists);
	}
}

function sortFinalists(a,b) {
	var i, aVal, bVal, predictors;
	predictors = archibald.currentPredictors;
	aVal = getFinalistScore(a, predictors);
	bVal = getFinalistScore(b, predictors);
	return bVal-aVal;
}

function getFinalistScore(finalist, predictors) {
	
	var score = 0;
	if (!predictors) {
		return score;
	}
	for (i=predictors.length; i--;) {
		score += finalist.predictors[predictors[i]];
	}
	return score;
}

function getPredictors(sections) {
	
	var result = _.reduce(sections, function(r,d){
		var predictor = archibald.data['section-predictors'][d];
		if (predictor) {
			r = r.concat(predictor);
		}
		return r;
	}, []);
	
	return result;
}

function dataFetched(data) {

	var $header, images;

	$header = $('.archibald-header');
	images = [];

	// Add heading images
	_.each(data.finalists, function(d){
		var $img;
		$img = $('<img>');
		$img.css({
				opacity: 0
			})
			.on('load', function(){
				var $this = $(this);
				setTimeout(function(){
					$this.fadeTo(300, 1);
				}, 2000*Math.random());
			})
			.attr('src', archibald.config.assets + '/images/finalists/' + d.image);
		images.push($img);
	});
	$header.append(images);

	if (window.d3) {
		archibald.data = data;
		archibald.finalists = d3.select('.archibald-finalists').selectAll('.finalist')
			.data(data.finalists, function(d){
				return d.image;
			});
		archibald.finalists.call(updateFinalists);
		updateFinalistsPanel();

		// Initialise the colour panel
		hues({
			container: $('#colour').get(0),
			data: archibald.data.winners
		});
	} else {
		$('body').addClass('no-d3');
	}
		
}

function updateFinalists(s) {

	var $node, $container, size, columns;

	function enter(s) {
		div = s.append('div');
		div.append('img').attr('src', function(d){
			return archibald.config.assets + '/images/finalists/' + d.image;
		});
	}
	
	s.enter().call(enter);

	s.sort(sortFinalists);
	
	$node = $(s.node());
	$container = $node.parent();
	columns = ($('body').hasClass('platform-standard')) ? 5 : 1;
	size = $container.width()/columns;
	$container.height(Math.ceil(archibald.data.finalists.length/columns) * $node.outerHeight());

	// size
	s.style('width', size+'px');
	s.style('height', size+'px');

	// position
	s.style('top', function(d, i){
		return Math.floor(i/columns) * size + 'px';
	});
	s.style('left', function(d, i){
		return (i%columns * size + $container.innerWidth() - $container.width()) + 'px';
	});
	s.style('opacity', function(d, i){
		return 0.3 + 0.7 * (1-i/archibald.data.finalists.length);
	});

}