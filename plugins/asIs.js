
/* --------------------------------- Module Exports --------------------------------- */

module.exports = {
	/**
	 * None of decorated properties will be resolved but instead decorated configs will be extended
	 * @param (Function) extend( args, after )
	 * @param (Object) config
	 * @param (Object|Array|Function) target
	 * @param (Number) i - index in args from which starts objects to extend from
	 * @param (Array) args - all arguments passed to extend by user
	 * @return (Object|Array|Function) - extend final result ( target )
	 */
	asIs( extend, config, target, i, args ) {
		return extend( [ config.newPrimary({ resolve: false }), target, i, args ] );
	},
};
