const utils = require('./utils');
const strategies = require('./strategies');

// Pretty gnarly syntax but this function allows us
// to consecutively pass 'app' to each of the strategies
// passed into 'functions'
const pipe = (...functions) => (args) =>
    functions.reduce((arg, fn) => fn(arg), args);

// A wrapper middleware that applies each strategy that we will
// need
const initialiseAuthentication = (app) => {
    utils.setup();
    pipe(strategies.Google, strategies.Saml, strategies.Jwt)(app);
};

module.exports = { utils, initialiseAuthentication, strategies };
