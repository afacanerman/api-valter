var fs = require("fs");
 
exports = module.exports = {};
 
exports.scan = function(dir) {

   var results = [];
   var files = fs.readdirSync(dir);
   return files; 
};

exports.match = function(query, files){
	var matches = [];
	files.forEach(function(name) {
		if (name.indexOf(query) !== -1) {
		  matches.push(name);
		}
	});
	return matches;
};

exports.readAsJson = function(path){
	if(!path) { throw path + " argumant is mandatory!";}

	return JSON.parse(fs.readFileSync(path, 'utf8'));
};