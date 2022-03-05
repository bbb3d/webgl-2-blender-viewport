/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SceneLoader = function (manager) {

	this.onLoadStart = function () {};
	this.onLoadProgress = function () {};
	this.onLoadComplete = function () {};

	this.callbackSync = function () {};
	this.callbackProgress = function () {};

	this.geometryHandlers = {};
	this.hierarchyHandlers = {};

	// this.addGeometryHandler("ascii", THREE.JSONLoader);

	this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;

	this.byRequest = false;

};

THREE.SceneLoader.prototype = {

	constructor: THREE.SceneLoader,

	load: function (url, onLoad, onProgress, onError) {

		var scope = this;

		var loader = new THREE.FileLoader(scope.manager);

		loader.load(url, function (text) {

			scope.parse(JSON.parse(text), onLoad, url);

		}, onProgress, onError);

	},

	addGeometryHandler: function (typeID, loaderClass) {

		this.geometryHandlers[typeID] = {
			"loaderClass": loaderClass
		};

	},

	addHierarchyHandler: function (typeID, loaderClass) {

		this.hierarchyHandlers[typeID] = {
			"loaderClass": loaderClass
		};

	},

	parse: function (json, callbackFinished, url) {

		var scope = this;

		var urlBase = THREE.LoaderUtils.extractUrlBase(url);
		this.urlBase = urlBase;

		var geometry,
		material,
		camera,
		fog,
		texture,
		images,
		color,
		light,
		hex,
		intensity,
		counter_models,
		counter_textures,
		total_models,
		total_textures,
		result;

		var target_array = [];
		var materialsInMeshs = [];
		var texturesInMaterials = [];

		this.materialsInMeshs = materialsInMeshs;
		this.texturesInMaterials = texturesInMaterials;

		var data = json;
		this.data = data;

		// async geometry loaders

		for (var typeID in this.geometryHandlers) {

			var loaderClass = this.geometryHandlers[typeID]["loaderClass"];
			this.geometryHandlers[typeID]["loaderObject"] = new loaderClass();

		}

		// async hierachy loaders

		for (var typeID in this.hierarchyHandlers) {

			var loaderClass = this.hierarchyHandlers[typeID]["loaderClass"];
			this.hierarchyHandlers[typeID]["loaderObject"] = new loaderClass();

		}

		counter_models = 0;
		counter_textures = 0;

		result = {

			scene: new THREE.Scene(),
			geometries: {},
			face_materials: {},
			materials: {},
			textures: {},
			objects: {},
			cameras: {},
			lights: {},
			fogs: {},
			empties: {},
			groups: {}

		};

		this.result = result;

		if (data.transform) {

			var position = data.transform.position || [0, 0, 0],
			rotation = data.transform.rotation || [0, 0, 0],
			scale = data.transform.scale || [1, 1, 1];

			if (position) {

				result.scene.position.fromArray(position);

			}

			if (rotation) {

				result.scene.rotation.fromArray(rotation);

			}

			if (scale) {

				result.scene.scale.fromArray(scale);

			}

			if (position || rotation || scale) {

				result.scene.updateMatrix();
				result.scene.updateMatrixWorld();

			}

		}

		// toplevel loader function, delegates to handle_children

		function handle_objects() {

			handle_children(result.scene, data.objects);

		}

		// handle all the children from the loaded json and attach them to given parent

		function handle_children(parent, children) {

			var mat,
			dst,
			pos,
			rot,
			scl,
			quat;

			for (var objID in children) {

				// check by id if child has already been handled,
				// if not, create new object

				var object = result.objects[objID];
				var objJSON = children[objID];

				if (object === undefined) {

					// meshes

					if (objJSON.type && (objJSON.type in scope.hierarchyHandlers)) {

						if (objJSON.loading === undefined) {

							material = result.materials[objJSON.material];

							objJSON.loading = true;

							var loader = scope.hierarchyHandlers[objJSON.type]["loaderObject"];

							// ColladaLoader

							if (loader.options) {

								loader.load(scope.get_url(objJSON.url, data.urlBaseType), create_callback_hierachy(objID, parent, material, objJSON));

								// UTF8Loader
								// OBJLoader

							} else {

								loader.load(scope.get_url(objJSON.url, data.urlBaseType), create_callback_hierachy(objID, parent, material, objJSON));

							}

						}

					} else if (objJSON.geometry !== undefined) {

						geometry = result.geometries[objJSON.geometry];

						// geometry already loaded

						if (geometry) {

							material = result.materials[objJSON.material];

							pos = objJSON.position || [0, 0, 0];
							rot = objJSON.rotation || [0, 0, 0];
							scl = objJSON.scale || [1, 1, 1];
							mat = objJSON.matrix;
							quat = objJSON.quaternion;

							// use materials from the model file
							// if there is no material specified in the object

							if (!objJSON.material) {

								material = new THREE.MultiMaterial(result.face_materials[objJSON.geometry]);

							}

							// use materials from the model file
							// if there is just empty face material
							// (must create new material as each model has its own face material)

							if ((material instanceof THREE.MultiMaterial) && material.materials.length === 0) {

								material = new THREE.MultiMaterial(result.face_materials[objJSON.geometry]);

							}

							if (objJSON.skin) {

								object = new THREE.SkinnedMesh(geometry, material);

							} else if (objJSON.morph) {

								object = new THREE.MorphAnimMesh(geometry, material);

								if (objJSON.duration !== undefined) {

									object.duration = objJSON.duration;

								}

								if (objJSON.time !== undefined) {

									object.time = objJSON.time;

								}

								if (objJSON.mirroredLoop !== undefined) {

									object.mirroredLoop = objJSON.mirroredLoop;

								}

								if (material.morphNormals) {

									geometry.computeMorphNormals();

								}

							} else {

								object = new THREE.Mesh(geometry, material);

							}

							object.name = objID;

							if (mat) {

								object.matrixAutoUpdate = false;
								object.matrix.set(
									mat[0], mat[1], mat[2], mat[3],
									mat[4], mat[5], mat[6], mat[7],
									mat[8], mat[9], mat[10], mat[11],
									mat[12], mat[13], mat[14], mat[15]);

							} else {

								object.position.fromArray(pos);

								if (quat) {

									object.quaternion.fromArray(quat);

								} else {

									object.rotation.fromArray(rot);

								}

								object.scale.fromArray(scl);

							}

							object.visible = objJSON.visible;
							object.castShadow = objJSON.castShadow;
							object.receiveShadow = objJSON.receiveShadow;

							parent.add(object);

							result.objects[objID] = object;

						}

						// lights

					} else if (objJSON.type === "AmbientLight" || objJSON.type === "PointLight" ||
						objJSON.type === "DirectionalLight" || objJSON.type === "SpotLight" ||
						objJSON.type === "HemisphereLight") {

						var color = objJSON.color;
						var intensity = objJSON.intensity;
						var distance = objJSON.distance;
						var position = objJSON.position;
						var rotation = objJSON.rotation;

						switch (objJSON.type) {

						case 'AmbientLight':
							light = new THREE.AmbientLight(color);
							break;

						case 'PointLight':
							light = new THREE.PointLight(color, intensity, distance);
							light.position.fromArray(position);
							break;

						case 'DirectionalLight':
							light = new THREE.DirectionalLight(color, intensity);
							light.position.fromArray(objJSON.direction);
							break;

						case 'SpotLight':
							light = new THREE.SpotLight(color, intensity, distance);
							light.angle = objJSON.angle;
							light.position.fromArray(position);
							light.target.set(position[0], position[1] - distance, position[2]);
							light.target.applyEuler(new THREE.Euler(rotation[0], rotation[1], rotation[2], 'XYZ'));
							break;

						case 'HemisphereLight':
							light = new THREE.DirectionalLight(color, intensity, distance);
							light.target.set(position[0], position[1] - distance, position[2]);
							light.target.applyEuler(new THREE.Euler(rotation[0], rotation[1], rotation[2], 'XYZ'));
							break;

						}

						parent.add(light);

						light.name = objID;
						result.lights[objID] = light;
						result.objects[objID] = light;

						// cameras

					} else if (objJSON.type === "CombinedCamera" || objJSON.type === "PerspectiveCamera" || objJSON.type === "OrthographicCamera") {

						pos = objJSON.position || [0, 0, 0];
						rot = objJSON.rotation || [0, 0, 0];
						quat = objJSON.quaternion;

						if (objJSON.type === "PerspectiveCamera") {

							camera = new THREE.PerspectiveCamera(objJSON.fov, objJSON.aspect, objJSON.near, objJSON.far);

						} else if (objJSON.type === "OrthographicCamera") {

							camera = new THREE.OrthographicCamera(objJSON.left, objJSON.right, objJSON.top, objJSON.bottom, objJSON.near, objJSON.far);

						}else if (objJSON.type === "CombinedCamera") {

							camera = new THREE.CombinedCamera(objJSON.left, objJSON.right, objJSON.top, objJSON.bottom, objJSON.near, objJSON.far);

						}

						camera.name = objID;
						camera.section_view = objJSON.section_view;
						camera.autoZoom = objJSON.autoZoom;
						camera.position.fromArray(pos);

						if (quat !== undefined) {

							camera.quaternion.fromArray(quat);

						} else if (rot !== undefined) {

							camera.rotation.fromArray(rot);

						}
						if (objJSON.target) {

							camera.lookAt(new THREE.Vector3().fromArray(objJSON.target));
							camera.target = new THREE.Vector3().fromArray(objJSON.target);
						}
						
						if (objJSON.section_view) {

							camera.section_view = objJSON.section_view;
						}
						
						if (objJSON.autoZoom) {

							camera.autoZoom = objJSON.autoZoom;
						}

						parent.add(camera);

						result.cameras[objID] = camera;
						result.objects[objID] = camera;

						if (objJSON.userData !== undefined) {

							for (var key in objJSON.userData) {

								var value = objJSON.userData[key];
								camera.userData[key] = value;

							}

						}

						// pure Object3D

					} else {

						pos = objJSON.position;
						rot = objJSON.rotation;
						scl = objJSON.scale;
						quat = objJSON.quaternion;

						object = new THREE.Object3D();
						object.name = objID;
						object.position.fromArray(pos);

						if (quat) {

							object.quaternion.fromArray(quat);

						} else {

							object.rotation.fromArray(rot);

						}

						object.scale.fromArray(scl);
						object.visible = (objJSON.visible !== undefined) ? objJSON.visible : false;

						parent.add(object);

						result.objects[objID] = object;
						result.empties[objID] = object;

					}

					if (object) {

						if (objJSON.userData !== undefined) {

							for (var key in objJSON.userData) {

								var value = objJSON.userData[key];
								object.userData[key] = value;

							}

						}

						if (objJSON.groups !== undefined) {

							for (var i = 0; i < objJSON.groups.length; i++) {

								var groupID = objJSON.groups[i];

								if (result.groups[groupID] === undefined) {

									result.groups[groupID] = [];

								}

								result.groups[groupID].push(objID);

							}

						}

					}

				}

				if (object !== undefined && objJSON.children !== undefined) {

					handle_children(object, objJSON.children);

				}

			}

		}

		function checkMaterials(children) {

			for (var objID in children) {

				var objJSON = children[objID];

				if (objJSON.material) {

					if (data.materials[objJSON.material].type === 'MeshFaceMaterial') {

						for (var i = 0, j = data.materials[objJSON.material].parameters.materials.length; i < j; i++) {
							if (materialsInMeshs.indexOf(data.materials[objJSON.material].parameters.materials[i]) == -1) {
								materialsInMeshs.push(data.materials[objJSON.material].parameters.materials[i]);
								texturesNameToArray(data.materials[data.materials[objJSON.material].parameters.materials[i]]);
							}
						}

					}

					if (data.materials[objJSON.material].type === 'MultiMaterial') {

						for (var i = 0, j = data.materials[objJSON.material].parameters.materials.length; i < j; i++) {
							if (materialsInMeshs.indexOf(data.materials[objJSON.material].parameters.materials[i]) == -1) {
								materialsInMeshs.push(data.materials[objJSON.material].parameters.materials[i]);
								texturesNameToArray(data.materials[data.materials[objJSON.material].parameters.materials[i]]);
							}
						}

					}

					if (materialsInMeshs.indexOf(objJSON.material) == -1) {
						materialsInMeshs.push(objJSON.material);
						texturesNameToArray(data.materials[objJSON.material])
					}

				}

				if (objJSON.children !== undefined) {

					checkMaterials(objJSON.children);

				}

			}

		}

		function texturesNameToArray(material) {

			for (parID in material.parameters) {

				if (parID === "envMap" || parID === "map" || parID === "lightMap" || parID === "bumpMap" || parID === "normalMap" || parID === "specularMap" || parID === "emissiveMap" || parID === "alphaMap" || parID === "roughnessMap" || parID === "metalnessMap" || parID === "aoMap") {
					var texture = material.parameters[parID];
					if (texture != undefined && texturesInMaterials.indexOf(texture) == -1)
						texturesInMaterials.push(texture);
				}
			}
		}

		function handle_mesh(geo, mat, id) {

			result.geometries[id] = geo;
			result.face_materials[id] = mat;
			handle_objects();

		}

		function handle_hierarchy(node, id, parent, material, obj) {

			var p = obj.position;
			var r = obj.rotation;
			var q = obj.quaternion;
			var s = obj.scale;

			node.position.fromArray(p);

			if (q) {

				node.quaternion.fromArray(q);

			} else {

				node.rotation.fromArray(r);

			}

			node.scale.fromArray(s);

			// override children materials
			// if object material was specified in JSON explicitly

			if (material) {

				node.traverse(function (child) {

					child.material = material;

				});

			}

			// override children visibility
			// with root node visibility as specified in JSON

			var visible = (obj.visible !== undefined) ? obj.visible : true;

			node.traverse(function (child) {

				child.visible = visible;

			});

			parent.add(node);

			node.name = id;

			result.objects[id] = node;
			handle_objects();

		}

		function create_callback_geometry(id) {

			return function (geo, mat) {

				geo.name = id;

				handle_mesh(geo, mat, id);

				counter_models -= 1;

				scope.onLoadComplete();

				async_callback_gate();

			}

		}

		function create_callback_hierachy(id, parent, material, obj) {

			return function (event) {

				var result;

				// loaders which use EventDispatcher

				if (event.content) {

					result = event.content;

					// ColladaLoader

				} else if (event.dae) {

					result = event.scene;

					// UTF8Loader

				} else {

					result = event;

				}

				handle_hierarchy(result, id, parent, material, obj);

				counter_models -= 1;

				scope.onLoadComplete();

				async_callback_gate();

			}

		}

		function create_callback_embed(id) {

			return function (geo, mat) {

				geo.name = id;

				result.geometries[id] = geo;
				result.face_materials[id] = mat;

			}

		}

		function async_callback_gate(onLoad) {

			var progress = {

				totalModels: total_models,
				totalTextures: total_textures,
				loadedModels: total_models - counter_models,
				loadedTextures: total_textures - counter_textures

			};

			scope.callbackProgress(progress, result);

			scope.onLoadProgress();

			if (counter_models === 0 && counter_textures === 0) {

				finalize();
				callbackFinished(result);

				if (onLoad) {
					onLoad(result);
				}

			}

		}

		function finalize() {

			// take care of targets which could be asynchronously loaded objects

			for (var i = 0; i < target_array.length; i++) {

				var ta = target_array[i];

				var target = result.objects[ta.targetName];

				if (target) {

					ta.object.target = target;

				} else {

					// if there was error and target of specified name doesn't exist in the scene file
					// create instead dummy target
					// (target must be added to scene explicitly as parent is already added)

					ta.object.target = new THREE.Object3D();
					result.scene.add(ta.object.target);

				}

				ta.object.target.userData.targetInverse = ta.object;

			}

		}

		var callbackTexture = function (count, onLoad) {

			counter_textures -= count;
			async_callback_gate(onLoad);

			scope.onLoadComplete();

		};

		// must use this instead of just directly calling callbackTexture
		// because of closure in the calling context loop

		var generateTextureCallback = function (count, onLoad) {

			return function () {

				callbackTexture(count, onLoad);

			};

		};

		function traverse_json_hierarchy(objJSON, callback) {

			callback(objJSON);

			if (objJSON.children !== undefined) {

				for (var objChildID in objJSON.children) {

					traverse_json_hierarchy(objJSON.children[objChildID], callback);

				}

			}

		}

		// first go synchronous elements

		// fogs

		var fogID,
		fogJSON;

		for (fogID in data.fogs) {

			fogJSON = data.fogs[fogID];

			if (fogJSON.type === "linear") {

				fog = new THREE.Fog(0x000000, fogJSON.near, fogJSON.far);

			} else if (fogJSON.type === "exp2") {

				fog = new THREE.FogExp2(0x000000, fogJSON.density);

			}

			color = fogJSON.color;
			fog.color.setRGB(color[0], color[1], color[2]);

			result.fogs[fogID] = fog;

		}

		// now come potentially asynchronous elements

		// geometries

		// count how many geometries will be loaded asynchronously

		var geoID,
		geoJSON;

		for (geoID in data.geometries) {

			geoJSON = data.geometries[geoID];

			if (geoJSON.type in this.geometryHandlers) {

				counter_models += 1;

				scope.onLoadStart();

			}

		}

		// count how many hierarchies will be loaded asynchronously

		for (var objID in data.objects) {

			traverse_json_hierarchy(data.objects[objID], function (objJSON) {

				if (objJSON.type && (objJSON.type in scope.hierarchyHandlers)) {

					counter_models += 1;

					scope.onLoadStart();

				}

			});

		}

		total_models = counter_models;

		for (geoID in data.geometries) {

			geoJSON = data.geometries[geoID];

			if (geoJSON.type === "cube") {

				geometry = new THREE.BoxBufferGeometry(geoJSON.width, geoJSON.height, geoJSON.depth, geoJSON.widthSegments, geoJSON.heightSegments, geoJSON.depthSegments);
				geometry.name = geoID;
				result.geometries[geoID] = geometry;

			} else if (geoJSON.type === "plane") {

				geometry = new THREE.PlaneBufferGeometry(geoJSON.width, geoJSON.height, geoJSON.widthSegments, geoJSON.heightSegments);
				geometry.name = geoID;
				result.geometries[geoID] = geometry;

			} else if (geoJSON.type === "sphere") {

				geometry = new THREE.SphereBufferGeometry(geoJSON.radius, geoJSON.widthSegments, geoJSON.heightSegments);
				geometry.name = geoID;
				result.geometries[geoID] = geometry;

			} else if (geoJSON.type === "cylinder") {

				geometry = new THREE.CylinderBufferGeometry(geoJSON.topRad, geoJSON.botRad, geoJSON.height, geoJSON.radSegs, geoJSON.heightSegs);
				geometry.name = geoID;
				result.geometries[geoID] = geometry;

			} else if (geoJSON.type === "torus") {

				geometry = new THREE.TorusBufferGeometry(geoJSON.radius, geoJSON.tube, geoJSON.segmentsR, geoJSON.segmentsT);
				geometry.name = geoID;
				result.geometries[geoID] = geometry;

			} else if (geoJSON.type === "icosahedron") {

				geometry = new THREE.IcosahedronGeometry(geoJSON.radius, geoJSON.subdivisions);
				geometry.name = geoID;
				result.geometries[geoID] = geometry;

			} else if (geoJSON.type in this.geometryHandlers) {

				var loader = this.geometryHandlers[geoJSON.type]["loaderObject"];
				loader.load(scope.get_url(geoJSON.url, data.urlBaseType), create_callback_geometry(geoID));

			} else if (geoJSON.type === "embedded") {

				var modelJson = data.embeds[geoJSON.id],
				texture_path = "";

				// pass metadata along to jsonLoader so it knows the format version

				modelJson.metadata = data.metadata;

				if (modelJson) {

					var jsonLoader = this.geometryHandlers["ascii"]["loaderObject"];
					var model = jsonLoader.parse(modelJson, texture_path);
					create_callback_embed(geoID)(model.geometry, model.materials);

				}

			}

		}

		// textures

		if (this.byRequest)
			checkMaterials(data.objects);

		// count how many textures will be loaded asynchronously

		var textID,
		textureJSON;

		for (textID in data.textures) {

			if (this.byRequest && texturesInMaterials.indexOf(textID) == -1)
				continue;

			countTexture(textID);

		}

		total_textures = counter_textures;

		for (textID in data.textures) {

			if (this.byRequest && texturesInMaterials.indexOf(textID) == -1)
				continue;

			scope.addTexture(textID, undefined, generateTextureCallback);

		}

		function countTexture(textureID) {

			if (result.textures[textureID])
				return;

			textureJSON = data.textures[textureID];
			if (Array.isArray(textureJSON.url)) {

				counter_textures += textureJSON.url.length;

				for (var n = 0; n < textureJSON.url.length; n++) {

					scope.onLoadStart();

				}

			} else {

				counter_textures += 1;

				scope.onLoadStart();

			}

		}

		// materials


		var matID,
		matJSON;
		var parID;

		for (matID in data.materials) {

			if (this.byRequest && materialsInMeshs.indexOf(matID) == -1)
				continue;

			scope.addMaterial(matID);

		}

		// second pass through all materials to initialize MultiMaterials
		// that could be referring to other materials out of order

		for (matID in data.materials) {

			if (this.byRequest && materialsInMeshs.indexOf(matID) == -1)
				continue;

			scope.addFaceMaterial(matID);

		}

		// objects ( synchronous init of procedural primitives )

		handle_objects();

		// defaults

		if (result.cameras && data.defaults.camera) {

			result.currentCamera = result.cameras[data.defaults.camera];

		}

		if (result.fogs && data.defaults.fog) {

			result.scene.fog = result.fogs[data.defaults.fog];

		}

		// synchronous callback

		scope.callbackSync(result);

		// just in case there are no async elements

		async_callback_gate();

	},

	newMaterial: function (key, onLoad) {

		var counter_textures = 0;
		var total_textures = 0;
		var scope = this;

		var callbackTexture = function (count, onLoad) {

			counter_textures -= count;
			async_callback_gate(onLoad);

		};

		var generateTextureCallback = function (count, onLoad) {

			return function () {

				callbackTexture(count, onLoad);

			};

		};

		if (!this.result.materials[key]) {

			var mat = this.data.materials[key];
			if (mat.parameters.materials) {
				console.log('mat',mat.parameters.materials);
				
				for (var i = 0, j = mat.parameters.materials.length; i < j; i++) {
					applyTexture(this.data.materials[mat.parameters.materials[i]], onLoad);

					scope.addMaterial(mat.parameters.materials[i]);
					console.log('addMaterial',mat.parameters.materials[i]);
					console.log('addMaterial_applyTexture',this.data.materials);
					//console.log('addMateria_J',j);
				}

				console.log('result_material');
				scope.addMaterial(key);
				scope.addFaceMaterial(key);
				//onLoad();
				//console.log('scope_material',scope.addMaterial(key));
			} else {
				//console.log('result_material_else');
				applyTexture(mat, onLoad);
				scope.addMaterial(key);
			}
		} else {
			onLoad();
			//console.log('result_material_else_else');
		}

		function applyTexture(material, onLoad) {
			
			
			console.log('applyTexture');
			var array = getTexturesName(material);

			if (array.length == 0)
				
				return;

			total_textures += array.length;

			for (var i = 0; i < array.length; i++) {

				countTexture(array[i]);

			}

			for (var i = 0; i < array.length; i++) {

				scope.addTexture(array[i], onLoad, generateTextureCallback);

			}
			
			
			console.log('total_textures',array);

		}

		function getTexturesName(material) {

			var array = [];
			for (var parID in material.parameters) {

				if (parID === "envMap" || parID === "map" || parID === "lightMap" || parID === "bumpMap" || parID === "normalMap" || parID === "specularMap" || parID === "emissiveMap" || parID === "alphaMap" || parID === "roughnessMap" || parID === "metalnessMap" || parID === "aoMap") {
					var texture = material.parameters[parID];
					if (texture != undefined && scope.texturesInMaterials.indexOf(texture) == -1
						 && array.indexOf(texture) == -1 && !(texture instanceof THREE.Texture))
						array.push(texture);
				}
			}
			return array;
		}

		function countTexture(textureID) {

			if (scope.result.textures[textureID])
				return;

			var textureJSON = scope.data.textures[textureID];
			if (Array.isArray(textureJSON.url)) {

				counter_textures += textureJSON.url.length;

				for (var n = 0; n < textureJSON.url.length; n++) {

					scope.onLoadStart();

				}

			} else {

				counter_textures += 1;

				scope.onLoadStart();

			}
		}

		function async_callback_gate(onLoad) {

			var progress = {

				totalTextures: total_textures,
				loadedTextures: total_textures - counter_textures,

			};
			
			console.log('total_textures',total_textures),
			console.log('counter_textures',counter_textures),

			scope.callbackProgress(progress, scope.result);

			if (counter_textures === 0) {
			
				
			console.log('counter_textures_0');

				if (onLoad) {
				console.log('onLoad_onLoad');
					onLoad();
				}

			}

		}

	},

	addMaterial: function (matID) {
		var scope = this;

		if (scope.result.materials[matID])
			return;

		var matJSON = scope.data.materials[matID];

		for (var parID in matJSON.parameters) {

			if (parID === "envMap" || parID === "map" || parID === "lightMap" || parID === "bumpMap" || parID === "normalMap" || parID === "specularMap" || parID === "emissiveMap" || parID === "alphaMap" || parID === "roughnessMap" || parID === "metalnessMap" || parID === "aoMap") {

				matJSON.parameters[parID] = scope.result.textures[matJSON.parameters[parID]];

			} else if ( parID === "flatShading" ) {
			
				if ( matJSON.parameters[ parID ] = "true" ) {

                matJSON.parameters[ parID ] = THREE.FlatShading;
				
				}

			} else if (parID === "side") {

				if (matJSON.parameters[parID] == "double") {

					matJSON.parameters[parID] = THREE.DoubleSide;

				} else if (matJSON.parameters[parID] == "back") {

					matJSON.parameters[parID] = THREE.BackSide;

				} else {

					matJSON.parameters[parID] = THREE.FrontSide;

				}

			} else if (parID === "blending") {

				matJSON.parameters[parID] = matJSON.parameters[parID]in THREE ? THREE[matJSON.parameters[parID]] : THREE.NormalBlending;

			} else if (parID === "depthMode") {

				matJSON.parameters[parID] = matJSON.parameters[parID]in THREE ? THREE[matJSON.parameters[parID]] : THREE.NeverDepth;

			} else if (parID === "combine") {

				matJSON.parameters[parID] = matJSON.parameters[parID]in THREE ? THREE[matJSON.parameters[parID]] : THREE.MultiplyOperation;

			} else if (parID === "vertexColors") {

				if (matJSON.parameters[parID] == "face") {

					matJSON.parameters[parID] = THREE.FaceColors;

					// default to vertex colors if "vertexColors" is anything else face colors or 0 / null / false

				} else if (matJSON.parameters[parID]) {

					matJSON.parameters[parID] = THREE.VertexColors;

				}

			} else if (parID === "wrapRGB") {

				var v3 = matJSON.parameters[parID];
				matJSON.parameters[parID] = new THREE.Vector3(v3[0], v3[1], v3[2]);

			} else if (parID === "normalScale") {

				var v2 = matJSON.parameters[parID];
				matJSON.parameters[parID] = new THREE.Vector2(v2[0], v2[1]);

			}

		}

		if (matJSON.parameters.opacity !== undefined && matJSON.parameters.opacity < 1.0) {

			matJSON.parameters.transparent = true;

		}
		
		// temporary global override	
		matJSON.parameters.side = THREE.DoubleSide;

		//var loader = new MaterialLoader();

		//var geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
		/*
		var materials = [
		new THREE.MeshDepthMaterial(),
		new THREE.MeshNormalMaterial(),
		new THREE.MeshBasicMaterial( { wireframe: true } ),
		new THREE.MeshLambertMaterial( { color: 0xff0000 } ),
		new THREE.MeshPhongMaterial( { color: 0x0000ff } ),
		new THREE.MeshStandardMaterial( { color: 0x00ff00 } ),
		];
		 */
		/*
		var mesh = new THREE.Mesh( geometry, materials );
		mesh.toJSON();
		 */
		//var material;

		if (matJSON.type == "MultiMaterial") {
			//material = new THREE[ matJSON.type ]( matJSON.parameters.materials );
			//console.log(material.materials[0][0]);
			//console.log(material);
			//scope.result.materials[ matID ] = materials;
			if (matJSON.parameters.materials) {
				var materialArray = [];

				for (var i = 0; i < matJSON.parameters.materials.length; i++) {
					var label = matJSON.parameters.materials[i];
					materialArray.push(scope.result.materials[label]);
				}
				scope.result.materials[matID] = materialArray;
			}
		} else {
			var material = new THREE[matJSON.type](matJSON.parameters);
			material.name = matID;
			scope.result.materials[matID] = material;
		}
		//material.name = matID;
		//material = new THREE[ matJSON.type ]( matJSON.parameters );
		//scope.result.materials[ matID ] = material;

	},

	addFaceMaterial: function (matID) {

		var scope = this;
		var matJSON = scope.data.materials[matID];

		if (matJSON.parameters.materials) {

			var materialArray = [];

			for (var i = 0; i < matJSON.parameters.materials.length; i++) {

				var label = matJSON.parameters.materials[i];
				materialArray.push(scope.result.materials[label]);

			}

			scope.result.materials[matID].materials = materialArray;

		}

	},

	addTexture: function (textureID, onLoad, generateTextureCallback) {

		var scope = this;

		if (scope.result.textures[textureID])
			return;

		var textureJSON = scope.data.textures[textureID];

		if (textureJSON.mapping !== undefined && THREE[textureJSON.mapping] !== undefined) {

			textureJSON.mapping = THREE[textureJSON.mapping];

		}

		var texture;

		if (Array.isArray(textureJSON.url)) {

			var count = textureJSON.url.length;
			var urls = [];

			for (var i = 0; i < count; i++) {

				urls[i] = scope.get_url(textureJSON.url[i], scope.data.urlBaseType);

			}

			var loader = THREE.Loader.Handlers.get(urls[0]);
			// var loader = THREE.LoadingManager.getHandler(urls[0]);

			if (loader !== null) {

				texture = loader.load(urls, generateTextureCallback(count, onLoad));

				if (textureJSON.mapping !== undefined)
					texture.mapping = textureJSON.mapping;

			} else {

				texture = new THREE.CubeTextureLoader().load(urls, generateTextureCallback(count, onLoad));
				texture.mapping = textureJSON.mapping;

			}

		} else {

			var fullUrl = scope.get_url(textureJSON.url, scope.data.urlBaseType);

			var textureCallback = generateTextureCallback(1, onLoad);

			var loader = THREE.Loader.Handlers.get(fullUrl);
			// var loader = THREE.LoadingManager.getHandler(fullUrl);

			if (loader !== null) {

				texture = loader.load(fullUrl, textureCallback);

			} else {

				texture = new THREE.Texture();
				loader = new THREE.ImageLoader();

				(function (texture) {

					loader.load(fullUrl, function (image) {

						texture.image = image;
						texture.needsUpdate = true;

						textureCallback();

					});

				})(texture)

			}

			if (textureJSON.mapping !== undefined)
				texture.mapping = textureJSON.mapping;

			if (THREE[textureJSON.minFilter] !== undefined)
			texture.minFilter = THREE[textureJSON.minFilter];

			if (THREE[textureJSON.magFilter] !== undefined)
				texture.magFilter = THREE[textureJSON.magFilter];

			if (THREE[textureJSON.encoding] !== undefined)
				texture.encoding = THREE[textureJSON.encoding];

			// Values of encoding !== THREE.LinearEncoding only supported on map, envMap and emissiveMap.
			//
			// Also changing the encoding after already used by a Material will not automatically make the Material
			// update.  You need to explicitly call Material.needsUpdate to trigger it to recompile.
			
			if (THREE[textureJSON.format] !== undefined)
				texture.format = THREE[textureJSON.format];

			if (textureJSON.anisotropy)
				texture.anisotropy = textureJSON.anisotropy;

			if (textureJSON.rotation)
				texture.rotation = textureJSON.rotation;
			
			if (textureJSON.flipY !== undefined)
				texture.flipY = textureJSON.flipY;

			if (textureJSON.center) {

				texture.center.set(textureJSON.center[0], textureJSON.center[1]);
			}

			if (textureJSON.repeat) {

					texture.repeat.set(textureJSON.repeat[0], textureJSON.repeat[1]);

					if (textureJSON.repeat[0] !== 1)
						texture.wrapS = THREE.RepeatWrapping;
					if (textureJSON.repeat[1] !== 1)
						texture.wrapT = THREE.RepeatWrapping;

				}

				if (textureJSON.offset) {

					texture.offset.set(textureJSON.offset[0], textureJSON.offset[1]);

				}

				// handle wrap after repeat so that default repeat can be overriden
				// MirroredRepeatWrapping, ClampToEdgeWrapping, RepeatWrapping
				
				if (textureJSON.wrap) {

					var wrapMap = {
						"repeat": THREE.RepeatWrapping,
						"mirror": THREE.MirroredRepeatWrapping,
						"clamp": THREE.ClampToEdgeWrapping
					};

					if (wrapMap[textureJSON.wrap[0]] !== undefined)
						texture.wrapS = wrapMap[textureJSON.wrap[0]];
					if (wrapMap[textureJSON.wrap[1]] !== undefined)
						texture.wrapT = wrapMap[textureJSON.wrap[1]];

				}

			}

			scope.result.textures[textureID] = texture;

		},

		get_url: function (source_url, url_type) {

			var scope = this;

			if (url_type == "relativeToHTML") {

				return source_url;

			} else {

				return scope.urlBase + source_url;

			}

		}

	};
