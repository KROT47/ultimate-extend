
/* --------------------------------- Required Modules --------------------------------- */

const Extend = require( 'extend' );

const Helpers = require( '../helpers' );


/* --------------------------------- TestHelpers --------------------------------- */

const TestHelpers = Extend( {}, Helpers, {
    sameProps,
    clone,
});


/* --------------------------------- Module Exports --------------------------------- */

module.exports = TestHelpers;


/* --------------------------------- Helpers --------------------------------- */

/**
 * Deeply checks if two objects have same properties and values
 * @param (Boolean) allProps - if true then all even non-enumerable properties will be checked
 * @param (Object) first
 * @param (Object) second
 * @return (Boolean)
 */
function sameProps( allProps, first, second ) {
    var end = arguments[ 3 ]; // tells that is final second to first comparison

    if ( typeof allProps !== 'boolean' ) {
        second = first;
        first = allProps;
        allProps = false;
    }

    first = TestHelpers.valueOf( first );
    second = TestHelpers.valueOf( second );

    // if ( !first && second ) return false;
// console.log('first',Object.getOwnPropertyNames(first));
// console.log('second',Object.getOwnPropertyNames(second));
    if ( !first ) return /*console.log(1) ||*/ first === second;

    if ( typeof first === 'object' ) {
        const propNames = allProps ? Object.getOwnPropertyNames( first ) : Object.keys( first );
        var prop, type, i;

        for ( i = propNames.length; i--; ) {
            prop = propNames[ i ];

            type = typeof first[ prop ];

            if ( !second ) return /*console.log(2) ||*/ false;

            if ( type !== typeof second[ prop ] ) return /*console.log(3) ||*/ false;

            if ( type === 'object' ) {
                if ( !sameProps( allProps, first[ prop ], second[ prop ] ) ) return /*console.log(4) ||*/ false;
                continue;
            }
// console.log('prop',prop);
// console.log('first',first[ prop ]);
// console.log('second',second[ prop ]);
            if ( first[ prop ] !== second[ prop ] ) return /*console.log(5) ||*/ false;
        }
    } else {
        if ( first !== second ) return /*console.log(6) ||*/ false;
    }

    return /*console.log(7) ||*/ end ? true : sameProps( allProps, second, first, true );
}

function clone( obj ) {
    return obj && Extend( true, TestHelpers.newObject( obj ), TestHelpers.valueOf( obj ) ) || obj;
}
