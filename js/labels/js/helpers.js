 
 function extend ( obj ) {
	 Array.prototype.slice.call( arguments, 1 ).forEach( function ( source ) {
		 
		 if ( source ) {
			 for ( var prop in source ) {
				 if ( source[ prop ] && source[ prop ].constructor === Object ) {
					 if ( !obj[ prop ] || obj[ prop ].constructor === Object ) {
						 obj[ prop ] = obj[ prop ] || {};
						 extend( obj[ prop ], source[ prop ] );
					 } else {
						 obj[ prop ] = source[ prop ];
					 }
				 } else {
					 obj[ prop ] = source[ prop ];
				 }
			 }
			 
			 if ( typeof source !== 'object' )
				 obj = source;
		 }
		 
		 
	 } );
	 return obj;
 }
 
 
 
 var Vec2 = function(x, y){
	 this.x = x;
	 this.y = y;
 }
 
 Vec2.prototype = {
	 toString : function(){
		 return this.x+","+this.y+" "
	 },
	 
	 clone : function(){
		 return new Vec2( this.x, this.y );
	 }
 }
