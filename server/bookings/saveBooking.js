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


function save(booking, customer) {
    saveRooms(booking.habitaciones);
    let customerId = saveCustomer(customer);
    const checkInDate = new Date(booking.fechaCheckIn); //ISO-FORMAT
    const checkOutDate = new Date(booking.fechaCheckOut); 

    update('INSERT INTO casademiranda.bookings (check_in, check_out) VALUES (?, ?);', [checkInDate, checkOutDate]);
}

function saveRooms(rooms){
    for (var i = 0; i < rooms.length; i++) {
        let name = rooms[i].habitacion;
        let roomId = roomEnum(name);
        let room = query('SELECT * FROM casademiranda.rooms WHERE room_id = ?', [roomId]);
        console.log('Room: ', room);
        let price = rooms[i].precio;
        let extra_bed = rooms[i].supletorias;
        let extra_bed_price = rooms[i].precioSupletoria;
    }
}

function saveCustomer(customer){
    update('INSERT INTO casademiranda.customers (name, surname,identifier,email) VALUES (?, ?, ?, ?);', [customer.nombre, customer.apellidos, customer.dni, customer.email]);
}

function update(query, params) {
    var connection = sql.createConnection(config);

    connection.connect();
    let queryresult = connection.query(query, params, (error, results) => {
        if (error) console.log({ error: error });
        console.log('Query: '+ query + 'The solution: ', results);
        return results;
    });
    connection.end();

    console.log('Insert id: ', queryresult.insertId);

    return queryresult;
}

function query(query, params) {
    var connection = sql.createConnection(config);

    connection.connect();
    connection.query(query, params, function (error, results, fields) {
        if (error) throw error;
        console.log('The solution: ', results)
    })
    connection.end();
}

module.exports = {
    save: save,
};