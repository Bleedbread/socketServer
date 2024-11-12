const User = require("../Models/user"); // User 모델 임포트
const userController = {};

userController.saveUser = async (userName, sid) => {
  // 이미 있는 유저 확인
  let user = await User.findOne({ name: userName });
  if (!user) {
    user = new User({
      name: userName,
      token: sid,
      online: true,
    });
  }

  user.token = sid;
  user.online = true;
  await user.save();
  return user;
};

userController.checkUser = async (sid) => {
  const user = await User.findOne({ token: sid });
  if (!user) throw new Error("user not found");
  return user;
};

module.exports = userController;
