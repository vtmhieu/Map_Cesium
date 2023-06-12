const fs = require("fs");

const gltfPath = "/home/hieuvu/DATN/Map_Cesium/16048/data/sampleTest.gltf";

function ParseGLTF(gltfPath) {
	const gltfData = fs.readFileSync(gltfPath);
	const gltf = JSON.parse(gltfData);
	return gltf;
}

const gltf = ParseGLTF(gltfPath);

// //let count = 0;
// let minX = Infinity;
// let minY = Infinity;
// let minZ = Infinity;
// let maxX = -Infinity;
// let maxY = -Infinity;
// let maxZ = -Infinity;

// //calculate the best bounding volume
// for (const mesh of gltf.meshes) {
// 	for (const primitive of mesh.primitives) {
// 		if (primitive.mode === 4) {
// 			let accessor = gltf.accessors[primitive.attributes.POSITION];

// 			minX = Math.min(minX, accessor.min[0]);
// 			minY = Math.min(minY, accessor.min[1]);
// 			minZ = Math.min(minZ, accessor.min[2]);
// 			maxX = Math.max(maxX, accessor.max[0]);
// 			maxY = Math.max(maxY, accessor.max[1]);
// 			maxZ = Math.max(maxZ, accessor.max[2]);
// 		} else {
// 			continue;
// 		}
// 	}
// }
// const boundingVolume = {
// 	minX: minX,
// 	minY: minY,
// 	minZ: minZ,
// 	maxX: maxX,
// 	maxY: maxY,
// 	maxZ: maxZ,
// };

//console.log(boundingVolume);

const newGltf = {
	asset: {
		version: "2.0",
		generator: "xyz",
	},
	accessors: [],
	buffers: [],
	bufferViews: [],
	images: [],
	meshes: [],
	nodes: [],
	samplers: [],
	scene: [],
	scenes: [],
	textures: [],
};

const scene = gltf.scenes[gltf.scene];
const rootNode = scene.nodes[0];
console.log(rootNode);
