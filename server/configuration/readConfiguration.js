const fs = require('fs');

const readProperty = (property) => {

    const configPassword = JSON.parse(fs.readFileSync('./configuration/password.json', 'utf8'));

    if (configPassword.hasOwnProperty(property)){
        return configPassword[property];
    }

    const genericConfig = JSON.parse(fs.readFileSync('./configuration/configuration.json', 'utf8'));
    if (genericConfig.hasOwnProperty(property)){
        return genericConfig[property];
    }

    return "";
}

module.exports = readProperty;