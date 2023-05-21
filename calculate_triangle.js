// Install gltf-pipeline library using npm or yarn
// npm install gltf-pipeline

const fs = require('fs');
const gltfToGlb = require('gltf-pipeline/lib/gltfToGlb');
//const { gltfValidation } = require('gltf-pipeline');

// Read the glTF file
const gltfData = fs.readFileSync('/home/hieuvu/DATN/Map_Cesium/gltf/Gear2.gltf', 'utf8');
//const gltfData = fs.readFileSync('/home/hieuvu/DATN/Map_Cesium/cesium/Specs/Data/Cesium3DTiles/GltfContentWithCopyright/glTF/parent.gltf', 'utf8');

const gltf = JSON.parse(gltfData);

// Validate the glTF


// Access the mesh data
// const meshes = gltf.meshes;

// // Calculate the total number of triangles
// let totalTriangles = 0;

// meshes.forEach((mesh) => {
//   const primitives = mesh.primitives;

//   primitives.forEach((primitive) => {
//     const indicesAccessor = gltf.accessors[primitive.indices];
//     const trianglesCount = indicesAccessor.count / 3; // Each triangle has 3 vertices

//     totalTriangles += trianglesCount;
//   });
// });

// console.log('Total triangles:', totalTriangles);

function countTrianglesInGltf(gltf){
  //const gltf = JSON.parse(gltfData);

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
    return totalTriangles;
  }

function calculateBoundingBox(object) {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  object.meshes.forEach((mesh) => {
    mesh.primitives.forEach(primitive => {
      const positionAccessor = object.accessors[primitive.attributes.POSITION]; 
      //positionAccessor = accessors[meshes.primitives.attributes.POSITION = 0]
   
      const positionBufferView = object.bufferViews[positionAccessor.bufferView];
      // positionBufferView = bufferViews[accessors[0].bufferView = 0]
     
      const positionBuffer = object.buffers[positionBufferView.buffer];
  
      const MaxX = positionAccessor.max[0];
        const MaxY = positionAccessor.max[1];
        const MaxZ = positionAccessor.max[2];
        const MinX = positionAccessor.min[0];
        const MinY = positionAccessor.min[1];
        const MinZ = positionAccessor.min[2];
        
        if (MinX < minX) minX = MinX;
        if (MinY < minY) minY = MinY;
        if (MinZ < minZ) minZ = MinZ;
        if (MaxX > maxX) maxX = MaxX;
        if (MaxY > maxY) maxY = MaxY;
        if (MaxZ > maxZ) maxZ = MaxZ;
    });
  })

  return { minX, minY, minZ, maxX, maxY, maxZ };
}// ok


function createEmptyTile(minX, minY, minZ, maxX, maxY, maxZ){
  const tile = {
    primitives : [],
    children : [],
    boundingBox: {
      minX,
      minY,
      minZ,
      maxX,
      maxY,
      maxZ
    }
  };
  return tile;
}
// function countTrianglesInTile(tile){
//   let count = 0;
//   if (tile.primitives && tile.primitives.length>0){
//     for (const primitive of tile.primitves){
//       if (primitive.mpde === Cesium.PrimitiveType.TRIANGLES){
//         count += primitive.indices.length /3 ;
//       }
//     }
//   }
// }
function countTrianglesInTile(gltf, rootNode, boundingBox) {
  let triangleCount = 0;

  const processNode = (node) => {
    if (node.mesh !== undefined) {
      const mesh = gltf.meshes[node.mesh];
      mesh.primitives.forEach((primitive) => {
        const positionAccessor = gltf.accessors[primitive.attributes.POSITION];
        const triangleCountPerPrimitive = positionAccessor.count / 3;
        triangleCount += triangleCountPerPrimitive;
      });
    }

    if (node.children !== undefined) {
      node.children.forEach((childIndex) => {
        const childNode = gltf.nodes[childIndex];
        processNode(childNode);
      });
    }
  };

  processNode(rootNode);

  return triangleCount;
}


function divideGltgIntoTiles(gltf, maxTrianglesPerTile){
  const tiles = [];
  const scene = gltf.scenes[0];
  const rootNode = scene.nodes[0];
  const rootNodeBoundingBox = calculateBoundingBox(gltf);
  const initialTile = {
    boundingBox: rootNodeBoundingBox,
    triangles: countTrianglesInTile(gltf,rootNode, rootNodeBoundingBox),
  };

  tiles.push(initialTile);

  let TilesToDivide = [initialTile];
  
    const tile = TilesToDivide.pop();
    // if(tile.triangles <= maxTrianglesPerTile){
    //   continue;
    // }

    const { minX, minY, minZ, maxX, maxY, maxZ } = tile.boundingBox;
    const midX = (minX + maxX)/2;
    const midY = (minY + maxY)/2;
    const midZ = (minZ + maxZ)/2;
    const Tile_0 = new createEmptyTile(minX, minY, minZ, midX, maxY, maxZ);
    const Tile_1 = new createEmptyTile(midX, minY, minZ, maxX, maxY, maxZ);
    Tile_0.triangles = countTrianglesInTile(gltf, rootNode, Tile_0.boundingBox);
    console.log("Tile 0: "+ Tile_0.triangles);
    Tile_1.triangles = countTrianglesInTile(gltf, rootNode, Tile_1.boundingBox);
    console.log("Tile 1: "+ Tile_1.triangles);
    //tiles.push(Tile_0, Tile_1);
    //TilesToDivide.push(Tile_0, Tile_1);
  
  
  return tiles;
}


divideGltgIntoTiles(gltf,1000);


