const Chat = require("../Models/chat")
const chatController ={}

chatController.saveChat = async (message, user) => {
    try {
      const newMessage = new Chat({
        chat: message,
        user: {
          id: user._id,
          name: user.name,
        },
      });
  
      const savedMessage = await newMessage.save();
      console.log("Saved message:", savedMessage); // savedMessage를 로그로 출력
  
      return savedMessage;
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

module.exports = chatController;