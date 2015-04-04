var fs = require("fs");
var request = require("request");

var Valter = (function () {
    'use strict';

    function Valter () {
    }

    Valter.keepAlive = true;
    Valter.hasError = false;
    Valter.contractPathList = [];

    Valter.prototype.scan = function(dir) {
        var results = [];

        if (!fs.existsSync(dir)) {
            errorOccured(dir, " does not exists!");
            Valter.keepAlive = false;
            return results;
        }

        var files = fs.readdirSync(dir);
        for (var i = 0; i < files.length; i++) {
            if (files[i].indexOf('.contract') > -1) {
                results.push(dir + "/" + files[i]);
            }
        }

        console.log("Found contracts:");
        console.log(results.join('\n') + "\n");
        return results;
    };

    Valter.prototype.readAsJson = function(path) {
        if (!path) {
            throw path + " argumant is mandatory!";
        }

        return JSON.parse(fs.readFileSync(path, 'utf8'));
    };

    Valter.prototype.typeCheck = function(contract, data, owner, ownerKey) {
        if (contract || data) {
            if (isObjectType(contract)) {
                for (var key in contract) {
                    if (contract.hasOwnProperty(key)) {
                        arrayEqualityCheck(contract[key], data[key], owner, ownerKey);
                        objectEqualityCheck(contract[key], data[key], contract, key);
                        atomicEqualityCheck(contract[key], data[key], key);
                    }
                }
                return true;
            }
            return atomicEqualityCheck(contract, data, contract);
        }
        errorOccured("STATUS : contract or data undefined!\n");
        return false;
    };

    Valter.prototype.getOptions = function(contract){
        return {
            method : contract.method,
            form : contract.form || {}
        };
    };

    Valter.prototype.request = function(url, options, promise) {
        var defaultOptions = {
            method: 'GET',
            timeout: 15000
        };
        defaultOptions = extend(defaultOptions, options);

        request(url, defaultOptions, promise);
    };

    Valter.prototype.checkContract = function() {
        if (Valter.contractPathList.length === 0) {
            errorOccured("STATUS : This path has not got any contract!");
            Valter.keepAlive = false;
            return;
        }

        var contract = Valter.prototype.readAsJson(Valter.contractPathList.pop());
        var serviceUrl = contract.producer + contract.uri;
        var options = Valter.prototype.getOptions(contract);
        console.log(serviceUrl);

        Valter.prototype.request(serviceUrl, options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var serviceResponse = JSON.parse(body);
                var contractExpectation = contract.expect.body;

                Valter.prototype.typeCheck(contractExpectation, serviceResponse);
                if (!Valter.hasError) {
                    console.log("STATUS: OK\n");
                }
            }

            if (Valter.contractPathList.length > 0) {
                Valter.prototype.checkContract();
            } else {
                Valter.keepAlive = false;
            }
        });
    };

    Valter.prototype.checkAlive = function() {
        if (!Valter.keepAlive) {
            if (!Valter.hasError) {
                console.log("FINISHED WITH SUCCESS");
                return 0;
            } else {
                console.log("FINISHED WITH ERRORS");
                process.exit(1);
                return 1;
            }
        }
    };

    var isSameType = function(contractData, serviceData) {
        return typeof contractData === typeof serviceData;
    };

    var isArrayType = function(contractData) {
        return Object.prototype.toString.call(contractData) === '[object Array]';
    };

    var isObjectType = function(contractData) {
        return typeof contractData === 'object';
    };

    var objectEqualityCheck = function(contractData, serviceData, owner, ownerKey) {
        if (isObjectType(contractData) && !isArrayType(contractData)) {
            for (var property in contractData) {
                if (contractData.hasOwnProperty(property)) {
                    if (typeof contractData[property] != typeof serviceData[property]) {
                        errorOccured("STATUS : Contract expects that your service data[" + ownerKey + "] contains '" + property + "' as type of " + typeof contractData[property] + ", but found " + typeof serviceData[property] + "!\n");
                        return false;
                    }
                    Valter.prototype.typeCheck(contractData[property], serviceData[property], contractData, ownerKey);
                }
            }
        }
    };

    var arrayEqualityCheck = function(contractData, serviceData, owner, ownerKey) {
        if (isArrayType(contractData)) {
            if (serviceData.length > 0) {

                if (!isSameType(contractData, serviceData)) {
                    errorOccured("STATUS : Contract expects that your service data contains '" + key + "' property as " + typeof contract[key] + ", but found " + typeof data[key] + "!\n");
                    return false;
                }

                for (var i = contractData.length - 1; i >= 0; i--) {
                    var contractItem = contractData[i];
                    var serviceDataItem = serviceData[i];

                    Valter.prototype.typeCheck(contractItem, serviceDataItem, contractData, i);
                }
            }
        }
    };

    var atomicEqualityCheck = function(contractData, serviceData, ownerKey) {
        if (!isArrayType(contractData) && !isObjectType(contractData)) {

            if (serviceData === undefined) {
                errorOccured("STATUS : Contract expects that your service data contains '" + ownerKey + "' property as " + typeof contractData + ", but found Undefined !\n");
                return false;
            }

            if (!isSameType(contractData, serviceData)) {
                errorOccured("STATUS : Contract expects that your service data contains '" + ownerKey + "' property as " + typeof contractData + ", but found " + typeof serviceData + "!\n");
                return false;
            }
            return true;
        }
        return false;
    };

    var errorOccured = function(message) {
        console.log(message);
        Valter.hasError = true;
    };

    var extend = function(obj, fromObj){
        for (var i in fromObj) {
            if (fromObj.hasOwnProperty(i)) {
                obj[i] = fromObj[i];
            }
        }
        return obj;
    };

    return Valter;
})();

module.exports = Valter;
