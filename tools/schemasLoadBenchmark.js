/**
 * This toos should be used to measure toad time and memory consumption of schemas processing.
 *
 * NODE_ENV=prod node tools/schemasLoadBenchmark.js
 */
'use strict';

var path = require('path');
var fs = require('fs');
var util = require('util');

var config = require(path.join(process.cwd(), '/build/server/config.js'));
var schemaRegistryModule = require(path.join(process.cwd(), '/build/server/schemaRegistry.js'));


// Load and register schemas
var schemasListPaths = JSON.parse(
	fs.readFileSync(path.join(config.paths.schemas, '_index.json')))
	.map(function(item) {
		return path.join(config.paths.schemas, item);
	});

var memoryBefore = process.memoryUsage();
var timeBefore = process.hrtime();
var schemaRegistry = new schemaRegistryModule.SchemaRegistry({schemasList: schemasListPaths});
var timeDiff = process.hrtime(timeBefore);
var memoryAfter = process.memoryUsage();

if (schemaRegistry) {
	console.log('\nMemory usage before:\n' + util.inspect(memoryBefore) + '\nMemory usage after:\n' + util.inspect(memoryAfter));
	console.log('\nMemory used (bytes):\nrss: ' + (memoryAfter.rss - memoryBefore.rss));
	console.log('heapTotal: ' + (memoryAfter.heapTotal - memoryBefore.heapTotal));
	console.log('heapUsed: ' + (memoryAfter.heapUsed - memoryBefore.heapUsed));

	console.log('\nIt took %d seconds', (timeDiff[0] + timeDiff[1] / 1e9).toFixed(2));
} else {
	console.log('error');
}
