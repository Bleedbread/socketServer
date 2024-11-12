const chatController = require("../Controllers/chat.controller");
const userController = require("../Controllers/user.controller");

module.exports = function (io) {
  io.on("connection", async (socket) => {
    console.log("client is connected", socket.id);

    // 로그인 이벤트 핸들러
    socket.on("login", async (userName, cb) => {
      try {
        const user = await userController.saveUser(userName, socket.id);
        const wellcomeMessage = {
          chat: `${user.name} is joined to this room`,
          user:{id: null, name: "system"},
        }
        cb({ok:true,data:user});
      }
      catch(error){
        cb({ok:false, error:error.message})
      }
    });

    // 메시지 전송 이벤트 핸들러
    socket.on("sendMessage", async (message, cb) => {
      try {
        const user = await userController.checkUser(socket.id);
        if (!user) {
          throw new Error("User not found. Please log in again.");
        }

        const newMessage = await chatController.saveChat(message, user);
        if (!newMessage) {
          throw new Error("Message could not be saved.");
        }

        console.log("Saved message:", newMessage);  // 저장된 메시지를 출력하여 확인
        io.emit("message", newMessage);  // 모든 클라이언트에 메시지를 전송
        cb({ ok: true });
      } catch (error) {
        console.error("Error in sendMessage:", error);
        cb({ ok: false, error: error?.message || "An unknown error occurred while sending message." });
      }
    });

    // 연결 해제 이벤트 핸들러
    socket.on("disconnect", () => {
      console.log("user is disconnected", socket.id);
    });
  });
};
