const express = require("express");
const { naverAxios } = require("./naverClient");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const season = req.query.season || new Date().getFullYear();
    const limit = req.query.limit || 30;
    const playerType = req.query.playerType ? req.query.playerType.toUpperCase() : "HITTER"; // HITTER | PITCHER
    const defaultStat = playerType === "PITCHER" ? "pitcherEra" : "hitterHra";
    const sortBy = req.query.stat || defaultStat;

    // 평균자책점(ERA), WHIP 등은 낮을수록 우수하므로 asc 정렬
    const ascStats = ["pitcherEra", "pitcherWhip"];
    const sortDirection = ascStats.includes(sortBy) ? "asc" : "desc";

    const fetchRankings = async (type, stat) => {
      const dir = ascStats.includes(stat) ? "asc" : "desc";
      const url = `https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${season}/players?sortField=${stat}&sortDirection=${dir}&playerType=${type}&gameType=REGULAR_SEASON&pageSize=${limit}`;
      const response = await naverAxios.get(url);
      return response.data?.result?.seasonPlayerStats || [];
    };

    const players = await fetchRankings(playerType, sortBy);

    return res.json({
      code: 200,
      success: true,
      result: {
        players,
        topPlayers: players, // 이전 호환성 유지
        [playerType === "HITTER" ? "hitters" : "pitchers"]: players,
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
