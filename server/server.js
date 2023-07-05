const express = require("express");
const multer = require("multer");
const process = require("../middleware/middleware.js");

const app = express();
const upload = multer({ dest: "../middleware/data/" });

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("."));

// http://expressjs.com/en/starter/basic-routing.htmls
app.get("/", function (request, response) {
	response.sendFile("../client/welcome.html");
});
app.post("/upload", upload.single("file"), function (request, response) {
	const file = request.file;
	const type = request.body.tilingType;
	const maxTriangles = request.body.maxTriangles;

	process.process(file, maxTriangles, type);

	const res = {
		message: "info received and being tiling",
		file: file.originalname,
		type: type,
		maxTriangles: maxTriangles,
	};

	response.json(res);
	response.sendFile("./index.html");
});

// listen for requests :)
const listener = app.listen("6060", function () {
	console.log("Your app is listening on port " + listener.address().port);
});

// const Websocket = require('ws');
// const wss = Websocket.Server({port: 3000});
