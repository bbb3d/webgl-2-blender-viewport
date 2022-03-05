 WebVRConfig = {
  
    //webvr-polyfill configuration
   

  // Forces availability of VR mode.
  //FORCE_ENABLE_VR: true, // Default: false.
  // Complementary filter coefficient. 0 for accelerometer, 1 for gyro.
  //K_FILTER: 0.98, // Default: 0.98.
  // How far into the future to predict during fast motion.
  //PREDICTION_TIME_S: 0.040, // Default: 0.040 (in seconds).
  // Flag to disable touch panner. In case you have your own touch controls
  //TOUCH_PANNER_DISABLED: true, // Default: false.
  // Enable yaw panning only, disabling roll and pitch. This can be useful for
  // panoramas with nothing interesting above or below.
  //YAW_ONLY: true, // Default: false.
  // Enable the deprecated version of the API (navigator.getVRDevices).
  //ENABLE_DEPRECATED_API: true, // Default: false.
  // Scales the recommended buffer size reported by WebVR, which can improve
  // performance. Making this very small can lower the effective resolution of
  // your scene.
  BUFFER_SCALE: 0.5, // default: 1.0
  // Allow VRDisplay.submitFrame to change gl bindings, which is more
  // efficient if the application code will re-bind it's resources on the
  // next frame anyway.
  // Dirty bindings include: gl.FRAMEBUFFER_BINDING, gl.CURRENT_PROGRAM,
  // gl.ARRAY_BUFFER_BINDING, gl.ELEMENT_ARRAY_BUFFER_BINDING,
  // and gl.TEXTURE_BINDING_2D for texture unit 0
  // Warning: enabling this might lead to rendering issues.
  //DIRTY_SUBMIT_FRAME_BINDINGS: true // default: false
};


controllers = {
			ORBIT : 1,
			VR : 2,
			FPS : 3,
			TILT : 4
		};
		

function MultiController(renderer, scene, camera, container, options, objectgroup) {
    var options = options || {};

    this.renderer = renderer;
	this.scene = scene;
	this.camera = camera;
	this.container = container;
	this.objectgroup = objectgroup;
    this.options = extend({}, this.defaults, options);
	
	this.ready = false;
	this.requestR = false;
	
	// Currently active VRDisplay.
	this.vrDisplay;
	// Various global THREE.Objects.
	//var controls;
	this.effect;
	// EnterVRButton for rendering enter/exit UI.
	this.vrButton;

	this.fcontrols;
	this.raycaster;
	this.fcam;
	
	this.tiltController;

	this.controlsEnabled = false;
	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.canJump = false;

	this.prevTime;
	this.velocity = new THREE.Vector3();
	
	this.lastwidth = this.options.width;
	this.lastheight = this.options.height;
	
    this.init();
}

MultiController.prototype = {
    constructor: MultiController,

    // options
    defaults: {
        debug: false,
        controller : controllers.ORBIT,
		orbit : true,
		vr : true,
		fps : true,
		fov : 55,
		far : 8000,
		near : 1,
		width : 1920,
		height : 1080,
		always_render : false
    },

    init: function() {
        if(!this.options.vr){
			$("#vr-button").css("display","none");
			$("#magic-window").css("display","none");
		}
		
		this.fcam = new THREE.PerspectiveCamera( this.options.fov,  this.options.width /  this.options.height,  this.options.near,  this.options.far );
		
		//$('#multicontrolbuttons').load('multicontrol/buttons.html');
		
		this.lastwidth = this.options.width;
		this.lastheight = this.options.height;
		
		this.initORBIT();
		this.initVR();
		this.initFPS();
		this.initTILT();
		
		this.updateAspect(this.lastwidth, this.lastheight);
		
		this.ready = true;
    },
	
	setupStage: function() {
		var _this = this;
		navigator.getVRDisplays().then(function(displays) {
				if (displays.length > 0) {
				_this.vrDisplay = displays[0];
				if (_this.vrDisplay.stageParameters) {
					setStageDimensions(_this.vrDisplay.stageParameters);
				}
				}
			});
		},
	
	initORBIT: function() {
        var _this = this;

        this.controls = new THREE.OrbitControls( this.camera, this.container );

        //controls settings
        // How far you can dolly in and out ( PerspectiveCamera only )
        this.controls.minDistance = 50;
		this.controls.maxDistance = 800;
		/*
		this.controls.minDistance = 10;
        this.controls.maxDistance = 50;
*/
        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        this.controls.minPolarAngle = 0; // radians
        this.controls.maxPolarAngle = 1.67; // radians

        // How far you can orbit horizontally, upper and lower limits.
        // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
        this.controls.minAzimuthAngle = -Infinity; // radians
        this.controls.maxAzimuthAngle = Infinity; // radians

        // Set to true to enable damping (inertia)
        // If damping is enabled, you must call controls.update() in your animation loop
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;

        //this.controls.rotateSpeed = 0.025;
		this.controls.rotateSpeed = 0.125;
        this.controls.keyPanSpeed = 0.0;	// pixels moved per arrow key push


        this.controls.addEventListener( 'change', function () {
			if(_this.options.controller == controllers.ORBIT){
				//_this.render();		
				_this.requestRender();
			}
        } );
    },
	
	initVR: function() {
		var _this = this;
		
		this.setupStage();
		
		this.vrcontrols = new THREE.VRControls(this.camera);
        //controls = new THREE.VRControls(this.vrcamera);
        this.vrcontrols.standing = true;
		
		this.effect = new THREE.VREffect(this.renderer);
        this.effect.setSize(this.options.width, this.options.height);
		
		this.vrcamera = (new THREE.PerspectiveCamera()).copy(this.camera);
        //console.log("init effect VR renderer");
        
         // Initialize the WebVR UI.
        var uiOptions = {
            color: 'black',
            background: 'white',
            corners: 'square'
        };
        this.vrButton = new webvrui.EnterVRButton(this.renderer.domElement, uiOptions);
        this.vrButton.on('exit', function() {
            //this.camera.quaternion.set(0, 0, 0, 1);
            //this.camera.position.set(0, controls.userHeight, 0);
            _this.vrcontrols = new THREE.VRControls(_this.camera);
            _this.vrcontrols.standing = true;
            //_this.vrcam = false;
			_this.changecontroller(controllers.ORBIT);
			
            document.getElementById("exitvr").style.display = "none";
            console.log("exitVR");
        });
        this.vrButton.on('hide', function() {
            document.getElementById('vrbox').style.display = 'none';
        });
        this.vrButton.on('show', function() {
            document.getElementById('vrbox').style.display = 'none';
        });
        document.getElementById('vr-button').appendChild(this.vrButton.domElement);
        document.getElementById('magic-window').addEventListener('click', function() {
            _this.changecontroller(controllers.VR);
            //_this.vrcamera = (new THREE.PerspectiveCamera()).copy(_this.camera);
            
            _this.vrcontrols = new THREE.VRControls(_this.vrcamera);
            _this.vrcontrols.standing = true;
            
            //_this.vrcam = true;
			
            _this.vrButton.requestEnterFullscreen();
            document.getElementById("exitvr").style.display = "none";
			_this.updateAspect(_this.lastwidth, _this.lastheight);
        });
        
        document.getElementById('magic-window-exit').addEventListener('click', function() {
            //this.vrButton.exitFullscreen();
            _this.vrButton.requestExit();
            //this.vrButton.exitVR();
            document.getElementById("exitvr").style.display = "none";
        });
    },
	
	initFPS: function() {
		var _this = this;
		
		this.prevTime = performance.now();
        var blocker = document.getElementById( 'blocker' );
		var instructions = document.getElementById( 'instructions' );
		
		var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
		
		if ( havePointerLock ) {
			
			var element = document.body;
			
			var pointerlockchange = function ( event ) {
				
				if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
					
					_this.controlsEnabled = true;
					_this.fcontrols.enabled = true;					
					blocker.style.display = 'none';
					_this.changecontroller(controllers.FPS);
					
				} else {
					
					_this.fcontrols.enabled = false;
					
					blocker.style.display = '-webkit-box';
					blocker.style.display = '-moz-box';
					blocker.style.display = 'box';
					
					instructions.style.display = '';
					
					_this.controlsEnabled = false;
					_this.changecontroller(controllers.ORBIT);
					
				}
				_this.updateAspect(_this.lastwidth, _this.lastheight);
			};
			
			var pointerlockerror = function ( event ) {
				
				instructions.style.display = '';
				
			};
			
			// Hook pointer lock state change events
			document.addEventListener( 'pointerlockchange', pointerlockchange, false );
			document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
			document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
			
			document.addEventListener( 'pointerlockerror', pointerlockerror, false );
			document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
			document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
			
			instructions.addEventListener( 'click', function ( event ) {
				
				instructions.style.display = 'none';
				
				// Ask the browser to lock the pointer
				element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
				element.requestPointerLock();
				
			}, false );
			
		} else {			
			instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';			
		}
		
		this.fcontrols = new THREE.PointerLockControls( this.fcam ,this);
		this.scene.add( this.fcontrols.getObject() );

		var onKeyDown = function ( event ) {

			switch ( event.keyCode ) {

				case 38: // up
				case 87: // w
					_this.moveForward = true;
					//console.log("up");
					break;

				case 37: // left
				case 65: // a
					_this.moveLeft = true; break;

				case 40: // down
				case 83: // s
					_this.moveBackward = true;
					break;

				case 39: // right
				case 68: // d
					_this.moveRight = true;
					break;

				case 32: // space
					if ( _this.canJump === true ) _this.velocity.y += 350;
					_this.canJump = false;
					break;

			}
			_this.options.always_render = true;

		};

		var onKeyUp = function ( event ) {

			switch( event.keyCode ) {

				case 38: // up
				case 87: // w
					_this.moveForward = false;
					break;

				case 37: // left
				case 65: // a
					_this.moveLeft = false;
					break;

				case 40: // down
				case 83: // s
					_this.moveBackward = false;
					break;

				case 39: // right
				case 68: // d
					_this.moveRight = false;
					break;

			}
			
		_this.options.always_render = false;

		};

		document.addEventListener( 'keydown', onKeyDown, false );
		document.addEventListener( 'keyup', onKeyUp, false );

		this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
		
    },
	
	initTILT: function() {
        var _this = this;
		
		var tiltControllerCallback = function(quaternion)
			{
				_this.requestRender();
			}
		
		this.tiltController = new TiltOrbitControls(this.objectgroup, tiltControllerCallback);
		$("#settilt").click(function() {
			_this.changecontroller(controllers.TILT);
			$("#settilt").css("display", "none");
			$("#exittilt").css("display", "block");
		});
		
		$("#exittilt").click(function() {
			$("#settilt").css("display", "block");
			$("#exittilt").css("display", "none");
			_this.changecontroller(controllers.ORBIT);
		});
    },

	disableControlsLess: function(idc) {
        var _this = this;
		
		if(idc != controllers.VR){
			$("#vrbox").css("display", "none");
		}
		
		if(idc != controllers.FPS){
			$("#blocker").css("display", "none");
		}
		
		if(idc != controllers.TILT){
			$("#tiltbox").css("display", "none");
		}
    },
	
    changecontroller : function (idc) {
		
		switch (idc){
			case controllers.ORBIT :
				this.tiltController.disconnect();
				$("#blocker").css("display", "block");
				$("#vrbox").css("display", "none");
				$("#tiltbox").css("display", "none");
				break;
				
			case controllers.VR :
				this.disableControlsLess(idc);
				break;
				
			case controllers.FPS :
				this.disableControlsLess(idc);
				break;
			
			case controllers.TILT :
				this.tiltController.connect();
				this.disableControlsLess(idc);
				break;
		}
		
        this.options.controller = idc;
		this.updateAspect(this.lastwidth, this.lastheight);
		this.requestRender();
		console.log("Controller: " + this.options.controller);
    },
	
	updateAspect: function(width, height) {
		switch(this.options.controller){
			case controllers.ORBIT :
				this.camera.aspect = width / height;
				this.camera.updateProjectionMatrix();					
				this.renderer.setSize( width, height );
				//console.log("Orbit " + width + " " + height);
				break;
				
			case controllers.VR :
				this.vrcamera.aspect = width / height;
				this.vrcamera.updateProjectionMatrix();
				this.effect.setSize(width, height);
				break;
				
			case controllers.FPS :
				this.fcam.aspect = width / height;
				this.fcam.updateProjectionMatrix();
				this.renderer.setSize( width, height );
				break;
		}
		
		this.lastwidth = width;
		this.lastheight = height;
		
        this.requestRender();
    },
	
	animate: function() {
        if(this.options.controller == controllers.ORBIT)
			this.controls.update();
		
		if ( this.controlsEnabled ) {
			/*
			this.raycaster.ray.origin.copy( this.fcontrols.getObject().position );
			this.raycaster.ray.origin.y -= 10;

			var intersections = this.raycaster.intersectObjects( this.main_group );

			var isOnObject = intersections.length > 0;
*/
			var time = performance.now();
			var delta = ( time - this.prevTime ) / 1000;
			var delta2 = ( time - this.prevTime ) / 300;

			this.velocity.x -= this.velocity.x * 10.0 * delta2;
			this.velocity.z -= this.velocity.z * 10.0 * delta2;

			this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

			if ( this.moveForward ) this.velocity.z -= 400.0 * delta2;
			if ( this.moveBackward ) this.velocity.z += 400.0 * delta2;

			if ( this.moveLeft ) this.velocity.x -= 400.0 * delta2;
			if ( this.moveRight ) this.velocity.x += 400.0 * delta2;
/*
			if ( isOnObject === true ) {
				this.velocity.y = Math.max( 0, this.velocity.y );

				this.canJump = true;
			}
*/
			this.fcontrols.getObject().translateX( this.velocity.x * delta2 );
			this.fcontrols.getObject().translateY( this.velocity.y * delta );
			this.fcontrols.getObject().translateZ( this.velocity.z * delta2 );

			if ( this.fcontrols.getObject().position.y < 10 ) {

				this.velocity.y = 0;
				this.fcontrols.getObject().position.y = 10;

				//canJump = true;

			}

			this.prevTime = time;

		}
    },
	
	needRender: function() {
        return (this.requestR || this.options.always_render);
    },
	
	requestRender: function() {
        this.requestR = true;
    },

    render: function() {
        if(this.ready){
			switch (this.options.controller){
				case controllers.ORBIT :				
					this.renderer.render( this.scene, this.camera ); 
					this.requestR = false;
					break;
					
				case controllers.VR :
					if (this.vrButton.isPresenting()) {
							this.vrcontrols.update();
						}
					this.effect.render(this.scene, this.vrcamera);
					this.requestRender();
					break;
					
				case controllers.FPS :
					this.renderer.render( this.scene, this.fcam );
					this.requestR = false;
					break;
					
				case controllers.TILT :
					this.renderer.render( this.scene, this.camera );
					this.requestR = false;
					break;
			}
		
		}
    }
}
