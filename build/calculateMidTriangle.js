function CalculateMidTriangle(
	triangleIndices,
	indicesBufferData,
	byteStride,
	componentType,
) {
	const componentTypeSize = getComponentTypeSize(componentType);

	const vertex1Index = triangleIndices[0];
	const vertex2Index = triangleIndices[1];
	const vertex3Index = triangleIndices[2];

	const vertex1Offset = vertex1Index * byteStride;
	const vertex2Offset = vertex2Index * byteStride;
	const vertex3Offset = vertex3Index * byteStride;

	let vertex1X, vertex1Y, vertex1Z;
	let vertex2X, vertex2Y, vertex2Z;
	let vertex3X, vertex3Y, vertex3Z;

	if (componentType === 5120) {
		// BYTE
		vertex1X = indicesBufferData.readInt8(vertex1Offset) / 127;
		vertex1Y = indicesBufferData.readInt8(vertex1Offset + 1) / 127;
		vertex1Z = indicesBufferData.readInt8(vertex1Offset + 2) / 127;

		vertex2X = indicesBufferData.readInt8(vertex2Offset) / 127;
		vertex2Y = indicesBufferData.readInt8(vertex2Offset + 1) / 127;
		vertex2Z = indicesBufferData.readInt8(vertex2Offset + 2) / 127;

		vertex3X = indicesBufferData.readInt8(vertex3Offset) / 127;
		vertex3Y = indicesBufferData.readInt8(vertex3Offset + 1) / 127;
		vertex3Z = indicesBufferData.readInt8(vertex3Offset + 2) / 127;
	} else if (componentType === 5121) {
		// UNSIGNED_BYTE
		vertex1X = indicesBufferData.readUInt8(vertex1Offset) / 255;
		vertex1Y = indicesBufferData.readUInt8(vertex1Offset + 1) / 255;
		vertex1Z = indicesBufferData.readUInt8(vertex1Offset + 2) / 255;

		vertex2X = indicesBufferData.readUInt8(vertex2Offset) / 255;
		vertex2Y = indicesBufferData.readUInt8(vertex2Offset + 1) / 255;
		vertex2Z = indicesBufferData.readUInt8(vertex2Offset + 2) / 255;

		vertex3X = indicesBufferData.readUInt8(vertex3Offset) / 255;
		vertex3Y = indicesBufferData.readUInt8(vertex3Offset + 1) / 255;
		vertex3Z = indicesBufferData.readUInt8(vertex3Offset + 2) / 255;
	} else if (componentType === 5122) {
		// SHORT
		vertex1X = indicesBufferData.readInt16LE(vertex1Offset) / 32767;
		vertex1Y = indicesBufferData.readInt16LE(vertex1Offset + 2) / 32767;
		vertex1Z = indicesBufferData.readInt16LE(vertex1Offset + 4) / 32767;

		vertex2X = indicesBufferData.readInt16LE(vertex2Offset) / 32767;
		vertex2Y = indicesBufferData.readInt16LE(vertex2Offset + 2) / 32767;
		vertex2Z = indicesBufferData.readInt16LE(vertex2Offset + 4) / 32767;

		vertex3X = indicesBufferData.readInt16LE(vertex3Offset) / 32767;
		vertex3Y = indicesBufferData.readInt16LE(vertex3Offset + 2) / 32767;
		vertex3Z = indicesBufferData.readInt16LE(vertex3Offset + 4) / 32767;
	} else if (componentType === 5123) {
		// UNSIGNED_SHORT
		vertex1X = indicesBufferData.readUInt16LE(vertex1Offset) / 65535;
		vertex1Y = indicesBufferData.readUInt16LE(vertex1Offset + 2) / 65535;
		vertex1Z = indicesBufferData.readUInt16LE(vertex1Offset + 4) / 65535;

		vertex2X = indicesBufferData.readUInt16LE(vertex2Offset) / 65535;
		vertex2Y = indicesBufferData.readUInt16LE(vertex2Offset + 2) / 65535;
		vertex2Z = indicesBufferData.readUInt16LE(vertex2Offset + 4) / 65535;

		vertex3X = indicesBufferData.readUInt16LE(vertex3Offset) / 65535;
		vertex3Y = indicesBufferData.readUInt16LE(vertex3Offset + 2) / 65535;
		vertex3Z = indicesBufferData.readUInt16LE(vertex3Offset + 4) / 65535;
	} else if (componentType === 5125) {
		// UNSIGNED_INT
		vertex1X = indicesBufferData.readUInt32LE(vertex1Offset) / 4294967295;
		vertex1Y = indicesBufferData.readUInt32LE(vertex1Offset + 4) / 4294967295;
		vertex1Z = indicesBufferData.readUInt32LE(vertex1Offset + 8) / 4294967295;

		vertex2X = indicesBufferData.readUInt32LE(vertex2Offset) / 4294967295;
		vertex2Y = indicesBufferData.readUInt32LE(vertex2Offset + 4) / 4294967295;
		vertex2Z = indicesBufferData.readUInt32LE(vertex2Offset + 8) / 4294967295;

		vertex3X = indicesBufferData.readUInt32LE(vertex3Offset) / 4294967295;
		vertex3Y = indicesBufferData.readUInt32LE(vertex3Offset + 4) / 4294967295;
		vertex3Z = indicesBufferData.readUInt32LE(vertex3Offset + 8) / 4294967295;
	} else if (componentType === 5126) {
		// FLOAT
		vertex1X = indicesBufferData.readFloatLE(vertex1Offset);
		vertex1Y = indicesBufferData.readFloatLE(vertex1Offset + 4);
		vertex1Z = indicesBufferData.readFloatLE(vertex1Offset + 8);

		vertex2X = indicesBufferData.readFloatLE(vertex2Offset);
		vertex2Y = indicesBufferData.readFloatLE(vertex2Offset + 4);
		vertex2Z = indicesBufferData.readFloatLE(vertex2Offset + 8);

		vertex3X = indicesBufferData.readFloatLE(vertex3Offset);
		vertex3Y = indicesBufferData.readFloatLE(vertex3Offset + 4);
		vertex3Z = indicesBufferData.readFloatLE(vertex3Offset + 8);
	}

	const midX = (vertex1X + vertex2X + vertex3X) / 3;
	const midY = (vertex1Y + vertex2Y + vertex3Y) / 3;
	const midZ = (vertex1Z + vertex2Z + vertex3Z) / 3;

	return { x: midX, y: midY, z: midZ };
}
