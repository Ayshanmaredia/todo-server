const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

//Routes//
//register and login routes

app.use("/auth", require("./routes/auth"));

app.use("/dashboard", require("./routes/dashboard"));

app.use("/group", require("./routes/group"));

app.use("/list", require("./routes/list"));

app.use("/invite", require("./routes/invite"));

app.use("/member", require("./routes/member"));

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});