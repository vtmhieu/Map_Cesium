const fs = require("fs");

function ParseGLTF(gltfPath) {
	const gltfData = fs.readFileSync(gltfPath);
	const gltf = JSON.parse(gltfData);
	return gltf;
}

function readBinFile(filename) {
	const rawData = fs.readFileSync(filename);
	const typedArray = Buffer.from(rawData);
	return typedArray;
}

function getComponentTypeSize(componentType) {
	switch (componentType) {
		case 5120: // BYTE
		case 5121: // UNSIGNED_BYTE
			return 1;
		case 5122: // SHORT
		case 5123: // UNSIGNED_SHORT
			return 2;
		case 5125: // UNSIGNED_INT
		case 5126: // FLOAT
			return 4;
		default:
			return 0;
	}
}

function calculateBoundingVolume(gltfFilePath) {
	// Read the glTF file
	const gltfData = fs.readFileSync(gltfFilePath, "utf8");
	const gltf = JSON.parse(gltfData);
	// Calculate the bounding volume
	let minX = Infinity;
	let minY = Infinity;
	let minZ = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	let maxZ = -Infinity;
	// Get the mesh data
	for (const mesh of gltf.meshes) {
		const accessor = gltf.accessors[mesh.primitives[0].attributes.POSITION];
		const bufferView = gltf.bufferViews[accessor.bufferView];
		const buffer = gltf.buffers[bufferView.buffer];
		const vertexCount = accessor.count;
		const byteOffset = bufferView.byteOffset + accessor.byteOffset;
		let byteStride = 12;
		if (accessor.type === "VEC3") {
			byteStride = 12;
		} else if (accessor.type === "VEC2") {
			byteStride = 4;
		} else if (accessor.type === "SCALAR") {
			byteStride = 1;
		} else {
			continue;
		}

		let bufferData = readBinFile(buffer.uri);
		for (let i = 0; i < vertexCount; i++) {
			const offset = byteOffset + i * byteStride;
			const x = bufferData.readFloatLE(offset);
			const y = bufferData.readFloatLE(offset + 4);
			const z = bufferData.readFloatLE(offset + 8);

			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			minZ = Math.min(minZ, z);
			maxX = Math.max(maxX, x);
			maxY = Math.max(maxY, y);
			maxZ = Math.max(maxZ, z);
		}
	}

	// Create the bounding volume object
	const boundingVolume = {
		minX: minX,
		minY: minY,
		minZ: minZ,
		maxX: maxX,
		maxY: maxY,
		maxZ: maxZ,
	};

	return boundingVolume;
}

function calculateByteStride(indicesAccessor) {
	let byteStride = 12;
	const componentTypeSize = getComponentTypeSize(indicesAccessor.componentType);
	if (indicesAccessor.type === "VEC3") {
		byteStride = componentTypeSize * 3;
	} else if (indicesAccessor.type === "VEC2") {
		byteStride = componentTypeSize * 2;
	} else if (indicesAccessor.type === "SCALAR") {
		byteStride = componentTypeSize * 1;
	} else {
		return;
	}
	return byteStride;
}

function readIndices(
	indicesOffset,
	indicesByteStride,
	indicesBufferData,
	indicesAccessor,
) {
	let indicesList = [];
	for (let i = 0; i < indicesAccessor.count; i += 3) {
		let vertexIndices = [];
		for (let j = 0; j < 3; j++) {
			const vertexIndex = indicesBufferData.readUIntLE(
				indicesOffset + (i + j) * indicesByteStride,
				indicesByteStride,
			);
			vertexIndices.push(vertexIndex);
		}
		indicesList.push(vertexIndices);
	}
	return indicesList;
}
function convertIndicesIntoFlat(indicesList) {
	let indicesArrayFlatten = [];
	for (const vertex of indicesList) {
		for (let i = 0; i < vertex.length; i++) {
			indicesArrayFlatten.push(vertex[i]);
		}
	}
	return indicesArrayFlatten;
}

function readPosition(
	positionOffset,
	positionByteStride,
	positionBufferData,
	indicesList,
) {
	const positionVertexIndices = [];
	for (const vertexIndice of indicesList) {
		const vertexPosition = [];
		for (const vertexIndex of vertexIndice) {
			const vertexIndexPosition = [];
			const vertexIndexX = positionBufferData.readFloatLE(
				positionOffset + vertexIndex * positionByteStride,
			);
			vertexIndexPosition.push(vertexIndexX);
			const vertexIndexY = positionBufferData.readFloatLE(
				positionOffset + vertexIndex * positionByteStride + 4,
			);
			vertexIndexPosition.push(vertexIndexY);
			const vertexIndexZ = positionBufferData.readFloatLE(
				positionOffset + vertexIndex * positionByteStride + 8,
			);
			vertexIndexPosition.push(vertexIndexZ);

			vertexPosition.push(vertexIndexPosition);
		}
		positionVertexIndices.push(vertexPosition);
	}
	return positionVertexIndices;
}

function readPositionFlatten(
	positionOffset,
	positionByteStride,
	positionBufferData,
	indicesArrayFlatten,
) {
	let positionFlatten = [];
	for (const index of indicesArrayFlatten) {
		const vertexIndexX = positionBufferData.readFloatLE(
			positionOffset + index * positionByteStride,
		);
		positionFlatten.push(vertexIndexX);
		const vertexIndexY = positionBufferData.readFloatLE(
			positionOffset + index * positionByteStride + 4,
		);
		positionFlatten.push(vertexIndexY);
		const vertexIndexZ = positionBufferData.readFloatLE(
			positionOffset + index * positionByteStride + 8,
		);
		positionFlatten.push(vertexIndexZ);
	}
	return positionFlatten;
}

function readNormal(
	normalOffset,
	normalByteStride,
	normalBufferData,
	indicesList,
) {
	const normalVertexIndices = [];
	for (const vertexIndice of indicesList) {
		const vertexNormal = [];
		for (const vertexIndex of vertexIndice) {
			const vertexNormalIndex = [];
			const vertexNormalX = normalBufferData.readFloatLE(
				normalOffset + vertexIndex * normalByteStride,
			);
			vertexNormalIndex.push(vertexNormalX);
			const vertexNormalY = normalBufferData.readFloatLE(
				normalOffset + vertexIndex * normalByteStride + 4,
			);
			vertexNormalIndex.push(vertexNormalY);
			const vertexNormalZ = normalBufferData.readFloatLE(
				normalOffset + vertexIndex * normalByteStride + 8,
			);
			vertexNormalIndex.push(vertexNormalZ);
			vertexNormal.push(vertexNormalIndex);
		}
		normalVertexIndices.push(vertexNormal);
	}
	return normalVertexIndices;
}

function readNormalFlatten(
	normalOffset,
	normalByteStride,
	normalBufferData,
	indicesArrayFlatten,
) {
	const normalFlatten = [];
	for (const index of indicesArrayFlatten) {
		const vertexNormalX = normalBufferData.readFloatLE(
			normalOffset + index * normalByteStride,
		);
		normalFlatten.push(vertexNormalX);
		const vertexNormalY = normalBufferData.readFloatLE(
			normalOffset + index * normalByteStride + 4,
		);
		normalFlatten.push(vertexNormalY);
		const vertexNormalZ = normalBufferData.readFloatLE(
			normalOffset + index * normalByteStride + 8,
		);
		normalFlatten.push(vertexNormalZ);
	}
	return normalFlatten;
}

function readTexCoord(
	texcoorOffset,
	texcoorByteStride,
	texcoorBufferData,
	indicesList,
) {
	const texCoord = [];
	for (const vertexIndice of indicesList) {
		const vertexTexCoord = [];
		for (const vertexIndex of vertexIndice) {
			const TexU = texcoorBufferData.readFloatLE(
				texcoorOffset + vertexIndex * texcoorByteStride,
			);
			vertexTexCoord.push(TexU);
			const TexV = texcoorBufferData.readFloatLE(
				texcoorOffset + vertexIndex * texcoorByteStride + 4,
			);
			vertexTexCoord.push(TexV);
		}
		texCoord.push(vertexTexCoord);
	}
	return texCoord;
}

function readTexCoordFlatten(
	texcoorOffset,
	texcoorByteStride,
	texcoorBufferData,
	indicesArrayFlatten,
) {
	const texCoordArray = [];
	for (const index of indicesArrayFlatten) {
		const TexU = texcoorBufferData.readFloatLE(
			texcoorOffset + index * texcoorByteStride,
		);
		texCoordArray.push(TexU);
		const TexV = texcoorBufferData.readFloatLE(
			texcoorOffset + index * texcoorByteStride + 4,
		);
		texCoordArray.push(TexV);
	}
	return texCoordArray;
}

function calculateTrianglesInBoundingVolume(
	positionAccessorList,
	boundingVolume,
) {
	let count = 0;
	for (const vertex of positionAccessorList) {
		const vertex1 = vertex[0];
		const vertex2 = vertex[1];
		const vertex3 = vertex[2];
		const mid_x = (vertex1[0] + vertex2[0] + vertex3[0]) / 3;
		const mid_y = (vertex1[1] + vertex2[1] + vertex3[1]) / 3;
		const mid_z = (vertex1[2] + vertex2[2] + vertex3[2]) / 3;
		if (
			mid_x >= boundingVolume.minX &&
			mid_x <= boundingVolume.maxX &&
			mid_y >= boundingVolume.minY &&
			mid_y <= boundingVolume.maxY &&
			mid_z >= boundingVolume.minZ &&
			mid_z <= boundingVolume.maxZ
		) {
			count++;
		} else {
			continue;
		}
	}
	return count;
}
function writeUInt32LE(value, buffer, offset) {
	buffer.writeUInt32LE(value, offset);
}

function writeUInt16LE(value, buffer, offset) {
	buffer.writeUInt16LE(value, offset);
}

function writeFloatLE(value, buffer, offset) {
	buffer.writeFloatLE(value, offset);
}

function writeB3dmFile(
	indicesArrayFlatten,
	positionFlatten,
	normalFlatten,
	texcoordFlatten,
	outputPath,
) {
	const featureTableJSON = {
		BATCH_LENGTH: indicesArrayFlatten.length,
	};

	const featureTableJSONBuffer = Buffer.from(JSON.stringify(featureTableJSON));

	const featureTableBinary = Buffer.alloc(4);

	const batchTableJSON = {};

	const batchTableJSONBuffer = Buffer.from(JSON.stringify(batchTableJSON));

	const batchTableBinary = Buffer.alloc(0);

	const glbHeader = Buffer.alloc(20);
	writeUInt32LE(0x46546c67, glbHeader, 0); // magic
	writeUInt32LE(2, glbHeader, 4); // version
	writeUInt32LE(
		28 +
			8 +
			indicesArrayFlatten.length * 2 +
			positionFlatten.length * 4 +
			normalFlatten.length * 4 +
			texcoordFlatten.length * 4,
		glbHeader,
		8,
	); // total length

	const b3dmHeader = Buffer.alloc(28);
	writeUInt32LE(0x6d643362, b3dmHeader, 0); // magic
	writeUInt32LE(1, b3dmHeader, 4); // version
	writeUInt32LE(
		28 +
			8 +
			indicesArrayFlatten.length * 2 +
			positionFlatten.length * 4 +
			normalFlatten.length * 4 +
			texcoordFlatten.length * 4,
		b3dmHeader,
		8,
	); // total length
	writeUInt32LE(0, b3dmHeader, 12); // feature table JSON byte length
	writeUInt32LE(4, b3dmHeader, 16); // feature table binary byte length
	writeUInt32LE(0, b3dmHeader, 20); // batch table JSON byte length
	writeUInt32LE(0, b3dmHeader, 24); // batch table binary byte length

	const indicesBuffer = Buffer.alloc(indicesArrayFlatten.length * 2);
	for (let i = 0; i < indicesArrayFlatten.length; i++) {
		writeUInt16LE(indicesArrayFlatten[i], indicesBuffer, i * 2);
	}

	const positionsBuffer = Buffer.alloc(positionFlatten.length * 4);
	for (let i = 0; i < positionFlatten.length; i++) {
		writeFloatLE(positionFlatten[i], positionsBuffer, i * 4);
	}

	const normalsBuffer = Buffer.alloc(normalFlatten.length * 4);
	for (let i = 0; i < normalFlatten.length; i++) {
		writeFloatLE(normalFlatten[i], normalsBuffer, i * 4);
	}

	const texCoordsBuffer = Buffer.alloc(texcoordFlatten.length * 4);
	for (let i = 0; i < texcoordFlatten.length; i++) {
		writeFloatLE(texcoordFlatten[i], texCoordsBuffer, i * 4);
	}

	const b3dmBuffer = Buffer.concat([
		b3dmHeader,
		featureTableJSONBuffer,
		featureTableBinary,
		batchTableJSONBuffer,
		batchTableBinary,
		indicesBuffer,
		positionsBuffer,
		normalsBuffer,
		texCoordsBuffer,
	]);

	const glbBuffer = Buffer.concat([glbHeader, b3dmBuffer]);

	fs.writeFileSync(outputPath, glbBuffer);
}

// // Example usage
// const indices = [0, 1, 2, 3]; // Replace with your actual indices
// const positions = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3]; // Replace with your actual positions
// const normals = [0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1]; // Replace with your actual normals
// const texCoords = [0, 0, 0, 1, 1, 1, 1, 0]; // Replace with your actual texture coordinates
// const outputPath = "output.b3dm"; // Replace with your desired output path

// writeB3dmFile(indices, positions, normals, texCoords, outputPath);

// need to change everything into flattened format
const outputPath = "output.b3dm";
const gltfFilePath = "/home/hieuvu/DATN/Map_Cesium/gltf/Gear2.gltf";
const gltf = ParseGLTF(gltfFilePath);
const boundingVolume = calculateBoundingVolume(gltfFilePath);
console.log(boundingVolume);
for (const mesh of gltf.meshes) {
	for (const primitive of mesh.primitives) {
		if (primitive.mode === 4) {
			const indicesAccessor = gltf.accessors[primitive.indices];
			const positionAccessor = gltf.accessors[primitive.attributes.POSITION];
			const normalAccessor = gltf.accessors[primitive.attributes.NORMAL];
			const texcoorAccessor = gltf.accessors[primitive.attributes.TEXCOORD_0];

			const indicesBufferView = gltf.bufferViews[indicesAccessor.bufferView];
			const positionBufferView = gltf.bufferViews[positionAccessor.bufferView];
			const normalBufferView = gltf.bufferViews[normalAccessor.bufferView];
			const texcoorBufferView = gltf.bufferViews[texcoorAccessor.bufferView];

			const indicesBuffer = gltf.buffers[indicesBufferView.buffer];
			const positionBuffer = gltf.buffers[positionBufferView.buffer];
			const normalBuffer = gltf.buffers[normalBufferView.buffer];
			const texcoorBuffer = gltf.buffers[texcoorBufferView.buffer];

			const indicesOffset =
				indicesBufferView.byteOffset + indicesAccessor.byteOffset;
			const positionOffset =
				positionBufferView.byteOffset + positionAccessor.byteOffset;
			const normalOffset =
				normalBufferView.byteOffset + normalAccessor.byteOffset;
			const texcoorOffset =
				texcoorBufferView.byteOffset + texcoorAccessor.byteOffset;

			const indicesBufferData = readBinFile(indicesBuffer.uri);
			const positionBufferData = readBinFile(positionBuffer.uri);
			const normalBufferData = readBinFile(normalBuffer.uri);
			const texcoorBufferData = readBinFile(texcoorBuffer.uri);

			const indicesByteStride = calculateByteStride(indicesAccessor);
			const positionByteStride = calculateByteStride(positionAccessor);
			const normalByteStride = calculateByteStride(normalAccessor);
			const texcoorByteStride = calculateByteStride(texcoorAccessor);

			const indicesList = readIndices(
				indicesOffset,
				indicesByteStride,
				indicesBufferData,
				indicesAccessor,
			);
			const indicesArrayFlatten = convertIndicesIntoFlat(indicesList);
			const positionFlatten = readPositionFlatten(
				positionOffset,
				positionByteStride,
				positionBufferData,
				indicesArrayFlatten,
			);
			const normalFlatten = readNormalFlatten(
				normalOffset,
				normalByteStride,
				normalBufferData,
				indicesArrayFlatten,
			);
			const texcoordFlatten = readTexCoordFlatten(
				texcoorOffset,
				texcoorByteStride,
				texcoorBufferData,
				indicesArrayFlatten,
			);
			// console.log(indicesArrayFlatten);
			// console.log(positionFlatten);
			// console.log(normalFlatten);
			// console.log(texcoordFlatten);

			// writeB3dmFile(
			// 	indicesArrayFlatten,
			// 	positionFlatten,
			// 	normalFlatten,
			// 	texcoordFlatten,
			// 	outputPath,
			// );
		}
	}
}
