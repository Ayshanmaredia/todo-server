const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");
//register

router.post("/register", validInfo, async (req, res) => {

    try {
        //1. Destructure the req.body (name, email, password)

        const { name, email, password } = req.body;

        //2. Check if user exist (if user exist then throw error)

        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length !== 0) {
            return res.status(401).send({ error: "User already exist" });
        }

        //3. Bcrypt user password

        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);

        const bcryptPassword = await bcrypt.hash(password, salt);

        //4. Enter the new user inside our database

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
            [name, email, bcryptPassword]
        );

        //5. Generating our jwt token

        const token = jwtGenerator(newUser.rows[0].id);

        res.json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// login

router.post("/login", validInfo, async (req, res) => {

    try {
        //1. Destructe the req.body (email, password)

        const { email, password } = req.body;

        //2. Check if user does exist (if not throw error)

        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(401).send({ error: "Username/password is incorrect" });
        }

        //3. Check if the upcoming password is same as the database

        const validPassword = await bcrypt.compare(password, user.rows[0].password);

        if (!validPassword) {
            return res.status(401).send({ error: "Username/password is incorrect" });
        }

        //4. Give them the token

        const token = jwtGenerator(user.rows[0].id);

        res.json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.get("/is-verify", authorization, async (req, res) => {

    try {

        res.send(true);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;