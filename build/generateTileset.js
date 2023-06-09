const fs = require("fs");
const Cesium = require("cesium");
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
const gltfFilePath = "/home/hieuvu/DATN/Map_Cesium/gltf/Gear2.gltf";

//const gltf = ParseGLTF(gltfFilePath);
const boundingVolume = calculateBoundingVolume(gltfFilePath);
function createTileset(tilesetName, contentUri, boundingVolume) {
	const region = [
		boundingVolume.minX,
		boundingVolume.minY,
		boundingVolume.minZ,
		boundingVolume.maxX,
		boundingVolume.maxY,
		boundingVolume.maxZ,
	];
	const tileset = {
		asset: {
			version: "1.0",
		},
		geometricError: 10000,
		root: {
			boundingVolume: {
				region: region,
			},
			geometricError: 10000,
			refine: "ADD",
			content: {
				uri: contentUri,
			},
		},
	};

	fs.writeFileSync(tilesetName, JSON.stringify(tileset, null, 2));
}

// Example usage
const contentUri = "output.b3dm";
// const boundingVolume = {
// 	region: [-74.0635, 40.6797, -73.9397, 40.7539, 0, 100], // west, south, east, north, minimum height, maximum height
// };

createTileset("tileset.json", contentUri, boundingVolume);
