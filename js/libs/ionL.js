
var ION = ION || {};

// browserify support
if ( typeof module === 'object' ) {

	module.exports = ION;

}

ION.CompressionMethod = {
  RAW: 0x00574152,
  MG1: 0x0031474d,
  MG2: 0x0032474d
};

ION.Flags = {
  NORMALS: 0x00000001
};

ION.File = function(stream) {
//console.profile("3D Test");
	this.load(stream);
//console.profileEnd();
};

ION.File.prototype.load = function(stream) {
	this.header = new ION.FileHeader(stream);

	this.body = new ION.FileBody(this.header);
  
	this.getReader().read(stream, this.body);
};

ION.File.prototype.getReader = function() {
	var reader;

	switch (this.header.compressionMethod){
		case ION.CompressionMethod.RAW:
			reader = new ION.ReaderRAW();
			break;
		case ION.CompressionMethod.MG1:
			reader = new ION.ReaderMG1();
			break;
		case ION.CompressionMethod.MG2:
			reader = new ION.ReaderMG2();
			break;
	}

	return reader;
};

ION.FileHeader = function(stream) {
	stream.readInt32(); //magic "OCTM"
	this.fileFormat = stream.readInt32();
	this.compressionMethod = stream.readInt32();
	this.vertexCount = stream.readInt32();
	this.triangleCount = stream.readInt32();
	this.uvMapCount = stream.readInt32();
	this.attrMapCount = stream.readInt32();
	this.flags = stream.readInt32();
	this.comment = stream.readString();
};

ION.FileHeader.prototype.hasNormals = function() {
	return this.flags & ION.Flags.NORMALS;
};

ION.FileBody = function(header) {
	var i = header.triangleCount * 3,
      v = header.vertexCount * 3,
      n = header.hasNormals() ? header.vertexCount * 3 : 0,
      u = header.vertexCount * 2,
      a = header.vertexCount * 4,
      j = 0;

	var data = new ArrayBuffer(
    (i + v + n + (u * header.uvMapCount) + (a * header.attrMapCount) ) * 4);

	this.indices = new Uint32Array(data, 0, i);

	this.vertices = new Float32Array(data, i * 4, v);

	if ( header.hasNormals() ) {
		this.normals = new Float32Array(data, (i + v) * 4, n);
	}
  
	if (header.uvMapCount) {
		this.uvMaps = [];
		for (j = 0; j < header.uvMapCount; ++ j) {
			this.uvMaps[j] = { uv: new Float32Array(data,
        (i + v + n + (j * u) ) * 4, u) };
		}
	}
  
	if (header.attrMapCount) {
		this.attrMaps = [];
		for (j = 0; j < header.attrMapCount; ++ j) {
			this.attrMaps[j] = { attr: new Float32Array(data,
        (i + v + n + (u * header.uvMapCount) + (j * a) ) * 4, a) };
		}
	}
};

ION.FileMG2Header = function(stream) {
	stream.readInt32(); //magic "MG2H"
	this.vertexPrecision = stream.readFloat32();
	this.normalPrecision = stream.readFloat32();
	this.lowerBoundx = stream.readFloat32();
	this.lowerBoundy = stream.readFloat32();
	this.lowerBoundz = stream.readFloat32();
	this.higherBoundx = stream.readFloat32();
	this.higherBoundy = stream.readFloat32();
	this.higherBoundz = stream.readFloat32();
	this.divx = stream.readInt32();
	this.divy = stream.readInt32();
	this.divz = stream.readInt32();
  
	this.sizex = (this.higherBoundx - this.lowerBoundx) / this.divx;
	this.sizey = (this.higherBoundy - this.lowerBoundy) / this.divy;
	this.sizez = (this.higherBoundz - this.lowerBoundz) / this.divz;
};

ION.ReaderRAW = function() {
};

ION.ReaderRAW.prototype.read = function(stream, body) {
	this.readIndices(stream, body.indices);
	this.readVertices(stream, body.vertices);
  
	if (body.normals) {
		this.readNormals(stream, body.normals);
	}
	if (body.uvMaps) {
		this.readUVMaps(stream, body.uvMaps);
	}
	if (body.attrMaps) {
		this.readAttrMaps(stream, body.attrMaps);
	}
};

ION.ReaderRAW.prototype.readIndices = function(stream, indices) {
	stream.readInt32(); //magic "INDX"
	stream.readArrayInt32(indices);
};

ION.ReaderRAW.prototype.readVertices = function(stream, vertices) {
	stream.readInt32(); //magic "VERT"
	stream.readArrayFloat32(vertices);
};

ION.ReaderRAW.prototype.readNormals = function(stream, normals) {
	stream.readInt32(); //magic "NORM"
	stream.readArrayFloat32(normals);
};

ION.ReaderRAW.prototype.readUVMaps = function(stream, uvMaps) {
	var i = 0;
	for (; i < uvMaps.length; ++ i) {
		stream.readInt32(); //magic "TEXC"

		uvMaps[i].name = stream.readString();
		uvMaps[i].filename = stream.readString();
		stream.readArrayFloat32(uvMaps[i].uv);
	}
};

ION.ReaderRAW.prototype.readAttrMaps = function(stream, attrMaps) {
	var i = 0;
	for (; i < attrMaps.length; ++ i) {
		stream.readInt32(); //magic "ATTR"

		attrMaps[i].name = stream.readString();
		stream.readArrayFloat32(attrMaps[i].attr);
	}
};

ION.ReaderMG1 = function() {
};

ION.ReaderMG1.prototype.read = function(stream, body) {
	this.readIndices(stream, body.indices);
	this.readVertices(stream, body.vertices);
  
	if (body.normals) {
		this.readNormals(stream, body.normals);
	}
	if (body.uvMaps) {
		this.readUVMaps(stream, body.uvMaps);
	}
	if (body.attrMaps) {
		this.readAttrMaps(stream, body.attrMaps);
	}
};

ION.ReaderMG1.prototype.readIndices = function(stream, indices) {
	stream.readInt32(); //magic "INDX"
	stream.readInt32(); //packed size
  
	var interleaved = new ION.InterleavedStream(indices, 3);
	LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

	ION.restoreIndices(indices, indices.length);
};

ION.ReaderMG1.prototype.readVertices = function(stream, vertices) {
	stream.readInt32(); //magic "VERT"
	stream.readInt32(); //packed size
  
	var interleaved = new ION.InterleavedStream(vertices, 1);
	LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
};

ION.ReaderMG1.prototype.readNormals = function(stream, normals) {
	stream.readInt32(); //magic "NORM"
	stream.readInt32(); //packed size

	var interleaved = new ION.InterleavedStream(normals, 3);
	LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
};

ION.ReaderMG1.prototype.readUVMaps = function(stream, uvMaps) {
	var i = 0;
	for (; i < uvMaps.length; ++ i) {
		stream.readInt32(); //magic "TEXC"

		uvMaps[i].name = stream.readString();
		uvMaps[i].filename = stream.readString();
    
		stream.readInt32(); //packed size

		var interleaved = new ION.InterleavedStream(uvMaps[i].uv, 2);
		LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
	}
};

ION.ReaderMG1.prototype.readAttrMaps = function(stream, attrMaps) {
	var i = 0;
	for (; i < attrMaps.length; ++ i) {
		stream.readInt32(); //magic "ATTR"

		attrMaps[i].name = stream.readString();
    
		stream.readInt32(); //packed size

		var interleaved = new ION.InterleavedStream(attrMaps[i].attr, 4);
		LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
	}
};

ION.ReaderMG2 = function() {
};

ION.ReaderMG2.prototype.read = function(stream, body) {
	this.MG2Header = new ION.FileMG2Header(stream);
  
	this.readVertices(stream, body.vertices);
	this.readIndices(stream, body.indices);
  
	if (body.normals) {
		this.readNormals(stream, body);
	}
	if (body.uvMaps) {
		this.readUVMaps(stream, body.uvMaps);
	}
	if (body.attrMaps) {
		this.readAttrMaps(stream, body.attrMaps);
	}
};

ION.ReaderMG2.prototype.readVertices = function(stream, vertices) {
	var magic=stream.readInt32(); //magic "VERT"
	var sz=stream.readInt32(); //packed size

	var interleaved = new ION.InterleavedStream(vertices, 3);
	LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
  
	var gridIndices = this.readGridIndices(stream, vertices);
  
	ION.restoreVertices(vertices, this.MG2Header, gridIndices, this.MG2Header.vertexPrecision);
};

ION.ReaderMG2.prototype.readGridIndices = function(stream, vertices) {
	var magic=stream.readInt32(); //magic "GIDX"
	var sz=stream.readInt32(); //packed size
  
	var gridIndices = new Uint32Array(vertices.length / 3);
  
	var interleaved = new ION.InterleavedStream(gridIndices, 1);
	LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
  
	ION.restoreGridIndices(gridIndices, gridIndices.length);
  
	return gridIndices;
};

ION.ReaderMG2.prototype.readIndices = function(stream, indices) {
	stream.readInt32(); //magic "INDX"
	stream.readInt32(); //packed size

	var interleaved = new ION.InterleavedStream(indices, 3);
	LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

	ION.restoreIndices(indices, indices.length);
};

ION.ReaderMG2.prototype.readNormals = function(stream, body) {
	stream.readInt32(); //magic "NORM"
	stream.readInt32(); //packed size

	var interleaved = new ION.InterleavedStream(body.normals, 3);
	LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

	var smooth = ION.calcSmoothNormals(body.indices, body.vertices);

	ION.restoreNormals(body.normals, smooth, this.MG2Header.normalPrecision);
};

ION.ReaderMG2.prototype.readUVMaps = function(stream, uvMaps) {
	var i = 0;
	for (; i < uvMaps.length; ++ i) {
		stream.readInt32(); //magic "TEXC"

		uvMaps[i].name = stream.readString();
		uvMaps[i].filename = stream.readString();
    
		var precision = stream.readFloat32();
    
		stream.readInt32(); //packed size

		var interleaved = new ION.InterleavedStream(uvMaps[i].uv, 2);
		LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
    
		ION.restoreMap(uvMaps[i].uv, 2, precision);
	}
};

ION.ReaderMG2.prototype.readAttrMaps = function(stream, attrMaps) {
	var i = 0;
	for (; i < attrMaps.length; ++ i) {
		stream.readInt32(); //magic "ATTR"

		attrMaps[i].name = stream.readString();
    
		var precision = stream.readFloat32();
    
		stream.readInt32(); //packed size

		var interleaved = new ION.InterleavedStream(attrMaps[i].attr, 4);
		LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
    
		ION.restoreMap(attrMaps[i].attr, 4, precision);
	}
};

ION.restoreIndices = function(indices, len) {
	var i = 3;
	if (len > 0) {
		indices[2] += indices[0];
		indices[1] += indices[0];
	}
	for (; i < len; i += 3) {
		indices[i] += indices[i - 3];
    
		if (indices[i] === indices[i - 3]) {
			indices[i + 1] += indices[i - 2];
		}else {
			indices[i + 1] += indices[i];
		}

		indices[i + 2] += indices[i];
	}
};

ION.restoreGridIndices = function(gridIndices, len) {
	var i = 1;
	for (; i < len; ++ i) {
		gridIndices[i] += gridIndices[i - 1];
	}
};

ION.restoreVertices = function(vertices, grid, gridIndices, precision) {
	var gridIdx, delta, x, y, z,
      intVertices = new Uint32Array(vertices.buffer, vertices.byteOffset, vertices.length),
      ydiv = grid.divx, zdiv = ydiv * grid.divy,
      prevGridIdx = 0x7fffffff, prevDelta = 0,
      i = 0, j = 0, len = gridIndices.length;

	for (; i < len; j += 3) {
		x = gridIdx = gridIndices[i ++];
    
		z = ~~(x / zdiv);
		x -= ~~(z * zdiv);
		y = ~~(x / ydiv);
		x -= ~~(y * ydiv);

		delta = intVertices[j];
		if (gridIdx === prevGridIdx) {
			delta += prevDelta;
		}

		vertices[j]     = grid.lowerBoundx +
      x * grid.sizex + precision * delta;
		vertices[j + 1] = grid.lowerBoundy +
      y * grid.sizey + precision * intVertices[j + 1];
		vertices[j + 2] = grid.lowerBoundz +
      z * grid.sizez + precision * intVertices[j + 2];

		prevGridIdx = gridIdx;
		prevDelta = delta;
	}
};

ION.restoreNormals = function(normals, smooth, precision) {
	var ro, phi, theta, sinPhi,
      nx, ny, nz, by, bz, len,
      intNormals = new Uint32Array(normals.buffer, normals.byteOffset, normals.length),
      i = 0, k = normals.length,
      PI_DIV_2 = 3.141592653589793238462643 * 0.5;

	for (; i < k; i += 3) {
		ro = intNormals[i] * precision;
		phi = intNormals[i + 1];

		if (phi === 0) {
			normals[i]     = smooth[i]     * ro;
			normals[i + 1] = smooth[i + 1] * ro;
			normals[i + 2] = smooth[i + 2] * ro;
		}else {
      
			if (phi <= 4) {
				theta = (intNormals[i + 2] - 2) * PI_DIV_2;
			}else {
				theta = ( (intNormals[i + 2] * 4 / phi) - 2) * PI_DIV_2;
			}
      
			phi *= precision * PI_DIV_2;
			sinPhi = ro * Math.sin(phi);

			nx = sinPhi * Math.cos(theta);
			ny = sinPhi * Math.sin(theta);
			nz = ro * Math.cos(phi);

			bz = smooth[i + 1];
			by = smooth[i] - smooth[i + 2];

			len = Math.sqrt(2 * bz * bz + by * by);
			if (len > 1e-20) {
				by /= len;
				bz /= len;
			}

			normals[i]     = smooth[i]     * nz +
        (smooth[i + 1] * bz - smooth[i + 2] * by) * ny - bz * nx;
			normals[i + 1] = smooth[i + 1] * nz -
        (smooth[i + 2]      + smooth[i]   ) * bz  * ny + by * nx;
			normals[i + 2] = smooth[i + 2] * nz +
        (smooth[i]     * by + smooth[i + 1] * bz) * ny + bz * nx;
		}
	}
};

ION.restoreMap = function(map, count, precision) {
	var delta, value,
      intMap = new Uint32Array(map.buffer, map.byteOffset, map.length),
      i = 0, j, len = map.length;

	for (; i < count; ++ i) {
		delta = 0;

		for (j = i; j < len; j += count) {
			value = intMap[j];
      
			delta += value & 1 ? -( (value + 1) >> 1) : value >> 1;
      
			map[j] = delta * precision;
		}
	}
};

ION.calcSmoothNormals = function(indices, vertices) {
	var smooth = new Float32Array(vertices.length),
      indx, indy, indz, nx, ny, nz,
      v1x, v1y, v1z, v2x, v2y, v2z, len,
      i, k;

	for (i = 0, k = indices.length; i < k;) {
		indx = indices[i ++] * 3;
		indy = indices[i ++] * 3;
		indz = indices[i ++] * 3;

		v1x = vertices[indy]     - vertices[indx];
		v2x = vertices[indz]     - vertices[indx];
		v1y = vertices[indy + 1] - vertices[indx + 1];
		v2y = vertices[indz + 1] - vertices[indx + 1];
		v1z = vertices[indy + 2] - vertices[indx + 2];
		v2z = vertices[indz + 2] - vertices[indx + 2];
    
		nx = v1y * v2z - v1z * v2y;
		ny = v1z * v2x - v1x * v2z;
		nz = v1x * v2y - v1y * v2x;
    
		len = Math.sqrt(nx * nx + ny * ny + nz * nz);
		if (len > 1e-10) {
			nx /= len;
			ny /= len;
			nz /= len;
		}
    
		smooth[indx]     += nx;
		smooth[indx + 1] += ny;
		smooth[indx + 2] += nz;
		smooth[indy]     += nx;
		smooth[indy + 1] += ny;
		smooth[indy + 2] += nz;
		smooth[indz]     += nx;
		smooth[indz + 1] += ny;
		smooth[indz + 2] += nz;
	}

	for (i = 0, k = smooth.length; i < k; i += 3) {
	        v1x=smooth[i];v1y=smooth[i + 1];v1z=smooth[i + 2];
		len = Math.sqrt(v1x*v1x + v1y*v1y + v1z*v1z);

		if (len > 1e-10) {
			smooth[i]     =v1x/ len;
			smooth[i+1] =v1y/ len;
			smooth[i+2] =v1z/ len;
		}
	}

	return smooth;
};

ION.isLittleEndian = (function() {
	var buffer = new ArrayBuffer(2),
      bytes = new Uint8Array(buffer),
      ints = new Uint16Array(buffer);

	bytes[0] = 1;

	return ints[0] === 1;
}());

ION.InterleavedStream = function(data, count) {
	this.data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
	this.offset = ION.isLittleEndian ? 3 : 0;
	this.count = count * 4;
	this.len = this.data.length;
};

ION.InterleavedStream.prototype.writeByte = function(value) {
	this.data[this.offset] = value;
  
	this.offset += this.count;
	if (this.offset >= this.len) {
  
		this.offset -= this.len - 4;
		if (this.offset >= this.count) {
    
			this.offset -= this.count + (ION.isLittleEndian ? 1 : -1);
		}
	}
};

ION.Stream = function(data) {
	this.data = data;
	this.offset = 0;
};

ION.Stream.prototype.TWO_POW_MINUS23 = Math.pow(2, -23);

ION.Stream.prototype.TWO_POW_MINUS126 = Math.pow(2, -126);

ION.Stream.prototype.readByte = function() {
	return this.data[this.offset ++] & 0xff;
};

ION.Stream.prototype.readInt32 = function() {
	var i = this.readByte();
	i |= this.readByte() << 8;
	i |= this.readByte() << 16;
	return i | (this.readByte() << 24);
};

ION.Stream.prototype.readFloat32 = function() {
	var m = this.readByte();
	m += this.readByte() << 8;

	var b1 = this.readByte();
	var b2 = this.readByte();

	m += (b1 & 0x7f) << 16; 
	var e = ( (b2 & 0x7f) << 1) | ( (b1 & 0x80) >>> 7);
	var s = b2 & 0x80 ? -1 : 1;

	if (e === 255) {
		return m !== 0 ? NaN : s * Infinity;
	}
	if (e > 0) {
		return s * (1 + (m * this.TWO_POW_MINUS23) ) * Math.pow(2, e - 127);
	}
	if (m !== 0) {
		return s * m * this.TWO_POW_MINUS126;
	}
	return s * 0;
};

ION.Stream.prototype.readString = function() {
	var len = this.readInt32();

	this.offset += len;

	return String.fromCharCode.apply(null, this.data.subarray(this.offset - len, this.offset));
};

ION.Stream.prototype.readArrayInt32 = function(array) {
	var i = 0, len = array.length;
  
	while (i < len) {
		array[i ++] = this.readInt32();
	}

	return array;
};

ION.Stream.prototype.readArrayFloat32 = function(array) {
	var i = 0, len = array.length;

	while (i < len) {
		array[i ++] = this.readFloat32();
	}

	return array;
};



/**
 * Loader for ION encoded models generated by FinalMesh tool:
 */

THREE.IONLoader = function () {

	THREE.Loader.call( this );

	// Deprecated
	
	Object.defineProperties( this, {
		statusDomElement: {
			get: function () {

				if ( this._statusDomElement === undefined ) {

					this._statusDomElement = document.createElement( 'div' );

				}

				console.warn( 'THREE.BinaryLoader: .statusDomElement has been removed.' );
				return this._statusDomElement;

			}
		},
	} );

};

THREE.IONLoader.prototype = Object.create( THREE.Loader.prototype );
THREE.IONLoader.prototype.constructor = THREE.IONLoader;

// Load multiple ION parts defined in JSON

THREE.IONLoader.prototype.loadParts = function( url, callback, parameters ) {

	parameters = parameters || {};

	var scope = this;

	var xhr = new XMLHttpRequest();

	var basePath = parameters.basePath ? parameters.basePath : this.extractUrlBase( url );

	xhr.onreadystatechange = function() {

		if ( xhr.readyState === 4 ) {

			if ( xhr.status === 200 || xhr.status === 0 ) {

				var jsonObject = JSON.parse( xhr.responseText );

				var materials = [], geometries = [], counter = 0;

				function callbackFinal( geometry ) {

					counter += 1;

					geometries.push( geometry );

					if ( counter === jsonObject.offsets.length ) {

						callback( geometries, materials );

					}

				}


				// init materials

				for ( var i = 0; i < jsonObject.materials.length; i ++ ) {

					materials[ i ] = scope.createMaterial( jsonObject.materials[ i ], basePath );

				}

				// load joined ION file

				var partUrl = basePath + jsonObject.data;
				var parametersPart = { useWorker: parameters.useWorker, offsets: jsonObject.offsets };
				scope.load( partUrl, callbackFinal, parametersPart );

			}

		}

	};

	xhr.open( "GET", url, true );
	xhr.setRequestHeader( "Content-Type", "text/plain" );
	xhr.send( null );

};

// Load IONLoader compressed models
//	- parameters
//		- url (required)
//		- callback (required)

THREE.IONLoader.prototype.load = function( url, callback, parameters ) {

	parameters = parameters || {};

	var scope = this;

	var offsets = parameters.offsets !== undefined ? parameters.offsets : [ 0 ];

	var xhr = new XMLHttpRequest(),
		callbackProgress = null;

	var length = 0;

	xhr.onreadystatechange = function() {

		if ( xhr.readyState === 4 ) {

			if ( xhr.status === 200 || xhr.status === 0 ) {

				var binaryData = new Uint8Array(xhr.response);

				var s = Date.now();

				if ( parameters.useWorker ) {

					var worker = parameters.worker || new Worker( "js/loaders/ion/IONWorker.js" );

					worker.onmessage = function( event ) {

						var files = event.data;

						for ( var i = 0; i < files.length; i ++ ) {

							var ionFile = files[ i ];

							var e1 = Date.now();
							console.log( "ION data parse time [worker]: " + (e1-s) + " ms" );

							scope.createModel( ionFile, callback );

							var e = Date.now();
							console.log( "model load time [worker]: " + (e - e1) + " ms, total: " + (e - s));

						}


					};

					worker.postMessage( { "data": binaryData, "offsets": offsets } );

				} else {

					for ( var i = 0; i < offsets.length; i ++ ) {

						var stream = new ION.Stream( binaryData );
						stream.offset = offsets[ i ];

						var ionFile = new ION.File( stream );

						scope.createModel( ionFile, callback );

					}

					var e = Date.now();
					console.log( "ION data parse time [inline]: " + (e-s) + " ms" );

				}

			} else {

				console.error( "Couldn't load [" + url + "] [" + xhr.status + "]" );

			}

		} else if ( xhr.readyState === 3 ) {

			if ( callbackProgress ) {

				if ( length === 0 ) {

					length = xhr.getResponseHeader( "Content-Length" );

				}

				callbackProgress( { total: length, loaded: xhr.responseText.length } );

			}

		} else if ( xhr.readyState === 2 ) {

			length = xhr.getResponseHeader( "Content-Length" );

		}

	};

	xhr.open( "GET", url, true );
	xhr.responseType = "arraybuffer";

	xhr.send( null );

};


THREE.IONLoader.prototype.createModel = function ( file, callback ) {

	var Model = function () {

		THREE.BufferGeometry.call( this );

		this.materials = [];

		var indices = file.body.indices,
		positions = file.body.vertices,
		normals = file.body.normals;

		var uvs0,uvs1, colors;

		var uvMaps = file.body.uvMaps;

		if ( uvMaps !== undefined && uvMaps.length > 0 ) {

			uvs0 = uvMaps[ 0 ].uv;
			if(uvMaps.length > 1)
			uvs1 = uvMaps[ 1 ].uv;

		}

		var attrMaps = file.body.attrMaps;

		if ( attrMaps !== undefined && attrMaps.length > 0 && attrMaps[ 0 ].name === 'Color' ) {

			colors = attrMaps[ 0 ].attr;

		}

		this.setIndex( new THREE.BufferAttribute( indices, 1 ) );
		this.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

		if ( normals !== undefined ) {

			this.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

		}

		if ( uvs0)this.addAttribute( 'uv', new THREE.BufferAttribute( uvs0, 2 ) );

        if ( uvs1)this.addAttribute( 'uv2', new THREE.BufferAttribute( uvs1, 2 ) );

		if ( colors !== undefined ) {

			this.addAttribute( 'color', new THREE.BufferAttribute( colors, 4 ) );

		}
        if(file.header.comment )
        {
            var meta=JSON.parse(file.header.comment);
            if(meta && meta.r)
            {
                for(var i=0;i<meta.r.length;i++)
                {
                    var g=meta.r[i];
		    // g.m - material is name of material
		    var mtlId=0;

		    if(g.m=="mat_ID1")mtlId=0;else
            if(g.m=="mat_ID2")mtlId=1;else
            if(g.m=="mat_ID3")mtlId=2;else
            if(g.m=="mat_ID4")mtlId=3;else
            if(g.m=="mat_ID5")mtlId=4;else
            if(g.m=="mat_ID6")mtlId=5;else
            if(g.m=="mat_ID7")mtlId=6;else
            if(g.m=="mat_ID8")mtlId=7;else
            if(g.m=="mat_ID9")mtlId=8;else
            if(g.m=="mat_ID10")mtlId=9;else
            if(g.m=="mat_ID11")mtlId=10;else
            if(g.m=="mat_ID12")mtlId=11;else
            if(g.m=="mat_ID13")mtlId=12;else
            if(g.m=="mat_ID14")mtlId=13;else
            if(g.m=="mat_ID15")mtlId=14;else
            if(g.m=="mat_ID16")mtlId=15;else
            if(g.m=="mat_ID17")mtlId=16;else
            if(g.m=="mat_ID18")mtlId=17;else
            if(g.m=="mat_ID19")mtlId=18;else
            if(g.m=="mat_ID20")mtlId=19;else
            if(g.m=="mat_ID21")mtlId=20;else
            if(g.m=="mat_ID22")mtlId=21;else
            if(g.m=="mat_ID23")mtlId=22;else
            if(g.m=="mat_ID24")mtlId=23;else
            if(g.m=="mat_ID25")mtlId=24;
                
                this.addGroup(g.a*3,(g.b-g.a)*3,mtlId);

                }
            }
        }

	}

	Model.prototype = Object.create( THREE.BufferGeometry.prototype );
	Model.prototype.constructor = Model;

	var geometry = new Model();

	// compute vertex normals if not present in the ION model
	if ( geometry.attributes.normal === undefined ) {
		geometry.computeVertexNormals();
	}

	callback( geometry );

};



//importScripts( "lzma.js", "ctm.js" );
/*
self.onmessage = function( event ) {

	var files = [];

	for ( var i = 0; i < event.data.offsets.length; i ++ ) {

		var stream = new ION.Stream( event.data.data );
		stream.offset = event.data.offsets[ i ];

		files[ i ] = new ION.File( stream );

	}

	self.postMessage( files );
	self.close();

};
*/





// use to minify http://www.jscompressor.com/
/* constant tables (inflate) */

var ZIP={
	MASK_BITS:[
    0x0000,
    0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff,
    0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff, 0x3fff, 0x7fff, 0xffff],
// Tables for deflate from PKZIP's appnote.txt.
	cplens:[ // Copy lengths for literal codes 257..285
    3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
    35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0],
/* note: see note #13 above about the 258 in this list. */
	cplext:[ // Extra bits for literal codes 257..285
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
    3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99], // 99==invalid
	cpdist:[ // Copy offsets for distance codes 0..29
    1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
    257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
    8193, 12289, 16385, 24577],

	cpdext:[ // Extra bits for distance codes
    0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
    7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
    12, 12, 13, 13],
	b:[  // Order of the bit length code lengths
    16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
	inflateBin:function(src,offset,size)
	{
		var z=new zip(src,offset);
		return z.inflateBin(size)
	},
	inflateStr:function(src,size)
	{
		var z=new zip(src);
		return z.inflateStr(size)
	},
    HuftNode:function () {
	this.e=0; // number of extra bits or operation
	this.b=0; // number of bits in this code or subcode

	// union
	this.n=0; // literal, length base, or distance base
	this.t=null; // (ZIP.HuftNode) pointer to next level of table
    },
    HuftList:function () {//zip_HuftList
	this.next=null;
	this.list=null;
},
//zip_HuftBuild
HuftBuild:function(b,	// code lengths in bits (all assumed <= BMAX)
		       n,	// number of codes (assumed <= N_MAX)
		       s,	// number of simple-valued codes (0..s-1)
		       d,	// list of base values for non-simple codes
		       e,	// list of extra bits for non-simple codes
		       mm	// maximum lookup bits
		   ) {
    //this.BMAX = 16;   // maximum bit length of any code
    this.N_MAX = 288; // maximum number of codes in any set
    this.status = 0;	// 0: success, 1: incomplete table, 2: bad input
    this.root = null;	// (ZIP.HuftList) starting table
    this.m = 0;		// maximum lookup bits, returns actual

/* Given a list of code lengths and a maximum table size, make a set of
   tables to decode that set of codes.	Return zero on success, one if
   the given code set is incomplete (the tables are still built in this
   case), two if the input is invalid (all zero length codes or an
   oversubscribed set of lengths), and three if not enough memory.
   The code with value 256 is special, and the tables are constructed
   so that no bits beyond that code are fetched when that code is
   decoded. */
    {
	var a;			// counter for codes of length k
	var c = new Array(16+1);	// bit length count table
	var el;			// length of EOB code (value 256)
	var f;			// i repeats in table every f entries
	var g;			// maximum code length
	var h;			// table level
	var i;			// counter, current code
	var j;			// counter
	var k;			// number of bits in current code
	var lx = new Array(16+1);	// stack of bits per table
	var p;			// pointer into c[], b[], or v[]
	var pidx;		// index of p
	var q;			// (ZIP.HuftNode) points to current table
	var r = new ZIP.HuftNode(); // table entry for structure assignment
	var u = new Array(16); // ZIP.HuftNode[BMAX][]  table stack
	var v = new Array(this.N_MAX); // values in order of bit length
	var w;
	var x = new Array(16+1);// bit offsets, then code stack
	var xp;			// pointer into x or c
	var y;			// number of dummy codes added
	var z;			// number of entries in current table
	var o;
	var tail;		// (ZIP.HuftList)

	tail = this.root = null;
	for(i = 0; i < c.length; i++)
	    c[i] = 0;
	for(i = 0; i < lx.length; i++)
	    lx[i] = 0;
	for(i = 0; i < u.length; i++)
	    u[i] = null;
	for(i = 0; i < v.length; i++)
	    v[i] = 0;
	for(i = 0; i < x.length; i++)
	    x[i] = 0;

	// Generate counts for each bit length
	el = n > 256 ? b[256] : 16; // set length of EOB code, if any
	p = b; pidx = 0;
	i = n;
	do {
	    c[p[pidx]]++;	// assume all entries <= BMAX
	    pidx++;
	} while(--i > 0);
	if(c[0] == n) {	// null input--all zero length codes
	    this.root = null;
	    this.m = 0;
	    this.status = 0;
	    return;
	}

	// Find minimum and maximum length, bound *m by those
	for(j = 1; j <= 16; j++)
	    if(c[j] != 0)
		break;
	k = j;			// minimum code length
	if(mm < j)
	    mm = j;
	for(i = 16; i != 0; i--)
	    if(c[i] != 0)
		break;
	g = i;			// maximum code length
	if(mm > i)
	    mm = i;

	// Adjust last length count to fill out codes, if needed
	for(y = 1 << j; j < i; j++, y <<= 1)
	    if((y -= c[j]) < 0) {
		this.status = 2;	// bad input: more codes than bits
		this.m = mm;
		return;
	    }
	if((y -= c[i]) < 0) {
	    this.status = 2;
	    this.m = mm;
	    return;
	}
	c[i] += y;

	// Generate starting offsets into the value table for each length
	x[1] = j = 0;
	p = c;
	pidx = 1;
	xp = 2;
	while(--i > 0)		// note that i == g from above
	    x[xp++] = (j += p[pidx++]);

	// Make a table of values in order of bit lengths
	p = b; pidx = 0;
	i = 0;
	do {
	    if((j = p[pidx++]) != 0)
		v[x[j]++] = i;
	} while(++i < n);
	n = x[g];			// set n to length of v

	// Generate the Huffman codes and for each, make the table entries
	x[0] = i = 0;		// first Huffman code is zero
	p = v; pidx = 0;		// grab values in bit order
	h = -1;			// no tables yet--level -1
	w = lx[0] = 0;		// no bits decoded yet
	q = null;			// ditto
	z = 0;			// ditto

	// go through the bit lengths (k already is bits in shortest code)
	for(; k <= g; k++) {
	    a = c[k];
	    while(a-- > 0) {
		// here i is the Huffman code of length k bits for value p[pidx]
		// make tables up to required level
		while(k > w + lx[1 + h]) {
		    w += lx[1 + h]; // add bits already decoded
		    h++;

		    // compute minimum size table less than or equal to *m bits
		    z = (z = g - w) > mm ? mm : z; // upper limit
		    if((f = 1 << (j = k - w)) > a + 1) { // try a k-w bit table
			// too few codes for k-w bit table
			f -= a + 1;	// deduct codes from patterns left
			xp = k;
			while(++j < z) { // try smaller tables up to z bits
			    if((f <<= 1) <= c[++xp])
				break;	// enough codes to use up j bits
			    f -= c[xp];	// else deduct codes from patterns
			}
		    }
		    if(w + j > el && w < el)
			j = el - w;	// make EOB code end at table
		    z = 1 << j;	// table entries for j-bit table
		    lx[1 + h] = j; // set table size in stack

		    // allocate and link in new table
		    q = new Array(z);
		    for(o = 0; o < z; o++) {
			q[o] = new ZIP.HuftNode();
		    }

		    if(tail == null)
			tail = this.root = new ZIP.HuftList();
		    else
			tail = tail.next = new ZIP.HuftList();
		    tail.next = null;
		    tail.list = q;
		    u[h] = q;	// table starts after link

		    /* connect to last table, if there is one */
		    if(h > 0) {
			x[h] = i;		// save pattern for backing up
			r.b = lx[h];	// bits to dump before this table
			r.e = 16 + j;	// bits in this table
			r.t = q;		// pointer to this table
			j = (i & ((1 << w) - 1)) >> (w - lx[h]);
			u[h-1][j].e = r.e;
			u[h-1][j].b = r.b;
			u[h-1][j].n = r.n;
			u[h-1][j].t = r.t;
		    }
		}

		// set up table entry in r
		r.b = k - w;
		if(pidx >= n)
		    r.e = 99;		// out of values--invalid code
		else if(p[pidx] < s) {
		    r.e = (p[pidx] < 256 ? 16 : 15); // 256 is end-of-block code
		    r.n = p[pidx++];	// simple code is just the value
		} else {
		    r.e = e[p[pidx] - s];	// non-simple--look up in lists
		    r.n = d[p[pidx++] - s];
		}

		// fill code-like entries with r //
		f = 1 << (k - w);
		for(j = i >> w; j < z; j += f) {
		    q[j].e = r.e;
		    q[j].b = r.b;
		    q[j].n = r.n;
		    q[j].t = r.t;
		}

		// backwards increment the k-bit code i
		for(j = 1 << (k - 1); (i & j) != 0; j >>= 1)
		    i ^= j;
		i ^= j;

		// backup over finished tables
		while((i & ((1 << w) - 1)) != x[h]) {
		    w -= lx[h];		// don't need to update q
		    h--;
		}
	    }
	}

	/* return actual size of base table */
	this.m = lx[1];

	/* Return true (1) if we were given an incomplete table */
	this.status = ((y != 0 && g != 1) ? 1 : 0);
    } /* end of constructor */
}

};


function zip(src,offset) {
	this.WSIZE = 32768;		// Sliding Window size	
	this.LBITS = 9; 		// bits in base literal/length lookup table
	this.DBITS = 6; 		// bits in base distance lookup table

	//this.slide=new Array(2*this.WSIZE);
    this.slide=new Uint8Array(2*this.WSIZE);
	this.wp=0;
	this.bitBuf=0;
	this.bitLen=0;
	this.method=-1;
	this.eof=false;
	this.copyLen=this.zip_copy_dist=0;
	this.tl=null;
	this.pos=0;
    this.offset=offset;
	this.src=src;
    this.srcLength=src.byteLength;
	this.STORED_BLOCK = 0;
	this.fixedTL = null;	// inflate static
    this.MASK_BITS=ZIP.MASK_BITS;
}



/* routines (inflate) */

zip.prototype.getByte=function () {
    /*
    var b=this.src[this.pos+this.offset];
    this.pos++;
    return b;*/
    return this.src[this.pos++  +this.offset];
}

zip.prototype.needBits=function(n) {
    while(this.bitLen < n) {
	this.bitBuf |= this.getByte() << this.bitLen;
	this.bitLen += 8;
    }
}

zip.prototype.getBits=function(n) {
    return this.bitBuf & this.MASK_BITS[n];
}

zip.prototype.ngb=function(n) {
    while(this.bitLen < n) {
	this.bitBuf |= this.getByte() << this.bitLen;
	this.bitLen += 8;
    }
    return this.bitBuf & ZIP.MASK_BITS[n];
}


zip.prototype.dumpBits=function (n) {
    this.bitBuf >>= n;
    this.bitLen -= n;
}

zip.prototype.inflateCodes=function(buff, off, size) {
    /* inflate (decompress) the codes in a deflated (compressed) block.
       Return an error code or zero if it all goes ok. */
    var e,		// table entry flag/number of extra bits
        t,		// (ZIP.HuftNode) pointer to table entry
    n=0;

    if(size == 0)
      return 0;

    // inflate the coded data
    
    for(;;) {			// do until end of block

     t = this.tl.list[this.ngb(this.zip_bl)];

	e = t.e;
	while(e > 16) {
	    if(e == 99)
		return -1;
	    this.dumpBits(t.b);
	    //e -= 16;
        t = t.t[this.ngb(e-16)];
	    e = t.e;
	}
	this.dumpBits(t.b);

	if(e == 16) {		// then it's a literal
	    this.wp &= /*this.WSIZE - 1*/ 32767;
	    buff[off + n++] = this.slide[this.wp++] = t.n;
	    if(n == size)
		return size;
	    continue;
	}

	// exit if end of block
	if(e == 15)
	    break;

	// it's an EOB or a length

	// get length of block to copy
     this.copyLen = t.n + this.ngb(e);
	this.dumpBits(e);

	// decode distance of block to copy
     t = this.zip_td.list[this.ngb(this.zip_bd)];

	e = t.e;

	while(e > 16) {
	    if(e == 99)
		return -1;
	    this.dumpBits(t.b);
	    //e -= 16;
        t = t.t[this.ngb(e-16)];
	    e = t.e;
	}
	this.dumpBits(t.b);
	
	this.zip_copy_dist = this.wp - t.n - this.ngb(e);
	this.dumpBits(e);

	// do the copy

	while(this.copyLen > 0 && n < size) {
	    this.copyLen--;
	    this.zip_copy_dist &= 32767/*this.WSIZE - 1*/;
	    this.wp &= 32767 /*this.WSIZE - 1*/;
	    buff[off + n++] = this.slide[this.wp++]	= this.slide[this.zip_copy_dist++];
	}

	if(n == size)
	    return size;
    }

    this.method = -1; // done
    return n;
}

zip.prototype.inflateStored=function (buff, off, size) {
    /* "decompress" an inflated type 0 (stored) block. */
    var n;

    // go to byte boundary
    n = this.bitLen & 7;
    this.dumpBits(n);

    // get the length and its complement

    n = this.ngb(16);
    this.dumpBits(16);
    this.needBits(16);
    if(n != ((~this.bitBuf) & 0xffff))
	return -1;			// error in compressed data
    this.dumpBits(16);

    // read and output the compressed data
    this.copyLen = n;

    n = 0;
    while(this.copyLen > 0 && n < size) {
	this.copyLen--;
	this.wp &= 32767/*this.WSIZE - 1*/;
	buff[off + n++] = this.slide[this.wp++] =    this.ngb(8);
	this.dumpBits(8);
    }

    if(this.copyLen == 0)
      this.method = -1; // done
    return n;
}

zip.prototype.inflateFixed=function(buff, off, size) {
    /* decompress an inflated type 1 (fixed Huffman codes) block.  We should
       either replace this with a custom decoder, or at least precompute the
       Huffman tables. */

    // if first time, set up tables for fixed blocks
    if(this.fixedTL == null) {
	var i;			// temporary variable
	var l = new Array(288);	// length list for huft_build
	var h;	// zip_HuftBuild

	// literal table
	for(i = 0; i < 144; i++)
	    l[i] = 8;
	for(; i < 256; i++)
	    l[i] = 9;
	for(; i < 280; i++)
	    l[i] = 7;
	for(; i < 288; i++)	// make a complete, but wrong code set
	    l[i] = 8;
	this.zip_fixed_bl = 7;

	h = new ZIP.HuftBuild(l, 288, 257, ZIP.cplens, ZIP.cplext,
			      this.zip_fixed_bl);
	if(h.status != 0) {
	    alert("HufBuild error: "+h.status);
	    return -1;
	}
	this.fixedTL = h.root;
	this.zip_fixed_bl = h.m;

	// distance table
	for(i = 0; i < 30; i++)	// make an incomplete code set
	    l[i] = 5;
	this.zip_fixed_bd = 5;

	h = new ZIP.HuftBuild(l, 30, 0, ZIP.cpdist, ZIP.cpdext, this.zip_fixed_bd);
	if(h.status > 1) {
	    this.fixedTL = null;
	    alert("HufBuild error: "+h.status);
	    return -1;
	}
	this.zip_fixed_td = h.root;
	this.zip_fixed_bd = h.m;
    }

    this.tl = this.fixedTL;
    this.zip_td = this.zip_fixed_td;
    this.zip_bl = this.zip_fixed_bl;
    this.zip_bd = this.zip_fixed_bd;
    return this.inflateCodes(buff, off, size);
}

zip.prototype.inflateDynamic=function(buff, off, size) {
    // decompress an inflated type 2 (dynamic Huffman codes) block.
    var i;		// temporary variables
    var j;
    var l;		// last length
    var n;		// number of lengths to get
    var t;		// (ZIP.HuftNode) literal/length code table
    var nb;		// number of bit length codes
    var nl;		// number of literal/length codes
    var nd;		// number of distance codes
    var ll = new Array(286+30); // literal/length and distance code lengths
    var h;		// (ZIP.HuftBuild)

    for(i = 0; i < ll.length; i++)
	ll[i] = 0;

    // read in table lengths
    
    nl = 257 + this.ngb(5);	// number of literal/length codes
    this.dumpBits(5);
    
    nd = 1 + this.ngb(5);	// number of distance codes
    this.dumpBits(5);
    
    nb = 4 + this.ngb(4);	// number of bit length codes
    this.dumpBits(4);
    if(nl > 286 || nd > 30)
      return -1;		// bad lengths

    // read in bit-length-code lengths
    for(j = 0; j < nb; j++)
    {
	
	ll[ZIP.b[j]] = this.ngb(3);
	this.dumpBits(3);
    }
    for(; j < 19; j++)
	ll[ZIP.b[j]] = 0;

    // build decoding table for trees--single level, 7 bit lookup
    this.zip_bl = 7;
    h = new ZIP.HuftBuild(ll, 19, 19, null, null, this.zip_bl);
    if(h.status != 0)
	return -1;	// incomplete code set

    this.tl = h.root;
    this.zip_bl = h.m;

    // read in literal and distance code lengths
    n = nl + nd;
    i = l = 0;
    while(i < n) {
	
	t = this.tl.list[this.ngb(this.zip_bl)];
	j = t.b;
	this.dumpBits(j);
	j = t.n;
	if(j < 16)		// length of code in bits (0..15)
	    ll[i++] = l = j;	// save last length in l
	else if(j == 16) {	// repeat last length 3 to 6 times
	    
	    j = 3 + this.ngb(2);
	    this.dumpBits(2);
	    if(i + j > n)
		return -1;
	    while(j-- > 0)
		ll[i++] = l;
	} else if(j == 17) {	// 3 to 10 zero length codes
	    
	    j = 3 + this.ngb(3);
	    this.dumpBits(3);
	    if(i + j > n)
		return -1;
	    while(j-- > 0)
		ll[i++] = 0;
	    l = 0;
	} else {		// j == 18: 11 to 138 zero length codes
	    
	    j = 11 + this.ngb(7);
	    this.dumpBits(7);
	    if(i + j > n)
		return -1;
	    while(j-- > 0)
		ll[i++] = 0;
	    l = 0;
	}
    }

    // build the decoding tables for literal/length and distance codes
    this.zip_bl = this.LBITS;
    h = new ZIP.HuftBuild(ll, nl, 257, ZIP.cplens, ZIP.cplext, this.zip_bl);
    if(this.zip_bl == 0)	// no literals or lengths
	h.status = 1;
    if(h.status != 0) {
	if(h.status == 1)
	    ;// **incomplete literal tree**
	return -1;		// incomplete code set
    }
    this.tl = h.root;
    this.zip_bl = h.m;

    for(i = 0; i < nd; i++)
	ll[i] = ll[i + nl];
    this.zip_bd = this.DBITS;
    h = new ZIP.HuftBuild(ll, nd, 0, ZIP.cpdist, ZIP.cpdext, this.zip_bd);
    this.zip_td = h.root;
    this.zip_bd = h.m;

    if(this.zip_bd == 0 && nl > 257) {   // lengths but no distances
	// **incomplete distance tree**
	return -1;
    }

    if(h.status == 1) {
	;// **incomplete distance tree**
    }
    if(h.status != 0)
	return -1;

    // decompress until an end-of-block code
    return this.inflateCodes(buff, off, size);
}


zip.prototype.inflateInternal=function(buff,off,size) {
	// decompress an inflated entry
	var n,i;

	n=0;
	while(n<size) {
		if(this.eof&&this.method==-1)
			return n;

		if(this.copyLen>0) {
			if(this.method!=this.STORED_BLOCK) {
				// STATIC_TREES or DYN_TREES
				while(this.copyLen>0&&n<size) {
					this.copyLen--;
					this.zip_copy_dist&= 32767/*this.WSIZE-1*/;
					this.wp&=32767 /*this.WSIZE-1*/;
					buff[off+n++]=this.slide[this.wp++]=
					this.slide[this.zip_copy_dist++];
				}
			} else {
				while(this.copyLen>0&&n<size) {
					this.copyLen--;
					this.wp&=32767/*this.WSIZE-1*/;
					
					buff[off+n++]=this.slide[this.wp++]=this.ngb(8);
					this.dumpBits(8);
				}
				if(this.copyLen==0)
					this.method=-1; // done
			}
			if(n==size)
				return n;
		}

		if(this.method==-1) {
			if(this.eof)
				break;

			// read in last block bit
			
			if(this.ngb(1)!=0)
				this.eof=true;
			this.dumpBits(1);

			// read in block type
			
			this.method=this.ngb(2);
			this.dumpBits(2);
			this.tl=null;
			this.copyLen=0;
		}

		switch(this.method) {
			case 0: // this.zip_STORED_BLOCK
				i=this.inflateStored(buff,off+n,size-n);
				break;

			case 1: // this.zip_STATIC_TREES
				if(this.tl!=null)
					i=this.inflateCodes(buff,off+n,size-n);
				else
					i=this.inflateFixed(buff,off+n,size-n);
				break;

			case 2: // this.zip_DYN_TREES
				if(this.tl!=null)
					i=this.inflateCodes(buff,off+n,size-n);
				else
					i=this.inflateDynamic(buff,off+n,size-n);
				break;

			default: // error
				i=-1;
				break;
		}

		if(i==-1) {
			if(this.eof)
				return 0;
			return -1;
		}
		n+=i;
	}
	return n;
}


zip.prototype.inflateBin=function(size){
	var i,j=0,last_zip_inflate_pos=-1,u8=new Uint8Array(size);
	while((i=this.inflateInternal(u8,j=0,size))>0&&
	  last_zip_inflate_pos!=this.pos) {
		last_zip_inflate_pos=this.pos;
		j+=i;
	}
	return u8;
}

var LZMA = LZMA || {};
LZMA.decompress = function(properties, inStream, outStream, outSize) 
{ 
  var z=new zip(inStream.data,inStream.offset);
  var buffer=z.inflateBin(outSize);
  inStream.offset+=(z.pos+4);
  //var data= new DataView(buffer);
  for(var i=0;i<outSize;i++)
	outStream.writeByte(buffer[i]);

}

