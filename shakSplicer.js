var fs = require('fs');
var parseString = require('xml2js').parseString;
var xml2js = require('xml2js');


var sourcePath = process.argv[2],
    destinPath = process.argv[3],
    folderNo = 0,
    lock = false,
    builder = new xml2js.Builder();

var getNextNumber = function(){
    if(lock){
	setTimeOut(getNextNumber,5);
	return;
    }
    lock = true;
    folderNo++;
    lock = false;
    return folderNo;
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
	parseString(data, function (err, result) {
	    splice(result, destinPath);
	});
    });
};

parse(sourcePath + files[0]);

var splice = function (tag, destination){
    var dest = destination + "/" + getNextNumber();
    this.tags = Object.keys(tag);
    this.tag = tag;
    
    fs.mkdirSync(dest);
    fs.writeFile(dest + "/" + getNextNumber() + ".xml", builder.buildObject(tag), function(err){
                              console.log(this);
			     this.tags.forEach(function(elem){
				 splice(tag[elem], dest)
			     });
			 }.bind(this));
};
