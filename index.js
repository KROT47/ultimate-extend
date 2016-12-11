'use strict';

/* --------------------------------- Required Modules --------------------------------- */

const ExtendBase = require( './extend-base' );

const GetConfig = require( './get-config' );

const ExtendPromise = require( './extend-promise' );

const Helpers = require( './helpers' );


/* --------------------------------- Module Exports --------------------------------- */

module.exports = Extend;

module.exports.promise = ExtendPromise;

module.exports.config = ExtendBase.config;

module.exports.outer = require( './extend-outer' );


/* --------------------------------- Config --------------------------------- */

const ExtendDefaultConfig = {

	extend: ExtendStart,

	defaultConfig: GetConfig({
		/**
		 * Main Extend function
		 */
		extend: Extend
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
function Extend( target ) {
	return ExtendBase.apply( ExtendDefaultConfig, Array.prototype.slice.call( arguments ) );
}


/* --------------------------------- Private --------------------------------- */

// Extends target with each options object
function ExtendStart( config, target, i, args ) {
	for ( ; i < args.length; ++i ) _Extend( config, target, args[ i ] );

	return target;
}

// extends each prop
function _Extend( config, target, options ) {
	var option, name;

	if ( !target || !options || target === options && !config.extendSelf ) return;

	target = Helpers.getValueOf( target );
	options = Helpers.getValueOf( options );

	for ( name in options ) {
		option = config._launchMethod( 'getOption', [ options, name, config, target ] );

		target[ name ] =
			config.extendProp( target[ name ], option, config, name );
	}
}
