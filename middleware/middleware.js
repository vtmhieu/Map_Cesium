const fs = require("fs");
const path = require("path");

const adaptive = require("./lib/adaptiveTiling.js");
const static = require("./lib/staticTiling.js");

function process(file, maxTriangles, type) {
	let tileset = "";
	if (type === "2") {
		tileset = adaptive.adaptiveTiling(file, maxTriangles);
	} else if (type === "1") {
		tileset = static.staticTiling(file, maxTriangles);
	} else {
		console.log("error");
	}
	return tileset;
}

module.exports = {
	process,
};
