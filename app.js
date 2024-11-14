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
  // insertMany를 통해 rooms 문서를 삽입하는 테스트 코드
  Room.insertMany(
    [
      { room: "자바스크립트 단톡방", members: [] },
      { room: "리액트 단톡방", members: [] },
      { room: "NodeJS 단톡방", members: [] },
    ],
    { ordered: false } // 중복 오류가 발생해도 나머지 문서를 계속 삽입
  )
    .then(() => res.send("Documents inserted"))
    .catch((error) => {
      console.error(error);
      res.send(error);
    });
});

module.exports = app;
