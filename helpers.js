
/* --------------------------------- Required Modules --------------------------------- */

const GetType = require( 'get-explicit-type' );


/* --------------------------------- Module Exports --------------------------------- */

module.exports = {

	undefinedMethod,

	protolessClone,

	setupFullInheritance,

	newObject,

	getValueOf,

	getType: GetType
};


/* --------------------------------- Helpers --------------------------------- */

function undefinedMethod( name ) { throw Error( `Extend config method ${name} must be defined` ) }

/**
 * Setups child and all of its properties to be inherited from parent and its properties
 * @param (Object) parent
 * @param (Object) child
 * @return (Object) - child
 */
function setupFullInheritance( parent, child ) {
	Object.setPrototypeOf( child, parent );

	for ( var i in child ) {
		if ( child.hasOwnProperty( i ) && parent[ i ] && typeof child[ i ] === 'object' ) {
			Object.setPrototypeOf( child[ i ], parent[ i ] );
		}
	}

	return child;
}

/**
 * Creates simple clone of some object without its prototype properties
 * @param (Object|Array) obj
 * @param (Boolean) copyHiddenProps - if true - non enumerable props will be copied too
 * @return (Object|Array)
 */
function protolessClone( obj, copyHiddenProps ) {
	const clone = newObject( obj );
	const props = copyHiddenProps ? Object.getOwnPropertyNames( obj ) : Object.keys( obj );

	for ( var i = props.length; i--; ) clone[ props[ i ] ] = obj[ props[ i ] ];

	return clone;
}

// returns empty array or object due to obj type
function newObject( obj ) { return Array.isArray( obj ) ? [] : {} }

/**
 * Returns value of obj if possible
 * @param (Mixed) obj
 * @return (Mixed)
 */
function getValueOf( obj ) { return obj && typeof obj.valueOf === 'function' && obj.valueOf() || obj }
