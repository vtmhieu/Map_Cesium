let formData = new FormData();
const fileInput = document.getElementById("fileInput");
const maxTriangles = document.getElementById("maxTriangles").value;
const type = document.getElementById("tilingType").value;

formData.append("file", fileInput);
formData.append("maxTriangles", maxTriangles);
formData.append("tilingType", type);

fetch("http://localhost:6060/upload", {
	method: "POST",
	body: formData,
})
	.then((response) => {
		response.json();
	})
	.catch((error) => {
		console.error(error);
	});
