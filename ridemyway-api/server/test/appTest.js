
const assert = require('chai').assert;
const app = require('../app');


describe('App', () => {
	it('returns rides listed', (done) => {
		const rides = [];
		assert.equal(app.get, rides);	
		done();
	});
});