const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");
const logger = require("../loggers/index");

router.post("/create-group", authorization, async (req, res) => {

    try {

        const { name } = req.body;

        const newGroup = await pool.query(
            "INSERT INTO groups (name, owner_id) VALUES ($1, $2) RETURNING id as group_id, name, owner_id",
            [name, req.user_id]
        );

        await pool.query(
            "INSERT INTO group_user_mapping (user_id, group_id) VALUES ($1, $2) RETURNING *",
            [req.user_id, newGroup.rows[0].group_id]
        )

        res.status(200).json(newGroup.rows[0]);

    } catch (err) {
        console.error(err.message);
        logger.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.get("/get-groups", authorization, async (req, res) => {

    try {

        const groups = await pool.query(
            `SELECT name, owner_id, group_id
            FROM groups
            LEFT JOIN group_user_mapping
            ON group_user_mapping.group_id = groups.id
            WHERE group_user_mapping.user_id = $1
            ORDER BY group_id ASC`,
            [req.user_id]
        );

        res.status(200).json(groups.rows);

    } catch (err) {
        console.error(err.message);
        logger.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.put("/update-group", authorization, async (req, res) => {
    try {

        const { id, name } = req.body

        const group = await pool.query(
            "SELECT * FROM groups WHERE id = $1",
            [id]
        );

        if (group.rows.length === 0) {
            logger.error("No group to update");
            return res.status(401).send({ error: "No group to update" });
        }

        const updateGroup = await pool.query(
            "UPDATE groups SET name = $1 WHERE id = $2 RETURNING *",
            [name, id]
        );

        res.status(200).json(updateGroup.rows[0]);

    } catch (err) {
        console.error(err.message);
        logger.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.delete("/delete-group", authorization, async (req, res) => {
    try {

        const { id } = req.body

        const group = await pool.query(
            "SELECT * FROM groups WHERE id = $1",
            [id]
        );

        if (group.rows.length === 0) {
            logger.error("Group not found");
            return res.status(401).send({ error: "Group not found" });
        }

        await pool.query(
            "DELETE from group_user_mapping WHERE group_id = $1",
            [id]
        );

        await pool.query(
            "DELETE FROM groups WHERE id = $1",
            [id]
        );

        await pool.query(
            "DELETE FROM lists WHERE owner_type_id = $1",
            [id]
        )

        res.status(200).json("Successfully deleted");

    } catch (err) {
        console.error(err.message);
        logger.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.put("/group-user-map", authorization, async (req, res) => {
    try {

        const { groupid } = req.body

        const groupUserMap = await pool.query(
            `INSERT
            INTO    group_user_mapping (user_id, group_id)
            SELECT  $1, $2
            WHERE   $1 NOT IN
                    (
                    SELECT  user_id
                    FROM    group_user_mapping
                    ) RETURNING *`,
            [req.user_id, groupid]
        );

        if (groupUserMap.rows.group_id === groupid) {
            logger.error("User already in group");
            return res.status(401).send({ error: "User already in group" });
        }

        res.status(200).json(groupUserMap.rows[0]);

    } catch (err) {
        console.error(err.message);
        logger.error(err.message);
        res.status(500).send("Server Error");
    }
});


module.exports = router;