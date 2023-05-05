const fs = require("fs");
const { gltfToGlb } = require("gltf-pipeline");
const { convert } = require("3d-tiles-tools");

// Load the glTF file
const gltfData = fs.readFileSync('/home/hieuvu/DATN/Map_Cesium/worker/data/map.gltf',  "utf8");

// Convert the glTF file to binary glTF format
const glbData = gltfToGlb(JSON.parse(gltfData)).glb;

// Convert the binary glTF file to a 3D Tiles tileset
const tileset = {
  input: glbData,
  outputDirectory: '/home/hieuvu/DATN/Map_Cesium',
  tilesetName: 'Tileset_DHBKHN',
  // tilesetOptions: { tileWidth: 10000 }
};

console.log(convert);
// convert(tileset)
// .then(() => {
//   console.log("Conversion complete!");
// })
// .catch((error) => {
//   console.log(`Conversion failed: ${error}`);
// });
// // Save the tileset to a file
// fs.writeFileSync('tileset.json', JSON.stringify(tileset));
