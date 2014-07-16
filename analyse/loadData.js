/**
 * Just get the required data from google docs and store it in analyse/data
 */

var Tabletop, fs,
	googleDocsKey;

Tabletop = require('tabletop');
fs = require('fs');


googleDocsKey = '1p0GPaaAa6uFuSwUh2x6GMY2yYNPH3pWxYRpZuTP3i1c';

tabletop = Tabletop.init({
	key: googleDocsKey,
	callback: function (data, tabletop) {
		fs.writeFile('analyse/data/winners.json', JSON.stringify(tabletop.sheets('winners')), writeCallback);
		fs.writeFile('analyse/data/finalists.json', JSON.stringify(tabletop.sheets('finalists')), writeCallback);
	}
});

function writeCallback(err) {
	if (err) {
		console.log(err);
	}
}