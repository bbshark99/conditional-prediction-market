require('dotenv').config();

var initialSupply = process.env.REACT_APP_INITIAL_SUPPLY || 100000;

module.exports = function(deployer) {
  deployer.deploy(artifacts.require("DerivedToken"), initialSupply);
};
