
function htmlLabel(url, scene, options) {
	var options = options || {};
	
	this.url = url;
	this.scene = scene;
	this.options = extend({}, this.defaults, options);
	this.init();
}

htmlLabel.prototype = {
	constructor: htmlLabel,
	
	// options
	defaults: {
		debug: false,
		width: 1024,
		height: 2048,
		position: [500,500,0],
		scale: [50,100,100],
		//scale: [1.0,1.0,1.0],
		showlines: false ,
		lines: [[0.0,10.0,0.0]]
		//lines: [[0.0,100.0,0.0],[0.0,0.0,0.0]]
	},
	
	init: function() {
		var _this = this;
		var canvas = document.createElement("canvas");
		canvas.width = this.options.width;
		canvas.height = this.options.height;
		
		//rasterizeHTML.drawURL(this.url, canvas, {width: 500, height: 900,}).then(function (result) {
		rasterizeHTML.drawURL(this.url, canvas).then(function (result) {
			//console.log(result);
			var texture = new THREE.Texture(canvas);
			texture.needsUpdate = true;
			
			//var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
			var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
			spriteMaterial.map.repeat = new THREE.Vector2( 1.0, 1.0 );
			spriteMaterial.map.offset = new THREE.Vector2( 0, 0 );
			var sprite = new THREE.Sprite( spriteMaterial );		

			sprite.scale.set(_this.options.scale[0], _this.options.scale[1], _this.options.scale[2]);
			sprite.position.set(_this.options.position[0], _this.options.position[1], _this.options.position[2]);
			
			_this.scene.add( sprite );			

		}, function (e) {
			console.log('An error occured:', e);
		});
	}
}
