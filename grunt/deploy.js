module.exports = {
	contentftp: {
		credentials: ".abc-credentials",
		target: "/www/res/sites/news-projects/news-interactive-archibald/",
		files: [{
			expand: true,
			cwd: 'build/',
			src: ["**/*"]
		}]
	}
};