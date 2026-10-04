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
      const url = `https://m.koreabaseball.com/ws/Kbo.asmx/GetKboGameList?leId=${leId}&srId=${currentSrId}&date=${date}`;
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
            awaySPitcherName: gameInfo.T_PIT_P_NM,
            homeSPitcherName: gameInfo.B_PIT_P_NM,
            winPitcher: gameInfo.W_PIT_P_NM,
            lostPitcher: gameInfo.L_PIT_P_NM,
            isCanceled: gameInfo.CANCEL_SC_ID,
            gameState: gameInfo.GAME_STATE_SC,
            gameType: null,
            gameNumber: gameInfo.VS_GAME_CN,
            seriesId: response.srId,
            gameMaxInn: gameInfo.GAME_INN_NO,
            isTopOrBottom: gameInfo.GAME_TB_SC_NM,
            awayTeamCurrentPlayer: gameInfo.T_P_NM,
            homeTeamCurrentPlayer: gameInfo.B_P_NM
          };

          if (newGame.gameType !== undefined) {
            switch (newGame.seriesId) {
              case 4:
                newGame.gameType = '와일드카드 결정전 ' + String(newGame.gameNumber) + "차전";
                break;
              case 3:
                newGame.gameType = '준플레이오프 ' + String(newGame.gameNumber) + "차전";
                break;
              case 5:
                newGame.gameType = '플레이오프 ' + String(newGame.gameNumber) + "차전";
                break;
              case 7:
                newGame.gameType = '한국시리즈 ' + String(newGame.gameNumber) + "차전";
                break;
              case 9:
                newGame.gameType = '올스타전';
                break;
              default:
                break;
            }
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

router.get("/weekly", async (req, res) => {
  try {
    const { date, leId } = req.query; // YYYYMMDD 형식
    if (!date) {
      return res.status(400).json({ error: "날짜를 입력해주세요 (YYYYMMDD)" });
    }

    const year = parseInt(date.substring(0, 4), 10);
    const month = parseInt(date.substring(4, 6), 10) - 1;
    const day = parseInt(date.substring(6, 8), 10);

    const startDate = new Date(year, month, day);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dYear = d.getFullYear();
      const dMonth = String(d.getMonth() + 1).padStart(2, '0');
      const dDay = String(d.getDate()).padStart(2, '0');
      dates.push(`${dYear}${dMonth}${dDay}`);
    }

    const requests = [];
    for (const d of dates) {
      for (let currentSrId = 0; currentSrId <= 10; currentSrId++) {
        const url = `https://m.koreabaseball.com/ws/Kbo.asmx/GetKboGameList?leId=${leId || 1}&srId=${currentSrId}&date=${d}`;
        requests.push(
          axios.get(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
            },
          }).then(res => ({ srId: currentSrId, targetDate: d, data: res.data }))
        );
      }
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
            stadium: gameInfo.S_NM,
            awayTeamName: gameInfo.AWAY_NM,
            homeTeamName: gameInfo.HOME_NM,
            awayScore: gameInfo.T_SCORE_CN,
            homeScore: gameInfo.B_SCORE_CN,
            gameScore: `${gameInfo.T_SCORE_CN} : ${gameInfo.B_SCORE_CN}`,
            isCanceled: gameInfo.CANCEL_SC_ID,
            gameState: gameInfo.GAME_STATE_SC,
            gameMaxInn: gameInfo.GAME_INN_NO,
            isTopOrBottom: gameInfo.GAME_TB_SC_NM,
          };
          gameData.push(newGame);
        }
      }
    }

    res.json(gameData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch weekly schedule" });
  }
});

// routes/Schedule.js

// 팀 간 맞대결 전적 및 경기 목록 조회 API
router.get("/head-to-head", async (req, res) => {
  try {
    const { year, team1, team2, leId = 1 } = req.query; // team1, team2는 팀명(예: '두산', 'LG')

    if (!year || !team1 || !team2) {
      return res.status(400).json({ error: "year, team1, team2 파라미터가 필요합니다." });
    }

    // 1. 해당 연도의 3월부터 10월까지 모든 날짜 생성 (정규시즌 기간)
    const dates = [];
    const start = new Date(`${year}-03-01`);
    const end = new Date(`${year}-10-31`);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      dates.push(`${yyyy}${mm}${dd}`);
    }

    // 2. 해당 연도 정규시즌(srId=0) 경기를 병렬 요청 (성능을 위해 월별 또는 전체 요청)
    // Note: KBO API 호출 부하를 줄이기 위해 srId=0 (정규시즌) 위주로 조회
    const requests = dates.map((d) =>
      axios
        .get(`https://m.koreabaseball.com/ws/Kbo.asmx/GetKboGameList?leId=${leId}&srId=0&date=${d}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
          },
        })
        .then((res) => res.data)
        .catch(() => null)
    );

    const responses = await Promise.all(requests);

    // 3. 두 팀간 맞대결 경기 필터링 및 전적 집계
    const matchupGames = [];
    const stats = {
      [team1]: { win: 0, draw: 0, loss: 0, runs: 0 },
      [team2]: { win: 0, draw: 0, loss: 0, runs: 0 },
    };

    for (const resData of responses) {
      if (!resData?.game || resData.game.length === 0) continue;

      for (const g of resData.game) {
        const away = g.AWAY_NM;
        const home = g.HOME_NM;

        // 두 팀 간의 경기인지 확인
        const isMatchup =
          (away === team1 && home === team2) || (away === team2 && home === team1);

        if (isMatchup) {
          const awayScore = parseInt(g.T_SCORE_CN, 10) || 0;
          const homeScore = parseInt(g.B_SCORE_CN, 10) || 0;
          const gameState = String(g.GAME_STATE_SC); // 3: 종료

          const gameItem = {
            date: g.G_DT_TXT,
            gameID: g.G_ID,
            gameTime: g.G_TM,
            stadium: g.S_NM,
            awayTeamName: away, // awayTeam -> awayTeamName
            homeTeamName: home, // homeTeam -> homeTeamName
            gameScore: `${g.T_SCORE_CN} : ${g.B_SCORE_CN}`,
            awayScore,
            homeScore,
            gameState,
            winPitcher: g.W_PIT_P_NM,
            lostPitcher: g.L_PIT_P_NM,
          };

          matchupGames.push(gameItem);

          // 경기 종료(gameState === "3") 건만 전적 집계
          if (gameState === "3") {
            if (away === team1) {
              stats[team1].runs += awayScore;
              stats[team2].runs += homeScore;

              if (awayScore > homeScore) {
                stats[team1].win++;
                stats[team2].loss++;
              } else if (awayScore < homeScore) {
                stats[team1].loss++;
                stats[team2].win++;
              } else {
                stats[team1].draw++;
                stats[team2].draw++;
              }
            } else {
              // away === team2
              stats[team2].runs += awayScore;
              stats[team1].runs += homeScore;

              if (awayScore > homeScore) {
                stats[team2].win++;
                stats[team1].loss++;
              } else if (awayScore < homeScore) {
                stats[team2].loss++;
                stats[team1].win++;
              } else {
                stats[team2].draw++;
                stats[team1].draw++;
              }
            }
          }
        }
      }
    }

    res.json({
      year,
      matchup: {
        team1,
        team2,
        stats,
      },
      games: matchupGames,
    });
  } catch (error) {
    console.error("Head to head error:", error);
    res.status(500).json({ error: "맞대결 전적 정보를 불러오지 못했습니다." });
  }
});

module.exports = router;
