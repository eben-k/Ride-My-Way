const assert = require('chai').assert;
const app = require('../index.js');

describe ('App', () => {
 it ('app should return type string', () =>{
 let result = ('Hello World');
 assert.typeOf(result, 'string')
});
});