
/* --------------------------------- Required Modules --------------------------------- */

const Tests = require( '../ultimate-tests' );


/* --------------------------------- Tests --------------------------------- */

new Tests({
	testsDir: './tests',

	testNames: {
		// only: [ 'Extend' ],
		// only: [ 'Extend.plugins' ],
		// only: [ 'Extend.promise' ],
		// only: [ 'Extend.decorator' ],
		// except: [ 'Extend.decorator' ],
		// except: [],
		// except: [ 'Extend.promise' ],
		// except: [ 'Extend.plugins' ],
	},

	defaultConfig: {
		testIndexes: {
			only: [],
			except: []
		},

		logs: {
			level: 0
			// level: 2
		}
	},

	tests: {
		Extend: {
			file: 'extend-simple-tests',

			testIndexes: {
				only: [],
				except: []
			},
		},

		'Extend.decorator': {
			file: 'extend-decorator-tests',

			testIndexes: {
				only: [],
				except: []
			},
		},

		'Extend.plugins': {
		    file: 'extend-plugins-tests',

		    testIndexes: {
		        only: [],
		        except: []
		    },
		},

		'Extend.promise': {
		    file: 'extend-promise-tests',

		    testIndexes: {
		        only: [],
		        except: []
		    },
		},
	}
});



