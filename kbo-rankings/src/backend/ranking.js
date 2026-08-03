const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
  // 기본값으로 2026년 지정 (쿼리가 없거나 이상할 때 대비)
  const year = req.query.year || new Date().getFullYear();

  try {
    const url = `https://m.koreabaseball.com/ws/Kbo.asmx/GetTeamRankKboLeague?season_id=${year}&sr_id=0`;

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      },
    });

    // 1. listKbo (순위 & 팀명)
    const listKbo = data.listKbo || [];

    // 2. tableKbo (문자열 형태의 JSON 파싱)
    const tableKboParsed = data.tableKbo ? JSON.parse(data.tableKbo) : { rows: [] };
    const rows = tableKboParsed.rows || [];

    // 3. 두 데이터를 인덱스(index) 기준으로 조합하여 유의미한 데이터만 정제
    const result = listKbo.map((teamInfo, index) => {
      // 해당 팀의 세부 성적 행(row) 가져오기
      const rowData = rows[index]?.row || [];
      const textValues = rowData.map((item) => item.Text);

      return {
        rank: teamInfo.RANK_NO ? String(teamInfo.RANK_NO).trim() : "",
        team: teamInfo.T_NM ? teamInfo.T_NM.trim() : "", // 공백 제거 (예: "OB    " -> "OB")
        games: textValues[0] || "0",       // 경기수
        win: textValues[1] || "0",         // 승
        lose: textValues[2] || "0",        // 패
        draw: textValues[3] || "0",        // 무
        winRate: textValues[4] || "0.000", // 승률
        gamesBehind: textValues[5] === "-" ? "0" : (textValues[5] || "0"), // 게임차 ('-' 표시는 0으로 변환)
      };
    });

    res.json(result);
  } catch (err) {
    console.error("KBO 순위 API 데이터 처리 에러:", err.message);
    res.status(500).json({ error: "Failed to fetch KBO Rankings" });
  }
});

module.exports = router;