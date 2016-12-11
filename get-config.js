
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
		 * @param (Object) options - object to extend from
		 * @param (String|Number) name - current extending property name
		 * @param (Object) config - extend config
		 * @param (Object) target - object to extend to
		 * @param (Function?) originMethod - equals to config.__proto__.getOption
		 * @return (Mixed)
		 */
		getOption: ( options, name, config, target, originMethod ) => options[ name ],

		/**
		 * Executes if first and second object properties have different types to define new prop
		 * @param (Mixed) first - property value from first object
		 * @param (Mixed) second - property value from second object
		 * @param (Object) config - extend config
		 * @param (String|Number) name - current extending property name
		 * @param (Function?) originMethod - equals to config.__proto__.extendDifferent
		 * @return (Mixed)
		 */
		extendDifferent: ( first, second, config, name, originMethod ) => {
			switch ( typeof second ) {
				case 'undefined': return first;

				case 'object':
					if ( config.deep && second ) {
						return (
							config.extend( config, Helpers.newObject( second ), second )
						);
					}

				default: return second;
			}
		},

		// handlers to define new property if object properties types are similar
		// @see extendDifferent for arguments description
		extendSimilar: {
			// Array and Object will be extended too if config.deep is true
			Object: ( first, second, config, name, originMethod ) => {
				return (
					config.deep ?
						config.extend( config, first, second ) :
						config.extendSimilar.default( first, second, config, name )
				);
			},
			Array: ( first, second, config, name, originMethod ) => {
				return (
					config.deep ?
						config.extend( config, first, second ) :
						config.extendSimilar.default( first, second, config, name )
				);
			},
			// if simple values - first will be replaced with second
			default: ( first, second, config, name, originMethod ) => second
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
			const type = Helpers.getType( second );
			const extendMethodName =
				Helpers.getType( first ) === type ?
					[ `extendSimilar.${type}`, 'extendSimilar.default' ] :
					'extendDifferent';

			return config._launchMethod( extendMethodName, [ first, second, config, name ] );
		},


		/* ------------ Advanced ------------- */

		/**
		 * Main Extend function
		 */
		extend: () => Helpers.undefinedMethod( 'extend' )
	};


/* --------------------------------- Final properties --------------------------------- */

Object.defineProperties( DefaultConfig, {

	/* --------------------------------- Public --------------------------------- */

	/**
	 * Returns current extend level ( useful if deep is true )
	 * @return (Object|false)
	 */
	getType: {
		value: Helpers.getType,
		enumerable: true
	},

	/**
	 * Returns current extend level ( useful if deep is true )
	 * @return (Object|false)
	 */
	level: {
		get() { return this.__level },
		set( value ) { this.__level = value },
		enumerable: true
	},

	/**
	 * Launches method with same name from parent config
	 */
	useOriginMethod: {
		value() {
			if ( arguments.length < 2 ) {
				throw Error( 'config.useOriginMethod should receive at least two arguments' );
			}

			const args = Array.prototype.slice.call( arguments );

			// prepare arguments
			if ( args.length === 2 ) {
				args.push( this );
			} else if ( args[ 2 ] !== this ) {
				args.splice( 2, 1, this );
			}

			const originLevel = ++this._activeMethodLevel;

			var originConfig = this;
			var i = 0;

			while ( i++ < originLevel ) originConfig = originConfig.getOrigin();

			const originMethod = originConfig._getMethodByName( this._activeMethodName );

			const result = originMethod.apply( null, args );

			this._activeMethodLevel--;

			return result;
		},
		enumerable: true
	},

	/**
	 * Returns new config produced from this one
	 * @param (Object) newConfig - new config
	 * @param (Boolean) asAutonomousObject
	 * 		- if true then new final config will be created
	 * 			with all properties from all final configs chain
	 * 		- this can be useful to use new config in Promises to prevent early config changes
	 * @return (Object)
	 */
	newConfig: {
		value( newConfig, asAutonomousObject ) {
			newConfig = newConfig || {};

			if ( this.__isFinalConfig ) {
				const config =
						asAutonomousObject ?
							GetConfig( this, this.getStatic(), true ) :
							this._getNewFinal();

				Object.assign( config, newConfig );

				return config;
			}

			return GetConfig( newConfig, this.getStatic() );
		},
		enumerable: true
	},

	/**
	 * Returns parent config
	 * @return (Object)
	 */
	getOrigin: {
		value() { return Object.getPrototypeOf( this.getStatic() ) },
		enumerable: true
	},

	/**
	 * Returns closest non-final config
	 * @return (Object)
	 */
	getStatic: {
		value() { return this.__isFinalConfig ? Object.getPrototypeOf( this ).getStatic() : this },
		enumerable: true
	},


	/* --------------------------------- Private --------------------------------- */

	/**
	 * Currently executing method name
	 * @param (String) methodName
	 */
	_activeMethodName: {
		set( methodName ) {
			Object.defineProperty( this, '__activeMethodName', {
				value: methodName,
				configurable: true
			});
		},
		get() { return this.__activeMethodName }
	},

	/**
	 * Currently executing method
	 * @param (Function) method
	 */
	_activeMethodLevel: {
		set( level ) {
			Object.defineProperty( this, '__activeMethodLevel', {
				value: level,
				configurable: true
			});
		},
		get() { return this.__activeMethodLevel }
	},

	/**
	 * Starts method to extend property
	 * @param (String) methodName
	 * @param (Array) args
	 * @return (Mixed)
	 */
	_launchMethod: {
		value( methodName, args ) {

			const method = this._getMethodByName( methodName );

			this._activeMethodName = methodName;
			this._activeMethodLevel = 0;

			const result = method.apply( null, args );

			return result;
		}
	},

	/**
	 * Returns method using name
	 * @param (String|Array) methodName
	 * @return (Function)
	 */
	_getMethodByName: {
		value( methodName ) {
			if ( Array.isArray( methodName ) ) {
				for ( var result, i = 0; i < methodName.length; ++i ) {
					if ( result = this._getMethodByName( methodName[ i ] ) ) return result;
				}

				console.log( 'methodName:', methodName );
				throw Error( 'Method can not be found for such methodName' );
			}

			return this._useCache( methodName, () => {
				const propNames = methodName.split( '.' );
				var propName, temp = this;

				while ( ( propName = propNames.shift() ) && ( temp = temp[ propName ] ) );

				return temp;
			});
		}
	},

	/**
	 * Executes before each extend to setup level of extend recursion
	 * @return (Object)
	 */
	_goDeeper: { value() { this.level++ } },

	/**
	 * Executes after each extend to set level of extend recursion back
	 * @return (Object)
	 */
	_goHigher: { value() { this.level-- } },

	/**
	 * Returns cached value or use getter to get it
	 * @param (String) name
	 * @param (Function) getter
	 * @return (Mixed)
	 */
	_useCache: {
		value( name, getter ) {
			return this._cache[ name ] || ( this._cache[ name ] = getter() );
		}
	},

	/**
	 * Returns own cache object
	 * @return (Object)
	 */
	_cache: {
		get() {
			const cacheOwner = this.getStatic();

			if ( !cacheOwner.hasOwnProperty( '__cache' ) ) {
				Object.defineProperty( cacheOwner, '__cache', { value: {} } );
			}

			return cacheOwner.__cache;
		}
	},

	/**
	 * Returns first final config in prototypes chain
	 * @return (Object)
	 */
	_getBaseFinal: {
		value() {
			var config = this;

			while ( !config.hasOwnProperty( '__isFinalConfig' )
				&& ( config = Object.getPrototypeOf( config ) )
			);

			return config;
		}
	},

	/**
	 * Returns prepared final config
	 * @return (Object)
	 */
	_getNewFinal: {
		value() {
			if ( this.__isFinalConfig ) return Object.create( this );

			const config = Object.create( this.getStatic() );

			Object.defineProperties( config, {
				__isFinalConfig: { value: true },

				__level: { value: -1, writable: true },
			});

			return config;
		}
	}
});


/* --------------------------------- Module Exports --------------------------------- */

module.exports = GetConfig;

module.exports.defaultConfig = DefaultConfig;

module.exports.getFinalConfig = GetFinalConfig;


/* --------------------------------- GetConfig --------------------------------- */

/**
 * Extends default config with provided
 * @param (Object) config
 * @return (Object)
 */
function GetConfig( config ) {
	const force = arguments[ 2 ];

	if ( !force && config.__isFinalConfig ) return config;

	var currConfig = arguments[ 1 ] || DefaultConfig;

	if ( !force
		&& config.hasOwnProperty( '__isExtendConfig' )
		&& currConfig.isPrototypeOf( config )
	) {
		return config;
	}

	const protos = [ config ];
	var i;

	while ( ( config = Object.getPrototypeOf( config ) )
		&& config !== Object.prototype
		&& config !== currConfig
	) {
		protos.push( config );
	}

	for ( i = protos.length; i--; ) {
		// all protos will be cloned to prevent unexpected mutations of other objects
		config = Helpers.protolessClone( protos[ i ], force );

		// each complex object will become child of existing in currConfig
		// e.g. extendSimilar
		currConfig = Helpers.setupFullInheritance( currConfig, config );

		// now this object is officially extend config
		Object.defineProperty( config, '__isExtendConfig', { value: true } );
	}

	return config;
}


/* --------------------------------- GetFinalConfig --------------------------------- */

/**
 * Returns config, which will be child of config and contain all final data
 * @param (Object) config
 * @param (Object) defaultConfig
 * @return (Object)
 */
function GetFinalConfig( config, defaultConfig ) {
	return GetConfig( config, defaultConfig )._getNewFinal();
}

/*
--------------------------
| DefaultConfig( Static) |
--------------------------
		  |
		  V
--------------------------
| ExtendConfig ( Static) |
--------------------------
		  |
		  V
--------------------------
| UserConfig 1 ( Static) |
--------------------------
		  |
		  V

		  .
		  .
		  .

		  |
		  V
--------------------------
| UserConfig N ( Static) |
--------------------------
		  |
		  V
--------------------------
| FinalConfig 			 |
--------------------------
		  |
		  V
--------------------------
| FinalConfig ( level 1 )|
--------------------------
		  |
		  V

		  .
		  .
		  .

		  |
		  V
--------------------------
| FinalConfig ( level N )|
--------------------------
*/
