"use strict";

window.addEventListener('load', () => {
	let app = new App();

	app.extend((app) => {
		// lighting.
		let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
		directionalLight.position.set(0.01, 1, 0);
		app.scene.add(directionalLight); // for testing purposes.

		let ambientLight = new THREE.AmbientLight(0x404040);
		app.scene.add(ambientLight);
	});

	// setup terrain.
	let resources = Promise.all([
		Utilities.loadImage('resources/textures/heightmap.png'),
		Utilities.loadTexture('resources/textures/grass_01.jpg'),
		Utilities.loadTexture('resources/textures/snowy_rock_01.png'),
		Utilities.loadTexture('resources/textures/splatmap_01.png')
	]);

	app.extend(resources.then((resources) => {
		// return the callback function that will be called once the heightmap has been loaded.
		return (app) => {
			let width = 10000;

			let geometry = new TerrainBufferGeometry({
				heightmapImage: resources[0],
				width,
				height: 1800,
				levelsOfDetail: 5,
				numberOfSubdivisions: 16
			});

            console.log(geometry);

			let grass = resources[1];
	    	grass.wrapS = THREE.RepeatWrapping;
			grass.wrapT = THREE.RepeatWrapping;
			grass.repeat.set(width/80, width/80);

			let snowyRock = resources[2];
	        snowyRock.wrapS = THREE.RepeatWrapping;
	        snowyRock.wrapT = THREE.RepeatWrapping;
	        snowyRock.repeat.set(width/300, width/300);

        	let splatMap1 = resources[3];

	        let material = new TextureSplattingMaterial({
	            color: 0x777777,
	            shininess: 0,
	            textures: [snowyRock, grass],
	            splatMaps: [splatMap1]
	        });


			app.terrain = new THREE.Mesh(geometry, material);

			//app.scene.add(app.terrain);

            let j = 0;

            app.updatables.push((delta) => {

                if (j > 160) {
                    j = 0;

                    app.scene.remove(app.wireframeTerrain);

                    let G = new THREE.BufferGeometry();

                    let length = geometry.index.updateRange.count;

                    let verticesArray = new Float32Array(length * 3);
                    let normalsArray = new Float32Array(length * 3);
                    let uvsArray = new Float32Array(length * 2);

                    let v = 0;
                    let u = 0;
                    for (let i = 0; i < length; i++) {

                        verticesArray[v + 0] = geometry.attributes.position.array[(geometry.index.array[i] * 3) + 0];
                        verticesArray[v + 1] = geometry.attributes.position.array[(geometry.index.array[i] * 3) + 1];
                        verticesArray[v + 2] = geometry.attributes.position.array[(geometry.index.array[i] * 3) + 2];

                        normalsArray[v + 0] = geometry.attributes.normal.array[(geometry.index.array[i] * 3) + 0];
                        normalsArray[v + 1] = geometry.attributes.normal.array[(geometry.index.array[i] * 3) + 1];
                        normalsArray[v + 2] = geometry.attributes.normal.array[(geometry.index.array[i] * 3) + 2];

                        uvsArray[u + 0] = geometry.attributes.uv.array[(geometry.index.array[i] * 2) + 0];
                        uvsArray[u + 1] = geometry.attributes.uv.array[(geometry.index.array[i] * 2) + 1];

                        v += 3;
                        u += 2;
                    }

                    let positionAttrib = new THREE.BufferAttribute(verticesArray, 3);
                    let normalAttrib = new THREE.BufferAttribute(normalsArray, 3);
                    let uvAttrib = new THREE.BufferAttribute(uvsArray, 2);

                    G.addAttribute('position', positionAttrib);
                    G.addAttribute('normal', normalAttrib);
                    G.addAttribute('uv', uvAttrib);

                    let wireframeGeometry = new THREE.WireframeGeometry(G);
                    let wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x777777 });

                    app.wireframeTerrain = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);

                    app.scene.add(app.wireframeTerrain);
                }
                
                j++;
            });
		};
	}));

   //  //Load a list of objects!
   //  //{ geometryUrl: "object-url", materialUrl: "material-url"}
   //  app.extend(Promise.all([// I'll load them later
   //      {
   //          geometryUrl: "resources/models/lowpolytree2/lowpolytree2.obj",
   //          materialUrl: "resources/models/lowpolytree2/lowpolytree2.mtl",
   //          parameters: {
   //              upperPlacementBound: 800, // Tree line, upper
   //              lowerPlacementBound: 0, //Tree line lower
   //              minScale: 1,
   //              maxScale: 3.5,
   //              size: 2,// size*scale = minimum distance to next object
   //              verticalDisplacement: 0, // vd*scale used to move the object down in to the ground.
   //              numberOfObjects: 500
   //          }
   //      },
   //      {
   //          geometryUrl: "resources/models/rock/rock.obj",
   //          materialUrl: "resources/models/rock/rock.mtl",
   //          parameters: {
   //              upperPlacementBound: 1300,
   //              lowerPlacementBound: 0,
   //              minScale: 5,
   //              maxScale: 40,
   //              size: 100,// size*scale = minimum distance to next object
   //              verticalDisplacement: 0, // vd*scale used to move the object down in to the ground.
   //              numberOfObjects: 300
   //          }
   //      }
   //  ].map((source) => {
   //      return Utilities.OBJLoader(source.geometryUrl, Utilities.MTLLoader(source.materialUrl)).then((object) => {

   //          return Promise.resolve({
   //              object,
   //              parameters: source.parameters
			// });
   //      });
   //  })).then((objects) => { //When promises have resolved (models loaded)

   //      return (app) => {
   //          //Parse that list to decorations class
   //          let decorations = new TerrainElements(objects, app);
   //          for(let i = 0; i < decorations.nodelist.length; i++) {
   //              app.scene.add(decorations.nodelist[i]);
   //          }
   //      }
   //  }));

	// setup camera.
	app.extend((app) => {
		let controls = new CameraControls(app.camera, app.renderer.domElement, 250, 0.02);
		app.scene.add(controls.object);
		controls.object.position.z = 0;
		controls.object.position.y = 950;

		let pm = new THREE.MeshBasicMaterial({ color: 0xff0000 });
		let pg = new THREE.CubeGeometry(20, 20, 20, 20);
		let player = new THREE.Mesh(pg, pm);

		app.scene.add(player);
        this.controls = controls;

        app.updatables.push((delta) => {
			controls.update(delta);

			player.position.copy(controls.object.position);

			// update terrain lod.
			let position = app.terrain.worldToLocal(controls.object.position.clone());
			app.terrain.geometry.update(position.x, position.z, 300);
		});
	});

	// //add water with dynamic envMapping
	// app.extend((app) => {

	// 	let cubecam = new THREE.CubeCamera(app.zNear, app.zFar, 512);
	// 	cubecam.renderTarget.mapping = THREE.CubeRefractionMapping;

 //        let w = new Water(1200, 1300, cubecam.renderTarget);
 //        w.object.position.set(150, 850, -320);
 //        w.object.rotation.set(0, ((Math.PI * 2) / 3), 0);

 //        cubecam.position.copy(w.object.position);
 //        cubecam.position.x += 50;

 //        app.scene.add(w.object);

	// 	app.updatables.push((delta) => {
 //            w.normalMap.offset.x += 0.01 * delta;
 //            w.normalMap.offset.y += 0.01 * delta;
 //            cubecam.update(app.renderer, app.scene);
 //        });
	// });


 //    // add skydome.
 //    app.extend(Utilities.loadTexture('resources/img/skybox/panorama1.jpg').then((panorama) => {
 //        return (app) => {

 //            let geometry = new THREE.SphereGeometry(25000, 60, 60);

 //            let material = new THREE.MeshBasicMaterial({
 //                map: panorama,
 //                side: THREE.DoubleSide,
 //                opacity: 0.3,
 //                transparent: true,
 //                fog: false
 //            });

 //            this.skyDome = new THREE.Mesh(geometry, material);

 //            this.skyDome.scale.set(-1, 1, 1);
 //            this.skyDome.rotation.order = 'XZY';
 //            this.skyDome.renderDepth = 1000.0;

 //            app.scene.add(this.skyDome);

 //            app.updatables.push((delta) => {
 //                this.skyDome.position.copy(this.controls.object.position);
 //            });
 //        }
 //    }));


 //    //add a circling airplane
 //    app.extend(Utilities.OBJLoader('resources/models/airplane/plane222.obj', Utilities.MTLLoader('resources/models/airplane/plane222.mtl')).then((model) => {
 //        return (app) => {

 //            model.scale.set(1.5, 1.5, 1.5);

 //            let airplane = new Airplane(model, 15);

 //            app.updatables.push((delta) => {
 //                airplane.update(delta);
 //            });

 //            app.scene.add(model);
 //        };
 //    }));
    

    // start rendering once everything has loaded.
	app.start();
});
