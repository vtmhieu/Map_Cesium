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
	constructor(level, indiceList, size, boundingVolume) {
		this.level = level;
		this.indiceList = indiceList;
		this.size = size;
		this.boundingVolume = boundingVolume;
	}
}

function calculateBoundingVolume(indiceList, positionList) {
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
//use for tiling the whole big gltf
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
	for (const indices of indicesList) {
		let midPoint = calculateMidpointTriangleTotal(indices, positionList);
		if (midPoint.x > midVol.x) {
			if (midPoint.z > midVol.z) {
				indiceList_11.push(indices);
			} else {
				indiceList_10.push(indices);
			}
		} else {
			if (midPoint.z > midVol.z) {
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
	const volume_00 = calculateBoundingVolume(indiceList_00, positionList);
	const volume_01 = calculateBoundingVolume(indiceList_01, positionList);
	const volume_10 = calculateBoundingVolume(indiceList_10, positionList);
	const volume_11 = calculateBoundingVolume(indiceList_11, positionList);
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
	// return TileList;
}

function repeatedTiling(
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
	for (let i = 0; i < TileList.length; i++) {
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
		} else if (TileList[i].size == 0) {
			TileList.splice(i, 1);
		} else {
			continue;
		}
	}
	return TileList;
}
function TranslationMatrix(boundingVolume) {
	//Calculate translation vector
	const translation = new Cesium.Cartesian3(
		(boundingVolume.maxX + boundingVolume.minX) / 2,
		(boundingVolume.maxY + boundingVolume.minY) / 2,
		(boundingVolume.maxZ - boundingVolume.minZ) / 2,
	);
	// Calculate scale vector
	// const scale = new Cesium.Cartesian3(
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
	repeatedTiling,
};
