'use strict';

/* --------------------------------- Required Modules --------------------------------- */

const Extend = require( '../' );

const Helpers = require( '../helpers' );

const TestHelpers = require( './test-helpers' );

const Decorators = require( '../decorators' );

const { deep, dependsOn, getter, skip, concat, concatReverse } = Decorators;

const DecoratorsConfig = Decorators._defaultConfig;


/* --------------------------------- Extend Tests --------------------------------- */

module.exports = ({ assert, log, error, expectError }) => ({

	tests: [{
		/* ------------ 1 ------------- */

		info: 'testing when all options objects have decorators',

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
						decorators: { str: [ DecoratorsConfig.getter.func ] },
						configs: { arr: Object.assign( {}, DecoratorsConfig.deep.config, DecoratorsConfig.concat.config ) }
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
						decorators: { obj: [ DecoratorsConfig.getter.func ] },
						configs: { arr: DecoratorsConfig.concatReverse.config }
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
				    			str: [ DecoratorsConfig.getter.func ],
				    			obj: [ DecoratorsConfig.getter.func ]
				    		},
							configs: { arr: DecoratorsConfig.concatReverse.config }
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

			/* ------------ Check that a decoratorsConfig was not changed ------------- */


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
				obj( target, options, name ) { return {} },
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

		info: 'testing when second options object has no decorators',

		test( testIndex ) {

			var a = {
				@concat
				arr: [ 1, 2 ],

				@getter
				str( target, options, name ) { return 'test' },

				@getter
				obj: ( target, options, name ) => { return {} },
			};

			var aDecoratorsExtendConfig = Object.create( Object.prototype, {
				__decoratorsConfig: {
					value: {
						decorators: {
							str: [ DecoratorsConfig.getter.func ],
							obj: [ DecoratorsConfig.getter.func ],
						},
						configs: { arr: DecoratorsConfig.concat.config }
					},
					configurable: true
				}
			});

			var b = {
				str: 'asd',
			};

			var expecting = {
				a: Helpers.extendAll( {}, a, aDecoratorsExtendConfig ),
				b: b,
			    result: Object.assign( Object.create( Object.prototype, {
			    	__decoratorsConfig: {
			    		value: {
				    		decorators: {
								obj: [ DecoratorsConfig.getter.func ],
							},
							configs: { arr: DecoratorsConfig.concat.config }
						},
						configurable: true
			    	}
			    }), { arr: a.arr, str: b.str, obj: a.obj })
			};

			var resultOptions;

			this.run( false, {}, a, b, expecting, {
				extend: Extend.asIs,
				assert: ( real, expecting ) => TestHelpers.sameProps( true, real, expecting ),
				after: result => { resultOptions = result },
			});


			/* ------------ Check that config gives correct result ------------- */

			var expecting = {
				a: {},
				b: resultOptions,
			    result: { arr: a.arr, str: 'asd', obj: {} },
			};

			this.run( false, {}, expecting.a, resultOptions, expecting );


			/* ------------ Check that origin config was not changed ------------- */

			var b = {};

			var expecting = {
				a: Helpers.extendAll( {}, a, aDecoratorsExtendConfig ),
				b: b,
			    result: Object.assign( Object.create( Object.prototype, {
			    	__decoratorsConfig: {
			    		value: {
				    		decorators: {
				    			str: [ DecoratorsConfig.getter.func ],
								obj: [ DecoratorsConfig.getter.func ],
							},
							configs: { arr: DecoratorsConfig.concat.config }
						},
						configurable: true
			    	}
			    }), { arr: a.arr, str: a.str, obj: a.obj })
			};

			var resultOptions;

			this.run( false, {}, a, b, expecting, {
				extend: Extend.asIs,
				assert: ( real, expecting ) => TestHelpers.sameProps( true, real, expecting ),
				after: result => { resultOptions = result },
			});
		}
	}, {
		/* ------------ 4 ------------- */

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
		/* ------------ 5 ------------- */

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
						decorators: { str: [ DecoratorsConfig.getter.func ] },
						configs: { arr: DecoratorsConfig.concat.config }
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
						configs: { arr: DecoratorsConfig.concatReverse.config }
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
				    		configs: { arr: DecoratorsConfig.concatReverse.config }
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
		/* ------------ 6 ------------- */

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
		/* ------------ 7 ------------- */

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
		/* ------------ 8 ------------- */

		info: 'Some configs methods are unallowed in decorators',

		test( testIndex ) {

			// with errors
			const decWithError1 = Extend.decorator({ config: { getOption() {} } });
			const decWithError2 = Extend.decorator({ config: { getProps() {} } });

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
		/* ------------ 9 ------------- */

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
		/* ------------ 10 ------------- */

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
		/* ------------ 11 ------------- */

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
	}, {
		/* ------------ 12 ------------- */

		info: 'Check that config saves all user defined properties in deep iterations',

		test( testIndex ) {

			var a = {
				a: { b: { c1: 1 } },
				a1: { b1: { c1: 1 } },
			};

			var b = {
				@deep
				a: { b: { c2: 1 } },
				@deep
				a1: { b1: { c2: 1 } },
			};

			var expecting = {
				a: a,
				b: b,
			    result: {
			    	a: {
			    		counter: 3,
						b: {
			    			counter: 4,
							c1: 1,
							c2: 1
						}
					},
					a1: {
						counter: 1,
						b1: {
			    			counter: 2,
							c1: 1,
							c2: 1
						}
					}
			    },
			};

			var config = Extend.config({
				Object( first, second, name ) {
					if ( !this.global._counter ) this.global._counter = 0;
					this.global._counter++;

					return Object.assign( {
						counter: this.global._counter
					}, this.applyOrigin( arguments ));
				}
			});

			this.run( config, {}, a, b, expecting );
		}
	}, {
		/* ------------ 13 ------------- */

		info: 'Extend asIs with @dependsOn',

		test( testIndex ) {
			var a = {
				@getter
				host( target, options, name ) { return `host.com` },

				@getter
				@dependsOn( 'host', 'path' )
				url( target, options, name ) { return `${options.host}${options.path}` },

				@getter
				@dependsOn( 'host' )
				path( target, options, name ) { return `/path` },
			};

			var DependsOnConfig = DecoratorsConfig.dependsOn().configExtension;
			var DependsOnConfigCtx = DependsOnConfig.initCtx();

			var aDecoratorsExtendConfig = Object.create( Object.prototype, {
				__decoratorsConfig: {
					value: {
						decorators: {
							host: [ DecoratorsConfig.getter.func ],
							url: [ DecoratorsConfig.getter.func ],
							path: [ DecoratorsConfig.getter.func ],
						},
						configExtensions: {
							dependsOn: {
								extCtx: Helpers.extendAll( {}, DependsOnConfigCtx, {
									url: [ 'host', 'path' ],
									path: [ 'host' ],
								}),
								getConfig: DependsOnConfig.getConfig
							},
						},
					},
					configurable: true
				}
			});

			var b = {
				@getter
				@dependsOn( 'path' )
				url( target, options, name ) { return `${options.host}${options.path}` },
			};

			var bDecoratorsExtendConfig = Object.create( Object.prototype, {
				__decoratorsConfig: {
					value: {
						decorators: {
							url: [ DecoratorsConfig.getter.func ],
						},
						configExtensions: {
							dependsOn: {
								extCtx: Helpers.extendAll( {}, DependsOnConfigCtx, {
									url: [ 'path' ],
								}),
								getConfig: DependsOnConfig.getConfig
							},
						},
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
								host: [ DecoratorsConfig.getter.func ],
								url: [ DecoratorsConfig.getter.func ],
								path: [ DecoratorsConfig.getter.func ],
							},
							configExtensions: {
								dependsOn: {
									extCtx: Helpers.extendAll( {}, DependsOnConfigCtx, {
										url: [ 'path' ],
										path: [ 'host' ],
									}),
									getConfig: DependsOnConfig.getConfig
								},
							},
						},
						configurable: true
					}
			    }), {
			    	host: a.host,
			    	path: a.path,
			    	url: b.url,
			    })
			};

			this.run( false, {}, a, b, expecting, {
				extend: Extend.asIs,
				assert: ( real, expecting ) => TestHelpers.sameProps( true, real, expecting ),
			});
		}
	}, {
		/* ------------ 14 ------------- */

		info: '@dependsOn test',

		test( testIndex ) {
			var a = {
				@getter
				host( target, options, name ) { return `host.com` },

				@getter
				@dependsOn( 'host', 'path' )
				url( target, options, name ) { return `${options.host}${options.path}` },

				@getter
				@dependsOn( 'host' )
				path( target, options, name ) { return `/path` },
			};

			var b = {
				@getter
				query( target, options, name ) { return '?q=node' },

				@getter
				@dependsOn( 'query' )
				url( target, options, name ) {
					return `${target.host}${target.path}${options.query}`
				},
			};

			var expecting = {
				a: a,
				b: b,
				result: {
			    	host: 'host.com',
			    	path: '/path',
			    	query: '?q=node',
			    	url: 'host.com/path?q=node',
			    }
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
