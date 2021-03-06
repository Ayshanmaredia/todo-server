const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");
const logger = require("../loggers/index");

router.get("/", authorization, async (req, res) => {

    try {

        const user = await pool.query(
            "SELECT id, name FROM users WHERE id = $1",
            [req.user_id]
        );

        res.status(200).json(user.rows[0]);

    } catch (err) {
        console.error(err.message);
        logger.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;