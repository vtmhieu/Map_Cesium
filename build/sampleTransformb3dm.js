const fs = require("fs");
const path = require("path");

// Helper function to read binary file
function readBinFile(filePath) {
	return fs.readFileSync(filePath);
}

// Helper function to write binary file
function writeBinFile(filePath, data) {
	fs.writeFileSync(filePath, data);
}

// Function to calculate byte stride based on accessor's component type
function calculateByteStride(accessor) {
	let byteStride = 0;
	switch (accessor.componentType) {
		case 5120: // BYTE
			byteStride = 1;
			break;
		case 5121: // UNSIGNED_BYTE
			byteStride = 1;
			break;
		case 5122: // SHORT
			byteStride = 2;
			break;
		case 5123: // UNSIGNED_SHORT
			byteStride = 2;
			break;
		case 5125: // UNSIGNED_INT
			byteStride = 4;
			break;
		case 5126: // FLOAT
			byteStride = 4;
			break;
		default:
			throw new Error(`Unsupported component type: ${accessor.componentType}`);
	}
	return byteStride;
}

// Generate b3dm file
function generateB3dmFile(gltf) {
	// Step 1: Prepare the header
	const header = Buffer.alloc(28);
	header.write("b3dm", "utf8"); // Magic word
	header.writeUInt32LE(1, 4); // Version 1
	header.writeUInt32LE(0, 8); // Byte length (placeholder)

	// Step 2: Prepare the feature table
	const featureTableJson = {
		BATCH_LENGTH: 0, // Placeholder value, adjust according to your data
	};
	const featureTableJsonString = JSON.stringify(featureTableJson);
	const featureTableJsonLength = Buffer.byteLength(featureTableJsonString);
	const featureTableJsonBuffer = Buffer.alloc(featureTableJsonLength);
	featureTableJsonBuffer.write(featureTableJsonString, "utf8");

	// Step 3: Convert the POSITION, NORMAL, and TEXCOORD_0 accessors into typed arrays
	const positionAccessor = gltf.accessors[0];
	const normalAccessor = gltf.accessors[1];
	const texCoordAccessor = gltf.accessors[2];
	const positionBufferView = gltf.bufferViews[positionAccessor.bufferView];
	const normalBufferView = gltf.bufferViews[normalAccessor.bufferView];
	const texCoordBufferView = gltf.bufferViews[texCoordAccessor.bufferView];
	const positionBuffer = gltf.buffers[positionBufferView.buffer];
	const normalBuffer = gltf.buffers[normalBufferView.buffer];
	const texCoordBuffer = gltf.buffers[texCoordBufferView.buffer];

	const positionOffset =
		positionBufferView.byteOffset + positionAccessor.byteOffset;
	const normalOffset = normalBufferView.byteOffset + normalAccessor.byteOffset;
	const texCoordOffset =
		texCoordBufferView.byteOffset + texCoordAccessor.byteOffset;

	const positionBufferData = readBinFile(positionBuffer.uri);
	const normalBufferData = readBinFile(normalBuffer.uri);
	const texCoordBufferData = readBinFile(texCoordBuffer.uri);

	const positionTypedArray = new Float32Array(
		positionBufferData.buffer,
		positionOffset,
		positionAccessor.count * 3,
	);
	const normalTypedArray = new Float32Array(
		normalBufferData.buffer,
		normalOffset,
		normalAccessor.count * 3,
	);
	const texCoordTypedArray = new Float32Array(
		texCoordBufferData.buffer,
		texCoordOffset,
		texCoordAccessor.count * 2,
	);

	// Step 4: Convert the indices accessor into a typed array
	const indicesAccessor = gltf.accessors[3];
	const indicesBufferView = gltf.bufferViews[indicesAccessor.bufferView];
	const indicesBuffer = gltf.buffers[indicesBufferView.buffer];

	const indicesOffset =
		indicesBufferView.byteOffset + indicesAccessor.byteOffset;

	const indicesBufferData = readBinFile(indicesBuffer.uri);
	const indicesTypedArray = new Uint16Array(
		indicesBufferData.buffer,
		indicesOffset,
		indicesAccessor.count,
	);

	// Step 5: Calculate byte strides
	const positionByteStride = calculateByteStride(positionAccessor);
	const normalByteStride = calculateByteStride(normalAccessor);
	const texCoordByteStride = calculateByteStride(texCoordAccessor);

	// Step 6: Prepare the b3dm buffer
	const b3dmBufferLength =
		header.length +
		featureTableJsonLength +
		positionTypedArray.byteLength +
		normalTypedArray.byteLength +
		texCoordTypedArray.byteLength +
		indicesTypedArray.byteLength * 2; // Multiply by 2 because indices are UInt16
	const b3dmBuffer = Buffer.alloc(b3dmBufferLength);

	// Step 7: Write the header
	header.writeUInt32LE(b3dmBufferLength, 12);
	header.copy(b3dmBuffer, 0);

	// Step 8: Write the feature table JSON
	featureTableJsonBuffer.copy(b3dmBuffer, header.length);

	// Step 9: Write the vertex data into the b3dm buffer
	let bufferOffset = header.length + featureTableJsonLength;
	for (let i = 0; i < positionTypedArray.length; i++) {
		b3dmBuffer.writeFloatLE(positionTypedArray[i], bufferOffset);
		bufferOffset += 4;
	}
	for (let i = 0; i < normalTypedArray.length; i++) {
		b3dmBuffer.writeFloatLE(normalTypedArray[i], bufferOffset);
		bufferOffset += 4;
	}
	for (let i = 0; i < texCoordTypedArray.length; i++) {
		b3dmBuffer.writeFloatLE(texCoordTypedArray[i], bufferOffset);
		bufferOffset += 4;
	}

	// Step 10: Write the indices data into the b3dm buffer
	const indicesByteStride = calculateByteStride(indicesAccessor);
	for (let i = 0; i < indicesTypedArray.length; i++) {
		const value = indicesTypedArray[i];
		b3dmBuffer.writeUInt16LE(value, bufferOffset);
		bufferOffset += indicesByteStride;
	}

	// Step 11: Save the b3dm buffer to a file
	writeBinFile("path/to/output.b3dm", b3dmBuffer);
}

// Load the glTF file
const gltfFilePath = "path/to/input.gltf";
const gltfData = fs.readFileSync(gltfFilePath, "utf8");
const gltf = JSON.parse(gltfData);

// Generate the b3dm file
generateB3dmFile(gltf);
