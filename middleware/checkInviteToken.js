require("dotenv").config();
const pool = require("../db");

module.exports = async (req, res, next) => {

    let { invitetoken } = req.headers;

    if (!invitetoken) {
        return res.status(500).send("Token not found");
    }

    try {
        const invite = await pool.query(
            "SELECT * FROM invites WHERE token = $1",
            [invitetoken]
        );

        if (invite.rows.length === 0) {
            return res.status(401).send({ error: "Invalid token" });
        }

        next();

    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Not Authorize");
    }
}