const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const port = process.env.PORT;
const app = express();
const routes = require("./routes/routes");
const passport = require('passport');

app.use(cors());
app.use(passport.initialize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const upload = require("./uploadMiddleware");
app.use(upload);

app.use("/api", routes);


app.listen(
    port,
    "0.0.0.0",
    () => console.log(`Server running on port http://localhost:${port}`)
  );
  