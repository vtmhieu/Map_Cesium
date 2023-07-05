const fs = require("fs");
const path = require("path");

const adaptive = require("./lib/adaptiveTiling.js");
const static = require("./lib/staticTiling.js");

async function process(file, maxTriangles, type) {
	try {
		if (type === 2) {
			await adaptive.adaptiveTiling(file, maxTriangles);
		} else if (type === 1) {
			await static.staticTiling(file, maxTriangles);
		} else {
			return;
		}
	} catch (error) {
		console.log(error);
	}
}

module.exports = {
	process,
};
