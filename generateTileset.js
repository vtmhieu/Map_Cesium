const fs = require("fs");
const { mat4 } = require("gl-matrix");

function createB3dmFile(indices, boundingVolume, byteStride) {
	// Create the header
	const header = {
		magic: "b3dm",
		version: 1,
		byteLength: 0,
		featureTableJSONByteLength: 0,
		featureTableBinaryByteLength: 0,
		batchTableJSONByteLength: 0,
		batchTableBinaryByteLength: 0,
	};

	// Create the feature table
	const featureTable = {
		BATCH_LENGTH: indices.length * 3, // Number of vertices (3 vertices per triangle)
	};

	// Create the feature table binary
	const featureTableBinary = Buffer.alloc(0); // No additional binary data for this example

	// Create the batch table
	const batchTable = {};

	// Create the batch table binary
	const batchTableBinary = Buffer.alloc(0); // No additional binary data for this example

	// Create the triangle positions
	const positions = [];
	for (const triangleIndices of indices) {
		for (const vertexIndex of triangleIndices) {
			const position = calculateVertexPosition(vertexIndex, byteStride);
			positions.push(position);
		}
	}

	// Create the bounding sphere
	const boundingSphere = calculateBoundingSphere(boundingVolume);

	// Combine the feature table, feature table binary, batch table, and batch table binary
	const featureTableJSON = JSON.stringify(featureTable);
	const batchTableJSON = JSON.stringify(batchTable);

	// Calculate the byte lengths
	header.featureTableJSONByteLength = Buffer.byteLength(featureTableJSON);
	header.featureTableBinaryByteLength = featureTableBinary.length;
	header.batchTableJSONByteLength = Buffer.byteLength(batchTableJSON);
	header.batchTableBinaryByteLength = batchTableBinary.length;
	header.byteLength =
		28 +
		header.featureTableJSONByteLength +
		header.featureTableBinaryByteLength +
		header.batchTableJSONByteLength +
		header.batchTableBinaryByteLength +
		positions.length * 12 +
		12;

	// Create the b3dm buffer
	const b3dmBuffer = Buffer.alloc(header.byteLength);
	let offset = 0;

	// Write the header
	offset = writeHeader(b3dmBuffer, header, offset);

	// Write the feature table JSON
	offset = writeString(b3dmBuffer, featureTableJSON, offset);

	// Write the feature table binary
	offset = writeBuffer(b3dmBuffer, featureTableBinary, offset);

	// Write the batch table JSON
	offset = writeString(b3dmBuffer, batchTableJSON, offset);

	// Write the batch table binary
	offset = writeBuffer(b3dmBuffer, batchTableBinary, offset);

	// Write the triangle positions
	for (const position of positions) {
		offset = writePosition(b3dmBuffer, position, offset);
	}

	// Write the bounding sphere
	writeBoundingSphere(b3dmBuffer, boundingSphere, offset);

	// Save the b3dm file
	const filename = "model.b3dm";
	fs.writeFileSync(filename, b3dmBuffer);

	console.log(`B3DM file saved: ${filename}`);
}

function calculateVertexPosition(vertexIndex, byteStride) {
	// Retrieve the position based on the given vertexIndex and byteStride
	// You'll need to implement your logic here based on the bin file structure
	// This example assumes each vertex has a position of [x, y, z] and the byteStride is 2

	const bufferOffset = vertexIndex * byteStride;
	const position = [
		readFloatFromBuffer(buffer, bufferOffset),
		readFloatFromBuffer(buffer, bufferOffset + 4),
		readFloatFromBuffer(buffer, bufferOffset + 8),
	];

	return position;
} //same as the calculate MidTriangle

function calculateBoundingSphere(boundingVolume) {
	const boundingSphere = {
		center: [
			(boundingVolume.minX + boundingVolume.maxX) / 2,
			(boundingVolume.minY + boundingVolume.maxY) / 2,
			(boundingVolume.minZ + boundingVolume.maxZ) / 2,
		],
		radius:
			Math.max(
				boundingVolume.maxX - boundingVolume.minX,
				boundingVolume.maxY - boundingVolume.minY,
				boundingVolume.maxZ - boundingVolume.minZ,
			) / 2,
	};

	return boundingSphere;
}

function writeHeader(buffer, header, offset) {
	buffer.write(header.magic, offset);
	offset += 4;
	buffer.writeUInt32LE(header.version, offset);
	offset += 4;
	buffer.writeUInt32LE(header.byteLength, offset);
	offset += 4;
	buffer.writeUInt32LE(header.featureTableJSONByteLength, offset);
	offset += 4;
	buffer.writeUInt32LE(header.featureTableBinaryByteLength, offset);
	offset += 4;
	buffer.writeUInt32LE(header.batchTableJSONByteLength, offset);
	offset += 4;
	buffer.writeUInt32LE(header.batchTableBinaryByteLength, offset);
	offset += 4;

	return offset;
}

function writeString(buffer, str, offset) {
	buffer.write(str, offset, "utf8");
	return offset + Buffer.byteLength(str);
}

function writeBuffer(buffer, data, offset) {
	data.copy(buffer, offset);
	return offset + data.length;
}

function writePosition(buffer, position, offset) {
	buffer.writeFloatLE(position[0], offset);
	offset += 4;
	buffer.writeFloatLE(position[1], offset);
	offset += 4;
	buffer.writeFloatLE(position[2], offset);
	offset += 4;

	return offset;
}

function writeBoundingSphere(buffer, boundingSphere, offset) {
	const center = boundingSphere.center;
	const radius = boundingSphere.radius;

	buffer.writeFloatLE(center[0], offset);
	offset += 4;
	buffer.writeFloatLE(center[1], offset);
	offset += 4;
	buffer.writeFloatLE(center[2], offset);
	offset += 4;
	buffer.writeFloatLE(radius, offset);
	offset += 4;
}

// Usage example
const indices = [
	[395, 397, 398],
	[415, 416, 417],
];
const boundingVolume = {
	minX: -4.76837158203125e-7,
	minY: 0,
	minZ: -4.76837158203125e-7,
	maxX: 1.1338499188423157,
	maxY: 0.24572604894638062,
	maxZ: 1.1338499188423157,
};
const byteStride = 2;

createB3dmFile(indices, boundingVolume, byteStride);
