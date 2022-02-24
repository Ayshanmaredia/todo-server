const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

router.post("/create-group", authorization, async (req, res) => {

    try {

        const { name } = req.body;

        const newGroup = await pool.query(
            "INSERT INTO groups (name, owner_id) VALUES ($1, $2) RETURNING *",
            [name, req.user_id]
        );

        await pool.query(
            "INSERT INTO group_user_mapping (user_id, group_id) VALUES ($1, $2) RETURNING *",
            [req.user_id, newGroup.rows[0].id]
        )

        res.json(newGroup.rows[0]);

    } catch (err) {
        console.error(err.message);
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
            WHERE group_user_mapping.user_id = $1;`,
            [req.user_id]
        );

        res.json(groups.rows);

    } catch (err) {
        console.error(err.message);
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
            return res.status(401).send({ error: "No group to update" });
        }

        const updateGroup = await pool.query(
            "UPDATE groups SET name = $1 WHERE id = $2 RETURNING *",
            [name, id]
        );

        res.json(updateGroup.rows[0]);

    } catch (err) {
        console.error(err.message);
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
            return res.status(401).send({ error: "Item not found" });
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
        res.status(500).send("Server Error");
    }
});

router.put("/group-user-map", authorization, async (req, res) => {
    try {

        const { group_id } = req.body

        const groupUserMap = await pool.query(
            `INSERT
            INTO    group_user_mapping (user_id, group_id)
            SELECT  $1, $2
            WHERE   $1 NOT IN
                    (
                    SELECT  user_id
                    FROM    group_user_mapping
                    ) RETURNING *`,
            [req.user_id, group_id]
        );

        console.log(groupUserMap.rows)

        if (groupUserMap.rows.group_id === group_id) {
            return res.status(401).send({ error: "User already in group" });
        }

        res.json(groupUserMap.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});


module.exports = router;