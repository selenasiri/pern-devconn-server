const Pool = require('pg').Pool;

const connectionString = process.env.DATABASE_URL; //heroku addons
console.log(connectionString);

const pool = new Pool({ connectionString});

module.exports = pool;

// pool means database 'connection pool' 
// connects the server to the database