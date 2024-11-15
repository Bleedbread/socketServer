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
        cb({ ok: true, data: user });
      } catch (error) {
        cb({ ok: false, error: error.message });
      }
    });

    //방 입장 설정
    socket.on("joinRoom", async (rid, cb) => {
      try {
        const user = await userController.checkUser(socket.id);

        // 사용자가 이미 방에 조인한 상태인지 확인
        if (user.room && user.room.toString() === rid) {
          console.log(`User ${user.name} is already in room ${rid}`);
          if (user.room.toString() === rid) {
            return cb({ ok: false, error: "User is already in this room." });
          }
          console.log(`Resetting user room state for ${user.name}`);
          await roomController.leaveRoom(rid, user);
          user.room = null;
          await user.save();
          socket.leave(user.room.toString());
        }
        
        await roomController.joinRoom(rid, user);
        user.room = rid;
        await user.save();

        socket.join(rid); // Socket.io 방에 조인
        const welcomeMessage = {
          chat: `${user.name} is joined to this room`,
          user: { id: null, name: "system" },
        };

        io.to(rid).emit("message", welcomeMessage); // 방에 입장한 사용자에게 환영 메시지 전송
        io.emit("rooms", await roomController.getAllRooms()); // 전체 룸 상태 업데이트
        cb({ ok: true });
      } catch (error) {
        cb({ ok: false, error: error.message });
      }
    });

    //방 나가기 설정
    socket.on("leaveRoom", async (rid, cb) => {
      try {
        console.log(
          `leaveRoom event received for room: ${rid}, socket: ${socket.id}`
        );
        const user = await userController.checkUser(socket.id);
        console.log("user retrieved.", user.name);

        // 유저가 이미 방에 속해있는지 확인 후 나가기
        if (user.room && user.room.toString() === rid) {
          await roomController.leaveRoom(user);

          const leaveMessage = {
            chat: `${user.name} left this room`,
            user: { id: null, name: "system" },
          };

          // 자신을 제외한 모든 사용자에게 메시지 전송
          socket.broadcast
            .to(user.room.toString())
            .emit("message", leaveMessage);

          // 모든 방 정보를 업데이트하여 전송
          io.emit("rooms", await roomController.getAllRooms());

          // 소켓에서 방을 떠남
          socket.leave(user.room.toString());

          // 유저의 방 정보를 초기화
          user.room = null;
          await user.save();

          cb({ ok: true });
        } else {
          cb({ ok: false, error: "User is not in this room." });
        }
      } catch (error) {
        cb({ ok: false, error: error.message });
      }
    });

    // 메시지 전송 이벤트 핸들러
    socket.on("sendMessage", async (receivedMessage, cb) => {
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

        console.log("Saved message:", newMessage); // 저장된 메시지를 출력하여 확인
        io.emit("message", newMessage); // 모든 클라이언트에 메시지를 전송
        cb({ ok: true });
      } catch (error) {
        console.error("Error in sendMessage:", error);
        cb({
          ok: false,
          error:
            error?.message ||
            "An unknown error occurred while sending message.",
        });
      }
    });

    // 연결 해제 이벤트 핸들러
    socket.on("disconnect", () => {
      console.log("user is disconnected", socket.id);
    });
  });
};
