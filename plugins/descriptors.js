
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
		config = config.newBase( DescriptorsConfig );

		return extend( [ config, target, i, args ] );
	},
};


/* --------------------------------- Descriptors Config --------------------------------- */

const DescriptorsConfig = {
	// if true then same type descriptors will be extended deeply as objects
	// false - descriptors will be replaced
	descriptorsDeep: false,

	// if resolveGetters && deep === true
	// 		- getters will be resolved to check if result is object like to deeply extend it
	resolveGetters: false,

	getProps( options) {
		this._descriptors = {};

		return Object.getOwnPropertyNames( options );
	},

	getFirst( target, name, options ) {
		return (
			this._descriptors[ name ]
			|| this.descriptorsDeep && this.getDescriptor( target, name )
		);
	},

	getSecond: ( options, name, target ) => getDescriptor( options, name ),

	Any( firstDescr, secondDescr, name, target, options ) {
		if ( this.deep ) {
			const second = this._tryToResolve( secondDescr );

			if ( typeof second === 'object' ) {
				var first = this._tryToResolve( firstDescr );

				const extendArgs = [ this.helpers.newObject( second ) ];

				const firstType = this.helpers.getType( first );
				const secondType = this.helpers.getType( second );

				if ( firstType === secondType ) extendArgs.push( first );

				extendArgs.push( second );

				this._descriptors[ name ] = {
					value: this.applyExtend( extendArgs ),
					configurable: true,
					enumerable: true,
					writable: true,
				};

				return;
			}
		}

		if ( firstDescr ) secondDescr = this.applyMethod( 'ExtendDescriptors', arguments );

		this._descriptors[ name ] = secondDescr;
	},

	returnTarget( target ) {
		Object.defineProperties( target, this._descriptors );

		return target;
	},

	ExtendDescriptors( firstDescr, secondDescr, name, target, options ) {
		var extendMethodName = 'AnyDescriptors';

		if ( !this.AnyDescriptors ) {
			const firstType = firstDescr.type;

			extendMethodName =
				firstType === secondDescr.type ? firstType : 'DifferentDescriptors';
		}

		return this.applyMethod( extendMethodName, arguments );
	},

	AnyDescriptors: undefined,

	DifferentDescriptors( firstDescr, secondDescr, name, target, options ) {
		return this.Default.apply( this, arguments );
	},

	Value( firstDescr, secondDescr, name, target, options ) {
		return (
			this.descriptorsDeep ?
				this.BaseExtend( firstDescr, secondDescr ) :
				this.Default.apply( this, arguments )
		);
	},

	GetterSetter( firstDescr, secondDescr, name, target, options ) {
		return this.BaseExtend( this.descriptorsDeep, firstDescr, secondDescr );
	},

	// By default first will be replaced with second
	Default: ( firstDescr, secondDescr, name, target, options ) => secondDescr,


	/* --------------------------------- User Helpers --------------------------------- */

	getDescriptorType,

	getDescriptor,

	/* --------------------------------- Special Helpers --------------------------------- */

	_tryToResolve( descr ) {
		if ( !descr ) return;

		var isValue = descr.type === 'Value';

		if ( !isValue && !this.resolveGetters ) return;

		if ( isValue ) return descr.value;

		try {
			return descr.get && descr.get.call( descr.owner );
		} catch ( e ) {}
	},
};

/* --------------------------------- Helpers --------------------------------- */

function getDescriptor( obj, propName ) {
	const descr = Object.getOwnPropertyDescriptor( obj, propName );

	descr.type = getDescriptorType( descr );
	descr.owner = obj;

	return descr;
}

function getDescriptorType( obj ) {
	if ( !obj ) return;

	return obj.get || obj.set ? 'GetterSetter' : 'Value';
}
