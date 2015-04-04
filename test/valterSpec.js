var fs = require("fs");
var expect = require("chai").expect;
var Valter = require("../lib/valter.js");
var path = require("path");
var sinon = require("sinon");


describe("Valter", function() {
    
    var valter = new Valter(true); //silent mode

    beforeEach(function() {
        reset(true);
    });

    var reset = function(val) {
        valter.currentState().hasError = !val;
        valter.currentState().keepAlive = val;
    };

    it('should instantiated properly', function(){
        var state = valter.currentState();
        expect(state.hasError).to.be.false;
        expect(state.keepAlive).to.be.true;
        expect(state.contractPathList.length).to.equal(0);
    });

    it('should init function be called', function(){
        var scanSpy = sinon.spy(valter, "scan");
        var checkContractSpy = sinon.spy(valter, 'checkContract');

        valter.init('withContractPath');
        expect(scanSpy).to.be.called;
        expect(checkContractSpy).to.be.called;
    });

    describe("#scan()", function() {
        beforeEach(function() {
            reset(true);
        });

        it('should set error property if given dir does not exists', function() {
            valter.scan('dirDoesNotExists');
            expect(valter.currentState().hasError).to.equal(true);
            expect(valter.currentState().keepAlive).to.equal(false);
        });

        it("should retrieve the files from a directory", function() {
            reset(true);

            var contractsPath = path.resolve("contracts");
            valter.scan(contractsPath);
            var results = valter.currentState().contractPathList

            expect(results.length).to.equal(2);
            expect(results[0]).to.match(/.contract$/);
            expect(results[1]).to.match(/.contract$/);
        });
    });


    describe('#checkContract()', function() {
        beforeEach(function() {
            valter.currentState().contractPathList = [];
            reset(true);
        });

        it('should set error flag if given directory has no contract', function() {
            valter.checkContract();

            expect( valter.currentState().hasError).to.equal(true);
            expect( valter.currentState().keepAlive).to.equal(false);
        });
    });

    describe('#request(url, options, promise)', function(){
        
        it('should send POST request', function(done){
            valter.request("http://localhost:8080/helloworld", {
                method : "POST",
                form : {}
            }, function(error, response, body){
                expect(JSON.parse(body)).to.be.deep.equal({
                    "hello": "world"
                });
                done();
            });
        });

        it('should send GET request', function(done){
            valter.request("http://localhost:8080/helloworld", {
                method : "GET"
            }, function(error, response, body){
                expect(JSON.parse(body)).to.be.deep.equal({
                    "Random": "content"
                });
                done();
            });
        });

        it('should throw an error if service not available', function(done){
             valter.request("http://localhost:8080", {

            }, function(error, response, body){
                expect(error).to.be.null;
                done();
            });
        });
    });

    describe('#typeCheck()', function() {
        beforeEach(function() {
            reset(true);
        });

        it('should compare contract and service contains not same array types', function() {
            var contract = {
                m: [1, 2, 3]
            };

            var serviceResponse = {
                m: ["1", "2", "3"]
            };

            valter.typeCheck(contract, serviceResponse);
            expect(valter.currentState().hasError).to.equal(true);
        });

        it('should compare contract and service contains same array types', function() {
            var contract = {
                m: [1, 2, 3]
            };


            var serviceResponse = {
                m: [1, 2, 3]
            };

            valter.typeCheck(contract, serviceResponse);
            expect(valter.currentState().hasError).to.equal(false);
        });

        it('should compare contract and service response with not same objects', function() {
            var contract = {
                e: "data",
                r: 123,
                m: [1, 2, 3],
                a: {
                    b: "1" // <-------- string
                },
                n: new Date()
            };


            var serviceResponse = {
                e: "data",
                r: 123,
                m: [1, 2, 3],
                a: {
                    b: 1
                },
                n: new Date(),
                t: ""
            };

            var exception;

            valter.typeCheck(contract, serviceResponse);
            expect(valter.currentState().hasError).to.equal(true);
        });

        it('should compare contract and service response with not same objects', function() {
            var contract = {
                e: "data",
                r: 123,
                m: [1, 2, 3],
                a: {
                    b: "1" // <-------- string
                },
                n: new Date()
            };


            var serviceResponse = {
                e: "data",
                r: 123,
                m: [1, 2, 3],
                a: {
                    b: 1
                },
                n: new Date(),
                t: ""
            };

            var exception;

            valter.typeCheck(contract, serviceResponse);
            expect(valter.currentState().hasError).to.equal(true);
        });

        it('should check object in array as same objects', function(){
            var contract = {
                m: [{
                    q:1,
                    l:""
                },{
                    q:1,
                    l:""
                }]
            };


            var serviceResponse = {
                m: [{
                    q:1,
                    l:""
                },{
                    q:1,
                    l:""
                }]
            };

            valter.typeCheck(contract, serviceResponse);
            expect(valter.currentState().hasError).to.equal(false);
        });

        it('should check object in array as not same objects', function(){
            var contract = {
                m: [{
                    q:1,
                    l:""
                },{
                    q:1,
                    l:2
                }]
            };


            var serviceResponse = {
                m: [{
                    q:1,
                    l:""
                },{
                    q:1,
                    l:""
                }]
            };

            valter.typeCheck(contract, serviceResponse);
            expect(valter.currentState().hasError).to.equal(true);
        });
    });
});
