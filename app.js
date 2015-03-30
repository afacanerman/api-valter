#!/usr/bin/env node
var program = require('commander');
var valter = require("./lib/valter.js");


program
  .version('0.0.1')
  .option('-p, --filepath [value]', 'contracts path')
  .parse(process.argv);

if (program.filepath === undefined) { throw "filepath argument is mandatory for help -h";  }

console.log('valter started for the metada files under \'%s\'\n\n', program.filepath);

// Program is ready to run contract tests
var contractList = valter.scan(program.filepath);
valter.assertContracts(contractList);
process.exit(0);
