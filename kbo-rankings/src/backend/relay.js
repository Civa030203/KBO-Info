const express = require("express");
const axios = require("axios");
const cors = require("cors");

const router = express.Router();
router.use(cors());

router.get("/", async (req, res) => {
  const { le_id, sr_id, g_id, inning, order } = req.query;

  const url = `https://m.koreabaseball.com/ws/Kbo.asmx/GetLiveText?&le_id=${le_id}&sr_id=${sr_id}&g_id=${g_id}&inning=${inning}&order=${order}`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      },
    });

    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    res.json(parsed);
  } catch (err) {
    console.error("API 요청 실패:", err.message);
    res.status(500).json({ error: "데이터를 가져오지 못했습니다." });
  }

});

module.exports = router;
