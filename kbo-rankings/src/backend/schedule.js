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

    const requests = [];
    for (let currentSrId = 0; currentSrId <= 10; currentSrId++) {
      const url = `http://koreabaseball.com/ws/Main.asmx/GetKboGameList?&dataType=json&leId=${leId}&srId=${currentSrId}&date=${date}`;
      requests.push(
        axios.get(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
          },
        }).then(res => ({ srId: currentSrId, data: res.data }))
      );
    }

    const responses = await Promise.all(requests);
    const gameData = [];

    for (const response of responses) {
      if (response.data && response.data.game && response.data.game.length > 0) {
        for (let i = 0; i < response.data.game.length; i++) {
          const gameInfo = response.data.game[i];
          const newGame = {
            date: gameInfo.G_DT_TXT,
            gameID: gameInfo.G_ID,
            gameTime: gameInfo.G_TM,
            stadium: gameInfo.S_NM,
            gameScore: `${gameInfo.T_SCORE_CN} : ${gameInfo.B_SCORE_CN}`,
            awayTeam: gameInfo.AWAY_ID,
            homeTeam: gameInfo.HOME_ID,
            awayTeamName: gameInfo.AWAY_NM,
            homeTeamName: gameInfo.HOME_NM,
            awaySPitcher: gameInfo.T_PIT_P_ID,
            homeSPitcher: gameInfo.B_PIT_P_ID,
            isCanceled: gameInfo.CANCEL_SC_ID,
            gameState: gameInfo.GAME_STATE_SC,
            gameType: gameInfo.GAME_SC_NM,
            gameNumber: gameInfo.VS_GAME_CN,
            seriesId: response.srId,
            gameMaxInn: gameInfo.GAME_INN_NO
          };

          switch (newGame.gameType.slice(0, 2)) {
            case 'WC':
              newGame.gameType = '와일드카드 결정전 ' + String(newGame.gameNumber) + "차전";
              break;
            case '준P':
              newGame.gameType = '준플레이오프 ' + String(newGame.gameNumber) + "차전";
              break;
            case 'PO':
              newGame.gameType = '플레이오프 ' + String(newGame.gameNumber) + "차전";
              break;
            case 'KS':
              newGame.gameType = '한국시리즈 ' + String(newGame.gameNumber) + "차전";
              break;
            default:
              break;
          }

          gameData.push(newGame);
        }
      }
    }

    res.json(gameData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
});

module.exports = router;
