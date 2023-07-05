const fs = require("fs");
const path = require("path");

const adaptive = require("./lib/adaptiveTiling.js");
const static = require("./lib/staticTiling.js");

async function process(file, maxTriangles, type) {
	try {
		const uploadFile = path.join(__dirname, "data", file.originalname);
		fs.rename(file, uploadFile, (error) => {
			if (error) throw error;
		});

		if (type === 2) {
			await adaptive.adaptiveTiling(uploadFile, maxTriangles);
		} else if (type === 1) {
			await static.staticTiling(uploadFile, maxTriangles);
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
