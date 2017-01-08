
/* --------------------------------- Required Modules --------------------------------- */

const Plugins = require( './plugins' );

const GetConfig = require( './get-config' );

const PrepareArguments = require( './prepare-arguments' );


/* --------------------------------- Module Exports --------------------------------- */

const ExtendPrototype = module.exports = Object.create( Function.prototype, {
	_start: {
		value() {
			const args = PrepareArguments( arguments, this._defaultConfig );

			const config = args[ 0 ]._newFinal();

			PrepareArguments.prepareConfig( config );

			args[ 0 ] = config;

			config._goDeeper();

			const result = this._extend.apply( this, args );

			config._goHigher();

			return result;
		}
	},

	_pluginExtend: {
		value( args, callback ) {
			return ( callback || defaultCallback )( this.apply( this, args ) );
		}
	},
});

module.exports.setupPlugins = SetupPlugins;

module.exports.config = PrepareArguments.extendConfig;

module.exports.isExtendConfig = PrepareArguments.isExtendConfig;


/* --------------------------------- SetupPlugins  --------------------------------- */

SetupPlugins( Plugins );

function SetupPlugins( plugins ) {
	const descriptors = {};

	for ( let i in plugins ) {
		descriptors[ i ] = {
			get() {
				const name = `_${i}`;

				if ( !this[ name ] ) {
					const that = this;

					const pluginFunc =
							function ( /* user args */ ) {
								const args = PrepareArguments( arguments, that._defaultConfig );
// console.log('----------------');
// console.log(require('./helpers').getAllProtos( args[0] ));
								args.unshift( that._pluginExtend.bind( that ) );

								return plugins[ i ].apply( null, args );
							};

					Object.setPrototypeOf( pluginFunc, ExtendPrototype );

					this[ name ] = pluginFunc.bind( pluginFunc );
				}

				return this[ name ];
			}
		};
	}

	Object.defineProperties( ExtendPrototype, descriptors );
}

/* --------------------------------- Helpers --------------------------------- */

function defaultCallback() { return arguments[ 0 ] }
