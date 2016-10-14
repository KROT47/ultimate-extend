# UltimateExtend

Extends target with other object's properties. Works like 'extend' module, but has several updates:  
1. First argument can be of type *Boolean* and also *UltimateExtend.config* ( defines how extend works )
2. If objects to extend from are Promises or contain promises in properties you can use *Extend.promise* instead of *Extend*. Then it will return promise of Extended object.

**Usage:**

```js

// UltimateExtend( [{config|Boolean,ExtendConfig}, ]{target|Object,Function}, ...{options|Object,Function} ) => {Object}

// UltimateExtend.promise( [{config|Boolean,ExtendConfig}, ]{target|Object,Function}, ...{options|Object,Function} ) => {Promise{Object}}

// UltimateExtend.config( {config|Object} ) => {ExtendConfig}


/* --------------------------------- Extend --------------------------------- */

var Extend = require( 'ultimate-extend' );

/* ------------ Simple usage ------------- */
var target = {},
    a = { a: { a: [ '1' ] } },
    b = { a: { a: [ 2 ], b: 2 } };

Extend( true, target, a, b ); // working as expected

console.log( target ); // => { a: { a: [ 2 ], b: 2 } }


/* ------------ Advanced usage ------------- */

var config = Extend.config({
    // if true: deeper objects will be extended too
    deep: true,
    
    // by default returns property from object to extend from by name
    // you can set some special conditions
    // e.g. to extend only from all properties with name beginning with underscore, like '_test':
    // getOption: ( options, name ) => {
    //      if ( name.match( /^_/ )
	//			|| options[ name ] && typeof options[ name ] === 'object'
	//		) {
	//			return options[ name ];
	//		}
	//      // undefined must be returned to prevent property extension
    // }
    
    extendSimilar: {
        Array: ( first, second, config ) => first.concat( second )
        // Object: ( first, second, config ) => ...
        // Function: ( first, second, config ) => ...
        // ... any other type replacement
        //      - replacement occures only when both first and second are having the same type
        //      - here first is target's property and second is some object's property
    }
    
    // executes when target property and options property have different types
    // extendDifferent: ( first, second, config ) => { ... return newTargetProp }
    
    // also you can define extend method which will be used on deeper properties
    // so if deep is true then config.extend will handle next deeper extend iterations
    // Experimental ( not tested )
    // extend: Extend || Extend.promise || YourFunc
});

var target = {}; // renew target; a, b are taken from example above

Extend( config, target, a, b ); // now all arrays are concatenated instead of extending

console.log( target ); // => { a: { a: [ '1', 2 ], b: 2 } }


/* --------------------------------- Extend.promise --------------------------------- */

var Extend = require( 'ultimate-extend' );

var target = {},
    a = { a: { a: Promise.resolve( [ '1' ] ) } },
    b = { a: { a: [ 2 ], b: new Promise( resolve => setTimeout( () => resolve( 2 ), 500 ) ) } };

Extend.promise( true, target, a, b )
    .then( () => {
        console.log( target ); // => { a: { a: [ 2 ], b: 2 } }
    })
```
