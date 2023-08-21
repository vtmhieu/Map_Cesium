const Cesium = require("cesium");

function boundingVolume(gltf) {
	let minX = Infinity;
	let minY = Infinity;
	let minZ = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	let maxZ = -Infinity;

	//calculate the best bounding volume
	for (const mesh of gltf.meshes) {
		for (const primitive of mesh.primitives) {
			if (primitive.mode === 4) {
				let accessor = gltf.accessors[primitive.attributes.POSITION];

				minX = Math.min(minX, accessor.min[0]);
				minY = Math.min(minY, accessor.min[1]);
				minZ = Math.min(minZ, accessor.min[2]);
				maxX = Math.max(maxX, accessor.max[0]);
				maxY = Math.max(maxY, accessor.max[1]);
				maxZ = Math.max(maxZ, accessor.max[2]);
			} else {
				continue;
			}
		}
	}
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

function calculateBoxTilesetYupZup(boundingVolume) {
	let box = [];
	box.push((boundingVolume.minX + boundingVolume.maxX) / 2);
	box.push((boundingVolume.minZ + boundingVolume.maxZ) / 2);
	box.push((boundingVolume.minY + boundingVolume.maxY) / 2);

	box.push((boundingVolume.maxZ - boundingVolume.minZ) / 2);
	box.push(0);
	box.push(0);

	box.push(0);
	box.push((boundingVolume.maxX - boundingVolume.minX) / 2);
	box.push(0);

	box.push(0);
	box.push(0);
	box.push((boundingVolume.maxY - boundingVolume.minY) / 2);

	return box;
}
function rootBoundingBox(boundingVolume) {
	let box = [];
	box.push(0);
	box.push(0);
	box.push((boundingVolume.minY + boundingVolume.maxY) / 2);

	box.push((boundingVolume.maxX - boundingVolume.minX) / 2);
	box.push(0);
	box.push(0);

	box.push(0);
	box.push((boundingVolume.maxZ - boundingVolume.minZ) / 2);
	box.push(0);

	box.push(0);
	box.push(0);
	box.push((boundingVolume.maxY - boundingVolume.minY) / 2);
	return box;
}

function calculateBoxTileset(boundingVolume) {
	let box = [];
	box.push((boundingVolume.minX + boundingVolume.maxX) / 2);
	box.push((boundingVolume.minY + boundingVolume.maxY) / 2);
	box.push((boundingVolume.minZ + boundingVolume.maxZ) / 2);
	box.push((boundingVolume.maxX - boundingVolume.minX) / 2);
	box.push((boundingVolume.minY + boundingVolume.maxY) / 2);
	box.push((boundingVolume.minZ + boundingVolume.maxZ) / 2);
	box.push((boundingVolume.minX + boundingVolume.maxX) / 2);
	box.push((boundingVolume.maxY - boundingVolume.minY) / 2);
	box.push((boundingVolume.maxZ + boundingVolume.minZ) / 2);
	box.push((boundingVolume.minX + boundingVolume.maxX) / 2);
	box.push((boundingVolume.minY + boundingVolume.maxY) / 2);
	box.push((boundingVolume.maxZ - boundingVolume.minZ) / 2);

	return box;
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
function ByteStride(Accessor) {
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

function calculateOffset(BufferView, Accessor) {
	let offset = 0;
	if (BufferView.byteOffset == null) {
		if (Accessor.byteOffset == null) {
			offset = 0;
		} else {
			offset = Accessor.byteOffset;
		}
	} else {
		offset = BufferView.byteOffset + Accessor.byteOffset;
	}

	return offset;
}

function calculateMidPointTriangle(
	triangleIndices,
	positionBufferData,
	positionByteStride,
	positionOffset,
) {
	const vertex1 = triangleIndices[0];
	const vertex2 = triangleIndices[1];
	const vertex3 = triangleIndices[2];

	const vertex1_x = positionBufferData.readFloatLE(
		positionOffset + vertex1 * positionByteStride,
	);
	const vertex1_y = positionBufferData.readFloatLE(
		positionOffset + vertex1 * positionByteStride + 4,
	);
	const vertex1_z = positionBufferData.readFloatLE(
		positionOffset + vertex1 * positionByteStride + 8,
	);
	const vertex2_x = positionBufferData.readFloatLE(
		positionOffset + vertex2 * positionByteStride,
	);
	const vertex2_y = positionBufferData.readFloatLE(
		positionOffset + vertex2 * positionByteStride + 4,
	);
	const vertex2_z = positionBufferData.readFloatLE(
		positionOffset + vertex2 * positionByteStride + 8,
	);
	const vertex3_x = positionBufferData.readFloatLE(
		positionOffset + vertex3 * positionByteStride,
	);
	const vertex3_y = positionBufferData.readFloatLE(
		positionOffset + vertex3 * positionByteStride + 4,
	);
	const vertex3_z = positionBufferData.readFloatLE(
		positionOffset + vertex3 * positionByteStride + 8,
	);

	const mid_x = (vertex1_x + vertex2_x + vertex3_x) / 3;
	const mid_y = (vertex1_y + vertex2_y + vertex3_y) / 3;
	const mid_z = (vertex1_z + vertex2_z + vertex3_z) / 3;

	return { x: mid_x, y: mid_y, z: mid_z };
}

function calculateMidPointList(indicesList, positionList) {
	let midPointList = [];
	for (const indices of indicesList) {
		let midpoint = calculateMidpointTriangleTotal(indices, positionList);
		midPointList.push(midpoint);
	}
	return midPointList;
}

function calculateDecisivePoint(midPointList) {
	let x = sortAscending_X(midPointList);
	let y = sortAscending_Y(midPointList);
	let z = sortAscending_Z(midPointList);
	const decisivePoint = {
		x: x,
		y: y,
		z: z,
	};
	return decisivePoint;
}

function sortAscending_X(midPointList) {
	const sortedList = [...midPointList];
	for (let i = 0; i < sortedList.length; i++) {
		for (let k = i + 1; k < sortedList.length; k++) {
			if (sortedList[i].x > sortedList[k].x) {
				let temp = sortedList[i];
				sortedList[i] = sortedList[k];
				sortedList[k] = temp;
			}
		}
	}
	let x = 0;
	x = sortedList[Math.floor(sortedList.length / 2)].x;
	return x;
}

function sortAscending_Y(midPointList) {
	const sortedList = [...midPointList];
	for (let i = 0; i < sortedList.length; i++) {
		for (let k = i + 1; k < sortedList.length; k++) {
			if (sortedList[i].y > sortedList[k].y) {
				let temp = sortedList[i];
				sortedList[i] = sortedList[k];
				sortedList[k] = temp;
			}
		}
	}
	let y = 0;
	y = sortedList[Math.floor(sortedList.length / 2)].y;
	return y;
}

function sortAscending_Z(midPointList) {
	const sortedList = [...midPointList];
	for (let i = 0; i < sortedList.length; i++) {
		for (let k = i + 1; k < sortedList.length; k++) {
			if (sortedList[i].z > sortedList[k].z) {
				let temp = sortedList[i];
				sortedList[i] = sortedList[k];
				sortedList[k] = temp;
			}
		}
	}
	let z = 0;
	z = sortedList[Math.floor(sortedList.length / 2)].z;
	return z;
}

function calculateMidpointTriangleTotal(indices, positionList) {
	const vertex1 = positionList[indices[0]];
	const vertex2 = positionList[indices[1]];
	const vertex3 = positionList[indices[2]];
	const vertex1_x = vertex1[0];
	const vertex1_y = vertex1[1];
	const vertex1_z = vertex1[2];
	const vertex2_x = vertex2[0];
	const vertex2_y = vertex2[1];
	const vertex2_z = vertex2[2];
	const vertex3_x = vertex3[0];
	const vertex3_y = vertex3[1];
	const vertex3_z = vertex3[2];

	const mid_x = (vertex1_x + vertex2_x + vertex3_x) / 3;
	const mid_y = (vertex1_y + vertex2_y + vertex3_y) / 3;
	const mid_z = (vertex1_z + vertex2_z + vertex3_z) / 3;

	return { x: mid_x, y: mid_y, z: mid_z };
}

function calculateMidPoint_in_X_Y(boundingVolume) {
	let midVol_x = (boundingVolume.minX + boundingVolume.maxX) / 2;
	let midVol_y = (boundingVolume.minY + boundingVolume.maxY) / 2;
	const midVol = {
		x: midVol_x,
		y: midVol_y,
	};
	return midVol;
}

function calculateMidPoint_in_X_Z(boundingVolume) {
	let midVol_x = (boundingVolume.minX + boundingVolume.maxX) / 2;
	let midVol_z = (boundingVolume.minZ + boundingVolume.maxZ) / 2;
	const midVol = {
		x: midVol_x,
		z: midVol_z,
	};
	return midVol;
}

function calculateMidPoint(boundingVolume) {
	let midVol_x = (boundingVolume.minX + boundingVolume.maxX) / 2;
	let midVol_y = (boundingVolume.minY + boundingVolume.maxY) / 2;
	let midVol_z = (boundingVolume.minZ + boundingVolume.maxZ) / 2;
	const midVol = {
		x: midVol_x,
		y: midVol_y,
		z: midVol_z,
	};

	return midVol;
}

function divideTile_in_X_Y(
	indiceList,
	boundingVolume,
	positionBufferData,
	positionByteStride,
	positionOffset,
) {
	let midVol = calculateMidPoint_in_X_Y(boundingVolume);
	let indiceList_00 = [];
	let indiceList_01 = [];
	let indiceList_10 = [];
	let indiceList_11 = [];
	for (const triangleIndices of indiceList) {
		let midPoint = calculateMidPointTriangle(
			triangleIndices,
			positionBufferData,
			positionByteStride,
			positionOffset,
		);
		if (midPoint.x > midVol.x) {
			if (midPoint.y > midVol.y) {
				indiceList_11.push(triangleIndices);
			} else {
				indiceList_10.push(triangleIndices);
			}
		} else {
			if (midPoint.y > midVol.y) {
				indiceList_01.push(triangleIndices);
			} else {
				indiceList_00.push(triangleIndices);
			}
		}
	}
	const Tiles = {
		Tiles_00: indiceList_00,
		Tiles_01: indiceList_01,
		Tiles_10: indiceList_10,
		Tiles_11: indiceList_11,
	};
	return Tiles;
}

//using for one small object
function divideTile_in_X_Z(
	indiceList,
	boundingVolume,
	positionBufferData,
	positionByteStride,
	positionOffset,
) {
	let midVol = calculateMidPoint_in_X_Z(boundingVolume);
	let indiceList_00 = [];
	let indiceList_01 = [];
	let indiceList_10 = [];
	let indiceList_11 = [];
	for (const triangleIndices of indiceList) {
		let midPoint = calculateMidPointTriangle(
			triangleIndices,
			positionBufferData,
			positionByteStride,
			positionOffset,
		);
		if (midPoint.x > midVol.x) {
			if (midPoint.z > midVol.z) {
				indiceList_11.push(triangleIndices);
			} else {
				indiceList_10.push(triangleIndices);
			}
		} else {
			if (midPoint.z > midVol.z) {
				indiceList_01.push(triangleIndices);
			} else {
				indiceList_00.push(triangleIndices);
			}
		}
	}
	const Tiles = {
		Tiles_00: indiceList_00,
		Tiles_01: indiceList_01,
		Tiles_10: indiceList_10,
		Tiles_11: indiceList_11,
	};
	return Tiles;
}

class Tile {
	constructor(
		level,
		xyz,
		indiceList,
		positionList,
		normalList,
		colorList,
		size,
		boundingVolume,
		uri,
	) {
		this.level = level;
		this.xyz = xyz;
		this.indiceList = indiceList;
		this.positionList = positionList;
		this.normalList = normalList;
		this.colorList = colorList;
		this.size = size;
		this.boundingVolume = boundingVolume;
		this.uri = uri;
	}
}

//final calculation
function calculateFinalBoundingVolume(indiceList, positionList) {
	let minX = Infinity;
	let minY = Infinity;
	let minZ = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	let maxZ = -Infinity;

	for (const indices of indiceList) {
		for (const index of indices) {
			let position = positionList[index];
			minX = Math.min(minX, position[0]);
			minY = Math.min(minY, position[1]);
			minZ = Math.min(minZ, position[2]);
			maxX = Math.max(maxX, position[0]);
			maxY = Math.max(maxY, position[1]);
			maxZ = Math.max(maxZ, position[2]);
		}
	}
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

function calculateBoundingVolumeDynamic(decisivePoint, boundingVolume, type) {
	let finalboundingVolume = 0;
	if (type == "111") {
		finalboundingVolume = {
			minX: decisivePoint.x,
			minY: decisivePoint.y,
			minZ: decisivePoint.z,
			maxX: boundingVolume.maxX,
			maxY: boundingVolume.maxY,
			maxZ: boundingVolume.maxZ,
		};
	} else if (type == "110") {
		finalboundingVolume = {
			minX: decisivePoint.x,
			minY: decisivePoint.y,
			minZ: boundingVolume.minZ,
			maxX: boundingVolume.maxX,
			maxY: boundingVolume.maxY,
			maxZ: decisivePoint.z,
		};
	} else if (type == "101") {
		finalboundingVolume = {
			minX: decisivePoint.x,
			minY: boundingVolume.minY,
			minZ: decisivePoint.z,
			maxX: boundingVolume.maxX,
			maxY: decisivePoint.y,
			maxZ: boundingVolume.maxZ,
		};
	} else if (type == "100") {
		finalboundingVolume = {
			minX: decisivePoint.x,
			minY: boundingVolume.minY,
			minZ: boundingVolume.minZ,
			maxX: boundingVolume.maxX,
			maxY: decisivePoint.y,
			maxZ: decisivePoint.z,
		};
	} else if (type == "011") {
		finalboundingVolume = {
			minX: boundingVolume.minX,
			minY: decisivePoint.y,
			minZ: decisivePoint.z,
			maxX: decisivePoint.x,
			maxY: boundingVolume.maxY,
			maxZ: boundingVolume.maxZ,
		};
	} else if (type == "010") {
		finalboundingVolume = {
			minX: boundingVolume.minX,
			minY: decisivePoint.y,
			minZ: boundingVolume.minZ,
			maxX: decisivePoint.x,
			maxY: boundingVolume.maxY,
			maxZ: decisivePoint.z,
		};
	} else if (type == "001") {
		finalboundingVolume = {
			minX: boundingVolume.minX,
			minY: boundingVolume.minY,
			minZ: decisivePoint.z,
			maxX: decisivePoint.x,
			maxY: decisivePoint.y,
			maxZ: boundingVolume.maxZ,
		};
	} else if (type == "000") {
		finalboundingVolume = {
			minX: boundingVolume.minX,
			minY: boundingVolume.minY,
			minZ: boundingVolume.minZ,
			maxX: decisivePoint.x,
			maxY: decisivePoint.y,
			maxZ: decisivePoint.z,
		};
	}

	return finalboundingVolume;
}

function calculateBoundingVolumeOcTree(boundingVolume, type) {
	const midVol = calculateMidPoint(boundingVolume);
	let finalboundingVolume = 0;
	if (type == "111") {
		finalboundingVolume = {
			minX: midVol.x,
			minY: midVol.y,
			minZ: midVol.z,
			maxX: boundingVolume.maxX,
			maxY: boundingVolume.maxY,
			maxZ: boundingVolume.maxZ,
		};
	} else if (type == "110") {
		finalboundingVolume = {
			minX: midVol.x,
			minY: midVol.y,
			minZ: boundingVolume.minZ,
			maxX: boundingVolume.maxX,
			maxY: boundingVolume.maxY,
			maxZ: midVol.z,
		};
	} else if (type == "101") {
		finalboundingVolume = {
			minX: midVol.x,
			minY: boundingVolume.minY,
			minZ: midVol.z,
			maxX: boundingVolume.maxX,
			maxY: midVol.y,
			maxZ: boundingVolume.maxZ,
		};
	} else if (type == "100") {
		finalboundingVolume = {
			minX: midVol.x,
			minY: boundingVolume.minY,
			minZ: boundingVolume.minZ,
			maxX: boundingVolume.maxX,
			maxY: midVol.y,
			maxZ: midVol.z,
		};
	} else if (type == "011") {
		finalboundingVolume = {
			minX: boundingVolume.minX,
			minY: midVol.y,
			minZ: midVol.z,
			maxX: midVol.x,
			maxY: boundingVolume.maxY,
			maxZ: boundingVolume.maxZ,
		};
	} else if (type == "010") {
		finalboundingVolume = {
			minX: boundingVolume.minX,
			minY: midVol.y,
			minZ: boundingVolume.minZ,
			maxX: midVol.x,
			maxY: boundingVolume.maxY,
			maxZ: midVol.z,
		};
	} else if (type == "001") {
		finalboundingVolume = {
			minX: boundingVolume.minX,
			minY: boundingVolume.minY,
			minZ: midVol.z,
			maxX: midVol.x,
			maxY: midVol.y,
			maxZ: boundingVolume.maxZ,
		};
	} else if (type == "000") {
		finalboundingVolume = {
			minX: boundingVolume.minX,
			minY: boundingVolume.minY,
			minZ: boundingVolume.minZ,
			maxX: midVol.x,
			maxY: midVol.y,
			maxZ: midVol.z,
		};
	}

	return finalboundingVolume;
}

function calculateBoundingVolumeQuadTree(boundingVolume, type) {
	const midVol = calculateMidPoint_in_X_Z(boundingVolume);
	let finalboundingVolume = 0;
	if (type == "11") {
		finalboundingVolume = {
			minX: midVol.x,
			minY: boundingVolume.minY,
			minZ: midVol.z,
			maxX: boundingVolume.maxX,
			maxY: boundingVolume.maxY,
			maxZ: boundingVolume.maxZ,
		};
	} else if ((type = "10")) {
		finalboundingVolume = {
			minX: midVol.x,
			minY: boundingVolume.minY,
			minZ: boundingVolume.minZ,
			maxX: boundingVolume.maxX,
			maxY: boundingVolume.maxY,
			maxZ: midVol.z,
		};
	} else if (type == "01") {
		finalboundingVolume = {
			minX: boundingVolume.minX,
			minY: boundingVolume.minY,
			minZ: midVol.z,
			maxX: midVol.x,
			maxY: boundingVolume.maxY,
			maxZ: boundingVolume.maxZ,
		};
	} else if (type == "00") {
		finalboundingVolume = {
			minX: boundingVolume.minX,
			minY: boundingVolume.minY,
			minZ: boundingVolume.minZ,
			maxX: midVol.x,
			maxY: boundingVolume.maxY,
			maxZ: midVol.z,
		};
	}

	return finalboundingVolume;
}

function divideOctreeDynamic(
	indicesList,
	boundingVolume,
	uri,
	positionList,
	TileList,
	level,
) {
	const midPointList = calculateMidPointList(indicesList, positionList);
	let decisivePoint = calculateDecisivePoint(midPointList);
	let indiceList_000 = [];
	let indiceList_001 = [];
	let indiceList_010 = [];
	let indiceList_011 = [];
	let indiceList_100 = [];
	let indiceList_101 = [];
	let indiceList_110 = [];
	let indiceList_111 = [];
	try {
		for (let i = 0; i < indicesList.length; i++) {
			if (
				midPointList[i].x > decisivePoint.x &&
				midPointList[i].x <= boundingVolume.maxX
			) {
				if (
					midPointList[i].y > decisivePoint.y &&
					midPointList[i].y <= boundingVolume.maxY
				) {
					if (
						midPointList[i].z > decisivePoint.z &&
						midPointList[i].z <= boundingVolume.maxZ
					) {
						indiceList_111.push(indicesList[i]);
					} else {
						indiceList_110.push(indicesList[i]);
					}
				} else {
					if (
						midPointList[i].z > decisivePoint.z &&
						midPointList[i].z <= boundingVolume.maxZ
					) {
						indiceList_101.push(indicesList[i]);
					} else {
						indiceList_100.push(indicesList[i]);
					}
				}
			} else {
				if (
					midPointList[i].y > decisivePoint.y &&
					midPointList[i].y <= boundingVolume.maxY
				) {
					if (
						midPointList[i].z > decisivePoint.z &&
						midPointList[i].z <= boundingVolume.maxZ
					) {
						indiceList_011.push(indicesList[i]);
					} else {
						indiceList_010.push(indicesList[i]);
					}
				} else {
					if (
						midPointList[i].z > decisivePoint.z &&
						midPointList[i].z <= boundingVolume.maxZ
					) {
						indiceList_001.push(indicesList[i]);
					} else {
						indiceList_000.push(indicesList[i]);
					}
				}
			}
		}
		const volume_000 = calculateBoundingVolumeDynamic(
			decisivePoint,
			boundingVolume,
			"000",
		);
		const volume_001 = calculateBoundingVolumeDynamic(
			decisivePoint,
			boundingVolume,
			"001",
		);
		const volume_010 = calculateBoundingVolumeDynamic(
			decisivePoint,
			boundingVolume,
			"010",
		);
		const volume_011 = calculateBoundingVolumeDynamic(
			decisivePoint,
			boundingVolume,
			"011",
		);
		const volume_100 = calculateBoundingVolumeDynamic(
			decisivePoint,
			boundingVolume,
			"100",
		);
		const volume_101 = calculateBoundingVolumeDynamic(
			decisivePoint,
			boundingVolume,
			"101",
		);
		const volume_110 = calculateBoundingVolumeDynamic(
			decisivePoint,
			boundingVolume,
			"110",
		);
		const volume_111 = calculateBoundingVolumeDynamic(
			decisivePoint,
			boundingVolume,
			"111",
		);
		const uri_000 = uri + "_" + level + "_000_";
		const uri_001 = uri + "_" + level + "_001_";
		const uri_010 = uri + "_" + level + "_010_";
		const uri_011 = uri + "_" + level + "_011_";
		const uri_100 = uri + "_" + level + "_100_";
		const uri_101 = uri + "_" + level + "_101_";
		const uri_110 = uri + "_" + level + "_110_";
		const uri_111 = uri + "_" + level + "_111_";

		const tile_000 = new Tile(
			level,
			"000",
			indiceList_000,
			0,
			0,
			0,
			indiceList_000.length,
			volume_000,
			uri_000,
		);
		const tile_001 = new Tile(
			level,
			"001",
			indiceList_001,
			0,
			0,
			0,
			indiceList_001.length,
			volume_001,
			uri_001,
		);
		const tile_010 = new Tile(
			level,
			"010",
			indiceList_010,
			0,
			0,
			0,
			indiceList_010.length,
			volume_010,
			uri_010,
		);
		const tile_011 = new Tile(
			level,
			"011",
			indiceList_011,
			0,
			0,
			0,
			indiceList_011.length,
			volume_011,
			uri_011,
		);
		const tile_100 = new Tile(
			level,
			"100",
			indiceList_100,
			0,
			0,
			0,
			indiceList_100.length,
			volume_100,
			uri_100,
		);
		const tile_101 = new Tile(
			level,
			"101",
			indiceList_101,
			0,
			0,
			0,
			indiceList_101.length,
			volume_101,
			uri_101,
		);
		const tile_110 = new Tile(
			level,
			"110",
			indiceList_110,
			0,
			0,
			0,
			indiceList_110.length,
			volume_110,
			uri_110,
		);
		const tile_111 = new Tile(
			level,
			"111",
			indiceList_111,
			0,
			0,
			0,
			indiceList_111.length,
			volume_111,
			uri_111,
		);

		TileList.push(tile_000);
		TileList.push(tile_001);
		TileList.push(tile_010);
		TileList.push(tile_011);
		TileList.push(tile_100);
		TileList.push(tile_101);
		TileList.push(tile_110);
		TileList.push(tile_111);
	} catch (error) {
		return { error: error.message };
	}
}

function divideOctree(
	indicesList,
	boundingVolume,
	uri,
	positionList,
	TileList,
	level,
) {
	let midVol = calculateMidPoint(boundingVolume);
	let indiceList_000 = [];
	let indiceList_001 = [];
	let indiceList_010 = [];
	let indiceList_011 = [];
	let indiceList_100 = [];
	let indiceList_101 = [];
	let indiceList_110 = [];
	let indiceList_111 = [];
	try {
		for (const indices of indicesList) {
			let midPoint = calculateMidpointTriangleTotal(indices, positionList);
			if (midPoint.x > midVol.x && midPoint.x <= boundingVolume.maxX) {
				if (midPoint.y > midVol.y && midPoint.y <= boundingVolume.maxY) {
					if (midPoint.z > midVol.z && midPoint.z <= boundingVolume.maxZ) {
						indiceList_111.push(indices);
					} else {
						indiceList_110.push(indices);
					}
				} else {
					if (midPoint.z > midVol.z && midPoint.z <= boundingVolume.maxZ) {
						indiceList_101.push(indices);
					} else {
						indiceList_100.push(indices);
					}
				}
			} else {
				if (midPoint.y > midVol.y && midPoint.y <= boundingVolume.maxY) {
					if (midPoint.z > midVol.z && midPoint.z <= boundingVolume.maxZ) {
						indiceList_011.push(indices);
					} else {
						indiceList_010.push(indices);
					}
				} else {
					if (midPoint.z > midVol.z && midPoint.z <= boundingVolume.maxZ) {
						indiceList_001.push(indices);
					} else {
						indiceList_000.push(indices);
					}
				}
			}
		}

		const volume_000 = calculateBoundingVolumeOcTree(boundingVolume, "000");
		const volume_001 = calculateBoundingVolumeOcTree(boundingVolume, "001");
		const volume_010 = calculateBoundingVolumeOcTree(boundingVolume, "010");
		const volume_011 = calculateBoundingVolumeOcTree(boundingVolume, "011");
		const volume_100 = calculateBoundingVolumeOcTree(boundingVolume, "100");
		const volume_101 = calculateBoundingVolumeOcTree(boundingVolume, "101");
		const volume_110 = calculateBoundingVolumeOcTree(boundingVolume, "110");
		const volume_111 = calculateBoundingVolumeOcTree(boundingVolume, "111");

		const uri_000 = uri + "_" + level + "_000_";
		const uri_001 = uri + "_" + level + "_001_";
		const uri_010 = uri + "_" + level + "_010_";
		const uri_011 = uri + "_" + level + "_011_";
		const uri_100 = uri + "_" + level + "_100_";
		const uri_101 = uri + "_" + level + "_101_";
		const uri_110 = uri + "_" + level + "_110_";
		const uri_111 = uri + "_" + level + "_111_";

		const tile_000 = new Tile(
			level,
			"000",
			indiceList_000,
			0,
			0,
			0,
			indiceList_000.length,
			volume_000,
			uri_000,
		);
		const tile_001 = new Tile(
			level,
			"001",
			indiceList_001,
			0,
			0,
			0,
			indiceList_001.length,
			volume_001,
			uri_001,
		);
		const tile_010 = new Tile(
			level,
			"010",
			indiceList_010,
			0,
			0,
			0,
			indiceList_010.length,
			volume_010,
			uri_010,
		);
		const tile_011 = new Tile(
			level,
			"011",
			indiceList_011,
			0,
			0,
			0,
			indiceList_011.length,
			volume_011,
			uri_011,
		);
		const tile_100 = new Tile(
			level,
			"100",
			indiceList_100,
			0,
			0,
			0,
			indiceList_100.length,
			volume_100,
			uri_100,
		);
		const tile_101 = new Tile(
			level,
			"101",
			indiceList_101,
			0,
			0,
			0,
			indiceList_101.length,
			volume_101,
			uri_101,
		);
		const tile_110 = new Tile(
			level,
			"110",
			indiceList_110,
			0,
			0,
			0,
			indiceList_110.length,
			volume_110,
			uri_110,
		);
		const tile_111 = new Tile(
			level,
			"111",
			indiceList_111,
			0,
			0,
			0,
			indiceList_111.length,
			volume_111,
			uri_111,
		);

		TileList.push(tile_000);
		TileList.push(tile_001);
		TileList.push(tile_010);
		TileList.push(tile_011);
		TileList.push(tile_100);
		TileList.push(tile_101);
		TileList.push(tile_110);
		TileList.push(tile_111);
	} catch (error) {
		return { error: error.message };
	}
}

//use for tiling the whole big gltf
//divide quadtree
function divideTileTotal_in_X_Z(
	indicesList,
	boundingVolume,
	positionList,
	TileList,
	level,
) {
	let midVol = calculateMidPoint_in_X_Z(boundingVolume);
	let indiceList_00 = [];
	let indiceList_01 = [];
	let indiceList_10 = [];
	let indiceList_11 = [];
	try {
		for (const indices of indicesList) {
			let midPoint = calculateMidpointTriangleTotal(indices, positionList);
			if (midPoint.x > midVol.x && midPoint.x <= boundingVolume.maxX) {
				if (midPoint.z > midVol.z && midPoint.z <= boundingVolume.maxZ) {
					indiceList_11.push(indices);
				} else {
					indiceList_10.push(indices);
				}
			} else {
				if (midPoint.z > midVol.z && midPoint.z <= boundingVolume.maxZ) {
					indiceList_01.push(indices);
				} else {
					indiceList_00.push(indices);
				}
			}
		}
		// const Tiles = {
		// 	Tiles_00: indiceList_00,
		// 	Tiles_01: indiceList_01,
		// 	Tiles_10: indiceList_10,
		// 	Tiles_11: indiceList_11,
		// };
		// return Tiles;
		const volume_00 = calculateBoundingVolumeQuadTree(boundingVolume, "00");
		const volume_01 = calculateBoundingVolumeQuadTree(boundingVolume, "01");
		const volume_10 = calculateBoundingVolumeQuadTree(boundingVolume, "10");
		const volume_11 = calculateBoundingVolumeQuadTree(boundingVolume, "11");
		const tile_00 = new Tile(
			level,
			indiceList_00,
			indiceList_00.length,
			volume_00,
		);
		const tile_01 = new Tile(
			level,
			indiceList_01,
			indiceList_01.length,
			volume_01,
		);
		const tile_10 = new Tile(
			level,
			indiceList_10,
			indiceList_10.length,
			volume_10,
		);
		const tile_11 = new Tile(
			level,
			indiceList_11,
			indiceList_11.length,
			volume_11,
		);
		TileList.push(tile_00);
		TileList.push(tile_01);
		TileList.push(tile_10);
		TileList.push(tile_11);
	} catch (error) {
		return { error: error.message };
	}
	// return TileList;
}

function repeatedTilingOctreeDynamic(
	indicesList,
	boundingVolume,
	positionList,
	maxTriangle,
) {
	let TileList = [];
	divideOctreeDynamic(
		indicesList,
		boundingVolume,
		"_",
		positionList,
		TileList,
		0,
	);
	let i = 0;
	while (i < TileList.length) {
		if (TileList[i].size > maxTriangle) {
			const tile = TileList.splice(i, 1);
			const level = tile[0].level + 1;
			divideOctreeDynamic(
				tile[0].indiceList,
				tile[0].boundingVolume,
				tile[0].uri,
				positionList,
				TileList,
				level,
			);
		} else if (TileList[i].size === 0) {
			TileList.splice(i, 1);
		} else {
			i++;
		}
	}
	return TileList;
}

function repeatedTilingOcTree(
	indicesList,
	boundingVolume,
	positionList,
	maxTriangle,
) {
	let TileList = [];
	divideOctree(indicesList, boundingVolume, "_", positionList, TileList, 0);
	let i = 0;
	while (i < TileList.length) {
		if (TileList[i].size > maxTriangle) {
			const tile = TileList.splice(i, 1);
			const level = tile[0].level + 1;
			divideOctree(
				tile[0].indiceList,
				tile[0].boundingVolume,
				tile[0].uri,
				positionList,
				TileList,
				level,
			);
		} else if (TileList[i].size === 0) {
			TileList.splice(i, 1);
		} else {
			i++;
		}
	}
	return TileList;
}
function repeatedTilingQuadTree(
	indicesList,
	boundingVolume,
	positionList,
	maxTriangle,
) {
	let TileList = [];
	divideTileTotal_in_X_Z(
		indicesList,
		boundingVolume,
		positionList,
		TileList,
		0,
	);
	let i = 0;
	while (i < TileList.length) {
		if (TileList[i].size > maxTriangle) {
			const tile = TileList.splice(i, 1);
			const level = tile[0].level + 1;
			divideTileTotal_in_X_Z(
				tile[0].indiceList,
				tile[0].boundingVolume,
				positionList,
				TileList,
				level,
			);
		} else if (TileList[i].size === 0) {
			TileList.splice(i, 1);
		} else {
			i++;
		}
	}
	return TileList;
}
function TranslationMatrix(boundingVolume) {
	//Calculate translation vector
	const translation = new Cesium.Cartesian3(
		(boundingVolume.maxX + boundingVolume.minX) / 2,
		(boundingVolume.maxZ + boundingVolume.minZ) / 2,
		0,
	);
	// Calculate scale vector
	// const scale = new Cesium.Cartessian3(
	// 	boundingVolume.maxX - boundingVolume.minX,
	// 	boundingVolume.maxY - boundingVolume.minY,
	// 	boundingVolume.maxZ - boundingVolume.minZ,
	// );
	const transformMatrix = new Cesium.Matrix4();
	//Cesium.Matrix4.fromTranslationScale(translation, scale, transformMatrix);
	Cesium.Matrix4.fromTranslation(translation, transformMatrix);
	const modelMatrixArray = new Array(16);
	Cesium.Matrix4.toArray(transformMatrix, modelMatrixArray);

	return modelMatrixArray;
}

function PositionMatrix(longitude, latitude, height) {
	const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

	const heading = 0; // in degrees
	const pitch = 0; // in degrees
	const roll = 0; // in degrees

	const hpr = new Cesium.HeadingPitchRoll(
		Cesium.Math.toRadians(heading),
		Cesium.Math.toRadians(pitch),
		Cesium.Math.toRadians(roll),
	);

	const transformMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
		position,
		hpr,
	);
	const modelMatrixArray = new Array(16);
	Cesium.Matrix4.toArray(transformMatrix, modelMatrixArray);
	return modelMatrixArray;
}

function getIndicesList(positionList) {
	let indicesList = [];
	for (let i = 0; i < positionList.length - 2; i++) {
		let smallList = [i, i + 1, i + 2];
		indicesList.push(smallList);
	}
	return indicesList;
}

function reIndexTotalIndices(indiceList, indicesListNoIndex, positionList) {
	for (let i = 0; i < indicesListNoIndex.length; i++) {
		let index = indicesListNoIndex[i];
		for (let j = 0; j < index.length; j++) {
			index[j] += positionList.length;
		}
	}

	indiceList = indiceList.concat(indicesListNoIndex);
	return indiceList;
}

module.exports = {
	boundingVolume,
	ByteStride,
	calculateOffset,
	divideTile_in_X_Y,
	divideTile_in_X_Z,
	divideTileTotal_in_X_Z,
	getComponentTypeSize,
	calculateBoxTileset,
	TranslationMatrix,
	PositionMatrix,
	repeatedTilingQuadTree,
	repeatedTilingOcTree,
	repeatedTilingOctreeDynamic,
	getIndicesList,
	reIndexTotalIndices,
	calculateFinalBoundingVolume,
	rootBoundingBox,
	calculateBoxTilesetYupZup,
	calculateMidPointList,
};
