const User = require("../Models/User"); 
const userController = {};

// 사용자 저장 또는 업데이트
userController.saveUser = async (userName, sid) => {
  try {
    // 기존 사용자 조회
    let user = await User.findOne({ name: userName });
    
    // 사용자가 없으면 새 사용자 생성
    if (!user) {
      user = new User({
        name: userName,
        token: sid,
        online: true,
      });
    } else {
      // 기존 사용자 업데이트
      const shouldSave = user.token !== sid || !user.online;
      
      if (user.token !== sid) user.token = sid; // 토큰이 다를 경우 업데이트
      if (!user.online) user.online = true; // 온라인 상태로 변경
      
      // 필요 시만 데이터베이스 업데이트
      if (shouldSave) await user.save();
    }
    
    return user;
  } catch (error) {
    console.error("Error saving user:", error);
    throw new Error("Could not save user");
  }
};

// 사용자 확인
userController.checkUser = async (sid) => {
  try {
    const user = await User.findOne({ token: sid });
    if (!user) {
      throw new Error(`User with token ${sid} not found`);
    }
    return user;
  } catch (error) {
    console.error("Error checking user:", error);
    throw error; // 기존 에러를 다시 던짐
  }
};

module.exports = userController;
