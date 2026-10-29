const https = require("https");
const axios = require("axios");

// Chrome 브라우저의 기본 TLS Cipher Suites 및 ECDH Curves 목록
// (Node.js의 기본 OpenSSL 지문과 달리 브라우저의 실제 TLS 지문을 모방하여 네이버 WAF 차단을 방지)
const chromeCiphers = [
  "TLS_AES_128_GCM_SHA256",
  "TLS_AES_256_GCM_SHA384",
  "TLS_CHACHA20_POLY1305_SHA256",
  "ECDHE-ECDSA-AES128-GCM-SHA256",
  "ECDHE-RSA-AES128-GCM-SHA256",
  "ECDHE-ECDSA-AES256-GCM-SHA384",
  "ECDHE-RSA-AES256-GCM-SHA384",
  "ECDHE-ECDSA-CHACHA20-POLY1305",
  "ECDHE-RSA-CHACHA20-POLY1305",
  "ECDHE-RSA-AES128-SHA",
  "ECDHE-RSA-AES256-SHA",
  "AES128-GCM-SHA256",
  "AES256-GCM-SHA384",
  "AES128-SHA",
  "AES256-SHA",
].join(":");

const chromeHttpsAgent = new https.Agent({
  ciphers: chromeCiphers,
  ecdhCurve: "X25519:P-256:P-384",
  keepAlive: true,
});

const naverBrowserHeaders = {
  Accept: "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  Origin: "https://m.sports.naver.com",
  Referer: "https://m.sports.naver.com/",
  "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
};

// 네이버 스포츠 API 호출 전용 Axios 인스턴스
const naverAxios = axios.create({
  httpsAgent: chromeHttpsAgent,
  headers: naverBrowserHeaders,
  timeout: 8000,
});

module.exports = {
  naverAxios,
  chromeHttpsAgent,
  naverBrowserHeaders,
};

