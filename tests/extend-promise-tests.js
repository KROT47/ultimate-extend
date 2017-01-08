'use strict';

/* --------------------------------- Required Modules --------------------------------- */

const Extend = require( '../' );

const TestHelpers = require( './test-helpers' );


/* --------------------------------- Test Helpers --------------------------------- */

const deep = { deep: true };
const deepExtend = Extend.decorator( deep );

function getter( option, target, options, name ) {
	return option.call( this, options, target, name )
}
const getterDecorator = Extend.decorator( getter );


/* --------------------------------- Extend.promise Tests --------------------------------- */

module.exports = ({ assert, log, error }) => ({

	tests: [{
		/* ------------ 1 ------------- */

		// info: '',
		test( testIndex ) {
			var config = Extend.config({ deep: true });

			var a = { a: { a: '1' } };

			var b = new Promise( res => res( {
				a: new Promise( res => res( {
					b: new Promise( res => setTimeout( () => res( {
						c: new Promise( res => setTimeout( () => res( {
							d: new Promise( res => setTimeout( () => res( {
								e: new Promise( res => setTimeout( () => res( {
									f: new Promise( res => setTimeout( () => res( {
										g: new Promise( res => setTimeout( () => res( 30 ), 200 ) )
									} ), 200 ) )
								} ), 200 ) )
							} ), 200 ) )
						} ), 200 ) )
					} ), 200 ) )
				} ) )
			} ) );

			var expecting = {
				result: { a: { a: '1', b: { c: { d: { e: { f: { g: 30 } } } } } } }
			};

			return this.run( config, {}, a, b, expecting );
		},
	}, {
		/* ------------ 2 ------------- */

		test( testIndex ) {
			var a = { a: { a: new Promise( resolve => setTimeout( () => resolve( [ '1' ] ), 1000 ) ) } },
				b = { a: { a: [ 2 ], b: new Promise( resolve => setTimeout( () => resolve( 2 ), 1200 ) ) } };

			var expecting = {
				result: { a: { a: [ 2 ], b: 2 } }
			};

			return this.run( true, {}, a, b, expecting );
		}
	}, {
		/* ------------ 3 ------------- */

		test( testIndex ) {
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
				result: { a: { a: [ [ '1' ] ] } }
			};

			return this.run( true, {}, a, b, expecting );
		}
	}, {
		/* ------------ 4 ------------- */

		test( testIndex ) {
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
				result: { a: {} }
			};

			return this.run( false, {}, a, b, expecting );
		}
	}, {
		/* ------------ 5 ------------- */

		test( testIndex ) {
			var configProto = Extend.config({
					deep: true,

					Array: ( first, second ) => first.concat( second ),
				});

			var config = configProto.newConfig({
					Array( first, second ) {
						return first.concat( second ).concat( this.useOrigin( first, second ) )
					},
				});

			var a = { a: { a: [ Promise.resolve( 1 ) ] } },
				b = { a: { a: Promise.resolve( [ 2 ] ) } };

			var expecting = {
				result: { a: { a: [ 1, 2, 1, 2  ] } }
			};

			return this.run( config, {}, a, b, expecting );
		}
	}, {
		/* ------------ 6 ------------- */

		test( testIndex ) {

			var a = {
				obj1: { a: { a: 1 } },

				obj2: { a: { a: 1 } },
			};

			var b = {
				@getterDecorator
				obj1() { return { a: { b: 2 } } },

				@getterDecorator
				@deepExtend
				obj2() { return { a: Promise.resolve({ b: 2 }) } },
			};

			// first extending configs with decorators to get final config
			var expecting = {
				a: a,
				b: b,
				result: {
					obj1: { a: { b: 2 } },
					obj2: { a: { a: 1, b: 2 } },
				},
			};

			return this.run( false, {}, a, b, expecting );
		}
	}],

	run( config, target, a, b, expecting ) {
		// a and b must not change

		expecting.a = expecting.a || TestHelpers.clone( a );
		expecting.b = expecting.b || TestHelpers.clone( b );

		return (
			Extend.promise( config, target, a, b )
				.then( result => {
					try {
						/* ------------ a ------------- */

						log( '--- a ---' );
						log( 'expecting', expecting.a );
						log( 'real     ', a );

						assert(
							TestHelpers.sameProps( a, expecting.a ),
							`options object a was changed`
						);

						/* ------------ b ------------- */

						log( '--- b ---' );
						log( 'expecting', expecting.b );
						log( 'real     ', b );

						assert(
							TestHelpers.sameProps( b, expecting.b ),
							`options object b was changed`
						);

						/* ------------ result ------------- */

						log( '--- result ---' );
						log( 'expecting', expecting.result );
						log( 'real     ', result );

						assert(
							TestHelpers.sameProps( result, expecting.result ),
							`result is incorrect`
						);
					} catch ( e ) {
						error( e );
					}
				} )
		);
	},

});
