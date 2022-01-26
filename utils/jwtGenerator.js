const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(id) {
    const payload = {
        user_id: id
    };

    return jwt.sign(payload, process.env.jwtSecret, { expiresIn: "12hr" });
}

module.exports = jwtGenerator;