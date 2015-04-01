'use strict';

var fs = require("fs");
var request = require("request");

 
exports = module.exports = {};
exports.keepAlive = true;
exports.hasError = false;
exports.contractPathList = [];

exports.scan = function(dir) {
  var results = [];

  if(!fs.existsSync(dir)){
    errorOccured("{0} does not exists!", dir);
    exports.keepAlive = false;
    return results;
  }

   var files = fs.readdirSync(dir);
   for (var i = 0; i < files.length; i++) {
      if(files[i].indexOf('.contract') > -1){
        console.log(dir+"\\"+files[i]);
         results.push(dir+"\\"+files[i]);
      }
   };

   console.log("Found contracts:");
   console.log(results.join('\n') + "\n");
   return results; 
};

exports.readAsJson = function(path){
	if(!path) { throw path + " argumant is mandatory!";}

	return JSON.parse(fs.readFileSync(path, 'utf8'));
};

exports.typeCheck = function(contract, data) {
    if (contract || data) {
        for (var key in contract) {

            if( Object.prototype.toString.call( contract[key] ) === '[object Array]' ) {
                if(data[key].length > 0) {
                    
                    if(data[key][0] === undefined){
                      errorOccured("STATUS : Contract expects that your service data contains '" + key + "' array property as "+ typeof contract[key] +", but found Undefined !\n");
                      return false;
                    }
                    if(JSON.stringify(contract[key][0]) != JSON.stringify(data[key][0])){
                      errorOccured("STATUS : Contract expects that your service data contains '" + key + "' array property as "+ typeof contract[key][0] + ", but found "+ typeof data[key][0] +"!\n");
                      return false;
                    }
                };
                continue;
            }
          
            if (typeof contract[key] == "object") {
                for(var property in contract[key]){ 
                  if(contract.hasOwnProperty(key)){

                    if(JSON.stringify(contract[key][property]) != JSON.stringify(data[key][property])){
                      errorOccured("STATUS : Contract expects that your service data contains '" + key + "' objects property as " + typeof contract[key] +", but found "+ typeof data[key] +"!\n");
                      return false;
                    }
                  }
                }
            }


            if(!data.hasOwnProperty(key)){
                errorOccured("STATUS : Contract expects that your service data contains '" + key + "' property as "+ typeof contract[key] +", but found Undefined !\n");
                return false;
            }

            if (JSON.stringify(contract[key]) != JSON.stringify(data[key])) {
                errorOccured("STATUS : Contract expects that your service data contains '" + key + "' property as "+ typeof contract[key] +", but found "+ typeof data[key] +"!\n");
                return false;
            }
            
        }
        return true;
    }
    
    errorOccured("STATUS : contract or data undefined!\n");
    return false;
};



var errorOccured = function(message){
    console.log(message);
    exports.hasError = true;
}

exports.get = function(url, promise){
  request({
    method: 'GET',
    uri: url,
    timeout: 15000
  },promise);
};


exports.checkContract = function(){
  if(exports.contractPathList.length === 0){
    errorOccured("STATUS : This path has not got any contract!");
    exports.keepAlive = false;
    return;
  }

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


exports.checkAlive = function(){
  if(!exports.keepAlive){
    if(!exports.hasError){
      console.log("FINISHED WITH SUCCESS");
      return 0;
    } else{
      console.log("FINISHED WITH ERRORS");
      process.exit(1);
      return 1;
    }
  }
};