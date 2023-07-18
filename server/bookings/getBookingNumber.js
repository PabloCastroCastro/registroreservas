const fs = require('fs');

const getBookingNumber = async (bookingDate) => {

    let numberBookingDay = 1;
    let bookingNumber = bookingDate + "00" + numberBookingDay;

    let existBooking = true;
    while (existBooking) {
        try {
            let data = fs.readFileSync('./facturas-cliente/' + bookingNumber + '.pdf');
            console.log(data);
            existBooking = true;
            numberBookingDay += 1;
            bookingNumber = bookingDate + "00" + numberBookingDay;
        } catch (err) {
            existBooking = false;
        }
    }
    return bookingNumber;
}



module.exports = {
    getBookingNumber: getBookingNumber,
};