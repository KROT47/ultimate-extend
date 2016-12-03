
/* --------------------------------- Required Modules --------------------------------- */

const Helpers = require( './helpers' );


/* --------------------------------- Config --------------------------------- */

const DefaultConfig = {
		/**
		 * If true then all properties will be deeply extended
		 * @type (Boolean)
		 */
		deep: false,

		/**
		 * If true then execution will proceed to replace properties from object to itself
		 * e.g. Extend( deepEquivExtend, obj1, obj1 ) => obj1 will be deeply extended with itself
		 * @type (Boolean)
		 */
		extendSelf: false,

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
						return (
							config.extend( config._goDeeper(), Helpers.newObject( second ), second )
						);
					}

				default: return second;
			}
		},

		// handlers to define new property if object properties types are similar
		extendSimilar: {
			// Array and Object will be extended too if config.deep is true
			Object:  ( first, second, config, name ) => {
				return config.deep ?
					config.extend( config._goDeeper(), first, second ) :
					config.extendSimilar.default( first, second, config, name );
			},
			Array:  ( first, second, config, name ) => {
				return config.deep ?
					config.extend( config._goDeeper(), first, second ) :
					config.extendSimilar.default( first, second, config, name );
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
			var type = Helpers.getType( second ),
				originalConfig = config.getOriginal(),
				originalMethod, extendMethod;

			if ( Helpers.getType( first ) === type  ) {
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
		extend: () => Helpers.undefinedMethod( 'extend' )
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
	},

	/**
	 * Returns config for deeper extend method
	 * @return (Object)
	 */
	_goDeeper: {
		value: function () {
			const config = Object.create( this );
			config.level++;
			return config;
		}
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

	Helpers.simpleExtend( newConfig, config );

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
