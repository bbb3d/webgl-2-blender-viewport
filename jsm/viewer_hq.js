// Ion viewer modified for d17 (HQ viewer)

function IonVR ( options ) {
    var options = options || {};

    var defaults = {
        scene: null,
        gltf_scene: null,
        secondary_scene: null,
        container: $g('my_webgl'),
        camera_animations: 'animations.json',
        g_in: false,
        g_out: false,
        g_f: 1.0,
        phys_shading: true,
        lightprobe : false,
        lightprobe_tx : null,
        lightprobe_comp : false,
        lightprobe_set : '',
        lightprobeInt : 1.0,
        exposure : 1.0,
        spin: false,
        spin_duration : 2400,
        debug: false,
        camera_info: false,
        stats: false,
        always_render: true,
        lock_mobile_landscape: true,
        enableZoom: false,
        controls: true,
        mouseTracking: false, // window xy tracking and face rotation
        mouseTrackingSpeed: 100, // face rotation speec
        rotate_left: 0.0, // body rotation in radians
        sky: false,
        skybox: false,
        zoom_factor : 20,
        skybox_tx: 'cube_env',
        scene_assets_url: '',
        url_tex : 'tex/',
        url_3d : '_3d/',
        postprocessing: false,
        eyes_lookAt: true,
        camera : {
            position : {
                x : 0,
                y : 0,
                z : 100
            },
            fov : 35,
            target : {
                x : 0,
                y : 0,
                z : 0
            }
        },
        
        env_bg: {
            projection: null,
            env_tx: null
        },
        
		env_sphere : {
			size : {
				radius : 500,
				segmentsH : 64,
				segmentsV : 32
			},
			pos : [ 0, -250, 0 ],
			rot : [ 0, 0, 0 ]
		},
        
		env_cube : {
			size : [ 2200, 2200, 2200 ],
			pos : [ 0, 1099, 0 ],
			rot : [ 0, 0, 0 ]
		},
        set : null,
        ready : false,
        showStatus : true
    };
	
	// data values
    this.data = {
        param: {
			material : {
				mat_01 : {
					color: {
						h: 0.0,
						s: 0.0,
						l: 0.9
					},
					roughness: 0.75,
					metalness: 0.0,
					clearCoat: 0.0,
					clearCoatRoughness: 0.1,
					reflectivity: 0.5,
					envMapIntensity: 1.5,
					aoMapIntensity: 2.5,
					lightMapIntensity: 2.5,
					opacity: 1.0,
					refractionRatio: 0.98,
					bumpScale: 0.05,
					map: null,
					map_tiling: 2,
					map_rotate: 90,
					bumpMap: null,
					bumpMap_tiling: 2,
					roughnessMap: null,
					roughness_tiling: 2,
					transparent: false
				},
				mat_02 : {
					color: {
						h: 0.0,
						s: 0.0,
						l: 0.9
					},
					roughness: 0.75,
					metalness: 0.0,
					clearCoat: 0.0,
					clearCoatRoughness: 0.1,
					reflectivity: 0.5,
					envMapIntensity: 1.5,
					aoMapIntensity: 2.5,
					lightMapIntensity: 2.5,
					opacity: 1.0,
					refractionRatio: 0.98,
					bumpScale: 0.05,
					map: null,
					map_tiling: 2,
					map_rotate: 90,
					bumpMap: null,
					bumpMap_tiling: 2,
					roughnessMap: null,
					roughness_tiling: 2,
					transparent: false
				},
				mat_03 : {
					color: {
						h: 0.0,
						s: 0.0,
						l: 0.9
					},
					roughness: 0.75,
					metalness: 0.0,
					clearCoat: 0.0,
					clearCoatRoughness: 0.1,
					reflectivity: 0.5,
					envMapIntensity: 1.5,
					aoMapIntensity: 2.5,
					lightMapIntensity: 2.5,
					opacity: 1.0,
					refractionRatio: 0.98,
					bumpScale: 0.05,
					map: null,
					map_tiling: 2,
					map_rotate: 90,
					bumpMap: null,
					bumpMap_tiling: 2,
					roughnessMap: null,
					roughness_tiling: 2,
					transparent: false
				},
				mat_04 : {
					color: {
						h: 0.0,
						s: 0.0,
						l: 0.9
					},
					roughness: 0.75,
					metalness: 0.0,
					clearCoat: 0.0,
					clearCoatRoughness: 0.1,
					reflectivity: 0.5,
					envMapIntensity: 1.5,
					aoMapIntensity: 2.5,
					lightMapIntensity: 2.5,
					opacity: 1.0,
					refractionRatio: 0.98,
					bumpScale: 0.05,
					map: null,
					map_tiling: 2,
					map_rotate: 90,
					bumpMap: null,
					bumpMap_tiling: 2,
					roughnessMap: null,
					roughness_tiling: 2,
					transparent: false
				},
				mat_05 : {
					color: {
						h: 0.0,
						s: 0.0,
						l: 0.9
					},
					roughness: 0.75,
					metalness: 0.0,
					clearCoat: 0.0,
					clearCoatRoughness: 0.1,
					reflectivity: 0.5,
					envMapIntensity: 1.5,
					aoMapIntensity: 2.5,
					lightMapIntensity: 2.5,
					opacity: 1.0,
					refractionRatio: 0.98,
					bumpScale: 0.05,
					map: null,
					map_tiling: 2,
					map_rotate: 90,
					bumpMap: null,
					bumpMap_tiling: 2,
					roughnessMap: null,
					roughness_tiling: 2,
					transparent: false
				}
			},
			
			mmMat: 0,
			cMat: 
				{
				0:0,
				1:0,
				2:0,
				3:0,
				4:0,
				5:0,
				6:0,
				7:0,
				8:0, //logo
				9:0,
				10:0,
				11:0,
				12:0,
				13:0
			}
		}
	};	
			
	// data_stored values
    this.data_stored = {
        param: {
			material : {
				mat_01 : {
					color: {
						h: 0.0,
						s: 0.0,
						l: 0.9
					},
					roughness: 0.45,
					metalness: 0.0,
					clearCoat: 0.0,
					clearCoatRoughness: 0.1,
					reflectivity: 0.5,
					envMapIntensity: 1.5,
					aoMapIntensity: 2.5,
					lightMapIntensity: 2.5,
					opacity: 1.0,
					refractionRatio: 0.98,
					bumpScale: 0.05,
					map: null,
					map_tiling: 2,
					map_rotate: 90,
					bumpMap: null,
					bumpMap_tiling: 2,
					roughnessMap: null,
					roughness_tiling: 2,
					transparent: false
				},
				mat_02 : {
					color: {
						h: 0.0,
						s: 0.0,
						l: 0.9
					},
					roughness: 0.75,
					metalness: 0.0,
					clearCoat: 0.0,
					clearCoatRoughness: 0.1,
					reflectivity: 0.5,
					envMapIntensity: 1.5,
					aoMapIntensity: 2.5,
					lightMapIntensity: 2.5,
					opacity: 1.0,
					refractionRatio: 0.98,
					bumpScale: 0.05,
					map: null,
					map_tiling: 2,
					map_rotate: 90,
					bumpMap: null,
					bumpMap_tiling: 2,
					roughnessMap: null,
					roughness_tiling: 2,
					transparent: false
				},
				mat_03 : {
					color: {
						h: 0.0,
						s: 0.0,
						l: 0.9
					},
					roughness: 0.55,
					metalness: 0.0,
					clearCoat: 0.0,
					clearCoatRoughness: 0.1,
					reflectivity: 0.5,
					envMapIntensity: 1.5,
					aoMapIntensity: 2.5,
					lightMapIntensity: 2.5,
					opacity: 1.0,
					refractionRatio: 0.98,
					bumpScale: 0.05,
					map: null,
					map_tiling: 2,
					map_rotate: 90,
					bumpMap: null,
					bumpMap_tiling: 2,
					roughnessMap: null,
					roughness_tiling: 2,
					transparent: false
				},
				mat_04 : {
					color: {
						h: 0.0,
						s: 0.0,
						l: 0.9
					},
					roughness: 0.9,
					metalness: 0.0,
					clearCoat: 0.0,
					clearCoatRoughness: 0.1,
					reflectivity: 0.5,
					envMapIntensity: 1.5,
					aoMapIntensity: 2.5,
					lightMapIntensity: 2.5,
					opacity: 1.0,
					refractionRatio: 0.98,
					bumpScale: 0.05,
					map: null,
					map_tiling: 2,
					map_rotate: 90,
					bumpMap: null,
					bumpMap_tiling: 2,
					roughnessMap: null,
					roughness_tiling: 2,
					transparent: false
				},
				mat_05 : {
					color: {
						h: 0.0,
						s: 0.0,
						l: 0.9
					},
					roughness: 0.75,
					metalness: 0.0,
					clearCoat: 0.0,
					clearCoatRoughness: 0.1,
					reflectivity: 0.5,
					envMapIntensity: 1.5,
					aoMapIntensity: 2.5,
					lightMapIntensity: 2.5,
					opacity: 1.0,
					refractionRatio: 0.98,
					bumpScale: 0.05,
					map: null,
					map_tiling: 2,
					map_rotate: 90,
					bumpMap: null,
					bumpMap_tiling: 2,
					roughnessMap: null,
					roughness_tiling: 2,
					transparent: false
				}
			}
		}
	};
    
    this.mousePos = {x:0,y:0};
    this.xTarget;
    this.yTarget;
    
    this.tHeadRotY;
    this.tHeadRotX;
		
    this.options = extend( {}, defaults, options );

    this.animations = {};
    this.autorotations = {};
    this.interfaces = [];
    this.clock = new THREE.Clock();
    this.loader = new THREE.SceneLoader();
    this.loader.byRequest = true;
    this.cameraAnimations = {};
	
    this.preloader = this.options.preloader;


    // Initialization start
    if ( Detector.webgl ) {

        this.init();
    } else {
        Detector.addGetWebGLMessage();
    }
}


IonVR.prototype = {
    constructor : IonVR,

    init : function () {
		THREE.Cache.enabled = true;
        this.initContainer();
		this.postprocessingready = false;
        //this.loadCameraAnimations();
        this.loadScene( function () {
            this.initCamera();
            this.initRenderer();
            this.initLights();
			//this.switchCamera('Default_View');

            if ( this.onReady ) {
                this.onReady()
            }

            this.start();
			// this.cMat();
			
			setTimeout(loadDef, 500);
			setTimeout(loadEnd, 2000);
			
			function loadDef() {
                ion.initEnv();
                ion.initCalibrate();
			}
			
			function loadEnd() {
				ion.loadGFTL();
                ion.renderControls();
                //ion.initPostPro();
			}
			if (ion.options.water==true) {
				this.initWater();
			} else {}
			if (ion.options.c_cam1==true) {
				this.initCC1();
			} else {}
        } );
    },

    log : function () {
        if ( this.options.debug && window.console ) {
            console.log( arguments );
        }
    },

    loadScene : function ( callback ) {
        var _this = this;

        if (_this.options.scene) {
            this.showStatus( 'Loading scene...' );

            var scene_loader = this.loader;
            //scene_loader.byRequest = true;

            scene_loader.callbackProgress = function ( progress ) {
                _this.showStatus( 'Loading... Models ' + progress.loadedModels + '/' + progress.totalModels + ', textures ' + progress.loadedTextures + '/' + progress.totalTextures );
                _this.preloader.updateProgress( progress );
            };
    /*
            if ( THREE.IONLoader ) {
                scene_loader.addGeometryHandler( "ion", THREE.IONLoader );
            }*/

            this.log( 'load scene', this.options.scene );

            // var path = (this.options.scene_assets_url || '') + this.options.scene;
            var path = this.options.scene;
            scene_loader.load( path, function ( sc, b, c ) {
                _this.log( 'load complete', sc, b, c );

                _this.preloader.stop();

                _this.initScene( sc );
                ion.options.ready = true;


                if ( _this.options.debug ) {
                    if ( typeof IonSceneExplorer != 'undefined' ) {
                        _this.explorer = new IonSceneExplorer( _this, sc );
                    }
                }
                if ( callback ) {
                    callback.call( _this );
                }
            } );
        } else {
            
            console.log('scene parse');
            fetch('http://127.0.0.1:7778/_vr_vrml_01/_vr1/scene1.json').then(res => res.json()).then(data => _this.data.param.live_data = data)
            
            _this.preloader.stop();
            _this.initScene( _this.data.param.live_data );
            _this.options.ready = true;
        
        } 

    },

    loadCameraAnimations : function () {

        new THREE.CameraAnimationDataLoad( this );

    },

    loadSecondaryScene : function ( callback ) {

        var _this = this;

        _this.preloader.start();

        this.showStatus( 'Loading scene...' );

        var scene_loader = new THREE.SceneLoader();

        scene_loader.callbackProgress = function ( progress ) {
            _this.showStatus( 'Loading... Models ' + progress.loadedModels + '/' + progress.totalModels + ', textures ' + progress.loadedTextures + '/' + progress.totalTextures );
            _this.preloader.updateProgress( progress );
        };
/*
        if ( THREE.IONLoader ) {
            scene_loader.addGeometryHandler( "ion", THREE.IONLoader );
        }
*/
        this.log( 'load secondary scene', this.options.secondary_scene );
        scene_loader.load( this.options.secondary_scene, function ( sc, b, c ) {
            _this.log( 'load secondary complete', sc, b, c );

            _this.preloader.stop();
            _this.hideStatus();

            _this.initSecondaryScene( sc );

            if ( callback ) {
                callback.call( _this );
            }
        } );

    },

    setMaterial : function ( key, object ) {

        var scope = this;

        this.preloader.start();
        this.loader.callbackProgress = function ( progress ) {
            scope.showStatus( 'Loading... Textures ' + progress.loadedTextures + '/' + progress.totalTextures );
            scope.preloader.updateProgress( progress );
        };

        this.loader.newMaterial( key, function () {
            object.material = scope.sc.materials[ key ];

            scope.applyAnimationToNewMaterial( object );
            //scope.spinRound();
			scope.preloader.stop();
            scope.hideStatus();
			scope.requestRender();
			
        } )
    },

    showCamInfo : function () {

        if(this.orbit_controls == null) return;

        if ( !this.cam_info ) {
            this.cam_info = $c( 'div' );
            this.cam_info.id = 'camera-info';
            this.container.appendChild( this.cam_info );
        }

        this.cam_info.innerHTML =
            '"position": [' +
            '' + round( this.camera.position.x, 100 ) + ',' +
            '' + round( this.camera.position.y, 100 ) + ',' +
            '' + round( this.camera.position.z, 100 ) + '],<br />' +
            '"target": [' +
            '' + round( this.orbit_controls.target.x, 100 ) + ', ' +
            '' + round( this.orbit_controls.target.y, 100 ) + ', ' +
            '' + round( this.orbit_controls.target.z, 100 ) + '],<br />' +
            '"fov": ' + round( this.camera.fov, 10 ) + '';
        ;

    },

    initScene : function ( sc ) {

        this.separateInterfaceGroup( sc );
        this.sc = sc;
        this.scene = sc.scene;
        this.main_group = this.scene.getObjectByName( 'main_group' );
        var o = this.options;
        
        this.o = this.sc.objects;
		this.m = this.sc.materials;
		this.t = this.sc.textures;
		this.c = this.sc.cameras;
		this.pc = this.data.param;


        for ( var i in this.main_group.children ) {
            var obj = this.main_group.children[ i ];

            if ( obj instanceof THREE.Mesh && obj.userData ) {
                if ( obj.userData.sub_div ) {
                    var sub_div = obj.userData.sub_div;
                    this.log( 'sub div', obj.name, sub_div );
                    this.showStatus( 'Subdividing ' + obj.name );

                    var modifier = new THREE.SubdivisionModifier( sub_div );
                    modifier.modify( obj.geometry );
                }

                if ( obj.userData.comp_vn ) {
                    this.log( 'comp vn', obj.name );
                    this.showStatus( 'Computing normals ' + obj.name );
                    obj.geometry.computeVertexNormals();
                }

                if ( obj.userData.comp_fn ) {
                    this.log( 'comp fn', obj.name );
                    this.showStatus( 'Computing face normals ' + obj.name );
                    obj.geometry.computeFaceNormals();
                }

                if ( obj.userData.comp_cn ) {
                    this.log( 'comp cn', obj.name );
                    this.showStatus( 'Computing centroids ' + obj.name );
                    obj.geometry.computeCentroids();
                }

                if ( obj.userData.buffer && o.geom_buffer && THREE.BufferGeometryUtils ) {
                    delete obj.geometry.__tmpVertices; // bug fix, may also use clone
                    //obj.geometry = obj.geometry.clone();

                    this.showStatus( 'Triangulating ' + obj.name );
                    THREE.GeometryUtils.triangulateQuads( obj.geometry );

                    this.showStatus( 'Buffering ' + obj.name );
                    var new_geo = THREE.BufferGeometryUtils.fromGeometry( obj.geometry );
                    obj.geometry.dispose();
                    obj.geometry = new_geo;

                    //obj.material = this.sc.materials.wire_orange;
                }
            }
        }

        this.log( 'main_group', this.main_group );
        this.main_group.rotation.y = o.rotate_left;
		this.log('init_rotation',o.rotate_left)

        // environment 

        var eBG = o.env_bg;
        var eSphere = o.env_sphere;
        var eCube = o.env_cube;
        
        
        if ( eBG.projection != null || undefined ) {
            
            var bgTX = this.sc.textures[ o.env_bg.env_tx ];
            	
			if ( eBG == "cube" ) {
			
				var shader = THREE.ShaderLib[ "cube_y" ]; // vertical offset cube shader
				shader.uniforms[ "tCube" ].value = bgTX;
				var material = new THREE.ShaderMaterial( {
						fragmentShader : shader.fragmentShader,
						vertexShader : shader.vertexShader,
						uniforms : shader.uniforms,
						depthWrite : false,
						side : THREE.BackSide
					} ),
			
				skybox = new THREE.Mesh( new THREE.CubeGeometry( eCube.size[0], eCube.size[1],  eCube.size[2] ), material );
				skybox.position.set( eCube.pos[0], eCube.pos[1], eCube.pos[2] );
				skybox.position.set( eCube.rot[0], eCube.rot[1], eCube.rot[2] );
				skybox.name = 'skyBox';
				this.scene.add( skybox );
				console.log('cube environment');
				
			} else if (eBG.projection == "sphere" ) {
			
                var sphereGeo = new THREE.SphereBufferGeometry(eSphere.size.radius, eSphere.size.segmentsH, eSphere.size.segmentsV);
                var sphereMat = new THREE.MeshBasicMaterial();
                var sphereObj = new THREE.Mesh( sphereGeo, sphereMat );
                sphereObj.name = "SphereBG";
				sphereObj.position.set( eSphere.pos[0], eSphere.pos[1], eSphere.pos[2] );
				sphereObj.rotation.set( eSphere.rot[0], eSphere.rot[1], eSphere.rot[2] );
                sphereMat.map = bgTX;
                sphereMat.side = 2;
                sphereMat.color.setHSL(0,0,1);
                
				this.main_group.add( sphereObj );
				console.log('sphere environment');
				
			} else if (eBG.projection == "background" ) {
				this.scene.background = bgTX;
				console.log('background environment');
			} else {
			
				console.log('---> NO environment');
                
            } 
        }
		
		if ( o.lightprobe ) {
			
			var lightProbe = new THREE.LightProbe();
            lightProbe.name = "l_probe";
			this.scene.add( lightProbe );
			if (o.lightprobe_comp == true ) {
				lightProbe.copy( THREE.LightProbeGenerator.fromCubeTexture( this.sc.textures[ o.lightprobe_tx ] ) );
			} else {};
			lightProbe.intensity =  o.lightprobeInt;
			
			if (o.lightprobe_set == "city1") {
			// city bg sh
			lightProbe.sh.fromArray([
				0.7400711152181413, 
				0.9059725256000007, 
				1.0919670969142365, 
				0.05707666506377028, 
				0.04799920190808393, 
				-0.02442923703271842, 
				-0.15976708428389447, 
				-0.16132784005009235, 
				-0.13270693683558157, 
				0.0721573727809049, 
				0.10175674837700997, 
				0.11445734694366724, 
				0.0560755126069051, 
				0.08495091059056704, 
				0.10646475933641948, 
				-0.04466016377563729, 
				-0.05181966061981181, 
				-0.050443383461895315, 
				0.21986800648621174, 
				0.21713038442508073, 
				0.18806911418736916, 
				0.0255252830577741, 
				0.01717383726234023, 
				0.021451989874380947, 
				-0.31330089683681817, 
				-0.36755557789336674, 
				-0.44925479873314506]);
			} else if (o.lightprobe_set == "studio1") {
			//studio sh
			lightProbe.sh.fromArray([
				0.029401531146369564, 
				0.030393056150284967, 
				0.03882441978503216, 
				-0.006532247813053846, 
				-0.006830553369357048, 
				-0.00876550792363131, 
				0.0054872013622510795, 
				0.005761665763592089, 
				0.007102911675978676, 
				0.001051650901536813, 
				0.0008596636445337802, 
				0.0006091165567122502, 
				-0.0036529445742401667, 
				-0.003961831226970255, 
				-0.005260862974352544, 
				-0.004670203370822745, 
				-0.005086150563277629, 
				-0.0060334392731383295, 
				-0.0005266474551182757, 
				-0.0005770949473494129, 
				-0.0006364091203026864, 
				0.0027920785910252243, 
				0.00304628013386876, 
				0.004018038061411669, 
				0.0005419559484224849, 
				0.0005783680671260237, 
				0.0008420237221743866
				]);
			} else if (o.lightprobe_set == "ext1") {
			//ext1
			lightProbe.sh.fromArray([
				1.0406571709113295, 
				1.161886628443305, 
				1.3063027226917772, 
				-0.6490791656527983, 
				-0.49548467256667383, 
				-0.31325949844248935, 
				0.04381565686615428, 
				0.06532099855040499, 
				0.07807386785800434, 
				0.08630908113628857, 
				-0.10730147835215309, 
				-0.10939680130133521, 
				-0.22306053341686657, 
				-0.2557966190958097, 
				-0.2506786037181489, 
				0.020464629184951535, 
				0.028274316528776787, 
				0.0298683696140515, 
				-0.09474396955458116, 
				-0.10071400468444641, 
				-0.11257025430936203, 
				-0.040398956433938614, 
				-0.044402750362525285, 
				-0.04342718627203005, 
				0.14164765158865514, 
				0.15794017769014346, 
				0.12746705307744025
				]);
			} else if (o.lightprobe_set == "ext2") {
			//ext2
			lightProbe.sh.fromArray([
				1.0335556155643715, 
				1.1544615747460476, 
				1.298795276056946, 
				-0.6440321470206369, 
				-0.490794493258884, 
				-0.3087557712911352, 
				-0.06322772561084915, 
				-0.06275788296644307, 
				-0.0549204451340966, 
				-0.04100613170225538, 
				-0.06030499544302171, 
				-0.0713663474683745, 
				-0.016149815542870736, 
				-0.020474213508564584, 
				-0.019033772571935118, 
				-0.1845756340737791, 
				-0.1803811605088164, 
				-0.15752660378109157, 
				0.16996851894129442, 
				0.1870388315719731, 
				0.16688330909716903, 
				0.04036423840511134, 
				0.04443289627139373, 
				0.04339497027679326, 
				-0.010985248061149717, 
				-0.008034291798560208, 
				-0.03336541878687944]);
			} else if (o.lightprobe_set == "ext3") {
			//ext3
			lightProbe.sh.fromArray([1.0335559075217027, 1.1544622559346969, 1.298793343266342, -0.6440332990786087, -0.49079519970472635, -0.3087596223249461, -0.043721866960457025, -0.06515542631159388, -0.0779509152595228, 0.08586286563385517, 0.10696457640468636, 0.10911142309700304, 0.2225691363905055, 0.25521971826922135, 0.2502731394468994, -0.02043911200858792, -0.028287231484502576, -0.02986891170906698, -0.09449780318469071, -0.1004775548508276, -0.11233573559158766, -0.040364042792028716, -0.044432669998002286, -0.0433937100421009, 0.14170340383248967, 0.1579621271184806, 0.12784203299389257]);
			} else if (o.lightprobe_set == "env20") {
			lightProbe.sh.fromArray([0.029401531146369564, 0.029401531146369564, 0.029401531146369564, -0.006532247813053846, -0.006532247813053846, -0.006532247813053846, 0.0054872013622510795, 0.0054872013622510795, 0.0054872013622510795, 0.001051650901536813, 0.001051650901536813, 0.001051650901536813, -0.0036529445742401667, -0.0036529445742401667, -0.0036529445742401667, -0.004670203370822745, -0.004670203370822745, -0.004670203370822745, -0.0005266474551182757, -0.0005266474551182757, -0.0005266474551182757, 0.0027920785910252243, 0.0027920785910252243, 0.0027920785910252243, 0.0005419559484224849, 0.0005419559484224849, 0.0005419559484224849]);
			} else if (o.lightprobe_set == "my1_01") {
			lightProbe.sh.fromArray([
                
                1.32, 1.32, 1.32, 
                0.75, 0.75, 0.75, // top
                0.052, 0.052, 0.05, // front
                -0.03, -0.05, -0.05, // left
                -0.0, -0.0, -0.0, // ?
                0.15, 0.15, 0.15, // ?
                0.4, 0.4, 0.4, // back
                -0.1, -0.1, -0.1, 
                0.7, 0.7, 0.7 // right                
                
            ]);
			} else {}
		}
    },
    
    loadGFTL : function () {
        
        var _this = this;
        var url = _this.options.gltf_scene;
        
        if (_this.options.glft !== null ) {
        
            // Instantiate a loader
            const loader = new THREE.GLTFLoader();

            // Optional: Provide a DRACOLoader instance to decode compressed mesh data
            const dracoLoader = new THREE.DRACOLoader();
            dracoLoader.setDecoderPath( '/js/r137/libs/draco/' );
            loader.setDRACOLoader( dracoLoader );

            // Load a glTF resource
            loader.load(
                // resource URL
                url,
                //url,
                // called when the resource is loaded
                function ( gltf ) {

                    _this.scene.getObjectByName('gltf_group').add( gltf.scene );

                    gltf.animations; // Array<THREE.AnimationClip>
                    gltf.scene; // THREE.Group
                    gltf.scenes; // Array<THREE.Group>
                    gltf.cameras; // Array<THREE.Camera>
                    gltf.asset; // Object
                    window.gltf = gltf;
                    
                    if (ion.o.gltf_group.getObjectByProperty('type', 'DirectionalLight') !== undefined ) {
                        ion.o.gltf_group.getObjectByProperty('type', 'DirectionalLight').intensity=0
                    }
                    
                    ion.initEnv();

                },
                // called while loading is progressing
                function ( xhr ) {

                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

                },
                // called when loading has errors
                function ( error ) {

                    console.log( 'An error happened' );

                }
            );
            
            
        }
        
    },
    
    initLights : function () {
        
        if (ion.o.light_group.getObjectByProperty('name', 'l_hemi') == undefined ) {
            const hemiLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 3 );
            hemiLight.name = 'l_hemi';
            hemiLight.color.setHSL(0.65, 0.5, 0.8);
            this.o.light_group.add( hemiLight );
        }
        
        
        
        if (ion.o.light_group.getObjectByName('l_dir1') !== undefined ) {
            var keyLight = ion.o.light_group.getObjectByName('l_dir1');            
            //const keyLight = new THREE.DirectionalLight( 0xffffff, 3 );
            keyLight.position.set( 0, 50, 0 ); //default; light shining from top
            keyLight.castShadow = true; // default false
            keyLight.name = 'l_dir1';
            keyLight.shadow.camera.top=50;
            keyLight.shadow.camera.right=50;
            keyLight.shadow.camera.left=-50;
            keyLight.shadow.camera.bottom=-50;
            keyLight.shadow.mapSize.x=2048;
            keyLight.shadow.mapSize.y=2048;
            keyLight.shadow.bias=-0.00001;
            keyLight.shadow.blurSamples=32;
            keyLight.shadow.radius=4;
            keyLight.shadow.camera.updateProjectionMatrix();
            //this.o.light_group.add( keyLight );
            keyLight.shadow.camera.updateProjectionMatrix();
            const shadowHelper = new THREE.CameraHelper( keyLight.shadow.camera );
            //ion.scene.add(shadowHelper);
        }
        
    },
  
    initCalibrate : function () {
        
        var o = this.sc.objects.o_plane;
        
        const matCali = new THREE.MeshStandardMaterial( {
                roughness: 1,
                metalness: 0,
                envMapIntensity: 0
                //clearcoat: 0
//             side: 2,
//             displacementScale: 0.0
        } );
        
        this.matCali = matCali;
        
        // Create the test materials
        const matTest1 = new THREE.MeshStandardMaterial( {
                roughness: 1.0,
                metalness: 0,
                envMap: 0,
                envMapIntensity: 0
                //clearcoat: 0
//             side: 2,
//             displacementScale: 0.0
        } );
        
        this.matTest1 = matTest1;
        this.matTest2 = matTest1.clone();
        this.matTest3 = matTest1.clone();
        this.matTest4 = matTest1.clone();
        this.matTest5 = matTest1.clone();
        this.matTest6 = matTest1.clone();
        
        //this.tex1_d;

        this.sc.objects.o_plane.material = 
        this.sc.objects.o_cube.material = 
        //this.sc.objects.o_cube2.material = 
        this.sc.objects.o_sphere.material =
        this.sc.objects.o_sphere2.material = matCali;

        // Load and assign the texture and depth map
        const manager = new THREE.LoadingManager();
        const loader = new THREE.TextureLoader();

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/luminosity_calibrate.png', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            matCali.map = texture;
            matCali.map.encoding = 3000;
            matCali.map.repeat.y = 4;
            matCali.map.repeat.x = 4;
            matCali.map.wrapT=1000;
            matCali.map.wrapS=1000;
            matCali.color.setHSL(0,0,0.9);
            matCali.needsUpdate = true;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/wall1.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 4;
            texture.repeat.x = 4;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex1_d = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/wall1.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3001;
            texture.repeat.y = 4;
            texture.repeat.x = 4;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex1_d2 = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/wall1_n.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 4;
            texture.repeat.x = 4;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex1_n = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/brick1.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3001;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex2_d = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/brick1_r.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex2_r = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/brick1_n.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex2_n = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/brick1_ao.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex2_ao = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/marble1.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex3_d = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/marble1_r.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex3_r = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/marble1_n.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex3_n = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/marble1_m.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex3_m = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/copper1.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3001;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex4_d = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/copper1_r.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex4_r = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/copper1_m.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex4_m = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/wood1.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex5_d = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/wood1_r.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex5_r = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/wood1_n.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex5_n = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/wood1_ao.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex5_ao = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/tiles1.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3001;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex6_d = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/tiles1_r.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex6_r = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/tiles1_n.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex6_n = texture;

        } );

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/tiles1_ao.jpg', function ( texture ) {

            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.encoding = 3000;
            texture.repeat.y = 2;
            texture.repeat.x = 2;
            texture.wrapT=1000;
            texture.wrapS=1000;
            texture.needsUpdate = true;
            ion.tex6_ao = texture;

        } );
        
        this.matTest1.map = this.tex1_d;
        this.matTest1.normalMap = this.tex1_n;
        this.matTest1.needsUpdate = true;
        
        this.matTest2.map = this.tex2_d;
        this.matTest2.normalMap = this.tex2_n;
        this.matTest2.roughnessMap = this.tex2_r;
        this.matTest2.aoMap = this.tex2_ao;
        this.matTest2.needsUpdate = true;
        
        this.matTest3.map = this.tex3_d;
        this.matTest3.normalMap = this.tex3_n;
        this.matTest3.roughnessMap = this.tex3_r;
        this.matTest3.metalnessMap = this.tex3_m;
        this.matTest3.needsUpdate = true;
        
        this.matTest4.map = this.tex4_d;
        this.matTest4.metalnessMap = this.tex4_m;
        this.matTest4.roughnessMap = this.tex4_r;
        this.matTest4.needsUpdate = true;
        
        this.matTest5.map = this.tex5_d;
        this.matTest5.normalMap = this.tex5_n;
        this.matTest5.roughnessMap = this.tex5_r;
        this.matTest5.aoMap = this.tex5_ao;
        this.matTest5.needsUpdate = true;
        
        
        this.matTest6.map = this.tex6_d;
        this.matTest6.normalMap = this.tex6_n;
        this.matTest6.roughnessMap = this.tex6_r;
        this.matTest6.aoMap = this.tex6_ao;
        this.matTest6.needsUpdate = true;

        // On load complete add the panoramic sphere to the scene
        manager.onLoad = function () {
            //scene.add( sphere );
        };
        
        
    },
  
    initEnv : function () {

        // Load and assign the texture and depth map
        const manager = new THREE.LoadingManager();
        const loader = new THREE.TextureLoader( manager );
        var envTex;
        this.envTex = envTex;

        loader.load( this.options.scene_assets_url + '_lgl1/_tex/qm/sp02.jpg', function ( envTex ) {

            envTex.minFilter = THREE.LinearMipMapLinearFilter;
            envTex.magFilter = THREE.LinearFilter;
            envTex.mapping = THREE.EquirectangularReflectionMapping;
            
            envTex.generateMipmaps = false;
            
            //ion.scene.environment = envTex;
            
            ion.o.gltf_group.traverse( function(child) {
                //if (child instanceof THREE.Mesh || THREE.Object3D ) {
                if (child.material !== undefined ) {

                // apply custom material
                child.material.envMap = envTex;
                child.material.needsUpdate = true;

                // enable casting shadows
                child.castShadow = true;
                child.receiveShadow = true;
                }
            });
            
            ion.o.main_group.traverse( function(child) {
                //if (child instanceof THREE.Mesh || THREE.Object3D ) {
                if (child.material !== undefined ) {

                // apply custom material
                child.material.envMap = envTex;
                child.material.needsUpdate = true;

                // enable casting shadows
                child.castShadow = true;
                child.receiveShadow = true;
                }
            });

        } );
    
        
        
        //this.animateParamToSMP('rotate', ion.sc.lights.l_dir1.position, { x: 0.33, y: 0.66, z: 0.33 }, 2400, easeInOutSine);
        
        
        //this.objBoard = this.o.gltf_group.getObjectByProperty('name', 'Hard_Edge_Square_300').children[0];
        this.objPlane = this.o.o_plane;

        // On load complete add the panoramic sphere to the scene
        manager.onLoad = function () {
            
            
        };
        
        
    },
  
    initVR : function () {
        
        var o = this.sc.objects;
        o.o_sphere_l.layers.mask = 1;
        o.o_sphere_r.layers.mask = 2;
        
        // Create the panoramic sphere material
        const panoSphereMat = new THREE.MeshStandardMaterial( {
            side: THREE.BackSide,
            displacementScale: - 4.0
        } );
        
        // Create the panoramic sphere material
        const panoSphereMatBasic = new THREE.MeshBasicMaterial( {
            side: THREE.BackSide
        } );

        // Create the panoramic sphere mesh
        //sphere = new THREE.Mesh( panoSphereGeo, panoSphereMat );
        var sphereL = ion.sc.objects.o_sphere_l;
        sphereL.material = panoSphereMatBasic;

        // Load and assign the texture and depth map
        const manager = new THREE.LoadingManager();
        const loader = new THREE.TextureLoader( manager );

        loader.load( this.options.scene_assets_url + 'kandao3.jpg', function ( texture ) {

            texture.minFilter = THREE.NearestFilter;
            texture.generateMipmaps = false;
            sphereL.material.map = texture;
            sphereL.material.needsUpdate = true;

        } );
/*
        loader.load( './textures/kandao3_depthmap.jpg', function ( depth ) {

            depth.minFilter = THREE.NearestFilter;
            depth.generateMipmaps = false;
            sphere.material.displacementMap = depth;

        } );
*/
        // On load complete add the panoramic sphere to the scene
        manager.onLoad = function () {
            //scene.add( sphere );
        };
        
        
    },

    initWater : function ( sc ) {

       // Water

		var waterGeometry = new THREE.PlaneBufferGeometry( 3000, 3000 );

		var water = new THREE.Water(
			waterGeometry,
			{
				textureWidth: 1024,
				textureHeight: 1024,
				waterNormals: new THREE.TextureLoader().load( 'water/flat.jpg', function ( texture ) {

					texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

				} ),
				alpha: 0.75,
				//sunDirection: (0.3, 0.4),
				sunColor: 0x888888,
				waterColor: 0x000000,
				fogColor: 0x000000,
				distortionScale: 3.7
			}
		);

		water.rotation.x = -Math.PI / 2;
		water.position.y = 65;
		water.name = 'water';
		
		//water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

		ion.scene.getObjectByName('main_group').add( water );
		ion.requestRender();
    },

    initCC1 : function ( sc ) {

		var cubeCamera = new THREE.CubeCamera(1, 5000, 1024);
		cubeCamera.name = 'cubeCamera1';
		this.scene.add(cubeCamera);
		
		//ion.sc.objects.o_floor.visible=false;
		
		
		cubeCamera.position.set(0,0,0);
		//cubeCamera.update(this.renderer, this.scene);
		cubeCamera.renderTarget.texture.generateMipmaps=true;
		ion.sc.objects.o_floor.material.envMap = cubeCamera.renderTarget.texture;
		
    },

    initCC2 : function ( sc ) {

		var cubeCamera = new THREE.CubeCamera(1, 5000, 1024);
		cubeCamera.name = 'cubeCamera2';
		this.scene.add(cubeCamera);
		
		//ion.sc.objects.o_floor.visible=false;
		
		
		cubeCamera.position.set(150,150,0);
		//cubeCamera.update(this.renderer, this.scene);
		cubeCamera.renderTarget.texture.generateMipmaps=true;
		cubeCamera.renderTarget.texture.mapping=301;
		ion.sc.materials.m_c_gray.envMap = cubeCamera.renderTarget.texture;
		
    },

    initVideo1 : function ( sc ) {

		document.getElementById( 'video1' ).play();
		this.sc.objects.o_canvas01.material.map = new THREE.VideoTexture(document.getElementById('video1'));
    },

    sceneAnim1 : function ( sc ) {

		ion.animateParamToSMP('position', ion.sc.objects.frame_group_02.position, { x: 0, y: 250, z: 0 }, 600, easeOutCubic);
		
		setTimeout(anim1, 600);
		setTimeout(anim2, 1200);
			
		function anim1() {
			ion.animateParamToSMP('position', ion.sc.objects.frame_group_03.position, { x: 0, y: 500, z: 0 }, 600, easeOutCubic);
		}			
		function anim2() {
			ion.animateParamToSMP('position', ion.sc.objects.frame_group_04.position, { x: 0, y: 750, z: 0 }, 600, easeOutCubic);
		}
    },
	
    sceneAnim2 : function ( sc ) {

		ion.animateParamToSMP('position', ion.sc.objects.frame_group_02.position, { x: 0, y: 0, z: 1360 }, 600, easeInCubic);
		
		setTimeout(anim1, 600);
		setTimeout(anim2, 1200);
			
		function anim1() {
			ion.animateParamToSMP('position', ion.sc.objects.frame_group_03.position, { x: 0, y: 0, z: 2720 }, 600, easeInCubic);
		}			
		function anim2() {
			ion.animateParamToSMP('position', ion.sc.objects.frame_group_04.position, { x: 0, y: 0, z: 4080 }, 600, easeInCubic);
		}
    },

    separateInterfaceGroup : function ( contents ) {

        var index = 0;
        var scope = this;

        while ( true ) {

            var interfaceObject = contents.scene.getObjectByName( 'interface_group' + (index++) );
            if ( interfaceObject ) {

                var interfaceFrame = new THREE.InterfaceFrame( this, interfaceObject.userData );
                contents.scene.remove( interfaceObject );
                interfaceFrame.scene.add( interfaceObject );
                scope.interfaces.push( interfaceFrame );

            } else
                break;
        }


    },

    initSecondaryScene : function ( contents ) {

        this.secondary_sc = contents;
        this.secondary_group = contents.scene.getObjectByName( 'main_group' );

        for ( var i = 0; i < contents.scene.children.length; i++ ) {

            this.scene.add( contents.scene.children[ i ] );

        }
        this.secondary_group.rotation.set( this.main_group.rotation.x, this.main_group.rotation.y, this.main_group.rotation.z );
        this.render();
    },

    initContainer : function () {
        if ( this.options.container && this.options.container instanceof HTMLElement ) {
            this.container = this.options.container;
        } else {
            this.container = $c( 'div' );
            document.body.appendChild( this.container );
        }

        if( this.options.showStatus){
            this.status_info = $c( 'div' );
            this.status_info.id = 'status-info';
            this.container.appendChild( this.status_info );
            this.showStatus( 'Loading...' );
        }

        this.container.style.animationDuration = '1s';

        this.updateAspect();


    },

    addCamerasButtons : function ( parent ) {
        if ( !parent ) return;

        var _this = this;

        for ( var cam_name in this.sc.cameras ) {
            var link = $c( 'a' );
            link.setAttribute( 'data-target', cam_name );
            link.innerHTML = cam_name;

            link.addEventListener( 'click', function () {
                var cam_name = this.getAttribute( 'data-target' );
                _this.switchCamera( cam_name );
                return false;
            } );

            parent.appendChild( link );
        }
    },

    initCamera : function () {
        var _this = this;

        var op = this.options.camera;
        var pos = op.position;


        // select camera
        if ( this.sc.currentCamera ) {
            this.camera = this.sc.currentCamera;
        } else if ( any( this.sc.cameras ) ) {
            this.camera = first( this.sc.cameras );
        } else {
            this.log( 'create camera' );
            this.camera = new THREE.PerspectiveCamera( 35, this.aspect.width / this.aspect.height, 0.1, 1500 );
            this.camera.position.set( pos.x, pos.y, pos.z );
        }

        //this.camera.lookAt( this.scene.position );

        // preserve before switch
        this.camera.userData.default_position = {
            x : this.camera.position.x,
            y : this.camera.position.y,
            z : this.camera.position.z
        };
        this.camera.userData.default_fov = this.camera.fov;

        this.camera.userData.default_target = this.camera.target;

        this.log( 'camera', this.camera );

        this.cam_group = new THREE.Object3D();
        this.cam_group.add( this.camera );
        this.scene.add( this.cam_group );

        window.addEventListener( 'resize', function () {
            _this.updateCameraAspect();
        } );

        if ( typeof IonMouseControl !== 'undefined' ) {
            this.controls = new IonMouseControl( this, { debug : this.options.debug } );
        } else if ( THREE.OrbitControls ) {
            this.orbit_controls = new THREE.OrbitControls( this.camera, this.container );
            this.orbit_controls.enableDamping = this.camera.userData.parameters.enableDamping;
            this.orbit_controls.dampingFactor = this.camera.userData.parameters.dampingFactor;
			this.orbit_controls.minDistance = this.camera.userData.parameters.minDistance;
			this.orbit_controls.maxDistance = this.camera.userData.parameters.maxDistance;
			if (this.camera.userData.parameters.minPolarAngle != undefined) {
				this.orbit_controls.minPolarAngle = this.camera.userData.parameters.minPolarAngle;
				this.orbit_controls.maxPolarAngle = this.camera.userData.parameters.maxPolarAngle;
			} else {}	
			if (this.camera.userData.parameters.minAzimuthAngle != undefined) {
				this.orbit_controls.minAzimuthAngle = this.camera.userData.parameters.minAzimuthAngle;
				this.orbit_controls.maxAzimuthAngle = this.camera.userData.parameters.maxAzimuthAngle;
			} else {}
			this.orbit_controls.panSpeed = this.camera.userData.parameters.panSpeed;
			this.orbit_controls.rotateSpeed = this.camera.userData.parameters.rotateSpeed;
			this.orbit_controls.zoomSpeed = this.camera.userData.parameters.zoomSpeed;
			this.orbit_controls.enableRotate = this.camera.userData.parameters.enableRotate;
			this.orbit_controls.enableZoom = this.camera.userData.parameters.enableZoom;
			this.orbit_controls.autoRotate = this.camera.userData.parameters.autoRotate;
			this.orbit_controls.autoRotateSpeed = this.camera.userData.parameters.autoRotateSpeed;
			//this.orbit_controls.screenSpacePanning = this.camera.userData.parameters.screenSpacePanning;
			if (this.camera.userData.parameters.screenSpacePanning == false) {
				this.orbit_controls.enablePan = false;
			} else {
				this.orbit_controls.enablePan = true;
			}
			if (this.camera.userData.parameters.enablePan == true) {
				this.orbit_controls.enablePan = true;
			} else {
				this.orbit_controls.enablePan = false;
			}

            this.orbit_controls.addEventListener( 'change', function () {
                _this.log( 'cont change' );

                _this.requestRender();
            } );

            this.cameraAnimationHelper = new THREE.CameraAnimationHelper( this );

        }

        if ( this.options.camera_info ) {
            this.showCamInfo();
        }
    },

    updateAspect : function () {
        this.aspect = {
            width : this.container.clientWidth,
            height : this.container.clientHeight
        }
    },

    updateCameraAspect : function () {
        if ( this.renderer == null ) return;

        this.updateAspect();
        this.camera.aspect = this.aspect.width / this.aspect.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( this.aspect.width, this.aspect.height );
        this.requestRender();
        
        if(this.postprocessingready)
			this.postprocessing.resize(this.aspect.width, this.aspect.height);
    },
    
    initPostPro : function () {
        
        if (this.options.postprocessing == true) {
            /*
            this.postprocessing = new EffetsManager(this.renderer,
                                                    this.scene,
                                                    this.camera,{
                                                        enabled: this.options.postprocessing,
                                                        width: this.aspect.width,
                                                        height: this.aspect.height});
            */
            this.postprocessing = new MultiEffects(this.renderer,
                                                    this.scene,
                                                    this.camera,{
                                                        enabled: this.options.postprocessing,
                                                        width: this.aspect.width,
                                                        height: this.aspect.height});
            
            this.postprocessingready = true;
        }
    },

    initRenderer : function () {
        var _this = this;

        // renderer
        this.renderer = new THREE.WebGLRenderer( { antialias : true, alpha : true, powerPreference: "high-performance", precision: "highp" } );

        this.renderer.toneMappingExposure = this.options.exposure;
        this.renderer.toneMapping = 1; // sRGBEncoding
//         const NoToneMapping = 0;
//         const LinearToneMapping = 1;
//         const ReinhardToneMapping = 2;
//         const CineonToneMapping = 3;
//         const ACESFilmicToneMapping = 4;
//         const CustomToneMapping = 5;
        this.renderer.outputEncoding = 3000; // sRGBEncoding
//         const LinearEncoding = 3000;
//         const sRGBEncoding = 3001;
        //this.renderer.shadowMap.type = 2;
        this.renderer.shadowMap.type = THREE.VSMShadowMap; // default THREE.PCFShadowMap
//         const BasicShadowMap = 0;
//         const PCFShadowMap = 1;
//         const PCFSoftShadowMap = 2;
//         const VSMShadowMap = 3;
        this.renderer.shadowMap.enabled = true;
        
        this.renderer.physicallyCorrectLights = true;
        this.renderer.physicallyBasedShading = this.options.phys_shading;
        
		//this.renderer.setClearColor( '#ffffff' );
        
        this.renderer.xr.enabled = true;
        this.renderer.xr.setReferenceSpaceType( 'local' );

        this.renderer.setSize( this.aspect.width, this.aspect.height );

        this.container.appendChild( this.renderer.domElement );
        document.body.appendChild( VRButton.createButton( this.renderer ) );

        this.updateCameraAspect();

        // stats
        if ( this.options.stats ) {
            this.stats = new Stats();
            this.container.appendChild( this.stats.domElement );

            // render info
            var ri_cont = $c( 'div' );
            ri_cont.id = 'render-info';
            this.container.appendChild( ri_cont );

            this.render_info = $c( 'pre' );
            ri_cont.appendChild( this.render_info );

            var ri_refresh = $c( 'a' );
            ri_refresh.innerHTML = 'Refresh';
            ri_cont.appendChild( ri_refresh );
            ri_refresh.addEventListener( 'click', function () {
                _this.updateRenderInfo();
            } );

            this.updateRenderInfo();
        }

        if ( this.explorer ) {
            this.explorer.init();
        }
        
        this.renderready = true;
    },

    updateRenderInfo : function () {
        var i = this.renderer.info;

        this.render_info.innerHTML =
            '<ul>' +
            '<li>memory' +
            '<ul>' +
            '<li>geometries ' + i.memory.geometries + '</li>' +
            '<li>programs ' + i.memory.programs + '</li>' +
            '<li>textures ' + i.memory.textures + '</li>' +
            '</ul>' +
            '</li>' +
            '<li>render' +
            '<ul>' +
            '<li>calls ' + i.render.calls + '</li>' +
            '<li>faces ' + i.render.faces + '</li>' +
            '<li>points ' + i.render.points + '</li>' +
            '<li>vertices ' + i.render.vertices + '</li>' +
            '</ul>' +
            '</li>' +
            '<li>ts ' + (Date.now()) + '</li>' +
            '</ul>';


    },

    showStatus : function ( text ) {
        if( !this.options.showStatus ) return;
        var el = this.status_info;

        el.innerHTML = text;
        el.style.display = 'block';
    },

    hideStatus : function () {
        if(this.status_info)
            this.status_info.style.display = 'none';
    },

    start : function () {
        var scope = this;
        var start_time = (+new Date);


        this.showStatus( 'Rendering...' );
        this.animate();
        this.animate_simple();
        this.hideStatus();

        this.log( 'started', (+new Date) - start_time );

        this.spinRound();
/*
        if ( this.options.secondary_scene != null )
            setTimeout( function () {
                scope.loadSecondaryScene();
            }, 1100 );
*/
        this.animationHelper = new THREE.AnimationsHelper(
            this,
            function (name, arguments, duration, delay, easing, callback, endCallback) {
			
                scope.animateParamTo(name, arguments, duration, delay, easing, callback, endCallback);
				
				//scope.animateParamToSMP(name, obj, end, duration, easing, callback);

            });
        this.requestRender();

    },

    requestRender : function () {
        this.needRender = true;
    },

    spinRound: function () {
    	if (this.options.spin) {
    		this.animateParamToSMP('rotate', this.main_group.rotation, { x: 0, y: this.options.rotate_left +(Math.PI * 2), z: 0 }, 900, easeInOutCubic);
    		this.log('spin');
            setTimeout(resetY, 1000);
			
			function resetY() {
			ion.sc.objects.main_group.rotation.y = ion.options.rotate_left;
				}
    	} else {}
    },

    applyAnimationToNewMaterial : function ( object ) {

        var dataClick = object.userData.click;

        if ( dataClick ) {

            for ( var key in dataClick ) {
                var args = dataClick[ key ].backAnimation;
                if ( args ) {

                    for ( var argKey in args ) {

                        if ( argKey.indexOf( 'material' ) > -1 ) {

                            setArgs( argKey, dataClick[ key ].clickOn ? args[ argKey ].obj : args[ argKey ].end );
                        }

                    }

                }

            }

        }
        function setArgs ( key, data ) {

            if ( data instanceof Object ) {

                var objectArgument = getDiffArgument( key, object )
                for ( var dataKey in data ) {
                    objectArgument[ dataKey ] = data[ dataKey ];
                }

            } else {
                setParam( key, data );
            }
        }


        function setParam ( key, value ) {

            var array = key.split( '.' );
            if ( array.length > 1 ) {
                if ( array.length == 2 )
                    object[ array[ 0 ] ][ array[ 1 ] ] = value;
                else if ( array.length == 3 )
                    object[ array[ 0 ] ][ array[ 1 ] ][ array[ 2 ] ] = value;
                else if ( array.length == 4 )
                    object[ array[ 0 ] ][ array[ 1 ] ][ array[ 2 ] ][ array[ 3 ] ] = value;
                else if ( array.length == 5 )
                    object[ array[ 0 ] ][ array[ 1 ] ][ array[ 2 ] ][ array[ 3 ] ][ array[ 4 ] ] = value;

            } else {
                object[ key ] = value;
            }

        }
    },

    animateParamToSMP: function (name, obj, end, duration, easing, callback) {
        // clone hash
        var start = extend({}, end),
            delta = extend({}, end);

        // fill values
        for (var param in end) {
            start[param] = obj[param];
            delta[param] = end[param] - obj[param];
        }

        this.animations[name] = {
            obj: obj,
            start: start,
            delta: delta,
            callback: callback,
            duration: duration,
            easing: easing || easeInOutCubic,
            started: (+new Date)
        };

        //console.log('anim', name, obj, end, duration);
    },

    animateParamTo: function (name, arguments, duration, delay, easing, callback, callbackEnd) {

        this.animations[name] = {
            args: {},
            callback: callback,
            callbackEnd: callbackEnd,
            duration: duration,
            easing: easing || easeOutCubic,
            started: (+new Date) + delay
        };

        for (var argument in arguments) {

            if (arguments[argument].obj instanceof Object) {
                var obj = {};

                var end = {};

                for (var key in arguments[argument].obj) {
                    if (['x', 'y', 'z', 'w', 'r', 'g', 'b'].indexOf(key) >= 0) {
                        obj[key] = arguments[argument].obj[key];
                        end[key] = arguments[argument].end[key];
                    }
                }

                var start = extend({}, end);
                var delta = extend({}, end);

                for (var param in end) {
                    start[param] = obj[param];
                    delta[param] = end[param] - obj[param];
                }
            } else {

                var obj = arguments[argument].obj;
                var end = arguments[argument].end;
                var start = obj;
                var delta = end - obj;
            }

            this.animations[name].args[argument] = {
                obj: obj,
                start: start,
                delta: delta
            };
        }
		this.log(name, arguments, duration, delay, easing, callback, callbackEnd);
    },

    // {x: 0, y: 0}
    setRotation: function (rotate) {
        this.animateParamToSMP('rotate', this.cam_group.rotation, rotate, 1000, easeOutCubic);
    },

    setFov: function (fov) {
        this.animateParamToSMP('fov', this.camera, {
            fov: fov
        }, 1000, easeOutCubic);
    },

    switchCamera : function ( cam_name, duration, easingCam ) {
        var scope = this;
        var cameraCurrentView = this.sc.cameras[ cam_name ];

        if ( cameraCurrentView ) {

            var easing = easingCam || (cameraCurrentView.userData ? cameraCurrentView.userData.easing : undefined);

            if( easing == null )
                duration = 0;

            if ( this.camera.name == cam_name ) {
                var new_pos = this.camera.userData.default_position;
                var new_fov = this.camera.userData.default_fov;
                var target = this.camera.userData.default_target;

            } else {
                var new_cam = this.sc.cameras[ cam_name ];
                var new_pos = new_cam.position
                    ? { x : new_cam.position.x, y : new_cam.position.y, z : new_cam.position.z }
                    : this.options.camera.position;
                var new_fov = new_cam.fov || this.options.camera.fov;
                var target = new_cam.target || this.options.camera.target;
            }

            var arguments = {

                position : new_pos,
                target : target,
                fov : new_fov,
                easing : easing
            };

            this.moveCamera( 'camera_fov', arguments, duration, undefined, easing, function () {
                scope.cameraAnimationHelper.applyOptions( cameraCurrentView );
            } )


        }
    },

    switchTarget: function (cam_name, duration, easingCam) {
        var scope = this;
        var cameraCurrentView = this.sc.cameras[cam_name];

        if (cameraCurrentView) {

            var easing = easingCam || (cameraCurrentView.userData ? cameraCurrentView.userData.easing : undefined);

            if (easing == null)
                duration = 0;

            if (this.camera.name == cam_name) {
                var new_fov = this.camera.userData.default_fov;
                var target = this.camera.userData.default_target;

            } else {
                var new_cam = this.sc.cameras[cam_name];
                var new_fov = new_cam.fov || this.options.camera.fov;
                var target = new_cam.target || this.options.camera.target;
            }

            var arguments = {

                target: target,
                fov: new_fov,
                easing: easing
            };

            this.moveCamera('camera_fov', arguments, duration, undefined, easing, function () {
                scope.cameraAnimationHelper.applyOptions(cameraCurrentView);
            })

        }
    },

    moveCamera: function (animationName, arguments, duration, delay, easing, onAnimate) {

        var scope = this;
        animate(arguments, duration == 0 ? 0 : duration || 1800, delay || 0);

        function animate(args, duration, delay) {

            scope.orbit_controls.focus(
                args,
                function (name, arguments, callback, callbackEnd) {

                    if (easing == null) {
                        scope.container.style.animationName = "changeCamera";
                        setTimeout(function () {
                            scope.animateParamTo(animationName, arguments, duration, delay, getCurve(easing), callback, callbackEnd);
                            scope.container.style.animationName = "";
                        }, 500);
                    } else {
                        scope.animateParamTo(animationName, arguments, duration, delay, getCurve(easing), callback, callbackEnd);
                    }

                },
                onAnimate);

        }
    },

    animateCamera: function (animationName, args, duration, delay, onAnimate) {

        var scope = this;

        this.orbit_controls.focus2(
            args,
            function (name, arguments, callback, callbackEnd) {

                scope.animateParamTo(animationName, arguments, duration, delay, null, callback, callbackEnd);
            },
            onAnimate);

    },

    disposeWebGL : function () {

        var scope = this;

        this.clearScene( this.sc.scene, this.camera );

        this.animationHelper.dispose();

        this.interfaces.map( function ( object ) {

            scope.clearScene( object.scene, object.camera, object.renderer );

        } );

        for ( var key in this.sc.cameras ) {
            var camera = this.sc.cameras[ key ];
            scope.clearScene( camera );
            if ( camera.parent ) {
                camera.parent.remove( camera );
            } else {
                this.sc.cameras[ key ] = null;
            }
        }

        for ( var key in this.sc.empties ) {
            var object = this.sc.empties[ key ];
            scope.clearScene( object );
            if ( object.parent ) {
                object.parent.remove( object );
            } else {
                this.sc.empties[ key ] = null;
            }
        }

        for ( var key in this.sc.geometries ) {
            var geometry = this.sc.geometries[ key ];
            geometry.dispose();
            this.sc.geometries[ key ] = null;
        }

        for ( var key in this.sc.lights ) {
            var light = this.sc.lights[ key ];
            if ( light.parent ) {
                light.parent.remove( light );
            } else {
                this.sc.lights[ key ] = null;
            }
        }

        for ( var key in this.sc.materials ) {
            var material = this.sc.materials[ key ];
            if ( material instanceof THREE.MultiMaterial ) {

                for ( var i = 0; i < material.materials.length; i++ ) {
                    material.materials[ i ].dispose();
                }

            } else {
                material.dispose();
            }
            this.sc.materials[ key ] = null
        }

        for ( var key in this.sc.objects ) {
            var object = this.sc.objects[ key ];
            scope.clearScene( object );
            if ( object.parent ) {
                object.parent.remove( object );
            } else {
                this.sc.objects[ key ] = null;
            }
        }

        for ( var key in this.sc.textures ) {
            var texture = this.sc.textures[ key ];
            texture.dispose();
            this.sc.textures[ key ] = null;
        }

        this.orbit_controls.dispose();
        this.orbit_controls = null;

        this.sc.scene = null;

        this.renderer.dispose();
        this.requestRender();

        setTimeout(function (){
            scope.renderer = null;
        },0)

    },

    clearScene : function ( scene, camera, renderer ) {

        var objects = scene.children;

        while ( objects.length > 0 ) {

            removeObject( objects[ 0 ] );

        }

        function removeObject ( object ) {


            object.traverse( function ( child ) {

                if ( child.dispose ) child.dispose();
                if ( child.material ) {
                    if ( child.material instanceof THREE.MultiMaterial ) {

                        for ( var i = 0; i < child.material.materials.length; i++ ) {
                            child.material.materials[ i ].dispose();
                        }

                    } else {
                        child.material.dispose();
                    }

                }
                if ( child.geometry ) child.geometry.dispose();

            } );

            object.parent.remove( object );
            if ( object.dispose ) object.dispose();
            if ( object.material ){
                if ( object.material instanceof THREE.MultiMaterial ) {

                    for ( var i = 0; i < object.material.materials.length; i++ ) {
                        object.material.materials[ i ].dispose();
                    }

                } else {
                    object.material.dispose();
                }
            }
            if ( object.geometry ) object.geometry.dispose();
        }

        if ( scene ) scene = null;
        if ( camera ) camera = null;
        if ( renderer ) {
            renderer.dispose();
            renderer = null;
        }

    },


    animate_simple: function(t) {
        var _this = this;
        requestAnimationFrame(function(t){ _this.animate_simple(t) }, this.renderer.domElement);
							  
        this.processAnimations();

    },
    
    initLookAt : function () {
        
        window.addEventListener('mousemove', this.handleMouseMove, false);
        
    },
    
    handleMouseMove : function (event) {
        
        var _this = ion;
        var mousePos = {x:event.clientX, y:event.clientY};
        ion.mousePos = mousePos;
        
        var xTarget = (mousePos.x-(_this.container.clientWidth/2));
        var yTarget = (mousePos.y-(_this.container.clientHeight/2));
        ion.xTarget = xTarget;
        ion.yTarget = yTarget;
        
        //console.log("mouse: ", xTarget, yTarget);
        
        //ion.tHeadRotY = ion.rule3((mousePos.x-(ion.container.clientWidth/2)), -200, 200, -Math.PI/4, Math.PI/4);
        //ion.tHeaconsole.log("mouse: ", xTarget, yTarget);dRotX = ion.rule3((mousePos.y-(ion.container.clientHeight/2)), -200,200, -Math.PI/4, Math.PI/4);
        //console.log("mousePos: ", this.mousePos);
        
        
    },
    
    updateMouse : function () {
        
        var _this = ion;
        
        // choose either mousePos input, or xTarget
        var tHeadRotY = _this.rule3((_this.mousePos.x-(_this.container.clientWidth/2)), -200, 200, -Math.PI/4, Math.PI/4);
        var tHeadRotX = _this.rule3((_this.mousePos.y-(_this.container.clientHeight/3)), -200,200, -Math.PI/4, Math.PI/4);
        //console.log("tHeadRotY: ", tHeadRotY, "tHeadRotX: ", tHeadRotX, );
        _this.tHeadRotY = tHeadRotY;
        _this.tHeadRotX = tHeadRotX;
        
        _this.updateFace(10);
    },
    
    updateFace : function () {
        
        var _this = ion;
        //var speed = _this.options.mouseTrackingSpeed;
        var speedFace = _this.options.mouseTrackingSpeed;
        var speedBody = _this.options.mouseTrackingSpeed*3.0;
    
        var faceRot = ion.sc.objects.face_group;
        var bodyRot = ion.sc.objects.main_group;
        
        if (_this.options.mouseTracking == true) {
            
            faceRot.rotation.y += (_this.tHeadRotY - faceRot.rotation.y) / speedFace;
            faceRot.rotation.x += (_this.tHeadRotX - faceRot.rotation.x) / speedFace;
            //faceRot.rotation.x += (_this.tHeadRotX*0.33 - faceRot.rotation.x) / speedFace;
            //bodyRot.rotation.x += (_this.tHeadRotX*0.66 - bodyRot.rotation.x) / speedBody;
        }
    },
    
    clamp: function (v,min, max){
        return Math.min(Math.max(v, min), max);
    },

    rule3: function (v,vmin,vmax,tmin, tmax){
        var nv = Math.max(Math.min(v,vmax), vmin);
        var dv = vmax-vmin;
        var pc = (nv-vmin)/dv;
        var dt = tmax-tmin;
        var tv = tmin + (pc*dt);
        return tv;    
    },
	
    animate: function (t) {

        if (this.renderer == null) {
            cancelAnimationFrame(this.requestAnimate);
            return;
        }

        var _this = this;
        ion.updateMouse();
        
        //console.log("mouse: ", ion.xTarget, ion.yTarget);
        
        this.requestAnimate = requestAnimationFrame(function (t) {
            _this.animate(t)
        }, this.renderer.domElement);
        
        //this.container.clientWidth

        this.processAnimations2();

        if ( this.orbit_controls ) {
            this.orbit_controls.update();
        }

//         if ( this.needRender || this.options.always_render ) {
//             this.render( t );
//             this.needRender = false;
//         }
		
// 		if(this.options.eyes_lookAt == true) {
// 			this.sc.lights.l_eye_r.parent.lookAt(this.camera.position);
//             this.sc.lights.l_eye_l.parent.lookAt(this.camera.position);
//         }
		
		var pneed = false;
		if(this.postprocessingready)
			pneed = this.postprocessing.needRender();
		
        if ( this.needRender || this.options.always_render || pneed ) {
            this.render( t );
            this.needRender = false;
        }

        if (this.options.stats)
            this.stats.update();

    },
	
//     animate: function (t) {
// 
//         if (this.renderer == null) {
//             cancelAnimationFrame(this.requestAnimate);
//             return;
//         }
// 
//         var _this = this;
//         this.requestAnimate = requestAnimationFrame(function (t) {
//             _this.animate(t)
//         }, this.renderer.domElement);
// 
//         this.processAnimations2();
// 
//         if (this.orbit_controls) {
//             this.orbit_controls.update();
//         }
// 
//         if (this.needRender || this.options.always_render) {
//             this.render(t);
//             this.needRender = false;
//         }
// 
//         if (this.options.stats)
//             this.stats.update();
// 
//     },


    processAnimations: function () {
        for (var name in this.animations) {
            var anim = this.animations[name],
                obj = anim.obj,
                timer = (+new Date) - anim.started;

            for (var param in anim.start) {
                var start_val = anim.start[param],
                    delta = anim.delta[param],
                    new_val = anim.easing(timer, start_val, delta, anim.duration);

                obj[param] = new_val;

                if (obj == this.camera) {
                    this.camera.updateProjectionMatrix();
                }
            }

            if (name == 'cam switch') {
                this.camera.lookAt(this.scene.position);
            }

            if (timer > anim.duration) {
                //                    this.log('anim stop', name, new_val);
                if (anim.callback) {
                    anim.callback.call(this, obj);
                }

                delete this.animations[name];
            }

            this.requestRender();
        }
    },

    processAnimations2: function () {

        var event = false;

        for (var name in this.animations) {

            var anim = this.animations[name],
                arguments = anim.args,
                timer = (+new Date) - anim.started;

            if (anim.started > (+new Date))
                continue;

            if (anim.easing && anim.easing != null)
                for (var argument in arguments) {

                    var start = arguments[argument].start;
                    var delta = arguments[argument].delta;

                    if (arguments[argument].obj instanceof Object) {

                        for (var param in start) {
                            var startValue = start[param],
                                deltaValue = delta[param],
                                newValue = anim.easing(timer, startValue, deltaValue, anim.duration);

                            arguments[argument].obj[param] = newValue;
                        }

                    } else {

                        var newValue = anim.easing(timer, start, delta, anim.duration);
                        arguments[argument].obj = newValue;
                    }

                }

            if (anim.callback) {

                anim.callback.call(this, arguments);
            }

            if (timer > anim.duration) {

                if (anim.callbackEnd) {
                    anim.callbackEnd.call(this, arguments);
                }
                delete this.animations[name];

            }

            event = true;
        }

        if (Object.keys(this.autorotations).length > 0) {

            var delta = this.clock.getDelta();

            for (var key in this.autorotations) {

                var object = this.autorotations[key];
                if (object.userData.autorotation.enabled) {

                    for (var axis in object.userData.autorotation.speed) {

                        object.rotation[axis] += object.userData.autorotation.speed[axis] * delta;

                    }
                    event = true;
                }
            }

        }
        if (event)
            this.requestRender();

    },

    render : function ( t ) {

//         if(this.renderready){
// 			if(this.postprocessingready)
// 				this.postprocessing.render();
// 		} else {		
	
//             this.renderer.clear();
//             this.renderer.render( this.scene, this.camera );
// 		} 
		
		
        this.renderer.clear();
        this.renderer.render( this.scene, this.camera );
		
        if(this.renderready){
			// this.multicontrol.render();
			if(this.postprocessingready)
				this.postprocessing.render();
		}

        for ( var i = 0, j = this.interfaces.length; i < j; i++ ) {
            this.interfaces[ i ].renderer.clear();
            this.interfaces[ i ].renderer.render( this.interfaces[ i ].scene, this.interfaces[ i ].camera );
        }

        if ( this.options.camera_info ) this.showCamInfo();
    },
	
	loadMaterial : function() {
		var opt = this.options;
// 		var url = "";
		
		
		
        var o = this.sc.objects;
		var mMat = this.data.param.mmMat;
		var tex_loader = new THREE.TextureLoader();
		var pc = ion.data.param;
		var pcm = ion.data.param.material;
		var st = ion.data_stored.param;
		var stm = ion.data_stored.param.material;
		//var currentMat = pc.mMat;

		
		if (matNoo = mMat, pcm[matNoo] != undefined || null)   {
			
			var matNo = matNoo;
			var matAr = matNo.substring(5,6);
			var pcMat = pcm[matNo];
			var stMat = stm[matNo];
			var arMat = ion.sc.materials.mm_01[matAr-1];

			
			if (pcMat.map !== null && pcMat.map.indexOf('http') !== -1 || pcMat.roughnessMap.indexOf('http') !== -1 || pcMat.bumpTex.indexOf('http') !== -1 ) {
				var url = "";
				console.log('web url');
			} else {
				var url = opt.scene_assets_url + opt.woo_tex_url;
			}
			
			let albedoTex = url + pcMat.map;
			let roughnessTex = url + pcMat.roughnessMap;
			let bumpTex = url + pcMat.bumpMap;
			let rotA = ((Math.PI*2)/360)*(pcm[matNoo].map_rotate/1);
			

			
			var _console = this;
			
			_console.log(mMat);
			
			if (pcMat.map != undefined || null) {
				// if (pcm[matNo].map != stm[matNo].map) {
				if (pcm[matNo].map != undefined) {
					tex_loader.load(albedoTex,
						function (texture) {
						if (pcMat.bumpMap == 'albedo' && pcMat.roughnessMap == 'albedo') {
							arMat.map = arMat.bumpMap = arMat.roughnessMap = (texture);
							_console.log('albedo' + matNo + 'for all', albedoTex);
						} else if (pcMat.bumpMap == 'albedo' && pcMat.roughnessMap !== 'albedo') {
							arMat.map = arMat.bumpMap = (texture);
							_console.log('albedo' + matNo + '+ bump');
						} else if (pcMat.bumpMap !== 'albedo' && pcMat.roughnessMap == 'albedo') {
							arMat.map = arMat.roughnessMap = (texture);
							_console.log('albedo' + matNo + '+ roughnessMap');
						} else {
							arMat.map = (texture);
							_console.log('albedo' + matNo + 'just map', texture);
						}
						texture.flipY = true;
						texture.anisotropy = 8;
						texture.repeat.set(pcMat.map_tiling, pcMat.map_tiling);
						texture.wrapS = texture.wrapT = 1000;
						
						arMat.map.rotation = rotA;
						
						stm[matNo].map = pcm[matNo].map;
						arMat.needsUpdate=true;
						ion.requestRender();
					},
						function (xhr) {
						_console.log((xhr.loaded / xhr.total * 100) + '% loaded');
					});
				} else {
					_console.log('albedo_' + matNo + ' no change');
				}
			} else {
				_console.log('albedo ' + matNo + ' null');
				if (pcMat.bumpMap == 'albedo' && pcMat.roughnessMap == 'albedo') {
					arMat.map = arMat.bumpMap = arMat.roughnessMap = null;
					arMat.needsUpdate=true;
				} else if (pcMat.bumpMap == 'albedo' && pcMat.roughnessMap !== 'albedo') {
					arMat.map = arMat.bumpMap = null;
					arMat.needsUpdate=true;
				} else if (pcMat.bumpMap !== 'albedo' && pcMat.roughnessMap == 'albedo') {
					arMat.map = arMat.roughnessMap = null;
					arMat.needsUpdate=true;
				} else {
					arMat.map = null;
					arMat.needsUpdate=true;
				}
			}

			if (pcMat.bumpMap != undefined || null) {
				if (pcm[matNo].bumpMap != stm[matNo].bumpMap) {
					if (pcMat.bumpMap == 'albedo') {
						stm[matNo].bumpMap = pcm[matNo].bumpMap;
						_console.log('bumpMap_' + matNo + ' //skipped');
					} else if (bumpTex.indexOf("jpg") !== -1 || bumpTex.indexOf("png") !== -1) {
						tex_loader.load(bumpTex,
							function (texture) {
							if (pcMat.roughnessMap = 'bumpMap') {
								arMat.bumpMap = arMat.roughnessMap = (texture);
								arMat.needsUpdate=true;
								_console.log('bumpMap' + matNo + '+ roughnessMap');
							} else {
                                arMat.bumpMap = (texture);
								arMat.needsUpdate=true;
								_console.log('bumpMap' + matNo + 'just bumpMap');
							}
							texture.flipY = true;
							texture.anisotropy = 4;
							texture.repeat.set(pcMat.bumpMap_tiling, pcMat.bumpMap_tiling);
							texture.wrapS = texture.wrapT = 1000;
							stm[matNo].bumpMap = pcm[matNo].bumpMap;
							ion.requestRender();
						},
							function (xhr) {
							_console.log((xhr.loaded / xhr.total * 100) + '% loaded');
						})
					} else {
						_console.log('bumpMap_' + matNo + '//strange case');
					}
				} else {
					stm[matNo].bumpMap = pcm[matNo].bumpMap;
					_console.log('bumpMap_' + matNo + ' no change');
				}
			} else {
				arMat.bumpMap=null;
				arMat.needsUpdate=true;
				_console.log('bumpMap_' + matNo + '//null');
			}

			if (pcMat.roughnessMap != undefined || null) {
				if (pcm[matNo].roughnessMap != stm[matNo].roughnessMap) {
					if (pcMat.roughnessMap == 'albedo' || pcMat.roughnessMap == 'bumpMap') {
						stm[matNo].roughnessMap = pcm[matNo].roughnessMap;
						_console.log('roughnessMap_' + matNo + ' //skipped');
					} else if (roughnessTex.indexOf("jpg") !== -1 || roughnessTex.indexOf("png") !== -1) {
						tex_loader.load(roughnessTex,
							function (texture) {
							if (pcMat.bumpMap == 'bumpMap') {
								arMat.bumpMap = arMat.roughnessMap = (texture);
								arMat.needsUpdate=true;
								_console.log('roughnessMap' + matNo + '+ bumpMap');
							} else {
								arMat.roughnessMap = (texture);
								arMat.needsUpdate=true;
								_console.log('roughnessMap' + matNo + 'just roughnessMap');
							}
							texture.flipY = true;
							texture.anisotropy = 4;
							texture.repeat.set(pcMat.roughness_tiling, pcMat.roughness_tiling);
							texture.wrapS = texture.wrapT = 1000;
							stm[matNo].roughnessMap = pcm[matNo].roughnessMap;
							ion.requestRender();
						},
							function (xhr) {
							_console.log((xhr.loaded / xhr.total * 100) + '% loaded');
						})
					} else {
						_console.log('roughnessMap_' + matNo + '//strange case');
					}
				} else {
					stm[matNo].roughnessMap = pcm[matNo].roughnessMap;
					_console.log('roughnessMap_' + matNo + ' no change');
				}
			} else {
				arMat.roughnessMap=null;
				arMat.needsUpdate=true;
				_console.log('roughnessMap_' + matNo + '//null');
			}

			
			if (pcMat.color != undefined || null ) {
				var h = pcMat.color.h;
				var s = pcMat.color.s;
				var l = pcMat.color.l;
				arMat.color.setHSL(h,s,l) ;
			} else {
				arMat.color.setHSL(0,0,0.5) ;
			}
			
			if ( bumpTex != null && pcMat.bumpScale != undefined || null) {
				arMat.bumpScale = pcMat.bumpScale;
			} else {
				arMat.bumpScale = 0;
			}
			
			if (pcMat.envMapIntensity != undefined || null ) {
				arMat.envMapIntensity = pcMat.envMapIntensity;
			} else {
				arMat.envMapIntensity = 1;
			}
			
			if (pcMat.metalness != undefined || null ) {
				arMat.metalness = pcMat.metalness;
			} else {
				arMat.metalness = 0;
			}
			
			if (pcMat.roughness != undefined || null ) {
				arMat.roughness = pcMat.roughness;
			} else {
				arMat.roughness = 0.5;
			}
			
			if (pcMat.lightMapIntensity != undefined || null ) {
				arMat.lightMapIntensity = pcMat.lightMapIntensity;
			} else {
				arMat.lightMapIntensity = 0.5;
			}
			
			if (pcMat.aoMapIntensity != undefined || null ) {
				arMat.aoMapIntensity = pcMat.aoMapIntensity;
			} else {
				arMat.aoMapIntensity = 0.5;
			}
			
			
			if (arMat.bumpMap !== null ){
				arMat.bumpMap.rotation = rotA;
				arMat.bumpMap.repeat.set(pcMat.map_tiling, pcMat.map_tiling);
			}
			if (arMat.roughnessMap !== null ){
				arMat.roughnessMap.rotation = rotA;
				arMat.roughnessMap.repeat.set(pcMat.map_tiling, pcMat.map_tiling);
			}
			
			// if (ion.data.param.material.mat_01.map_rotate != undefined ) {
				// rotA = ((Math.PI*2)/360)*(ion.data.param.material.mat_01.map_rotate/1);
				// arMat.map.rotation = rotA;
				// ion.sc.materials.mm_01[0].map.rotation = (rotA/1);
				// ion.sc.materials.mm_01[0].map.needsUpdate=true;
				// ion.sc.materials.mm_01[0].needsUpdate=true;
				// _console.log('albedo rotation', rotA, pcMat.map_rotate, ion.m.mm_01[0].map.rotation);
			// } else {
				// arMat.map.rotation = 0.0;
			// }
			
			if (arMat.type == "MeshPhysicalMaterial" ) {
				if (pcMat.clearCoat != undefined || null ) {
					arMat.clearCoat = pcMat.clearCoat;
				} else {
					arMat.clearCoat = 0;
				}
				
				if (pcMat.clearCoatRoughness != undefined || null ) {
					arMat.clearCoatRoughness = pcMat.clearCoatRoughness;
				} else {
					arMat.clearCoatRoughness = 0;
				}
				
				if (pcMat.reflectivity != undefined || null ) {
					arMat.reflectivity = pcMat.reflectivity;
				} else {
					arMat.reflectivity = 0.5;
				}
			} else {
			}
			
			this.applyMaterials();
			this.requestRender();
            
			console.log("---------------> loadMaterials");
			
		} else {
		}
	},
	
	applyMaterials : function() {
	
        var o = this.sc.objects;
		// applies materials if replacement is needed

	},    		
	renderControls: function (mainWrapper) {

        if (ion.options.controls == true) {

			var o = ion.sc.objects;
			var pc = ion.data.param;
			var lg = ion.o.light_group;
			var l_dir = ion.o.light_group.getObjectByName('l_dir1');
			var l_probe = ion.scene.getObjectByName('l_probe');
            var currentHSL = new THREE.Color();
            
            


            var input = $g('slider-mg_pos_x');
            input.value = (ion.o.main_group.position.x + '');
            $g('mg_pos_x-value').innerHTML = input.value + ''

            input.addEventListener('change', function () {
                $g('mg_pos_x-value').innerHTML = this.value + '';

                var mval = (this.value);
                o.main_group.position.x = mval / 1;
            });

            var input = $g('slider-mg_pos_y');
            input.value = (ion.o.main_group.position.z + '');
            $g('mg_pos_y-value').innerHTML = input.value + ''

            input.addEventListener('change', function () {
                $g('mg_pos_y-value').innerHTML = this.value + '';

                var mval = (this.value);
                o.main_group.position.z = mval / 1;
            });

            var input = $g('slider-mg_rot_y');
            input.value = 0;
            $g('mg_rot_y-value').innerHTML = input.value + ''

            input.addEventListener('change', function () {
                $g('mg_rot_y-value').innerHTML = this.value + '';

                var mval = (this.value);
                o.main_group.rotation.y = mval * ((Math.PI/180).toFixed(3));
            });

            var input = $g('slider-lg_pos_x');
            input.value = (lg.rotation.x);
            $g('lg_pos_x-value').innerHTML = input.value + ''

            input.addEventListener('change', function () {
                $g('lg_pos_x-value').innerHTML = this.value + '';

                var mval = (this.value);
                lg.rotation.x = mval / 1;
            });

            var input = $g('slider-lg_pos_y');
            input.value = (lg.rotation.y);
            $g('lg_pos_y-value').innerHTML = input.value + ''

            input.addEventListener('change', function () {
                $g('lg_pos_y-value').innerHTML = this.value + '';

                var mval = (this.value);
                lg.rotation.y = mval / 1;
            });

            var input = $g('slider-lg_pos_z');
            input.value = (lg.children[0].rotation.z);
            $g('lg_pos_z-value').innerHTML = input.value + ''

            input.addEventListener('change', function () {
                $g('lg_pos_z-value').innerHTML = this.value + '';

                var mval = (this.value);
                lg.children[0].rotation.z = mval / 1;
            });

            var input = $g('slider-lg_int');
            input.value = (l_dir.intensity + '');
            $g('lg_int-value').innerHTML = input.value + ''

            input.addEventListener('change', function () {
                $g('lg_int-value').innerHTML = this.value + '';

                var mval = (this.value);
                l_dir.intensity = mval / 1;
            });

            var input = $g('slider-hemi_int');
            input.value = 0;
            $g('hemi_int-value').innerHTML = input.value + ''

            input.addEventListener('change', function () {
                $g('hemi_int-value').innerHTML = this.value + '';

                var mval = (this.value);
                ion.scene.getObjectByName('l_hemi').intensity = mval / 1;
            });
            
            var input = $g('slider-hemi_temp');
            input.value = 0;
            $g('hemi_temp-value').innerHTML = input.value + ''

            input.addEventListener('change', function () {
                $g('hemi_temp-value').innerHTML = this.value + '';

                var mval = (this.value);
                ion.scene.getObjectByName('l_hemi').color.getHSL(currentHSL);
                var t = mval /1;
                var a = (t + 30)/60;
                a = (a < 0) ? 0 : ((a > 1) ? 1 : a);

                // Scrunch the green/cyan range in the middle
                var sign = (a < .5) ? -1 : 1;
                a = sign * Math.pow(2 * Math.abs(a - .5), .35)/2 + .5;

                // Linear interpolation between the cold and hot
                var h0 = 259;
                var h1 = 12;
                var h = (h0) * (1 - a) + (h1) * (a);
                var hhh = h/360;
                var lum = 0.95 - Math.abs(mval/60);
                console.log('lum: ', lum);
                ion.scene.getObjectByName('l_hemi').color.setHSL(hhh, currentHSL.s, lum);
            });
            
            
            var input = $g('slider-lprobe_int');
            input.value = (l_probe.intensity + '');
            $g('lprobe_int-value').innerHTML = input.value + ''

            input.addEventListener('change', function () {
                $g('lprobe_int-value').innerHTML = this.value + '';

                var mval = (this.value);
                l_probe.intensity = mval / 1;
            });

            

        }
    },


	
	collectData: function() {
        var serials = this.ion.skus2,
            serialsByTypes = this.serialsByTypes = {};

        // serials
        for (var id in serials) {
            var model = serials[id];

            serialsByTypes[model.type] = serialsByTypes[model.type] || [];
            serialsByTypes[model.type].push({title: model.title || id, id: id});
        }
			// console.log("mat_name : " + mat_name);
			// console.log( "printout:" + JSON.stringify( this.viewer.mat_lib ) );
        }
		

};
