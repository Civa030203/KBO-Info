const express = require("express");
const axios = require("axios");
const cors = require("cors");

const router = express.Router();
router.use(cors());

// KBO 구단 코드 -> 구단명 매핑
const KBO_CODE_MAP = {
  OB: "두산",
  LG: "LG",
  HT: "KIA",
  KIA: "KIA",
  SS: "삼성",
  LT: "롯데",
  HH: "한화",
  SK: "SSG",
  SSG: "SSG",
  WO: "키움",
  NC: "NC",
  KT: "KT",
  MB: "MBC",
  BE: "빙그레",
  SB: "쌍방울",
  SM: "삼미",
  CB: "청보",
  PA: "태평양",
  HD: "현대",
  NX: "넥센",
  HE: "히어로즈",
  KR: "한국",
  JP: "일본",
  CN: "중국",
  TW: "대만",
  DR: "드림",
  NN: "나눔",
};

// KBO gameId -> 네이버 apiGameId 변환기
function getNaverGameId(gameId, seriesId) {
  if (!gameId) return "";
  const year = gameId.substring(0, 4);
  const sId = String(seriesId);
  if (["3", "4", "5", "7", "8", "9"].includes(sId)) {
    if (gameId === "20260925KRJP0") return "88880925S2S402026";
    if (gameId === "20260926CNKR0") return "88880926S2S302026";
    if (gameId === "20260927KRJP0") return "88880927F1F202026";
    const prefix = sId.repeat(4);
    return `${prefix}${gameId.substring(4)}${year}`;
  }
  return `${gameId}${year}`;
}

// gameId에서 팀명 추출 (Fallback용)
function extractTeamNamesFromGameId(gameId) {
  if (!gameId || gameId.length < 12) return { awayName: "원정팀", homeName: "홈팀" };
  const awayCode = gameId.substring(8, 10);
  const homeCode = gameId.substring(10, 12);
  return {
    awayName: KBO_CODE_MAP[awayCode] || awayCode,
    homeName: KBO_CODE_MAP[homeCode] || homeCode,
  };
}

// 1. 네이버 textRelays -> 문자중계(live.listInnTb) 매핑 함수
function mapNaverRelayToLive(textRelayData, defaultAwayName, defaultHomeName) {
  const textRelays = textRelayData.textRelays || [];

  // 공격 타이틀("4회초 두산 공격") 등에서 팀명 추출 시도
  let awayTeamName = defaultAwayName;
  let homeTeamName = defaultHomeName;
  textRelays.forEach((tr) => {
    if (tr.title && tr.title.includes("공격")) {
      const parsedName = tr.title.replace(/\d+회(초|말)\s*/, "").replace(/\s*공격/, "").trim();
      if (parsedName) {
        if (String(tr.homeOrAway) === "0") awayTeamName = parsedName;
        if (String(tr.homeOrAway) === "1") homeTeamName = parsedName;
      }
    }
  });

  // 초(away: homeOrAway == "0")와 말(home: homeOrAway == "1") 분리
  const topRelays = textRelays.filter((r) => String(r.homeOrAway) === "0");
  const bottomRelays = textRelays.filter((r) => String(r.homeOrAway) === "1");

  // 시간순(ASC)으로 보여주기 위해 reverse (네이버 응답은 최신순 DESC)
  const formatRelayBlock = (relays, teamName, tbNm, tbSc) => {
    if (!relays || relays.length === 0) return null;
    const chronological = relays.slice().reverse();
    const batOrders = [];

    chronological.forEach((tr) => {

      if (tr.title && tr.title.includes("공격")) return;
      if (tr.titleStyle == 99) return;

      let batOrderNo = 0;
      let batName = "";
      let isPinchHitter = false;
      let winPercentage = tr.metricOption;
      console.log(tr.textOptions[0]);
      if (tr.textOptions[0].type === 8) {
        try {
          if (tr.textOptions[0].batterRecord.posName === '대타' || tr.textOptions[0].batterRecord.posName === null) {
            isPinchHitter = true;
          }
        } catch (error) {
          console.log(error);
          if (tr.textOptions[0].text.split(" ")[0] === '대타') isPinchHitter = true;
        }
      }

      const match = tr.title ? tr.title.match(/(\d+)번타자\s*(.*)/) : null;

      if (match) {
        batOrderNo = parseInt(match[1], 10);
        batName = match[2].trim();
      } else {
        batName = tr.title || "";
        if (isPinchHitter) batName = batName.split(" ")[1]
      }

      const firstOpt = tr.textOptions?.[0];
      const batPId = firstOpt?.currentGameState?.batter || "";


      const listData = (tr.textOptions || []).flatMap((opt) => {
        // style(opt.type) 값이 8일 경우 스킵 (빈 배열 반환)
        if (opt.type === 8 || opt.type === 99) {
          return [];
        }

        const style = opt.type;
        const t = opt.text || "";
        let speed = 0;
        let type = "";
        try {
          type = opt.stuff;
          speed = opt.speed;
        } catch (error) {
        }

        return [{
          LIVETEXT_IF: t,
          TEXTSTYLE_SC: style,
          PITCH_TYPE: type,
          SPEED: speed
        }];
      });

      batOrders.push({
        BAT_ORDER_NO: batOrderNo,
        BAT_P_NM: batName,
        BAT_P_ID: String(batPId),
        isPinchHitter: isPinchHitter,
        listData,
        WinPercentage: winPercentage
      });
    });

    return {
      T_NM: teamName,
      TB_NM: tbNm,
      TB_SC: tbSc,
      listBatOrder: batOrders,
    };
  };

  const listInnTb = [];
  const topBlock = formatRelayBlock(topRelays, awayTeamName, "초", "T");
  if (topBlock) listInnTb.push(topBlock);
  const bottomBlock = formatRelayBlock(bottomRelays, homeTeamName, "말", "B");
  if (bottomBlock) listInnTb.push(bottomBlock);

  // 경기 종료 결과(승리투수, 패전투수 등)
  const postGameResults = [];
  // textRelays.forEach((tr) => {
  //   (tr.textOptions || []).forEach((opt) => {
  //     if (
  //       opt.type === 99 ||
  //       (opt.text &&
  //         (opt.text.includes("승리투수") ||
  //           opt.text.includes("패전투수") ||
  //           opt.text.includes("세이브") ||
  //           opt.text.includes("홀드")))
  //     ) {
  //       postGameResults.push({ LIVETEXT_IF: opt.text });
  //     }
  //   });
  // });

  return {
    awayTeamName,
    homeTeamName,
    live: {
      listInnTb,
    },
    postGame: {
      listResult: postGameResults,
    },
  };
}

// 2. 네이버 inningScore & currentGameState -> 스코어보드 매핑 함수
function mapNaverScoreBoard(textRelayData, awayTeamName, homeTeamName) {
  const cgs = textRelayData.currentGameState || {};
  const inScore = textRelayData.inningScore || {};

  const innKeys = Array.from(
    new Set([...Object.keys(inScore.away || {}), ...Object.keys(inScore.home || {})])
  )
    .map(Number)
    .sort((a, b) => a - b);

  const awayScores = innKeys.map((k) => inScore.away?.[String(k)] ?? "-");
  const homeScores = innKeys.map((k) => inScore.home?.[String(k)] ?? "-");

  return {
    teamData: [awayTeamName, homeTeamName],
    scoreData: [awayScores, homeScores],
    resultData: [
      [
        String(cgs.awayScore ?? 0),
        String(cgs.awayHit ?? 0),
        String(cgs.awayError ?? 0),
        String(cgs.awayBallFour ?? 0),
      ],
      [
        String(cgs.homeScore ?? 0),
        String(cgs.homeHit ?? 0),
        String(cgs.homeError ?? 0),
        String(cgs.homeBallFour ?? 0),
      ],
    ],
  };
}

// 3. 네이버 lineup -> 오늘의 경기 기록(박스스코어) 매핑 함수
function mapNaverRecord(textRelayData, awayTeamName, homeTeamName) {
  const formatRecord = (lineupObj, defaultTeamName) => {
    if (!lineupObj) return null;
    const rawBatters = (lineupObj.batter || []).slice();
    const pitchers = lineupObj.pitcher || [];

    // 타순 및 출전 순서(seqno) 기준으로 정렬: 선발 선수가 항상 먼저 오고, 교체 선수가 그 뒤에 옴
    rawBatters.sort((a, b) => {
      if (a.batOrder !== b.batOrder) return (a.batOrder || 0) - (b.batOrder || 0);
      return (a.seqno || 0) - (b.seqno || 0);
    });

    // 타순별 그룹핑하여 교체 전후 선수 매핑
    const byOrder = {};
    rawBatters.forEach((b) => {
      byOrder[b.batOrder] = byOrder[b.batOrder] || [];
      byOrder[b.batOrder].push(b);
    });

    const listHitter = rawBatters.map((b) => {
      const group = byOrder[b.batOrder] || [];
      const myIdx = group.findIndex((g) => g.name === b.name && g.pcode === b.pcode);

      const isSubOut = b.cout === "true" || b.cout === true;
      const isSubIn = (b.seqno && Number(b.seqno) > 1) || b.cin === "true" || b.cin === true;

      let replacedFrom = null; // 누구 대신 투입되었는지
      let replacedTo = null;   // 누구로 교체아웃 되었는지

      if (isSubIn && myIdx > 0) {
        replacedFrom = group[myIdx - 1]?.name || null;
      }
      if (isSubOut && myIdx < group.length - 1) {
        replacedTo = group[myIdx + 1]?.name || null;
      }

      return {
        P_ID: String(b.pcode || ""),
        NAME: b.name || "",
        SPAN: b.posName || `${b.batOrder}번타자`,
        RANK: b.batOrder || 0,
        CHANGE: isSubOut ? 1 : 0, // 교체아웃 선수를 1로 설정하여 하위 호환 유지
        isSubOut,
        isSubIn,
        replacedFrom,
        replacedTo,
      };
    });

    const tableHitter = rawBatters.map((b) => [
      String(b.ab ?? 0),
      String(b.run ?? 0),
      String(b.hit ?? 0),
      String(b.hr ?? 0),
      String(b.rbi ?? 0),
      String((b.bb ?? 0) + (b.hbp ?? 0)),
      String(b.so ?? 0),
    ]);

    const listPitcher = pitchers.map((p, idx) => ({
      P_ID: String(p.pcode || ""),
      NAME: p.name || "",
      SPAN: idx === 0 || p.seqno === 1 ? "선발" : "구원",
    }));

    const tablePitcher = pitchers.map((p) => [
      String(p.inn ?? "0.0"),
      String(p.ballCount ?? 0),
      String(p.hit ?? 0),
      String(p.hr ?? 0),
      String((p.bb ?? 0) + (p.hbp ?? 0)),
      String(p.kk ?? 0),
      String(p.run ?? 0),
    ]);

    return {
      teamName: defaultTeamName || "",
      listHitter,
      tableHitter,
      listPitcher,
      tablePitcher,
    };
  };

  return {
    away: formatRecord(textRelayData.awayLineup, awayTeamName),
    home: formatRecord(textRelayData.homeLineup, homeTeamName),
  };
}

// 메인 중계 엔드포인트
router.get("/", async (req, res) => {
  const { le_id = "1", sr_id = "0", g_id, inning = "1", order = "ASC" } = req.query;

  // 1군 경기(le_id === "1")인 경우 네이버 스포츠 API 호출
  if (String(le_id) === "1") {
    try {
      const apiGameId = getNaverGameId(g_id, sr_id);
      const naverUrl = `https://api-gw.sports.naver.com/schedule/games/${apiGameId}/relay?inning=${inning}`;

      const response = await axios.get(naverUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
          Referer: "https://sports.naver.com/",
        },
      });

      const textRelayData = response.data?.result?.textRelayData;
      if (textRelayData) {
        const { awayName: defAway, homeName: defHome } = extractTeamNamesFromGameId(g_id);
        const { live, postGame, awayTeamName, homeTeamName } = mapNaverRelayToLive(
          textRelayData,
          defAway,
          defHome
        );
        const scoreBoard = mapNaverScoreBoard(textRelayData, awayTeamName, homeTeamName);
        const record = mapNaverRecord(textRelayData, awayTeamName, homeTeamName);
        const entry = {
          away: textRelayData.awayEntry || { batter: [], pitcher: [] },
          home: textRelayData.homeEntry || { batter: [], pitcher: [] },
        };

        return res.json({
          isNaver: true,
          live,
          postGame,
          scoreBoard,
          entry,
          record,
        });
      }
    } catch (naverErr) {
      console.warn("네이버 API 호출 실패, KBO 공식 API로 대체 시도:", naverErr);
      // 네이버 호출 실패 시 하단의 KBO 공식 API로 자동 Fallback
    }
  }

  // 2군(퓨처스리그 등) 또는 네이버 API 실패 시: 기존 KBO 공식 API 호출
  const url = `https://m.koreabaseball.com/ws/Kbo.asmx/GetLiveText?&le_id=${le_id}&sr_id=${sr_id}&g_id=${g_id}&inning=${inning}&order=${order}`;
  const postGameUrl = `https://m.koreabaseball.com/ws/Kbo.asmx/GetLiveTextResult?le_id=${le_id}&sr_id=${sr_id}&g_id=${g_id}`;

  try {
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

    const liveData = typeof liveRes.data === "string" ? JSON.parse(liveRes.data) : liveRes.data;
    const postGameData =
      typeof postGameRes.data === "string" ? JSON.parse(postGameRes.data) : postGameRes.data;

    res.json({
      isNaver: false,
      live: liveData,
      postGame: postGameData,
    });
  } catch (err) {
    console.error("KBO API 요청 실패:", err.message);
    res.status(500).json({ error: "데이터를 가져오지 못했습니다." });
  }
});

router.get("/preview", async (req, res) => {
  const { gameId } = req.query;
  const targetUrl = `https://api-gw.sports.naver.com/schedule/games/${gameId}/preview`;

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
        Referer: "https://sports.naver.com/",
        Origin: "https://sports.naver.com",
      },
    });

    const previewData = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    res.json(previewData);
  } catch (err) {
    console.error("Naver Preview API 요청 실패:", err.message);
    res.status(500).json({ error: "데이터를 가져오지 못했습니다." });
  }
});

const parseTable = (tableStr) => {
  if (!tableStr) return [];
  try {
    const parsed = typeof tableStr === "string" ? JSON.parse(tableStr) : tableStr;
    if (!parsed || !parsed.rows) return [];
    return parsed.rows.map((r) => {
      if (r && Array.isArray(r.row)) {
        return r.row.map((cell) =>
          cell && cell.Text !== undefined && cell.Text !== null ? String(cell.Text).trim() : ""
        );
      }
      return [];
    });
  } catch (e) {
    console.error("테이블 파싱 에러:", e.message);
    return [];
  }
};

router.get("/pitching-result", async (req, res) => {
  const { g_id, sr_id } = req.query;
  if (!g_id) return res.status(400).json({ error: "g_id가 필요합니다." });

  const apiGameId = getNaverGameId(g_id, sr_id);
  try {
    const response = await axios.get(
      `https://api-gw.sports.naver.com/schedule/games/${apiGameId}/record`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Referer: "https://sports.naver.com/",
        },
        timeout: 8000,
      }
    );
    const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    const pitchingResult = data?.result?.recordData?.pitchingResult;
    res.json({ pitchingResult: Array.isArray(pitchingResult) ? pitchingResult : [] });
  } catch (err) {
    console.error("경기 결과 투수 API 요청 실패:", err.message);
    res.status(502).json({ error: "경기 결과 투수 데이터를 가져오지 못했습니다." });
  }
});

router.get("/record", async (req, res) => {
  const { le_id, sr_id, g_id } = req.query;
  // 1. 원정팀 (Away) 기록 요청: tb_sc=T
  const urlAway = `https://m.koreabaseball.com/ws/Kbo.asmx/GetLiveRecord?le_id=${le_id}&sr_id=${sr_id}&g_id=${g_id}&tb_sc=T`;
  // 2. 홈팀 (Home) 기록 요청: tb_sc=B
  const urlHome = `https://m.koreabaseball.com/ws/Kbo.asmx/GetLiveRecord?le_id=${le_id}&sr_id=${sr_id}&g_id=${g_id}&tb_sc=B`;

  try {
    const [awayRes, homeRes] = await Promise.all([
      axios.get(urlAway, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
        },
      }),
      axios.get(urlHome, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
        },
      }),

    ]);

    const formatTeamRecord = (data, defaultTeamName) => {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      if (!parsedData) return null;

      const rawHitterTable = parseTable(parsedData.tableHitter);
      const tableHitter = rawHitterTable.map((row) => row.slice(0, 8));
      const tablePitcher = parseTable(parsedData.tablePitcher);

      return {
        teamName: defaultTeamName || parsedData.teamName || "",
        listHitter: parsedData.listHitter || [],
        tableHitter,
        listPitcher: parsedData.listPitcher || [],
        tablePitcher,
      };
    };

    const awayRaw = typeof awayRes.data === "string" ? JSON.parse(awayRes.data) : awayRes.data;
    const homeRaw = typeof homeRes.data === "string" ? JSON.parse(homeRes.data) : homeRes.data;

    const awayData = formatTeamRecord(awayRes.data, awayRaw?.awayTeam);
    const homeData = formatTeamRecord(homeRes.data, homeRaw?.homeTeam);

    res.json({
      away: awayData,
      home: homeData,
    });
  } catch (err) {
    console.error("기록지 API 요청 실패:", err.message);
    res.status(500).json({ error: "기록지 데이터를 가져오지 못했습니다." });
  }
});

module.exports = router;

