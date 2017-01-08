'use strict';

/* --------------------------------- Required Modules --------------------------------- */

const Extend = require( '../' );

const TestHelpers = require( './test-helpers' );

const Helpers = require( '../helpers' );


/* --------------------------------- Extend.plugins Tests --------------------------------- */

module.exports = ({ assert, log, error }) => ({

	tests: [{
		/* --------------------------------- Extend.outer --------------------------------- */

		/* ------------ 1 ------------- */

		test( testIndex ) {
			var config = Extend.config( {
			    deep: true,

			    Array: ( first, second ) => first.concat( second ),
			} );

			var target = [ 0, 1 ];

			var a = [ 2, 3 ];

			var b = [ 4, 5 ];

			var expecting = {
			    result: [ 0, 1, 2, 3, 4, 5 ]
			};

			this.run( config, target, a, b, expecting, {
				extend: Extend.outer,
			});
		}
	}, {
		/* ------------ 2 ------------- */

		test( testIndex ) {
			var target = [ 0, 1 ];

			var a = [ 2, 3 ];

			var b = [ 4, 5 ];

			var expecting = {
			    result: [ 4, 5 ]
			};

			this.run( false, target, a, b, expecting, {
				extend: Extend.outer,
			});
		}
	}, {
		/* ------------ 3 ------------- */

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

			this.run( config, target, a, b, expecting, {
				extend: Extend.outer,
			});
		}
	}, {
		/* ------------ 4 ------------- */

		test( testIndex ) {

			var target = {};

			var a = { a: { a: 1 } };

			var b = { a: { a: 2 } };

			var expecting = {
			    result: { a: { a: 2 } }
			};

			this.run( false, target, a, b, expecting, {
				extend: Extend.outer,
			});
		}
	}, {
		/* ------------ 5 ------------- */

		info: 'Check that primary config is parent of new config while running extend',

		test( testIndex ) {

			var getProps = function getProps() {
		    	var config = this.newConfig({
		    		getProps() {
		    			return config.applyOrigin( arguments );
		    		}
		    	});

		    	if ( config.getPrimary().__proto__.getProps._extendConfig !== config.getStatic() ) {
		    		error( 'Primary config must be parent of new config' );
		    	}

		    	return config.applyOrigin( arguments );
		    };

			var config = Extend.config({
				deep: true,

			    getProps,
			});

			var target = {};

			var a = { a: 1 };

			var b = { a: 2 };

			var expecting = {
			    result: { a: 1, a: 2 }
			};

			this.run( config, target, a, b, expecting, {
				extend: Extend.outer,
			});
		}
	}, {
		/* ------------ 6 ------------- */

		info: 'Extend descriptors',

		test( testIndex ) {

			var target = {};

			var aProps = {
				a: { get() { return 'a' } },

				b: { get() { return 'b' } },

				c: { value: 'c' },
			};

			var a = {
				a: Object.create( Object.prototype, aProps ),
			};

			var bProps = {
				a: { value: 'a' },

				b: { get() { return 'b' } },

				c: { get() { return 'c' } },

				d: {
					get() {
						return {
							get e() { return 'e' }
						}
					}
				}
			};

			var b = {
				a: Object.create( Object.prototype, bProps ),
			};

			var expecting = {
			    result: {
					a: Object.create( Object.prototype, {
						a: bProps.a,

						b: bProps.b,

						c: bProps.c,

						d: bProps.d,
					}),
				}
			};

			this.run( true, target, a, b, expecting, {
				extend: Extend.descriptors,
				assert: ( real, expecting ) => TestHelpers.sameProps( true, real, expecting ),
			});

			// part 2 ( resolveGetters: true )

			var config = Extend.config({ deep: true, resolveGetters: true });

			var expecting = {
			    result: {
					a: Object.create( Object.prototype, {
						a: bProps.a,

						b: bProps.b,

						c: bProps.c,

						d: {
							value: bProps.d.get(),
							writable: true,
							enumerable: true,
							configurable: true
						},
					}),
				}
			};

			this.run( config, target, a, b, expecting, {
				extend: Extend.descriptors,
				assert: ( real, expecting ) => TestHelpers.sameProps( true, real, expecting ),
				// after( result ) {
				// 	console.log('>>>',Object.getOwnPropertyDescriptor( result.a, 'd' ));
				// }
			});

		}
	}],

	run( config, target, a, b, expecting, testConfig ) {
		const testDefaultConfig = {
			assert: ( real, expecting ) => TestHelpers.sameProps( real, expecting ),
			after: null, // result => {}
		};

		testConfig = Helpers.extendAll( {}, testDefaultConfig, testConfig );

		// a and b must not change
		expecting.a = expecting.a || Helpers.extendAll( {}, a );
		expecting.b = expecting.b || Helpers.extendAll( {}, b );


		/* ------------ a ------------- */

		log( '--- a ---' );
		log( 'expecting', TestHelpers.valueOf( expecting.a ) );
		log( 'real     ', TestHelpers.valueOf( a ) );

		assert( testConfig.assert( a, expecting.a ), `options object a was changed` );


		/* ------------ b ------------- */

		log( '--- b ---' );
		log( 'expecting', TestHelpers.valueOf( expecting.b ) );
		log( 'real     ', TestHelpers.valueOf( b ) );

		assert( testConfig.assert( b, expecting.b ), `options object b was changed` );


		/* ------------ result ------------- */

		var result =
				config === undefined ?
					testConfig.extend( target, a, b ) :
					testConfig.extend( config, target, a, b );

    	result = TestHelpers.valueOf( result );

		log( '--- result ---' );
		log( 'expecting', TestHelpers.valueOf( expecting.result ) );
		log( 'real     ', TestHelpers.valueOf( result ) );

		if ( typeof testConfig.after === 'function' ) testConfig.after( result );

		assert( testConfig.assert( result, expecting.result ), `result is incorrect` );
	},

});
