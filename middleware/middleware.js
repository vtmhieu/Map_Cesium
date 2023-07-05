const fs = require("fs");
const path = require("path");

const adaptive = require("../build/lib/adaptiveTiling");
const static = require("../build/lib/staticTiling");

function process(file, maxTriangles, type) {
	const uploadFile = path.join(__dirname, "data", file.originalname);
	fs.rename(file, uploadFile, (error) => {
		if (error) throw error;
	});

	if (type === 2) {
		adaptive.AdaptiveTiling(uploadFile, maxTriangles);
	}
	if (type === 1) {
		static.staticTiling(uploadFile, maxTriangles);
	}
}

module.exports = {
	process,
};
