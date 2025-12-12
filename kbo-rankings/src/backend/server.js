const express = require("express");
const cors = require("cors");
const rankingsRoute = require("./ranking");
const scheduleRoute = require("./schedule");
const relayRoute = require("./relay");
const scoreBoardDataRoute = require("./scoreBoard");
const playerSearchRoute = require("./pSearch");
const pDataRoute = require("./pData");

console.log("서버 시작 시도 중...");

const app = express();

app.use(cors());

app.use("/api/rankings", rankingsRoute);
app.use("/api/schedule", scheduleRoute);
app.use("/api/relay", relayRoute);
app.use("/api/scoreBoardData", scoreBoardDataRoute);
app.use("/api/playerSearch", playerSearchRoute);
app.use("/api/playerData", pDataRoute);

app.get("/", (req, res) => {
  res.send("✅ KBO Ranking API 서버가 정상적으로 실행 중입니다!");
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
