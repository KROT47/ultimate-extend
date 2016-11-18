'use strict';

/* --------------------------------- Required Modules --------------------------------- */

const DefaultExtend = require( 'extend' );

const Extend = require( './' );


/* --------------------------------- Extend Tests --------------------------------- */

/* ------------ Preparing ------------- */

var i = 1;
var runTest = function ( config, target, a, b, expecting, func, extend ) {
	extend = extend || Extend;

	var result = extend( config, target, a, b );

	a = a.valueOf();
	b = b.valueOf();
	result = result.valueOf();

// console.log('a', a.valueOf(), expecting.a.valueOf());
	console.assert(
		sameProps( a, expecting.a.valueOf() ),
		`${i}: options object a was changed`
	);

// console.log('b', b.valueOf(), expecting.b.valueOf());
	console.assert(
		sameProps( b, expecting.b.valueOf() ),
		`${i}: options object b was changed`
	);

// console.log('result', result.valueOf(), expecting.result.valueOf());
	console.assert(
		sameProps( result, expecting.result.valueOf() ),
		`${i}: result is incorrect`
	);

	if ( typeof func === 'function' ) {
		var funcResult = func( result );

		console.assert( typeof funcResult === 'boolean', `${i}: ${funcResult}` );
	}

	i++;
}


/* ------------ Tests ------------- */

console.log( 'Extend: Starting Tests...' );

/* ------------ 1 ------------- */

var config = Extend.config({
		deep: true
	});

var a = { a: { a: '1' } };

var b = { a: { b: 2 } };

var expecting = {
		a: clone( a ),
		b: clone( b ),
		result: { a: { a: '1', b: 2 } }
	};

runTest( config, {}, a, b, expecting );


/* ------------ 2 ------------- */

var config = Extend.config({
		deep: true
	});

var a = { a: { a: { b: '1' } } };

var b = { a: { a: { c: 3 } } };

var expecting = {
		a: clone( a ),
		b: clone( b ),
		result: { a: { a: { b: '1', c: 3 } } }
	};

runTest( config, {}, a, b, expecting );


/* ------------ 3 ------------- */

var config = Extend.config({
		deep: true,

		extendSimilar: {
			Array: ( first, second, config, name, originalMethod ) => first.concat( second )
		}
	});

var a = { a: { a: { b: [ '1' ] } } };

var b = { a: { a: { b: [ 3 ] } } };

var expecting = {
		a: clone( a ),
		b: clone( b ),
		result: { a: { a: { b: [ '1', 3 ] } } }
	};

runTest( config, {}, a, b, expecting );


/* ------------ 4 ------------- */

var config = Extend.config();

var a = { a: { a: { b: [ '1' ] } }, b: { b: 1 } };

var b = { a: { a: { b: [ 3 ] } }, b: { b: 2 } };

var expecting = {
		a: clone( a ),
		b: clone( b ),
		result: { a: { a: { b: [ 3 ] } }, b: { b: 2 } }
	};

runTest( config, {}, a, b, expecting );


/* ------------ 5 ------------- */

var getOptionFunc = ( options, name, config ) => options;

var a = Extend.config({ deep: true }),
	b = Extend.config({ getOption: getOptionFunc });

var expecting = {
		a: Extend.config( clone( a ) ),
		b: Extend.config( clone( b ) ),
		result: Extend.config({ deep: true, getOption: getOptionFunc })
	};

runTest( false, Extend.config(), a, b, expecting );


/* ------------ 6 ------------- */

var getOptionFunc = ( options, name, config ) => options;

var a = { a: { a: { a: null, b: 1 } } },
	b = { a: { a: { b: null } } };

var expecting = {
		a: clone( a ),
		b: clone( b ),
		result: { a: { a: { a: null, b: null } } }
	};

runTest( true, {}, a, b, expecting );


/* ------------ 7 ------------- */

var config = Extend.config({
		deep: true,

		extendSimilar: {
			Array: ( first, second, config, name, originalMethod ) => {
				var arr = first.concat( second );
				arr.push( name, originalMethod( first, second, config, name ) );
				return arr;
			}
		}
	});

var a = { a: [ '1' ] };

var b = { a: [ 3 ] };

var expecting = {
		a: clone( a ),
		b: clone( b ),
		result: { a: [ '1', 3, 'a', [ 3 ] ] }
	};

runTest( config, {}, a, b, expecting );


/* ------------ 8 ------------- */

var config = Extend.config({
		deep: true
	});

var cache = { a: 2 };

var target = { cache: cache };

var a = { cache: { b: 3 } };

var b = { a: [ 3 ] };

var expecting = {
		a: clone( a ),
		b: clone( b ),
		result: { a: [ 3 ], cache: { a: 2, b: 3 } }
	};

runTest( config, target, a, b, expecting, result => {
	return result.cache === cache || 'target inner object got replaced';
});


/* ------------ 9 ------------- */

var config = Extend.config({
		deep: true,

		extendSimilar: {
			Array: ( first, second, config ) => first.concat( second )
		}
	});

var target = [ 0, 1 ];

var a = [ 2, 3 ];

var b = [ 4, 5 ];

var expecting = {
		a: clone( a ),
		b: clone( b ),
		result: [ 0, 1, 2, 3, 4, 5 ]
	};

runTest( config, target, a, b, expecting, null, Extend.outer );


/* ------------ End ------------- */

console.log( 'Extend: All Good!!!');






/* --------------------------------- Extend.promise Tests --------------------------------- */

/* ------------ Preparing ------------- */

var i = 0, k = 0;
runTest = function ( config, target, a, b, expecting ) {
	k++;
	let j = ++i;

	Extend.promise( config, target, a, b )
		.then( result => {
			try {
// console.log(j, 'a', a, expecting.a);
// console.log(expecting);
				console.assert( sameProps( a, expecting.a ), `${j}: options object a was changed` );
// console.log(j, 'b', b, expecting.b);

				console.assert( sameProps( b, expecting.b ), `${j}: options object b was changed` );
// console.log(j, 'result', result, expecting.result);
				console.assert( sameProps( result, expecting.result ), `${j}: result is incorrect` );
			} catch ( e ) {
				console.error( e );
			}
		})
		.then( () => {
			if ( !--k ) console.log( 'Extend.promise: All Good!!!');
		});
}


/* ------------ Tests ------------- */

console.log( 'Extend.promise: Starting Tests...' );

var config = Extend.config({
		deep: true
	});

var a = { a: { a: '1' } };

var b = new Promise( res => res({
		a: new Promise( res => res({
			b: new Promise( res => setTimeout( () => res({
				c: new Promise( res => setTimeout( () => res({
					d: new Promise( res => setTimeout( () => res({
						e: new Promise( res => setTimeout( () => res({
							f: new Promise( res => setTimeout( () => res({
								g: new Promise( res => setTimeout( () => res( 30 ), 200 ) )
							}), 200 ) )
						}), 200 ) )
					}), 200 ) )
				}), 200 ) )
			}), 200 ) )
		}))
	}));

var expecting = {
		a: clone( a ),
		b: clone( b ),
		result: { a: { a: '1', b: { c: { d: { e: { f: { g: 30 } } } } } } }
	};

runTest( config, {}, a, b, expecting );


/* ------------ 2 ------------- */

var a = { a: { a: new Promise( resolve => setTimeout( () => resolve( [ '1' ] ), 1000 ) ) } },
    b = { a: { a: [ 2 ], b: new Promise( resolve => setTimeout( () => resolve( 2 ), 1200 ) ) } };

var expecting = {
		a: clone( a ),
		b: clone( b ),
		result: { a: { a: [ 2 ], b: 2 } }
	};

runTest( true, {}, a, b, expecting );


/* ------------ 3 ------------- */

var a = {
		a: {
			a: [
				new Promise(
					resolve => {
						setTimeout( () => resolve( [ Promise.resolve( '1' ) ] ), 1000 )
					}
				)
			]
		}
	},
    b = { a: {} };

var expecting = {
		a: clone( a ),
		b: clone( b ),
		result: { a: { a: [ [ '1' ] ] } }
	};

runTest( true, {}, a, b, expecting );


/* ------------ 4 ------------- */

var a = {
		a: {
			a: [
				new Promise(
					resolve => {
						setTimeout( () => resolve( [ Promise.resolve( '1' ) ] ), 1000 )
					}
				)
			]
		}
	},
    b = { a: {} };

var expecting = {
		a: clone( a ),
		b: clone( b ),
		result: { a: {} }
	};

runTest( false, {}, a, b, expecting );


/* ------------ 5 ------------- */

// var config = Extend.config({
// 		deep: true,

// 		extend: Extend.outer,

// 		extendSimilar: {
// 			Array: ( first, second, config ) => first.concat( second )
// 		}
// 	});

// var target = Promise.resolve( [ 0, 1 ] );

// var a = Promise.resolve( [ 2, 3 ] );

// var b = Promise.resolve( [ 4, 5 ] );

// var expecting = {
// 		a: a,
// 		b: b,
// 		result: [ 0, 1, 2, 3, 4, 5 ]
// 	};

// runTest( config, target, a, b, expecting );

/* --------------------------------- Helpers --------------------------------- */

function sameProps( first, second, end ) {
	var type;

	if ( !first && second ) return false;

	if ( typeof first === 'object' ) {
		for ( var i in first ) {
			type = typeof first[ i ];

			if ( !second ) return false;

			if ( type !== typeof second[ i ] ) return false;

			if ( type === 'object' ) {
				if ( !sameProps( first[ i ], second[ i ] ) ) return false;
				continue;
			}

			if ( first[ i ] !== second[ i ] ) return false;
		}
	} else {
		if ( first !== second ) return false;
	}

	return end ? true : sameProps( second, first, true );
}

function clone( obj ) { return DefaultExtend( true, Array.isArray( obj ) ? [] : {}, obj.valueOf() ) }
