# FINAL PROJECT at Hanoi University of Science and Technology

This project developing a tool to divide data of 3D objects based on glTF file to a tileset in terms of 3D Tiles specifications.

The main goals of this project is to develop a tiling method to upgrade the rendering time of the objects to website or any other applications.

In this project, I took the opensource of Cesium JS for the client side.

The data of objects, such as buildings, trees, roads,... all are taken from Openstreetmap.

After getting the .osm file from openstreetmap.com (you can modify the range of geometry that you want to gain data), use OSM2World to convert the .osm to .glTF (also opensource).

There are two method of Tiling proposed in this project: Static Octree Tiling and Dynamic Octree Tiling.

![image](https://github.com/vtmhieu/Map_Cesium/assets/88451173/40e741f6-057e-4a0e-bc4b-91cd42b4009b)

# Run application

- node server.js
- choose the "best.gltf" as input on the website, choose method and maximum num of triangles (recommend 2000 - 3500)
- wait for generating and rendering

# Get gltf file 
- Go on OpenStreetMap to download a random osm file
- open OSM2World
- convert 



