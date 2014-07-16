var Atoll;

Atoll = require('atoll');

function Stats(winners) {
	if ( !(this instanceof Stats) ) {
		return new Stats(winners);
	}
	this.winners = winners;
	this.cache = [];
}

Stats.prototype.mean = function(field) {
	var key = 'mean'+field;
	if ( ! this.cache[key] ) {
		this.cache[key] = this.atoll(field).mean();
	}
	return this.cache[key]; 
}

Stats.prototype.sd = function(field) {
	var key = 'mean'+field;
	if ( ! this.cache[key] ) {
		this.cache[key] = this.atoll(field).stdDev();
	}
	return this.cache[key]; 
}

Stats.prototype.atoll = function(field) {
	var key = 'atoll'+field;
	if (!this.cache[key]) {
		this.cache[key] = Atoll(this.winners.map(function(d){
			return +d[field];
		}).filter(function(d){
			return d;
		}));
	}
	return this.cache[key];
}

Stats.prototype.percentage = function(field, value) {
	var count, incidence;
	count = this.winners.length;
	incidence = this.winners.filter(function(d){
		return d[field].toLowerCase() === value.toLowerCase();
	}).length;
	return incidence/count;
};

Stats.prototype.meandistance = function(field, value) {
	var mean, sd;

	mean = this.mean(field);
	sd = this.sd(field);

	if (+value === 0) {
		return mean;
	}
	
	return 1/(Math.abs(value-mean)/sd+1);
}

Stats.prototype.quartiles = function(field, value) {
	var atoll;


}

module.exports = Stats;