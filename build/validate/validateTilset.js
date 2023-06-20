const { exec } = require("child_process");

function runCommand(command) {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(error);
				return;
			}

			if (stderr) {
				reject(new Error(stderr));
				return;
			}

			resolve(stdout.trim());
		});
	});
}

// Example usage
async function validateTileset(inputFile, outputFile) {
	try {
		const command = `npx 3d-tiles-validator --tilesetFile ${inputFile} --reportFile ${outputFile}`;
		const result = await runCommand(command);
		console.log(result);
	} catch (error) {
		console.error(`An error occurred: ${error.message}`);
	}
}

// Run the conversion
const inputFile = "/home/hieuvu/DATN/Map_Cesium/output/tileset/00.json";
const outputFile = "./MY_REPORT.json";
validateTileset(inputFile, outputFile);
