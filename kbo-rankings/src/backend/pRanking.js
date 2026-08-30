const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const season = req.query.season || new Date().getFullYear();
    const limit = req.query.limit || 30;
    const playerType = req.query.playerType ? req.query.playerType.toUpperCase() : null; // HITTER | PITCHER | null

    const fetchRankings = async (type) => {
      const url = `https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${season}/top-players?playerType=${type}&limit=${limit}`;
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
          Referer: "https://m.sports.naver.com/kbaseball/record/kbo",
          Origin: "https://m.sports.naver.com",
        },
      });
      return response.data?.result?.topPlayers || [];
    };

    if (playerType === "HITTER" || playerType === "PITCHER") {
      const topPlayers = await fetchRankings(playerType);
      return res.json({
        code: 200,
        success: true,
        result: {
          topPlayers,
        },
      });
    }

    // playerType 지정이 없으면 타자와 투수 둘 다 병렬로 조회
    const [hitterTopPlayers, pitcherTopPlayers] = await Promise.all([
      fetchRankings("HITTER"),
      fetchRankings("PITCHER"),
    ]);

    return res.json({
      code: 200,
      success: true,
      result: {
        hitters: hitterTopPlayers,
        pitchers: pitcherTopPlayers,
        topPlayers: [...hitterTopPlayers, ...pitcherTopPlayers],
      },
    });
  } catch (error) {
    console.error("Player Rankings fetch error:", error.message);
    return res.status(500).json({
      code: 500,
      success: false,
      error: "Failed to fetch player rankings",
    });
  }
});

module.exports = router;
