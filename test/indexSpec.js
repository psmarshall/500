var index = require("../index.js");
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

chai.use(chaiHttp);

describe("Index", function() {
  describe("setup", function() {
    it("returns status 200", function(done) {
      chai.request('http://localhost:3000')
        .get('/')
        .end(function(err, res) {
          res.should.have.status(200);
          done();
        });
    });
  })
});