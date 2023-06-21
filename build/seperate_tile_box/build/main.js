const readData = require("./readData.js");
const calculate = require("./calculate.js");
const write = require("./write.js");

const gltfPath =
	"/home/hieuvu/DATN/Map_Cesium/build/seperate_tile_box/data/Box.gltf";

function readIndice(gltfPath) {
	const gltf = readData.ParseGLTF(gltfPath);
	let nodes = gltf.scenes[gltf.scene];
	for (const node of nodes.nodes) {
		let children = gltf.nodes[node];
		for (const child of children.children) {
			let mesh = gltf.nodes[child];
			//console.log(mesh);
			let meshIndex = mesh.mesh;
			//console.log(meshIndex);
			let primitiveIndex = gltf.meshes[meshIndex];
			//console.log(primitiveIndex);
			//console.log(primitiveIndex.primitives[0].mode);
			if (primitiveIndex.primitives[0].mode === 4) {
				//get accessors
				let indicesAccessor =
					gltf.accessors[primitiveIndex.primitives[0].indices];
				let normalAccessor =
					gltf.accessors[primitiveIndex.primitives[0].attributes.NORMAL];
				let positionAccessor =
					gltf.accessors[primitiveIndex.primitives[0].attributes.POSITION];

				//get BufferView
				let indicesBufferView = gltf.bufferViews[indicesAccessor.bufferView];
				let normalBufferView = gltf.bufferViews[normalAccessor.bufferView];
				let positionBufferView = gltf.bufferViews[positionAccessor.bufferView];

				//get Buffer
				let indicesBuffer = gltf.buffers[indicesBufferView.buffer];
				let normalBuffer = gltf.buffers[normalBufferView.buffer];
				let positionBuffer = gltf.buffers[positionBufferView.buffer];

				//get Data
				let indicesData = readData.parseDataFromURI(indicesBuffer.uri);
				let normalData = readData.parseDataFromURI(normalBuffer.uri);
				let positionData = readData.parseDataFromURI(positionBuffer.uri);

				//calculate bytestride
				let indicesByteStride = calculate.ByteStride(indicesAccessor);
				let normalByteStride = calculate.ByteStride(normalAccessor);
				let positionByteStride = calculate.ByteStride(positionAccessor);

				//calculate offset
				let indicesOffset = calculate.calculateOffset(
					indicesBufferView,
					indicesAccessor,
				);
				let normalOffset = calculate.calculateOffset(
					normalBufferView,
					normalAccessor,
				);
				let positionOffset = calculate.calculateOffset(
					positionBufferView,
					positionAccessor,
				);

				//get bounding volume
				const boundingVolume = calculate.boundingVolume(gltf);

				//get indices list
				const indicesList = readData.readIndices(
					indicesOffset,
					indicesByteStride,
					indicesData,
					indicesAccessor,
				);
				//console.log(indicesList);
				const positionList = readData.readPositionNotIndex(
					positionOffset,
					positionByteStride,
					positionData,
					indicesAccessor.max[0],
				);
				//console.log(positionList);

				const normalList = readData.readNormalNotIndex(
					normalOffset,
					normalByteStride,
					normalData,
					indicesAccessor.max[0],
				);
				//console.log(normalList);

				//divide tile in x and y direction
				const newTiles = calculate.divideTile(
					indicesList,
					boundingVolume,
					positionData,
					positionByteStride,
					positionOffset,
				);
				//console.log(newTiles.Tiles_00);

				let IVN_00 = write.simplified(
					normalList,
					positionList,
					newTiles.Tiles_00,
				);
				write.write(IVN_00, "00");
				let IVN_01 = write.simplified(
					normalList,
					positionList,
					newTiles.Tiles_01,
				);
				write.write(IVN_01, "01");
				let IVN_11 = write.simplified(
					normalList,
					positionList,
					newTiles.Tiles_11,
				);
				write.write(IVN_11, "11");
				let IVN_10 = write.simplified(
					normalList,
					positionList,
					newTiles.Tiles_10,
				);
				write.write(IVN_10, "10");
			}
		}
	}
}

readIndice(gltfPath);
