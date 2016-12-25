'use strict';

/* --------------------------------- Required Modules --------------------------------- */

const ExtendBase = require( './extend-base' );

const GetConfig = require( './get-config' );

const Helpers = require( './helpers' );


/* --------------------------------- Module Exports --------------------------------- */

module.exports = ExtendPromise;


/* --------------------------------- Config --------------------------------- */

const baseExtendDifferent = GetConfig.defaultConfig.extendDifferent;

const ExtendPromiseDefaultConfig = {

	extend: ExtendPromiseStart,

	defaultConfig: GetConfig({

		extendProp( first, second, name, target, options ) {
			const result = this.applyOriginMethod( arguments );

			if ( result instanceof Promise ) {
				return result.then( result => ( target[ name ] = result ) );
			}

			return ( target[ name ] = result );
		},

		/**
		 * Main Extend function
		 */
		Extend: ExtendPromise
	})
};


/* --------------------------------- ExtendPromise --------------------------------- */

/**
 * Extends target with other options as arguments
 * @param (ExtendConfig|Boolean?) config - if boolean then deep property will be set
 * @param (Object) target
 * @param (Object) ...options
 * @return (Promise{Object}) - target
 */
function ExtendPromise( target ) {
	return ExtendBase.apply( ExtendPromiseDefaultConfig, arguments );
}


/* --------------------------------- Private --------------------------------- */

// Extends target with each options object
function ExtendPromiseStart( config, target, i, args ) {
	if ( target instanceof Promise ) {
		return (
			target.then( target => ExtendPromiseStart.apply( null, arguments ) )
		);
	};

	const targetValue = Helpers.valueOf( target );
	var targetPromise = Promise.resolve();

	for ( ; i < args.length; ++i ) {
		let options = args[ i ];

		targetPromise =
			targetPromise
				.then( () => _ExtendPromise( config._getConfig( options ), targetValue, options ) );
	}

	return targetPromise.then( () => target );
}

function _ExtendPromise( config, target, options ) {
	if ( options instanceof Promise ) {
		return options.then( options => _ExtendPromise( config, target, options ) );
	}

	if ( !target || !options || target === options && !config.extendSelf ) {
		return Promise.resolve( target );
	}

	options = Helpers.valueOf( options );

	const [ resolvedOptions, decConfig, extendConfigs ] = config._resolveOptions( target, options );

	const props = config._getProps( resolvedOptions, target, decConfig );

	const names = [];
	const secondPromises = [];
	const secondConfigs = [];

	var first, second, name, secondConfig, i;

	for ( i = props.length; i--; ) {
		name = props[ i ];

		secondConfig = config._getConfig( extendConfigs, name );

		second = secondConfig.getSecond( resolvedOptions, name, target );

		names.push( name );

		secondPromises.push( Promise.resolve( second ) );

		secondConfigs.push( secondConfig );
	}

	config._extendDecoratorsConfig( target, options );

	return (
		Promise
			.all( secondPromises )
			.then( results => _extend( results, config, target, options, names, secondConfigs ) )
	);
}
function _extend( results, config, target, options, names, secondConfigs ) {
	var first, second, name, secondConfig, i;
	var promise, promises = [];

	for ( i = results.length; i--; ) {
		name = names[ i ];
		secondConfig = secondConfigs[ i ];
		second = results[ i ];

		first = config.getFirst( target, name, options );

		promise = secondConfig.extendProp( first, second, name, target, options );

		if ( promise ) promises.push( promise );
	}

	return Promise.all( promises );
}
