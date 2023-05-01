const fs = require('fs');
const { gltfToGlb } = require('gltf-pipeline');
const { convert } = require('3d-tiles-tools');

// Load the glTF file
const gltfData = fs.readFileSync('map.gltf', 'utf8');

// Convert the glTF file to binary glTF format
const glbData = gltfToGlb(JSON.parse(gltfData)).glb;

// Convert the binary glTF file to a 3D Tiles tileset
const tileset = convert({
  input: glbData,
  outputDirectory: 'tileset',
  tilesetOptions: { tileWidth: 100 }
});

// Save the tileset to a file
fs.writeFileSync('tileset.json', JSON.stringify(tileset));
