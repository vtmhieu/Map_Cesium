const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const process = require("./middleware/middleware.js");

const app = express();
const upload = multer({ dest: "../middleware/data/" });

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("."));

// http://expressjs.com/en/starter/basic-routing.htmls

app.get("/favicon.ico", (req, res) => {
	res.status(204).end();
});

app.get("/", function (request, response) {
	response.sendFile(__dirname + "/server/welcome.html");
});
app.post("/upload", upload.single("file"), function (req, res) {
	const maxTriangles = req.body.maxTriangles;
	const tilingType = req.body.tilingType;

	if (!req.file) {
		return res.status(400).send("No file uploaded.");
	}

	const originalFileName = req.file.originalname;
	const fileExtension = path.extname(originalFileName);

	const uniqueFileName = `${Date.now()}_${Math.floor(
		Math.random() * 10000,
	)}${fileExtension}`;

	// Specify the desired file storage location
	const storageLocation = path.join(__dirname, "data", uniqueFileName);

	// Move the uploaded file to the specified location
	// Move the uploaded file to the specified location
	fs.rename(req.file.path, storageLocation, (err) => {
		if (err) {
			console.error(err);
			return res.status(500).send("Error occurred while saving the file.");
		}

		// Process the file, maxTriangles, and tilingType as needed
		console.log("File:", uniqueFileName);
		console.log("url: ", storageLocation);
		console.log("Max Triangles:", maxTriangles);
		console.log("Tiling Type:", tilingType);

		const tileset = process.process(storageLocation, maxTriangles, tilingType);
		res.send(tileset);
	});
});
app.get("/index", function (req, res) {
	res.sendFile(__dirname + "/server/index.html");
});

// listen for requests :)
const listener = app.listen("6060", function () {
	console.log("Your app is listening on port " + listener.address().port);
});
