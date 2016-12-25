'use strict';

/* --------------------------------- Module Exports --------------------------------- */

module.exports = Extend;


/* --------------------------------- Required Modules --------------------------------- */

const ExtendBase = require( './extend-base' );

const GetConfig = require( './get-config' );

const ExtendPromise = require( './extend-promise' );

const Helpers = require( './helpers' );


/* --------------------------------- Module Exports --------------------------------- */

module.exports.promise = ExtendPromise;

module.exports.config = ExtendBase.config;

module.exports.isConfig = ExtendBase.isExtendConfig;

module.exports.decorator = require( './extend-decorator' );

module.exports.outer = require( './extend-outer' );


/* --------------------------------- Config --------------------------------- */

const ExtendDefaultConfig = {

	extend: ExtendStart,

	defaultConfig: GetConfig({

		extendProp( first, second, name, target, options ) {
			return ( target[ name ] = this.applyOriginMethod( arguments ) );
		},

		/**
		 * Main Extend function
		 */
		Extend: Extend
	})
};


/* --------------------------------- Extend --------------------------------- */

/**
 * Extends target with other options as arguments
 * @param (ExtendConfig|Boolean?) config - if boolean then deep property will be set
 * @param (Object) target
 * @param (Object) ...options
 * @return (Promise{Object}) - target
 */
function Extend( target ) { return ExtendBase.apply( ExtendDefaultConfig, arguments ) }


/* --------------------------------- Private --------------------------------- */

// Extends target with each options object
function ExtendStart( config, target, i, args ) {
	if ( config ) {
		const targetValue = Helpers.valueOf( target );

		for ( ; i < args.length; ++i ) _Extend( config, targetValue, args[ i ] );
	}

	return target;
}

// extends target with one options object
function _Extend( config, target, options ) {

	if ( !target || !options || target === options && !config.extendSelf ) return;

	options = Helpers.valueOf( options );

	const [ resolvedOptions, decConfig, extendConfigs ] = config._resolveOptions( target, options );

	const props = config._getProps( resolvedOptions, target, decConfig );

	var first, second, name, secondConfig, i;

	for ( i = props.length; i--; ) {
		name = props[ i ];

		secondConfig = config._getConfig( extendConfigs, name );

		first = config.getFirst( target, name, options );

		second = secondConfig.getSecond( resolvedOptions, name, target );

		secondConfig.extendProp( first, second, name, target, options );
	}

	config._extendDecoratorsConfig( target, options );
}
