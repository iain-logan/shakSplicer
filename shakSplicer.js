var fs = require('fs');
var parseString = require('xml2js').parseString;

var sourcePath = process.argv[2],
    destinPath = process.argv[3];

var destPathStats = fs.statSync(destinPath);

if(! destPathStats.isFile() && !destPathStats.isDirectory()){
    fs.mkdirSync(destinPath);
}else if(destPathStats.isFile()){
console.log("Destination was a file");
process.exit(1);
}
else{
    console.log("Directory already exists");
}


console.log('splicing xml files from ' + sourcePath + ' to ' + destinPath);
var files = fs.readirSync(sourcePath);

console.log(files.filter( function (file) {
    return file.indexOf('.xml', file.length - 4) !== -1;
}));

var parse = function (pathToFile) {
    fs.readFile(pathToFile, 'ascii', function (err, data) {
	parseString(data, function (err, result) {
	    splice(result, destinPath);
	});
    });
};

parse(sourcePath + files[0]);

var splice = function (tag, destination){
   
    
}
