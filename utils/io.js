const chatController = require("../Controllers/chat.controller");
const userController = require("../Controllers/user.controller");
const roomController = require("../Controllers/room.controller");                                                   

module.exports = function (io) {
  io.on("connection", async (socket) => {
    socket.emit("rooms", await roomController.getAllRooms()); // 룸 리스트 보내기
    console.log("client is connected", socket.id);

    // 로그인시 설정
    socket.on("login", async (userName, cb) => {
      try {
        const user = await userController.saveUser(userName, socket.id);
        console.log(`${user.name} is connected`);
        cb({ok:true,data:user});
      }
      catch(error){
        cb({ok:false, error:error.message})
      }
    });

    //방 입장 설정
    socket.on("joinRoom", async (rid, cb) => {
      try {
        const user = await userController.checkUser(socket.id);
        
        // 사용자가 이미 해당 방에 속해 있는지 확인
        if (user.room && user.room.toString() === rid) {
          return cb({ ok: false, error: "User is already in this room." });
        }
    
        await roomController.joinRoom(rid, user);
        socket.join(rid); // 방 ID로 소켓을 조인
    
        const welcomeMessage = {
          chat: `${user.name} is joined to this room`,
          user: { id: null, name: "system" },
        };
    
        io.to(rid).emit("message", welcomeMessage);
        io.emit("rooms", await roomController.getAllRooms());
        cb({ ok: true });
      } catch (error) {
        cb({ ok: false, error: error.message });
      }
    });
    
    //방 나가기 설정
    socket.on("leaveRoom", async (_, cb) => {
      try {
        const user = await checkUser(socket.id);
        await roomController.leaveRoom(user);
        const leaveMessage = {
          chat: `${user.name} left this room`,
          user: { id: null, name: "system" },
        };
        socket.broadcast.to(user.room.toString()).emit("message", leaveMessage); // socket.broadcast의 경우 io.to()와 달리,나를 제외한 채팅방에 모든 맴버에게 메세지를 보낸다 
        io.emit("rooms", await roomController.getAllRooms());
        socket.leave(user.room.toString()); // join했던 방을 떠남 
        cb({ ok: true });
      } catch (error) {
        cb({ ok: false, message: error.message });
      }
    });

    // 메시지 전송 이벤트 핸들러
    socket.on("sendMessage", async (message, cb) => {
      try {
        const user = await userController.checkUser(socket.id);
        
        if (user) {
          const message = await chatController.saveChat(receivedMessage, user);
          io.to(user.room.toString()).emit("message", message); // 이부분을 그냥 emit에서 .to().emit() 으로 수정
          return cb({ ok: true });
        }
        
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
