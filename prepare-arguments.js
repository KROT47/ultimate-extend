
/* --------------------------------- Required Modules --------------------------------- */

const ExtendConfig = require( './extend-config' );

const GetConfig = require( './get-config' );


/* --------------------------------- Module Exports --------------------------------- */

module.exports = PrepareArguments;

module.exports.prepareConfig = PrepareConfig;

module.exports.extendConfig = ExtendConfig.factory;

module.exports.isExtendConfig = ExtendConfig.isExtendConfig;


/* --------------------------------- PrepareArguments --------------------------------- */

/**
 * Prepares for extend
 * @param (Arguments|Array) args - all arguments for extend
 * @param (Object) defaultConfig
 * @return (Array) - array of arguments
 */
function PrepareArguments( args, defaultConfig ) {
	if ( args[ 0 ].__isPreparedConfig ) {
		return !Array.isArray( args ) ? Array.prototype.slice.call( args ) : args;
	}

	var target = args[ 0 ],
		i = 1,
		config, options, targetPromise, type;

	if ( target instanceof ExtendConfig ) {
		// if both first and second arguments are ExtendConfigs - confusing situation
		if ( args[ i ] instanceof ExtendConfig ) {
			throw Error( 'Both first and second arguments can not be instances of ExtendConfig. Try to use Boolean as first one.' );
		}
		// update config
		config = target.valueOf();
		// skip the config and the target
		target = args[ i++ ];
	} else if ( typeof target === 'boolean' ) {
		// Handle a deep copy situation
		config = target ? { deep: target } : false;
		// skip the boolean and the target
		target = args[ i++ ];
	} else if ( GetConfig.isExtendConfigObject( target ) ) {
		// next iterations of extend
		config = target;
		// skip the boolean and the target
		target = args[ i++ ];
	}

	if ( !target
		|| ( ( type = typeof target ) && type !== 'object' && type !== 'function' )
	) {
		throw Error( `target is ${typeof target}, expected object or function` )
	}

	config = GetConfig( config || {}, defaultConfig );

	PrepareConfig( config, true );

	return [ config, target, i, args ];
}

/* --------------------------------- Helpers --------------------------------- */

function PrepareConfig( config, value ) {
	if ( config.__isPreparedConfig === undefined || !value ) {
		Object.defineProperty( config, '__isPreparedConfig', {
			value: value || false,
			configurable: true
		});
	}
}
