
/* --------------------------------- Required Modules --------------------------------- */

const Extend = require( 'extend' );

const Helpers = require( '../helpers' );


/* --------------------------------- TestHelpers --------------------------------- */

const TestHelpers = Extend( {}, Helpers, {
	sameProps,
	clone,
});


/* --------------------------------- Module Exports --------------------------------- */

module.exports = TestHelpers;


/* --------------------------------- Helpers --------------------------------- */

/**
 * Deeply checks if two objects have same properties and values
 * @param (Boolean?) allProps - if true then all even non-enumerable properties will be checked
 * @param (Object) first
 * @param (Object) second
 * @return (Boolean)
 */
// function sameProps( allProps, first, second ) {
// 	var end = arguments[ 3 ]; // tells that is final second to first comparison

// 	if ( typeof allProps !== 'boolean' ) {
// 		second = first;
// 		first = allProps;
// 		allProps = false;
// 	}

// 	first = TestHelpers.valueOf( first );
// 	second = TestHelpers.valueOf( second );

// 	if ( !first || !second ) return console.log(1) || first === second;

// 	if ( typeof first === 'object' ) {
// 		const propNames = allProps ? Object.getOwnPropertyNames( first ) : Object.keys( first );
// 		var prop, type, i, firstValue, secondValue;

// 		for ( i = propNames.length; i--; ) {
// 			prop = propNames[ i ];

// 			if ( !first.__isDescriptor ) {
// 				firstValue = getDescriptor( first, prop );
// 				secondValue = getDescriptor( second, prop );
// 			} else {
// 				firstValue = first[ prop ];
// 				secondValue = second[ prop ];
// 			}

// 			type = typeof firstValue;

// 			if ( type !== typeof secondValue ) return console.log(2) || false;

// 			if ( type === 'object' ) {
// // console.log('>?>?>',prop);
// 				if ( !sameProps( allProps, firstValue, secondValue ) ) return console.log(3) || false;
// 				continue;
// 			}
// // console.log(prop,firstValue, secondValue, firstValue === secondValue);
// 			if ( firstValue !== secondValue ) return console.log(4) || false;
// 		}
// 	} else {
// 		if ( first !== second ) return console.log(5) || false;
// 	}

// 	return console.log(6, end) || ( end ? true : sameProps( allProps, second, first, true ) );
// }

function sameProps( allProps, first, second ) {
	var prop, type, i, firstValue, secondValue;

	if ( typeof allProps !== 'boolean' ) {
		second = first;
		first = allProps;
		allProps = false;
	}

	first = TestHelpers.valueOf( first );
	second = TestHelpers.valueOf( second );

	if ( !first || !second ) return /*console.log(1) ||*/ first === second;

	if ( ( type = typeof first ) !== typeof second ) return /*console.log(2) ||*/ false;

	if ( type === 'object' ) {
		const firstPropNames = allProps ? Object.getOwnPropertyNames( first ) : Object.keys( first );
		const propNames = allProps ? Object.getOwnPropertyNames( second ) : Object.keys( second );

		if ( firstPropNames.length !== propNames.length ) {
			return /*console.log(3) ||*/ false;
		}

		for ( i = propNames.length; i--; ) {
			prop = propNames[ i ];

			if ( !first.__isDescriptor ) {
				firstValue = getDescriptor( first, prop );
				secondValue = getDescriptor( second, prop );
			} else {
				firstValue = first[ prop ];
				secondValue = second[ prop ];
			}

			type = typeof firstValue;

			if ( type !== typeof secondValue ) return /*console.log(4) ||*/ false;

			switch ( type ) {
				case 'object':
					if ( !sameProps( allProps, firstValue, secondValue ) ) {
						return /*console.log(5) ||*/ false;
					}
				break;

				case 'function':
					if ( firstValue.toString() !== secondValue.toString() ) {
						return /*console.log(6) ||*/ false;
					}
				break;

				default:
					if ( firstValue !== secondValue ) return /*console.log(7) ||*/ false;
			}
		}
	} else {
		if ( first !== second ) return /*console.log(8) ||*/ false;
	}

	return /*console.log(9) ||*/ true;
}

function clone( obj ) {
	return obj && Extend( true, TestHelpers.newObject( obj ), TestHelpers.valueOf( obj ) ) || obj;
}

function getDescriptor( obj, propName ) {
	const descr = Object.getOwnPropertyDescriptor( obj, propName );

	if ( !descr ) return;

	descr.__isDescriptor = true;

	return descr;
}
