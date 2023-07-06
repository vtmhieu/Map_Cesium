const fs = require("fs");
const path = require("path");

const adaptive = require("./lib/adaptiveTiling.js");
const static = require("./lib/staticTiling.js");

function process(file, maxTriangles, type, callback) {
	if (type === "2") {
		adaptive.adaptiveTiling(file, maxTriangles, (tileset) => {
			callback(tileset);
		});
	} else if (type === "1") {
		tileset = static.staticTiling(file, maxTriangles, (tileset) => {
			callback(tileset);
		});
	} else {
		console.log("error");
	}
}

module.exports = {
	process,
};
