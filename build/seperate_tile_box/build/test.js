const Cesium = require("cesium");
const longitude = 129.5089;
const latitude = 42.8913;
const height = 100;

const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

const heading = 10; // in degree
const pitch = 0; // in degree
const roll = 0; // in degree

const hpr = new Cesium.HeadingPitchRoll(
	Cesium.Math.toRadians(heading),
	Cesium.Math.toRadians(pitch),
	Cesium.Math.toRadians(roll),
);

const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
	position,
	hpr,
);

console.log(modelMatrix);
