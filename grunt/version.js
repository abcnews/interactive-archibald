module.exports = {
	"comments": {
		"options": {
			"prefix": "@version\\s*"
		},
		"src": ["build/scripts/**/*.js","build/styles/**/*.css"]
	},
	"archibald": {
		"options": {
			"prefix": "module.exports="
		},
		"src": ["src/scripts/version.js"]
	}
};
