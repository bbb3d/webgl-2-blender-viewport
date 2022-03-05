
THREE.Dof2Pass = function ( scene, camera, params ) {

	THREE.Pass.call( this );

	this.scene = scene;
	this.camera = camera;

	var focalDepth = ( params.focalDepth !== undefined ) ? params.focalDepth : 200.0;
	var focalLength = ( params.focalLength !== undefined ) ? params.focalLength : 35.0;
	var fstop = ( params.fstop !== undefined ) ? params.fstop : 2.2;
	var maxblur = ( params.maxblur !== undefined ) ? params.maxblur : 1.0;
	var showFocus = ( params.showFocus !== undefined ) ? params.showFocus : false;
	var manualdof = ( params.manualdof !== undefined ) ? params.manualdof : false;
	var vignetting = ( params.vignetting !== undefined ) ? params.vignetting : false;
	var depthblur = ( params.depthblur !== undefined ) ? params.depthblur : false;
	var threshold = ( params.threshold !== undefined ) ? params.threshold : 0.5;
	var gain = ( params.gain !== undefined ) ? params.gain : 2.0;
	var bias = ( params.bias !== undefined ) ? params.bias : 0.5;
	var fringe = ( params.fringe !== undefined ) ? params.fringe : 0.7;
	var noise = ( params.noise !== undefined ) ? params.noise : false;
	var dithering = ( params.dithering !== undefined ) ? params.dithering : 0.0001;
	var pentagon = ( params.pentagon !== undefined ) ? params.pentagon : false;
	var shaderFocus = ( params.shaderFocus !== undefined ) ? params.shaderFocus : false;

	// render targets

	var width = params.width || window.innerWidth || 1;
	var height = params.height || window.innerHeight || 1;

	this.renderTargetColor = new THREE.WebGLRenderTarget( width, height, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat
	} );

	this.renderTargetDepth = this.renderTargetColor.clone();

	// depth material

	this.materialDepth = new THREE.MeshDepthMaterial();

	// dof2 material

	if ( THREE.Dof2Shader === undefined ) {

		console.error( "THREE.Dof2Pass relies on THREE.Dof2Shader" );

	}

	var dof2shader = THREE.Dof2Shader;
	var dof2Uniforms = THREE.UniformsUtils.clone( dof2shader.uniforms );

	dof2Uniforms[ "tDepth" ].value = this.renderTargetDepth.texture;
	dof2Uniforms[ "znear" ].value = this.camera.near;
	dof2Uniforms[ "zfar" ].value = this.camera.far;	
	dof2Uniforms[ "textureWidth" ].value = width;
	dof2Uniforms[ "textureHeight" ].value = height;
	
	dof2Uniforms[ "focalDepth" ].value = focalDepth;
	dof2Uniforms[ "focalLength" ].value = focalLength;
	dof2Uniforms[ "fstop" ].value = fstop;
	dof2Uniforms[ "maxblur" ].value = maxblur;
	dof2Uniforms[ "showFocus" ].value = showFocus;
	dof2Uniforms[ "manualdof" ].value = manualdof;
	dof2Uniforms[ "vignetting" ].value = vignetting;
	dof2Uniforms[ "depthblur" ].value = depthblur;
	dof2Uniforms[ "threshold" ].value = threshold;
	dof2Uniforms[ "gain" ].value = gain;
	dof2Uniforms[ "bias" ].value = bias;
	dof2Uniforms[ "noise" ].value = noise;
	dof2Uniforms[ "dithering" ].value = dithering;
	dof2Uniforms[ "pentagon" ].value = pentagon;
	dof2Uniforms[ "shaderFocus" ].value = shaderFocus;
	

	this.materialDof2 = new THREE.ShaderMaterial( {
		defines: dof2shader.defines || {},
		uniforms: dof2Uniforms,
		vertexShader: dof2shader.vertexShader,
		fragmentShader: dof2shader.fragmentShader
	} );

	this.uniforms = dof2Uniforms;
	this.needsSwap = false;

	this.camera2 = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene2  = new THREE.Scene();

	this.quad2 = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.quad2.frustumCulled = false; // Avoid getting clipped
	this.scene2.add( this.quad2 );

};

THREE.Dof2Pass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.Dof2Pass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		this.quad2.material = this.materialDof2;

		// Render depth into texture

		this.scene.overrideMaterial = this.materialDepth;

		renderer.render( this.scene, this.camera, this.renderTargetDepth, true );

		// Render dof2 composite

		this.uniforms[ "tColor" ].value = readBuffer.texture;

		if ( this.renderToScreen ) {

			renderer.render( this.scene2, this.camera2 );

		} else {

			renderer.render( this.scene2, this.camera2, writeBuffer, this.clear );

		}

		this.scene.overrideMaterial = null;

	}

} );
