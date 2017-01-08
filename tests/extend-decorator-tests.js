'use strict';

/* --------------------------------- Required Modules --------------------------------- */

const Extend = require( '../' );

const Helpers = require( '../helpers' );

const TestHelpers = require( './test-helpers' );

const Decorators = require( '../decorators' );

const { deep, getter, skip, concat, concatReverse } = Decorators;

const DecoratorsConfig = Decorators._defaultConfig;


/* --------------------------------- Extend Tests --------------------------------- */

module.exports = ({ assert, log, error, expectError }) => ({

	tests: [{
		/* ------------ 1 ------------- */

		info: 'Test Extend.asIs with Extend-decorator generated params',

		test( testIndex ) {

			var a = {
				@getter
				str( target, options, name ) { return 'test' },

				@deep
				@concat
				arr: [ 1, 2 ],
			};

			var aDecoratorsExtendConfig = Object.create( Object.prototype, {
				__decoratorsConfig: {
					value: {
						decorators: { str: [ DecoratorsConfig.getter ] },
						configs: { arr: Object.assign( {}, DecoratorsConfig.deep, DecoratorsConfig.concat ) }
					},
					configurable: true
				}
			});

			var b = {
				@getter
				obj( target, options, name ) { return {} },

				@concatReverse
				arr: [ 3, 4 ],
			};

			var bDecoratorsExtendConfig = Object.create( Object.prototype, {
				__decoratorsConfig: {
					value: {
						decorators: { obj: [ DecoratorsConfig.getter ] },
						configs: { arr: DecoratorsConfig.concatReverse }
					},
					configurable: true
				}
			});

			var expecting = {
				a: Helpers.extendAll( {}, a, aDecoratorsExtendConfig ),
				b: Helpers.extendAll( {}, b, bDecoratorsExtendConfig ),
			    result: Object.assign( Object.create( Object.prototype, {
			    	__decoratorsConfig: {
			    		value: {
				    		decorators: {
				    			str: [ DecoratorsConfig.getter ],
				    			obj: [ DecoratorsConfig.getter ]
				    		},
							configs: { arr: DecoratorsConfig.concatReverse }
						},
						configurable: true
			    	}
			    }), {
			    	str: a.str,
			    	obj: b.obj,
			    	arr: b.arr,
			    })
			};

			this.run( true, {}, a, b, expecting, {
				extend: Extend.asIs,
				assert: ( real, expecting ) => TestHelpers.sameProps( true, real, expecting ),
			});
		}
	}, {
		/* ------------ 2 ------------- */

		test( testIndex ) {

			var a = {
				@getter
				str( target, options, name ) { return 'test' },

				@concat
				arr: [ 1, 2 ],
			};

			var b = {
				@getter
				obj( target, options, name ) { return {} }
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
				str( target, options, name ) { return 'test' },

				@concat
				arr: [ 5, 6 ],
			};

			var aDecoratorsExtendConfig = Object.create( Object.prototype, {
				__decoratorsConfig: {
					value: {
						decorators: { str: [ DecoratorsConfig.getter ] },
						configs: { arr: DecoratorsConfig.concat }
					},
					configurable: true
				}
			});

			var b = {
				str() { return 'test' },

				@concatReverse
				arr: [ 1, 2 ],
			};

			var bDecoratorsExtendConfig = Object.create( Object.prototype, {
				__decoratorsConfig: {
					value: {
						configs: { arr: DecoratorsConfig.concatReverse }
					},
					configurable: true
				}
			});

			// first extending configs with decorators to get final config
			var config = Extend.config({ deep: true, resolve: false });

			var expecting = {
				a: Helpers.extendAll( {}, a, aDecoratorsExtendConfig ),
				b: Helpers.extendAll( {}, b, bDecoratorsExtendConfig ),
				result: Object.assign( Object.create( Object.prototype, {
			    	__decoratorsConfig: {
			    		value: {
				    		configs: { arr: DecoratorsConfig.concatReverse }
						},
						configurable: true
			    	}
			    }), {
			    	str: b.str,
			    	arr: [ 1, 2 ],
			    })
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
				obj1( target, options, name ) { return { a: { b: 2 } } },

				@getter
				@deep
				obj2( target, options, name ) { return { a: { b: 2 } } },
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
	}, {
		/* ------------ 9 ------------- */

		info: 'Test for correct extending as-is',

		test( testIndex ) {

			var a = {
				@concat
				arr: [ 1, 2 ]
			};

			var b = { str: 'asd' };

			var expecting = {
				a: a,
				b: b,
			    result: {
			    	arr: [ 1, 2 ],
			    	str: 'asd'
			    },
			};

			var config = Extend.config({
				resolve: false
			});

			this.run( config, {}, a, b, expecting );
		}
	}, {
		/* ------------ 10 ------------- */

		info: 'Check for correctness of getter arguments',

		test( testIndex ) {

			var a = {
				obj1: { a: { a: 1 } },

				obj2: { a: { a: 1 } },
			};

			var b = {
				@getter
				obj1( target, options, name ) { return options.k },

				@getter
				@deep
				obj2( target, options, name ) { return options.k },

				@skip
				k: { a: { b: 2 } },
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
	}],


	/* --------------------------------- Helpers --------------------------------- */

	run( config, target, a, b, expecting, testConfig ) {
		const testDefaultConfig = {
			extend: Extend,
			assert: ( real, expecting ) => TestHelpers.sameProps( real, expecting ),
			after: null, // result => {}
		};

		testConfig = Helpers.extendAll( {}, testDefaultConfig, testConfig );

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
					testConfig.extend( target, a, b ) :
					testConfig.extend( config, target, a, b );

    	result = TestHelpers.valueOf( result );

		log( '--- result ---' );
		log( 'expecting', TestHelpers.valueOf( expecting.result ) );
		log( 'real     ', TestHelpers.valueOf( result ) );

		assert( testConfig.assert( result, expecting.result ), `result is incorrect` );

		if ( typeof testConfig.after === 'function' ) testConfig.after( result );
	},

});
