const fs = require("fs");

function readBinFile(filename) {
	const rawData = fs.readFileSync(filename);
	const typedArray = Buffer.from(rawData);
	return typedArray;
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

// Example usage
const gltfFilePath = "/home/hieuvu/DATN/Map_Cesium/gltf/Gear2.gltf";

const boundingVolume = calculateBoundingVolume(gltfFilePath);
console.log(boundingVolume);

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
