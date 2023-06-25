var sql = require("mysql2");
const readProperty = require('../configuration/readConfiguration');
const roomEnum = require('../rooms/room');

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


const save = (booking, customer) => {

    //saveRooms(booking.habitaciones).then(rooms => console.log(rooms));
    update('INSERT INTO casademiranda.customers (name, surname,identifier,email) VALUES (?, ?, ?, ?);', [customer.nombre, customer.apellidos, customer.dni, customer.email]).then(result => console.log(result));
    update('INSERT INTO casademiranda.bookings (check_in, check_out) VALUES (?, ?);', [new Date(booking.fechaCheckIn), new Date(booking.fechaCheckOut)]).then(result=> console.log(result));
}

const saveRooms = (rooms) => {
    return new Promise((resolve, reject) => {
        let rooms = [];
        for (var i = 0; i < rooms.length; i++) {
            let name = rooms[i].habitacion;
            let roomId = roomEnum(name);
            let room = query('SELECT * FROM casademiranda.rooms WHERE room_id = ?', [roomId]);
            console.log('Room: ', room);
            let price = rooms[i].precio;
            let extra_bed = rooms[i].supletorias;
            let extra_bed_price = rooms[i].precioSupletoria;
            rooms.push(room);
        }
        resolve(rooms);
    })
}

const update = (query, params) => {
    return new Promise((resolve, reject) => {
        var connection = sql.createConnection(config);

        connection.connect();
        let queryresult = connection.query(query, params, (error, results) => {
            if (error) {
                reject({ error: error });
            }
            console.log('Query: ' + query + 'The solution: ', results);
            return results;
        });

        connection.end();
        console.log('Insert id: ', queryresult.insertId);

        resolve(queryresult);
    })
}

const query = (query, params) => {

    return new Promise((resolve, reject) => {
         var connection = sql.createConnection(config);

        connection.connect();
        connection.query(query, params, function (error, results, fields) {
            if (error) reject(error);
            resolve(results)
        })
        connection.end();   
    })

}

module.exports = {
    save: save,
};