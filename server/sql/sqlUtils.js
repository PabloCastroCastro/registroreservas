import mysql from 'mysql2/promise';
import util from "util";
import readProperty from '../configuration/readConfiguration.js';
import { resolve } from 'path';

const pass = readProperty("sql.password");
const user = readProperty("sql.user");
const server = readProperty("sql.server");
const port = readProperty("sql.port");
const database = readProperty("sql.database");

var config = {
    user: user,
    password: pass,
    host: server,
    port: port,
    database: database
};

const pool = mysql.createPool({
    user: user,
    password: pass,
    host: server,
    port: port,
    database: database,
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0
});



const executeQuery = async (query, params) => {
    try {
        //const connection = await mysql.createConnection(config);
        const [rows, fields] = await pool.query(query, params);
        //const [rows, fields] = await connection.query(query, params);
        return rows;
    } catch (err) {
        console.log(err);
    }
}

export default executeQuery;