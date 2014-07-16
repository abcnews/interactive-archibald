var tabletop;

tabletop = require('tabletop');

module.exports = function(grunt) {

	require('news-deploy-project-grunt')(grunt);
	require('time-grunt')(grunt);
	require('load-grunt-config')(grunt);

	// grunt.registerTask('tabletop', 'Pull in some data from google spreadsheets.' function(){
	// 	var done;

	// 	done = this.async();

	// 	data = tabletop.init({

	// 	});

	// });

};
