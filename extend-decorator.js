
/* --------------------------------- Required Modules --------------------------------- */

const Extend = require( './' );

const Helpers = require( './helpers' );


/* --------------------------------- Module Exports --------------------------------- */

module.exports = ExtendDecorator;

module.exports.getConfig = GetConfig;

module.exports.setConfig = SetConfig;

module.exports.updateConfig = UpdateConfig;

module.exports.filterProps = FilterProps;


/* --------------------------------- Constants --------------------------------- */

const DecoratorsConfigPropName = '__decoratorsConfig';


/* --------------------------------- ExtendDecorator --------------------------------- */

/**
 * Returns property decorator to use some extend config over this property
 * @param (Object|Function|Array{Object|Function}) decorators
 * @return (Function)
 */
function ExtendDecorator( decorators ) {
	return function ( target, name, descriptor ) {
		return SetupDecoratorsConfig( arguments, decorators );
	};
}

/**
 * Adds or updates decorators config
 * @param (Arguments) args
 * @param (Object|Function|Array{Object|Function}) decorators
 * @param (Object?) config - special decorator config
 * @return (Object|Function?)
 */
function SetupDecoratorsConfig( args, decorators ) {
	if ( typeof decorators === 'function' ) {
		return function ( target, name, descriptor ) {
			decorators = decorators.apply( null, args );

			return SetupDecoratorsConfig( arguments, decorators );
		};
	}

	const [ target, name, descriptor ] = Array.prototype.slice.call( args );

	const decConfig = GetConfig( target, true );

	var config, prop, i;

	if ( !Array.isArray( decorators ) ) decorators = [ decorators ];

	for ( i = 0; i < decorators.length; ++i ) {
		for ( prop in decorators[ i ] ) {
			config = decorators[ i ][ prop ];

			switch ( prop ) {
				case 'func':
					decConfig.decorators = decConfig.decorators || {};

					decConfig.decorators[ name ] =
						Helpers.arrayPush( decConfig.decorators[ name ], config );
				break;

				case 'config':
					decConfig.configs = decConfig.configs || {};

					// two methods with same names
					// will be combined to execute one by one to get final result
					decConfig.configs[ name ] =
						Extend( getMergeMethodsConfig(), decConfig.configs[ name ] || {}, config );
				break;

				case 'configExtension':
					decConfig.configExtensions = decConfig.configExtensions || {};

					if ( !decConfig.configExtensions[ config.name ] ) {
						decConfig.configExtensions[ config.name ] = {
							extCtx: config.initCtx(),
							getConfig: config.getConfig
						};
					}

					const extCtx = decConfig.configExtensions[ config.name ].extCtx;

					config.updateCtx( extCtx, target, name, descriptor );
				break;
			}
		}
	}

	checkForUnallowedMethods( decConfig.configs && decConfig.configs[ name ] );

	var baseGet, baseSet;

	if ( descriptor.get || descriptor.set ) {
		baseGet = descriptor.get;
		baseSet = descriptor.set;
	} else {
		if ( descriptor.initializer ) {
			baseGet = descriptor.initializer;
		} else {
			baseGet = function () { return descriptor.value };
		}

		baseSet = function ( value ) { Object.defineProperty( this, name, getDescr({ value }) ) };
	}

	const newDescriptor = {
			get: baseGet,

			set( value ) {
				// on explicit property set decorator will be removed
				delete decConfig[ name ];
				baseSet && baseSet.apply( this, arguments );
			},

			configurable: true
		};

	return newDescriptor;

	/*
	Example of target new hidden property:
	__decConfig: {
		decorators: {
			a: [ func1, func2 ]
		},
		configs: {
			b: { deep: true }
		},
		configExtensions: {
			dependsOn: {
				extCtx: {
					b: [ 'a', 'c' ]
				},
				getConfig: function( extCtx ) { ... }
			},
		},
	}*/
}

/**
 * Checks that decorators do not use unallowed methods
 * @param (Object) config
 */
function checkForUnallowedMethods( config ) {
	if ( !config ) return;

	for ( var i in unallowedMethods ) if ( config[ i ] ) throw Error( unallowedMethods[ i ] );
}
const unallowedMethods = {
		getProps: 'getProps can not be used in decorators due to unexpected errors',
		getOption: 'getOption can not be used in decorators due to unexpected errors. Try to use getters functions instead',
	};


/* --------------------------------- Config Helpers --------------------------------- */

/**
 * Returns target decorators config
 * @param (Object) target
 * @param (Boolean) forceCreate - if true config instance will be created if not exists
 * @return (Object|undefined)
 */
function GetConfig( target, forceCreate ) {
	if ( !target ) return;

	if ( forceCreate && !target[ DecoratorsConfigPropName ] ) SetConfig( target, {} );

	return target[ DecoratorsConfigPropName ];
}

/**
 * Setups decorators config property in target
 * @param (Object) target
 * @param (Object) decoratorsConfig
 * @return (Object|undefined)
 */
function SetConfig( target, decoratorsConfig ) {
	Object.defineProperty( target, DecoratorsConfigPropName, {
		value: Extend.descriptors( true, {}, decoratorsConfig ),
		configurable: true
	});
}

/**
 * Updates decorators config in target from options ( when !config.resolve )
 * @param (Object) target
 * @param (Object) options
 */
function UpdateConfig( target, options ) {
	const targetConfig = GetConfig( target );
	const optionsConfig = GetConfig( options );

	if ( !targetConfig ) return optionsConfig && SetConfig( target, optionsConfig );

	updateConfig( options, optionsConfig, targetConfig, 'decorators' );
	updateConfig( options, optionsConfig, targetConfig, 'configs' );

	UpdateConfigExtensions( options, targetConfig, optionsConfig );
}
function UpdateConfigExtensions( options, targetConfig, optionsConfig ) {
	const targetConfigExtensions = targetConfig.configExtensions;
	const optionsConfigExtensions = optionsConfig && optionsConfig.configExtensions;

	if ( !targetConfigExtensions ) {
		if ( optionsConfigExtensions ) {
			targetConfig.configExtensions = Extend.descriptors( true, {}, optionsConfigExtensions );
		}
		return;
	}

	var oce, tce, i;
	for ( i in targetConfigExtensions ) {
		oce = optionsConfigExtensions && optionsConfigExtensions[ i ];
		tce = targetConfigExtensions[ i ];
		updateConfig( options, oce, tce, 'extCtx' );
	}
}
function updateConfig( options, optionsConfig, config, name ) {
	if ( config[ name ] && Object.keys( config[ name ] ).length ) {
		if ( _updateConfig( options, config[ name ], optionsConfig && optionsConfig[ name ] ) ) {
			delete config[ name ];
		}
	} else if ( optionsConfig && optionsConfig[ name ] ) {
		config[ name ] = Extend.descriptors( true, {}, optionsConfig[ name ] );
	}
}
function _updateConfig( options, conf1, conf2 ) {
	for ( var i in conf1 ) {
		if ( !( conf2 && conf2[ i ] ) && options[ i ] !== undefined ) delete conf1[ i ];
	}

	conf2 && Object.assign( conf1, conf2 );

	if ( !Object.keys( conf1 ).length ) return true;
}


/* --------------------------------- FilterProps --------------------------------- */

/**
 * Returns prop names array where all system prop names are removed
 * @param (Array) props
 * @param (Object) decConfig
 * @return (Array)
 */
function FilterProps( props, decConfig ) {
	if ( decConfig ) {
		const index = props.indexOf( DecoratorsConfigPropName );
		~index && props.splice( props.indexOf( DecoratorsConfigPropName ), 1 );
	}

	return props;
}

/* --------------------------------- Helpers --------------------------------- */

/**
 * Returns extend config to merge two functions into one to execute one by one
 * @return (ExtendConfig)
 */
function getMergeMethodsConfig() {
	if ( !MergeMethodsConfig ) {
		MergeMethodsConfig =
			Extend.config({
				Function( firstFunc, secondFunc ) {
					return function ( first, second, name ) {
						const result = firstFunc.apply( this, arguments );

						return secondFunc.call( this, first, result, name );
					};
				}
			});
	}

	return MergeMethodsConfig;
}
var MergeMethodsConfig;

function getDescr( descr ) {
	const newDescr = {};

	if ( !descr.get && !descr.set ) newDescr.writable = true;

	return Object.assign( newDescr, BaseDescr, descr );
}

const BaseDescr = { configurable: true, enumerable: true };
