window.startup = async function (Cesium) {
	"use strict";

	const viewer = new Cesium.Viewer("cesiumContainer", {
		baseLayer: Cesium.ImageryLayer.fromProviderAsync(
			Cesium.TileMapServiceImageryProvider.fromUrl(
				Cesium.buildModuleUrl("/cesium/Source/Assets/Textures/NaturalEarthII"),
			),
		),
		//baseLayerPicker: false,
		geocoder: false,
	});

	//const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
	// add Cesium OSM building to scene as our example 3D tileset
	/*const osmBuildingsTileset = await Cesium.createOsmBuildingsAsync();
  viewer.scene.primitives.add(osmBuildingsTileset);*/

	viewer.scene.globe.depthTestAgainstTerrain = true;

	viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);

	//const inspectorViewModel = viewer.cesium3DTilesInspector.viewModel;
	let drawcall = [];
	let osmBuildingsTileset;
	try {
		osmBuildingsTileset = await Cesium.Cesium3DTileset.fromUrl(
			"../tileset.json",

			{ enableDebugWireframe: true },
		);
		viewer.scene.primitives.add(osmBuildingsTileset);
		// osmBuildingsTileset.initialTilesLoaded.addEventListener(function () {
		// 	console.log("Initial tiles are loaded");
		// });

		osmBuildingsTileset.maximumScreenSpaceError = 100;
		const startTimenow = performance.now();
		let startTime = performance.now();
		viewer.zoomTo(osmBuildingsTileset);
		osmBuildingsTileset.initialTilesLoaded.addEventListener(function () {
			const endTime = performance.now();
			console.log(
				"Initial tiles are loaded after " +
					(endTime - startTimenow) / 1000 +
					" seconds",
			);
			printProgress(drawcall);
		});
		osmBuildingsTileset.loadProgress.addEventListener(function (
			numberOfPendingRequests,
			numberOfTilesProcessing,
		) {
			//let sum = 0;
			const endTime = performance.now();
			const duration = (endTime - startTime) / 1000;
			const totalDuration = (endTime - startTimenow) / 1000;
			if (numberOfPendingRequests === 0 && numberOfTilesProcessing === 0) {
				console.log("Stopped loading");
				return;
			}

			console.log(
				`Loading: requests: ${numberOfPendingRequests}, processing: ${numberOfTilesProcessing}, duration: ${duration} seconds`,
			);
			drawcall.push({
				processing: numberOfTilesProcessing,
				time: totalDuration,
			});
			//sum += duration;
			startTime = endTime;
		});

		// while (!osmBuildingsTileset.tilesLoaded) {
		// 	console.log("loading");
		// }
		// console.log("Loaded");
	} catch (error) {
		console.log(error.message);
	}
	// viewer.scene.camera.setView({
	// 	destination: Cesium.Cartesian3.fromDegrees(105, 22, -10),
	// 	orientation: {
	// 		heading: Cesium.Math.toRadians(0),
	// 		pitch: Cesium.Math.toRadians(0),
	// 	},
	// });
};
if (typeof Cesium !== "undefined") {
	window.startupCalled = true;
	window.startup(Cesium).catch((error) => {
		"use strict";
		console.error(error);
	});
	Sandcastle.finishedLoading();
}

function printProgress(data) {
	const jsonData = JSON.stringify(data, null, 2); // The third argument (2) is for indentation (optional)

	console.log(jsonData);
}
