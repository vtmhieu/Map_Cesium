const calculate = require("./calculate.js");
const fs = require("fs");
const { exec } = require("child_process");

const readData = require("./readData.js");

function simplified(NormalList, PositionList, IndicesList) {
	const newIndices = [];
	const newPositions = [];
	const newNormals = [];
	const vertexMapping = {};

	IndicesList.forEach((triangle) => {
		const newTriangle = [];

		triangle.forEach((vertexIndex) => {
			if (!(vertexIndex in vertexMapping)) {
				const newIndex = newPositions.length;
				vertexMapping[vertexIndex] = newIndex;
				newPositions.push(PositionList[vertexIndex]);
			}
			newTriangle.push(vertexMapping[vertexIndex]);
		});
		newIndices.push(newTriangle);
	});
	NormalList.forEach((normal, index) => {
		if (index in vertexMapping) {
			newNormals.push(NormalList[index]);
		}
	});

	const IVN = {
		indices: newIndices.flat(),
		positions: newPositions.flat(),
		normals: newNormals.flat(),
	};
	//console.log(IVN);
	return IVN;
}
async function simplifiedOctree(
	indicesList,
	positionList,
	normalList,
	colorList,
	Tile,
) {
	const newIndices = [];
	const newPositions = [];
	const newNormals = [];
	const newColors = [];
	const vertexMapping = {};

	indicesList.forEach((triangle) => {
		const newTriangle = [];

		triangle.forEach((vertexIndex) => {
			if (!(vertexIndex in vertexMapping)) {
				const newIndex = newPositions.length;
				vertexMapping[vertexIndex] = newIndex;
				newPositions.push(positionList[vertexIndex]);
			}
			newTriangle.push(vertexMapping[vertexIndex]);
		});
		newIndices.push(newTriangle);
	});
	normalList.forEach((normal, index) => {
		if (index in vertexMapping) {
			newNormals.push(normalList[index]);
		}
	});
	colorList.forEach((color, index) => {
		if (index in vertexMapping) {
			newColors.push(colorList[index]);
		}
	});
	Tile.indiceList = newIndices;
	Tile.positionList = newPositions;
	Tile.normalList = newNormals;
	Tile.colorList = newColors;
}

async function write(indiceList, positionList, normalList, colorList, Tile) {
	try {
		await simplifiedOctree(
			indiceList,
			positionList,
			normalList,
			colorList,
			Tile,
		);
		await writeGLTF(Tile);
		await convertGLTFtoGLB(Tile);
		await convertGLBtoB3DM(Tile);
	} catch (error) {
		console.error("An error occurred:", error.message);
	}
}

async function writeGLTF(Tile) {
	const glTFData = {
		asset: { version: "2.0", generator: "COLLADA2GLTF" },
		accessors: [],
		buffers: [],
		bufferViews: [],
		meshes: [],
		nodes: [{ children: [1] }, { mesh: 0 }],
		scenes: [{ nodes: [0] }],
		scene: 0,
	};
	let indiceList = Tile.indiceList.flat();
	let positionList = Tile.positionList.flat();
	let normalList = Tile.normalList.flat();
	let colorList = Tile.colorList.flat();
	let max = 0;
	for (const index of indiceList) {
		max = Math.max(max, index);
	}
	//Encode indices
	const indicesBuffer = new Uint16Array(indiceList);
	const indicesDataURI = encodeToDataURI(indicesBuffer.buffer);
	const indicesBufferView = createBufferView(indicesBuffer, 0);
	const indicesAccessor = createIndicesAccessor(
		indicesBuffer,
		0,
		"SCALAR",
		5123,
		max,
	);

	//Encode positions
	const positionsBuffer = new Float32Array(positionList);
	const positionsDataURI = encodeToDataURI(positionsBuffer.buffer);
	const positionsBufferView = createBufferView(positionsBuffer, 1);
	const positionsAccessor = createPositionAccessor(
		positionsBuffer,
		1,
		"VEC3",
		5126,
		positionList,
	);

	//Encode normals
	const normalsBuffer = new Float32Array(normalList);
	const normalsDataURI = encodeToDataURI(normalsBuffer.buffer);
	const normalsBufferView = createBufferView(normalsBuffer, 2);
	const normalsAccessor = createNormalAccessor(
		normalsBuffer,
		2,
		"VEC3",
		5126,
		normalList,
	);

	//Encode colors
	const colorsBuffer = new Float32Array(colorList);
	const colorsDataURI = encodeToDataURI(colorsBuffer.buffer);
	const colorsBufferView = createBufferView(colorsBuffer, 3);
	const colorsAccessor = createColorAccessor(
		colorsBuffer,
		3,
		"VEC3",
		5126,
		colorList,
	);
	//Create mesh and primitives
	const primitive = {
		mode: 4,
		indices: 0,
		attributes: {
			POSITION: 1,
			NORMAL: 2,
			COLOR_0: 3,
		},
	};

	const mesh = {
		primitives: [primitive],
	};

	glTFData.accessors.push(
		indicesAccessor,
		positionsAccessor,
		normalsAccessor,
		colorsAccessor,
	);
	glTFData.meshes.push(mesh);

	glTFData.buffers.push(
		{
			byteLength: indicesBuffer.byteLength,
			uri: indicesDataURI,
		},
		{
			byteLength: positionsBuffer.byteLength,
			uri: positionsDataURI,
		},
		{
			byteLength: normalsBuffer.byteLength,
			uri: normalsDataURI,
		},
		{
			byteLength: colorsBuffer.byteLength,
			uri: colorsDataURI,
		},
	);

	//push BufferViews
	glTFData.bufferViews.push(
		indicesBufferView,
		positionsBufferView,
		normalsBufferView,
		colorsBufferView,
	);
	const gltf = JSON.stringify(glTFData, null, 2);
	await fs.promises.writeFile(
		"./middleware/output/gltf/" + Tile.uri + ".gltf",
		gltf,
		"utf8",
		(err) => {
			if (err) {
				console.error("Error writing glTF file:", err);
			} else {
				console.log("glTF file written successfully!");
			}
		},
	);
}

function createBufferView(buffer, index, byteOffset = 0) {
	return {
		buffer: index,
		byteOffset: byteOffset,
		byteLength: buffer.byteLength,
		//target: 34963,
	};
}

function createIndicesAccessor(bufferView, index, type, componentType, max) {
	return {
		bufferView: index,
		byteOffset: 0,
		componentType: componentType,
		count: bufferView.byteLength / ByteStride(componentType, type),
		min: [0],
		max: [max],
		type: type,
	};
}

function createPositionAccessor(
	bufferView,
	index,
	type,
	componentType,
	positionList,
) {
	const boundingBox = bounding(positionList);
	return {
		bufferView: index,
		byteOffset: 0,
		componentType: componentType,
		count: bufferView.byteLength / ByteStride(componentType, type),
		max: [boundingBox.maxX, boundingBox.maxY, boundingBox.maxZ],
		min: [boundingBox.minX, boundingBox.minY, boundingBox.minZ],
		type: type,
	};
}

function createNormalAccessor(
	bufferView,
	index,
	type,
	componentType,
	normalList,
) {
	const boundingBox = bounding(normalList);
	return {
		bufferView: index,
		byteOffset: 0,
		componentType: componentType,
		count: bufferView.byteLength / ByteStride(componentType, type),
		max: [boundingBox.maxX, boundingBox.maxY, boundingBox.maxZ],
		min: [boundingBox.minX, boundingBox.minY, boundingBox.minZ],
		type: type,
	};
}
function createColorAccessor(
	bufferView,
	index,
	type,
	componentType,
	colorList,
) {
	const boundingBox = bounding(colorList);
	return {
		bufferView: index,
		byteOffset: 0,
		componentType: componentType,
		count: bufferView.byteLength / ByteStride(componentType, type),
		max: [boundingBox.maxX, boundingBox.maxY, boundingBox.maxZ],
		min: [boundingBox.minX, boundingBox.minY, boundingBox.minZ],
		type: type,
	};
}

function bounding(List) {
	let minX = Infinity;
	let minY = Infinity;
	let minZ = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	let maxZ = -Infinity;
	for (let i = 0; i < List.length; i += 3) {
		minX = Math.min(minX, List[i]);
		minY = Math.min(minY, List[i + 1]);
		minZ = Math.min(minZ, List[i + 2]);
		maxX = Math.max(maxX, List[i]);
		maxY = Math.max(maxY, List[i + 1]);
		maxZ = Math.max(maxZ, List[i + 2]);
	}
	const boundingBox = {
		minX: minX,
		minY: minY,
		minZ: minZ,
		maxX: maxX,
		maxY: maxY,
		maxZ: maxZ,
	};
	return boundingBox;
}
function ByteStride(componentType, type) {
	let byteStride = 12;
	const componentTypeSize = calculate.getComponentTypeSize(componentType);
	if (type === "VEC3") {
		byteStride = componentTypeSize * 3;
	} else if (type === "VEC2") {
		byteStride = componentTypeSize * 2;
	} else if (type === "SCALAR") {
		byteStride = componentTypeSize * 1;
	} else {
		return;
	}
	return byteStride;
}

function encodeToDataURI(arrayBuffer) {
	const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
	return `data:application/octet-stream;base64,${base64}`;
}

function runCommand(command) {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(error);
				return;
			}

			if (stderr) {
				reject(new Error(stderr));
				return;
			}

			resolve(stdout.trim());
		});
	});
}

// Example usage
async function convertGLTFtoGLB(Tile) {
	// Run the conversion
	const inputFile =
		"/home/hieuvu/DATN/Map_Cesium/middleware/output/gltf/" + Tile.uri + ".gltf";
	const outputFile = "./middleware/output/glb/" + Tile.uri + ".glb";
	try {
		const command = `gltf-pipeline -f -i ${inputFile} -o ${outputFile}`;
		const result = await runCommand(command);
		console.log(result);
	} catch (error) {
		console.error(`An error occurred: ${error.message}`);
	}
}

async function convertGLBtoB3DM(Tile) {
	const inputFile =
		"/home/hieuvu/DATN/Map_Cesium/middleware/output/glb/" + Tile.uri + ".glb";
	const outputFile = "./middleware/output/b3dm/" + Tile.uri + ".b3dm";
	try {
		const command = `npx 3d-tiles-tools glbToB3dm -f -i ${inputFile} -o ${outputFile}`;
		const result = await runCommand(command);
		console.log(result);
	} catch (error) {
		console.error(`An error occurred: ${error.message}`);
	}
}

async function writeTileset(name) {
	const geometricError = 1.5;

	const uri = "../b3dm/" + name + ".b3dm";
	const gltfPath = "/home/hieuvu/DATN/Map_Cesium/output/gltf/" + name + ".gltf";
	const tilesetName = "./output/tileset/" + name + ".json";

	const gltf = await readData.ParseGLTF(gltfPath);
	const boundingBox = calculate.boundingVolume(gltf);
	const box = calculate.calculateBoxTileset(boundingBox);
	const translationMatrix = calculate.TranslationMatrix(boundingBox);
	const positionMatrix = calculate.PositionMatrix(105, 22, -10);

	const tileset = {
		asset: {
			version: "1.0",
		},
		geometricError: geometricError,
		root: {
			boundingVolume: {
				box: box,
			},
			geometricError: geometricError,
			children: [
				{
					refine: "ADD",
					boundingVolume: {
						box: box,
					},
					transform: translationMatrix,
					content: {
						uri: uri,
					},
					geometricError: 0,
				},
			],
			transform: positionMatrix,
		},
	};

	fs.writeFileSync(tilesetName, JSON.stringify(tileset, null, 2));
}

// class Children {
// 	constructor(boundingBox, uri, geometricError) {
// 		this.boundingBox = boundingBox;
// 		this.uri = uri;
// 		this.geometricError = geometricError;
// 	}
// }
function writeTilesetTotal(TileList, rootBoundingVolume) {
	const geometricError = 100;
	let positionMatrix = calculate.PositionMatrix(105, 22, -10);
	let rootBox = calculate.rootBoundingBox(rootBoundingVolume);
	let translationMatrix = calculate.TranslationMatrix(rootBoundingVolume);
	let tileset = {
		asset: {
			version: "1.0",
		},
		geometricError: geometricError,
		root: {
			refine: "ADD",
			transform: positionMatrix,
			boundingVolume: {
				box: rootBox,
			},
			geometricError: geometricError,
			children: [
				{
					geometricError: geometricError,
					transform: translationMatrix,
					boundingVolume: {
						box: rootBox,
					},
					children: [],
				},
			],
		},
	};
	// let children = {
	// 	boundingVolume: {
	// 		box: [],
	// 	},
	// 	content: {
	// 		uri: "",
	// 	},
	// 	geometricError: 0,
	// };
	for (const Tile of TileList) {
		const newBox = calculate.calculateBoxTilesetYupZup(Tile.boundingVolume);
		const newUri = "./middleware/output/b3dm/" + Tile.uri + ".b3dm";

		tileset.root.children[0].children.push({
			boundingVolume: {
				box: newBox,
			},
			content: {
				uri: newUri,
			},
			geometricError: 0,
		});
	}

	const tilesetName = "tileset.json";
	fs.writeFileSync(tilesetName, JSON.stringify(tileset, null, 2));
	return tilesetName;
}

module.exports = {
	simplified,
	simplifiedOctree,
	writeGLTF,
	convertGLBtoB3DM,
	convertGLTFtoGLB,
	write,
	writeTilesetTotal,
};
