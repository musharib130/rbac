const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0, 
});

// Promisify the pool to use async/await
const promisePool = pool.promise();

// Test the connection
(async () => {
  try {
    const [rows] = await promisePool.query('SELECT 1 + 1 AS result');
    console.log('MySQL connected successfully. Test query result:', rows[0].result);
  } catch (error) {
    console.error('Error connecting to MySQL:', error.message);
  }
})();

module.exports = promisePool;