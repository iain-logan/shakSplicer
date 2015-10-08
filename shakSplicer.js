var fs = require('graceful-fs');
var parseString = require('xml2js').parseString;
var xml2js = require('xml2js');

var sourcePath = process.argv[2],
    destinPath = process.argv[3],
    folderNo = 0,
    lock = false,
    builder = new xml2js.Builder({xmldec: { 'version': '1.0', 'encoding': 'ASCII', 'standalone': true}});

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
	console.log("Destination was a file");
	process.exit(1);
    }
    else{
	console.log("Directory already exists");
    }
}catch(err){
    fs.mkdirSync(destinPath);
    console.log("Directory doesn't exist so a new one has been made");
}



console.log('splicing xml files from ' + sourcePath + ' to ' + destinPath);
var files = fs.readdirSync(sourcePath);

console.log(files.filter( function (file) {
    return file.indexOf('.xml', file.length - 4) !== -1;
}));

var parse = function (pathToFile) {
    fs.readFile(pathToFile, 'ascii', function (err, data) {
	console.log(err);
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

files.forEach(function (elm) {
    parse(sourcePath + elm);
});
