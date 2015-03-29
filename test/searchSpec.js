var fs = require("fs");
var expect = require("chai").expect;
var search = require("../lib/search.js");
 
describe("Search", function(){
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
          var results = search.scan('/api-valter/test_files');
          expect(results.length).to.equal(2);
          expect(results).to.deep.equal(["a", "b"]);
       });

   });

    describe("#match()", function(){
        it("should find and return matches based on a query", function(){
            var files = ["hello.txt", "world.js", "another.js"];
            var results = search.match(".js", files);
            expect(results).to.deep.equal(["world.js", "another.js"]);
     
            results = search.match("hello", files);
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
        var readJson = search.readAsJson('test_files/a.contract');
        expect(readJson).to.deep.equal({ foo: 'bar' });
      });
    });
});


