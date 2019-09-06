// create and configuration var

const environments = {}

// staging default 

environments.staging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName': 'staging',
    'hashingSecret': 'thisIsMySecret'
}

// production

environments.production = {
    'httpPort': 5000,
    'httpsPort' : 5001,
    'envName': 'production',
    'hashingSecret': 'thisIsMyProductionSecret'
}



// determine which env was passed as a cli arg
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

// check current env is available in the environments
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging


//export module

module.exports = environmentToExport;