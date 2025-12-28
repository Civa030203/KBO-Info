const express = require("express");
const axios = require("axios");
const cors = require("cors");

const router = express.Router();
router.use(cors());

router.get("/", async (req, res) => {
  const { le_id, sr_id, g_id } = req.query;

  const url = `https://m.koreabaseball.com/ws/Kbo.asmx/GetLiveTextScore?le_id=${le_id}&sr_id=${sr_id}&g_id=${g_id}&sc_id=0`;

  try {
    // 두 API 요청을 병렬로 실행
    const scoreBoardData = await Promise.all([
      axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
        },
      }),
    ]);
    

    // 문자열인 경우 JSON 파싱
    const teamDataTable = []; // 팀명 파싱
      if (typeof scoreBoardData[0].data.teamTable === "string") {
        for (let i = 0; i < JSON.parse(scoreBoardData[0].data.teamTable).rows.length; i++) {
          const rawHTML = (JSON.parse(scoreBoardData[0].data.teamTable).rows[i].row[0].Text);
          const teamText = rawHTML.replace(/<[^>]*>/g, "").trim();
          teamDataTable.push(teamText);
        }
      }

    const scoreDataTable = []; // 이닝 별 스코어 파싱
      if (typeof scoreBoardData[0].data.scoreTable === "string") {
        for (let teamIndex = 0; teamIndex < 2; teamIndex++) {
          let scoreData = [];
          for (let inningIndex = 0; inningIndex < JSON.parse(scoreBoardData[0].data.scoreTable).rows[teamIndex].row.length; inningIndex++) {
            scoreData.push(JSON.parse(scoreBoardData[0].data.scoreTable).rows[teamIndex].row[inningIndex].Text);
          }
          scoreDataTable.push(scoreData);
        }
      }
    const resultDataTable = [];
      if (typeof scoreBoardData[0].data.resultTable === "string") {
        for (let teamIndex = 0; teamIndex < 2; teamIndex++) {
          let resultData = [];
          for (let i = 0; i < 4; i++) {
            resultData.push(JSON.parse(scoreBoardData[0].data.resultTable).rows[teamIndex].row[i].Text);
          }
          resultDataTable.push(resultData);
        }
      }
      // typeof scoreBoardData[0].data.resultTable === "string" ? JSON.parse(scoreBoardData[0].data.resultTable) : scoreBoardData[0].data.resultTable;

    // 두 데이터를 합쳐서 반환
    res.json({
      teamData: teamDataTable,
      scoreData: scoreDataTable,
      resultData: resultDataTable
    });
  } catch (err) {
    console.error("API 요청 실패:", err.message);
    res.status(500).json({ error: "데이터를 가져오지 못했습니다." });
  }
});

module.exports = router;
