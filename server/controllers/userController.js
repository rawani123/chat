const newUser = require("../models/userModel");
const bcrypt = require("bcrypt");
const axios = require('axios');

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await newUser.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await newUser.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await newUser.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    const user = await newUser({
      email,
      username,
      password: hashedPassword,
    }).save();
    user.password = undefined;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await newUser
      .find({ _id: { $ne: req.params.id } })
      .select(["email", "username", "avatarImage", "_id"]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await newUser.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};

module.exports.getavatar= async (req, res) => {
  const api = 'https://api.multiavatar.com';
  const data = [];

  try {
    console.log('Fetching avatars...');
    for (let i = 0; i < 4; i++) {
      const image = await axios.get(
        `${api}/${Math.round(Math.random() * 1000)}`,
        { responseType: 'arraybuffer' } // Important for binary data
      );
      const buffer = Buffer.from(image.data, 'binary');
      data.push(buffer.toString('base64'));
    }
    res.json({ avatars: data });
  } catch (err) {
    console.log('Error fetching avatars:', err.message);
    res.status(500).json({ error: 'Failed to fetch avatars' });
  }
};
