
/* --------------------------------- Required Modules --------------------------------- */

const GetType = require( 'get-explicit-type' );


/* --------------------------------- Module Exports --------------------------------- */

module.exports = {

	undefinedMethod,

	simpleExtend,

	newObject,

	getComplexObject,

	isComplexObject,

	getValueOf,

	getType: GetType
};


/* --------------------------------- Helpers --------------------------------- */

function undefinedMethod( name ) { throw Error( `Extend config method ${name} must be defined` ) }

function simpleExtend( target, obj ) {
	var type, i, newTarget;

	for ( i in obj ) {
		type = typeof target[ i ];

		if ( type === typeof obj[ i ] && type === 'object' ) {
			newTarget = simpleExtend( newObject( target[ i ] ), target[ i ] );

			target[ i ] = simpleExtend( newTarget, obj[ i ] );
		} else {
			target[ i ] = obj[ i ];
		}
	}

	return target;
}

// returns empty array or object ue to obj type
function newObject( obj, strict ) {
	if ( strict && typeof obj === 'function' ) {
		return function () { return obj.apply( this, arguments ) };
	}

	return Array.isArray( obj ) ? [] : {};
}

/**
 * Returns obj if it is complex object ( Object, Array, Function )
 * @param (Mixed) obj
 * @return (Object|Array|Function|false)
 */
function getComplexObject( obj ) {
	obj = getValueOf( obj );

	return isComplexObject( obj ) && obj;
}

/**
 * Tells if obj is complex object
 * @param (Mixed) obj
 * @return (Boolean)
 */
function isComplexObject( obj ) {
	const type = typeof obj;

	return type === 'object' || type === 'function';
}

/**
 * Returns value of obj if possible
 * @param (Mixed) obj
 * @return (Mixed)
 */
function getValueOf( obj ) { return typeof obj.valueOf === 'function' && obj.valueOf() || obj }
