const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");
const logger = require("../loggers/index");

router.get("/get-members", authorization, async (req, res) => {

    try {

        const { groupid } = req.headers;

        const groupMembers = await pool.query(
            `SELECT u.name, u.email
            FROM group_user_mapping gm
            INNER JOIN groups g 
            ON g.id = gm.group_id
			LEFT JOIN users u 
			ON u.id = gm.user_id
			WHERE gm.group_id = $1`,
            [groupid]
        );

        res.status(200).json(groupMembers.rows);

    } catch (err) {
        console.error(err.message);
        logger.error(err.message);
        res.status(500).send("Server Error");
    }
});


module.exports = router;