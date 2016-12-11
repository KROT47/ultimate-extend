
/* --------------------------------- Required Modules --------------------------------- */

const AbstractValue = require( 'abstract-value' );

const GetConfig = require( './get-config' );

const Helpers = require( './helpers' );


/* --------------------------------- ExtendConfig Class --------------------------------- */

const ExtendConfig = AbstractValue( 'ExtendConfig' );


/* --------------------------------- Module Exports --------------------------------- */

module.exports = ExtendConfig;

module.exports.factory = ExtendConfigFactory;


/* --------------------------------- ExtendConfig Factory --------------------------------- */

/**
 * Creates new ExtendConfig instance
 * @param (Object) config
 * @return (ExtendConfig)
 */
function ExtendConfigFactory( config ) { return new ExtendConfig( config ) }


/* --------------------------------- ExtendConfig Prototype --------------------------------- */

Object.defineProperties( ExtendConfig.prototype, {

	/**
	 * Produces new ExtendConfig using this one as ancestor
	 * @param (Object) config
	 * @return (ExtendConfig)
	 */
	newConfig: {
		value: function ( config ) {
			return new ExtendConfig( GetConfig( config, this.valueOf() ) );
		},
		enumerable: true
	}
});
