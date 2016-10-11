
/* --------------------------------- Required Modules --------------------------------- */

const GetType = require( 'get-explicit-type' );


/* --------------------------------- Config --------------------------------- */

const DefaultConfig = {
		deep: false,

		/**
		 * Default function to get option by name from options object
		 * @param (Object) options
		 * @param (String) name
		 * @return (Mixed)
		 */
		getOption: ( options, name ) => options[ name ],

		/**
		 * Executes if first and second object properties have different types to define new prop
		 * @param (Mixed) first - property value from first object
		 * @param (Mixed) second - property value from second object
		 * @param (Object) config - extend config
		 * @return (Mixed)
		 */
		extendDifferent: ( first, second, config ) => {
			switch ( typeof second ) {
				case 'undefined': return first;

				case 'object':
					if ( config.deep && second ) {
						return config.extend( config, getEmptyObject( second ), second );
					}

				default: return second;
			}
		},

		// handlers to define new property if object properties types are similar
		extendSimilar: {
			// Array and Object will be extended too if config.deep is true
			Object:  ( first, second, config ) => {
				return config.deep ?
						config.extend( config, {}, first, second ) :
						config.extendSimilar.default( first, second, config );
			},
			Array:  ( first, second, config ) => {
				return config.deep ?
						config.extend( config, [], first, second ) :
						config.extendSimilar.default( first, second, config );
			},
			// if simple values - first will be replaced with second
			default: ( first, second, config ) => second
		},

		/**
		 * Returns new target property
		 * @param (Mixed) first
		 * @param (Mixed) second
		 * @param (Object) config
		 * @return (Mixed)
		 */
		extendProp: ( first, second, config ) => {
			var type = GetType( second ), extendMethod;

			if ( GetType( first ) === type  ) {
				extendMethod = config.extendSimilar[ type ] || config.extendSimilar.default;
			} else {
				extendMethod = config.extendDifferent;
			}

			return extendMethod( first, second, config );
		},


		/* ------------ Advanced ------------- */

		/**
		 * Main Extend function
		 */
		extend: () => undefinedMethod( 'extend' )
	};


/* --------------------------------- Module Exports --------------------------------- */

module.exports = GetConfig;

module.exports.defaultConfig = DefaultConfig;


/* --------------------------------- GetConfig --------------------------------- */

/**
 * Extends default config with provided
 * @param (Object) config
 * @return (Object)
 */
function GetConfig( config ) {
	const defaultConfig = arguments[ 1 ] || DefaultConfig;

	const newConfig = Object.create( defaultConfig );

	simpleExtend( newConfig, config );

	return newConfig;
}


/* --------------------------------- Helpers --------------------------------- */

function undefinedMethod( name ) { throw Error( `Extend config method ${name} must be defined` ) }

function simpleExtend( target, obj ) {
	var type, i, newTarget;

	for ( i in obj ) {
		type = typeof target[ i ];

		if ( type === typeof obj[ i ] && type === 'object' ) {
			newTarget = simpleExtend( getEmptyObject( target[ i ] ), target[ i ] );

			target[ i ] = simpleExtend( newTarget, obj[ i ] );
		} else {
			target[ i ] = obj[ i ];
		}
	}

	return target;
}

// returns empty array or object ue to obj type
function getEmptyObject( obj ) { return Array.isArray( obj ) ? [] : {} }
