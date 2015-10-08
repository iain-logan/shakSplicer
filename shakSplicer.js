var fs = require('graceful-fs');
var parseString = require('xml2js').parseString;
var xml2js = require('xml2js');

var sourcePath = process.argv[2],
    destinPath = process.argv[3],
    folderNo = 0,
    lock = false,
    builder = new xml2js.Builder({xmldec: { 'version': '1.0', 'encoding': 'ASCII', 'standalone': true}});

if (process.argv[2] === "--help" || process.argv[2] === undefined || process.argv[2] === null) {
    console.log("Usage: node shackSplicer.js sourcePath destinationPath\n");
    console.log("This program will parse all xml files found at path sourcePath");
    console.log("and then proceed to build up a directory represenation of the");
    console.log("xml hierarchy at the output path, creating a file for each tag.");
    process.exit(1);
}


var getNextNumber = function(callback){
    if(lock){
	setTimeout(function () { getNextNumber(callback) },5);
	return;
    }
    lock = true;
    folderNo++;
    callback(folderNo);
    lock = false;
}

try{
    var destPathStats = fs.statSync(destinPath);
    if(destPathStats.isFile()){
	console.log("Destination was a file\n");
	process.exit(1);
    }
    else{
	console.log("Directory already exists\n");
    }
}catch(err){
    fs.mkdirSync(destinPath);
    console.log("Directory doesn't exist so a new one has been made\n");
}



console.log('Splicing xml files from ' + sourcePath + ' to ' + destinPath + "...\n");
var files = fs.readdirSync(sourcePath).filter( function (file) {
        return file.indexOf('.xml', file.length - 4) !== -1;
    });

var parse = function (pathToFile) {
    fs.readFile(pathToFile, 'ascii', function (err, data) {
	parseString(data, function (err, result) {
	    splice(result, destinPath);
	});
    });
};

var splice = function (tag, destination){
    getNextNumber(function (nextNum) {
	var dest = destination + "/" + nextNum;
	if (typeof tag === 'object') {
	    var tags = Object.keys(tag).map(function (elm) {
	            return {name: elm, value: tag[elm]};
	        }),
		deapen = function (dest) {
		    tags.forEach(function(elem){
			if (Array.isArray(elem.value)) {
			    elem.value.forEach(function (elm) {
				var obj = {};
				obj[elem.name] = elm;
				splice(obj, dest);
			    });
			} else if (typeof elem.value === 'object'){
			    splice(elem.value, dest);
			}
		    });
		};

	    if (tags.length === 1 && !Array.isArray(tags[0].value)) {
		fs.mkdir(dest, function () {
		    getNextNumber(function (nextNum) {
			fs.writeFile(dest + "/" + nextNum + ".xml", builder.buildObject(tag), function(err) {
			    if (err !== null)
				console.log(err);
			    deapen(dest);
			});
		    });
		});
	    } else {
		deapen(destination);
	    }
	}
    });
};

console.log("Starting parsing and splicing of " + files.length + " file" + (files.length > 1 ? "s" : "") + "... this may take some time\n");

files.forEach(function (elm, index) {
    parse(sourcePath + elm);
    console.log("Started splicing " + elm + " [" + (index+1) + "/" + files.length + "]");
});
