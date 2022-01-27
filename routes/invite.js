const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");
const checkInviteToken = require("../middleware/checkInviteToken")
const CryptoJS = require("crypto-js");
require("dotenv").config();

router.post("/", checkInviteToken, async (req, res) => {

    try {

        let { invitetoken } = req.headers;

        const bytes = CryptoJS.AES.decrypt(invitetoken, process.env.inviteSecret);
        const originalText = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        const user = await pool.query(
            "SELECT invited_to, group_id FROM invites WHERE invited_to = $1",
            [originalText.inviteDetails.email]
        );

        res.status(200).json(user.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.post("/create-invite", authorization, async (req, res) => {

    try {

        const { email, group_id } = req.body;

        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length !== 0) {
            return res.status(401).send({ error: "User already exist" });
        }

        let inviteDetails = { email, group_id }

        const bcryptToken = CryptoJS.AES.encrypt(JSON.stringify({ inviteDetails }), process.env.inviteSecret).toString();

        const newInvitee = await pool.query(
            "INSERT INTO invites (token, invited_by, invited_to, group_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [bcryptToken, req.user_id, email, group_id]
        );

        res.json(newInvitee);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.get("/get-invite", authorization, async (req, res) => {

    const { group_id } = req.headers

    try {

        const invitedTo = await pool.query(
            "SELECT invited_to FROM invites WHERE group_id = $1",
            [group_id]
        );

        res.json(invitedTo.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;