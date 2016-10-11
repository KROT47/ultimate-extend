
/* --------------------------------- Required Modules --------------------------------- */

const AbstractValue = require( 'abstract-value' );

const GetConfig = require( './get-config' );


/* --------------------------------- Module Exports --------------------------------- */

module.exports = ExtendBase;

const ExtendConfig = AbstractValue( 'ExtendConfig' );

module.exports.config = ExtendConfig;


/* --------------------------------- ExtendBase --------------------------------- */

/**
 * Prepares for extend
 * @param (ExtendConfig|Boolean?) config - if boolean then deep property will be set
 * @param (Object) target
 * @param (Object) ...options
 * @return (Promise{Object}) - target
 */
function ExtendBase( target ) {
	var i = 1, config, options, targetPromise;

	if ( target instanceof ExtendConfig ) ) {
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
	} else if ( target && typeof target === 'object' && target._finalExtendConfigState ) {
		// next iterations of extend
		config = target;
		// skip the boolean and the target
		target = arguments[ i++ ] || {};
	}

	if ( !target || ( typeof target !== 'object' && typeof target !== 'function' ) ) {
		target = {};
	}

	if ( config ) {
		if ( !config._finalExtendConfigState ) {
			config = GetConfig( config, this.defaultConfig );
			Object.defineProperty( config, '_finalExtendConfigState', { value: true } );
		}
	} else {
		config = this.defaultConfig;
	}

	return this.extend( config, target, i, arguments );
}
