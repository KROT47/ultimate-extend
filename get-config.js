
/* --------------------------------- Required Modules --------------------------------- */

const Extend = require( './' );

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
		getProps( options, target ) {
			const props = [];

			for ( var i in options ) props.push( i );

			return props;
			// return Object.keys( options );
		},

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
			const type = this.helpers.getType( second );
			const extendMethodName =
					this.helpers.getType( first ) === type ?
						[ type, 'Default' ] : 'extendDifferent';

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
							this.extend( this.helpers.newObject( second ), second )
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

		/* --------------------------------- Extend Default --------------------------------- */

		// By default first will be replaced with second
		Default: ( first, second, name, target, options ) => second,


		/* --------------------------------- Ending --------------------------------- */

		// defines how target should be returned in the end of all iterations
		returnTarget: target => target,

		/* --------------------------------- Advanced --------------------------------- */

		/**
		 * Main Extend function
		 */
		Extend: () => Helpers.undefinedMethod( 'Extend' ),

		/**
		 * Max recursions count
		 * @type (Number)
		 */
		maxRecursions: 20,
	};

/**
 * Config hidden property for type value
 * @type (String)
 */
const TypeProp = '__extendConfigType';

const DefaultConfig = setupExtendConfig( DefaultConfigObject, 'Default' );


/* --------------------------------- Final properties --------------------------------- */

const DefaultConfigPrototype = {};

Object.setPrototypeOf( DefaultConfig, DefaultConfigPrototype );

Object.defineProperties( DefaultConfigPrototype, {

	/* --------------------------------- Public --------------------------------- */

	/**
	 * Writes value to config data store by name to use it through all execution
	 * @param (String) name
	 * @param (Mixed) value
	 */
	// set: {
	// 	value( name, value ) {
	// 		if ( value === undefined ) {
	// 			delete this.__storage[ name ];
	// 			return;
	// 		}

	// 		this.__storage[ name ] = value;
	// 	},
	// 	enumerable: true
	// },

	/**
	 * Updates value in config data store by name using function
	 * @param (String) name
	 * @param (Function) func - current value will be passed as argument
	 */
	// update: {
	// 	value( name, func ) { this.set( name, func( this.get( name ) ) ) },
	// 	enumerable: true
	// },

	/**
	 * Returns value from config data store by name
	 * @param (String) name
	 * @return (Mixed)
	 */
	// get: {
	// 	value( name ) { return this.__storage[ name ] },
	// 	enumerable: true
	// },

	/**
	 * All helpers available
	 * @type (Object)
	 */
	helpers: {
		value: Helpers,
		enumerable: true
	},

	/**
	 * Returns current extend level ( useful if deep is true )
	 * @return (Object|false)
	 */
	level: {
		get() { return this.global.__level },
		set( value ) { this.global.__level = value },
		enumerable: true
	},

	/**
	 * Link to UltimateExtend module
	 * @type (Object)
	 */
	BaseExtend: {
		value: Extend,
		enumerable: true
	},

	/**
	 * Calls defined in config Extend using self as extendConfig
	 * Arguments are same as for Extend method
	 * @return (Mixed)
	 */
	extend: {
		value() { return this.applyExtend( arguments ) },
		enumerable: true
	},

	/**
	 * Applies defined in config Extend using self as extendConfig
	 * @param (Array) args
	 * @return (Mixed)
	 */
	applyExtend: {
		value( args ) {
			args = Array.prototype.slice.call( args );
			args.unshift( this );

			return this.Extend.apply( this, args );
		},
		enumerable: true
	},

	/**
	 * Returns config property by name or first founded for array of names
	 * @param (String|Array{String}) propName
	 * @return (Mixed)
	 */
	getProp: {
		value( propName ) {
			if ( Array.isArray( propName ) ) {
				for ( var i = 0; i < propName.length; ++i ) {
					if ( this[ propName[ i ] ] !== undefined ) {
						return this.getProp( propName[ i ], true );
					}
				}

				throw Error( `Methods '${propName.join( `' and '` )}' were not found` );
			}

			const isArray = arguments[ 1 ];

			if ( !isArray && this[ propName ] === undefined ) {
				throw Error( `Method or property '${propName}' was not found` );
			}

			return this[ propName ];
		},
		enumerable: true
	},

	/**
	 * Returns config property descriptor by name or first founded for array of names
	 * @param (String|Array{String}) propName
	 * @return (Mixed)
	 */
	getPropDescriptor: {
		value( propName ) {
			if ( Array.isArray( propName ) ) {
				for ( var i = 0; i < propName.length; ++i ) {
					if ( propName[ i ] in this ) {
						return this.getPropDescriptor( propName[ i ], true );
					}
				}

				throw Error( `Methods '${propName.join( `' and '` )}' were not found` );
			}

			const isArray = arguments[ 1 ];

			if ( !isArray && !( propName in this ) ) {
				throw Error( `Method or property '${propName}' was not found` );
			}

			var owner = this;

			while ( !owner.hasOwnProperty( propName ) ) owner = Object.getPrototypeOf( owner );

			return Object.getOwnPropertyDescriptor( owner, propName );
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
			const method = this.getProp( methodName );

			for ( var i in replacements ) if ( replacements[ i ] !== args[ i ] ) {
				args[ i ] = replacements[ i ];
			}

			return method.apply( this, args );
		},
		enumerable: true
	},

	/**
	 * Same as callOrigin but as first argument receives all arguments for callOrigin
	 * @param (Arguments|Array) args - all needed arguments for callOrigin
	 * @param (Object|Array) replacements - some replacements to args by index
	 * @return (Mixed)
	 */
	applyOrigin: {
		value( args, replacements ) {
			return this.applyMethod( 'callOrigin', args, replacements );
		},
		enumerable: true
	},

	/**
	 * Launches method with same name from parent config
	 * Arguments can differ from method to method, see DefaultConfig methods
	 * @return (Mixed)
	 */
	callOrigin: {
		value() {
			const originConfig = this.getOrigin();
			const originPropDescr =
					originConfig.getPropDescriptor([ this._activeExtendMethodName, 'Default' ]);

			var result, originProp = originPropDescr.value;

			if ( originProp !== undefined ) {
				result =
					typeof originProp === 'function' ?
						originProp.apply( this, arguments ) :
						originProp;

			} else if ( originProp = originPropDescr.get ) {
				result = originProp.call( this );
			} else {
				console.log( 'Origin config:', originConfig );
				throw Error( `Neither value nor getter were founded for '${this._activeExtendMethodName}' property in extend config` )
			}

			return result;
		},
		enumerable: true
	},

	/**
	 * Returns new static config produced from this one
	 * @param (Object) newConfig
	 * @return (Object)
	 */
	newConfig: {
		value( newConfig ) { return this._newConfig( newConfig ) },
		enumerable: true
	},

	/**
	 * Returns new primary config produced from this one
	 * @param (Object) newConfig
	 * @return (Object)
	 */
	newPrimary: {
		value( newConfig ) { return this._newConfig( newConfig, 'Primary' ) },
		enumerable: true
	},

	/**
	 * Returns new base config produced from this one
	 * @param (Object) newConfig
	 * @return (Object)
	 */
	newBase: {
		value( newConfig ) { return this._newConfig( newConfig, 'Base' ) },
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
			return (
				this._currentMethod ?
					this._currentMethod._extendConfig :
					this.getClosest( 'Primary' )
			);
		},
		enumerable: true
	},

	/**
	 * Returns self or closest non-final config
	 * @return (Object)
	 */
	getNonFinal: {
		value() { return this.has( 'Final' ) ? this._parent.getNonFinal() : this },
		enumerable: true
	},

	/**
	 * Returns self or closest config of some type
	 * @return (Object)
	 */
	getDefault: { 	value() { return this.getConfig( 'Default' ) }, enumerable: true },
	getBase: { 		value() { return this.getConfig( 'Base' ) }, enumerable: true },
	getStatic: { 	value() { return this.getConfig( 'Static' ) }, enumerable: true },
	getPrimary: { 	value() { return this.getConfig( 'Primary' ) }, enumerable: true },
	getFinal: { 	value() { return this.getConfig( 'Final' ) }, enumerable: true },


	/**
	 * Tells if this config is of some type
	 * @return (Boolean)
	 */
	isDefault: { 	get() { return this.is( 'Default' ) }, enumerable: true },
	isBase: { 		get() { return this.is( 'Base' ) }, enumerable: true },
	isStatic: { 	get() { return this.is( 'Static' ) }, enumerable: true },
	isPrimary: { 	get() { return this.is( 'Primary' ) }, enumerable: true },
	isFinal: { 		get() { return this.is( 'Final' ) }, enumerable: true },

	/**
	 * Returns closest config by type ( goes from top to deep prototype )
	 * @param (String) configType
	 * @return (Object|undefined)
	 */
	getClosest: {
		value( configType ) {
			var config = this.getConfig( configType );

			if ( !config ) {
				const configTypes = ConfigTypes._index;
				var i = configTypes.indexOf( configType );

				if ( !~i ) throw Error( `Unknown config type ${configType}` );

				while ( i-- && !( config = this.getConfig( configTypes[ i ] ) ) );
			}

			return config;
		},
		enumerable: true
	},

	/**
	 * Returns config by type
	 * @param (String) configType
	 * @return (Object|undefined)
	 */
	getConfig: {
		value( configType ) {
			if ( !this.has( configType ) ) return;

			var config = this;

			while ( !config.is( configType ) ) config = config._parent;

			return config;
		},
		enumerable: true
	},

	/**
	 * Tells if config has some type
	 * @param (String) configType
	 * @return (Boolean)
	 */
	has: {
		value( configType ) { return this[ getTypeProp( configType ) ] },
		enumerable: true
	},

	/**
	 * Tells if config is of some type
	 * @param (String) configType
	 * @return (Boolean)
	 */
	is: {
		value( configType ) { return this.hasOwnProperty( getTypeProp( configType ) ) },
		enumerable: true
	},

	/**
	 * Returns config type
	 * @return (String)
	 */
	configType: {
		get() { return this[ TypeProp ] },
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

	_getAllConfigs: {
		value( configType ) {
			if ( !this.has( configType ) ) return;

			var config = this;

			while( !config.is( configType ) ) config = config._parent;

			return Helpers.getAllProtos( config, proto => proto.is( configType ) );
		}
	},

	/**
	 * Returns new config produced from this one
	 * @param (Object?) newConfig - new config
	 * @param (String?) configType
	 * @return (Object)
	 */
	_newConfig: {
		value( config, configType ) {
			if ( configType === undefined ) {
				if ( typeof config === 'string' ) {
					configType = config;
					config = undefined;
				} else {
					configType = 'Static';
				}
			}

			var currConfig = this;

			if ( config ) {
				// extract all prototypes which is not from current config's chain
				const protos =
						Helpers.getAllProtos(
							config,
							proto => proto !== currConfig && !proto.isPrototypeOf( currConfig )
						);

				var newConfigType, i = protos.length - 1, k, newConfigs;

				while ( i >= 0 ) {
					// if proto is extend config with some type add it with same type
					newConfigType =
						this.isConfig( protos[ i ] ) ? protos[ i ].configType : configType;

					newConfigs = [ protos[ i ] ];

					k = i - 1;
					while (
						k >= 0
						&& this.isConfig( protos[ k ] )
						&& newConfigType === protos[ k ].configType
					) {
						newConfigs.push( protos[ k-- ] );
					}

					currConfig = ConfigTypes[ newConfigType ].newConfig( currConfig, newConfigs );

					i = k;
				}
			} else {
				currConfig = ConfigTypes[ configType ].newConfig( currConfig );
			}

			return currConfig;
		}
	},

	/**
	 * Executes func for each next config type passing it as argument
	 * @param (String) configType - zero config type ( will be omitted )
	 * @param (Function) func( configType )
	 */
	_forEachNextAfter: {
		value( configType, func ) {
			const configTypes = ConfigTypes._index;

			for ( var i = configTypes.indexOf( configType ) + 1; i < configTypes.length; ++i ) {

				if ( this.has( configTypes[ i ] ) ) func( configTypes[ i ] );
			}
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
	_newFinal: {
		value() { return this._newConfig( 'Final' ) }
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
	__getProps: {
		value( options, target, decConfig ) {
			const props = this.getProps( options, target );

			return ExtendDecorator.filterProps( props, decConfig );
		}
	},

	/**
	 * Uses special config by name in func
	 * @param (Object) extendConfigs
	 * @param (String) name
	 * @param (Function) func
	 * @return (Object)
	 */
	_useConfig: {
		value( configs, name, func ) {
			if ( !configs || !configs[ name ] ) return func( this );

			// all final configs will be used in new config's as is
			// to set/get all user defined dynamic properties
			const deepestFinal = Helpers.getDeepestProto( this, proto => proto.isFinal );

			const oldNonFinal = this.getNonFinal();

			var newConfig = oldNonFinal.newConfig( configs[ name ] );

			Object.setPrototypeOf( deepestFinal, newConfig );

			func( this );

			// return final configs back to old non final base
			Object.setPrototypeOf( deepestFinal, oldNonFinal );
		}
	},

	/**
	 * Returns new config from configs and name
	 * @param (Object) extendConfigs
	 * @param (String) name
	 * @param (Function) func
	 * @return (Object)
	 */
	_getConfig: {
		value( configs, name, func ) {
			if ( !configs || !configs[ name ] ) return this;

			return this.newConfig( configs[ name ] );
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
});


/* --------------------------------- Module Exports --------------------------------- */

module.exports = GetConfig;

module.exports.defaultConfig = DefaultConfig;

module.exports.isExtendConfigObject = IsExtendConfigObject;


/* --------------------------------- GetConfig --------------------------------- */

/**
 * Extends default config with provided
 * @param (Object|Array) configs
 * @param (Object?) protoConfig
 * @param (String?) configType
 * @return (Object)
 */
function GetConfig( configs, protoConfig, configType ) {
	var config = protoConfig || DefaultConfig;

	if ( !Array.isArray( configs ) ) configs = [ configs ];

	for ( var i = configs.length; i--; ) {
		if ( configs[ i ].hasOwnProperty( getTypeProp( 'Extend' ) ) || configs[ i ].isFinal ) {
			config = configs[ i ];
			continue;
		}

		config = config._newConfig( configs[ i ], configType );
	}

	return config;
}


/* --------------------------------- IsExtendConfigObject --------------------------------- */

/**
 * Tells if object is extend config
 * @param (Object) obj
 * @return (Boolean)
 */
function IsExtendConfigObject( obj ) { return obj && DefaultConfig.isPrototypeOf( obj ) }


/* --------------------------------- Setup Extend Config --------------------------------- */

/**
 * Initial extendConfig setup
 * @param (Object) config
 * @param (String) configType
 * @return (Object)
 */
function setupExtendConfig( config, configType ) {
	const result = {};
	const propDescriptors = {};
	const props = Object.getOwnPropertyNames( config );

	var descriptor, i, type, prop;

	for ( i = props.length; i--; ) {
		prop = props[ i ];

		descriptor = Object.getOwnPropertyDescriptor( config, prop );

		if ( descriptor.value ) {
			if (
				isExtendConfigMethod( prop, descriptor.value ) && ( type = 'method' )
				|| isExtendConfigGetter( prop, descriptor.value ) && ( type = 'getter' )
			) {
				let extendMethodName = prop;
				let method = descriptor.value;

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

				resultMethod._extendConfig = result;

				switch ( type ) {
					case 'method': descriptor.value = resultMethod;
					break;

					case 'getter':
						delete descriptor.value;
						delete descriptor.writable;
						descriptor.get = resultMethod;
					break;
				}
			}
		}

		propDescriptors[ prop ] = descriptor;
	}

	SetConfigType( result, configType );

	Object.defineProperties( result, propDescriptors );

	return result;
}

/**
 * Setups config type
 * @param (Object) config
 * @param (String) configype
 */
function SetConfigType( config, configType ) {
	Object.defineProperties( config, {
		[ getTypeProp( configType )]: { value: true },
		[ TypeProp ]: { value: configType },
	});
}

/* --------------------------------- Helpers --------------------------------- */

/**
 * Returns true if prop is extendConfig's method
 * @param (String) propName
 * @param (Mixed) value
 * @return (Boolean)
 */
function isExtendConfigMethod( propName, value ) {
	return (
		typeof value === 'function'
		&& (
			DefaultConfigObject.hasOwnProperty( propName )
			&& typeof DefaultConfigObject[ propName ] === 'function'
			|| Helpers.isFirstUpperCased( propName )
		)
	);
}

/**
 * Returns true if prop is extendConfig's property
 * @param (String) propName
 * @param (Mixed) value
 * @return (Boolean)
 */
function isExtendConfigGetter( propName, value ) {
	return (
		typeof value === 'function'
		&& DefaultConfigObject.hasOwnProperty( propName )
		&& typeof DefaultConfigObject[ propName ] !== 'function'
	);
}

/**
 * Returns config type property using configType
 * @param (String) configType
 * @return (String)
 */
function getTypeProp( configType ) { return `__is${configType}Config` }

/**
 * Returns full clone of config prototypes chain with same type
 * @param (Object) config
 * @param (String) configType
 * @return (Object|undefined)
 */
function configFullClone( config, configType ) {
	if ( !config.has( configType ) ) return;

	return Helpers.fullClone( config.getConfig( configType ), proto => proto.is( configType ) );
}

/**
 * Creates new config from config
 * Using array of prototypes in ASC order ( newConfigs )
 * And configType of these configs
 * @param (Object) config
 * @param (Array|Object) newConfigs
 * @param (String) configType
 * @return (Object)
 */
function NewConfig( config, newConfigs, configType ) {
	if ( !Array.isArray( newConfigs ) ) newConfigs = [ newConfigs ];

	var tempConfig = setupExtendConfig( newConfigs.shift(), configType );
	var newConfig = tempConfig;

	Object.setPrototypeOf( newConfig, config.getClosest( configType ) );

	for ( var i = 0; i < newConfigs.length; ++i ) {
		// all protos will be cloned
		// to prevent unexpected mutations of other objects
		tempConfig = setupExtendConfig( newConfigs[ i ], configType );

		// now config object is officially extend config
		Helpers.define( tempConfig, getTypeProp( 'Extend' ), true );

		Object.setPrototypeOf( tempConfig, newConfig );

		newConfig = tempConfig;
	}

	// clone all other upper chain configs by types
	config._forEachNextAfter( configType, configType => {
		const clone = ConfigTypes[ configType ].clone( config );

		if ( clone ) {
			Object.setPrototypeOf( Helpers.getDeepestProto( clone ), newConfig );

			newConfig = clone;
		}
	});

	return newConfig;
}

/**
 * All config types available
 * @type (Object)
 */
const ConfigTypes = {
	Default: {
		newConfig( config, newConfigs ) {
			return NewConfig( config, newConfigs || {}, 'Default' );
		},
		clone(){}
	},
	Base: {
		newConfig( config, newConfigs ) {
			return NewConfig( config, newConfigs || {}, 'Base' );
		},
		clone(){}
	},
	Static: {
		newConfig( config, newConfigs ) {
			return NewConfig( config, newConfigs || {}, 'Static' );
		},
		clone( config ) { return configFullClone( config, 'Static' ) }
	},
	Primary: {
		newConfig( config, newConfigs ) {
			return NewConfig( config, newConfigs || {}, 'Primary' );
		},
		clone( config ) { return configFullClone( config, 'Primary' ) }
	},
	Final: {
		newConfig( config, newConfigs ) {
			// final config is created on top of last config in chain
			const newConfig = Object.create( config.getNonFinal() );

			if ( !config.isFinal ) {
				// for first Final config setup base defaults

				// global is singleton for all configs while Extend in progress
				newConfig.global = {};
				// local will be passed to children configs as clone of current config's local
				newConfig.local = {};

				Object.defineProperties( newConfig.global, {
					__level: { value: -1, writable: true },
				});
			} else {
				newConfig.global = config.global;

				newConfig.local = Object.assign( {}, config.local );
			}

			SetConfigType( newConfig, 'Final' );

			return newConfig;
		},
		clone( config ) {
			const finalConfigs = config._getAllConfigs( 'Final' );

			if ( !finalConfigs ) return;

			finalConfigs.push( {} );

			var test = Helpers.extendAll.apply( null, finalConfigs.reverse() );

			return test;
		},
	},

	_index: [ 'Default', 'Base', 'Static', 'Primary', 'Final' ],
}

/*
-------------------------------
| DefaultConfig ( Default )   |
-------------------------------
		  |
		  V
-------------------------------
| BaseConfig 1 ( Base )       |
-------------------------------
		  |
		  V

		  .
		  .
		  .

		  |
		  V
-------------------------------
| BaseConfig N ( Base )       |
-------------------------------
		  |
		  V
-------------------------------
| UserConfig 1 ( Static )     |
-------------------------------
		  |
		  V

		  .
		  .
		  .

		  |
		  V
-------------------------------
| UserConfig N ( Static )     |
-------------------------------
		  |
		  V
-------------------------------
| PrimaryConfig 1 ( Primary ) |
-------------------------------
		  |
		  V

		  .
		  .
		  .

		  |
		  V
-------------------------------
| PrimaryConfig N ( Primary ) |
-------------------------------
		  |
		  V
-------------------------------
| FinalConfig 1 ( System )    |
-------------------------------
		  |
		  V

		  .
		  .
		  .

		  |
		  V
-------------------------------
| FinalConfig N ( System )    |
-------------------------------
*/
