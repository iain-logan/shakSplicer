var fs = require('fs');
var parseString = require('xml2js').parseString;

var sourcePath = process.argv[2],
    destinPath = process.argv[3];

console.log('splicing xml files from ' + sourcePath + ' to ' + destinPath);

var files = fs.readdirSync(sourcePath);

console.log(files.filter( function (file) {
    return file.indexOf('.xml', file.length - 4) !== -1;
}));

var parse = function (pathToFile) {
    fs.readFile(pathToFile, 'ascii', function (err, data) {
	parseString(data, function (err, result) {
	    console.log(result);
	});
    });
};

parse(sourcePath + files[0]);
