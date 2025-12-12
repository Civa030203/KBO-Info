// routes/Schedule.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { date, leId } = req.query; // YYYYMMDD 형식
    if (!date) {
      return res.status(400).json({ error: "날짜를 입력해주세요 (YYYYMMDD)" });
    }
    // const today = new Date();
    // const formattedDate = `${today.getFullYear()}${today.getMonth() + 1<10?`0${today.getMonth() + 1}`:today.getMonth() + 1}${today.getDate()<10?`0${today.getDate()}`:today.getDate()}`;

    let data = null;
    var srId = 0;
    let isNoGame = false;
    while (true) {
      const url = `http://koreabaseball.com/ws/Main.asmx/GetKboGameList?&dataType=json&leId=${leId}&srId=${srId}&date=` + date;
      const res = await axios.get(url, {
        headers: {
          "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
        },
      });
      data = res.data;
      if (data.game.length >= 1) break;
      if (srId >= 10) break;
      srId += 1;
    }

    const gameData = []

    for (var i = 0; i < data.game.length; i++) {
      gameData.push({
        date: data.game[i].G_DT_TXT,
        gameID: data.game[i].G_ID,
        gameTime: data.game[i].G_TM,
        stadium: data.game[i].S_NM,
        gameScore: `${data.game[i].T_SCORE_CN} : ${data.game[i].B_SCORE_CN}`,
        awayTeam: data.game[i].AWAY_ID,
        homeTeam: data.game[i].HOME_ID,
        awayTeamName: data.game[i].AWAY_NM,
        homeTeamName: data.game[i].HOME_NM,
        awaySPitcher: data.game[i].T_PIT_P_ID,
        homeSPitcher: data.game[i].B_PIT_P_ID,
        isCanceled: data.game[i].CANCEL_SC_ID,
        gameState: data.game[i].GAME_STATE_SC,
        gameType: data.game[i].GAME_SC_NM,
        gameNumber: data.game[i].VS_GAME_CN,
        seriesId: srId,
        gameMaxInn: data.game[i].GAME_INN_NO
      });

      switch (gameData[i].gameType.slice(0, 2)) {
        case 'WC':
          gameData[i].gameType = '와일드카드 결정전 ' + String(gameData[i].gameNumber) + "차전";
          break;
        case '준P':
          gameData[i].gameType = '준플레이오프 ' + String(gameData[i].gameNumber) + "차전";
          break;
        case 'PO':
          gameData[i].gameType = '플레이오프 ' + String(gameData[i].gameNumber) + "차전";
          break;
        case 'KS':
          gameData[i].gameType = '한국시리즈 ' + String(gameData[i].gameNumber) + "차전";
          break;
        default:
          break;
      }
    }

    res.json(gameData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
});

module.exports = router;
