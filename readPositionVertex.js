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
			const vertexNormalX = normalBufferData.readFloatLE(
				normalOffset + vertexIndex * normalByteStride,
			);
			vertexNormal.push(vertexNormalX);
			const vertexNormalY = normalBufferData.readFloatLE(
				normalOffset + vertexIndex * normalByteStride + 4,
			);
			vertexNormal.push(vertexNormalY);
			const vertexNormalZ = normalBufferData.readFloatLE(
				normalOffset + vertexIndex * normalByteStride + 8,
			);
			vertexNormal.push(vertexNormalZ);
		}
		normalVertexIndices.push(vertexNormal);
	}
	return normalVertexIndices;
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
const gltfFilePath = "/home/hieuvu/DATN/Map_Cesium/gltf/Gear2.gltf";
const gltf = ParseGLTF(gltfFilePath);
const boundingVolume = calculateBoundingVolume(gltfFilePath);
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
			const positionAccessorList = readPosition(
				positionOffset,
				positionByteStride,
				positionBufferData,
				indicesList,
			);
			const normalVertexIndices = readNormal(
				normalOffset,
				normalByteStride,
				normalBufferData,
				indicesList,
			);
			const texCoord = readTexCoord(
				texcoorOffset,
				texcoorByteStride,
				texcoorBufferData,
				indicesList,
			);

			//console.log(positionAccessorList);
			let numberOfTri = calculateTrianglesInBoundingVolume(
				positionAccessorList,
				boundingVolume,
			);
			console.log(numberOfTri);
		}
	}
}
