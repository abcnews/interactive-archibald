module.exports = {
	options: {
		livereload: true
	},
	"gruntfile": {
		"files": ["Gruntfile.js","grunt/*.js"],
		"tasks": ["jshint:gruntfile"],
		"interrupt": true
	},
	"js": {
		"files": "src/scripts/**/*",
		"tasks": ["jshint:js", "browserify:dev"],
		"interrupt": true
	},
	"css": {
		"files": "src/styles/**/*.scss",
		"tasks": "compass:dev",
		"interrupt": true
	},
	"copy": {
		"files": ["src/**/*", "!src/scripts/*", "!src/styles/*", "!src/data/*"],
		"tasks": "copy:static",
		"interrupt": true
	},
	"data": {
		"files": ["src/data/**/*"],
		"tasks": "dir2json:all",
		"interrupt": true
	},
	"version": {
		"files": ["package.json"],
		"tasks": "version",
		"interrupt": true
	}
};
