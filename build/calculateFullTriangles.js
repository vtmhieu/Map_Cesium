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

function CalculateMidTriangle(triangleIndices, indicesBufferData, byteStride) {
	const vertex1Index = triangleIndices[0];
	const vertex2Index = triangleIndices[1];
	const vertex3Index = triangleIndices[2];

	const vertex1Offset = vertex1Index * byteStride;
	const vertex2Offset = vertex2Index * byteStride;
	const vertex3Offset = vertex3Index * byteStride;

	// const vertex1X = indicesBufferData.readFloatLE(vertex1Offset);
	// const vertex1Y = indicesBufferData.readFloatLE(vertex1Offset + 4);
	// const vertex1Z = indicesBufferData.readFloatLE(vertex1Offset + 8);

	// const vertex2X = indicesBufferData.readFloatLE(vertex2Offset);
	// const vertex2Y = indicesBufferData.readFloatLE(vertex2Offset + 4);
	// const vertex2Z = indicesBufferData.readFloatLE(vertex2Offset + 8);

	// const vertex3X = indicesBufferData.readFloatLE(vertex3Offset);
	// const vertex3Y = indicesBufferData.readFloatLE(vertex3Offset + 4);
	// const vertex3Z = indicesBufferData.readFloatLE(vertex3Offset + 8);

	vertex1X = indicesBufferData.readUInt16LE(vertex1Offset) / 65535;
	vertex1Y = indicesBufferData.readUInt16LE(vertex1Offset + 2) / 65535;
	vertex1Z = indicesBufferData.readUInt16LE(vertex1Offset + 4) / 65535;

	vertex2X = indicesBufferData.readUInt16LE(vertex2Offset) / 65535;
	vertex2Y = indicesBufferData.readUInt16LE(vertex2Offset + 2) / 65535;
	vertex2Z = indicesBufferData.readUInt16LE(vertex2Offset + 4) / 65535;

	vertex3X = indicesBufferData.readUInt16LE(vertex3Offset) / 65535;
	vertex3Y = indicesBufferData.readUInt16LE(vertex3Offset + 2) / 65535;
	vertex3Z = indicesBufferData.readUInt16LE(vertex3Offset + 4) / 65535;

	const midX = (vertex1X + vertex2X + vertex3X) / 3;
	const midY = (vertex1Y + vertex2Y + vertex3Y) / 3;
	const midZ = (vertex1Z + vertex2Z + vertex3Z) / 3;

	return { x: midX, y: midY, z: midZ };
}
function calculateTriangles(gltfPath) {
	const triangles = [];

	const gltfData = fs.readFileSync(gltfPath);
	const gltf = JSON.parse(gltfData);
	let boundingVolume = calculateBoundingVolume(gltfPath);
	let trianglesInBoundingVolume = 0;
	for (const mesh of gltf.meshes) {
		for (const primitive of mesh.primitives) {
			if (primitive.mode === 4) {
				const indicesAccessor = gltf.accessors[primitive.indices];
				const indicesBufferView = gltf.bufferViews[indicesAccessor.bufferView];
				const indicesBuffer = gltf.buffers[indicesBufferView.buffer];

				const indicesOffset =
					indicesBufferView.byteOffset + indicesAccessor.byteOffset;

				let indicesBufferData = readBinFile(indicesBuffer.uri);
				let componentTypeSize = getComponentTypeSize(
					indicesAccessor.componentType,
				);
				let byteStride = 12;
				if (indicesAccessor.type === "VEC3") {
					byteStride = componentTypeSize * 3;
				} else if (indicesAccessor.type === "VEC2") {
					byteStride = componentTypeSize * 2;
				} else if (indicesAccessor.type === "SCALAR") {
					byteStride = componentTypeSize * 1;
				} else {
					continue;
				}
				// const indicesData = indicesBufferData.slice(
				// 	indicesOffset,
				// 	indicesOffset + indicesAccessor.count * byteStride,
				// );

				//console.log(indicesData.length);
				for (let i = 0; i < indicesAccessor.count; i += 3) {
					const vertexIndices = [];

					for (let j = 0; j < 3; j++) {
						const vertexIndex = indicesBufferData.readUIntLE(
							indicesOffset + (i + j) * byteStride,
							byteStride,
						);
						//console.log(vertexIndex);
						vertexIndices.push(vertexIndex);
					}
					triangles.push(vertexIndices);
					triangleMidPoint = CalculateMidTriangle(
						vertexIndices,
						indicesBufferData,
						byteStride,
					);

					//check if the number of triangles in bounding volume is == the total number in file
					if (
						triangleMidPoint.x >= boundingVolume.minX &&
						triangleMidPoint.x <= boundingVolume.maxX &&
						triangleMidPoint.y >= boundingVolume.minY &&
						triangleMidPoint.y <= boundingVolume.maxY &&
						triangleMidPoint.z >= boundingVolume.minZ &&
						triangleMidPoint.z <= boundingVolume.maxZ
					) {
						trianglesInBoundingVolume++;
					} else {
						continue;
					}
				}
			}
		}
	}
	console.log(
		"Total triangles in Bounding Volume: ",
		trianglesInBoundingVolume,
	);
	return triangles;
}

// Example usage
const gltfPath = "/home/hieuvu/DATN/Map_Cesium/gltf/Gear2.gltf";
const triangles = calculateTriangles(gltfPath);
console.log(`Total triangles: `, triangles.length);
