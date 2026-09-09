const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const VIDEO_MAP_PATH = path.join(__dirname, "videoMap.json");

// 메모리 캐싱 (매번 파일 IO 방지, 파일 변경 시 대비 mtime 확인 가능)
let cachedData = null;
let lastModifiedTime = 0;

const loadVideoMap = () => {
  try {
    if (fs.existsSync(VIDEO_MAP_PATH)) {
      const stats = fs.statSync(VIDEO_MAP_PATH);
      if (!cachedData || stats.mtimeMs > lastModifiedTime) {
        const raw = fs.readFileSync(VIDEO_MAP_PATH, "utf8");
        cachedData = JSON.parse(raw);
        lastModifiedTime = stats.mtimeMs;
      }
      return cachedData;
    }
  } catch (err) {
    console.error("videoMap.json 로딩 실패:", err);
  }
  return {};
};

// GET /api/videoMap
router.get("/", (req, res) => {
  const data = loadVideoMap();
  res.json({
    success: true,
    result: data,
    updatedAt: lastModifiedTime,
  });
});

module.exports = router;
