var fs = require("fs");
var expect = require("chai").expect;
var valter = require("../lib/valter.js");
var path    = require("path");

describe("Valter", function() {
    var reset = function(val){
        valter.hasError = !val;
        valter.keepAlive = val;
    }

    describe("#scan()", function() {
        beforeEach(function() {
            reset(true);
        });

        it('should set error property if given dir does not exists', function(){
            valter.scan('dirDoesNotExists');

            expect(valter.hasError).to.be.true;
            expect(valter.keepAlive).to.be.false;
        });

        it("should retrieve the files from a directory", function() {
            reset(true);

            var contractsPath =  path.resolve("contracts");
            var results = valter.scan(contractsPath);

            expect(contractsPath).to.be.equal('c:\\Users\\cafacan\\Dropbox\\Repositories\\api-valter\\contracts');
            expect(results.length).to.equal(2);
            expect(results).to.deep.equal([
                "c:\\Users\\cafacan\\Dropbox\\Repositories\\api-valter\\contracts\\GET-campaign-service-dealoftheday.contract",
                "c:\\Users\\cafacan\\Dropbox\\Repositories\\api-valter\\contracts\\GET-helloworld.contract"
            ]);
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

    describe('#checkContract()', function(){
        before(function() {
            reset(true);
        });

        it('should set error flag if given directory has no contract', function(){
            valter.contractPathList = [];
            valter.checkContract();

            expect(valter.hasError).to.be.true;
            expect(valter.keepAlive).to.be.false;
        });
    });

    describe('#typeCheck()', function() {
       beforeEach(function(){
            reset(true);
       });

        it('should compare contract and service contains not same array types', function() {
            var contract = {
                e: "data",
                r: 123,
                m:[1,2,3]
            };


            var serviceResponse = {
                e: "data",
                r: 123,
                t: "",
                m:["1","2","3"]
            };

            valter.typeCheck(contract, serviceResponse)
            expect(valter.hasError).to.be.true;
        });

        it('should compare contract and service contains same array types', function() {
            var contract = {
                m:[1,2,3]
            };


            var serviceResponse = {
                m:[1,2,3]
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
    });
});
