'use strict';

/* --------------------------------- Required Modules --------------------------------- */

const DefaultExtend = require( 'extend' );

const Extend = require( '../' );

const TestHelpers = require( './test-helpers' );

const Decorators = require( '../decorators' );
const { deep, getter, concat, concatReverse } = Decorators;
const DecoratorsConfig = Decorators.config;


/* --------------------------------- Extend Tests --------------------------------- */

module.exports = ({ assert, log, error, expectError }) => ({

	tests: [{
		/* ------------ 1 ------------- */

		test( testIndex ) {

			var a = {
				@getter
				str() { return 'test' },

				@deep
				@concat
				arr: [ 1, 2 ],
			};

			var aDecoratorsExtendConfig = {
				__decoratorsConfig: {
					decorators: { str: [ DecoratorsConfig.getter ] },
					configs: { arr: Object.assign( {}, DecoratorsConfig.deep, DecoratorsConfig.concat ) }
				}
			};

			var b = {
				@getter
				obj() { return {} },

				@concatReverse
				arr: [ 3, 4 ],
			};

			var bDecoratorsExtendConfig = {
				__decoratorsConfig: {
					decorators: { obj: [ DecoratorsConfig.getter ] },
					configs: { arr: DecoratorsConfig.concatReverse }
				}
			};

			var expecting = {
				a: DefaultExtend( true, {}, a, aDecoratorsExtendConfig ),
				b: DefaultExtend( true, {}, b, bDecoratorsExtendConfig ),
			    result: {
			    	str: a.str,
			    	obj: b.obj,
			    	arr: b.arr,
			    	__decoratorsConfig: {
			    		decorators: { str: [ DecoratorsConfig.getter ], obj: [ DecoratorsConfig.getter ] },
						configs: { arr: DecoratorsConfig.concatReverse }
			    	}
			    }
			};

			var config = Extend.config({ deep: true, resolve: false });

			this.run( config, {}, a, b, expecting, {
				assert: ( real, expecting ) => TestHelpers.sameProps( true, real, expecting ),
			});
		}
	}, {
		/* ------------ 2 ------------- */

		test( testIndex ) {

			var a = {
				@getter
				str() { return 'test' },

				@concat
				arr: [ 1, 2 ],
			};

			var b = {
				@getter
				obj() { return {} }
			};

			var expecting = {
				a: a,
				b: b,
			    result: { str: 'test', arr: [ 1, 2 ], obj: {} },
			};

			this.run( false, {}, a, b, expecting );
		}
	}, {
		/* ------------ 3 ------------- */

		test( testIndex ) {

			var a = {
				@concatReverse
				arr: [ 1, 2 ],
			};

			var b = {
				@concat
				arr: [ 3, 4 ],
			};

			this.run( false, {}, a, b, {
				a: a,
				b: b,
			    result: { arr: [ 1, 2, 3, 4 ] },
			});

			// reverse
			this.run( false, {}, b, a, {
				a: b,
				b: a,
			    result: { arr: [ 1, 2, 3, 4 ] },
			});
		}
	}, {
		/* ------------ 4 ------------- */

		info: 'config.resolve = false allows to extend decorators, to use produced objects elsewhere',

		test( testIndex ) {

			var a = {
				@getter
				str() { return 'test' },

				@concat
				arr: [ 5, 6 ],
			};

			var aDecoratorsExtendConfig = {
				__decoratorsConfig: {
					decorators: { str: [ DecoratorsConfig.getter ] },
					configs: { arr: DecoratorsConfig.concat }
				}
			};

			var b = {
				str() { return 'test' },

				@concatReverse
				arr: [ 1, 2 ],
			};

			var bDecoratorsExtendConfig = {
				__decoratorsConfig: {
					configs: { arr: DecoratorsConfig.concatReverse }
				}
			};

			// first extending configs with decorators to get final config
			var config = Extend.config({ deep: true, resolve: false });

			var expecting = {
				a: DefaultExtend( true, {}, a, aDecoratorsExtendConfig ),
				b: DefaultExtend( true, {}, b, bDecoratorsExtendConfig ),
			    result: {
			    	str: b.str,
			    	arr: [ 1, 2 ],
			    	__decoratorsConfig: {
						configs: { arr: DecoratorsConfig.concatReverse }
			    	}
			    },
			};

			this.run( config, {}, a, b, expecting, {
				assert: ( real, expecting ) => TestHelpers.sameProps( true, real, expecting ),
				after: result => { b = result },
			});

			// then use final config to extend some object
			var a = {
				arr: [ 3, 4 ]
			};

			this.run( false, {}, a, b, {
				a: a,
				b: b,
			    result: { str: b.str, arr: [ 1, 2, 3, 4 ] },
			});
		}
	}, {
		/* ------------ 5 ------------- */

		info: 'Combinations of functions and configs are allowed in decorators',

		test( testIndex ) {

			var a = {
				obj1: { a: { a: 1 } },

				obj2: { a: { a: 1 } },
			};

			var b = {
				@getter
				obj1() { return { a: { b: 2 } } },

				@getter
				@deep
				obj2() { return { a: { b: 2 } } },
			};

			var expecting = {
				a: a,
				b: b,
			    result: {
			    	obj1: { a: { b: 2 } },
			    	obj2: { a: { a: 1, b: 2 } },
			    },
			};

			this.run( false, {}, a, b, expecting );
		}
	}, {
		/* ------------ 6 ------------- */

		info: 'Decorators must be executed in correct order',

		test( testIndex ) {

			var a = {
				arr: [ 1, 2 ]
			};

			var b = {
				@concat
				@concatReverse
				arr: [ 3, 4 ]
			};

			var expecting = {
				a: a,
				b: b,
			    result: {
			    	arr: [ 1, 2, 3, 4, 1, 2 ]
			    },
			};

			this.run( false, {}, a, b, expecting );
		}
	}, {
		/* ------------ 7 ------------- */

		info: 'Some configs methods are unallowed in decorators',

		test( testIndex ) {

			// with errors
			const decWithError1 = Extend.decorator({ getOption() {} });
			const decWithError2 = Extend.decorator({ getProps() {} });

			expectError( 'decorator error must be thrown', () => {
				var b = {
					@decWithError1
					arr: [ 3, 4 ]
				};
			});

			expectError( 'decorator error must be thrown', () => {
				var b = {
					@decWithError2
					arr: [ 3, 4 ]
				};
			});
		}
	}, {
		/* ------------ 8 ------------- */

		info: 'System properties must be omitted with getProps',

		test( testIndex ) {

			var a = {
				arr: [ 1, 2 ]
			};

			var b = {
				@concat
				arr: [ 3, 4 ]
			};

			var expecting = {
				a: a,
				b: b,
			    result: {
			    	arr: [ 1, 2, 3, 4 ]
			    },
			};

			var config = Extend.config({
				getProps: options => Object.getOwnPropertyNames( options )
			});

			this.run( config, {}, a, b, expecting );
		}
	}],


	/* --------------------------------- Helpers --------------------------------- */

	run( config, target, a, b, expecting, testConfig ) {
		const testDefaultConfig = {
			assert: ( real, expecting ) => TestHelpers.sameProps( real, expecting ),
			after: null, // result => {}
		};

		testConfig = DefaultExtend( true, {}, testDefaultConfig, testConfig );

		// a and b must not change
		expecting.a = expecting.a || TestHelpers.clone( a );
		expecting.b = expecting.b || TestHelpers.clone( b );

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
					Extend( target, a, b ) :
					Extend( config, target, a, b );

    	result = TestHelpers.valueOf( result );

		log( '--- result ---' );
		log( 'expecting', TestHelpers.valueOf( expecting.result ) );
		log( 'real     ', TestHelpers.valueOf( result ) );

		assert( testConfig.assert( result, expecting.result ), `result is incorrect` );

		if ( typeof testConfig.after === 'function' ) testConfig.after( result );
	},

});
