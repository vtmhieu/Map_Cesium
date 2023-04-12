const viewer = new Cesium.Viewer("cesiumContainer", {
    terrant: Cesium.Terrain.fromWorldTerrain(),
  });
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  // add Cesium OSM building to scene as our example 3D tileset
  const osmBuildingsTileset = await Cesium.createOsmBuildingsAsync();
  viewer.scene.primitives.add(osmBuildingTilesets);

  // Set the initial camera to look at Seattle = set the initial location of camera
  viewer.scene.camera.setView({
    destination: Cesium.Cartestian3.fromDegrees(-122.3472, 47.598, 3700),
    orientation:{
      heading: Cesium.Math.toRadians(10),
      pitch: Cesium.Math.toRadians(-10),

    },
  });


  //Styling functions

  //color by material checks for null values since not all
  //buildings have the material property

  function colorByMaterial(){
    osmBuildingTilesets.style = new Cesium.Cesium3DTileStyle({
      defines:{
        material: "${feature['building:material']}",
      },
      color:{
        conditions: [
        ["${material} === null", "color('white')"],
        ["${material} === 'glass'", "color('skyblue', 0.5)"],
        ["${material} === 'concrete'", "color('grey')"],
        ["${material} === 'brick'", "color('indianred')"],
        ["${material} === 'stone'", "color('lightslategrey')"],
        ["${material} === 'metal'", "color('lightgrey')"],
        ["${material} === 'steel'", "color('lightsteelblue')"],
        ["true", "color('white')"], // else case -> white
        ],
      },
    });
  }

  //function to hightlight all the resident building
  function highlightAllResidentialBuildings(){
    osmBuildingTilesets.style = new Cesium.Cesium3DTileStyle({
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
  function showByBuildingType(buildingType){
    switch(buildingType){
        case "office":
            osmBuildingTileset.style = new Cesium.Cesium3DTileStyle({
            show: "${feature['building']} === 'office'",
        });
        break;

        case "apartments":
            osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
                show: "${feature['building]} === 'apartments'",
            });
            break;
        default:
            break;

    }
  }

  //color the building based on their distance from a selected central location
  function colorByDistanceToCoordinate(pickedLatitude,pickedLongitude){
    osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
        defines:{
            distance: `distance(vec2(\${feature['cesium#longitude']}, \${feature['cesium#latitude']}), vec2(${pickedLongitude},${pickedLatitude}))`,
        },
        color:{
            conditions:[
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
  function removeCoordinatePickingOnLeftClick(){
    document.querySelector(".infoPanel").style.visibility = "hidden";
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  //add event listeners to dropdown menu options
  document.querySelector(".infoPanel").style.visibility = "hidden"
  const menu = document.getElementById("dropdown");



  menu.options[0].onselect = function(){
    removeCoordinatePickingOnLeftClick();
    colorByMaterial();
  };



  menu.options[1].onslect = function(){
    colorByDistanceToCoordinate(47.62051, -122.34931);
    document.querySelector(".infoPanel").style.visibility = "visible";

    handler.setInputAction(function(movement){
        viewer.selectEntity = undefined;
        const pickedBuilding = viewer.scene.pick(movement.position);
        if (pickedBuilding){
            const pickedLatitude = pickedBuilding.getProperty("cesium#latitude");
            const pickedLongitude = pickedBuilding.getProperty("cesium#longitude");
            colorByDistanceToCoordinate(pickedLatitude, pickedLongitude);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  };


  menu.options[2].onselect = function(){
    removeCoordinatePickingOnLeftClick();
    highlightAllResidentialBuildings();
  };

  menu.option[3].onselect = function(){
    removeCoordinatePickingOnLeftClick();
    showByBuildingType("office");
  };
  
  menu.option[4].onselect = function(){
    removeCoordinatePickingOnLeftClick();
    showByBuildingType("apartments");
  };

  menu.onchange = function(){
    const item = menu.option[menu.selectionIndex];
    if (item && typeof item.onselect == "function"){
        item.onslect();
    }
  };

  colorByMaterial();