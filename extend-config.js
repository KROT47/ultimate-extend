
/* --------------------------------- Required Modules --------------------------------- */

const AbstractValue = require( 'abstract-value' );

const GetConfig = require( './get-config' );

const Helpers = require( './helpers' );


/* --------------------------------- ExtendConfig Class --------------------------------- */

const ExtendConfig = AbstractValue( 'ExtendConfig' );


/* --------------------------------- Module Exports --------------------------------- */

module.exports = ExtendConfig;

module.exports.factory = ExtendConfigFactory;

module.exports.isExtendConfig = IsExtendConfig;


/* --------------------------------- ExtendConfig Factory --------------------------------- */

/**
 * Creates new ExtendConfig instance
 * @param (Object|Array|ExtendConfig) config - if Array, first elem becomes top config
 * @return (ExtendConfig)
 */
function ExtendConfigFactory( config ) { return new ExtendConfig( Helpers.valueOf( config ) ) }


/* --------------------------------- ExtendConfig Prototype --------------------------------- */

Object.defineProperties( ExtendConfig.prototype, {

	/**
	 * Produces new ExtendConfig using this one as ancestor
	 * @param (Object|ExtendConfig) config
	 * @return (ExtendConfig)
	 */
	newConfig: {
		value: function ( config ) {
			return new ExtendConfig( getArrayOf( config ).concat( getArrayOf( this ) ) );
		},
		enumerable: true
	}
});


/* --------------------------------- IsExtendConfig --------------------------------- */

/**
 * Tells if an object is ExtencConfig instance
 * @param (Mixed) obj
 * @return (Boolean)
 */
function IsExtendConfig( obj ) { return obj instanceof ExtendConfig }


/* --------------------------------- Helpers --------------------------------- */

/**
 * Returns array
 * @param (Mixed)
 * @return (Array)
 */
function getArrayOf( obj ) {
	obj = Helpers.valueOf( obj );

	return Array.isArray( obj ) ? obj : [ obj ];
}
