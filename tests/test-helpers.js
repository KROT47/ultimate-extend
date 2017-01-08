
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
function sameProps( allProps, first, second ) {
	var prop, type, i, firstValue, secondValue;

	if ( typeof allProps !== 'boolean' ) {
		second = first;
		first = allProps;
		allProps = false;
	}

	first = TestHelpers.valueOf( first );
	second = TestHelpers.valueOf( second );

	if ( !first || !second ) return first === second;

	if ( ( type = typeof first ) !== typeof second ) return false;

	if ( type === 'object' ) {
		const firstPropNames = allProps ? Object.getOwnPropertyNames( first ) : Object.keys( first );
		const propNames = allProps ? Object.getOwnPropertyNames( second ) : Object.keys( second );

		if ( firstPropNames.length !== propNames.length ) return false;

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

			if ( type !== typeof secondValue ) return false;

			switch ( type ) {
				case 'object':
					if ( !sameProps( allProps, firstValue, secondValue ) ) {
						return false;
					}
				break;

				case 'function':
					if ( firstValue.toString() !== secondValue.toString() ) {
						return false;
					}
				break;

				default:
					if ( firstValue !== secondValue ) return false;
			}
		}
	} else {
		if ( first !== second ) return false;
	}

	return true;
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
