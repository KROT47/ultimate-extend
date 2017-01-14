
/* --------------------------------- Module Exports --------------------------------- */

module.exports = {
	/**
	 * Extends object properties using descriptors not values
	 * @param (Function) extend( args, after )
	 * @param (Object) config
	 * @param (Object|Array|Function) target
	 * @param (Number) i - index in args from which starts objects to extend from
	 * @param (Array) args - all arguments passed to extend by user
	 * @return (Object|Array|Function) - extend final result ( target )
	 */
	descriptors( extend, config, target, i, args ) {
		config =
			config
				.newBase( BaseDescriptorsConfig )
				.newPrimary( PrimaryDescriptorsConfig );

		return extend( [ config, target, i, args ] );
	},
};


/* --------------------------------- Descriptors Config --------------------------------- */

/* ------------ PrimaryDescriptorsConfig ------------- */

// Primary config could be overloaded only with another Primary config
const PrimaryDescriptorsConfig = {

	getProps( options, target ) {
		if ( !target.__HiddenDescriptors ) target.__HiddenDescriptors = {};

		return this.applyOrigin( arguments );
	},

	extendProp( firstDescr, secondDescr, name, target, options ) {
		if ( !isDescriptors( arguments ) ) return this.applyOrigin( arguments );

		var extendMethodName = 'AnyDescriptors';

		if ( !this.AnyDescriptors ) {
			const firstType = firstDescr && firstDescr.type || undefined;

			extendMethodName =
				firstType === secondDescr.type ? firstType : 'DifferentDescriptors';
		}

		target.__HiddenDescriptors[ name ] = this.applyMethod( extendMethodName, arguments );
	},
};


/* ------------ BaseDescriptorsConfig ------------- */

// Base config may be overloaded by any config ( Primary, Static, Base )
const BaseDescriptorsConfig = {
	// if true then same type descriptors will be extended deeply as objects
	// false - descriptors will be replaced
	descriptorsDeep: false,

	// finds all property names even for non enumerable properties
	getProps( options, target ) {
		const type = eval( this.helpers.getType( options ) );

		var props = this._getPropNames( options );

		var protoProps;

		while ( ( options = Object.getPrototypeOf( options ) ) && options !== type.prototype ) {
			protoProps = this._getPropNames( options );

			props = props.concat( protoProps.filter( item => !~props.indexOf( item ) ) );
		}

		return props;
	},

	getFirst( target, name, options ) {
		return (
			target.__HiddenDescriptors[ name ]
			|| this.getDescriptor( target, name )
			|| getUndefinedValueDescr()
		);
	},

	getSecond( options, name, target ) { return getDescriptor( options, name ) },

	returnTarget( target ) {
		// only in the end all descriptors will be defined as properties
		// this prevents error when trying to redefine non-configurable prop in process
		if ( !this.level ) this._setupHiddenDescriptors( target );

		return target;
	},

	AnyDescriptors: undefined,

	DifferentDescriptors( firstDescr, secondDescr, name, target, options ) {
		return this.applyMethod( 'DefaultDescriptor', arguments );
	},

	Value( firstDescr, secondDescr, name, target, options ) {
		const descr =
			this.descriptorsDeep ?
				Object.assign( {}, firstDescr, secondDescr ) :
				Object.assign( {}, secondDescr );

		descr.value =
			this.applyMethod( 'extendProp', arguments, {
				0: firstDescr.value,
				1: secondDescr.value,
			});

		return descr;
	},

	GetterSetter( firstDescr, secondDescr, name, target, options ) {
		return (
			this.descriptorsDeep ?
				Object.assign( {}, firstDescr, secondDescr ) :
				this.applyMethod( 'DefaultDescriptor', arguments )
		);
	},

	// By default first will be replaced with second
	DefaultDescriptor: ( firstDescr, secondDescr, name, target, options ) => secondDescr,


	/* --------------------------------- Private --------------------------------- */

	_setupHiddenDescriptors( target ) {
		var descr, i;

		for ( i in target.__HiddenDescriptors ) {
			descr = target.__HiddenDescriptors[ i ];

			if ( descr.type === 'Value' && descr.value.__HiddenDescriptors ) {
				this._setupHiddenDescriptors( descr.value );
			}
		}

		Object.defineProperties( target, target.__HiddenDescriptors );
		delete target.__HiddenDescriptors;
	},

	_getPropNames( obj ) {
		const props = Object.getOwnPropertyNames( obj );

		if ( Array.isArray( obj ) ) props.splice( props.indexOf( 'length' ), 1 );

		return props;
	},


	/* --------------------------------- User Helpers --------------------------------- */

	getDescriptorType,

	getDescriptor,
};


/* --------------------------------- Helpers --------------------------------- */

/**
 * Returns prepared object property descriptor
 * @param (Object) obj
 * @param (String) propName
 * @return (Object)
 */
function getDescriptor( obj, propName ) {
	const descr = _getDescriptor( obj, propName );

	if ( !descr ) return;

	return initDescriptor( descr, obj );
}
function _getDescriptor( obj, propName ) {
	var descr = Object.getOwnPropertyDescriptor( obj, propName );

	while ( !descr && ( obj = Object.getPrototypeOf( obj ) ) && obj !== Object.prototype ) {
		descr = Object.getOwnPropertyDescriptor( obj, propName );
	}

	return descr;
}

/**
 * Checks if at least one of first two arguments is descriptor
 * @param (Arguments) args
 * @return (Boolean)
 */
function isDescriptors( args ) {
	const arg = args[ 0 ] !== undefined ? args[ 0 ] : args[ 1 ];

	return typeof arg === 'object' && arg.__isDescriptor;
}

/**
 * Returns prepared Value descriptor with value === undefined
 * @return (Object)
 */
function getUndefinedValueDescr() {
	return initDescriptor({
		value: undefined,
		configurable: true,
		enumerable: true,
		writable: true,
	});
}

/**
 * Prepares descriptor
 * @param (Object) descr
 * @param (Object?) owner
 * @return (Object)
 */
function initDescriptor( descr, owner ) {
	descr.type = getDescriptorType( descr );
	descr.owner = owner;
	descr.__isDescriptor = true;

	return descr;
}

/**
 * Returns descriptor type
 * @param (Object) descr
 * @return (String)
 */
function getDescriptorType( descr ) {
	if ( !descr ) return;

	return descr.get || descr.set ? 'GetterSetter' : 'Value';
}
