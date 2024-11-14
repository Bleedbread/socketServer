const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    room: { type: String, required: true },  // room 필드 필수로 설정
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  { timestamps: true } // timestamp 수정
);

module.exports = mongoose.model("Room", roomSchema);
