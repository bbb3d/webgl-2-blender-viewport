
effects = {
			FILM : 1,
			VIGNETTE : 2,
			DOF2 : 3,
			SEPIA : 4,
			COLORCORRECTION : 5,
			GAMMA : 6,
			TONEMAP : 7,
			BRIGHTCONTRAST : 8,
			BLOOM : 9,
			DOF : 10
		};

 function MultiEffects(renderer, scene, camera, options) {
	var options = options || {};

	this.renderer = renderer;
	this.scene = scene;
	this.camera = camera;
	this.options = extend({}, this.defaults, options);

	var ready = false;
	var enabled;
	this.requestR = false;
	
	var gui, guiElements = [];
	this.guidisabled = false;
	var param;
	
	this.init();
 }
 
 MultiEffects.prototype = {
	 constructor: MultiEffects,
	 
	 // options
	 defaults: {
		debug: false,
		enabled : true,
		width : 1920,
		height : 1080,
		sets : {"none" : {
						},
                "setA" : {"Film" : {effect : effects.FILM,
										order : 2, 
										noiseIntensity : 0.35, 
										scanlinesIntensity : 0.5, 
										scanlinesCount : 2048, 
										grayscale : true}, 
						"Vignette" : {effect : effects.VIGNETTE,
										order : 1, 
										offset : 0.95, 
										darkness : 1.6}, 
						"Sepia" : {effect : effects.SEPIA,
										order : 3, 
										amount : 0.9}			
						},
						
				"setB" : {"Film" : {effect : effects.FILM,
										order : 1, 
										noiseIntensity : 0.35, 
										scanlinesIntensity : 0.5, 
										scanlinesCount : 2048, 
										grayscale : true}, 
						"Vignette" : {effect : effects.VIGNETTE,
										order : 2, 
										offset : 0.95, 
										darkness : 1.6}, 
						"Dof2" : {effect : effects.DOF2, 
										order : 3, 
										focalDepth :   200.0,
										focalLength:   35.0,
										fstop: 2.2,
										maxblur: 1.0,
										showFocus: false,
										manualdof: false,
										vignetting: false,
										depthblur: false,
										threshold: 0.5,
										gain: 2.0,
										bias: 0.5,
										fringe: 0.7,
										noise: true,
										dithering: 0.0001,
										pentagon: false,
										shaderFocus: true}
						},
						
				"setC" : {"Dof2" : {effect : effects.DOF2, 
										order : 1, 
										focalDepth :   200.0,
										focalLength:   35.0,
										fstop: 2.2,
										maxblur: 1.0,
										showFocus: false,
										manualdof: false,
										vignetting: false,
										depthblur: false,
										threshold: 0.5,
										gain: 2.0,
										bias: 0.5,
										fringe: 0.7,
										noise: true,
										dithering: 0.0001,
										pentagon: false,
										shaderFocus: false}
						},
						
				"setD" : {"Film" : {effect : effects.FILM,
										order : 2, 
										noiseIntensity : 0.35, 
										scanlinesIntensity : 0.025, 
										scanlinesCount : 648, 
										grayscale : false}, 
						"Sepia" : {effect : effects.SEPIA,
										order : 1, 
										amount : 0.1}	
						},
						
				"setE" : {"ColorCorrection" : {effect : effects.COLORCORRECTION, 
										order : 3, 
										powRGB_R : 1.0,
										mulRGB_R: 1.0,
										powRGB_G: 1.0,
										mulRGB_G: 1.0,
										powRGB_B: 1.0,
										mulRGB_B: 1.0,
										addRGB_R: 0.0,
										addRGB_G: 0.0,
										addRGB_B: 0.0},
                        "BrightnessContrast" : {effect : effects.BRIGHTCONTRAST,
										order : 1, 
										brightness : 0.0, 
										contrast : 0.0},
                        "BloomEffect" : {effect : effects.BLOOM,
										order : 2, 
										bloomStrength: 0.4,
										bloomThreshold: 0.62,
										bloomRadius: 1.0},
                        "Film" : {effect : effects.FILM,
										order : 4, 
										noiseIntensity : 0.0, 
										scanlinesIntensity : 0.0, 
										scanlinesCount : 2, 
										grayscale : false}, 
						"Vignette" : {effect : effects.VIGNETTE,
										order : 5, 
										offset : 0.95, 
										darkness : 1.6},
                        "Dof2" : {effect : effects.DOF2, 
										order : 6, 
										focalDepth :   48.0,
										focalLength:   50.0,
										fstop: 12,
										maxblur: 1.5,
										showFocus: false,
										manualdof: true,
										vignetting: false,
										depthblur: false,
										threshold: 0.62,
										gain: 2.6,
										bias: 0.0,
										fringe: 3.0,
										noise: false,
										dithering: 0.0001,
										pentagon: false,
										shaderFocus: false}
						},
						
				"setF" : {"ToneMap" : {effect : effects.TONEMAP,
										order : 1, 
										averageLuminance : 0.004, 
										maxLuminance : 16.0, 
										middleGrey : 0.6}	
						},
						
				"BrightnessContrast" : {"BrightnessContrast" : {effect : effects.BRIGHTCONTRAST,
										order : 1, 
										brightness : 0.0, 
										contrast : 0.0}	
						},
						
				"setG" : {
					"Film" : {effect : effects.FILM,
										order : 2, 
										noiseIntensity : 0.35, 
										scanlinesIntensity : 0.025, 
										scanlinesCount : 648, 
										grayscale : false},
					"BloomEffect" : {effect : effects.BLOOM,
											order : 1, 
											bloomStrength: 0.5,
											bloomThreshold: 0.77,
											bloomRadius: 1.0}	
				},
						
				"NSX" : {"Film" : {effect : effects.FILM,
										order : 2, 
										noiseIntensity : 0.15, 
										scanlinesIntensity : 0.0, 
										scanlinesCount : 0, 
										grayscale : false},
										
						"BloomEffect" : {effect : effects.BLOOM,
										order : 1, 
										bloomStrength: 0.3,
										bloomThreshold: 0.77,
										bloomRadius: 1.0},
						"Dof2" : {effect : effects.DOF2, 
										order : 3, 
										focalDepth :   48.0,
										focalLength:   50.0,
										fstop: 12,
										maxblur: 2.9,
										showFocus: false,
										manualdof: false,
										vignetting: false,
										depthblur: false,
										threshold: 0.48,
										gain: 2.6,
										bias: 0.0,
										fringe: 3.0,
										noise: false,
										dithering: 0.0001,
										pentagon: true,
										shaderFocus: false}
						}
		}
	 },
	 
	 init: function() {		
		var _this = this;
		this.enabled = this.options.enabled;
		
		this.composer = new THREE.EffectComposer( this.renderer );
		
		this.param = { current: "setG" };
		
		this.useSet("setG");
		//this.updateui();
		
		this.resize(this.options.width, this.options.height);
		this.ready = true;
		
		//console.log("key: " + _.findKey(this.options.sets["setA"], ['order', 1]));
		
		for(set in this.options.sets) {
			console.log(set);
			}
	 },
	 
	 clearGui: function() {
		 var _this = this;
		 if ( this.gui ) this.gui.destroy();

			this.gui = new dat.GUI();			
			var sets = {};
		 
			for(set in this.options.sets) {
				sets[set] = set;
				}

			var current = this.gui.add( this.param, 'current', sets).onFinishChange( function() {
				_this.update();
				_this.requestRender();
			} );
			
			this.gui.open();
	 },
	 
	 enable: function() {
		 this.enabled = true;		 
     },
	 
	 disable: function() {
		 this.enabled = false;		 
     },
	 
	 update: function() {
			this.useSet(this.param.current);
			//this.updateui();
			//this.needupdate = false;
     },
	 
	 useSet: function(setname) {
		 var _this = this;
		 this.disable();
		 //this.composer.reset();
		 this.composer = new THREE.EffectComposer( this.renderer );
		 var renderPass = new THREE.RenderPass( this.scene, this.camera );
		 
		 this.clearGui();
		 
		 this.composer.addPass( renderPass );
		 
		 var len = Object.keys(this.options.sets[setname]).length;
		 
		 var tabs = {};
		 
		 for (i = 1; i <= len; i++) {
			var effectname = _.findKey(this.options.sets[setname], ['order', i]);
			//console.log("effectname: " + effectname + " order: " + i);
			//var proper = this.options.sets[setname][effectname];
			
			switch(this.options.sets[setname][effectname]["effect"]){
				
				case effects.FILM :
					var effectFilmBW = new THREE.FilmPass( this.options.sets[setname][effectname].noiseIntensity, 
														   this.options.sets[setname][effectname].scanlinesIntensity, 
															this.options.sets[setname][effectname].scanlinesCount, 
															this.options.sets[setname][effectname].grayscale );
					effectFilmBW.renderToScreen = (i == len ? true : false);
					this.composer.addPass( effectFilmBW );
					
					var effectnamef = _.findKey(this.options.sets[this.param.current], ['order', i]);
					
					tabs[effectnamef] = this.gui.addFolder(effectnamef);

					this.addGui(tabs[effectnamef], 'noiseIntensity', this.options.sets[this.param.current][effectnamef].noiseIntensity, function( val ) {
						_this.options.sets[_this.param.current][effectnamef].noiseIntensity = val;
						effectFilmBW.uniforms.nIntensity.value = val;
						_this.requestRender();
					}, false, 0.0, 1.0 );
					
					this.addGui(tabs[effectnamef], 'scanlinesIntensity', this.options.sets[this.param.current][effectnamef].scanlinesIntensity, function( val ) {
						_this.options.sets[_this.param.current][effectnamef].scanlinesIntensity = val;
						effectFilmBW.uniforms.sIntensity.value = val;
						_this.requestRender();
					}, false, 0.0, 1.0 );
					
					this.addGui(tabs[effectnamef], 'scanlinesCount', this.options.sets[this.param.current][effectnamef].scanlinesCount, function( val ) {
						_this.options.sets[_this.param.current][effectnamef].scanlinesCount = val;
						effectFilmBW.uniforms.sCount.value = val;
						_this.requestRender();
					}, false, 0, 2048 );
					
					this.addGui(tabs[effectnamef], 'grayscale', this.options.sets[this.param.current][effectnamef].grayscale, function( val ) {
						_this.options.sets[_this.param.current][effectnamef].grayscale = val;
						effectFilmBW.uniforms.grayscale.value = val;
						_this.requestRender();
					}, false);
					
					break;
					
				case effects.VIGNETTE :
					var shaderVignette = THREE.VignetteShader;
					var effectVignette = new THREE.ShaderPass( shaderVignette );		
					effectVignette.uniforms[ "offset" ].value = this.options.sets[setname][effectname].offset;
					effectVignette.uniforms[ "darkness" ].value = this.options.sets[setname][effectname].darkness;	
					effectVignette.renderToScreen = (i == len ? true : false);
					this.composer.addPass( effectVignette );
					
					var effectnamev = _.findKey(this.options.sets[this.param.current], ['order', i]);
					
					tabs[effectnamev] = this.gui.addFolder(effectnamev);
					
					this.addGui(tabs[effectnamev], 'offset', this.options.sets[this.param.current][effectnamev].offset, function( val ) {
						_this.options.sets[_this.param.current][effectnamev].offset = val;
						effectVignette.uniforms[ "offset" ].value = val;
						_this.requestRender();
					}, false, 0.0, 4.0);
					
					this.addGui(tabs[effectnamev], 'darkness', this.options.sets[this.param.current][effectnamev].darkness, function( val ) {
						_this.options.sets[_this.param.current][effectnamev].darkness = val;
						effectVignette.uniforms[ "darkness" ].value = val;
						_this.requestRender();
					}, false, 0.0, 3.0);
					
					break;
					
				case effects.DOF2 :
					
					var dof2pass = new THREE.Dof2Shader( this.scene, this.camera, {
						width: this.options.width,
						height: this.options.height,
						focalDepth : this.options.sets[setname][effectname].focalDepth,
						focalLength: this.options.sets[setname][effectname].focalLength,
						fstop: this.options.sets[setname][effectname].fstop,
						maxblur: this.options.sets[setname][effectname].maxblur,
						showFocus: this.options.sets[setname][effectname].showFocus,
						manualdof: this.options.sets[setname][effectname].manualdof,
						vignetting: this.options.sets[setname][effectname].vignetting,
						depthblur: this.options.sets[setname][effectname].depthblur,
						threshold: this.options.sets[setname][effectname].focus,
						gain: this.options.sets[setname][effectname].gain,
						bias: this.options.sets[setname][effectname].bias,
						fringe: this.options.sets[setname][effectname].fringe,
						noise: this.options.sets[setname][effectname].noise,
						dithering: this.options.sets[setname][effectname].dithering,
						pentagon: this.options.sets[setname][effectname].pentagon,
						shaderFocus: this.options.sets[setname][effectname].shaderFocus
					} );

					dof2pass.renderToScreen = (i == len ? true : false);	
					this.composer.addPass( dof2pass );
					
					var effectnameb = _.findKey(this.options.sets[this.param.current], ['order', i]);
					
					tabs[effectnameb] = this.gui.addFolder(effectnameb);
					
					
					this.addGui(tabs[effectnameb], 'focalDepth', this.options.sets[this.param.current][effectnameb].focalDepth, function( val ) {
						_this.options.sets[_this.param.current][effectnameb].focalDepth = val;
						dof2pass.uniforms[ "focalDepth" ].value = val;
						_this.requestRender();
					}, false, 0.0, 1000.0);
					
					this.addGui(tabs[effectnameb], 'focalLength', this.options.sets[this.param.current][effectnameb].focalLength, function( val ) {
						_this.options.sets[_this.param.current][effectnameb].focalLength = val;
						dof2pass.uniforms[ "focalLength" ].value = val;
						_this.requestRender();
					}, false, 16.0, 80.0);
					
					this.addGui(tabs[effectnameb], 'fstop', this.options.sets[this.param.current][effectnameb].fstop, function( val ) {
						_this.options.sets[_this.param.current][effectnameb].fstop = val;
						dof2pass.uniforms[ "fstop" ].value = val;
						_this.requestRender();
					}, false, 0.1, 22.0);
					
					this.addGui(tabs[effectnameb], 'maxblur', this.options.sets[this.param.current][effectnameb].maxblur, function( val ) {
						_this.options.sets[_this.param.current][effectnameb].maxblur = val;
						dof2pass.uniforms[ "maxblur" ].value = val;
						_this.requestRender();
					}, false, 0.0, 5.0);
					
					this.addGui(tabs[effectnameb], 'showFocus', this.options.sets[this.param.current][effectnameb].showFocus, function( val ) {
						_this.options.sets[_this.param.current][effectnameb].showFocus = val;
						dof2pass.uniforms[ "showFocus" ].value = val;
						_this.requestRender();
					}, false);
					
					this.addGui(tabs[effectnameb], 'manualdof', this.options.sets[this.param.current][effectnameb].manualdof, function( val ) {
						_this.options.sets[_this.param.current][effectnameb].manualdof = val;
						dof2pass.uniforms[ "manualdof" ].value = val;
						_this.requestRender();
					}, false);
					
					this.addGui(tabs[effectnameb], 'vignetting', this.options.sets[this.param.current][effectnameb].vignetting, function( val ) {
						_this.options.sets[_this.param.current][effectnameb].vignetting = val;
						dof2pass.uniforms[ "vignetting" ].value = val;
						_this.requestRender();
					}, false);
					
					this.addGui(tabs[effectnameb], 'depthblur', this.options.sets[this.param.current][effectnameb].depthblur, function( val ) {
						_this.options.sets[_this.param.current][effectnameb].depthblur = val;
						dof2pass.uniforms[ "depthblur" ].value = val;
						_this.requestRender();
					}, false);
					
					this.addGui(tabs[effectnameb], 'threshold', this.options.sets[this.param.current][effectnameb].threshold, function( val ) {
						_this.options.sets[_this.param.current][effectnameb].threshold = val;
						dof2pass.uniforms[ "threshold" ].value = val;
						_this.requestRender();
					}, false, 0.0, 1.0);
					
					this.addGui(tabs[effectnameb], 'bias', this.options.sets[this.param.current][effectnameb].bias, function( val ) {
						_this.options.sets[_this.param.current][effectnameb].bias = val;
						dof2pass.uniforms[ "bias" ].value = val;
						_this.requestRender();
					}, false, 0.0, 3.0);
					
					this.addGui(tabs[effectnameb], 'fringe', this.options.sets[this.param.current][effectnameb].fringe, function( val ) {
						_this.options.sets[_this.param.current][effectnameb].fringe = val;
						dof2pass.uniforms[ "fringe" ].value = val;
						_this.requestRender();
					}, false, 0.0, 5.0);
					
					this.addGui(tabs[effectnameb], 'noise', this.options.sets[this.param.current][effectnameb].noise, function( val ) {
						_this.options.sets[_this.param.current][effectnameb].noise = val;
						dof2pass.uniforms[ "noise" ].value = val;
						_this.requestRender();
					}, false);
					
					this.addGui(tabs[effectnameb], 'dithering', this.options.sets[this.param.current][effectnameb].dithering, function( val ) {
						_this.options.sets[_this.param.current][effectnameb].dithering = val;
						dof2pass.uniforms[ "dithering" ].value = val;
						_this.requestRender();
					}, false, 0.0001, 0.001);
					
					this.addGui(tabs[effectnameb], 'pentagon', this.options.sets[this.param.current][effectnameb].pentagon, function( val ) {
						_this.options.sets[_this.param.current][effectnameb].pentagon = val;
						dof2pass.uniforms[ "pentagon" ].value = val;
						_this.requestRender();
					}, false);
					
					this.addGui(tabs[effectnameb], 'shaderFocus', this.options.sets[this.param.current][effectnameb].shaderFocus, function( val ) {
						_this.options.sets[_this.param.current][effectnameb].shaderFocus = val;
						dof2pass.uniforms[ "shaderFocus" ].value = val;
						_this.requestRender();
					}, false);
					
					this.addGui(tabs[effectnameb], 'gain', this.options.sets[this.param.current][effectnameb].gain, function( val ) {
						_this.options.sets[_this.param.current][effectnameb].gain = val;
						dof2pass.uniforms[ "gain" ].value = val;
						_this.requestRender();
					}, false, 0.0, 100.0);
					
					break;
					
				case effects.SEPIA :
					var shaderSepia = THREE.SepiaShader;
					var effectSepia = new THREE.ShaderPass( shaderSepia );		
					effectSepia.uniforms[ "amount" ].value = this.options.sets[setname][effectname].amount;
					effectSepia.renderToScreen = (i == len ? true : false);
					this.composer.addPass( effectSepia );
					
					var effectnames = _.findKey(this.options.sets[this.param.current], ['order', i]);
					
					tabs[effectnames] = this.gui.addFolder(effectnames);
					
					this.addGui(tabs[effectnames], 'amount', this.options.sets[this.param.current][effectnames].amount, function( val ) {
						_this.options.sets[_this.param.current][effectnames].amount = val;
						effectSepia.uniforms[ "amount" ].value = val;
						_this.requestRender();
					}, false, 0.0, 1.0);
					
					break;
				
				case effects.COLORCORRECTION :
					var shaderColorCorrection = THREE.ColorCorrectionShader;
					var effectColorCorrection = new THREE.ShaderPass( shaderColorCorrection );		
					
					effectColorCorrection.uniforms[ "powRGB" ].value = new THREE.Vector3(this.options.sets[setname][effectname].powRGB_R, 
																						 this.options.sets[setname][effectname].powRGB_G, 
																						this.options.sets[setname][effectname].powRGB_B);
					
					effectColorCorrection.uniforms[ "mulRGB" ].value = new THREE.Vector3(this.options.sets[setname][effectname].mulRGB_R, 
																						 this.options.sets[setname][effectname].mulRGB_G, 
																						this.options.sets[setname][effectname].mulRGB_B);
					
					effectColorCorrection.uniforms[ "addRGB" ].value = new THREE.Vector3(this.options.sets[setname][effectname].addRGB_R, 
																						 this.options.sets[setname][effectname].addRGB_G, 
																						this.options.sets[setname][effectname].addRGB_B);
					
					effectColorCorrection.renderToScreen = (i == len ? true : false);
					this.composer.addPass( effectColorCorrection );
					
					var effectnamec = _.findKey(this.options.sets[this.param.current], ['order', i]);
					
					tabs[effectnamec] = this.gui.addFolder(effectnamec);
					
					this.addGui(tabs[effectnamec], 'powRGB_R', this.options.sets[this.param.current][effectnamec].powRGB_R, function( val ) {
						_this.options.sets[_this.param.current][effectnamec].powRGB_R = val;
						effectColorCorrection.uniforms[ "powRGB" ].value = new THREE.Vector3(_this.options.sets[setname][effectname].powRGB_R, 
																						 _this.options.sets[setname][effectname].powRGB_G, 
																						_this.options.sets[setname][effectname].powRGB_B);
						_this.requestRender();
					}, false, 0.0, 5.0);
					
					this.addGui(tabs[effectnamec], 'powRGB_G', this.options.sets[this.param.current][effectnamec].powRGB_G, function( val ) {
						_this.options.sets[_this.param.current][effectnamec].powRGB_G = val;
						effectColorCorrection.uniforms[ "powRGB" ].value = new THREE.Vector3(_this.options.sets[setname][effectname].powRGB_R, 
																						 _this.options.sets[setname][effectname].powRGB_G, 
																						_this.options.sets[setname][effectname].powRGB_B);
						_this.requestRender();
					}, false, 0.0, 5.0);
					
					this.addGui(tabs[effectnamec], 'powRGB_B', this.options.sets[this.param.current][effectnamec].powRGB_B, function( val ) {
						_this.options.sets[_this.param.current][effectnamec].powRGB_B = val;
						effectColorCorrection.uniforms[ "powRGB" ].value = new THREE.Vector3(_this.options.sets[setname][effectname].powRGB_R, 
																						 _this.options.sets[setname][effectname].powRGB_G, 
																						_this.options.sets[setname][effectname].powRGB_B);
						_this.requestRender();
					}, false, 0.0, 5.0);
					
					this.addGui(tabs[effectnamec], 'mulRGB_R', this.options.sets[this.param.current][effectnamec].mulRGB_R, function( val ) {
						_this.options.sets[_this.param.current][effectnamec].mulRGB_R = val;
						effectColorCorrection.uniforms[ "mulRGB" ].value = new THREE.Vector3(_this.options.sets[setname][effectname].mulRGB_R, 
																						 _this.options.sets[setname][effectname].mulRGB_G, 
																						_this.options.sets[setname][effectname].mulRGB_B);
						_this.requestRender();
					}, false, 0.0, 5.0);
					
					this.addGui(tabs[effectnamec], 'mulRGB_G', this.options.sets[this.param.current][effectnamec].mulRGB_G, function( val ) {
						_this.options.sets[_this.param.current][effectnamec].mulRGB_G = val;
						effectColorCorrection.uniforms[ "mulRGB" ].value = new THREE.Vector3(_this.options.sets[setname][effectname].mulRGB_R, 
																						 _this.options.sets[setname][effectname].mulRGB_G, 
																						_this.options.sets[setname][effectname].mulRGB_B);
						_this.requestRender();
					}, false, 0.0, 5.0);
					
					this.addGui(tabs[effectnamec], 'mulRGB_B', this.options.sets[this.param.current][effectnamec].mulRGB_B, function( val ) {
						_this.options.sets[_this.param.current][effectnamec].mulRGB_B = val;
						effectColorCorrection.uniforms[ "mulRGB" ].value = new THREE.Vector3(_this.options.sets[setname][effectname].mulRGB_R, 
																						 _this.options.sets[setname][effectname].mulRGB_G, 
																						_this.options.sets[setname][effectname].mulRGB_B);
						_this.requestRender();
					}, false, 0.0, 5.0);
					
					this.addGui(tabs[effectnamec], 'addRGB_R', this.options.sets[this.param.current][effectnamec].addRGB_R, function( val ) {
						_this.options.sets[_this.param.current][effectnamec].addRGB_R = val;
						effectColorCorrection.uniforms[ "addRGB" ].value = new THREE.Vector3(_this.options.sets[setname][effectname].addRGB_R, 
																						 _this.options.sets[setname][effectname].addRGB_G, 
																						_this.options.sets[setname][effectname].addRGB_B);
						_this.requestRender();
					}, false, 0.0, 1.0);
					
					this.addGui(tabs[effectnamec], 'addRGB_G', this.options.sets[this.param.current][effectnamec].addRGB_G, function( val ) {
						_this.options.sets[_this.param.current][effectnamec].addRGB_G = val;
						effectColorCorrection.uniforms[ "addRGB" ].value = new THREE.Vector3(_this.options.sets[setname][effectname].addRGB_R, 
																						 _this.options.sets[setname][effectname].addRGB_G, 
																						_this.options.sets[setname][effectname].addRGB_B);
						_this.requestRender();
					}, false, 0.0, 1.0);
					
					this.addGui(tabs[effectnamec], 'addRGB_B', this.options.sets[this.param.current][effectnamec].addRGB_B, function( val ) {
						_this.options.sets[_this.param.current][effectnamec].addRGB_B = val;
						effectColorCorrection.uniforms[ "addRGB" ].value = new THREE.Vector3(_this.options.sets[setname][effectname].addRGB_R, 
																						 _this.options.sets[setname][effectname].addRGB_G, 
																						_this.options.sets[setname][effectname].addRGB_B);
						_this.requestRender();
					}, false, 0.0, 1.0);
					
					break;
				
				case effects.GAMMA :
					
					
					break;
				
				case effects.TONEMAP :
					var shaderToneMap = THREE.ToneMapShader;
					var effectToneMap = new THREE.ShaderPass( shaderToneMap );		
					
					effectToneMap.uniforms[ "averageLuminance" ].value = this.options.sets[setname][effectname].averageLuminance;
					effectToneMap.uniforms[ "maxLuminance" ].value = this.options.sets[setname][effectname].maxLuminance;
					effectToneMap.uniforms[ "middleGrey" ].value = this.options.sets[setname][effectname].middleGrey;
					
					effectToneMap.renderToScreen = (i == len ? true : false);
					this.composer.addPass( effectToneMap );
					
					var effectnamet = _.findKey(this.options.sets[this.param.current], ['order', i]);
					
					tabs[effectnamet] = this.gui.addFolder(effectnamet);
					
					this.addGui(tabs[effectnamet], 'averageLuminance', this.options.sets[this.param.current][effectnamet].averageLuminance, function( val ) {
						_this.options.sets[_this.param.current][effectnamet].averageLuminance = val;
						effectToneMap.uniforms[ "averageLuminance" ].value = val;
						_this.requestRender();
					}, false, 0.0, 1.0);
					
					this.addGui(tabs[effectnamet], 'maxLuminance', this.options.sets[this.param.current][effectnamet].maxLuminance, function( val ) {
						_this.options.sets[_this.param.current][effectnamet].maxLuminance = val;
						effectToneMap.uniforms[ "maxLuminance" ].value = val;
						_this.requestRender();
					}, false, 0.0, 50.0);
					
					this.addGui(tabs[effectnamet], 'middleGrey', this.options.sets[this.param.current][effectnamet].middleGrey, function( val ) {
						_this.options.sets[_this.param.current][effectnamet].middleGrey = val;
						effectToneMap.uniforms[ "middleGrey" ].value = val;
						_this.requestRender();
					}, false, 0.0, 1.0);
					
					break;
					
				case effects.BRIGHTCONTRAST :
					var shaderBrightnessContrast = THREE.BrightnessContrastShader;
					var effectBrightnessContrast = new THREE.ShaderPass( shaderBrightnessContrast );		
					
					effectBrightnessContrast.uniforms[ "brightness" ].value = this.options.sets[setname][effectname].brightness;
					effectBrightnessContrast.uniforms[ "contrast" ].value = this.options.sets[setname][effectname].contrast;
					
					effectBrightnessContrast.renderToScreen = (i == len ? true : false);
					this.composer.addPass( effectBrightnessContrast );
					
					var effectnamebr = _.findKey(this.options.sets[this.param.current], ['order', i]);
					
					tabs[effectnamebr] = this.gui.addFolder(effectnamebr);
					
					this.addGui(tabs[effectnamebr], 'brightness', this.options.sets[this.param.current][effectnamebr].brightness, function( val ) {
						_this.options.sets[_this.param.current][effectnamebr].brightness = val;
						effectBrightnessContrast.uniforms[ "brightness" ].value = val;
						_this.requestRender();
					}, false, 0.0, 1.0);
					
					this.addGui(tabs[effectnamebr], 'contrast', this.options.sets[this.param.current][effectnamebr].contrast, function( val ) {
						_this.options.sets[_this.param.current][effectnamebr].contrast = val;
						effectBrightnessContrast.uniforms[ "contrast" ].value = val;
						_this.requestRender();
					}, false, 0.0, 1.0);
										
					break;
					
				case effects.BLOOM :
					
					var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(this.options.width, this.options.height), 
																this.options.sets[setname][effectname].bloomStrength, 
																this.options.sets[setname][effectname].bloomRadius, 
																this.options.sets[setname][effectname].bloomThreshold);
					
					//bloomPass.renderToScreen = (i == len ? true : false);
					this.composer.addPass( bloomPass );
					var copyShader = new THREE.ShaderPass(THREE.CopyShader);
					copyShader.renderToScreen = (i == len ? true : false);
					this.composer.addPass( copyShader );
					
					var effectnamebl = _.findKey(this.options.sets[this.param.current], ['order', i]);
					
					tabs[effectnamebl] = this.gui.addFolder(effectnamebl);

					this.addGui(tabs[effectnamebl], 'bloomThreshold', this.options.sets[this.param.current][effectnamebl].bloomThreshold, function( val ) {
						_this.options.sets[_this.param.current][effectnamebl].bloomThreshold = val;
						bloomPass.threshold = Number(val);
						_this.requestRender();
					}, false, 0.0, 1.0 );
					
					this.addGui(tabs[effectnamebl], 'bloomStrength', this.options.sets[this.param.current][effectnamebl].bloomStrength, function( val ) {
						_this.options.sets[_this.param.current][effectnamebl].bloomStrength = val;
						bloomPass.strength = Number(val);
						_this.requestRender();
					}, false, 0.0, 3.0 );
					
					this.addGui(tabs[effectnamebl], 'bloomRadius', this.options.sets[this.param.current][effectnamebl].bloomRadius, function( val ) {
						_this.options.sets[_this.param.current][effectnamebl].bloomRadius = val;
						bloomPass.radius = Number(val);
						_this.requestRender();
					}, false, 0.0, 1.0 );
					
					break;
					
				case effects.DOF :
					var bokehPass = new THREE.BokehPass( this.scene, this.camera, {
						focus: 		this.options.sets[setname][effectname].focus,
						aperture:	this.options.sets[setname][effectname].aperture,
						maxblur:	this.options.sets[setname][effectname].maxblur,

						width: this.options.width,
						height: this.options.height
					} );

					bokehPass.renderToScreen = (i == len ? true : false);	
					this.composer.addPass( bokehPass );
					
					var effectnamedof = _.findKey(this.options.sets[this.param.current], ['order', i]);
					
					tabs[effectnamedof] = this.gui.addFolder(effectnamedof);
					
					this.addGui(tabs[effectnamedof], 'focus', this.options.sets[this.param.current][effectnamedof].focus, function( val ) {
						_this.options.sets[_this.param.current][effectnamedof].focus = val;
						bokehPass.uniforms[ "focus" ].value = val;
						_this.requestRender();
					}, false, 0.0, 3.0);
					
					this.addGui(tabs[effectnamedof], 'aperture', this.options.sets[this.param.current][effectnamedof].aperture, function( val ) {
						_this.options.sets[_this.param.current][effectnamedof].aperture = val;
						bokehPass.uniforms[ "aperture" ].value = val;
						_this.requestRender();
					}, false, 0.001, 0.2);
					
					this.addGui(tabs[effectnamedof], 'maxblur', this.options.sets[this.param.current][effectnamedof].maxblur, function( val ) {
						_this.options.sets[_this.param.current][effectnamedof].maxblur = val;
						bokehPass.uniforms[ "maxblur" ].value = val;
						_this.requestRender();
					}, false, 0.0, 3.0);
					
					break;
				}
			} 
		 
		this.enable();
     },
	 	 
	 addGui: function(uitarget, name, value, callback, isColor, min, max ) {
		 var _this = this;
		 var node;

			this.param[ name ] = value;

			if ( isColor ) {
				node = uitarget.addColor( this.param, name ).onChange( function() {
					callback( _this.param[ name ] );
				} );

			} else if ( typeof value == 'object' ) {
				node = tuitarget.add( this.param, name, value ).onChange( function() {
					callback( _this.param[ name ] );
				} );

			} else {
				node = uitarget.add( this.param, name, min, max ).onChange( function() {
					callback( _this.param[ name ] );
				} );

			}

			return node;
	 },
	 
	 checkenabled: function() {		
		 if(!this.enabled && !this.guidisabled){
			$(".dg").hide();
			this.guidisabled = true;
		 }
	 },
	
	 addEffectToSet: function(setname, effectname, effect, properties) {
		 this.options.sets[setname] = this.options.sets[setname] || {};
		 
		 this.options.sets[setname][effectname] = properties;
     },
	 
	 needRender: function() {
        return (this.requestR);
     },
	
	 requestRender: function() {
		this.requestR = true;
	 },
	 
	 render: function() {
		 
		//this.checkenabled();
		if(this.enabled){
			this.composer.render(0.1);
		}
		
		this.requestR = false;
	 },
	 
	 resize: function(width, height) {

			this.composer.setSize( width, height );
	 }
 }
 


