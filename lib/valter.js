var fs = require("fs");
var request = require("request");

var Valter = (function () {
    'use strict';


    function Valter (isSilent) {
        var self = this;

        this.defaultState = {
            isForTest: isSilent || false,
            keepAlive:true,
            hasError:false,
            contractPathList: []
        };

        this.errorOccured = function(message) {
            this.log(message);
            this.defaultState.hasError = true;
        };

        this.log = function(message){
            if(!this.defaultState.isForTest){
                console.log(message)
            }
        };

        this.isSameType = function(contractData, serviceData) {
            return typeof contractData === typeof serviceData;
        };

        this.isArrayType = function(contractData) {
            return Object.prototype.toString.call(contractData) === '[object Array]';
        };

        this.isObjectType = function(contractData) {
            return typeof contractData === 'object';
        };

        this.objectEqualityCheck = function(contractData, serviceData, owner, ownerKey) {
            if (this.isObjectType(contractData) && !this.isArrayType(contractData)) {
                for (var property in contractData) {
                    if (contractData.hasOwnProperty(property)) {
                        if (typeof contractData[property] != typeof serviceData[property]) {
                            this.errorOccured("STATUS : Contract expects that your service data[" + ownerKey + "] contains '" + property + "' as type of " + typeof contractData[property] + ", but found " + typeof serviceData[property] + "!\n");
                            return false;
                        }
                        this.typeCheck(contractData[property], serviceData[property], contractData, ownerKey);
                    }
                }
            }
        };

        this.typeCheck = function(contract, data, owner, ownerKey) {
                if (contract || data) {
                    if (self.isObjectType(contract)) {
                        for (var key in contract) {
                            if (contract.hasOwnProperty(key)) {
                                self.arrayEqualityCheck(contract[key], data[key], owner, ownerKey);
                                self.objectEqualityCheck(contract[key], data[key], contract, key);
                                self.atomicEqualityCheck(contract[key], data[key], key);
                            }
                        }
                        return true;
                    }
                    return this.atomicEqualityCheck(contract, data, contract);
                }
                this.errorOccured("STATUS : contract or data undefined!\n");
                return false;
        }

        this.arrayEqualityCheck = function(contractData, serviceData, owner, ownerKey) {
            if (self.isArrayType(contractData)) {
                if (serviceData.length > 0) {

                    if (!self.isSameType(contractData, serviceData)) {
                        this.errorOccured("STATUS : Contract expects that your service data contains '" + key + "' property as " + typeof contract[key] + ", but found " + typeof data[key] + "!\n");
                        return false;
                    }

                    for (var i = contractData.length - 1; i >= 0; i--) {
                        var contractItem = contractData[i];
                        var serviceDataItem = serviceData[i];

                        self.typeCheck(contractItem, serviceDataItem, contractData, i);
                    }
                }
            }
        };

        this.atomicEqualityCheck = function(contractData, serviceData, ownerKey) {
            if (!self.isArrayType(contractData) && !self.isObjectType(contractData)) {

                if (serviceData === undefined) {
                    this.errorOccured("STATUS : Contract expects that your service data contains '" + ownerKey + "' property as " + typeof contractData + ", but found Undefined !\n");
                    return false;
                }

                if (!self.isSameType(contractData, serviceData)) {
                    this.errorOccured("STATUS : Contract expects that your service data contains '" + ownerKey + "' property as " + typeof contractData + ", but found " + typeof serviceData + "!\n");
                    return false;
                }
                return true;
            }
            return false;
        };

        this.extend = function(obj, fromObj){
            for (var i in fromObj) {
                if (fromObj.hasOwnProperty(i)) {
                    obj[i] = fromObj[i];
                }
            }
            return obj;
        };

        this.readAsJson= function(path) {
            if (!path) { throw path + " argumant is mandatory!"; }
            return JSON.parse(fs.readFileSync(path, 'utf8'));
        };
        
        return {
            init: function(filepath){
                this.scan(filepath);
                this.checkContract();
            },
            currentState: function(){
                return self.defaultState;
            },
            scan: function(dir) {
                var results = [];
                if (!fs.existsSync(dir)) {
                    self.errorOccured(dir + " does not exists!");
                    self.defaultState.keepAlive = false;
                    return;
                }

                var files = fs.readdirSync(dir);
                for (var i = 0; i < files.length; i++) {
                    if (files[i].indexOf('.contract') > -1) {
                        results.push(dir + "/" + files[i]);
                    }
                }

                console.log("Found contracts:");
                console.log(results.join('\n') + "\n");
                self.defaultState.contractPathList = results;
            },
            request : function(url, options, promise) {
                var defaultOptions = {
                    method: 'GET',
                    timeout: 15000
                };
                defaultOptions = self.extend(defaultOptions, options);

                request(url, defaultOptions, promise);
            },
            checkContract: function() {
                var that = this;
                if (self.defaultState.contractPathList.length === 0) {
                    self.errorOccured("STATUS : This path has not got any contract!");
                    self.defaultState.keepAlive = false;
                    return;
                }

                var contract = self.readAsJson(self.defaultState.contractPathList.pop());
                var serviceUrl = contract.producer + contract.uri;
                var options = {
                    method : contract.method,
                    form : contract.form || {}
                };
                self.log(serviceUrl);

                request(serviceUrl, options, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var serviceResponse = JSON.parse(body);
                        var contractExpectation = contract.expect.body;

                        that.typeCheck(contractExpectation, serviceResponse);
                        if (!self.defaultState.hasError) {
                            self.log("STATUS: OK\n");
                        }
                    }

                    if (self.defaultState.contractPathList.length > 0) {
                        that.checkContract();
                    } else {
                        self.defaultState.keepAlive = false;
                    }
                });
            },
            checkAlive: function() {
                if (!self.defaultState.keepAlive) {
                    if (!self.defaultState.hasError) {
                        console.log("FINISHED WITH SUCCESS");
                        return 0;
                    } else {
                        console.log("FINISHED WITH ERRORS");
                        process.exit(1);
                        return 1;
                    }
                }
            },
            typeCheck : this.typeCheck,
        };
    }

    return Valter;
})();

module.exports = Valter;
