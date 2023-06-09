const fs = require("fs");

function ParseGLTF(gltfPath) {
	const gltfData = fs.readFileSync(gltfPath);
	const gltf = JSON.parse(gltfData);
	return gltf;
}

function parseDataFromURI(uri) {
	if (uri.startsWith("data:application/octet-stream;base64")) {
		// First circumstance: Base64 encoded data
		const dataPrefix = "base64,";
		const base64Data = uri.substring(
			uri.indexOf(dataPrefix) + dataPrefix.length,
		);
		const decodedData = Buffer.from(base64Data, "base64");
		return decodedData;
	} else if (uri.endsWith(".bin")) {
		// Second circumstance: Binary file URI
		// Use your existing function to read the data from the file
		const rawData = fs.readFileSync(uri);
		const typedArray = Buffer.from(rawData);
		return typedArray;
	} else {
		// Invalid or unsupported URI format
		throw new Error("Invalid URI format");
	}
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

function calculateByteStride(Accessor) {
	let byteStride = 12;
	const componentTypeSize = getComponentTypeSize(Accessor.componentType);
	if (Accessor.type === "VEC3") {
		byteStride = componentTypeSize * 3;
	} else if (Accessor.type === "VEC2") {
		byteStride = componentTypeSize * 2;
	} else if (Accessor.type === "SCALAR") {
		byteStride = componentTypeSize * 1;
	} else {
		return;
	}
	return byteStride;
}
const gltfFilePath = "/home/hieuvu/DATN/Map_Cesium/gltf/Box.gltf";
function read(gltfFilePath) {
	gltf = ParseGLTF(gltfFilePath);
	for (const mesh of gltf.meshes) {
		for (const primitive of mesh.primitives) {
			if (primitive.mode === 4) {
				//accessor
				const indicesAccessor = gltf.accessors[primitive.indices];
				const normalAccessor = gltf.accessors[primitive.attributes.NORMAL];
				const positionAccessor = gltf.accessors[primitive.attributes.POSITION];
				const materialAccessor = gltf.accessors[primitive.material];

				//buffer view
				const indicesBufferView = gltf.bufferViews[indicesAccessor.bufferView];
				const normalBufferView = gltf.bufferViews[normalAccessor.bufferView];
				const positionBufferView =
					gltf.bufferViews[positionAccessor.bufferView];
				const materialBufferView =
					gltf.bufferViews[materialAccessor.bufferView];

				//buffer data
				const indicesBuffer = gltf.buffers[indicesBufferView.buffer];
				const normalBuffer = gltf.buffers[normalBufferView.buffer];
				const positionBuffer = gltf.buffers[positionBufferView.buffer];
				const materialBuffer = gltf.buffers[materialBufferView.buffer];

				//data from buffer
				const indicesBufferData = parseDataFromURI(indicesBuffer.uri);
				const normalBufferData = parseDataFromURI(normalBuffer.uri);
				const positionBufferData = parseDataFromURI(positionBuffer.uri);
				const materialBufferData = parseDataFromURI(materialBuffer.uri);

				//Offset
				const indicesOffset =
					indicesBufferView.byteOffset + indicesAccessor.byteOffset;
				const normalOffset =
					normalBufferView.byteOffset + normalAccessor.byteOffset;
				const positionOffset =
					positionBufferView.byteOffset + positionAccessor.byteOffset;
				const materialOffset =
					materialBufferView.byteOffset + materialAccessor.byteOffset;

				//ByteStride
				const indicesByteStride = calculateByteStride(indicesAccessor);
				const normalByteStride = calculateByteStride(normalAccessor);
				const positionByteStride = calculateByteStride(positionAccessor);
				const materialByteStride = calculateByteStride(materialAccessor);

				//read indices
				const indicesList = readIndices(
					indicesOffset,
					indicesByteStride,
					indicesBufferData,
					indicesAccessor,
				);
				console.log(indicesList);
			}
		}
	}
}

read(gltfFilePath);
