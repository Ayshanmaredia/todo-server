const Pool = require("pg").Pool;

const devConfig = {
    user: "postgres",
    password: "root123",
    host: "localhost",
    port: 5432,
    database: "listicleboard"
}

const proConfig = {
    user: "postgres",
    host: "localhost",
    port: 5432,
    database: "listicleboard"
}

const pool = new Pool (
    process.env.NODE_ENV === "production" ? proConfig : devConfig
);

module.exports = pool;