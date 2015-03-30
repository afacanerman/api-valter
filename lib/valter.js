var fs = require("fs");
var request = require("request");
 
exports = module.exports = {};
exports.keepAlive = true;
exports.hasError = false;
exports.contractPathList = [];

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
                console.log("STATUS : Contract expects that your service data contains '" + key + "' property as "+ typeof contract[key] +", but found "+ typeof data[key] +"!\n");
                exports.hasError = true;
                return false;
            }

        }
        return true;
    }
};

exports.get = function(url, promise){
  request.get(url, promise);
};


exports.checkContract = function(){

  var contract = exports.readAsJson(exports.contractPathList.pop());
  var serviceUrl = contract.producer + contract.uri;
  console.log(serviceUrl);

  exports.get(serviceUrl, function(error, response, body){

      if (!error && response.statusCode == 200) {
         var serviceResponse = JSON.parse(body);
         var contractExpectation = contract.expect.body;

         if(exports.typeCheck(contractExpectation, serviceResponse)){
            console.log("STATUS: OK\n");
         }
      }
      

      if(exports.contractPathList.length > 0){
          exports.checkContract();
      }
      else{
        exports.keepAlive = false;
      }
  });
}


var checkAlive = function(){
  if(!exports.keepAlive){
    if(!exports.hasError){
      console.log("FINISHED WITH SUCCESS");
      process.exit(0);
    }else{
      console.log("FINISHED WITH ERRORS");
      process.exit(1);
    }
  }
};

exports.init = function(){
  setTimeout(function () {  
    checkAlive();
  }, 500);
}