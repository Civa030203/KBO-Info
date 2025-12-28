const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { pId } = req.query;
    let url = `http://koreabaseball.com/Record/Player/HitterDetail/Total.aspx?playerId=${pId}`;

    let response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0 Safari/537.36",
      },
    });

    let $ = cheerio.load(response.data);

    // --- 기본 정보 ---
    const name = $("#contents > div.sub-content > div.player_info > div.player_basic > ul > li:nth-child(1)").text().substr(5);
    const position = $("#cphContents_cphContents_cphContents_playerProfile_lblPosition").text().trim();
    const birth = $("#cphContents_cphContents_cphContents_playerProfile_lblBirthday").text().trim();
    const body = $("#cphContents_cphContents_cphContents_playerProfile_lblHeightWeight").text().trim();
    const backNo = $("#cphContents_cphContents_cphContents_playerProfile_lblBackNo").text();
    const proDebut = $("#cphContents_cphContents_cphContents_playerProfile_lblJoinInfo").text().trim();

    // --- 연도별 기록 테이블 ---
    let rows = $("#contents > div.sub-content > div.player_records > div > table > tbody > tr");

    if (position.substr(0, 1) == "투") {
      url = `http://koreabaseball.com/Record/Player/PitcherDetail/Total.aspx?playerId=${pId}`;
      response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0 Safari/537.36",
        },
      });
      $ = cheerio.load(response.data);
      rows = $("#contents > div.sub-content > div.player_records > div > table > tbody > tr");
    }

    const records = [];

    rows.each((i, row) => {
      const tds = $(row).find("td");
      
      if (tds.length === 0) return;

      // 필요한 열 인덱스 (0부터 시작)
      const year = tds.eq(0).text().trim();       // 연도
      const team = tds.eq(1).text().trim();       // 팀명
      if (position.substr(0, 1) == "투" ) {
        const win = tds.eq(6).text().trim();
        const loss = tds.eq(7).text().trim();
        const save = tds.eq(8).text().trim();
        const hold = tds.eq(9).text().trim();
        const era = tds.eq(2).text().trim();
        const hit = tds.eq(13).text().trim();
        const bb = tds.eq(15).text().trim();
        const hbp = tds.eq(16).text().trim();
        const ip = tds.eq(12).text().trim();

        // whip 계산
        let whip = "-";
        if (!ip == 0) {
          let inn = 0;
          try {
            inn = ip.parseInt(); // 이닝 수가 정수일 경우 그대로 정수화
          } catch (error) { // 이닝 수가 소수일 경우
            let tmp;
            let decimal = 0;
            tmp = ip.split(" ");
            console.log(tmp);
            if (tmp[1] == "1/3") decimal = 0.33;
            if (tmp[1] == "2/3") decimal = 0.67;
            inn = parseInt(tmp[0]) + parseFloat(decimal);
            console.log(inn);
          }
          whip = ((parseInt(hit) + parseInt(bb) + parseInt(hbp)) / parseFloat(inn)).toFixed(2);
        }
        records.push({
          year,
          team,
          win,
          loss,
          save,
          hold,
          era,
          whip
        });
      } else {
      const avg = tds.eq(2).text().trim();        // 타율 (2번 열)
      const slg = tds.eq(19).text().trim();       // 장타율 (20번 열)
      const obp = tds.eq(20).text().trim();       // 출루율 (21번 열)
      const hr = tds.eq(10).text().trim();        // 홈런 (11번 열)
      const rbi = tds.eq(12).text().trim();       // 타점 (13번 열)

      // OPS 계산
      let ops = "-";
      if (!isNaN(parseFloat(slg)) && !isNaN(parseFloat(obp))) {
        ops = (parseFloat(slg) + parseFloat(obp)).toFixed(3);
      }
      
      records.push({
          year,
          team,
          avg,
          obp,
          slg,
          hr,
          rbi,
          ops
        }); 
      }
      
    });

    // 최종 응답
    res.json({
      name,
      position,
      birth,
      body,
      backNo,
      proDebut,
      records
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Scraping failed" });
  }
});

module.exports = router;
