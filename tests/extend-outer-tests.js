'use strict';

/* --------------------------------- Required Modules --------------------------------- */

const Extend = require( '../' );

const TestHelpers = require( './test-helpers' );


/* --------------------------------- Extend.outer Tests --------------------------------- */

module.exports = ({ assert, log, error }) => ({

	tests: [{
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

			this.run( config, target, a, b, expecting );
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

			this.run( false, target, a, b, expecting );
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

		var result = Extend.outer( config, target, a, b );
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
