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
async function convertGLTFtoGLB(inputFile, outputFile) {
	try {
		const command = `gltf-pipeline -i ${inputFile} -o ${outputFile}`;
		const result = await runCommand(command);
		console.log(result);
	} catch (error) {
		console.error(`An error occurred: ${error.message}`);
	}
}

// Run the conversion
const inputFile = "/home/hieuvu/DATN/Map_Cesium/output/gltf/output.gltf";
const outputFile = "./output/glb/output.glb";
convertGLTFtoGLB(inputFile, outputFile);
