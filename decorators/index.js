
/* --------------------------------- Required Modules --------------------------------- */

const Extend = require( '../' );


/* --------------------------------- Decorators --------------------------------- */

const Decorators = {
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
		getter( option, target, options, name ) {
			return option.call( this, target, options, name );
		},


		/* ------------ Config Extensions ------------- */

		/**
		 * Extend config will be extended with one or more of these configs
		 * Config methods with same name will be executed one by one to get final value
		 * See extend-decorator-tests for examlpe
		 */

		deep: { deep: true },

		concat: { Array: ( first, second, name ) => first.concat( second ) },

		concatReverse: { Array: ( first, second, name ) => second.concat( first ) }
	};


/* --------------------------------- Module Exports --------------------------------- */

module.exports = setupGetters( Decorators );

module.exports.config = Decorators;


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
