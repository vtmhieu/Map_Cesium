let indicesList1 = [
	[0, 1, 2],
	[3, 4, 1],
	[2, 3, 4],
];
let vertexList1 = [
	[0, 0, 1],
	[1, 1, 0],
	[1, 2, 1],
	[1, 2, 5],
	[0, 1, 1],
];
let normalList1 = [
	[0, 1, 1],
	[1, 1, 0],
	[1, 0, 1],
	[-1, 0, 1],
	[1, 0, -1],
];

let indicesList2 = [
	[0, 1, 2],
	[3, 4, 1],
	[2, 3, 4],
];
let vertexList2 = [
	[23, 0, 1],
	[11, 1, 0],
	[1, 20, 1],
	[1, 212, 5],
	[23, 1, 1],
];
let normalList2 = [
	[1, 1, 1],
	[1, 0, 0],
	[1, 1, 1],
	[-1, 0, 1],
	[1, 1, -1],
];
function reIndexIndices(indicesList2, vertexList1) {
	for (let indices of indicesList2) {
		for (let i = 0; i < 3; i++) {
			let temp = indices[i] + vertexList1.length;
			indices[i] = temp;
		}
	}
	//console.log(indicesList2);
	return indicesList2;
}

// const combineIndices = indicesList1.concat(indicesList2);
// console.log(combineIndices);

indicesList2 = reIndexIndices(indicesList2, vertexList1);

function combineAll(
	indicesList1,
	indicesList2,
	vertexList1,
	vertexList2,
	normalList1,
	normalList2,
) {
	const combineIndices = indicesList1.concat(indicesList2);
	const combineVertex = vertexList1.concat(vertexList2);
	const combineNormal = normalList1.concat(normalList2);

	// console.log(combineIndices);
	// console.log(combineVertex);
	// console.log(combineNormal);

	const object = {
		IndicesList: combineIndices,
		PositionList: combineVertex,
		NormalList: combineNormal,
	};
	return object;
}

const object = combineAll(
	indicesList1,
	indicesList2,
	vertexList1,
	vertexList2,
	normalList1,
	normalList2,
);

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

	console.log(newIndices);
	console.log(newPositions);
	console.log(newNormals);

	// const IVN = {
	// 	indices: newIndices.flat(),
	// 	positions: newPositions.flat(),
	// 	normals: newNormals.flat(),
	// };
	// //console.log(IVN);
	// return IVN;
}

simplified(object.NormalList, object.PositionList, object.IndicesList);
