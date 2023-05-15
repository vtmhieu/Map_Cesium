const Cesium = require('cesium');
const fs = require('fs');
const gltfPipeline = require('gltf-pipeline');
const gltfToGlb = require('gltf-pipeline').gltfToGlb;
const fetch = require('node-fetch');

// Path to the original GLTF file
const originalFilePath = '/home/hieuvu/DATN/Map_Cesium/cesium/Specs/Data/Cesium3DTiles/GltfContentWithCopyright/glTF/parent.gltf';

// Maximum number of triangles per tile
const maxTrianglesPerTile = 100;

// Output directory to save the sub-GLB files
const outputDirectory = '~/DATN/cesium/test/data_return';

async function fetchArrayBuffer(filePath) {
  if (filePath.startsWith('http')) {
    const response = await fetch(filePath);
    return response.arrayBuffer();
  } else {
    return fs.readFileSync(filePath);
  }
}
// Load the original GLTF file using Cesium's built-in GLTF loader
fetchArrayBuffer(originalFilePath)
  
  .then(arrayBuffer => {
    const gltf = JSON.parse(new TextDecoder().decode(arrayBuffer));
    //const gltf = JSON.parse(arrayBuffer)
    //console.log(gltf);
    const tileset = new Cesium.Cesium3DTileset(gltf);
//
    var meshPrimitives = gltf.meshes[0].primitives;
    var triangleCount= 0;
    for (var i=0; i< meshPrimitives.length; i++){
      var primitive = meshPrimitives[i];

    // Check if the primitive is a triangle mesh
      if (primitive.mode === Cesium.PrimitiveType.TRIANGLES) {
      // Get the indices array
        var indices = gltf.accessors[primitive.indices];
      
      // Each triangle has 3 indices
        var numTriangles = indices.length / 3;
      
        triangleCount += numTriangles;
    }}
    console.log(triangleCount);
  }).catch(error => console.log(error));
//
    // Perform implicit tiling based on the maximum number of triangles per tile
  //   const tiles = [];
    
  //   gltf.nodes.forEach((node)=>{
  //     if(node.mesh != undefined){
  //       const mesh = gltf.meshes[node.mesh];
  //       mesh.primitives.forEach((primitive)=>{
  //         const trianglesCount = primitive.indices.length/3;
  //         console.log("Number of triangles ",trianglesCount)
  //         if(trianglesCount > maxTrianglesPerTile){

  //         }
  //       })
  //     }
  //   })


  //   //
  //   const stack = [tileset.root];
  //   while (stack.length > 0) {
  //     const tile = stack.pop();

  //     // Check the number of triangles in the tile
  //     if(tile.content){
  //       const trianglesCount = tile.content.trianglesLength / 3;

  //       if (trianglesCount > maxTrianglesPerTile){
  //         tile.getBoundingSphere(Cesium.BoundingSphereScratch);
  //         const childrenTiles = tile.getReplacementTiles(Cesium.BoundingSphereScratch);

  //         stack.push(...childrenTiles);

  //       }else{
  //         tiles.push(tile);
  //       }
  //     }
      
  //     }
    

  //   // Extract and export sub-GLB files for each tile
  //   tiles.forEach((tile, index) => {
  //     const gltf = tile.content;
  //     const glb = gltfToGlb(gltf);

  //     // Save the sub-GLB file to the output directory
  //     const subGlbFilename = `sub_tile_${index}.glb`;
  //     fs.writeFileSync(outputDirectory + subGlbFilename, glb);
  //   });

  //   console.log('Sub-GLB extraction complete.');
  // });
  // //.catch((error) => {
  // //  console.error('Error loading GLTF file:', error);
  // //});
  