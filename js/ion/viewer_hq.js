// Ion viewer modified for d17 (HQ viewer)

function IonVR ( options ) {
    var options = options || {};

    var defaults = {
        stats : false,
        debug : false,
        container : null,
        skybox : false,
        lightprobe : true,
        lightprobe_tx : '',
        lightprobe_comp : '',
        lightprobeInt : 0.8,
		exposure : 1.0,
        skybox_tx : '',
        always_render : false,
        scene : '', // url
        env : '', // url
		env_bg : true,
		env_cube : {
			size : {
                x : 3400,
                y : 3400,
                z : 3400
			},
			pos : {
                x : 0,
                y : 0,
                z : 0
            }
		},
		scene_assets_url : '',
		woo_tex_url : '',
		woo_3d_url : '',
        geom_buffer : false,
        g_in : false,
        g_out : false,
		g_f : 2,
        phys_shading : false,
        rotate_left : 1.57, // rotate main group by y axis
        spin : true, // spin on switching frames
        spin_duration : 1000,
        zoom_factor : 10,
        set : null,
        ready : false,
        showStatus : true,
		water: false,
		c_cam1: false,
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
        }
    };
	
	// data values
    this.data = {
        param: {
			wind: {
				direction: 270,
				speed: 25
			},
			gust: {
				direction: 270,
				speed: 25
			},
			sky: 'clear',
			
			materials : {
			},
			mMat: 0,
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
			wind: {
				direction: 270,
				speed: 25
			},
			gust: {
				direction: 270,
				speed: 25
			},
			sky: 'clear',
			materials : {
				mat_01: {},
				mat_02: {},
				mat_03: {},
				mat_04: {},
				mat_05: {},
				mat_06: {},
				mat_07: {},
				mat_08: {},
				mat_09: {},
				mat_10: {},
				mat_11: {},
				mat_12: {},
				mat_13: {},
				mat_14: {},
				mat_15: {},
				mat_16: {},
				mat_17: {},
				mat_18: {},
				mat_19: {},
				mat_20: {},
				mat_21: {},
				mat_22: {}
			},
			monogram: null,
			mMat: 0,
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
        //this.loadCameraAnimations();
        this.loadScene( function () {
            this.initCamera();
            this.initRenderer();
			//this.switchCamera('Default_View');

            if ( this.onReady ) {
                this.onReady()
            }

            this.start();
			// this.cMat();
			
			setTimeout(loadDef, 500);
			setTimeout(loadEnd, 2000);
			
			function loadDef() {
				ion.requestRender();
				
			}			
			function loadEnd() {
				//ion.spinRound();
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

        //this.separateInterfaceGroup( sc );
        
        //var sceneSnap;
        //fetch('http://127.0.0.1:7778/_vr_vrml_01/_vr1/scene1.json').then(res => res.json()).then(data => sceneSnap = data)

        this.sc = sc;

        this.scene = sc.scene;
        this.main_group = this.scene.getObjectByName( 'main_group' );


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

                if ( obj.userData.buffer && this.options.geom_buffer && THREE.BufferGeometryUtils ) {
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

        this.main_group.rotation.y = this.options.rotate_left;
		this.log('init_rotation',this.options.rotate_left)


        // skybox
        if ( this.options.skybox == true ) {
            	
			var e = this.options.env_cube;
			
			if (ion.options.env_bg == false) {
			
				var shader = THREE.ShaderLib[ "cube_y" ]; // vertical offset cube shader
				shader.uniforms[ "tCube" ].value = this.sc.textures[ this.options.skybox_tx ];
				var material = new THREE.ShaderMaterial( {
						fragmentShader : shader.fragmentShader,
						vertexShader : shader.vertexShader,
						uniforms : shader.uniforms,
						depthWrite : false,
						side : THREE.BackSide
					} ),
			
				skybox = new THREE.Mesh( new THREE.CubeGeometry( e.size.x, e.size.y, e.size.z ), material );
				skybox.position.set( e.pos.x, e.pos.y, e.pos.z );
				ion.scene.add( skybox );
				console.log('cube environment');
				
			} else {
				this.scene.background = this.sc.textures[ this.options.skybox_tx ];
				console.log('background environment');
			}
        }
		
		if ( this.options.lightprobe ) {
			
			var lightProbe = new THREE.LightProbe();
			this.scene.add( lightProbe );
			if (this.options.lightprobe_comp == true ) {
				lightProbe.copy( THREE.LightProbeGenerator.fromCubeTexture( this.sc.textures[ this.options.lightprobe_tx ] ) );
			} else {};
			lightProbe.intensity =  this.options.lightprobeInt;
			
			if (this.options.lightprobe_set == "city1") {
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
			} else if (this.options.lightprobe_set == "studio1") {
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
			} else if (this.options.lightprobe_set == "ext1") {
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
			} else if (this.options.lightprobe_set == "ext4") {
			//ext4
			lightProbe.sh.fromArray([1.0335555583781069, 1.1544615619613825, 1.2987953598610686, -0.6440322433734142, -0.49079454286590146, -0.3087556816171081, 0.06322779978799141, 0.06275788284931995, 0.054920415665538264, 0.041006130225462886, 0.06030496425389727, 0.07136631974076928, 0.01614984203131207, 0.02047418782226759, 0.019033758348686335, 0.18457574831705587, 0.18038115144731423, 0.15752653834445332, 0.16996850910564407, 0.187038848628613, 0.16688331164815956, 0.04036423124878413, 0.0444329255267229, 0.0433949696029251, -0.010985208680502243, -0.008034265174983218, -0.03336552258894019]);
			} else if (this.options.lightprobe_set == "ext4bw") {
			//ext4_bw
			lightProbe.sh.fromArray([1.1121330205688262, 1.1121330205688262, 1.1121330205688262, -0.5297770294179279, -0.5297770294179279, -0.5297770294179279, 0.0668121151427409, 0.0668121151427409, 0.0668121151427409, 0.05528421405294348, 0.05528421405294348, 0.05528421405294348, 0.019415474712590593, 0.019415474712590593, 0.019415474712590593, 0.18185262471797925, 0.18185262471797925, 0.18185262471797925, 0.17865893071420727, 0.17865893071420727, 0.17865893071420727, 0.0432202188682589, 0.0432202188682589, 0.0432202188682589, -0.014705680614586821, -0.014705680614586821, -0.014705680614586821]);
			} else {}
		}
		
		this.o = this.sc.objects;
		this.m = this.sc.materials;
		this.t = this.sc.textures;
		this.c = this.sc.cameras;
		this.pc = this.data.param;
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

    initVideo2 : function ( sc ) {

		document.getElementById( 'video2' ).play();
		this.sc.objects.o_canvas02.material.map = new THREE.VideoTexture(document.getElementById('video2'));
    },

    initVideo3 : function ( sc ) {

		document.getElementById( 'video3' ).play();
		this.sc.objects.o_canvas03.material.map = new THREE.VideoTexture(document.getElementById('video3'));
    },

    initVideo4 : function ( sc ) {

		document.getElementById( 'video4' ).play();
		this.sc.objects.o_canvas04.material.map = new THREE.VideoTexture(document.getElementById('video4'));
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
        this.requestRender()
    },

    initRenderer : function () {
        var _this = this;

        // renderer
        this.renderer = new THREE.WebGLRenderer( { antialias : true, alpha : true, powerPreference: "high-performance", precision: "highp" } );
        this.renderer.gammaFactor = this.options.g_f;
        this.renderer.gammaInput = this.options.g_in;
        this.renderer.gammaOutput = this.options.g_out;
        this.renderer.physicallyBasedShading = this.options.phys_shading;
        this.renderer.toneMappingExposure = this.options.exposure;
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
	
    animate: function (t) {

        if (this.renderer == null) {
            cancelAnimationFrame(this.requestAnimate);
            return;
        }

        var _this = this;
        this.requestAnimate = requestAnimationFrame(function (t) {
            _this.animate(t)
        }, this.renderer.domElement);

        this.processAnimations2();

        if (this.orbit_controls) {
            this.orbit_controls.update();
        }

        if (this.needRender || this.options.always_render) {
            this.render(t);
            this.needRender = false;
        }

        if (this.options.stats)
            this.stats.update();

    },


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
		
		if (this.scene.getObjectByName('cubeCamera1') != undefined) {
			ion.scene.getObjectByName('cubeCamera1').position.set(ion.camera.position.x, -ion.camera.position.y, ion.camera.position.z);
			//ion.sc.objects.o_floor.visible=false;
			ion.scene.getObjectByName('cubeCamera1').update(this.renderer, this.scene);
			//ion.sc.objects.o_floor.visible=true;
		} else {};
		
		if (this.scene.getObjectByName('cubeCamera2') != undefined) {
			ion.scene.getObjectByName('cubeCamera2').position.set(ion.camera.position.x, -ion.camera.position.y+90, ion.camera.position.z);
			// ion.sc.objects.o_frame01.visible = false;
			// ion.sc.objects.o_frame02.visible = false;
			// ion.sc.objects.o_frame03.visible = false;
			// ion.sc.objects.o_frame04.visible = false;
			// ion.sc.objects.o_frame05.visible = false;
			// ion.sc.objects.o_frame06.visible = false;
			// ion.sc.objects.o_frame07.visible = false;
			// ion.sc.objects.o_frame08.visible = false;
			// ion.sc.objects.o_frame09.visible = false;
			// ion.sc.objects.o_frame08.visible = false;
			// ion.sc.objects.o_frame09.visible = false;
			// ion.sc.objects.o_frame10.visible = false;
			// ion.sc.objects.o_frame11.visible = false;
			// ion.sc.objects.o_frame12.visible = false;
			// ion.sc.objects.o_frame13.visible = false;
			// ion.sc.objects.o_frame14.visible = false;
			// ion.sc.objects.o_frame15.visible = false;
			// ion.sc.objects.o_frame16.visible = false;
			ion.sc.materials.mm_frame[0] = ion.sc.materials.mat_none;
			// ion.sc.materials.mm_frame[1] = ion.sc.materials.mat_none;
			ion.sc.materials.mm_frame[2] = ion.sc.materials.mat_none;
			// ion.sc.materials.mm_frame[3] = ion.sc.materials.mat_none;
			// ion.sc.materials.mm_frame[4] = ion.sc.materials.mat_none;
			ion.sc.objects.stage_group.visible=false;
			ion.scene.getObjectByName('cubeCamera2').update(this.renderer, this.scene);
			// ion.sc.objects.o_frame01.visible = true;
			// ion.sc.objects.o_frame02.visible = true;
			// ion.sc.objects.o_frame03.visible = true;
			// ion.sc.objects.o_frame04.visible = true;
			// ion.sc.objects.o_frame05.visible = true;
			// ion.sc.objects.o_frame06.visible = true;
			// ion.sc.objects.o_frame07.visible = true;
			// ion.sc.objects.o_frame08.visible = true;
			// ion.sc.objects.o_frame09.visible = true;
			// ion.sc.objects.o_frame08.visible = true;
			// ion.sc.objects.o_frame09.visible = true;
			// ion.sc.objects.o_frame10.visible = true;
			// ion.sc.objects.o_frame11.visible = true;
			// ion.sc.objects.o_frame12.visible = true;
			// ion.sc.objects.o_frame13.visible = true;
			// ion.sc.objects.o_frame14.visible = true;
			// ion.sc.objects.o_frame15.visible = true;
			// ion.sc.objects.o_frame16.visible = true;
			ion.sc.materials.mm_frame[0] = ion.sc.materials.m_frame_basic1;
			// ion.sc.materials.mm_frame[1] = ion.sc.materials.m_c_gray;
			ion.sc.materials.mm_frame[2] = ion.sc.materials.m_logo;
			// ion.sc.materials.mm_frame[3] = ion.sc.materials.m_artist01;
			// ion.sc.materials.mm_frame[4] = ion.sc.materials.m_art01;
			ion.sc.objects.stage_group.visible=true;
		} else {};
		
        this.renderer.clear();
        this.renderer.render( this.scene, this.camera );
		
		if (this.sc.objects.main_group.getObjectByName('water') != undefined) {
			var time = performance.now() * 0.001;
			this.sc.objects.main_group.getObjectByName('water').material.uniforms[ 'time' ].value += 1.0 / 60.0;
		} else {}

        for ( var i = 0, j = this.interfaces.length; i < j; i++ ) {
            this.interfaces[ i ].renderer.clear();
            this.interfaces[ i ].renderer.render( this.interfaces[ i ].scene, this.interfaces[ i ].camera );
        }


        if ( this.options.camera_info ) this.showCamInfo();
    },
	
	updateWeather : function() {
		var wind = ( ion.data.param.wind.direction / 57.325 );
		//ion.sc.objects.house.rotation.z = wind;
		ion.animateParamToSMP('rotate', ion.sc.objects.house.rotation, { x: 0, y: 0, z: wind }, 2400, easeInOutSine);
	},
	
	updateMaterial : function() {
		var opt = this.options;
		var url = "";
		// var url = opt.scene_assets_url + opt.woo_tex_url;
        var o = this.sc.objects;
		var mMat = this.data.param.mMat;
		var tex_loader = new THREE.TextureLoader();
		var pc = ion.data.param;
		var pcm = ion.data.param.materials;
		var st = ion.data_stored.param;
		var stm = ion.data_stored.param.materials;

		
		if (matNoo = 'mat_01', pcm[matNoo] != undefined || null)   {
			
			let matNo = matNoo;
			let matAr = matNo.substring(4,6);
			let pcMat = pcm[matNo];
			let stMat = stm[matNo];
			let arMat = ion.sc.materials.mm_procedural[matAr-1];
			let albedoTex = pcMat.map;
			let roughnessTex = pcMat.roughnessMap;
			let bumpTex = pcMat.bumpMap;
			
			if (albedoTex != undefined || null) {
				if (pcm[matNo].map != stm[matNo].map) {
					tex_loader.load(albedoTex,
						function (texture) {
						if (bumpTex == 'albedo' && roughnessTex == 'albedo') {
							arMat.map = arMat.bumpMap = arMat.roughnessMap = (texture);
							console.log('albedo' + matNo + 'for all');
						} else if (bumpTex == 'albedo' && roughnessTex !== 'albedo') {
							arMat.map = arMat.bumpMap = (texture);
							console.log('albedo' + matNo + '+ bump');
						} else if (bumpTex !== 'albedo' && roughnessTex == 'albedo') {
							arMat.map = arMat.roughnessMap = (texture);
							console.log('albedo' + matNo + '+ roughnessMap');
						} else {
							arMat.map = (texture);
							console.log('albedo' + matNo + 'just map');
						}
						texture.flipY = true;
						texture.anisotropy = 4;
						texture.repeat.set(pcMat.map_repeat, pcMat.map_repeat);
						texture.wrapS = texture.wrapT = 1000;
						stm[matNo].map = pcm[matNo].map;
						ion.requestRender();
					},
						function (xhr) {
						console.log((xhr.loaded / xhr.total * 100) + '% loaded');
					});
				} else {
					console.log('albedo_' + matNo + ' no change');
				}
			} else {
				console.log('albedo ' + matNo + ' null');
			}

			if (bumpTex != undefined || null) {
				if (pcm[matNo].bumpMap != stm[matNo].bumpMap) {
					if (bumpTex == 'albedo') {
						stm[matNo].bumpMap = pcm[matNo].bumpMap;
						console.log('bumpMap_' + matNo + ' //skipped');
					} else if (bumpTex.indexOf("jpg") !== -1 || bumpTex.indexOf("png") !== -1) {
						tex_loader.load(bumpTex,
							function (texture) {
							if (roughnessTex == 'bumpMap') {
								arMat.bumpMap = arMat.roughnessMap = (texture);
								console.log('bumpMap' + matNo + '+ roughnessMap');
							} else {
								arMat.bumpMap = (texture);
								console.log('bumpMap' + matNo + 'just bumpMap');
							}
							texture.flipY = true;
							texture.anisotropy = 4;
							texture.repeat.set(pcMat.bumpMap_repeat, pcMat.bumpMap_repeat);
							texture.wrapS = texture.wrapT = 1000;
							stm[matNo].bumpMap = pcm[matNo].bumpMap;
							ion.requestRender();
						},
							function (xhr) {
							console.log((xhr.loaded / xhr.total * 100) + '% loaded');
						})
					} else {
						console.log('bumpMap_' + matNo + '//strange case');
					}
				} else {
					stm[matNo].bumpMap = pcm[matNo].bumpMap;
					console.log('bumpMap_' + matNo + ' no change');
				}
			} else {
				console.log('bumpMap_' + matNo + '//null');
			}

			if (roughnessTex != undefined || null) {
				if (pcm[matNo].roughnessMap != stm[matNo].roughnessMap) {
					if (roughnessTex == 'albedo' || roughnessTex == 'bumpMap') {
						stm[matNo].roughnessMap = pcm[matNo].roughnessMap;
						console.log('roughnessMap_' + matNo + ' //skipped');
					} else if (roughnessTex.indexOf("jpg") !== -1 || roughnessTex.indexOf("png") !== -1) {
						tex_loader.load(roughnessTex,
							function (texture) {
							if (bumpTex == 'bumpMap') {
								arMat.bumpMap = arMat.roughnessMap = (texture);
								console.log('roughnessMap' + matNo + '+ bumpMap');
							} else {
								arMat.roughnessMap = (texture);
								console.log('roughnessMap' + matNo + 'just roughnessMap');
							}
							texture.flipY = true;
							texture.anisotropy = 4;
							texture.repeat.set(pcMat.bumpMap_repeat, pcMat.bumpMap_repeat);
							texture.wrapS = texture.wrapT = 1000;
							stm[matNo].roughnessMap = pcm[matNo].roughnessMap;
							ion.requestRender();
						},
							function (xhr) {
							console.log((xhr.loaded / xhr.total * 100) + '% loaded');
						})
					} else {
						console.log('roughnessMap_' + matNo + '//strange case');
					}
				} else {
					stm[matNo].roughnessMap = pcm[matNo].roughnessMap;
					console.log('roughnessMap_' + matNo + ' no change');
				}
			} else {
				console.log('roughnessMap_' + matNo + '//null');
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
			
		} else {
		}	

		
		if (matNoo = 'mat_02', pcm[matNoo] != undefined || null)   {
			
			let matNo = matNoo;
			let matAr = matNo.substring(4,6);
			let pcMat = pcm[matNo];
			let stMat = stm[matNo];
			let arMat = ion.sc.materials.mm_procedural[matAr-1];
			let albedoTex = pcMat.map;
			let roughnessTex = pcMat.roughnessMap;
			let bumpTex = pcMat.bumpMap;
			
			if (albedoTex != undefined || null) {
				if (pcm[matNo].map != stm[matNo].map) {
					tex_loader.load(albedoTex,
						function (texture) {
						if (bumpTex == 'albedo' && roughnessTex == 'albedo') {
							arMat.map = arMat.bumpMap = arMat.roughnessMap = (texture);
							console.log('albedo' + matNo + 'for all');
						} else if (bumpTex == 'albedo' && roughnessTex !== 'albedo') {
							arMat.map = arMat.bumpMap = (texture);
							console.log('albedo' + matNo + '+ bump');
						} else if (bumpTex !== 'albedo' && roughnessTex == 'albedo') {
							arMat.map = arMat.roughnessMap = (texture);
							console.log('albedo' + matNo + '+ roughnessMap');
						} else {
							arMat.map = (texture);
							console.log('albedo' + matNo + 'just map');
						}
						texture.flipY = true;
						texture.anisotropy = 4;
						texture.repeat.set(pcMat.map_repeat, pcMat.map_repeat);
						texture.wrapS = texture.wrapT = 1000;
						stm[matNo].map = pcm[matNo].map;
						ion.requestRender();
					},
						function (xhr) {
						console.log((xhr.loaded / xhr.total * 100) + '% loaded');
					});
				} else {
					console.log('albedo_' + matNo + ' no change');
				}
			} else {
				console.log('albedo ' + matNo + ' null');
			}

			if (bumpTex != undefined || null) {
				if (pcm[matNo].bumpMap != stm[matNo].bumpMap) {
					if (bumpTex == 'albedo') {
						stm[matNo].bumpMap = pcm[matNo].bumpMap;
						console.log('bumpMap_' + matNo + ' //skipped');
					} else if (bumpTex.indexOf("jpg") !== -1 || bumpTex.indexOf("png") !== -1) {
						tex_loader.load(bumpTex,
							function (texture) {
							if (roughnessTex == 'bumpMap') {
								arMat.bumpMap = arMat.roughnessMap = (texture);
								console.log('bumpMap' + matNo + '+ roughnessMap');
							} else {
								arMat.bumpMap = (texture);
								console.log('bumpMap' + matNo + 'just bumpMap');
							}
							texture.flipY = true;
							texture.anisotropy = 4;
							texture.repeat.set(pcMat.bumpMap_repeat, pcMat.bumpMap_repeat);
							texture.wrapS = texture.wrapT = 1000;
							stm[matNo].bumpMap = pcm[matNo].bumpMap;
							ion.requestRender();
						},
							function (xhr) {
							console.log((xhr.loaded / xhr.total * 100) + '% loaded');
						})
					} else {
						console.log('bumpMap_' + matNo + '//strange case');
					}
				} else {
					stm[matNo].bumpMap = pcm[matNo].bumpMap;
					console.log('bumpMap_' + matNo + ' no change');
				}
			} else {
				console.log('bumpMap_' + matNo + '//null');
			}

			if (roughnessTex != undefined || null) {
				if (pcm[matNo].roughnessMap != stm[matNo].roughnessMap) {
					if (roughnessTex == 'albedo' || roughnessTex == 'bumpMap') {
						stm[matNo].roughnessMap = pcm[matNo].roughnessMap;
						console.log('roughnessMap_' + matNo + ' //skipped');
					} else if (roughnessTex.indexOf("jpg") !== -1 || roughnessTex.indexOf("png") !== -1) {
						tex_loader.load(roughnessTex,
							function (texture) {
							if (bumpTex == 'bumpMap') {
								arMat.bumpMap = arMat.roughnessMap = (texture);
								console.log('roughnessMap' + matNo + '+ bumpMap');
							} else {
								arMat.roughnessMap = (texture);
								console.log('roughnessMap' + matNo + 'just roughnessMap');
							}
							texture.flipY = true;
							texture.anisotropy = 4;
							texture.repeat.set(pcMat.bumpMap_repeat, pcMat.bumpMap_repeat);
							texture.wrapS = texture.wrapT = 1000;
							stm[matNo].roughnessMap = pcm[matNo].roughnessMap;
							ion.requestRender();
						},
							function (xhr) {
							console.log((xhr.loaded / xhr.total * 100) + '% loaded');
						})
					} else {
						console.log('roughnessMap_' + matNo + '//strange case');
					}
				} else {
					stm[matNo].roughnessMap = pcm[matNo].roughnessMap;
					console.log('roughnessMap_' + matNo + ' no change');
				}
			} else {
				console.log('roughnessMap_' + matNo + '//null');
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
			
		} else {
		}	

		
		if (matNoo = 'mat_03', pcm[matNoo] != undefined || null)   {
			
			let matNo = matNoo;
			let matAr = matNo.substring(4,6);
			let pcMat = pcm[matNo];
			let stMat = stm[matNo];
			let arMat = ion.sc.materials.mm_procedural[matAr-1];
			let albedoTex = pcMat.map;
			let roughnessTex = pcMat.roughnessMap;
			let bumpTex = pcMat.bumpMap;
			
			if (albedoTex != undefined || null) {
				if (pcm[matNo].map != stm[matNo].map) {
					tex_loader.load(albedoTex,
						function (texture) {
						if (bumpTex == 'albedo' && roughnessTex == 'albedo') {
							arMat.map = arMat.bumpMap = arMat.roughnessMap = (texture);
							console.log('albedo' + matNo + 'for all');
						} else if (bumpTex == 'albedo' && roughnessTex !== 'albedo') {
							arMat.map = arMat.bumpMap = (texture);
							console.log('albedo' + matNo + '+ bump');
						} else if (bumpTex !== 'albedo' && roughnessTex == 'albedo') {
							arMat.map = arMat.roughnessMap = (texture);
							console.log('albedo' + matNo + '+ roughnessMap');
						} else {
							arMat.map = (texture);
							console.log('albedo' + matNo + 'just map');
						}
						texture.flipY = true;
						texture.anisotropy = 4;
						texture.repeat.set(pcMat.map_repeat, pcMat.map_repeat);
						texture.wrapS = texture.wrapT = 1000;
						stm[matNo].map = pcm[matNo].map;
						ion.requestRender();
					},
						function (xhr) {
						console.log((xhr.loaded / xhr.total * 100) + '% loaded');
					});
				} else {
					console.log('albedo_' + matNo + ' no change');
				}
			} else {
				console.log('albedo ' + matNo + ' null');
			}

			if (bumpTex != undefined || null) {
				if (pcm[matNo].bumpMap != stm[matNo].bumpMap) {
					if (bumpTex == 'albedo') {
						stm[matNo].bumpMap = pcm[matNo].bumpMap;
						console.log('bumpMap_' + matNo + ' //skipped');
					} else if (bumpTex.indexOf("jpg") !== -1 || bumpTex.indexOf("png") !== -1) {
						tex_loader.load(bumpTex,
							function (texture) {
							if (roughnessTex == 'bumpMap') {
								arMat.bumpMap = arMat.roughnessMap = (texture);
								console.log('bumpMap' + matNo + '+ roughnessMap');
							} else {
								arMat.bumpMap = (texture);
								console.log('bumpMap' + matNo + 'just bumpMap');
							}
							texture.flipY = true;
							texture.anisotropy = 4;
							texture.repeat.set(pcMat.bumpMap_repeat, pcMat.bumpMap_repeat);
							texture.wrapS = texture.wrapT = 1000;
							stm[matNo].bumpMap = pcm[matNo].bumpMap;
							ion.requestRender();
						},
							function (xhr) {
							console.log((xhr.loaded / xhr.total * 100) + '% loaded');
						})
					} else {
						console.log('bumpMap_' + matNo + '//strange case');
					}
				} else {
					stm[matNo].bumpMap = pcm[matNo].bumpMap;
					console.log('bumpMap_' + matNo + ' no change');
				}
			} else {
				console.log('bumpMap_' + matNo + '//null');
			}

			if (roughnessTex != undefined || null) {
				if (pcm[matNo].roughnessMap != stm[matNo].roughnessMap) {
					if (roughnessTex == 'albedo' || roughnessTex == 'bumpMap') {
						stm[matNo].roughnessMap = pcm[matNo].roughnessMap;
						console.log('roughnessMap_' + matNo + ' //skipped');
					} else if (roughnessTex.indexOf("jpg") !== -1 || roughnessTex.indexOf("png") !== -1) {
						tex_loader.load(roughnessTex,
							function (texture) {
							if (bumpTex == 'bumpMap') {
								arMat.bumpMap = arMat.roughnessMap = (texture);
								console.log('roughnessMap' + matNo + '+ bumpMap');
							} else {
								arMat.roughnessMap = (texture);
								console.log('roughnessMap' + matNo + 'just roughnessMap');
							}
							texture.flipY = true;
							texture.anisotropy = 4;
							texture.repeat.set(pcMat.bumpMap_repeat, pcMat.bumpMap_repeat);
							texture.wrapS = texture.wrapT = 1000;
							stm[matNo].roughnessMap = pcm[matNo].roughnessMap;
							ion.requestRender();
						},
							function (xhr) {
							console.log((xhr.loaded / xhr.total * 100) + '% loaded');
						})
					} else {
						console.log('roughnessMap_' + matNo + '//strange case');
					}
				} else {
					stm[matNo].roughnessMap = pcm[matNo].roughnessMap;
					console.log('roughnessMap_' + matNo + ' no change');
				}
			} else {
				console.log('roughnessMap_' + matNo + '//null');
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
			
		} else {
		}	
		
	},
	
	applyMaterials : function() {
	
        var o = this.sc.objects;
		// applies materials if replacement is needed

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
