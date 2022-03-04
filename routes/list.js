const router = require("express").Router();
const { status } = require("express/lib/response");
const pool = require("../db");
const authorization = require("../middleware/authorization");

router.post("/create-list", authorization, async (req, res) => {

    try {

        let { name, owner_type, owner_type_id, description, status } = req.body;

        if (owner_type === 1) {
            owner_type_id = req.user_id;
        }
        const newList = await pool.query(
            "INSERT INTO lists (name, owner_type, owner_type_id, description, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [name, owner_type, owner_type_id, description, status]
        );

        res.status(200).json(newList.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.get("/get-lists", authorization, async (req, res) => {

    try {

        let { owner_type, owner_type_id } = req.headers;
        if (owner_type == 1) {
            owner_type_id = req.user_id;
        }
        const lists = await pool.query(
            "SELECT * FROM lists WHERE owner_type = $1 AND owner_type_id = $2 ORDER BY id DESC",
            [owner_type, owner_type_id]
        );

        res.status(200).json(lists.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.put("/update-list", authorization, async (req, res) => {
    try {

        const { id, name, description, status } = req.body

        const list = await pool.query(
            "SELECT * FROM lists WHERE id = $1",
            [id]
        );

        if (list.rows.length === 0) {
            return res.status(401).send({ error: "No Item to update" });
        }

        const updateList = await pool.query(
            "UPDATE lists SET name = $1, description = $2, status = $3 WHERE id = $4 RETURNING *",
            [name, description, status, id]
        );

        res.status(200).json(updateList.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.delete("/delete-list", authorization, async (req, res) => {
    try {

        const { id } = req.headers

        const list = await pool.query(
            "SELECT * FROM lists WHERE id = $1",
            [id]
        );

        if (list.rows.length === 0) {
            return res.status(401).send({ error: "Item not found" });
        }

        const deleteListItem = await pool.query(
            "DELETE FROM lists WHERE id = $1",
            [id]
        );

        res.status(200).send("Successfully deleted");

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;