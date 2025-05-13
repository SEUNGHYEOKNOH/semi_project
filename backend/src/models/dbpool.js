const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '20180181',
    port: 3306,
    database: 'smiproject',
    connectionLimit: 10,
    waitForConnections: true,
});
module.exports = pool;
