module.exports = {
	"static": {
		"files": [{
			"expand": true,
			"cwd": "src/",
			"src": ["**/*", "!scripts/*", "!styles/*", "!data/*"],
			"dest": "build/"
		}]
	}
};
