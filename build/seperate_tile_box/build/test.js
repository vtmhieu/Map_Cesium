const boundingVolume = {
	max: [108.12000274658203, 10, 107.5009994506836],
	min: [-179.91000366210938, 0, -89.76899719238281],
};
function multiplyMatrixVector(matrix, vector) {
	const result = [];
	for (let i = 0; i < 4; i++) {
		let sum = 0;
		for (let j = 0; j < 4; j++) {
			sum += matrix[i * 4 + j] * vector[j];
		}
		result.push(sum);
	}
	return result;
}
// Transformation matrix
const transformMatrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1];

// Apply transformation matrix to min point
const minPoint = [
	boundingVolume.min[0],
	boundingVolume.min[2],
	-boundingVolume.min[1],
	1,
];
const transformedMin = multiplyMatrixVector(transformMatrix, minPoint);

// Apply transformation matrix to max point
const maxPoint = [
	boundingVolume.max[0],
	boundingVolume.max[2],
	-boundingVolume.max[1],
	1,
];
const transformedMax = multiplyMatrixVector(transformMatrix, maxPoint);

// Update the bounding volume with the transformed values
const transformedBoundingVolume = {
	min: [transformedMin[0], transformedMin[2], -transformedMin[1]],
	max: [transformedMax[0], transformedMax[2], -transformedMax[1]],
};

console.log(transformedBoundingVolume);
