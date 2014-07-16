module.exports = {
	"options": {
		"transform": ["brfs"]
	},
	"dev": {
		"options": {
			"debug": true
		},
		"files": {
			"build/scripts/index.js": ["src/scripts/index.js"],
			"build/scripts/color.js": ["src/scripts/color.js"]
		}
	},
	"prod": {
		"files": {
			"build/scripts/index.js": ["src/scripts/index.js"]
		}
	}
};
