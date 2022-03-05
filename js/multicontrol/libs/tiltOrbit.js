/*
 * Callback oriented controller (vs. usual polling mechanism)
 * To be used for optimization scenarios where rendering only on user input
 */

TiltOrbitControls = function(object, callback)
{
	var scope = this;
	this.callback = callback;
	//this.object = new THREE.Object3D();
	this.object = object;
	this.enabled = false;	
	
	// var limitLY = -40 * Math.PI / 180;
	// var limitRY = 40 * Math.PI / 180;

	// var limitUX = -10 * Math.PI / 180;
	// var limitDX = 10 * Math.PI / 180;

	//var scroller;
	this.deviceOrientation = {};
	this.screenOrientation = 0;

	// var processingCallback = function(left, top, zoom)
	// {
	// 	var l = ((left - 500.0) / 1000.0) * 2 * 0.8;
	// 	var t = ((top - 500.0) / 1000.0) * 2 * 0.4;
	// 	if(scope.callback)
	// 	{
	// 		scope.callback(-t, -l ,0);
	// 	}
	// };

	var processingCallback = function()
	{
		if ( scope.enabled === false ) return;

		var alpha  = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) : 0; // Z
		var beta   = scope.deviceOrientation.beta  ? THREE.Math.degToRad( scope.deviceOrientation.beta  ) : 0; // X'
		var gamma  = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
		var or = isNaN(THREE.Math.degToRad( scope.screenOrientation)) ? 0 : THREE.Math.degToRad( scope.screenOrientation);
		//var orient = scope.screenOrientation       ? THREE.Math.degToRad( scope.screenOrientation       ) : 0; // O
		var orient = scope.screenOrientation       ? or : 0; // O

		setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient);

	};

	var setObjectQuaternion = function () {

		var zee = new THREE.Vector3( 0, 0, 1 );

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();
		var q2 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		var calibrationQuaternion = THREE.Quaternion();
		var needsCalibration = true;

		var __weak_scope = scope;

		return function (quaternion, alpha, beta, gamma, orient) {

			euler.set( beta, alpha, - gamma, 'YXZ' );                       // 'ZXY' for the device, but 'YXZ' for us
			q2.setFromEuler( euler );                               // orient the device
			q2.multiply( q1 );                                      // camera looks out the back of the device, not the top
			q2.multiply( q0.setFromAxisAngle( zee, - orient ) );    // adjust for screen orientation

			if(needsCalibration)
			{
				needsCalibration = false;
				calibrationQuaternion = q2.clone();
				calibrationQuaternion.inverse();
			}

			//quaternion.multiplyQuaternions(q2, calibrationQuaternion);

			// q2.multiply();
			var rotation = new THREE.Euler().setFromQuaternion(q2);
			//quaternion.set(q2.x, q2.y, q2.z, q2.w);
			rotation.z = 0;
			rotation.x += 20 * Math.PI / 180;
			quaternion.setFromEuler( rotation );

			if(__weak_scope.callback)
			{
				__weak_scope.callback(quaternion);
			}
				
		}

	}();

	var init = function()
	{
		scroller = new Scroller(processingCallback, {
			zooming: false
		});

		scroller.setPosition(0,0);
		scroller.setDimensions(1000, 1000, 2000, 2000);
		scroller.scrollTo(500,500,false,1);
	};

	var onDeviceOrientationChangeEvent = function ( event ) {
		scope.deviceOrientation = event;
		processingCallback();
	};

	var onScreenOrientationChangeEvent = function () {
		scope.screenOrientation = window.orientation || 0;
		processingCallback();
	};

	this.connect = function()
	{
		onScreenOrientationChangeEvent(); // run once on load

		window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		this.enabled = true;
	};

	this.disconnect = function()
	{
		window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		this.enabled = false;
	};

	init();
};

