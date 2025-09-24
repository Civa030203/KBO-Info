const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const url =
      "https://www.koreabaseball.com/Record/TeamRank/TeamRankDaily.aspx";

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
    const rows = $("#cphContents_cphContents_cphContents_udpRecord > table > tbody > tr");
    const result = [];

    rows.each((_, row) => {
      const cols = $(row).find("td");
      if (cols.length > 0) {
        result.push({
          rank: $(cols[0]).text().trim(),
          team: $(cols[1]).text().trim(),
          games: $(cols[2]).text().trim(),
          win: $(cols[3]).text().trim(),
          lose: $(cols[4]).text().trim(),
          draw: $(cols[5]).text().trim(),
          winRate: $(cols[6]).text().trim(),
          gamesBehind: $(cols[7]).text().trim()
        });
      }
    });

    res.json(result);
  } catch (err) {
    console.error("크롤링 에러:", err.message);
    res.status(500).json({ error: "Failed to fetch KBO Rankings" });
  }
});

module.exports = router;
