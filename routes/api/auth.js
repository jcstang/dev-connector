const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const User = require('../../models/User');

// @route   GET api/auth
// @desc    Test route
// @access  Public
// adding the 'auth' middleware makes this a protected route
// router.get('/', auth, (req, res) => res.send('auth route'));
router.get('/', auth, async (req, res) => {
  try {
    // this line gives an error of .select not a function
    // const user = await (await User.findById(req.user.id)).select('-password');
    const user = await (await User.findById(req.user.id, '-password'));
    res.json(user);
  } catch(err) {
    console.error(err.message);
    res.status(500).send('server error');
  }

});

module.exports = router;