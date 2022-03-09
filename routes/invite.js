const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");
const checkInviteToken = require("../middleware/checkInviteToken")
const CryptoJS = require("crypto-js");
const { sendEmail, sendGroupEmail } = require("../utils/mailer");
const { response } = require("express");
require("dotenv").config();

router.post("/", checkInviteToken, async (req, res) => {

    try {

        let { invitetoken } = req.headers;
        const bytes = CryptoJS.AES.decrypt(invitetoken, process.env.inviteSecret);
        const originalText = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        const user = await pool.query(
            "SELECT invited_to, group_id, status FROM invites WHERE invited_to = $1 AND status = 0",
            [originalText.inviteDetails.email]
        );

        if (user.rows.length === 0) {
            res.status(401).send("Not authorized");
        }

        res.status(200).json(user.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.post("/create-invite", authorization, async (req, res) => {

    try {

        const { email, group_id } = req.body;

        const userEmail = await pool.query(
            "SELECT email FROM users WHERE id = $1",
            [req.user_id]
        );

        //checking if user is Inviting himself

        if (userEmail.rows[0].email === email) {
            return res.status(401).send("Cannot invite yourself");
        }

        const invitedToEmail = await pool.query(
            "SELECT invited_to FROM invites WHERE invited_to = $1",
            [email]
        );

        if (invitedToEmail.rows.length > 0) {
            return res.status(401).send("User already invited");
        }

        const existingUser = await pool.query(
            "SELECT id, email FROM users WHERE email = $1",
            [email]
        );

        // For existing users making a seperate group link

        if (existingUser.rows.length > 0) {

            const groupUserMapping = await pool.query(
                "SELECT user_id, group_id FROM group_user_mapping WHERE user_id = $1 AND group_id = $2",
                [existingUser.rows[0].id, group_id]
            );
        
            if (groupUserMapping.rows.length > 0) {
                return res.status(401).send("User already in group");
            }
        
            await pool.query(
                "INSERT INTO group_user_mapping (user_id, group_id) VALUES ($1, $2) RETURNING *",
                [existingUser.rows[0].id, group_id]
            );
        
            const groupUrl = process.env.client_url + "/dashboard?owner_type=0&owner_type_id=" + group_id;
        
            const groupEmailBody = getGroupEmailBody(email, groupUrl);
        
            await sendGroupEmail(email, groupEmailBody);

            return res.status(200).send(existingUser.rows[0]);
        }

        //Make link for new users

        let inviteDetails = { email, group_id }

        const encryptedToken = encodeURIComponent(CryptoJS.AES.encrypt(JSON.stringify({ inviteDetails }), process.env.inviteSecret).toString());

        const newInvitee = await pool.query(
            "INSERT INTO invites (token, invited_by, invited_to, group_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [encryptedToken, req.user_id, email, group_id]
        );

        const inviteUrl = process.env.client_url + "/invite?invitetoken=" + encryptedToken;

        const emailBody = getEmailBody(email, inviteUrl);

        await sendEmail(email, emailBody);

        res.status(200).json(newInvitee.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.get("/get-invite", authorization, async (req, res) => {

    const { group_id } = req.headers

    try {

        const invitedTo = await pool.query(
            "SELECT invited_to FROM invites WHERE group_id = $1 AND status=0",
            [group_id]
        );

        res.status(200).json(invitedTo.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.post("/update-inviteStatus", authorization, async (req, res) => {

    let { invitetoken } = req.headers;

    invitetoken = encodeURIComponent(invitetoken);

    try {

        const invite = await pool.query(
            "SELECT * FROM invites WHERE token = $1",
            [invitetoken]
        );

        if (invite.rows.length === 0) {
            return res.status(401).send({ error: "Invalid token" });
        }

        const updateStatus = await pool.query(
            "UPDATE invites SET status = $1 WHERE token = $2 RETURNING *",
            [1, invitetoken]
        );

        res.status(200).json(invite.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

//Email body for adding existing users in group
function getGroupEmailBody(email, groupUrl) {
    return `
    <p>Hello ${email}</p>
    <p>You have been added to the group, <a href="${groupUrl}">here</a> is the link of the group or tab the below link to open it in your app</p>
    <p>${groupUrl}</p>
    `
}

//Email body for adding new users in group
function getEmailBody(email, inviteUrl) {
    return `
        <p>Hello ${email}</p>
        <p>Please <a href="${inviteUrl}">Click here</a> or tab the below link to finish joining group invitation.</p>
        <p>${inviteUrl}</p>
    `
}

module.exports = router;