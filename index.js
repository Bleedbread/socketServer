const { createServer } = require("http");
const app = require("./app");
const { Server } = require("socket.io");
const mongoose = require("mongoose"); // mongoose 임포트
require("dotenv").config();

const PORT = process.env.PORT || 5001; // 기본값을 5001로 설정하여 포트가 누락되는 문제 방지

// HTTP 서버 생성 및 Socket.io 설정
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // 모든 출처에서의 접근 허용
    },
});

// MongoDB 연결
mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB successfully"))
.catch((error) => console.error("Error connecting to MongoDB:", error));

// utils/io 설정
require("./utils/io")(io);

// 서버 시작 및 포트 출력
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

