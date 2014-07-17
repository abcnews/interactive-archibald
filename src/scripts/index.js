/*!
 * news-interactive-archibald
 *
 * @version development
 * @author Simon Elvery <elvery.simon@abc.net.au>
 */

var archibald, // namespace
	$sections, $finalists,
	domready, sectionify, ns, waypoints, hues; // dependencies
	

// requirements
sectionify = require('news-interactive-util-sectionify-article');
domready = require('domready');
ns = require('simple-namespace');
waypoints = require('./waypoints');
hues = require('./hues');
require('./raf');

archibald = {
	version: require('./version')
};

archibald.init = function(config) {
	this.config = config;
	domready(init);
};

// Export
ns('ABC.News.interactive', window).archibald = archibald;

// DOM is ready
function init() {

	var $container;

	// Attach waypoints to jquery
	waypoints($, window);

	// Sort out all the markup
	$sections = $(sectionify());
	$sections.addClass('archibald-section');
	$container = $('<div class="archibald-container">')
		.insertBefore($sections.first());

	$sections.appendTo($container);
	$finalists = $('<div class="archibald-finalists-container"><h3>Similarity to previous winners</h3><h4>2014 finalists</h4><div class="archibald-finalists"></div></div>').appendTo($container);
	$sections.first().addClass('current');

	// Fetch the data before we go any further
	$.getJSON(archibald.config.assets + '/data/all.json', dataFetched);
}

function changeSection(direction) {
	var $prev;
	$sections.removeClass('current');
	// This works more reliably than $.waypoints('before');
	if (direction === 'down') {
		archibald.seen.push($(this).attr('id'));
		$(this).addClass('current');
	} else {
		archibald.seen.pop();
		$prev = $(this).prev('.archibald-section');
		if ($prev.length) {
			$prev.addClass('current');
		} else {
			$sections.first().addClass('current');
		}
		
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
	var aVal, bVal, predictors;
	predictors = archibald.currentPredictors;
	aVal = getFinalistScore(a, predictors);
	bVal = getFinalistScore(b, predictors);
	return bVal-aVal;
}

function getFinalistScore(finalist, predictors) {
	
	var i, score = 0;
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

	var $header, images, $footer, finalists, allPredictors;

	// Header stuff
	$header = $('.archibald-header');
	images = [];

	// Add heading images
	_.each(data.finalists, function(d){
		var $img, $link;
		$img = $('<img>');
		$img.attr('alt', d.title + ' by ' + d.artist);
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

		// $link = $('<a>')
		// 	.attr('href', '/news/date/title/' + d.cmid)
		// 	.attr('title', d.title + ' by ' + d.artist)
		// 	.append($img);
		images.push($img);
	});
	$header.append(images);
	if ($('body').hasClass('platform-mobile')) {
		$header.appendTo($('article>header').first());
	} else {
		$header.prependTo('.article.section h1:first-child + .inline-content.wysiwyg.full');
	}
	

	// footer stuff
	$footer = $('<div class="archibald-footer">').insertAfter($sections.last().find('p').first());
	
	allPredictors = [];
	for(var key in data['section-predictors']) {
		allPredictors = allPredictors.concat(data['section-predictors'][key]);
	}
	finalists = data.finalists.slice(0);
	_.forEach(finalists, function(f){
		f.totalScore = getFinalistScore(f, allPredictors);
	});
	finalists.sort(function(a,b){
		return b.totalScore - a.totalScore;
	});
	
	finalists = finalists.slice(0, 10);
	
	_.forEach(finalists, function(f, i) {
		var markup;
		markup = '<div>';
		markup += '<a href="/news/date/title/' + f.cmid + '">';
		markup += '<img src="'+archibald.config.assets + '/images/finalists/' + f.image + '"">';
		markup += '</a>';
		markup += '<h4>' + f.artist + '</h4>';
		markup += '<p>' + f.title + '</p>';
		markup += '<span class="rank">' + (i+1) + '</span>';
		markup += '</div>';
		$footer.append(markup);
	});


	// d3 (i.e. capable browsers only) stuff
	if (window.d3) {
		archibald.data = data;
		archibald.finalists = d3.select('.archibald-finalists').selectAll('.finalist')
			.data(data.finalists, function(d){
				return d.image;
			});
		archibald.finalists.call(updateFinalists);
		updateFinalistsPanel();

		// Initialise the colour panel
		hues.init({
			section: $('#colour').get(0),
			container: $('<div class="archibald-colours">').appendTo('#colour').get(0),
			data: archibald.data.winners
		});
	} else {
		$('body').addClass('no-d3');
	}

	$('window').trigger('resize');

	// fix finalists on scroll
	// setTimeout is so a page refresh with browser scrolled down has a chance
	// to move the page before waypoints is activated.
	setTimeout(function() {

		// Setup section waypoints
		archibald.seen = [];
		$sections.waypoint(changeSection, {
			offset: function() {
				return Math.min($finalists.height()/2, $(window).height()/3);
			}
		});

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
					top: $sections.last().position().top + 30,
					right: 0
				});
			} else {
				$finalists.css({
					position: "",
					top: "",
					right: ""
				});
			}
		}, {
			offset: 0
		});
	}, 1000);
		
}

function updateFinalists(s) {

	var $node, $container, size, columns;

	function enter(s) {
		var div;
		div = s.append('a')
			.attr('title', function(d){
				return d.title + ' by ' + d.artist;
			})
			.attr('href', function(d){
				return '/news/date/title/' + d.cmid;
			});
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
	
	$container.height(
		Math.min(
			Math.ceil(archibald.data.finalists.length/columns) * $node.outerHeight(),
			Math.floor($('#conclusion').height()/$node.height()) * $node.height()
		)
	);

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