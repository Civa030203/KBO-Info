const express = require("express");
const axios = require("axios");
const cors = require("cors");

const router = express.Router();
router.use(cors());

router.get("/", async (req, res) => {
  const { le_id, sr_id, g_id, inning, order } = req.query;

  const url = `https://m.koreabaseball.com/ws/Kbo.asmx/GetLiveText?&le_id=${le_id}&sr_id=${sr_id}&g_id=${g_id}&inning=${inning}&order=${order}`;
  const postGameUrl = `https://m.koreabaseball.com/ws/Kbo.asmx/GetLiveTextResult?le_id=${le_id}&sr_id=${sr_id}&g_id=${g_id}`;

  try {
    // 두 API 요청을 병렬로 실행
    const [liveRes, postGameRes] = await Promise.all([
      axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
        },
      }),
      axios.get(postGameUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
        },
      }),
    ]);

    // 문자열인 경우 JSON 파싱

    const liveData =
      typeof liveRes.data === "string" ? JSON.parse(liveRes.data) : liveRes.data;
    const postGameData =
      typeof postGameRes.data === "string"
        ? JSON.parse(postGameRes.data)
        : postGameRes.data;

    // 두 데이터를 합쳐서 반환
    res.json({
      live: liveData,
      postGame: postGameData,
    });
  } catch (err) {
    console.error("API 요청 실패:", err.message);
    res.status(500).json({ error: "데이터를 가져오지 못했습니다." });
  }
});

module.exports = router;
