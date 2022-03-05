
 function EffetsManager(renderer, scene, camera, options) {
	var options = options || {};

	this.renderer = renderer;
	this.scene = scene;
	this.camera = camera;
	this.options = extend({}, this.defaults, options);

	var ready = false;
	var enabled;
	this.requestR = false;
	var object, light, nodepass, composer;
	var gui, guiElements = [];
	this.guidisabled = false;

	var clock;
	var param, lensflare2, decalNormal;
	
	this.init();
 }
 
 EffetsManager.prototype = {
	 constructor: EffetsManager,
	 
	 // options
	 defaults: {
		debug: false,
		enabled : true,
		width : 1920,
		height : 1080
	 },
	 
	 init: function() {		
			var _this = this;
			this.clock = new THREE.Clock();
			this.param = { example: 'color-adjustment' };
			
			this.enabled = this.options.enabled;			
			
			var textureLoader = new THREE.TextureLoader();

			this.lensflare2 = textureLoader.load( 'effects/Textures/lensflare2.jpg' );
			this.lensflare2.wrapS = this.lensflare2.wrapT = THREE.RepeatWrapping;

			this.decalNormal = textureLoader.load( 'effects/Textures/decal-normal.jpg' );
			this.decalNormal.wrapS = this.decalNormal.wrapT = THREE.RepeatWrapping;

			this.composer = new THREE.EffectComposer( this.renderer );
			this.composer.addPass( new THREE.RenderPass( this.scene, this.camera ) );

			this.nodepass = new THREE.NodePass();
			this.nodepass.renderToScreen = true;

			this.composer.addPass( this.nodepass );

			this.updateMaterial();
			this.resize(this.options.width, this.options.height);
			this.ready = true;
	 },
	 
	 checkenabled: function() {		
		 if(!this.enabled && !this.guidisabled){
			$(".dg").hide();
			this.guidisabled = true;
		 }
	 },
	 
	 clearGui: function() {
		 var _this = this;
		 if ( this.gui ) this.gui.destroy();

			this.gui = new dat.GUI();

			var example = this.gui.add( this.param, 'example', {
				'basic / color-adjustment': 'color-adjustment',
				'basic / blends': 'blends',
				'basic / fade': 'fade',
				'basic / invert': 'invert',
				'basic / blur': 'blur',
				'adv / saturation': 'saturation',
				'adv / refraction': 'refraction',
				'adv / mosaic': 'mosaic'
			} ).onFinishChange( function() {

				_this.updateMaterial();
				_this.requestRender();

			} );
			
			this.gui.open();
	 },
	 
	 addGui: function( name, value, callback, isColor, min, max ) {
		 var _this = this;
		 var node;

			this.param[ name ] = value;

			if ( isColor ) {

				node = this.gui.addColor( this.param, name ).onChange( function() {

					callback( _this.param[ name ] );

				} );

			} else if ( typeof value == 'object' ) {

				node = this.gui.add( this.param, name, value ).onChange( function() {

					callback( _this.param[ name ] );

				} );

			} else {

				node = this.gui.add( this.param, name, min, max ).onChange( function() {

					callback( _this.param[ name ] );

				} );

			}

			return node;
	 },
	 
	 updateMaterial: function() {
		 var _this = this;
		 var name = this.param.example;

			this.clearGui();

			switch ( name ) {

				case 'color-adjustment':

					var screen = new THREE.ScreenNode();

					var hue = new THREE.FloatNode();
					var sataturation = new THREE.FloatNode( 1 );
					var vibrance = new THREE.FloatNode();
					var brightness = new THREE.FloatNode( 0 );
					var contrast = new THREE.FloatNode( 1 );

					var hueNode = new THREE.ColorAdjustmentNode( screen, hue, THREE.ColorAdjustmentNode.HUE );
					var satNode = new THREE.ColorAdjustmentNode( hueNode, sataturation, THREE.ColorAdjustmentNode.SATURATION );
					var vibranceNode = new THREE.ColorAdjustmentNode( satNode, vibrance, THREE.ColorAdjustmentNode.VIBRANCE );
					var brightnessNode = new THREE.ColorAdjustmentNode( vibranceNode, brightness, THREE.ColorAdjustmentNode.BRIGHTNESS );
					var contrastNode = new THREE.ColorAdjustmentNode( brightnessNode, contrast, THREE.ColorAdjustmentNode.CONTRAST );

					this.nodepass.value = contrastNode;

					// GUI

					this.addGui( 'hue', hue.number, function( val ) {

						hue.number = val;
						_this.requestRender();

					}, false, 0, Math.PI * 2 );

					this.addGui( 'saturation', sataturation.number, function( val ) {

						sataturation.number = val;
						_this.requestRender();

					}, false, 0, 2 );

					this.addGui( 'vibrance', vibrance.number, function( val ) {

						vibrance.number = val;
						_this.requestRender();

					}, false, - 1, 1 );

					this.addGui( 'brightness', brightness.number, function( val ) {

						brightness.number = val;
						_this.requestRender();

					}, false, 0, .5 );

					this.addGui( 'contrast', contrast.number, function( val ) {

						contrast.number = val;
						_this.requestRender();

					}, false, 0, 2 );

					break;

				case 'fade':

					// PASS

					var color = new THREE.ColorNode( 0xFFFFFF );
					var percent = new THREE.FloatNode( .5 );

					var fade = new THREE.Math3Node(
						new THREE.ScreenNode(),
						color,
						percent,
						THREE.Math3Node.MIX
					);

					this.nodepass.value = fade;

					// GUI

					this.addGui( 'color', color.value.getHex(), function( val ) {

						color.value.setHex( val );
						_this.requestRender();

					}, true );

					this.addGui( 'fade', percent.number, function( val ) {

						percent.number = val;
						_this.requestRender();

					}, false, 0, 1 );

					break;

				case 'invert':

					// PASS

					var alpha = new THREE.FloatNode( 1 );

					var screen = new THREE.ScreenNode();
					var inverted = new THREE.Math1Node( screen, THREE.Math1Node.INVERT );

					var fade = new THREE.Math3Node(
						screen,
						inverted,
						alpha,
						THREE.Math3Node.MIX
					);

					this.nodepass.value = fade;

					// GUI

					this.addGui( 'alpha', alpha.number, function( val ) {

						alpha.number = val;
						_this.requestRender();

					}, false, 0, 1 );

					break;

				case 'blends':

					// PASS

					var multiply = new THREE.OperatorNode(
						new THREE.ScreenNode(),
						new THREE.TextureNode( this.lensflare2 ),
						THREE.OperatorNode.ADD
					);

					this.nodepass.value = multiply;

					// GUI

					this.addGui( 'blend', {
						'addition' : THREE.OperatorNode.ADD,
						'subtract' : THREE.OperatorNode.SUB,
						'multiply' : THREE.OperatorNode.MUL,
						'division' : THREE.OperatorNode.DIV
					}, function( val ) {

						multiply.op = val;

						_this.nodepass.build();
						_this.requestRender();

					} );

					break;

				case 'saturation':

					// PASS

					var screen = new THREE.ScreenNode();
					var sat = new THREE.FloatNode( 0 );

					var satrgb = new THREE.FunctionNode( [
					"vec3 satrgb(vec3 rgb, float adjustment) {",
					//"	const vec3 W = vec3(0.2125, 0.7154, 0.0721);", // LUMA
					"	vec3 intensity = vec3(dot(rgb, LUMA));",
					"	return mix(intensity, rgb, adjustment);",
					"}"
					].join( "\n" ) );

					var saturation = new THREE.FunctionCallNode( satrgb );
					saturation.inputs.rgb = screen;
					saturation.inputs.adjustment = sat;

					this.nodepass.value = saturation;

					// GUI

					this.addGui( 'saturation', sat.number, function( val ) {

						sat.number = val;
						_this.requestRender();

					}, false, 0, 2 );

					break;

				case 'refraction':

					// PASS

					var normal = new THREE.TextureNode( this.decalNormal );
					var normalXY = new THREE.SwitchNode( normal, 'xy' );
					var scale = new THREE.FloatNode( .5 );
					var flip = new THREE.Vector2Node( - 1, 1 );

					var normalXYFlip = new THREE.Math1Node(
						normalXY,
						THREE.Math1Node.INVERT
					);

					var offsetNormal = new THREE.OperatorNode(
						normalXYFlip,
						new THREE.FloatNode( .5 ),
						THREE.OperatorNode.ADD
					);

					var scaleTexture = new THREE.OperatorNode(
						new THREE.SwitchNode( normal, 'z' ),
						offsetNormal,
						THREE.OperatorNode.MUL
					);

					var scaleNormal = new THREE.Math3Node(
						new THREE.FloatNode( 1 ),
						scaleTexture,
						scale,
						THREE.Math3Node.MIX
					);

					var offsetCoord = new THREE.OperatorNode(
						new THREE.UVNode(),
						scaleNormal,
						THREE.OperatorNode.MUL
					);

					var screen = new THREE.ScreenNode( offsetCoord );

					this.nodepass.value = screen;

					// GUI

					this.addGui( 'scale', scale.number, function( val ) {

						scale.number = val;
						_this.requestRender();

					}, false, 0, 1 );

					this.addGui( 'invert', false, function( val ) {

						offsetNormal.a = val ? normalXYFlip : normalXY;

						_this.nodepass.build();
						_this.requestRender();

					} );

					break;

				case 'mosaic':

					// PASS

					var scale = new THREE.FloatNode( 128 );
					var fade = new THREE.FloatNode( 1 );
					var uv = new THREE.UVNode();

					var blocks = new THREE.OperatorNode(
						uv,
						scale,
						THREE.OperatorNode.MUL
					);

					var blocksSize = new THREE.Math1Node(
						blocks,
						THREE.Math1Node.FLOOR
					);

					var coord = new THREE.OperatorNode(
						blocksSize,
						scale,
						THREE.OperatorNode.DIV
					);

					var fadeScreen = new THREE.Math3Node(
						uv,
						coord,
						fade,
						THREE.Math3Node.MIX
					);

					this.nodepass.value = new THREE.ScreenNode( fadeScreen );

					// GUI

					this.addGui( 'scale', scale.number, function( val ) {

						scale.number = val;
						_this.requestRender();

					}, false, 16, 1024 );

					this.addGui( 'fade', fade.number, function( val ) {

						fade.number = val;
						_this.requestRender();

					}, false, 0, 1 );

					this.addGui( 'mask', true, function( val ) {

						fadeCoord.c = val ? maskAlpha : fade;

						_this.nodepass.build();
						_this.requestRender();

					} );

					break;
					
				case 'blur':

					// PASS

					var size = this.renderer.getSize();

					var blurScreen = new THREE.BlurNode( new THREE.ScreenNode() );
					blurScreen.size = new THREE.Vector2( size.width, size.height );

					this.nodepass.value = blurScreen;

					// GUI

					this.addGui( 'blurX', blurScreen.radius.x, function( val ) {

						blurScreen.radius.x = val;
						_this.requestRender();

					}, false, 0, 15 );

					this.addGui( 'blurY', blurScreen.radius.y, function( val ) {

						blurScreen.radius.y = val;
						_this.requestRender();

					}, false, 0, 15 );

					break;

			}

			this.nodepass.build();

	 },
	
	 needRender: function() {
        return (this.requestR);
     },
	
	 requestRender: function() {
		this.requestR = true;
	 },
	 
	 render: function() {
		 
		this.checkenabled();
		if(this.enabled){
			var delta = this.clock.getDelta();

			this.nodepass.node.updateFrame( delta );
			this.composer.render();				
		}

		this.requestR = false;
	 },
	 
	 resize: function(width, height) {

			this.composer.setSize( width, height );
	 }
 }
 


