const moment = require('moment'); // Or you could use the native Date API or any other library

function formatDate(date) {
    return moment(date).format('MMMM Do YYYY, h:mm:ss a'); // Example: "March 11th 2025, 5:45:00 pm"
}

module.exports = formatDate;
