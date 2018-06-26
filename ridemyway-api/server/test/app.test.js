
const chai = require('chai');
const server = require('../app');
const chaiHttp = require('chai-http');
const should = chai.should();

chai.use(chaiHttp);


describe('Rides', () => {
  it('should list ALL available rides on /api/v1/rides GET', (done) => {
  	chai.request(server)
    .get('/rides')
    .end((err, res) => {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('array');
      done();
    });
  });
  it('should fetch a ride on /api/v1/rides/<id> GET', (done) => {
    const newRide = new ride({
      name: 'John',
      car: 'Nissan March'
      
    });
    newRide.save((err, data) => {
      chai.request(server)
        .get('/ride/'+data.id)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('_id');
          res.body.should.have.property('name');
    });
})
});
  it('should add a new ride on api/v1/rides POST', (done) => {
  chai.request(server)
    .post('/rides')
    .send({'name': 'John', 'car': 'Mustang'})
    .end((err, res) => {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('object');
      res.body.should.have.property('SUCCESS');
      res.body.SUCCESS.should.be.a('object');
      res.body.SUCCESS.should.have.property('name');
      res.body.SUCCESS.should.have.property('car');
    });
});
});