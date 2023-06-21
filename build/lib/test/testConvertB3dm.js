const fs = require("fs");

function convertToB3DM(jsonData, outputFilePath) {
	// Convert JSON to binary
	const base64Data = jsonData.buffers[0].uri.split(",")[1];
	const binaryData = Buffer.from(base64Data, "base64");

	// Build B3DM structure
	const magic = Buffer.from("b3dm");
	const version = Buffer.alloc(4);
	version.writeUInt32LE(1); // Set B3DM version to 1 (Little Endian)
	const batchTable = Buffer.alloc(0); // No batch table for this example

	const b3dmData = Buffer.concat([magic, version, batchTable, binaryData]);

	// Write binary data to B3DM file
	fs.writeFileSync(outputFilePath, b3dmData);
}

function ParseGLTF(gltfPath) {
	const gltfData = fs.readFileSync(gltfPath);
	const gltf = JSON.parse(gltfData);
	return gltf;
}

// Usage
const gltfPath = "/home/hieuvu/DATN/Map_Cesium/gltf/Box.gltf";

const jsonData = ParseGLTF(gltfPath);

const outputFilePath = "./output/output.b3dm"; // Output file path

convertToB3DM(jsonData, outputFilePath);
