var fs = require("fs");
var expect = require("chai").expect;
var valter = require("../lib/valter.js");
 
describe("Valter", function(){
   describe("#scan()", function(){

       before(function() {
           if (!fs.existsSync("test_files")) {
               fs.mkdirSync("test_files");
               fs.writeFileSync("test_files/a", "");
               fs.writeFileSync("test_files/b", "");
           }
       });

       after(function() {
           fs.unlinkSync("test_files/a");
           fs.unlinkSync("test_files/b");
           fs.rmdirSync("test_files");
       });

       it("should retrieve the files from a directory", function() {
          var results = valter.scan('/Users/cafacan/Dropbox/Repositories/api-valter/test_files');
          expect(results.length).to.equal(2);
          expect(results).to.deep.equal(["a", "b"]);
       });

   });
    describe("#match()", function(){
        it("should find and return matches based on a query", function(){
            var files = ["hello.txt", "world.js", "another.js"];
            var results = valter.match(".js", files);
            expect(results).to.deep.equal(["world.js", "another.js"]);
     
            results = valter.match("hello", files);
            expect(results).to.deep.equal(["hello.txt"]);
        });
    });

    describe('#readAsJson()', function(){
      
      before(function() {
           if (!fs.existsSync("test_files")) {
               fs.mkdirSync("test_files");
               fs.writeFileSync("test_files/a.contract", '{ "foo" : "bar" }');
           }
       });

       after(function() {
           fs.unlinkSync("test_files/a.contract");
           fs.rmdirSync("test_files");
       });


      it('should read the given file and return data as json', function(){
        var readJson = valter.readAsJson('test_files/a.contract');
        expect(readJson).to.deep.equal({ foo: 'bar' });
      });
    });

    describe('#fetchContractData(contract)', function(){
        it('should get service response', function(){
            var contractMD = valter.readAsJson('contracts/GET-campaign-service-dealoftheday.contract');

        });
    });

    describe('#typeCheck()', function(){
      it('should compare contract and service response with same object', function(){
          var contract = {
              e: "data",
              r: 123,
              m: [1, 2, 3],
              a: {
                  b:1
              },
              n: new Date()
          };


          var serviceResponse = {
              e: "data",
              r: 123,
              m: [1, 2, 3],
              a: {
                  b:1
              },
              n: new Date(),
              t: ""
          };  

          var exception;
          try {
            valter.typeCheck(contract, serviceResponse)
          } catch(ex){
            exception = ex;
          }

          expect(exception).to.be.undefined;
      });

       it('should compare contract and service response with not same objects', function(){
          var contract = {
              e: "data",
              r: 123,
              m: [1, 2, 3],
              a: {
                  b:"1" // <-------- string
              },
              n: new Date()
          };


          var serviceResponse = {
              e: "data",
              r: 123,
              m: [1, 2, 3],
              a: {
                  b:1
              },
              n: new Date(),
              t: ""
          };  

          var exception;
          try {
            valter.typeCheck(contract, serviceResponse)
          } catch(ex){
            exception = ex;
          }

          expect(exception).to.not.be.undefined;
      });
    });
});


