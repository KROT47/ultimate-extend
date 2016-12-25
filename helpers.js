
/* --------------------------------- Required Modules --------------------------------- */

const Extend = require( './' );

const GetType = require( 'get-explicit-type' );


/* --------------------------------- Module Exports --------------------------------- */

module.exports = {

	undefinedMethod,

	protolessClone,

	fullClone,

	extendAll,

	newObject,

	valueOf,

	getAllProtos,

	getProto,

	getDeepestProto,

	defineOrExtend,

	define,

	arrayPush,

	arrayUnshift,

	isFirstUpperCased,

	getType: GetType,
};


/* --------------------------------- Helpers --------------------------------- */

function undefinedMethod( name ) { throw Error( `Extend config method ${name} must be defined` ) }

/**
 * Creates simple clone of some object without its prototype properties
 * @param (Object|Array) obj
 * @param (Boolean) copyHiddenProps - if true - non enumerable props will be copied too
 * @return (Object|Array)
 */
function protolessClone( obj, copyHiddenProps ) {
	const clone = newObject( obj );
	const props = copyHiddenProps ? Object.getOwnPropertyNames( obj ) : Object.keys( obj );

	for ( var i = props.length; i--; ) {
		Object.defineProperty(
			clone,
			props[ i ],
			Object.getOwnPropertyDescriptor( obj, props[ i ] )
		);
	}

	return clone;
}

/**
 * Creates full nondeep clone with clone of each object in prototypes chain with nonenumerable props
 * @param (Object|Array) obj
 * @return (Object|Array)
 */
function fullClone( obj ) {
	const protos = getAllProtos( obj, proto => proto !== Object.prototype );
	var clone = protolessClone( protos.pop(), true );
	var temp;

	for ( var i = protos.length; i--; ) {
		temp = protolessClone( protos[ i ], true );

		Object.setPrototypeOf( temp, clone );

		clone = temp;
	}

	return clone;
}

/**
 * Extends all properties
 * @param (Object|Array) obj
 * @param (Object|Array) ...options
 * @return (Object|Array)
 */
function extendAll( target/*, options1, ...*/ ) {
	var props, i, k;

	for ( i = 1; i < arguments.length; ++i ) {
		props = Object.getOwnPropertyNames( arguments[ i ] );

		for ( k = props.length; k--; ) target[ props[ k ] ] = arguments[ i ][ props[ k ] ];
	}

	return target;
}

// returns empty array or object due to obj type
function newObject( obj ) { return Array.isArray( obj ) ? [] : {} }

/**
 * Returns value of obj if possible
 * @param (Mixed) obj
 * @return (Mixed)
 */
function valueOf( obj ) { return obj && typeof obj.valueOf === 'function' && obj.valueOf() || obj }

/**
 * Returns array of prototypes from obj for as long as condition is satisfied
 * @param (Mixed) obj
 * @param (Function) condition
 * @return (Array)
 */
function getAllProtos( obj, condition ) {
	const protos = [ obj ];
	var proto = obj;

	while (
		( proto = Object.getPrototypeOf( proto ) )
		&& condition( proto )
		&& proto !== Object.prototype
	) {
		protos.push( proto );
	}

	return protos;
}

/**
 * Returns obj or first object in prototypes chain which satisfies condition
 * @param (Object) obj
 * @param (Function) condition
 * @return (Object)
 */
function getProto( obj, condition ) {
	var proto = obj;

	while(
		!condition( proto )
		&& proto !== Object.prototype
		&& ( proto = Object.getPrototypeOf( proto ) )
	);

	return proto;
}

/**
 * Returns obj or deepest object in prototypes chain where all prototypes satisfy condition
 * @param (Object) obj
 * @param (Function) condition
 * @return (Object)
 */
function getDeepestProto( obj, condition ) {
	var proto;

	while( ( proto = Object.getPrototypeOf( obj ) ) && condition( proto ) ) obj = proto;

	return obj;
}

/**
 * Defines object property if not defined or deeply extends it
 * @param (Object|Array|Function) obj
 * @param (String) propName
 * @param (Mixed) value
 * @param (Object|Function?) descriptor
 * @param (Object?) extendConfig
 * @return (Mixed)
 */
function defineOrExtend( obj, propName, value, descriptor, extendConfig ) {
	if ( !obj.hasOwnProperty( propName ) ) {
		define.apply( null, arguments );
	} else {
		if ( extendConfig === undefined ) extendConfig = true;

		obj[ propName ] = Extend.outer( extendConfig, obj[ propName ], value );
	}

	return obj[ propName ];
}
/**
 * Defines object property if not defined and returns it
 * @param (Object|Array|Function) obj
 * @param (String|Object) propName - propName or object { propName: value }
 * @param (Mixed?) value
 * @param (Object|Function?) descriptor
 * @return (Mixed)
 */
function define( obj, propName, value, descriptor ) {
	if ( typeof propName === 'object' ) {
		for ( var i in propName ) {
			define( obj, i, propName[ i ], value/*as descriptor*/ );
		}

		return obj;
	}

	if ( !obj.hasOwnProperty( propName ) ) {
		if ( typeof descriptor === 'function' ) descriptor = descriptor();

		descriptor = Object.assign( { value: value }, defaultDescriptor, descriptor );

		Object.defineProperty( obj, propName, descriptor );
	}

	return obj[ propName ];
}
const defaultDescriptor = { configurable: true };

/**
 * Pushes some value to array ( new if needed ) and returns it
 * @param (Array?) arr
 * @param (Mixed) value
 * @return (Array)
 */
function arrayPush( arr, value ) {
	arr = arr || [];

	arr.push( value );

	return arr;
}

/**
 * Pushes some value to array ( new if needed ) and returns it
 * @param (Array?) arr
 * @param (Mixed) value
 * @return (Array)
 */
function arrayUnshift( arr, value ) {
	arr = arr || [];

	arr.unshift( value );

	return arr;
}

/**
 * Checks if first letter is uppercased
 * @param (String) str
 * @return (Boolean)
 */
function isFirstUpperCased( str ) {
	const first = str.charAt( 0 );

	return first.toUpperCase() === first;
}
