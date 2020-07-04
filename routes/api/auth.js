const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");

// @route   GET api/auth
// @desc    Get user data using the token to auth
// @access  Public
// adding the 'auth' middleware makes this a protected route
// router.get('/', auth, (req, res) => res.send('auth route'));
router.get("/", auth, async (req, res) => {
  try {
    // this line gives an error of .select not a function
    // const user = await (await User.findById(req.user.id)).select('-password');
    const user = await User.findById(req.user.id, "-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post(
  "/",
  [
    check("email", "Please include valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    // ** check for errors on user input
    // express-validator uses an array of errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // ** destructring req.body - for ease of use
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      // user found check if password matches
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      // return jsonwebtoken
      // payload to pass to sign func
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360001 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
      // res.send('user registered');
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }

    // res.status(200).send('successfully registered user........');
  }
);

module.exports = router;
