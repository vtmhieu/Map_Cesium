window.startup = async function (Cesium) {
	"use strict";

	// Cesium.Ion.defaultAccessToken =
	// 	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkOGIyNzkyOS0yOGYwLTRkNWQtYjViNi0xZmIyZmFkNmZlNjciLCJpZCI6MTMwNTkxLCJpYXQiOjE2ODE1NTE5NDV9.eFwl27eq0qznhWe1gBK71xqKF_WbLDwXbHgjiV6Uh-M";
	// const viewer = new Cesium.Viewer("cesiumContainer", {
	// 	terrant: Cesium.Terrain.fromWorldTerrain(),
	// });

	const viewer = new Cesium.Viewer("cesiumContainer", {
		baseLayer: Cesium.ImageryLayer.fromProviderAsync(
			Cesium.TileMapServiceImageryProvider.fromUrl(
				Cesium.buildModuleUrl("/cesium/Source/Assets/Textures/NaturalEarthII"),
			),
		),
		//baseLayerPicker: false,
		geocoder: false,
	});

	const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
	// add Cesium OSM building to scene as our example 3D tileset
	/*const osmBuildingsTileset = await Cesium.createOsmBuildingsAsync();
  viewer.scene.primitives.add(osmBuildingsTileset);*/

	viewer.scene.globe.depthTestAgainstTerrain = true;

	viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
	const inspectorViewModel = viewer.cesium3DTilesInspector.viewModel;
	try {
		const osmBuildingsTileset = await Cesium.Cesium3DTileset.fromUrl(
			//demo 1
			//"../tileset_data/demo_dhbkhn_1/tileset.json",

			//demo 2 combine
			//"../tileset_data/demo_dhbkhn_2_combine/11788/tileset.json",

			//demo 3
			//"../test/data/tileset.json",

			//mau cua Cesium
			//"./cdb-to-3dtiles/Tests/Data/ElevationMoreLODPositiveImagery/VerifiedTileset.json",

			//"../cesium/Specs/Data/Cesium3DTiles/Tilesets/TilesetWithViewerRequestVolume/tileset.json",
			//"../tileset.json",
			//"../1530/tileset.json",
			//"../cotdien/tileset.json",
			//"../output/tileset/00.json",
			"../tileset.json",
			{ enableDebugWireframe: true },
		);
		viewer.scene.primitives.add(osmBuildingsTileset);
		//osmBuildingsTileset.maximumScreenSpaceError = 10;

		viewer.zoomTo(osmBuildingsTileset);
	} catch (error) {
		console.log(`Error loading tileset: ${error}`);
	}

	// Set the initial camera to look at Seattle = set the initial location of camera
	/*viewer.scene.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-1.31968, 0.698874, 370),
    orientation:{
      heading: Cesium.Math.toRadians(10),
      pitch: Cesium.Math.toRadians(-10),

    },
  });
*/

	//Styling functions

	//color by material checks for null values since not all
	//buildings have the material property

	function colorByMaterial() {
		osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
			color: {
				conditions: [
					["${id} === null", "color('white')"],
					["${id} === '0'", "color('skyblue', 0.5)"],
					["${id} === '1'", "color('grey')"],
					["${id} === '3'", "color('indianred')"],
					["${id} === '4'", "color('lightslategrey')"],
					["${id} === '5'", "color('lightgrey')"],
					["${id} === '6'", "color('lightsteelblue')"],
					["true", "color('white')"], // else case -> white
				],
			},
		});
	}

	//function to hightlight all the resident building
	function highlightAllResidentialBuildings() {
		osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
			color: {
				conditions: [
					[
						"${feature['building']} === 'apartments' || ${feature['building']} === 'residential'",
						"color('cyan',0.9)",
					],
					[true, "color('white')"],
				],
			},
		});
	}

	//function to show the buidling type
	function showByBuildingType(buildingType) {
		switch (buildingType) {
			case "office":
				osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
					show: "${feature['building']} === 'office'",
				});
				break;

			case "apartments":
				osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
					show: "${feature['building']} === 'apartments'",
				});
				break;
			default:
				break;
		}
	}

	//color the building based on their distance from a selected central location
	function colorByDistanceToCoordinate(pickedLatitude, pickedLongitude) {
		osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
			defines: {
				distance: `distance(vec2(\${feature['cesium#longitude']}, \${feature['cesium#latitude']}), vec2(${pickedLongitude},${pickedLatitude}))`,
			},
			color: {
				conditions: [
					["${distance} > 0.014", "color('blue')"],
					["${distance} > 0.010", "color('green')"],
					["${distance} > 0.006", "color('yellow')"],
					["${distance} > 0.0001", "color('red')"],
					["true", "color('white')"],
				],
			},
		});
	}

	// When dropdown option is not "Color By Distance to Selected Location"
	// remove the left click input event for selecting a central location
	function removeCoordinatePickingOnLeftClick() {
		document.querySelector(".infoPanel").style.visibility = "hidden";
		handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
	}

	//add event listeners to dropdown menu options
	document.querySelector(".infoPanel").style.visibility = "hidden";
	const menu = document.getElementById("dropdown");

	menu.options[0].onselect = function () {
		removeCoordinatePickingOnLeftClick();
		colorByMaterial();
	};

	menu.options[1].onselect = function () {
		colorByDistanceToCoordinate(47.62051, -122.34931);
		document.querySelector(".infoPanel").style.visibility = "visible";

		handler.setInputAction(function (movement) {
			viewer.selectEntity = undefined;
			const pickedBuilding = viewer.scene.pick(movement.position);
			if (pickedBuilding) {
				const pickedLatitude = pickedBuilding.getProperty("cesium#latitude");
				const pickedLongitude = pickedBuilding.getProperty("cesium#longitude");
				colorByDistanceToCoordinate(pickedLatitude, pickedLongitude);
			}
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	};

	menu.options[2].onselect = function () {
		removeCoordinatePickingOnLeftClick();
		highlightAllResidentialBuildings();
	};

	menu.options[3].onselect = function () {
		removeCoordinatePickingOnLeftClick();
		showByBuildingType("office");
	};

	menu.options[4].onselect = function () {
		removeCoordinatePickingOnLeftClick();
		showByBuildingType("apartments");
	};

	menu.onchange = function () {
		Sandcastle.reset();
		const item = menu.options[menu.selectedIndex];
		if (item && typeof item.onselect === "function") {
			item.onselect();
		}
	};
};
if (typeof Cesium !== "undefined") {
	window.startupCalled = true;
	window.startup(Cesium).catch((error) => {
		"use strict";
		console.error(error);
	});
	Sandcastle.finishedLoading();
}
