const mysql = require("mysql2");
const util = require("util"); 


const readProperty = require('../configuration/readConfiguration');
const pass = readProperty("sql.password");
const user = readProperty("sql.user");
const server = readProperty("sql.server");
const port = readProperty("sql.port");
const database = readProperty("sql.database");

var config = {
    user: user,
    password: pass,
    server: server,
    port: port,
    database: database
};

connection = mysql.createConnection(config);
connection.query = util.promisify(connection.query).bind(connection);

connection.connect(function(err){
    if (err) {
        console.log("error connecting: " + err.stack);
        return;
    };
    console.log("connected as... " + connection.threadId);
});

const executeQuery = async (query, params) => {
    return new Promise((resolve, reject) => {
        connection.query(query, params, function (error, results, fields) {
            if (error) reject(error);
            resolve(results);
        })
    })
}

module.exports = {
    executeQuery: executeQuery
}