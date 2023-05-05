# FINAL PROJECT in Hanoi University of Science and Technology

Hi! This is the project I developed to stream the 3D scenes into web.

In this project, I took the opensource of Cesium as the main base to develop

The data of objects, such as buildings, trees, roads,... all are taken from Openstreetmap.

After getting the .osm file from openstreetmap.com (you can modify the range of geometry that you want to gain data).

Using OSM2World to convert the .osm to .glTF (also opensource).

Following this, convert the .glTF file into .b3dm files and create the 3D tileset. At this stage, you can use the Cesium ion as a middleware to import the .gltf and export the 3D tile base on the data that you put in.

Run this app. 

"npm install"
"node server.js"

Hope you enjoy!
