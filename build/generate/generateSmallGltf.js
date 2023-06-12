const fs = require("fs");

const gltfPath = "/home/hieuvu/DATN/Map_Cesium/16048/data/sampleTest.gltf";

function ParseGLTF(gltfPath) {
	const gltfData = fs.readFileSync(gltfPath);
	const gltf = JSON.parse(gltfData);
	return gltf;
}

const gltf = ParseGLTF(gltfPath);

const newGltf = {
	asset: {
		version: "2.0",
		generator: "OSM2World 0.3.1",
	},
	accessors: [], //
	buffers: [], //
	bufferViews: [], //
	images: [], //
	materials: [],
	meshes: [], //
	nodes: [], //
	samplers: [], //
	scene: 0, //
	scenes: [], //

	textures: [], //
};

const scene = gltf.scenes[gltf.scene];
const rootNode = scene.nodes[0];
//console.log(rootNode);

let listOfChildren = [];
let listOfMesh = [];

const children = gltf.nodes[rootNode];

listOfChildren = children.children;
//console.log(listOfChildren);
for (const children of listOfChildren) {
	if (gltf.nodes[children].children != null) {
		const listOfSmallMesh = gltf.nodes[children].children;

		let meshes = [];
		for (const number of listOfSmallMesh) {
			meshes.push(gltf.nodes[number].mesh);
		}
		listOfMesh.push(meshes);
	} else {
		listOfMesh.push(gltf.nodes[children].mesh);
	}
}
//console.log(listOfMesh);

let listOfPrimitives = [];

for (const mesh of listOfMesh) {
	let list = [];
	if (mesh.length > 1) {
		for (const index of mesh) {
			list.push(gltf.meshes[index]);
		}
		listOfPrimitives.push(list);
	} else {
		listOfPrimitives.push(gltf.meshes[mesh]);
	}
}

//console.log(listOfPrimitives);
//newGltf.accessors = gltf.accessors;
//newGltf.buffers = gltf.buffers;
//newGltf.bufferViews = gltf.bufferViews;
newGltf.images = gltf.images;
newGltf.samplers = gltf.samplers;
newGltf.textures = gltf.textures;

newGltf.materials = gltf.materials;

for (let i = 0; i < 7; i++) {
	newGltf.accessors.push(gltf.accessors[i]);
	newGltf.bufferViews.push(gltf.bufferViews[i]);
	newGltf.buffers.push(gltf.buffers[i]);
}

newGltf.scenes = [
	{
		nodes: [0],
	},
];
const obj = {
	children: [listOfMesh[0].length + 1],
};
newGltf.nodes.push(obj);
for (const index of listOfMesh[0]) {
	let obj = {
		mesh: index,
	};
	newGltf.nodes.push(obj);
}
const newObj = {
	children: [1, 2],
	name: "BusStop Đại học Bách Khoa",
	extras: {
		osmId: "n8766627164",
	},
};
newGltf.nodes.push(newObj);

for (const index of listOfPrimitives[0]) {
	newGltf.meshes.push(index);
}

//console.log(newGltf);

//write into gltf
const gltfString = JSON.stringify(newGltf, null, 2);

// Write the glTF string to a file
fs.writeFile("./output/gltf/output.gltf", gltfString, "utf8", (err) => {
	if (err) {
		console.error("Error writing glTF file:", err);
	} else {
		console.log("glTF file written successfully!");
	}
});
