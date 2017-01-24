
/* --------------------------------- Required Modules --------------------------------- */

const Extend = require( '../' );


/* --------------------------------- Decorators --------------------------------- */

const Decorators = {
		/* ------------ Decorator-Functions ------------- */

		/**
		 * All decorator-functions will receive these arguments
		 * @param (Mixed) option - current options[ name ]
		 * @param (Object) target - extension object
		 * @param (Object) options - extension subject
		 * @param (String) name - decorator's property name
		 */

		/**
		 * Property function will be executed to get result
		 */
		getter: {
			func( option, target, options, name ) {
				return option.call( this, target, options, name );
			},
		},

		/**
		 * Property will be skipped by extend
		 */
		skip: {
			func( option, target, options, name ) { return undefined },
		},


		/* ------------ Decorator-Configs ------------- */

		/**
		 * Extend config will be extended with one or more of these configs
		 * Config methods with same name will be executed one by one to get final value
		 * See extend-decorator-tests for examlpe
		 */

		deep: {
			config: { deep: true },
		},

		concat: {
			config: { Array: ( first, second, name ) => first.concat( second ) },
		},

		concatReverse: {
			config: { Array: ( first, second, name ) => second.concat( first ) },
		},


		/* ------------ Decorator-Functions with arguments ------------- */

		dependsOn( /*prop1, prop2, ...*/ ) {
			const dependsOnProps = Array.prototype.slice.call( arguments );

			return {
				configExtension: {
					name: 'dependsOn',

					initCtx() {
						const extCtx = {};

						Object.defineProperty( extCtx, '_getDependsOnProps', {
							value() {
								const props = Object.keys( this );

								return props.sort( ( a, b ) => ~this[ a ].indexOf( b ) ? 1 : 0 );
							}
						});

						return extCtx;
					},

					updateCtx( extCtx, target, name, descriptor ) {
						// const oldDependsOnProps = extCtx.dependsOnProps;
						extCtx[ name ] = dependsOnProps;
					},

					getConfig( extCtx ) {
						return {
							getProps( options, target ) {
								const props = this.applyOrigin( arguments );

								const dependsOnProps = extCtx._getDependsOnProps();
								var i, index, propsToAdd = [];

								for ( i = 0; i < dependsOnProps.length; ++i ) {
									if ( ~( index = props.indexOf( dependsOnProps[ i ] ) ) ) {
										propsToAdd.push( dependsOnProps[ i ] );
										props.splice( index, 1 );
									}
								}

								return props.concat( propsToAdd );
							}
						};
					},
				},
			};
		},
	};


/* --------------------------------- Module Exports --------------------------------- */

module.exports = setupGetters( Decorators );


/* ------------ Private ------------- */

module.exports._defaultConfig = Decorators;


/* --------------------------------- DecoratorFactory --------------------------------- */

/**
 * Returns decorator function
 * @param (String) decoratorName
 * @return (Function)
 */
function DecoratorFactory( decoratorName ) {
	if ( !Cache[ decoratorName ] ) {
		if ( !Decorators[ decoratorName ] ) throw Error( `Decorator ${decoratorName} is unknown` );

		Cache[ decoratorName ] = Extend.decorator( Decorators[ decoratorName ] );
	}

	return Cache[ decoratorName ];
}


/* --------------------------------- Helpers --------------------------------- */

const Cache = {};

/**
 * Returns object created from obj where values replaced with special getters
 * @param (Object) obj
 * @return (Object)
 */
function setupGetters( obj ) {
	const descriptors = {};

	for ( let i in obj ) descriptors[ i ] = { get: () => DecoratorFactory( i ), enumerable: true };

	return Object.create( Object.prototype, descriptors );
}
