/*
create and export configuration variable
*/

// container for all the environment

var environment = {};

// staging (default) environment

environment.staging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'staging',

};

// production environment

environment.production = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'production',
};

// determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// check that the current environent is one the environments abotve, if not, default to staging
var environmentToExport = typeof(environment[currentEnvironment]) == 'object' ? environment[currentEnvironment] : environment.staging;

// export the module
module.exports = environmentToExport;