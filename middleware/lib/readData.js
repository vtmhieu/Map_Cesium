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
	} else if (uri.startsWith("data:application/gltf-buffer;base64")) {
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

function readPositionNotIndex(
	positionOffset,
	positionByteStride,
	positionBufferData,
	indicesMax,
) {
	let positionList = [];
	for (let vertexIndex = 0; vertexIndex <= indicesMax; vertexIndex++) {
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
		positionList.push(vertexIndexPosition);
	}
	return positionList;
}

function readPositionNoIndices(
	positionOffset,
	positionByteStride,
	positionBufferData,
	count,
) {
	let positionList = [];
	for (let vertexIndex = 0; vertexIndex < count; vertexIndex++) {
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
		positionList.push(vertexIndexPosition);
	}
	return positionList;
}

function readNormalNotIndex(
	normalOffset,
	normalByteStride,
	normalData,
	indicesMax,
) {
	let normalList = [];
	for (let index = 0; index <= indicesMax; index++) {
		const normal = [];
		const normalX = normalData.readFloatLE(
			normalOffset + index * normalByteStride,
		);
		normal.push(normalX);
		const normalY = normalData.readFloatLE(
			normalOffset + index * normalByteStride + 4,
		);
		normal.push(normalY);
		const normalZ = normalData.readFloatLE(
			normalOffset + index * normalByteStride + 8,
		);
		normal.push(normalZ);
		normalList.push(normal);
	}
	return normalList;
}

function readNormalNoIndices(
	normalOffset,
	normalByteStride,
	normalData,
	count,
) {
	let normalList = [];
	for (let index = 0; index < count; index++) {
		const normal = [];
		const normalX = normalData.readFloatLE(
			normalOffset + index * normalByteStride,
		);
		normal.push(normalX);
		const normalY = normalData.readFloatLE(
			normalOffset + index * normalByteStride + 4,
		);
		normal.push(normalY);
		const normalZ = normalData.readFloatLE(
			normalOffset + index * normalByteStride + 8,
		);
		normal.push(normalZ);
		normalList.push(normal);
	}
	return normalList;
}

function readColorNoIndices(colorOffset, colorByteStride, colorData, count) {
	let colorList = [];
	for (let index = 0; index < count; index++) {
		const color = [];
		const colorX = colorData.readFloatLE(colorOffset + index * colorByteStride);
		color.push(colorX);
		const colorY = colorData.readFloatLE(
			colorOffset + index * colorByteStride + 4,
		);
		color.push(colorY);
		const colorZ = colorData.readFloatLE(
			colorOffset + index * colorByteStride + 8,
		);
		color.push(colorZ);
		colorList.push(color);
	}
	return colorList;
}
module.exports = {
	ParseGLTF,
	parseDataFromURI,
	readIndices,
	readPosition,
	readPositionNotIndex,
	readPositionNoIndices,
	readNormalNotIndex,
	readNormalNoIndices,
	readColorNoIndices,
};
