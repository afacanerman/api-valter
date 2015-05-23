#!/usr/bin/env node

var program = require('commander');
var Valter = require("./lib/valter.js");

program
  .version('0.0.1')
  .option('-p, --filepath [value]', 'contracts path')
  .parse(process.argv);

if (program.filepath === undefined) { throw "filepath argument is mandatory for help -h";  }

console.log('valter started for the metada files under \'%s\'\n\n', program.filepath);

var valter = new Valter();
valter.init(program.filepath);

setInterval(function () { 
	var state = valter.checkAlive();
    if(state === 0){
    	process.exit(0);
    }
    else if(state === 1){
    	process.exit(1);
    }
}, 100);
