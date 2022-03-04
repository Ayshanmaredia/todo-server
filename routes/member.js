const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

router.get("/get-members", authorization, async (req, res) => {

    try {

        const { group_id } = req.headers;

        const groupMembers = await pool.query(
            `SELECT u.name, u.email
            FROM group_user_mapping gm
            INNER JOIN groups g 
            ON g.id = gm.group_id
			LEFT JOIN users u 
			ON u.id = gm.user_id
			WHERE gm.group_id = $1`,
            [group_id]
        );

        res.status(200).json(groupMembers.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});


module.exports = router;