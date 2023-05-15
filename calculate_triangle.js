// Install gltf-pipeline library using npm or yarn
// npm install gltf-pipeline

const fs = require('fs');
const { gltfValidation } = require('gltf-pipeline');

// Read the glTF file
//const gltfData = fs.readFileSync('/home/hieuvu/DATN/Map_Cesium/gltf/Gear2.gltf', 'utf8');
const gltfData = fs.readFileSync('/home/hieuvu/DATN/Map_Cesium/cesium/Specs/Data/Cesium3DTiles/GltfContentWithCopyright/glTF/parent.gltf', 'utf8');

const gltf = JSON.parse(gltfData);

// Validate the glTF


// Access the mesh data
const meshes = gltf.meshes;

// Calculate the total number of triangles
let totalTriangles = 0;

meshes.forEach((mesh) => {
  const primitives = mesh.primitives;

  primitives.forEach((primitive) => {
    const indicesAccessor = gltf.accessors[primitive.indices];
    const trianglesCount = indicesAccessor.count / 3; // Each triangle has 3 vertices

    totalTriangles += trianglesCount;
  });
});

console.log('Total triangles:', totalTriangles);



