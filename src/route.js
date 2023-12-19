const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const router = express.Router();

const db_service = require("./services/firestore");
const formatter = require("./format");

router.use(express.static(path.join(__dirname, "public")));

router.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res) => {
  res.sendFile(__dirname + "/adduser.html"); // serve the HTML page
});

router.get("/update_cookie", (req, res) => {
  res.sendFile(__dirname + "/update.html"); // serve the HTML page
});

router.get("/styles.css", (req, res) => {
  res.sendFile(path.join(__dirname, "/styles.css"));
});

router.post("/adduser", async (req, res) => {
  var { name, email, headerstring, userpass } = req.body;

  if (doValidations(name, email, headerstring, userpass) === false) {
    return res.send("All fields are required");
  }

  await db_service.addUserToFirestore({
    name: name,
    email: email,
    cookie: headerstring,
    userpass: userpass,
  });
  return res.send("User added");
});

function doValidations(name, email, headerstring, userpass) {
  if (
    name.trim() === "" ||
    email.trim() === "" ||
    headerstring.trim() === "" ||
    userpass.trim() === ""
  ) {
    return false;
  }
  return true;
}

router.post("/update_cookie", async (req, res) => {
  var { email, cookie, userpass } = req.body;

  return res.send(await db_service.updateCookie(cookie, email, userpass));
});

module.exports = router;
