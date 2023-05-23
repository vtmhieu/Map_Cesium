const fs = require("fs");

function calculateBoundingVolume(gltfFilePath) {
	// Read the glTF file
	const gltfData = fs.readFileSync(gltfFilePath, "utf8");
	const gltf = JSON.parse(gltfData);

	// Get the mesh data
	for (const mesh of gltf.meshes) {
		const accessor = gltf.accessors[mesh.primitives[0].attributes.POSITION];
		const bufferView = gltf.bufferViews[accessor.bufferView];
		const buffer = gltf.buffers[bufferView.buffer];
	}
	const mesh = gltf.meshes[meshIndex];
	const accessor = gltf.accessors[mesh.primitives[0].attributes.POSITION];
	const bufferView = gltf.bufferViews[accessor.bufferView];
	const buffer = gltf.buffers[bufferView.buffer];

	// Calculate the bounding volume
	let minX = Infinity;
	let minY = Infinity;
	let minZ = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	let maxZ = -Infinity;

	const vertexCount = accessor.count;
	const byteOffset = bufferView.byteOffset + accessor.byteOffset;
	const byteStride = bufferView.byteStride || 12; // Assuming 12 bytes per vertex (3 floats)

	for (let i = 0; i < vertexCount; i++) {
		const offset = byteOffset + i * byteStride;
		const x = buffer.data.readFloatLE(offset);
		const y = buffer.data.readFloatLE(offset + 4);
		const z = buffer.data.readFloatLE(offset + 8);

		minX = Math.min(minX, x);
		minY = Math.min(minY, y);
		minZ = Math.min(minZ, z);
		maxX = Math.max(maxX, x);
		maxY = Math.max(maxY, y);
		maxZ = Math.max(maxZ, z);
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
const gltfFilePath = "path/to/your/gltf/file.gltf";
const meshIndex = 0; // Index of the mesh you want to calculate the bounding volume for

const boundingVolume = calculateBoundingVolume(gltfFilePath, meshIndex);
console.log(boundingVolume);

const gltfPath = "/home/hieuvu/DATN/Map_Cesium/gltf/Gear2.gltf";
