var fs = require("fs");
var request = require("request");
 
exports = module.exports = {};
 
exports.scan = function(dir) {
   var results = [];
   var files = fs.readdirSync(dir);
   for (var i = 0; i < files.length; i++) {
     files[i]  = dir+"/"+files[i];
   };
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

exports.typeCheck = function(contract, data) {
    if (contract || data) {
        for (var key in contract) {
            if (typeof contract[key] == "object") {
                this.typeCheck(contract[key], data[key]);
            }
            if (typeof contract[key] != typeof data[key]) {
                throw "Contract expects that your service data contains '" + key + "' property, but could not find or types does not match! "
            }

        }
    }
};

exports.get = function(url, promise){
  request.get(url, promise);
};

exports.assertContracts = function(contractPaths){
  
  for (var i = contractPaths.length - 1; i >= 0; i--) {
    var contract = exports.readAsJson(contractPaths[i]);
    var serviceBaseUrl = contract.producer;
    
    for (var j = contract.expectations.length - 1; j >= 0; j--) {
        var expectation = contract.expectations[j];
        var serviceUrl = serviceBaseUrl + expectation.uri;
        console.log(serviceUrl);

        exports.get(serviceUrl, function(error, response, body){
          if (!error && response.statusCode == 200) {
             var serviceResponse = JSON.parse(body);
             var contractExpectation = expectation.expect.body;

             exports.typeCheck(contractExpectation, serviceResponse);
          }
        });
    };
  };
  console.log("SUCCESS");
}