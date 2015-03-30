#!/usr/bin/env node
var program = require('commander');
var valter = require("./lib/valter.js");
var sys = require("sys");
var keepAlive = true;

program
  .version('0.0.1')
  .option('-p, --filepath [value]', 'contracts path')
  .parse(process.argv);

if (program.filepath === undefined) { throw "filepath argument is mandatory for help -h";  }

console.log('valter started for the metada files under \'%s\'\n\n', program.filepath);


var stdin = process.openStdin();


// Program is ready to run contract tests
valter.init();
valter.contractPathList = valter.scan(program.filepath);
valter.checkContract();
