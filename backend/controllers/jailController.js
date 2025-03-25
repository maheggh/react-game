const User = require('../models/User');

exports.startJailTime = async (user, jailDurationInSeconds) => {
  user.inJail = true;
  user.jailTimeEnd = Date.now() + jailDurationInSeconds * 1000;
  await user.save();
};

exports.getJailTime = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await exports.checkAndReleaseUser(user);
    if (!user.inJail) {
      return res.status(200).json({ inJail: false, message: 'User is not in jail' });
    }
    const jailTimeLeft = Math.max(0, user.jailTimeEnd - Date.now());
    return res.status(200).json({
      inJail: true,
      jailTime: Math.ceil(jailTimeLeft / 1000)
    });
  } catch (error) {
    console.error('Error fetching jail time:', error.message);
    return res.status(500).json({
      message: 'Server error fetching jail time',
      error: error.message
    });
  }
};

exports.checkAndReleaseUser = async (user) => {
  if (user.inJail && user.jailTimeEnd <= Date.now()) {
    user.inJail = false;
    user.jailTimeEnd = null;
    await user.save();
    return true;
  }
  return false;
};
