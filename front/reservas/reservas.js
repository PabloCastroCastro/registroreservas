window.addEventListener("load", () => {

    var input = document.getElementById("findByIdentifierText");
    input.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("findByIdentifier").click();
        }
    });
})

function find() {
    var identifier = document.getElementById("findByIdentifierText").value;
    var table = document.getElementById('tBodyBookings');
    table.innerHTML = "";
    var url = 'http://localhost:3000/reserva';
    if (identifier != null && identifier != "") {
        url = url + '?dni=' + identifier;
    }
    $.ajax({
        url: url,
        method: 'GET',
        success: function (res) {
            console.log('Response: ', res)
            let bookings = res;
            console.log('length: ', bookings.length);

            for (i = 0; i < bookings.length; i++) {
                console.log('booking: ', bookings[i]);

                var row = document.createElement('tr');

                var idCell = document.createElement('td');
                var nameCell = document.createElement('td');
                var surnameCell = document.createElement('td');
                var roomsCell = document.createElement('td');

                idCell.textContent = bookings[i].booking_id;
                nameCell.textContent = bookings[i].name;
                surnameCell.textContent = bookings[i].surname;
                roomsCell.appendChild(getRooms(bookings[i].rooms));

                row.appendChild(idCell);
                row.appendChild(nameCell);
                row.appendChild(surnameCell);
                row.appendChild(roomsCell);

                table.appendChild(row);
                console.log('booking: ', bookings[i]);
                console.log('i: ', i);
            }
        }
    });
}

function getRooms(rooms) {
    var tableRoom = document.createElement('table');
    var tableBodyRoom = document.createElement('tbody');
    for (j = 0; j < rooms.length; j++) {
        let room = JSON.parse(JSON.stringify(rooms[j]));
        var rowRoom = document.createElement('tr');
        var nameCell = document.createElement('td');
        nameCell.textContent = room.name;
        rowRoom.appendChild(nameCell);
        if (room.extra_beds !== null && room.extra_beds !== undefined && room.extra_beds > 0) {
            var extraBedsCell = document.createElement('td');
            extraBedsCell.textContent = "Supletorias: " + room.extra_beds;
            rowRoom.appendChild(extraBedsCell);
        }
        tableBodyRoom.appendChild(rowRoom);

    }

    tableRoom.appendChild(tableBodyRoom);

    return tableRoom;
}