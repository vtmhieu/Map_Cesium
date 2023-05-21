const fs = require('fs');
const path = require('path');
const gltfPipeline = require('gltf-pipeline');
const gltfSplitter = gltfPipeline.gltfSplitter;

const inputFilePath = 'path/to/input.gltf';
const outputDirectory = 'path/to/output';

const gltfData = fs.readFileSync(inputFilePath);
const gltfJson = JSON.parse(gltfData);

const bounds = gltfPipeline.JsonUtils.getBoundingRegion(gltfJson);
const minCoordinates = bounds.min;
const maxCoordinates = bounds.max;

const maxModels = 10; // Set the desired number of models to split into

const splitOptions = {
  input: gltfJson,
  outputDirectory: outputDirectory,
  min: minCoordinates,
  max: maxCoordinates,
  maxModels: maxModels,
};
const splitResult = gltfSplitter.split(splitOptions);
