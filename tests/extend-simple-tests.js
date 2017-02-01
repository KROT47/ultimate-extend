'use strict';

/* --------------------------------- Required Modules --------------------------------- */

const Extend = require( '../' );

const TestHelpers = require( './test-helpers' );


/* --------------------------------- Extend Tests --------------------------------- */

module.exports = ({ assert, log, error }) => ({

	tests: [{
		/* ------------ 1 ------------- */

		test( testIndex ) {
			var a = { a: { a: '1' } };

			var b = { a: { b: 2 } };

			var expecting = {
			    result: { a: { b: 2 } }
			};

			this.run( undefined, {}, a, b, expecting );
			this.run( false, {}, a, b, expecting );
		}
	}, {
		/* ------------ 2 ------------- */

		test( testIndex ) {

			var a = { a: { a: '1' } };

			var b = { a: { b: 2 }, b: { c: 3 } };

			var expecting = {
			    result: { a: { a: '1', b: 2 }, b: { c: 3 } }
			};

			this.run( true, {}, a, b, expecting );
		}
	}, {
		/* ------------ 3 ------------- */

		test( testIndex ) {
			var config = Extend.config( {
			    deep: true
			} );

			var a = { a: { a: { b: '1' } } };

			var b = { a: { a: { c: 3 } } };

			var expecting = {
			    result: { a: { a: { b: '1', c: 3 } } }
			};

			this.run( config, {}, a, b, expecting );
		}
	}, {
		/* ------------ 4 ------------- */

		test( testIndex ) {
			var config = Extend.config( {
			    deep: true,

			    Array: ( first, second ) => first.concat( second )
			} );

			var a = { a: { a: { b: [ '1' ] } } };

			var b = { a: { a: { b: [ 3 ] } } };

			var expecting = {
			    result: { a: { a: { b: [ '1', 3 ] } } }
			};

			this.run( config, {}, a, b, expecting );
		}
	}, {
		/* ------------ 5 ------------- */

		test( testIndex ) {

			var config = Extend.config();

			var a = { a: { a: { b: [ '1' ] } }, b: { b: 1 } };

			var b = { a: { a: { b: [ 3 ] } }, b: { b: 2 } };

			var expecting = {
			    result: { a: { a: { b: [ 3 ] } }, b: { b: 2 } }
			};

			this.run( config, {}, a, b, expecting );

		}
	}, {
		/* ------------ 6 ------------- */

		test( testIndex ) {

			var getSecondFunc = ( options, name ) => options[ name ];

			var a = Extend.config( { deep: true } ),
			    b = Extend.config( { getSecond: getSecondFunc } );

			var expecting = {
			    a: Extend.config( TestHelpers.clone( a ) ),
			    b: Extend.config( TestHelpers.clone( b ) ),
			    result: Extend.config( { deep: true, getSecond: getSecondFunc } )
			};

			this.run( false, Extend.config(), a, b, expecting );
		}
	}, {
		/* ------------ 7 ------------- */

		test( testIndex ) {

			var a = { a: { a: { a: null, b: 1 } } },
			    b = { a: { a: { b: null } } };

			var expecting = {
			    result: { a: { a: { a: null, b: null } } }
			};

			this.run( true, {}, a, b, expecting );
		}
	}, {
		/* ------------ 8 ------------- */

		test( testIndex ) {

			var config = Extend.config( {
			    deep: true,

			    Array( first, second, name ) {
		            var arr = first.concat( second );

		            arr.push( name, this.applyOrigin( arguments ) );

		            return arr;
		        }
			} );

			var a = { a: [ '1' ] };

			var b = { a: [ 3 ] };

			var expecting = {
			    result: { a: [ '1', 3, 'a', [ 3 ] ] }
			};

			this.run( config, {}, a, b, expecting );
		}
	}, {
		/* ------------ 9 ------------- */

		test( testIndex ) {

			var config = Extend.config( {
			    deep: true
			} );

			var cache = { a: 2 };

			var target = { cache: cache };

			var a = { cache: { b: 3 } };

			var b = { a: [ 3 ] };

			var expecting = {
			    result: { a: [ 3 ], cache: { a: 2, b: 3 } }
			};

			this.run( config, target, a, b, expecting, result => {
			    return result.cache === cache || 'target inner object got replaced';
			} );
		}
	}, {
		/* ------------ 10 ------------- */

		test( testIndex ) {
			var configProtoProto = Extend.config( {
			    getSecond( options, name, target ) {
			        return options[ name ] + this.applyOrigin( arguments ) + 1;
			    }
			} );

			var configProto = configProtoProto.newConfig({
			    getSecond( options, name, target ) {
			        return options[ name ] + this.applyOrigin( arguments ) + 2;
			    }
			});

			var config = configProto.newConfig({
			    getSecond( options, name, target ) {
			        return options[ name ] + this.applyOrigin( arguments ) + 3;
			    }
			});

			var target = {};

			var a = { a: 1 };

			var b = undefined;

			var expecting = {
			    result: { a: 10 }
			};

			this.run( config, target, a, b, expecting );
		}
	}, {
		/* ------------ 11 ------------- */

		test( testIndex ) {

			var config = Extend.config({
				deep: true,

			    getSecond( options, name, target ) {
			    	target.level = this.level;
			        return options[ name ];
			    }
			});

			var target = {};

			var a = { a: { a: { a: 1 } } };

			var b = { a: { a: { a: 2 } } };

			var expecting = {
			    result: { level: 0, a: { level: 1, a: { level: 2, a: 2 } } }
			};

			this.run( config, target, a, b, expecting );
		}
	}, {
		/* ------------ 12 ------------- */

		test( testIndex ) {

			var config = Extend.config({
				deep: true,

				getSecond( options, name, target ) {
			    	if ( this.test && this.helpers.getType( options[ name ] ) === 'Object' ) {
			    		return Object.assign( {}, options[ name ], this.test );
			    	}

			        return options[ name ];
			    },

		    	Object( first, second, name ) {
		    		var config = this;

			    	if ( config.level ) config = config.newConfig({ test: { test: 2 } });

			        return config.applyOrigin( arguments );
			    },

			    Array( first, second, name ) {
			    	return this.getOrigin().Array.apply( this, arguments );
			    }
			});

			var target = {};

			var a = { a: { b: { c: 1, d: [ 1 ], e: { f: 1 } } } };

			var b = { a: { b: { c: 2, d: [ 2 ], e: { f: 2 } } } };

			var expecting = {
			    result: { a: { b: { c: 2, d: [ 2 ], e: { test: 2, f: 2 } } } }
			};

			this.run( config, target, a, b, expecting );

		}
	}, {
		/* ------------ 13 ------------- */

		test( testIndex ) {

			var configProto = Extend.config({
				String: ( first, second, name ) => {
					return first + second;
				},
			});

			var config = configProto.newConfig({
				String( first, second, name ) {
		    		return this.applyOrigin( arguments, {
		    			1: second === 'b' ? 'a' : second
		    		});
			    },
			});

			var target = {};

			var a = { a: 'a' };

			var b = { a: 'b' };

			var expecting = {
			    result: { a: 'aa' }
			};

			this.run( config, target, a, b, expecting );

		}
	}, {
		/* ------------ 14 ------------- */

		test( testIndex ) {

			var test = function ( first, second, name ) {
				var config = this;

				if ( name === 'events' ) config = config.newConfig({ _isEvent: true });

				return config.applyOrigin( arguments );
			};

			var config = Extend.config({
				deep: true,

				Object: test,
				Array: test,

				Function( first, second, name ) { return this.applyOrigin( arguments ) },
			});

			var target = {};

			var func1 = function () {};
			var func2 = function () {};

			var a = { events: { a: func1 } };

			var b = { events: { a: func2 } };

			var expecting = {
			    result: { events: { a: func2 } }
			};

			this.run( config, target, a, b, expecting );

		}
	}, {
		/* ------------ 15 ------------- */

		test( testIndex ) {

			var config = Extend.config({
				deep: true,

				getProps() {
					if ( !this.global.store ) this.global.store = { _a: 0 };

					return this.applyOrigin( arguments );
				},

				Object( first, second, name ) {
					this.global.store._a++;

					return Object.assign( {
						_a: this.global.store._a,
					}, this.applyOrigin( arguments ) );
				},
			});

			var target = {};

			var a = { a: { b: {} }, c: { d: {} } };

			var b = { a: { b: {} }, c: { d: {} } };

			var expecting = {
			    result: { a: { _a: 3, b: { _a: 4 } }, c: { _a: 1, d: { _a: 2 } } }
			};

			this.run( config, target, a, b, expecting );

		}
	}, {
		/* ------------ 16 ------------- */

		test( testIndex ) {

			var config = Extend.config({
				deep: true,

				getProps() {
					if ( !this.local.a ) this.local.a = 0;

					return this.applyOrigin( arguments );
				},

				Object( first, second, name ) {
					this.local.a++;

					return Object.assign( {
						_a: this.local.a,
					}, this.applyOrigin( arguments ) );
				},
			});

			var target = {};

			var a = { a: { b: {} }, c: { d: {} } };

			var b = { a: { b: {} }, c: { d: {} } };

			var expecting = {
			    result: { a: { _a: 2, b: { _a: 3 } }, c: { _a: 1, d: { _a: 2 } } }
			};

			this.run( config, target, a, b, expecting );
		}
	}, {
		/* ------------ 17 ------------- */

		test( testIndex ) {
			var a = { a: { a: '1' } };

			var b = { a: [ 1, 2 ] };

			var expecting = {
			    result: { a: { a: '1', 1: 1, 2: 2 } }
			};

			var config = Extend.config({
				deep: true,

				ObjectArray( first, second, name ) {
					const obj = {};

					for ( var i = 0; i < second.length; ++i ) obj[ second[ i ] ] = second[ i ];

					return this.applyMethod( 'extendProp', arguments, {
						1: obj
					});
				}
			});

			this.run( config, {}, a, b, expecting );
		}
	}],

	run( config, target, a, b, expecting, func ) {
		// a and b must not change
		expecting.a = expecting.a || TestHelpers.clone( a );
		expecting.b = expecting.b || TestHelpers.clone( b );


		/* ------------ a ------------- */

		log( '--- a ---' );
		log( 'expecting', TestHelpers.valueOf( expecting.a ) );
		log( 'real     ', TestHelpers.valueOf( a ) );

		assert( TestHelpers.sameProps( a, expecting.a ), `options object a was changed` );


		/* ------------ b ------------- */

		log( '--- b ---' );
		log( 'expecting', TestHelpers.valueOf( expecting.b ) );
		log( 'real     ', TestHelpers.valueOf( b ) );

		assert( TestHelpers.sameProps( b, expecting.b ), `options object b was changed` );


		/* ------------ result ------------- */

		var result =
				config === undefined ?
					Extend( target, a, b ) :
					Extend( config, target, a, b );

    	result = TestHelpers.valueOf( result );

		log( '--- result ---' );
		log( 'expecting', TestHelpers.valueOf( expecting.result ) );
		log( 'real     ', TestHelpers.valueOf( result ) );

		assert( TestHelpers.sameProps( result, expecting.result ), `result is incorrect` );

		if ( typeof func === 'function' ) {
	        var funcResult = func( result );

	        assert( typeof funcResult === 'boolean', `${funcResult}` );
	    }
	},

});
