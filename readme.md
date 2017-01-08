# UltimateExtend

Extends target with other object's properties. Works like 'extend' module, but has several updates:  
1. First argument can be of type *Boolean* and also *UltimateExtend.config* ( defines how extend works )
2. If objects to extend from are Promises or contain promises in properties you can use *Extend.promise* instead of *Extend*. Then it will return promise of Extended object.

**Installation**
```bash
# version 2.x ( alpha )
npm install ultimate-extend --save

# version 1.x ( stable )
npm install ultimate-extend@1.0.1 --save
```

**OLD Readme v1.0.1 - for v2.x see tests**
**TODO: Update this ReadMe**


**Usage:**

```js

// UltimateExtend( [{config|Boolean,ExtendConfig}, ]{target|Object,Function}, ...{options|Object,Function} ) => {Object}

// UltimateExtend.outer( [{config|Boolean,ExtendConfig}, ] ...{options|Object,Function} ) => {Object}

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

    // if true: allows to extend object with itself ( careful here )
    extendSelf: false,
    
    // by default returns property from object to extend from by name
    // you can set some special conditions
    // e.g. to extend only from all properties with name beginning with underscore, like '_test':
    // getOption: ( options, name, config, target ) => {
    //      if ( name.match( /^_/ )
    //          || options[ name ] && typeof options[ name ] === 'object'
    //      ) {
    //          return options[ name ];
    //      }
    //      // undefined must be returned to prevent property extension
    // }
    
    // config to extend properties with similar types
    extendSimilar: {
        Array: ( first, second, config, name ) => first.concat( second )
        // Object: ( first, second, config, originMethod ) => ...
        // Function: ( first, second, config, originMethod ) => ...
        // ... any other type beginning with capital letter ( see 'get-explicit-type' module )
        //      - replacement occures only when both first and second are having the same type
        //      - first - target's property
        //      - second - some object's property ( to extend from )
        //      - config - current config object
        //          - config.callOrigin( first, second ) - executes same method from parent config
        //          - config.newConfig() - creates new ExtendConfig using current one as parent
        //          - config.level - current deep extend recursion level ( default - 0 )
        //      - name - current extending property name
    }
    
    // executes when first and second properties have different types
    // extendDifferent: ( first, second, config, name ) => { return newTargetProp }

    // returns parent config object ( can not be overwritten )
    // getParentConfig()

    // base handler to extend first with second ( better not override it )
    // use it in extendSimilar if you might receive new value type to extend it as needed by config
    // e.g. extendSimilar: {
    //   // here first and second functions can return any type
    //   Function: ( first, second, config ) => config.extendProp( first(), second(), config )
    // }
    // extendProp: ( first, second, config ) => {}

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
    });
    

/* --------------------------------- Extend.outer --------------------------------- */

// Extend.outer extends two variables as if they were in extending objects
var Extend = require( 'ultimate-extend' );

var config = Extend.config({
    extendSimilar: {
        Array: ( first, second ) => first.concat( second )
    },

    extendDifferent: ( first, second, config, name ) => {
        if ( !first ) return config.callOrigin( first, second, config, name );

        if ( !Array.isArray( first ) ) first = [ first ];
        if ( !Array.isArray( second ) ) second = [ second ];

        return config.extendProp( first, second, config );
    }
});

var a = [ 0, 1 ],
    b = 2;

Extend.outer( config, a, b )                                  => [ 0, 1, 2 ]
( Extend( config, {}, { outer: a }, { outer: b } ) ).outer    => [ 0, 1, 2 ]


/* --------------------------------- Extend.config --------------------------------- */

// Extend.config can be produced from other configs using config.newConfig( configObj )
// to execute method from origin ( parent ) config use config.callOrigin( ...{ same arguments } )
// config.callOrigin() - here 3rd argument will always be replaced with config which called this method

var Extend = require( 'ultimate-extend' );

var config = Extend.config({
    extendDifferent: ( first, second, config, name ) => {
        return second + 1;
    }
});

var newConfig = config.newConfig({
    extendDifferent: ( first, second, config, name ) => {
        return config.callOrigin( first, second, config, name ) + 2;
    }
});

console.log( Extend( newConfig, {}, { a: 1 } ) );  // { a: 4 }
```
