
/* --------------------------------- Required Modules --------------------------------- */

const ExtendConfig = require( './extend-config' );

const GetConfig = require( './get-config' );

const Helpers = require( './helpers' );


/* --------------------------------- Module Exports --------------------------------- */

module.exports = ExtendBase;

module.exports.config = ExtendConfig.factory;

module.exports.isExtendConfig = ExtendConfig.isExtendConfig;


/* --------------------------------- ExtendBase --------------------------------- */

/**
 * Prepares for extend
 * @param (ExtendConfig|Boolean?) config - if boolean then deep property will be set
 * @param (Object) target
 * @param (Object) ...options
 * @return (Object|Function|Array|Promise) - target
 */
function ExtendBase() {
	var target = arguments[ 0 ],
		i = 1,
		config, options, targetPromise, type;

	if ( target instanceof ExtendConfig ) {
		// if both first and second arguments are ExtendConfigs - confusing situation
		if ( arguments[ i ] instanceof ExtendConfig ) {
			throw Error( 'Both first and second arguments can not be instances of ExtendConfig. Try to use Boolean as first one.' );
		}
		// update config
		config = target.valueOf();
		// skip the config and the target
		target = arguments[ i++ ];
	} else if ( typeof target === 'boolean' ) {
		// Handle a deep copy situation
		config = target ? { deep: target } : false;
		// skip the boolean and the target
		target = arguments[ i++ ];
	} else if ( GetConfig.isExtendConfigObject( target ) ) {
		// next iterations of extend
		config = target;
		// skip the boolean and the target
		target = arguments[ i++ ];
	}

	if ( !target
		|| ( ( type = typeof target ) && type !== 'object' && type !== 'function' )
	) {
		throw Error( `target is ${typeof target}, expected object or function` )
	}

	config = GetConfig.getFinalConfig( config || {}, this.defaultConfig );

	config._goDeeper();

	const result = this.extend( config, target, i, arguments );

	config && config._goHigher();

	return result;
}

/* --------------------------------- SimpleExtend --------------------------------- */

/**
 * Extends objects when config is undefined or unneeded
 * @param (Array) args
 * @return (Object|Function|Array) - target
 */
// function SimpleExtend( args ) {
// 	const target = args[ 0 ];

// 	Object.assign.apply( Object, args.map( Helpers.valueOf ) );

// 	return target;
// }
