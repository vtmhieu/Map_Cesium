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
async function convertGLBtoB3DM(inputFile, outputFile) {
	try {
		const command = `npx 3d-tiles-tools glbToB3dm -i ${inputFile} -o ${outputFile}`;
		const result = await runCommand(command);
		console.log(result);
	} catch (error) {
		console.error(`An error occurred: ${error.message}`);
	}
}

// Run the conversion
const inputFile = "/home/hieuvu/DATN/Map_Cesium/output/glb/output1.glb";
const outputFile = "./output/b3dm/output1.b3dm";
convertGLBtoB3DM(inputFile, outputFile);
