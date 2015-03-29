#!/usr/bin/env node
var program = require('commander');
var search = require("./lib/search.js");


program
  .version('0.0.1')
  .option('-p, --filepath [value]', 'contracts path')
  .option('-a, --against [value]', 'Runs contract validation against', 'http://localhost')
  .parse(process.argv);

if (program.against === undefined) { throw new Error("against argument is mandatory for help -h"); } 
if (program.filepath === undefined) { throw new Error("filepath argument is mandatory for help -h");  }

console.log('valter started against \'%s\' for the metada files under \'%s\'\n\n',
             program.against, program.filepath);

// Program is ready to run contract tests
var contractList = search.scan(program.filepath);

console.log(contractList);

