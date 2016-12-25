'use strict';

/* --------------------------------- Required Modules --------------------------------- */

const ExtendBase = require( './extend-base' );

const GetConfig = require( './get-config' );

const Extend = require( './' );


/* --------------------------------- Module Exports --------------------------------- */

module.exports = ExtendOuter;


/* --------------------------------- Config --------------------------------- */

const ExtendOuterDefaultConfig = {

	extend: ExtendOuterStart,

	defaultConfig: GetConfig({

		extendProp( first, option, name, target, options ) {
			return ( target[ name ] = this.applyOriginMethod( arguments ) );
		},

		/**
		 * Main Extend function
		 */
		Extend: Extend
	})
};


/* --------------------------------- ExtendOuter --------------------------------- */

/**
 * Extends any type of variables as if they were inside of objects which must be extended
 * @param (ExtendConfig|Boolean?) config - if boolean then deep property will be set
 * @param (Object) target
 * @param (Object?) ...options
 * @return (Promise{Object}) - target
 */
function ExtendOuter( target ) {
	return ExtendBase.apply( ExtendOuterDefaultConfig, arguments );
}


/* --------------------------------- Private --------------------------------- */

// Extends target with each options object
function ExtendOuterStart( config, target, i, args ) {
	if ( config ) {
		args = Array.prototype.slice.call( args, i - 1 ).map( value => ({ outer: value }) );

		target = Extend.apply( null, [ config, {} ].concat( args ) ).outer;
	}

	return target;
}
