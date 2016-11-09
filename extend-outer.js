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
		/**
		 * Main Extend function
		 */
		extend: Extend
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
function ExtendOuter() {
	return ExtendBase.apply( ExtendOuterDefaultConfig, Array.prototype.slice.call( arguments ) );
}


/* --------------------------------- Private --------------------------------- */

// Extends target with each options object
function ExtendOuterStart( config, target, i, args ) {
	args = Array.prototype.slice.call( args, i - 1 ).map( value => ({ outer: value }) );

	const result = Extend.apply( null, [ config, {} ].concat( args ) );

	return result.outer;
}
