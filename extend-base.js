
/* --------------------------------- Required Modules --------------------------------- */

const ExtendConfig = require( './extend-config' );

const GetConfig = require( './get-config' );


/* --------------------------------- Module Exports --------------------------------- */

module.exports = ExtendBase;

module.exports.config = ExtendConfig.factory;


/* --------------------------------- ExtendBase --------------------------------- */

/**
 * Prepares for extend
 * @param (ExtendConfig|Boolean?) config - if boolean then deep property will be set
 * @param (Object) target
 * @param (Object) ...options
 * @return (Promise{Object}) - target
 */
function ExtendBase( target ) {
	var i = 1, config, options, targetPromise, type;

	if ( target instanceof ExtendConfig ) {
		// if both first and second arguments are ExtendConfigs - confusing situation
		if ( arguments[ i ] instanceof ExtendConfig ) {
			throw Error( 'Both first and second arguments can not be instances of ExtendConfig. Try to use Boolean as first one.' );
		}
		// update config
		config = target.valueOf();
		// skip the config and the target
		target = arguments[ i++ ] || {};
	} else if ( typeof target === 'boolean' ) {
		// Handle a deep copy situation
		config = { deep: target };
		// skip the boolean and the target
		target = arguments[ i++ ] || {};
	} else if ( target && typeof target === 'object' && target.__isExtendConfig ) {
		// next iterations of extend
		config = target;
		// skip the boolean and the target
		target = arguments[ i++ ] || {};
	}

	if ( !target
		|| ( ( type = typeof target ) && type !== 'object' && type !== 'function' )
	) {
		target = {};
	}

	if ( !config ) config = {};

	config = GetConfig.getFinalConfig( config, this.defaultConfig );

	config._goDeeper();

	const result = this.extend( config, target, i, arguments );

	config._goHigher();

	return result;
}
