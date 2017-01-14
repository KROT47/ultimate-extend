'use strict';


/* --------------------------------- Module Exports --------------------------------- */

const Extend = module.exports = ExtendUnbinded.bind( ExtendUnbinded );


/* --------------------------------- Required Modules --------------------------------- */

const ExtendPrototype = require( './extend-prototype' );

const GetConfig = require( './get-config' );

const ExtendPromise = require( './extend-promise' );

const Helpers = require( './helpers' );


/* --------------------------------- Extend Prototype --------------------------------- */

Object.setPrototypeOf( Extend, ExtendPrototype );


/* --------------------------------- Module Exports --------------------------------- */

module.exports.promise = ExtendPromise;

module.exports.config = ExtendPrototype.config;

module.exports.isConfig = ExtendPrototype.isExtendConfig;

module.exports.decorator = require( './extend-decorator' );


/* --------------------------------- Config --------------------------------- */

Extend._defaultConfig = GetConfig({
	/**
	 * Main Extend function
	 */
	Extend: Extend
}, undefined, 'Base' );


Extend._extend = ExtendStart;


/* --------------------------------- Extend --------------------------------- */

/**
 * Extends target with other options as arguments
 * @param (ExtendConfig|Boolean?) config - if boolean then deep property will be set
 * @param (Object) target
 * @param (Object) ...options
 * @return (Promise{Object}) - target
 */
function ExtendUnbinded( target ) { return Extend._start.apply( Extend, arguments ) }


/* --------------------------------- Private --------------------------------- */

// Extends target with each options object
function ExtendStart( config, target, i, args ) {
	const targetValue = Helpers.valueOf( target );

	for ( ; i < args.length; ++i ) _Extend( config, targetValue, args[ i ] );

	return config.returnTarget( target );
}

// extends target with one options object
function _Extend( config, target, options ) {

	if ( !target || !options || target === options && !config.extendSelf ) return;

	options = Helpers.valueOf( options );

	const [ resolvedOptions, decConfig, extendConfigs ] = config._resolveOptions( target, options );

	const props = config.__getProps( resolvedOptions, target, decConfig );

	var first, second, name, secondConfig, i, result;

	for ( i = props.length; i--; ) {
		name = props[ i ];

		secondConfig = config._getConfig( extendConfigs, name );

		first = config.getFirst( target, name, options );

		second = secondConfig.getSecond( resolvedOptions, name, target );

		result = secondConfig.extendProp( first, second, name, target, options );

		if ( result !== undefined ) target[ name ] = result;
	}

	config._extendDecoratorsConfig( target, options );
}
