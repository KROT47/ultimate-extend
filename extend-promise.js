'use strict';

/* --------------------------------- Required Modules --------------------------------- */

const ExtendBase = require( './extend-base' );

const GetConfig = require( './get-config' );

const GetType = require( 'get-explicit-type' );


/* --------------------------------- Module Exports --------------------------------- */

module.exports = ExtendPromise;


/* --------------------------------- Config --------------------------------- */

const baseExtendDifferent = GetConfig.defaultConfig.extendDifferent;

// const baseExtendSimilarObject = GetConfig.defaultConfig.extendSimilar.Object;

const ExtendPromiseDefaultConfig = {

	extend: _ExtendPromiseStart,

	defaultConfig: GetConfig({
		/**
		 * Main Extend function
		 */
		extend: ExtendPromise
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
	return ExtendBase.apply( ExtendPromiseDefaultConfig, Array.prototype.slice.call( arguments ) );
}


/* --------------------------------- Private --------------------------------- */

// Extends target with each options object
function _ExtendPromiseStart( config, target, i, args ) {
	if ( target instanceof Promise ) {
		return (
			target.then( target => _ExtendPromiseStart( config, target, i, args ) )
		);
	};

	var targetPromise = _ExtendPromise( config, target, args[ i++ ] );

	for ( ; i < args.length; ++i ) {
		let options = args[ i ];

		targetPromise =
			targetPromise.then( () => _ExtendPromise( config, target, options ) );
	}

	return targetPromise;
}

function _ExtendPromise( config, target, options ) {
	if ( options instanceof Promise ) {
		return options.then( options => _ExtendPromise( config, target, options ) );
	}

	if ( !target || !options ) return Promise.resolve( target );

	if ( typeof target.valueOf === 'function' ) target = target.valueOf();
	if ( typeof options.valueOf === 'function' ) options = options.valueOf();

	var option, names = [], optionPromises = [];

	for ( var name in options ) {
		option = config.getOption( options, name );

		names.push( name );

		optionPromises.push( Promise.resolve( option ) );
	}

	return (
		Promise
			.all( optionPromises )
			.then( results => {
				var promises = [], result;

				for ( var i = results.length; i--; ) {
					let name = names[ i ];

					result = config.extendProp( target[ name ], results[ i ], config, name );

					if ( result instanceof Promise ) {
						promises.push( result.then( result => ( target[ name ] = result ) ) );
					} else {
						target[ name ] = result;
					}
				}

				return Promise.all( promises );
			})
			.then( () => target )
	);
}
