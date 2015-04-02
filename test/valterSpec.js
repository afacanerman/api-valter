var fs = require("fs");
var expect = require("chai").expect;
var valter = require("../lib/valter.js");
var path = require("path");
var sinon = require("sinon");

describe("Valter", function() {
    var reset = function(val) {
        valter.hasError = !val;
        valter.keepAlive = val;
    }

    describe("#scan()", function() {
        beforeEach(function() {
            reset(true);
        });

        it('should set error property if given dir does not exists', function() {
            valter.scan('dirDoesNotExists');

            expect(valter.hasError).to.be.true;
            expect(valter.keepAlive).to.be.false;
        });

        it("should retrieve the files from a directory", function() {
            reset(true);

            var contractsPath = path.resolve("contracts");
            var results = valter.scan(contractsPath);

            expect(results.length).to.equal(2);
            expect(results[0]).to.match(/.contract$/);
            expect(results[0]).to.match(/.contract$/);
        });
    });

    describe('#readAsJson()', function() {

        before(function() {
            reset(true);

            if (!fs.existsSync("test_files")) {
                fs.mkdirSync("test_files");
                fs.writeFileSync("test_files/a.contract", '{ "foo" : "bar" }');
            }
        });
        after(function() {
            fs.unlinkSync("test_files/a.contract");
            fs.rmdirSync("test_files");
        });

        it('should read the given file and return data as json', function() {
            var readJson = valter.readAsJson('test_files/a.contract');
            expect(readJson).to.deep.equal({
                foo: 'bar'
            });
        });
    });

    describe('#getOptions(contract)', function(){
        var requestOptions = valter.getOptions({
             "method": "GET",
             "uri": "/campaigns",
             "form" : {}
        });

        expect(requestOptions.method).to.be.equal("GET");
        expect(requestOptions.form).to.be.deep.equal({});
    });

    describe('#checkContract()', function() {
        beforeEach(function() {
            reset(true);
        });

        it('should set error flag if given directory has no contract', function() {
            valter.contractPathList = [];
            valter.checkContract();

            expect(valter.hasError).to.be.true;
            expect(valter.keepAlive).to.be.false;
        });

        it('it should send plain GET request', function(){
            var spy = sinon.spy(valter, "request");
            var resolvedPath = path.resolve("contracts");

            valter.contractPathList = [path.join(resolvedPath, "GET-campaign-service-dealoftheday.contract")];
            valter.checkContract();

            expect(spy.called).to.be.true;
        });
    });

    describe('#request(url, options, promise)', function(done){
        it('should do POST request', function(){
            valter.request("http://localhost:8080/helloworld", {

            }, function(error, response, body){
                expect(body).to.be.deep.equal({
                    hello: "world"
                });
                done();
            })
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
            expect(valter.hasError).to.be.true;
        });

        it('should compare contract and service contains same array types', function() {
            var contract = {
                m: [1, 2, 3]
            };


            var serviceResponse = {
                m: [1, 2, 3]
            };

            valter.typeCheck(contract, serviceResponse)
            expect(valter.hasError).to.be.false;
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
            expect(valter.hasError).to.be.true;
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
            expect(valter.hasError).to.be.true;
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

            valter.typeCheck(contract, serviceResponse)
            expect(valter.hasError).to.be.false;
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

            valter.typeCheck(contract, serviceResponse)
            expect(valter.hasError).to.be.true;
        });
    });
});
