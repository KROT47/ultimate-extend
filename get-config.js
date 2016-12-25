
/* --------------------------------- Required Modules --------------------------------- */

const ExtendDecorator = require( './extend-decorator' );

const Helpers = require( './helpers' );


/* --------------------------------- DefaultConfig --------------------------------- */

const DefaultConfigObject = {
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
		 * By default ( true ) all decorated properties will be resolved
		 * If false these properties will be extended with their decorators
		 * @type (Boolean)
		 */
		resolve: true,

		/**
		 * Default method to get all props to extend
		 * Also can be used to do smth with objects before each extend
		 * Context === extendConfig
		 * @param (Object) options - extension subject
		 * @param (Object) target - extension object
		 * @return (Mixed)
		 */
		getProps: ( options, target ) => Object.keys( options ),

		/**
		 * Default method to get target property to extend by name
		 * Context === extendConfig
		 * @param (Object) target - extension object
		 * @param (String|Number) name - current extending property name
		 * @param (Object) options - extension subject
		 * @return (Mixed)
		 */
		getFirst: ( target, name, options ) => target[ name ],

		/**
		 * Default method to get option by name from options object
		 * Context === extendConfig
		 * @param (Object) options - extension subject
		 * @param (String|Number) name - current extending property name
		 * @param (Object) target - extension object
		 * @return (Mixed)
		 */
		getSecond: ( options, name, target ) => options[ name ],

		/**
		 * Uses config to return new target property
		 * Context === extendConfig
		 * Override carefully
		 * @param (Mixed) first - target property value
		 * @param (Mixed) second - options property value
		 * @param (String|Number) name - current extending property name
		 * @param (Mixed) target - extension object
		 * @param (Mixed) options - extension subject
		 * @return (Mixed)
		 */
		extendProp( first, second, name, target, options ) {
			const type = this.getType( second );
			const extendMethodName =
				this.getType( first ) === type ? [ type, 'Default' ] : 'extendDifferent';

			return this.applyMethod( extendMethodName, arguments );
		},

		/**
		 * Executes if first and second object properties have different types to define new prop
		 * Context === extendConfig
		 * @param (Mixed) first - property value from first object
		 * @param (Mixed) second - property value from second object
		 * @param (String|Number) name - current extending property name
		 * @return (Mixed)
		 */
		extendDifferent( first, second, name, target, options ) {
			switch ( typeof second ) {
				case 'undefined': return first;

				case 'object':
					if ( this.deep && second ) {
						return (
							this.extend( Helpers.newObject( second ), second )
						);
					}

				default: return second;
			}
		},

		/* --------------------------------- Extend Similar --------------------------------- */

		// handlers to define new property if object properties types are similar
		// @see extendDifferent for arguments description
		// Array and Object will be extended too if config.deep is true
		Object( first, second, name, target, options ) {
			return (
				this.deep ?
					this.extend( first, second ) :
					this.Default.apply( this, arguments )
			);
		},

		Array( first, second, name, target, options ) {
			return (
				this.deep ?
					this.extend( first, second ) :
					this.Default.apply( this, arguments )
			);
		},

		// By default first will be replaced with second
		Default: ( first, second, name, target, options ) => second,


		/* --------------------------------- Advanced --------------------------------- */

		/**
		 * Main Extend function
		 */
		Extend: () => Helpers.undefinedMethod( 'extend' ),

		/**
		 * Max recursions count
		 * @type (Number)
		 */
		maxRecursions: 20,
	};

const DefaultConfig = setupExtendConfig( DefaultConfigObject );


/* --------------------------------- Final properties --------------------------------- */

const DefaultConfigPrototype = {};

Object.setPrototypeOf( DefaultConfig, DefaultConfigPrototype );

Object.defineProperties( DefaultConfigPrototype, {

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
	 * Calls defined in config Extend using self as extendConfig
	 * @return (Mixed)
	 */
	extend: {
		value() {
			var args = Array.prototype.slice.call( arguments );
			args.unshift( this );

			return this.Extend.apply( null, args );
		},
		enumerable: true
	},

	/**
	 * Returns config method by name or first founded for array of names
	 * @param (String|Array{String}) methodName
	 * @return (Function)
	 */
	getMethod: {
		value( methodName ) {
			if ( Array.isArray( methodName ) ) {
				for ( var i = 0; i < methodName.length; ++i ) {
					if ( this[ methodName[ i ] ] ) {
						return this.getMethod( methodName[ i ], true );
					}
				}

				throw Error( `Methods '${methodName.join( `' and '` )}' were not found` );
			}

			const isArray = arguments[ 1 ];

			if ( !isArray && !this[ methodName ] ) {
				throw Error( `Method '${methodName}' was not found` );
			}

			return this[ methodName ];
		},
		enumerable: true
	},

	/**
	 * Executes config method using arguments as first argument
	 * @param (Arguments|Array) args - all needed arguments for method
	 * @param (Object|Array) replacements - some replacements to args by index
	 * @return (Mixed)
	 * Example: function ( a, b ) {
	 * 		return this.applyMethod( 'extendProp', arguments, {
	 * 			1: b === 1 ? 2 : b // here replacement will occur only if b === 1
	 * 		});
	 * }
	 */
	applyMethod: {
		value( methodName, args, replacements ) {
			const method = this.getMethod( methodName );

			for ( var i in replacements ) if ( replacements[ i ] !== args[ i ] ) {
				args[ i ] = replacements[ i ];
			}

			return method.apply( this, args );
		},
		enumerable: true
	},

	/**
	 * Same as useOriginMethod but as first argument receives all arguments for useOriginMethod
	 * @param (Arguments|Array) args - all needed arguments for useOriginMethod
	 * @param (Object|Array) replacements - some replacements to args by index
	 * @return (Mixed)
	 */
	applyOriginMethod: {
		value( args, replacements ) {
			return this.applyMethod( 'useOriginMethod', args, replacements );
		},
		enumerable: true
	},

	/**
	 * Launches method with same name from parent config
	 * Arguments can differ from method to method, see DefaultConfig methods
	 * @return (Mixed)
	 */
	useOriginMethod: {
		value() {
			if ( arguments.length < 2 ) {
				throw Error( 'config.useOriginMethod should receive at least two arguments' );
			}

			const originConfig = this.getOrigin();
			const originMethod =
					originConfig.getMethod([ this._activeExtendMethodName, 'Default' ]);

			const result = originMethod.apply( this, arguments );

			return result;
		},
		enumerable: true
	},

	/**
	 * Returns new config produced from this one
	 * @param (Object) newConfig
	 * @return (Object)
	 */
	newConfig: {
		value( newConfig ) {
			var result = this.getStatic()._newConfig( newConfig || {} );

			if ( this.__isFinalConfig ) {
				const finalConfigs = Helpers.getAllProtos( this, proto => proto.__isFinalConfig );

				finalConfigs.push( {} );

				const finalConfig = Helpers.extendAll.apply( null, finalConfigs.reverse() );
				const decoratorsConfig = this._getDecoratorsConfig();

				if ( decoratorsConfig ) {
					result = Helpers.extendAll( Object.create( result ), decoratorsConfig );
				}

				Object.setPrototypeOf( finalConfig, result );

				return finalConfig;
			}

			return result;
		},
		enumerable: true
	},

	/**
	 * Returns origin extendConfig where extendMethodName is defined
	 * @param (String|Array?) extendMethodName - currently executing extendMethodName by default
	 * @return (Object)
	 */
	getOrigin: {
		value( extendMethodName ) { return this.getCurrent()._parent },
		enumerable: true
	},

	/**
	 * Returns origin extendConfig where extendMethodName is defined
	 * @param (String|Array?) extendMethodName - currently executing extendMethodName by default
	 * @return (Object)
	 */
	getCurrent: {
		value( extendMethodName ) {
			return this._currentMethod ? this._currentMethod._currentConfig : this.getStatic();
		},
		enumerable: true
	},

	/**
	 * Returns self or closest non-final config
	 * @return (Object)
	 */
	getStatic: {
		value() { return this.isStatic ? this : this._parent.getStatic() },
		enumerable: true
	},

	/**
	 * Tells if this config is static
	 * @return (Boolean)
	 */
	isStatic: {
		get() { return !this.__isDecoratorsConfig && !this.__isFinalConfig },
		enumerable: true
	},

	/**
	 * Tells if some object is extend config object
	 * @param (Mixed) obj
	 * @return (Boolean)
	 */
	isConfig: {
		value( obj ) { return IsExtendConfigObject( obj ) },
		enumerable: true
	},


	/* --------------------------------- Private --------------------------------- */

	/* ------------ Getters / Setters ------------- */

	/**
	 * Returns current config prototype
	 * @return (Object)
	 */
	_parent: { get() { return Object.getPrototypeOf( this ) } },

	/**
	 * Currently executing method name
	 * @param (String|Array) extendMethodName
	 * @return (String|Array)
	 */
	_activeExtendMethodName: {
		set( extendMethodName ) {
			Object.defineProperty( this, '__activeExtendMethodName', {
				value: extendMethodName,
				configurable: true
			});
		},
		get() { return this.__activeExtendMethodName }
	},


	/* ------------ Methods ------------- */

	/**
	 * Returns new config produced from this one
	 * @param (Object) newConfig - new config
	 * @return (Object)
	 */
	_newConfig: {
		value( config ) {
			var currConfig = this;

			const protos = Helpers.getAllProtos( config, proto => proto !== currConfig );

			for ( var i = protos.length; i--; ) {
				// all protos will be cloned to prevent unexpected mutations of other objects
				config = setupExtendConfig( config );

				Object.setPrototypeOf( config, currConfig );

				// each complex object will become child of existing one in currConfig
				currConfig = config;

				// now config object is officially extend config
				Object.defineProperty( config, '__isExtendConfig', { value: true } );
			}

			return config;
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
	 * Returns current static config cached value or use getter to get it
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
	 * Returns final config cached value or use getter to get it
	 * @param (String) name
	 * @param (Function) getter
	 * @return (Mixed)
	 */
	_useOwnCache: {
		value( name, getter ) {
			return this._ownCache[ name ] || ( this._ownCache[ name ] = getter() );
		}
	},

	/**
	 * Returns current static config cache object
	 * @return (Object)
	 */
	_cache: { get() { return this._getCache( this.getCurrent() ) } },

	/**
	 * Returns final config cache object
	 * @return (Object)
	 */
	_ownCache: { get() { return this._getCache( this ) } },

	/**
	 * Returns own cache object
	 * @return (Object)
	 */
	_getCache: {
		value( cacheOwner ) {
			if ( !cacheOwner.hasOwnProperty( '__cache' ) ) {
				Object.defineProperty( cacheOwner, '__cache', { value: {} } );
			}

			return cacheOwner.__cache;
		}
	},

	/**
	 * Returns prepared final config
	 * @return (Object)
	 */
	_getNewFinal: {
		value() {
			if ( this.__isFinalConfig ) {
				return Object.create( this, { __state: { value: {} } } );
			}

			const config = Object.create( this.getStatic() );

			Object.defineProperties( config, {
				__isFinalConfig: { value: true },

				__state: { value: {} },

				__level: { value: -1, writable: true },
			});

			return config;
		}
	},

	/**
	 * Returns array with options object with resolved decorator-functions and new hidden props
	 * @param (Object) target
	 * @param (Object) options
	 * @return (Array)
	 */
	_resolveOptions: {
		value( target, options ) {
			const final = [ options ];

			if ( !this.resolve ) return final;

			const decConfig = ExtendDecorator.getConfig( options );

			if ( !decConfig ) return final;

			final.push( decConfig );

			const propDecorators = decConfig.decorators;
			const extendConfigs = decConfig.configs;

			if ( extendConfigs ) final.push( extendConfigs );

			if ( !propDecorators ) return final;

			const resolvedOptions = final[ 0 ] = Helpers.fullClone( options );

			var name, i, decFuncs, result;

			for ( name in propDecorators ) {
				if ( decFuncs = propDecorators[ name ] ) {
					result = resolvedOptions[ name ];

					for ( i = decFuncs.length; i--; ) {
						result = decFuncs[ i ].call( this, result, target, resolvedOptions, name );
					}

					resolvedOptions[ name ] = result;
				}
			}

			return final;
		}
	},

	/**
	 * Returns good filtered props ( system properties will be omitted )
	 * @param (Object) options
	 * @param (Object) target
	 * @param (Object) decConfig
	 * @return (Array)
	 */
	_getProps: {
		value( options, target, decConfig ) {
			const props = this.getProps( options, target );

			return ExtendDecorator.filterProps( props, decConfig );
		}
	},

	/**
	 * Returns self or new config using options' decorators configs
	 * @param (Object) extendConfigs
	 * @param (String) name
	 * @return (Object)
	 */
	_getConfig: {
		value( extendConfigs, name ) {
			if ( !extendConfigs || !extendConfigs[ name ] ) return this;

			return this.newConfig( extendConfigs[ name ] );
		}
	},

	/**
	 * Extends decorators if resolve is false
	 * @param (Object) target
	 * @param (Object) options
	 */
	_extendDecoratorsConfig: {
		value( target, options ) {
			if ( this.resolve ) return;

			ExtendDecorator.updateConfig( target, options );
		}
	},

	/**
	 * Returns self or new config using options' static and decorators configs
	 * @param (Object) options
	 * @return (Object)
	 */
	_getDecoratorsConfig: {
		value() { return Helpers.getDeepestProto( this, proto => proto.__isDecoratorsConfig ) }
	},
});


/* --------------------------------- Module Exports --------------------------------- */

module.exports = GetConfig;

module.exports.defaultConfig = DefaultConfig;

module.exports.getFinalConfig = GetFinalConfig;

module.exports.isExtendConfigObject = IsExtendConfigObject;


/* --------------------------------- GetConfig --------------------------------- */

/**
 * Extends default config with provided
 * @param (Object|Array) configs
 * @param (Object?) protoConfig
 * @return (Object)
 */
function GetConfig( configs, protoConfig ) {
	config = protoConfig || DefaultConfig;

	if ( !Array.isArray( configs ) ) configs = [ configs ];

	for ( var i = configs.length; i--; ) {

		if ( configs[ i ].hasOwnProperty( '__isExtendConfig' )
			&& configs[ i ].isPrototypeOf( config )
			|| configs[ i ].__isFinalConfig
		) {
			config = configs[ i ];
			continue;
		}

		config = config.newConfig( configs[ i ] );
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


/* --------------------------------- IsExtendConfigObject --------------------------------- */

/**
 * Tells if object is extend config
 * @param (Object) obj
 * @return (Boolean)
 */
function IsExtendConfigObject( obj ) { return obj && obj.__isExtendConfig }


/* --------------------------------- Extend Map --------------------------------- */

/**
 * Initial extendConfig setup
 * @param (Object) config
 * @param (Object) currConfig
 * @return (Object)
 */
function setupExtendConfig( config ) {
	const result = {};

	for ( var i in config ) {
		if ( isExtendConfigMethod( config, i ) ) {
			let extendMethodName = i;
			let method = config[ i ];
			let resultMethod =
					function () {
						const oldActiveExtendMethodName = this._activeExtendMethodName;
						this._activeExtendMethodName = extendMethodName;

						const prevMethod = this._currentMethod;
						this._currentMethod = resultMethod;

						const result = method.apply( this, arguments );

						this._currentMethod = prevMethod;

						this._activeExtendMethodName = oldActiveExtendMethodName;

						return result;
					};

			resultMethod._currentConfig = result;

			result[ i ] = resultMethod;
		} else {
			result[ i ] = config[ i ];
		}
	}

	return result;
}

/* --------------------------------- Helpers --------------------------------- */

/**
 * Returns true if prop is extendConfig's property
 * @param (String) propName
 * @return (Boolean)
 */
function isExtendConfigMethod( config, propName ) {
	return (
		typeof config[ propName ] === 'function'
		&& (
			DefaultConfigObject.hasOwnProperty( propName )
			|| Helpers.isFirstUpperCased( propName )
		)
	);
}


/*
--------------------------
| DefaultConfig( Static )|
--------------------------
		  |
		  V
--------------------------
| ExtendConfig ( Static )|
--------------------------
		  |
		  V
--------------------------
| UserConfig 1 ( Static )|
--------------------------
		  |
		  V

		  .
		  .
		  .

		  |
		  V
--------------------------
| UserConfig N ( Static )|
--------------------------
		  |
		  V
--------------------------
| FinalConfig ( System ) |
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
