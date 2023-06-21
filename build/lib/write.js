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

async function write(IVN, name) {
	try {
		await writeGLTF(IVN, name);
		await convertGLTFtoGLB(name);
		await convertGLBtoB3DM(name);
		await writeTileset(name);
	} catch (error) {
		console.error("An error occurred:", error.message);
	}
}

async function writeGLTF(IVN, name) {
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

	//Encode indices
	const indicesBuffer = new Uint16Array(IVN.indices);
	const indicesDataURI = encodeToDataURI(indicesBuffer.buffer);
	const indicesBufferView = createBufferView(indicesBuffer, 0);
	const indicesAccessor = createIndicesAccessor(
		indicesBuffer,
		0,
		"SCALAR",
		5123,
	);

	//Encode positions
	const positionsBuffer = new Float32Array(IVN.positions);
	const positionsDataURI = encodeToDataURI(positionsBuffer.buffer);
	const positionsBufferView = createBufferView(positionsBuffer, 1);
	const positionsAccessor = createPositionAccessor(
		positionsBuffer,
		1,
		"VEC3",
		5126,
		IVN.positions,
	);

	//Encode normals
	const normalsBuffer = new Float32Array(IVN.normals);
	const normalsDataURI = encodeToDataURI(normalsBuffer.buffer);
	const normalsBufferView = createBufferView(normalsBuffer, 2);
	const normalsAccessor = createNormalAccessor(
		normalsBuffer,
		2,
		"VEC3",
		5126,
		IVN.normals,
	);

	//Create mesh and primitives
	const primitive = {
		mode: 4,
		indices: 0,
		attributes: {
			POSITION: 1,
			NORMAL: 2,
		},
	};

	const mesh = {
		primitives: [primitive],
	};

	glTFData.accessors.push(indicesAccessor, positionsAccessor, normalsAccessor);
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
	);

	//push BufferViews
	glTFData.bufferViews.push(
		indicesBufferView,
		positionsBufferView,
		normalsBufferView,
	);

	const gltf = JSON.stringify(glTFData, null, 2);
	fs.writeFile("./output/gltf/" + name + ".gltf", gltf, "utf8", (err) => {
		if (err) {
			console.error("Error writing glTF file:", err);
		} else {
			console.log("glTF file written successfully!");
		}
	});
}

function createBufferView(buffer, index, byteOffset = 0) {
	return {
		buffer: index,
		byteOffset: byteOffset,
		byteLength: buffer.byteLength,
		//target: 34963,
	};
}

function createIndicesAccessor(bufferView, index, type, componentType) {
	return {
		bufferView: index,
		byteOffset: 0,
		componentType: componentType,
		count: bufferView.byteLength / ByteStride(componentType, type),
		min: [0],
		max: [bufferView.byteLength / ByteStride(componentType, type) - 1],
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
async function convertGLTFtoGLB(name) {
	// Run the conversion
	const inputFile =
		"/home/hieuvu/DATN/Map_Cesium/output/gltf/" + name + ".gltf";
	const outputFile = "./output/glb/" + name + ".glb";
	try {
		const command = `gltf-pipeline -i ${inputFile} -o ${outputFile}`;
		const result = await runCommand(command);
		console.log(result);
	} catch (error) {
		console.error(`An error occurred: ${error.message}`);
	}
}

async function convertGLBtoB3DM(name) {
	const inputFile = "/home/hieuvu/DATN/Map_Cesium/output/glb/" + name + ".glb";
	const outputFile = "./output/b3dm/" + name + ".b3dm";
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

module.exports = {
	simplified,
	writeGLTF,
	write,
};
