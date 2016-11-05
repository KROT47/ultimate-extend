
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
		 * @param (String|Number) name - current extending property name
		 * @return (Mixed)
		 */
		extendDifferent: ( first, second, config, name ) => {
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
			Object:  ( first, second, config, name ) => {
				if ( config.deep ) {
					config = Object.create( config );
					config.level = config.level + 1;

					return config.extend( config, first, second );
				}

				return config.extendSimilar.default( first, second, config, name );
			},
			Array:  ( first, second, config, name ) => {
				if ( config.deep ) {
					config = Object.create( config );
					config.level = config.level + 1;

					return config.extend( config, first, second );
				}

				return config.extendSimilar.default( first, second, config, name );
			},
			// if simple values - first will be replaced with second
			default: ( first, second, config, name ) => second
		},

		/**
		 * Returns new target property
		 * @param (Mixed) first - target current property
		 * @param (Mixed) second - extend object current property
		 * @param (Object) config
		 * @param (String|Number) name - current extending property name
		 * @return (Mixed)
		 */
		extendProp: ( first, second, config, name ) => {
			var type = GetType( second ),
				originalConfig = config.getOriginal(),
				originalMethod, extendMethod;

			if ( GetType( first ) === type  ) {
				extendMethod = config.extendSimilar[ type ] || config.extendSimilar.default;

				originalMethod =
					originalConfig && (
						originalConfig.extendSimilar[ type ]
						|| originalConfig.extendSimilar.default
					);
			} else {
				extendMethod = config.extendDifferent;

				originalMethod = originalConfig && originalConfig.extendDifferent;
			}

			return extendMethod( first, second, config, name, originalMethod );
		},


		/* ------------ Advanced ------------- */

		/**
		 * Main Extend function
		 */
		extend: () => undefinedMethod( 'extend' )
	};

Object.defineProperties( DefaultConfig, {
	/**
	 * Returns current extend level ( useful if deep is true )
	 * @return (Object|false)
	 */
	level: {
		get: function () { return this._level || 0 },
		set: function ( value ) { this._level = value },
		enumerable: true
	}
});


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

	Object.defineProperties( newConfig, {
		/**
		 * Returns original config
		 * @return (Object)
		 */
		getOriginal: {
			value: function () { return defaultConfig },
			enumerable: true
		}
	});

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
