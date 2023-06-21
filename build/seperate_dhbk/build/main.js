const readData = require("../../lib/readData.js");
const calculate = require("../../lib/calculate.js");
const write = require("../../lib/write.js");

const gltfPath =
	"/home/hieuvu/DATN/Map_Cesium/build/seperate_dhbk/data/dhbk.gltf";
function generateTileset(gltfPath) {
	const gltf = readData.ParseGLTF(gltfPath);
	let positionList = [];
	let normalList = [];
	for (mesh of gltf.meshes) {
		for (primitive of mesh.primitives) {
			if (primitive.mode === 4) {
				if (primitive.indices == null) {
					//get Accessor
					let positionAccessor = gltf.accessors[primitive.attributes.POSITION];
					let normalAccessor = gltf.accessors[primitive.attributes.NORMAL];

					//get BufferView
					let positionBufferView =
						gltf.bufferViews[positionAccessor.bufferView];
					let normalBufferView = gltf.bufferViews[normalAccessor.bufferView];

					//get Buffer
					let positionBuffer = gltf.buffers[positionBufferView.buffer];
					let normalBuffer = gltf.buffers[normalBufferView.buffer];

					//get Data
					let positionData = readData.parseDataFromURI(positionBuffer.uri);
					let normalData = readData.parseDataFromURI(normalBuffer.uri);

					//calculate bytestride
					let positionByteStride = calculate.ByteStride(positionAccessor);
					let normalByteStride = calculate.ByteStride(normalAccessor);

					//calculate offset
					let positionOffset = calculate.calculateOffset(
						positionBufferView,
						positionAccessor,
					);
					let normalOffset = calculate.calculateOffset(
						normalBufferView,
						normalAccessor,
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
					positionList = positionList.concat(postionListNoIndex);
					normalList = normalList.concat(normalListNoIndex);
				}
			} else {
				continue;
			}
		}
	}
	console.log(positionList);
	console.log(normalList);
}

generateTileset(gltfPath);
