const fs = require("fs");

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

function calculateTriangles(gltfPath) {
	const triangles = [];

	const gltfData = fs.readFileSync(gltfPath);
	const gltf = JSON.parse(gltfData);

	for (const mesh of gltf.meshes) {
		for (const primitive of mesh.primitives) {
			if (primitive.mode === 4) {
				const indicesAccessor = gltf.accessors[primitive.indices];
				const indicesBufferView = gltf.bufferViews[indicesAccessor.bufferView];
				const indicesBuffer = gltf.buffers[indicesBufferView.buffer];

				const indicesOffset =
					indicesBufferView.byteOffset + indicesAccessor.byteOffset;

				let indicesBufferData = readBinFile(indicesBuffer.uri);

				let byteStride = 12;
				if (indicesAccessor.type === "VEC3") {
					byteStride = 12;
				} else if (indicesAccessor.type === "VEC2") {
					byteStride = 4;
				} else if (indicesAccessor.type === "SCALAR") {
					byteStride = 1;
				} else {
					continue;
				}
				// const indicesData = indicesBufferData.slice(
				// 	indicesOffset,
				// 	indicesOffset + indicesAccessor.count * byteStride,
				// );
				const indicesData = Buffer.alloc(indicesAccessor.count * byteStride);
				indicesBufferData.copy(
					indicesData,
					0,
					indicesOffset,
					indicesOffset + indicesData.length,
				);

				let componentTypeSize = getComponentTypeSize(
					indicesAccessor.componentType,
				);
				//console.log(indicesData.length);
				for (let i = 0; i < indicesData.length; i += componentTypeSize) {
					const vertexIndices = [];

					for (let j = 0; j < componentTypeSize; j += byteStride) {
						if (
							i + j == indicesData.length - 2 ||
							i + j > indicesData.length - 2
						) {
							return triangles;
						} else {
							const vertexIndex = indicesData.readUIntLE(
								i + j,
								componentTypeSize,
							);
							//console.log(vertexIndex);
							vertexIndices.push(vertexIndex);
						}
					}
					triangles.push(vertexIndices);
				}
			}
		}
	}

	return triangles;
}

// Example usage
const gltfPath = "/home/hieuvu/DATN/Map_Cesium/gltf/Gear2.gltf";
const triangles = calculateTriangles(gltfPath);
console.log(`Total triangles: `, triangles.length);
