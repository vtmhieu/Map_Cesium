const readData = require("./readData.js");
const calculate = require("./calculate.js");
const write = require("./write.js");

// const gltfPath =
// 	"/home/hieuvu/DATN/Map_Cesium/build/seperate_octree_dynamic/data/4_7.gltf";
function AdaptiveTiling(gltfPath, maxTriangles) {
	const gltf = readData.ParseGLTF(gltfPath);
	let positionList = [];
	let normalList = [];
	let indicesList = [];
	let colorList = [];
	//let midPointList = [];
	for (mesh of gltf.meshes) {
		for (primitive of mesh.primitives) {
			if (primitive.mode === 4) {
				if (primitive.indices == null) {
					//get Accessor
					let positionAccessor = gltf.accessors[primitive.attributes.POSITION];
					let normalAccessor = gltf.accessors[primitive.attributes.NORMAL];
					let colorAccessor = gltf.accessors[primitive.attributes.COLOR_0];

					//get BufferView
					let positionBufferView =
						gltf.bufferViews[positionAccessor.bufferView];
					let normalBufferView = gltf.bufferViews[normalAccessor.bufferView];
					let colorBufferView = gltf.bufferViews[colorAccessor.bufferView];

					//get Buffer
					let positionBuffer = gltf.buffers[positionBufferView.buffer];
					let normalBuffer = gltf.buffers[normalBufferView.buffer];
					let colorBuffer = gltf.buffers[colorBufferView.buffer];

					//get Data
					let positionData = readData.parseDataFromURI(positionBuffer.uri);
					let normalData = readData.parseDataFromURI(normalBuffer.uri);
					let colorData = readData.parseDataFromURI(colorBuffer.uri);

					//calculate bytestride
					let positionByteStride = calculate.ByteStride(positionAccessor);
					let normalByteStride = calculate.ByteStride(normalAccessor);
					let colorByteStride = calculate.ByteStride(colorAccessor);

					//calculate offset
					let positionOffset = calculate.calculateOffset(
						positionBufferView,
						positionAccessor,
					);
					let normalOffset = calculate.calculateOffset(
						normalBufferView,
						normalAccessor,
					);
					let colorOffset = calculate.calculateOffset(
						colorBufferView,
						colorAccessor,
					);

					//read position list
					const postionListNoIndex = readData.readPositionNoIndices(
						positionOffset,
						positionByteStride,
						positionData,
						positionAccessor.count,
					);

					//read normal list
					const normalListNoIndex = readData.readNormalNoIndices(
						normalOffset,
						normalByteStride,
						normalData,
						normalAccessor.count,
					);

					const colorListNoIndex = readData.readColorNoIndices(
						colorOffset,
						colorByteStride,
						colorData,
						colorAccessor.count,
					);

					const indicesListNoIndex =
						calculate.getIndicesList(postionListNoIndex);

					indicesList = calculate.reIndexTotalIndices(
						indicesList,
						indicesListNoIndex,
						positionList,
					);
					positionList = positionList.concat(postionListNoIndex);
					normalList = normalList.concat(normalListNoIndex);
					colorList = colorList.concat(colorListNoIndex);
				}
			} else {
				continue;
			}
		}
	}
	//midPointList = calculate.calculateMidPointList(indicesList, positionList);

	const rootBoundingVolume = calculate.boundingVolume(gltf);

	let newTiles = calculate.repeatedTilingOctreeDynamic(
		indicesList,
		rootBoundingVolume,
		positionList,
		maxTriangles,
	);
	//console.log(newTiles);
	for (const Tile of newTiles) {
		Tile.boundingVolume = calculate.calculateFinalBoundingVolume(
			Tile.indiceList,
			positionList,
		);
		write.write(Tile.indiceList, positionList, normalList, colorList, Tile);
	}
	//console.log(newTiles);

	write.writeTilesetTotal(newTiles, rootBoundingVolume);
}

module.exports = {
	AdaptiveTiling,
};
