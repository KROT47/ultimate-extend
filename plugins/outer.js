

/* --------------------------------- Module Exports --------------------------------- */

module.exports = {
	/**
	 * Allows to extend any type of variables as if they were properties in some object
	 * E.g.
	 * 	config = Extend.config({ String: ( first, second ) => first + second })
	 * 	Extend.outer( config, '1', '2' ) => '12'
	 * 	Extend.outer( config, [ '1' ], [ '2' ] ) => [ '12' ]
	 * @param (Function) extend( args, after )
	 * @param (Object) config
	 * @param (Object|Array|Function) target
	 * @param (Number) i - index in args from which starts objects to extend from
	 * @param (Array) args - all arguments passed to extend by user
	 * @return (Object|Array|Function) - extend final result ( target )
	 */
	outer( extend, config, target, i, args ) {
		if ( !Array.isArray( args ) ) args = Array.prototype.slice.call( args );

		args = args.map( ( value, index ) => index >= i - 1 ? { outer: value } : value );

		config = config.newPrimary({
			get level() { return this.global.__level - 1 },
			set level( value ) { this.global.__level = value + 1 },

			deep() { return this.level === -1 || this.callOrigin() },
		});


		return extend( [ config, {}, i - 1, args ], target => target.outer );
	}
};
