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
		const componentTypeSize = getComponentTypeSize(accessor.componentType);
		let byteStride = 12;
		if (accessor.type === "VEC3") {
			byteStride = componentTypeSize * 3;
		} else if (accessor.type === "VEC2") {
			byteStride = componentTypeSize * 2;
		} else if (accessor.type === "SCALAR") {
			byteStride = componentTypeSize * 1;
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
function ByteStride(indicesAccessor) {
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

function divideOctree(boundingVolume) {
	midX = (boundingVolume.minX + boundingVolume.maxX) / 2;
	midY = (boundingVolume.minY + boundingVolume.maxY) / 2;
	midZ = (boundingVolume.minZ + boundingVolume.maxZ) / 2;
	return { midX: midX, midY: midY, midZ: midZ };
}

function CalculateMidTriangle(triangleIndices, indicesBufferData, byteStride) {
	const vertex1Index = triangleIndices[0];
	const vertex2Index = triangleIndices[1];
	const vertex3Index = triangleIndices[2];

	const vertex1Offset = vertex1Index * byteStride;
	const vertex2Offset = vertex2Index * byteStride;
	const vertex3Offset = vertex3Index * byteStride;

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

let Tiles = [];
//Tiles.push(structTile);

function calculateTriangles(gltfFilePath, boundingVolume, maxTrianglesPerTile) {
	let tri_000 = 0;
	let tri_001 = 0;
	let tri_010 = 0;
	let tri_011 = 0;
	let tri_100 = 0;
	let tri_101 = 0;
	let tri_110 = 0;
	let tri_111 = 0;

	let indiceList000 = [];
	let indiceList001 = [];
	let indiceList010 = [];
	let indiceList011 = [];
	let indiceList100 = [];
	let indiceList101 = [];
	let indiceList110 = [];
	let indiceList111 = [];

	let gltf = ParseGLTF(gltfFilePath);
	//let boundingVolume = calculateBoundingVolume(gltfFilePath);
	let middle = divideOctree(boundingVolume);
	for (const mesh of gltf.meshes) {
		for (const primitive of mesh.primitives) {
			if (primitive.mode === 4) {
				const indicesAccessor = gltf.accessors[primitive.indices];
				const indicesBufferView = gltf.bufferViews[indicesAccessor.bufferView];
				const indicesBuffer = gltf.buffers[indicesBufferView.buffer];

				const indicesOffset =
					indicesBufferView.byteOffset + indicesAccessor.byteOffset;

				const indicesBufferData = readBinFile(indicesBuffer.uri);
				const byteStride = calculateByteStride(indicesAccessor);

				for (let i = 0; i < indicesAccessor.count; i += 3) {
					const triangleIndices = [];
					for (let j = 0; j < 3; j++) {
						const vertexIndex = indicesBufferData.readUIntLE(
							indicesOffset + (i + j) * byteStride,
							byteStride,
						);
						triangleIndices.push(vertexIndex);
					}
					triangleMidPoint = CalculateMidTriangle(
						triangleIndices,
						indicesBufferData,
						byteStride,
					);
					if (triangleMidPoint.x > middle.midX) {
						if (triangleMidPoint.y > middle.midY) {
							if (triangleMidPoint.z > middle.midZ) {
								tri_111++;
								indiceList111.push(triangleIndices);
							} else {
								tri_110++;
								indiceList110.push(triangleIndices);
							}
						} else {
							if (triangleMidPoint.z > middle.midZ) {
								tri_101++;
								indiceList101.push(triangleIndices);
							} else {
								tri_100++;
								indiceList100.push(triangleIndices);
							}
						}
					} else {
						if (triangleMidPoint.y > middle.midY) {
							if (triangleMidPoint.z > middle.midZ) {
								tri_011++;
								indiceList011.push(triangleIndices);
							} else {
								tri_010++;
								indiceList010.push(triangleIndices);
							}
						} else {
							if (triangleMidPoint.z > middle.midZ) {
								tri_001++;
								indiceList001.push(triangleIndices);
							} else {
								tri_000++;
								indiceList000.push(triangleIndices);
							}
						}
					}
				}
				Tiles.push({
					level: 0,
					boundingVolume: {
						minX: boundingVolume.minX,
						minY: boundingVolume.minY,
						minZ: boundingVolume.minZ,
						maxX: middle.midX,
						maxY: middle.midY,
						maxZ: middle.midZ,
					},
					NumberOfTriangles: tri_000,
					IndiceList: indiceList000,
				});

				Tiles.push({
					level: 0,
					boundingVolume: {
						minX: boundingVolume.minX,
						minY: boundingVolume.minY,
						minZ: middle.midZ,
						maxX: middle.midX,
						maxY: middle.midY,
						maxZ: boundingVolume.maxZ,
					},
					NumberOfTriangles: tri_001,
					IndiceList: indiceList001,
				});

				Tiles.push({
					level: 0,
					boundingVolume: {
						minX: boundingVolume.minX,
						minY: middle.midY,
						minZ: boundingVolume.minZ,
						maxX: middle.midX,
						maxY: boundingVolume.maxY,
						maxZ: middle.midZ,
					},
					NumberOfTriangles: tri_010,
					IndiceList: indiceList010,
				});

				Tiles.push({
					level: 0,
					boundingVolume: {
						minX: boundingVolume.minX,
						minY: middle.midY,
						minZ: middle.midZ,
						maxX: middle.midX,
						maxY: boundingVolume.maxY,
						maxZ: boundingVolume.maxZ,
					},
					NumberOfTriangles: tri_011,
					IndiceList: indiceList011,
				});

				Tiles.push({
					level: 0,
					boundingVolume: {
						minX: middle.midX,
						minY: boundingVolume.minY,
						minZ: boundingVolume.minZ,
						maxX: boundingVolume.maxX,
						maxY: middle.midY,
						maxZ: middle.midZ,
					},
					NumberOfTriangles: tri_100,
					IndiceList: indiceList100,
				});

				Tiles.push({
					level: 0,
					boundingVolume: {
						minX: middle.midX,
						minY: boundingVolume.minY,
						minZ: middle.midZ,
						maxX: boundingVolume.maxX,
						maxY: middle.midY,
						maxZ: boundingVolume.maxZ,
					},
					NumberOfTriangles: tri_101,
					IndiceList: indiceList101,
				});

				Tiles.push({
					level: 0,
					boundingVolume: {
						minX: middle.midX,
						minY: middle.midY,
						minZ: boundingVolume.minZ,
						maxX: boundingVolume.maxX,
						maxY: boundingVolume.maxY,
						maxZ: middle.midZ,
					},
					NumberOfTriangles: tri_110,
					IndiceList: indiceList110,
				});

				Tiles.push({
					level: 0,
					boundingVolume: {
						minX: middle.midX,
						minY: middle.midY,
						minZ: middle.midZ,
						maxX: boundingVolume.maxX,
						maxY: boundingVolume.maxY,
						maxZ: boundingVolume.maxZ,
					},
					NumberOfTriangles: tri_111,
					IndiceList: indiceList111,
				});

				//return Tiles;
				repeated(Tiles, maxTrianglesPerTile, indicesBufferData, byteStride);
			}
		}
	}
	return Tiles;
}

function repeated(tiles, maxTrianglesPerTile, indicesBufferData, byteStride) {
	let i = 0;
	while (i < tiles.length) {
		if (tiles[i].NumberOfTriangles > maxTrianglesPerTile) {
			let tile = tiles[i];
			tiles.splice(i, 1); // Remove the element at index i

			// console.log(
			// 	"Processing tile with more triangles than the threshold:",
			// 	tile,
			// );

			//let tile = tiles.shift();
			//calculateTriangles(gltfFilePath, tile.boundingVolume);
			calculateBasedOnIndiceList(
				tile.IndiceList,
				indicesBufferData,
				byteStride,
				tile.boundingVolume,
				tile.level,
			);
		} else if (tiles[i].NumberOfTriangles === 0) {
			tiles.splice(i, 1);
		} else {
			i++;
		}
	}

	//repeated(tiles, maxTrianglesPerTile, indicesBufferData, byteStride);
	return tiles;
}
function calculateBasedOnIndiceList(
	triangleIndicesList,
	indicesBufferData,
	byteStride,
	boundingVolume,
	level,
) {
	let tri_000 = 0;
	let tri_001 = 0;
	let tri_010 = 0;
	let tri_011 = 0;
	let tri_100 = 0;
	let tri_101 = 0;
	let tri_110 = 0;
	let tri_111 = 0;

	let indiceList000 = [];
	let indiceList001 = [];
	let indiceList010 = [];
	let indiceList011 = [];
	let indiceList100 = [];
	let indiceList101 = [];
	let indiceList110 = [];
	let indiceList111 = [];

	let middle = divideOctree(boundingVolume);
	for (i = 0; i < triangleIndicesList.length; i++) {
		triangleIndices = triangleIndicesList[i];
		triangleMidPoint = CalculateMidTriangle(
			triangleIndices,
			indicesBufferData,
			byteStride,
		);
		if (
			triangleMidPoint.x > middle.midX &&
			triangleMidPoint.x <= boundingVolume.maxX
		) {
			if (
				triangleMidPoint.y > middle.midY &&
				triangleMidPoint.y <= boundingVolume.maxY
			) {
				if (
					triangleMidPoint.z > middle.midZ &&
					triangleMidPoint.z <= boundingVolume.maxZ
				) {
					tri_111++;
					indiceList111.push(triangleIndices);
				} else {
					tri_110++;
					indiceList110.push(triangleIndices);
				}
			} else {
				if (triangleMidPoint.z > middle.midZ) {
					tri_101++;
					indiceList101.push(triangleIndices);
				} else {
					tri_100++;
					indiceList100.push(triangleIndices);
				}
			}
		} else {
			if (triangleMidPoint.y > middle.midY) {
				if (triangleMidPoint.z > middle.midZ) {
					tri_011++;
					indiceList011.push(triangleIndices);
				} else {
					tri_010++;
					indiceList010.push(triangleIndices);
				}
			} else {
				if (triangleMidPoint.z > middle.midZ) {
					tri_001++;
					indiceList001.push(triangleIndices);
				} else {
					tri_000++;
					indiceList000.push(triangleIndices);
				}
			}
		}
	}
	let Level = level + 1;
	Tiles.push({
		level: Level,
		boundingVolume: {
			minX: boundingVolume.minX,
			minY: boundingVolume.minY,
			minZ: boundingVolume.minZ,
			maxX: middle.midX,
			maxY: middle.midY,
			maxZ: middle.midZ,
		},
		NumberOfTriangles: tri_000,
		IndiceList: indiceList000,
	});

	Tiles.push({
		level: Level,
		boundingVolume: {
			minX: boundingVolume.minX,
			minY: boundingVolume.minY,
			minZ: middle.midZ,
			maxX: middle.midX,
			maxY: middle.midY,
			maxZ: boundingVolume.maxZ,
		},
		NumberOfTriangles: tri_001,
		IndiceList: indiceList001,
	});

	Tiles.push({
		level: Level,
		boundingVolume: {
			minX: boundingVolume.minX,
			minY: middle.midY,
			minZ: boundingVolume.minZ,
			maxX: middle.midX,
			maxY: boundingVolume.maxY,
			maxZ: middle.midZ,
		},
		NumberOfTriangles: tri_010,
		IndiceList: indiceList010,
	});

	Tiles.push({
		level: Level,
		boundingVolume: {
			minX: boundingVolume.minX,
			minY: middle.midY,
			minZ: middle.midZ,
			maxX: middle.midX,
			maxY: boundingVolume.maxY,
			maxZ: boundingVolume.maxZ,
		},
		NumberOfTriangles: tri_011,
		IndiceList: indiceList011,
	});

	Tiles.push({
		level: Level,
		boundingVolume: {
			minX: middle.midX,
			minY: boundingVolume.minY,
			minZ: boundingVolume.minZ,
			maxX: boundingVolume.maxX,
			maxY: middle.midY,
			maxZ: middle.midZ,
		},
		NumberOfTriangles: tri_100,
		IndiceList: indiceList100,
	});

	Tiles.push({
		level: Level,
		boundingVolume: {
			minX: middle.midX,
			minY: boundingVolume.minY,
			minZ: middle.midZ,
			maxX: boundingVolume.maxX,
			maxY: middle.midY,
			maxZ: boundingVolume.maxZ,
		},
		NumberOfTriangles: tri_101,
		IndiceList: indiceList101,
	});

	Tiles.push({
		level: Level,
		boundingVolume: {
			minX: middle.midX,
			minY: middle.midY,
			minZ: boundingVolume.minZ,
			maxX: boundingVolume.maxX,
			maxY: boundingVolume.maxY,
			maxZ: middle.midZ,
		},
		NumberOfTriangles: tri_110,
		IndiceList: indiceList110,
	});

	Tiles.push({
		level: Level,
		boundingVolume: {
			minX: middle.midX,
			minY: middle.midY,
			minZ: middle.midZ,
			maxX: boundingVolume.maxX,
			maxY: boundingVolume.maxY,
			maxZ: boundingVolume.maxZ,
		},
		NumberOfTriangles: tri_111,
		IndiceList: indiceList111,
	});
}

const gltfFilePath = "/home/hieuvu/DATN/Map_Cesium/gltf/Gear2.gltf";
let boundingVolume = calculateBoundingVolume(gltfFilePath);
const result = calculateTriangles(gltfFilePath, boundingVolume, 1000);
let numeTri = 0;
// for (let i = 0; i < result.length; i++) {
// 	if (result[i].NumberOfTriangles === 0) {
// 		result.splice(i, 1); // Remove the element at index i
// 		i--;
// 	}
// }

for (let i = 0; i < result.length; i++) {
	numeTri += result[i].NumberOfTriangles;
}
//console.log(result);
//console.log("Number of Tiles: " + result.length);

// for (let i = 0; i < result.length; i++) {
// 	console.log(
// 		"Tile:",
// 		i,
// 		"; level:",
// 		result[i].level,
// 		"; Bounding Volume of Tile: ",
// 		result[i].boundingVolume,
// 		"; number of triangles in tile",
// 		result[i].NumberOfTriangles,
// 	);
// }
console.log("Number of Tiles: " + result.length);
console.log("Total number of triangles: " + numeTri);
console.log(result[0]);
