const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne(
      { user: req.user.id }
      ).populate(
        'user', 
        ['name', 'avatar']
      );

    if(!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error');
  }
});

// @route   POST api/profile
// @desc    Create or update user profile.
// @access  Private
router.post('/', [auth, [
  check('status', 'Status is required').not().isEmpty(),
  check('skills', 'Skills is required').not().isEmpty()
]], 
async (req, res) => {
  const errors = validationResult(req);
  // if there are errors
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
  } = req.body;

  // Build profile object
  const profileFields = {};
  profileFields.user = req.user.id;
  if (company) profileFields.company = company;
  if (website) profileFields.website = website;
  if (location) profileFields.location = location;
  if (bio) profileFields.bio = bio;
  if (status) profileFields.status = status;
  if (githubusername) profileFields.githubusername = githubusername;
  if (skills) {
    // convert comma seperated string to an array
    // also map each value and trim it of spaces 
    profileFields.skills = skills.split(',').map(skill => skill.trim() );
  }

  // Build social object
  profileFields.social = {}
  if (youtube) profileFields.social.youtube = youtube;
  if (twitter) profileFields.social.twitter = twitter;
  if (facebook) profileFields.social.facebook = facebook;
  if (linkedin) profileFields.social.linkedin = linkedin;
  if (instagram) profileFields.social.instagram = instagram;

  res.send('Hello');


});

module.exports = router;