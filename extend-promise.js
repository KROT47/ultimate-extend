'use strict';

/* --------------------------------- Module Exports --------------------------------- */

const ExtendPromise = module.exports = ExtendPromiseUnbinded.bind( ExtendPromiseUnbinded );


/* --------------------------------- Required Modules --------------------------------- */

const ExtendPrototype = require( './extend-prototype' );

const GetConfig = require( './get-config' );

const Helpers = require( './helpers' );


/* --------------------------------- ExtendPromise Prototype --------------------------------- */

ExtendPromise._pluginExtend = function ( args, callback ) {
	return this.apply( this, args ).then( callback || defaultCallback );
};

Object.setPrototypeOf( ExtendPromise, ExtendPrototype );

/* --------------------------------- Config --------------------------------- */

ExtendPromise._defaultConfig = GetConfig({
	/**
	 * Main Extend function
	 */
	Extend: ExtendPromise
}, undefined, 'Base' );

ExtendPromise._extend = ExtendPromiseStart;


/* --------------------------------- ExtendPromise --------------------------------- */

/**
 * Extends target with other options as arguments
 * @param (ExtendConfig|Boolean?) config - if boolean then deep property will be set
 * @param (Object) target
 * @param (Object) ...options
 * @return (Promise{Object}) - target
 */
function ExtendPromiseUnbinded( target ) {
	return ExtendPromise._start.apply( ExtendPromise, arguments );
}

/* --------------------------------- Private --------------------------------- */

// Extends target with each options object
function ExtendPromiseStart( config, target, i, args ) {
	if ( target instanceof Promise ) {
		const currArgs = Array.prototype.slice.call( arguments );

		return (
			target.then( target => {
				currArgs.splice( 1, 1, target );
				return ExtendPromiseStart.apply( null, currArgs );
			})
		);
	};

	const targetValue = Helpers.valueOf( target );
	var targetPromise = Promise.resolve();

	for ( ; i < args.length; ++i ) {
		let options = args[ i ];

		targetPromise =
			targetPromise.then( () => _ExtendPromise( config, targetValue, options ) );
	}

	return targetPromise.then( () => config.returnTarget( target ) );
}

function _ExtendPromise( config, target, options ) {
	if ( options instanceof Promise ) {
		return options.then( options => _ExtendPromise( config, target, options ) );
	}

	if ( !target || !options || target === options && !config.extendSelf ) {
		return Promise.resolve( target );
	}

	options = Helpers.valueOf( options );

	const [ resolvedOptions, optionsConfig, decConfig, extendConfigs ] =
			config._resolveOptions( target, options );

	const props = optionsConfig.__getProps( resolvedOptions, target, decConfig );

	const names = [];
	const secondPromises = [];
	const secondConfigs = [];

	var first, second, name, secondConfig, i;

	for ( i = props.length; i--; ) {
		name = props[ i ];

		secondConfig = config._getConfig( extendConfigs, name );

		second = optionsConfig.newConfig( secondConfig ).getSecond( resolvedOptions, name, target );

		names.push( name );

		secondPromises.push( Promise.resolve( second ) );

		secondConfigs.push( secondConfig );
	}

	optionsConfig._extendDecoratorsConfig( target, options );

	return (
		Promise
			.all( secondPromises )
			.then( results => _extend( results, config, optionsConfig, target, options, names, secondConfigs ) )
	);
}
function _extend( results, config, optionsConfig, target, options, names, secondConfigs ) {
	var first, second, secondConfig, i;
	var result, promises = [];

	for ( i = results.length; i--; ) {
		let name = names[ i ];
		secondConfig = secondConfigs[ i ];
		second = results[ i ];

		first = optionsConfig.getFirst( target, name, options );

		result = secondConfig.extendProp( first, second, name, target, options );

		if ( !( result instanceof Promise ) ) result = Promise.resolve( result );

		promises.push(
			result.then( result => result !== undefined && ( target[ name ] = result ) )
		);
	}

	return Promise.all( promises );
}
