global.window = global;
global.Q = require('q');
global._ = require('underscore');

global.mocha = require("mocha");
global.mochaAsPromised = require("mocha-as-promised");
global.sinon = require("sinon");
global.chai = require("chai");
global.sinonChai = require("sinon-chai");
global.chaiAsPromised = require("chai-as-promised");

mochaAsPromised(mocha);
chai.use(sinonChai);
chai.use(chaiAsPromised);

chai.should();
Object.defineProperty(global, "should", {
    value: require("chai").Should(),
    enumerable: true,
    configurable: true,
    writable: true
});
