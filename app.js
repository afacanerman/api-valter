#!/usr/bin/env node
var program = require('commander');
var valter = require("./lib/valter.js");


program
  .version('0.0.1')
  .option('-p, --filepath [value]', 'contracts path')
  .option('-a, --against [value]', 'Runs contract validation against', 'http://localhost')
  .parse(process.argv);

if (program.against === undefined) { throw "against argument is mandatory for help -h"; } 
if (program.filepath === undefined) { throw "filepath argument is mandatory for help -h";  }

console.log('valter started against \'%s\' for the metada files under \'%s\'\n\n',
             program.against, program.filepath);

// Program is ready to run contract tests
var contractList = valter.scan(program.filepath);
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

valter.typeCheck(contract, serviceResponse);

console.log("SUCCESS");

