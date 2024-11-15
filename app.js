const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const Room = require("./Models/room");

const app = express();
app.use(cors());

mongoose
  .connect(process.env.DB)
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error("Database connection error:", err));

  app.get("/", async (req, res) => {
    try {
      // 이미 존재하는 방 이름들을 조회
      const existingRooms = await Room.find({ room: { $in: ["자바스크립트 단톡방", "리액트 단톡방", "NodeJS 단톡방"] } }).select("room");
  
      // 이미 존재하는 방 이름을 배열로 추출
      const existingRoomNames = existingRooms.map(room => room.room);
  
      // 생성하려는 방 중 존재하지 않는 방만 필터링
      const roomsToInsert = [
        { room: "자바스크립트 단톡방", members: [] },
        { room: "리액트 단톡방", members: [] },
        { room: "NodeJS 단톡방", members: [] },
      ].filter(room => !existingRoomNames.includes(room.room));
  
      // 새로운 방이 있을 경우에만 insertMany 호출
      if (roomsToInsert.length > 0) {
        await Room.insertMany(roomsToInsert, { ordered: false });
        res.send("Documents inserted");
      } else {
        res.send("No new rooms to insert");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error inserting rooms");
    }
  });

module.exports = app;
