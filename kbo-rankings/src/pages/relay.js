import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { teamData } from "./src/teamData";
import { API_BASE_URL } from "../config/api";
import { fetchVideoMap, getVideoUrlSync } from "../utils/videoMapService";

// 국가대표 경기 등에서 변경되는 선수 ID를 원본 KBO 선수 ID로 매핑하는 객체
const playerIdMap = {
  "10200": "68220", // 곽빈 (두산)
  "10201": "51867", // 김건우 (SSG)
  "10202": "53754", // 김서현 (한화)
  "10203": "55167", // 김영우 (LG)
  "10204": "54263", // 김택연 (두산)
  "10205": "52701", // 문동주 (한화)
  "10206": "52060", // 박영현 (KT)
  "10207": "55455", // 배찬승 (삼성)
  "10208": "54610", // 성영탁 (KIA)
  "10209": "67143", // 손주영 (LG)
  "10210": "50859", // 오원석 (KT)
  "10211": "69446", // 원태인 (삼성)
  "10212": "53892", // 이로운 (SSG)
  "10213": "52530", // 이민석 (롯데)
  "10214": "53455", // 이호성 (삼성)
  "10215": "55743", // 정우주 (한화)
  "10216": "51897", // 조병현 (SSG)
  "10217": "50556", // 최준용 (롯데)
  "10218": "79365", // 박동원 (LG)
  "10219": "51865", // 조형우 (SSG)
  "10220": "78288", // 최재훈 (한화)
  "10221": "52430", // 김영웅 (삼성)
  "10222": "51907", // 김주원 (NC)
  "10223": "69737", // 노시환 (한화)
  "10224": "69102", // 문보경 (LG)
  "10225": "53764", // 문현빈 (한화)
  "10226": "67893", // 박성한 (SSG)
  "10227": "65357", // 송성문 (키움)
  "10228": "65207", // 신민재 (LG)
  "10229": "68525", // 한동희 (롯데)
  "10230": "67449", // 김성윤 (삼성)
  "10231": "62415", // 박해민 (LG)
  "10232": "52001", // 안현민 (KT)
  "10233": "68106", // 이재원 (LG)

  // 2013 WBC
  "11101": "75421", // 오승환 (삼성)
  "11103": "73211", // 노경은 (두산)
  "11104": "77591", // 송승준 (롯데)
  "11105": "75620", // 윤석민 (KIA)
  "11106": "78640", // 서재응 (KIA)
  "11107": "75321", // 손승락 (넥센)
  "11109": "76355", // 장원삼 (삼성)
  "11110": "76455", // 차우찬 (삼성)
  "11111": "76858", // 박희수 (SK)
  "11112": "74513", // 장원준 (롯데)
  "11113": "71801", // 정대현 (SK)
  "11114": "97202", // 진갑용 (삼성)
  "11116": "95436", // 이승엽 (삼성)
  "11117": "79402", // 김상수 (삼성)
  "11118": "75808", // 정근우 (SK)
  "11119": "75847", // 최정 (SK)
  "11120": "73213", // 손시헌 (두산)
  "11121": "76325", // 강정호 (넥센)
  "11127": "74163", // 이용규 (KIA)
  "11122": "71752", // 김태균 (한화)
  "11123": "71564", // 이대호 (롯데)
  "11124": "76290", // 김현수 (두산)
  "11125": "78513", // 전준우 (롯데)
  "11115": "74540", // 강민호 (롯데)
  "11126": "77532", // 손아섭 (롯데)
  "11128": "99810", // 이진영 (LG)
  "11323": "67650", // 네덜란드 로저 버나디나 (KIA)

  // 2015 프리미어 12
  "20001": "74540", // 강민호 (롯데)
  "20003": "77829", // 김광현 (SK)
  "20006": "79402", // 김상수 (삼성)
  "20007": "74206", // 김재호 (두산)
  "20010": "76290", // 김현수 (두산)
  "20011": "62947", // 나성범 (NC)
  "20013": "76249", // 민병헌 (두산)
  "20014": "75125", // 박병호 (넥센)
  "20016": "77532", // 손아섭 (롯데)
  "20018": "61411", // 심창민 (삼성)
  "20020": "76232", // 양의지 (두산)
  "20022": "77248", // 오재원 (두산)
  "20023": "73117", // 우규민 (LG)
  "20024": "67008", // 이대은 (마이너)
  "20025": "71564", // 이대호 (NPB)
  "20026": "74163", // 이용규 (한화)
  "20027": "61323", // 이태양 (NC)
  "20028": "76329", // 이현승 (두산)
  "20029": "78352", // 임창민 (NC)
  "20030": "74513", // 장원준 (두산)
  "20031": "75808", // 정근우 (SK)
  "20032": "71801", // 정대현 (롯데)
  "20033": "74857", // 정우람 (SK)
  "20034": "65067", // 조무근 (KT)
  "20035": "63342", // 조상우 (넥센)
  "20036": "76455", // 차우찬 (삼성)
  "20038": "79240", // 허경민 (두산)
  "20040": "76313", // 황재균 (롯데)
  "20069": "74540", // 강민호 (롯데)
  "20103": "63737", // 미국 대나 이브랜드 (한화)
  "20111": "66628", // 미국 지크 스프루일 (KIA)
  "20117": "65052", // 미국 댄 블랙 (KT)
  "20172": "64553", // 베네수엘라 루이스 히메네스 (롯데)

  // 2017 APBC
  "21000": "62404", // 구자욱 (삼성)
  "21001": "65933", // 구창모 (NC)
  "21002": "66145", // 김대현 (LG)
  "21003": "67246", // 김명신 (두산)
  "21004": "62934", // 김성욱 (NC)
  "21005": "62648", // 김윤동 (KIA)
  "21006": "64300", // 김하성 (넥센)
  "21007": "66508", // 나경민 (롯데)
  "21008": "62234", // 류지혁 (두산)
  "21009": "62907", // 박민우 (NC)
  "21010": "64021", // 박세웅 (롯데)
  "21011": "63512", // 박진형 (롯데)
  "21012": "64017", // 심재민 (KT)
  "21013": "65115", // 안익훈 (LG)
  "21014": "62929", // 이민호 (NC)
  "21015": "67341", // 이정후 (넥센)
  "21016": "62754", // 임기영 (KIA)
  "21017": "63202", // 장승현 (두산)
  "21018": "77927", // 장필준 (삼성)
  "21019": "63950", // 장현식 (NC)
  "21020": "63450", // 정현 (KT)
  "21021": "66606", // 최원준 (KIA)
  "21022": "62700", // 하주석 (한화)
  "21023": "63722", // 한승택 (KIA)
  "21024": "63248", // 함덕주 (두산)

  // 2022 항저우 아시안 게임
  "31301": "67119", // 고우석 (LG)
  "31303": "68900", // 김영규 (NC)
  "31304": "67539", // 나균안 (롯데)
  "31305": "52701", // 문동주 (한화)
  "31306": "64021", // 박세웅 (롯데)
  "31307": "52060", // 박영현 (KT)
  "31308": "69446", // 원태인 (삼성)
  "31309": "67449", // 김성윤 (삼성)
  "31310": "", // 장현석 (아마추어)
  "31311": "69159", // 정우영 (LG)
  "31312": "52639", // 최지민 (KIA)
  "31313": "53344", // 김동헌 (키움)
  "31314": "68912", // 김형준 (NC)
  "31315": "68050", // 강백호 (KT)
  "31316": "51907", // 김주원 (NC)
  "31317": "50458", // 김지찬 (삼성)
  "31318": "67304", // 김혜성 (키움)
  "31319": "69737", // 노시환 (한화)
  "31320": "69102", // 문보경 (LG)
  "31321": "67893", // 박성한 (SSG)
  "31322": "52591", // 윤동희 (롯데)
  "31324": "50854", // 최지훈 (SSG)

  // 2023 APBC
  "26001": "68220", // 곽빈 (두산)
  "26002": "68900", // 김영규 (NC)
  "26003": "52701", // 문동주 (한화)
  "26004": "68902", // 신민혁 (NC)
  "26005": "50859", // 오원석 (SSG)
  "26006": "69446", // 원태인 (삼성)
  "26007": "51648", // 이의리 (KIA)
  "26008": "51897", // 조병현 (SSG)
  "26009": "50662", // 정해영 (KIA)
  "26010": "51264", // 최승용 (두산)
  "26011": "50556", // 최준용 (롯데)
  "26012": "52639", // 최지민 (KIA)
  "26013": "53344", // 김동헌 (키움)
  "26014": "68912", // 김형준 (NC)
  "26015": "51528", // 손성빈 (롯데)
  "26016": "52605", // 김도영 (KIA)
  "26017": "51907", // 김주원 (NC)
  "26018": "67304", // 김혜성 (키움)
  "26019": "51344", // 김휘집 (키움)
  "26020": "69737", // 노시환 (한화)
  "26021": "51551", // 나승엽 (상무)
  "26022": "53764", // 문현빈 (한화)
  "26023": "67449", // 김성윤 (삼성)
  "26024": "69418", // 박승규 (삼성)
  "26025": "52591", // 윤동희 (롯데)
  "26026": "50854", // 최지훈 (SSG)
  "28009": "56719", // 대만 왕옌청 (한화)
  "29009": "55138", // 호주 코엔 윈 (LG)
  "29014": "31012", // 호주 알렉스 홀 (울산)

  // 2026 WBC
  "10243": "64001", // 고영표 (KT)
  "10244": "67119", // 고우석 (LG)
  "10245": "68900", // 김영규 (NC)
  "10246": "73211", // 노경은 (SSG)
  "10247": "", // 데인 더닝 (메이저)
  "10248": "76715", // 류현진 (한화)
  "10249": "50030", // 소형준 (KT)
  "10250": "51111", // 송승기 (LG)
  "10251": "50106", // 유영찬 (LG)
  "10252": "68912", // 김형준 (NC)
  "10253": "52605", // 김도영 (KIA)
  "10254": "67304", // 김혜성 (키움)
  "10255": "", // 셰이 위트컴 (메이저)
  "10256": "62404", // 구자욱 (삼성)
  "10257": "67341", // 이정후 (키움)
  "10258": "", // 저마이 존스 (메이저)
  "15105": "56464", // 호주 잭 오러클린 (삼성)
  "15107": "55348", // 호주 라클란 웰스 (LG)
  "15121": "56632", // 호주 제리드 데일 (KIA)
  "15117": "31012", // 호주 알렉스 홀 (울산)

  // 2026 아시안 게임
  "10260": "50458", // 김지찬 (삼성)
  "10261": "51516", // 김진욱 (롯데)
  "10262": "52415", // 이재현 (삼성)
  "10263": "52591", // 윤동희 (롯데)
  "10264": "53312", // 김건희 (키움)
  "10265": "54812", // 정준재 (SSG)
  "10266": "55252", // 박준순 (두산)
  "10267": "55268", // 최민석 (두산)
  "10268": "55636", // 박재현 (KIA)
  "13032": "56719", // 대만 왕옌청 (한화)
};

// 매핑된 ID가 있으면 반환하고, 없으면 원래 ID를 반환하는 함수
const getRealPlayerId = (id) => playerIdMap[id] || id;

// KBO 활동 이력 및 해외진출/복귀 선수 관리 맵
const kboPlayerCareerMap = {
  "64300": { periods: [{ start: 2014, end: 2020 }] },
  "65357": { periods: [{ start: 2015, end: 2025 }] },
  "67119": { periods: [{ start: 2017, end: 2023 }, { start: 2026, end: Infinity }] },
  "67304": { periods: [{ start: 2017, end: 2024 }] },
  "67341": { periods: [{ start: 2017, end: 2023 }] },
  "55138": { periods: [{ start: 2025, end: 2025 }] },
  "31012": { periods: [{ start: 2026, end: 2026 }] },
  "56719": { periods: [{ start: 2026, end: 2026 }] }
};

// 프로필 이미지의 연도를 구하는 헬퍼 함수
const getPlayerImageYear = (gameYear, playerId, seriesId) => {
  const realId = getRealPlayerId(playerId);
  const targetGameYear = Number(gameYear);

  if (kboPlayerCareerMap[realId]) {
    const { periods } = kboPlayerCareerMap[realId];

    const firstStartYear = periods[0].start;
    if (targetGameYear < firstStartYear) {
      return null;
    }

    for (const period of periods) {
      if (targetGameYear >= period.start && targetGameYear <= period.end) {
        return targetGameYear > 2016 ? targetGameYear : 2016;
      }
    }

    let mostRecentKboYear = null;
    for (const period of periods) {
      if (period.end < targetGameYear) {
        mostRecentKboYear = period.end;
      }
    }

    if (mostRecentKboYear) {
      return mostRecentKboYear;
    }
  }

  return targetGameYear > 2016 ? targetGameYear : 2016;
};

const getTeamIdFromName = (teamName) => {
  if (!teamName) return "";
  const name = teamName.trim();
  if (name.includes("삼성")) return "1001";
  if (name.includes("KIA")) return "2002";
  if (name.includes("롯데")) return "3001";
  if (name.includes("LG")) return "5002";
  if (name.includes("두산")) return "6002";
  if (name.includes("한화")) return "7002";
  if (name.includes("SK")) return "9001";
  if (name.includes("SSG")) return "9002";
  if (["우리", "서울", "넥센", "키움", "히어로즈"].some(val => name.includes(val))) return "10001";
  if (name.includes("NC")) return "11001";
  if (name.includes("KT")) return "12001";
  if (name.includes("현대")) return "4004";
  return "";
};

export default function LiveTextPage() {
  const { leagueId, seriesId, gameID: gameId } = useParams();
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maxInn, setMaxInn] = useState(1);
  const [gameStatus, setGameStatus] = useState(null);
  const [inn, setInn] = useState(null);
  const [videoVisible, setVideoVisible] = useState(true);
  const [mobileLineupOpen, setMobileLineupOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const bottomRef = useRef(null);
  const pitcherDragRef = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0 });
  const [isPitcherDragging, setIsPitcherDragging] = useState(false);
  const [gameResultPitchers, setGameResultPitchers] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setGameResultPitchers(null);

    const fetchPitcherResult = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/relay/pitching-result`, {
          params: { g_id: gameId, sr_id: seriesId },
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setGameResultPitchers(Array.isArray(data.pitchingResult) ? data.pitchingResult : []);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("경기 결과 투수 데이터 로드 실패:", err);
        }
      }
    };

    if (!gameId || Number(leagueId) !== 1) return;
    fetchPitcherResult();
    const interval = setInterval(fetchPitcherResult, 10000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [gameId, seriesId, leagueId]);

  // 경기 결과 투수 UI 카드 렌더링 함수
  const renderPitcherResultCards = () => {
    if (!Array.isArray(gameResultPitchers) || gameResultPitchers.length === 0) return null;

    const gameYear = parseInt(gameId.slice(0, 4)) || new Date().getFullYear();
    const pitcherResultLabels = {
      W: "승리투수",
      L: "패전투수",
      H: "홀드투수",
      S: "세이브투수",
    };

    const getPitcherCardBg = (teamName) => {
      if (!teamName) return "#1f2937";
      const style = teamData[teamName];
      console.log(style);

      return style?.mainColor ? style.mainColor.replace(/[[\]]/g, "") : "#1f2937";
    };

    return (
      <div className="mt-8 pt-6 border-t border-gray-700/80 w-full">
        <h3 className="text-2xl font-black text-white mb-6 tracking-tight">
          경기 종료
        </h3>

        <div
          className={`flex gap-4 overflow-x-auto overscroll-x-contain pb-4 select-none ${isPitcherDragging ? "cursor-grabbing" : "cursor-grab"}`}
          tabIndex={0}
          role="region"
          aria-label="경기 결과 투수 카드, 좌우로 스크롤"
          onMouseDown={(e) => {
            if (e.button !== 0) return;
            pitcherDragRef.current = {
              active: true,
              moved: false,
              startX: e.clientX,
              scrollLeft: e.currentTarget.scrollLeft,
            };
          }}
          onMouseMove={(e) => {
            const drag = pitcherDragRef.current;
            if (!drag.active) return;
            const distance = e.clientX - drag.startX;
            if (!drag.moved && Math.abs(distance) < 5) return;
            drag.moved = true;
            setIsPitcherDragging(true);
            e.preventDefault();
            e.currentTarget.scrollLeft = drag.scrollLeft - distance;
          }}
          onMouseUp={() => {
            pitcherDragRef.current.active = false;
            setIsPitcherDragging(false);
          }}
          onMouseLeave={() => {
            pitcherDragRef.current.active = false;
            setIsPitcherDragging(false);
          }}
          onClickCapture={(e) => {
            if (pitcherDragRef.current.moved && e.detail !== 0) {
              e.preventDefault();
              e.stopPropagation();
            }
            pitcherDragRef.current.moved = false;
          }}
          onTouchStart={() => {
            pitcherDragRef.current.moved = false;
          }}
          onDragStart={(e) => e.preventDefault()}
        >
          {gameResultPitchers.map((pitcher) => (
            <div key={`${pitcher.pCode}-${pitcher.wls}`} className="flex w-72 sm:w-80 shrink-0 flex-col items-center">
              <span className="text-gray-300 font-bold text-lg mb-3">{pitcherResultLabels[pitcher.wls] || "투수"}</span>
              <div
                className="w-full p-4 rounded-xl flex items-center justify-start gap-8 shadow-lg border border-white/10"
                style={{ backgroundColor: getPitcherCardBg(pitcher.teamName) }}
              >

                <img
                  src={`https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/${getPlayerImageYear(gameYear, pitcher.pCode, seriesId)}/${getRealPlayerId(pitcher.pCode)}.jpg`}
                  alt={pitcher.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://statiz.co.kr/images/none.png";
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/20 bg-black/20 shadow-md shrink-0"
                />
                <div className="flex flex-col justify-center">
                  <Link
                    to={`https://kbo-info.vercel.app/playerData/${getRealPlayerId(pitcher.pCode)}`}
                    rel="noopener noreferrer"
                    className="text-white text-2xl sm:text-xl font-extrabold hover:text-blue-300 transition-colors"
                  >
                    {pitcher.name}
                  </Link>
                  <span className="text-gray-300 text-sm sm:text-base font-medium mt-0.5">
                    {pitcher.wls === "W" || pitcher.wls === "L" ? `시즌 ${pitcher.w}승 ${pitcher.l}패` :
                      pitcher.wls === "S" ? `시즌 ${pitcher.s}세이브` : ``}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 자동 스크롤 처리
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [live, autoScroll, inn]);

  // 비디오 링크
  const [videoUrl, setVideoUrl] = useState(() => getVideoUrlSync(gameId));

  useEffect(() => {
    fetchVideoMap().then((map) => {
      if (map && map[gameId]) {
        setVideoUrl(map[gameId]);
      }
    });
  }, [gameId]);

  useEffect(() => {
    if (maxInn) {
      setInn(maxInn);
    }
  }, [maxInn]);

  // 후보 선수 명단 상태
  const [entryData, setEntryData] = useState({
    away: { batter: [], pitcher: [] },
    home: { batter: [], pitcher: [] },
  });
  const [entryOpen, setEntryOpen] = useState(false);
  const [entryTab, setEntryTab] = useState("home");

  useEffect(() => {
    let intervalId;

    const fetchLive = async () => {
      try {
        const gData = await axios.get(
          `${API_BASE_URL}/api/schedule?&date=${gameId.slice(0, 8)}&leId=${leagueId}`
        );

        gData.data.forEach((dt) => {
          if (dt.gameID === gameId) {
            setMaxInn((prev) => Math.max(prev || 1, dt.gameMaxInn || 1));
            setGameStatus({ gameId, isGameOver: String(dt.gameState) === "3" });
          }
        });

        if (!inn) return;

        const res = await axios.get(`${API_BASE_URL}/api/relay`, {
          params: {
            le_id: leagueId,
            sr_id: seriesId,
            g_id: gameId,
            inning: inn,
            order: "ASC",
          },
        });

        if (res.data?.isNaver) {
          setLive({ live: res.data.live, postGame: res.data.postGame });
          if (res.data.scoreBoard) setScoreData(res.data.scoreBoard);
          if (res.data.record) setRecordData(res.data.record);
          if (res.data.entry) setEntryData(res.data.entry);
        } else {
          setLive(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLive();
    intervalId = setInterval(fetchLive, 5000);
    return () => clearInterval(intervalId);
  }, [inn, seriesId, gameId, leagueId]);

  const [scoreData, setScoreData] = useState(null);

  useEffect(() => {
    if (Number(leagueId) === 1) return;

    const fetchScore = async () => {
      try {
        const resScore = await axios.get(
          `${API_BASE_URL}/api/scoreBoardData?le_id=${leagueId}&sr_id=${seriesId}&g_id=${gameId}`
        );
        setScoreData(resScore.data);
      } catch (err) {
        console.error("스코어보드 API 실패:", err);
      }
    };

    if (gameId) {
      fetchScore();
      const scoreInterval = setInterval(fetchScore, 10000);
      return () => clearInterval(scoreInterval);
    }
  }, [leagueId, seriesId, gameId]);

  useEffect(() => {
    if (scoreData && scoreData.scoreData && scoreData.scoreData.length > 0) {
      let calculatedMaxInn = 0;
      const awayScores = scoreData.scoreData[0] || [];
      const homeScores = scoreData.scoreData[1] || [];

      awayScores.forEach((score, index) => {
        if (score !== undefined && score !== null && score !== "" && score !== "-") {
          calculatedMaxInn = Math.max(calculatedMaxInn, index + 1);
        }
      });
      homeScores.forEach((score, index) => {
        if (score !== undefined && score !== null && score !== "" && score !== "-") {
          calculatedMaxInn = Math.max(calculatedMaxInn, index + 1);
        }
      });

      if (calculatedMaxInn > (maxInn || 0)) {
        setMaxInn(calculatedMaxInn);
      }
    }
  }, [scoreData, maxInn]);

  const [lineupData, setLineupData] = useState({ away: [], home: [] });

  useEffect(() => {
    const fetchLineup = async () => {
      if (Number(leagueId) !== 1) return;

      try {
        let apiGameId = "";
        const year = gameId.substring(0, 4);

        if (['3', '4', '5', '7', '8', '9'].includes(String(seriesId))) {
          const prefix = String(seriesId).repeat(4);
          if (gameId === "20260925KRJP0") {
            apiGameId = '88880925S2S402026';
          } else if (gameId === "20260926CNKR0") {
            apiGameId = '88880926S2S302026';
          } else if (gameId === "20260927KRJP0") {
            apiGameId = '88880927F1F202026';
          } else {
            apiGameId = `${prefix}${gameId.substring(4)}${year}`;
          }
        } else {
          apiGameId = `${gameId}${year}`;
        }

        const targetUrl = `${API_BASE_URL}/api/relay/preview?gameId=${apiGameId}`;
        const res = await axios.get(targetUrl);
        const previewData = res.data?.result?.previewData;

        if (previewData) {
          setLineupData({
            away: previewData.awayTeamLineUp?.fullLineUp || [],
            home: previewData.homeTeamLineUp?.fullLineUp || [],
          });
        }
      } catch (err) {
        console.error("라인업 API 실패:", err);
      }
    };
    if (gameId) {
      fetchLineup();
    }
  }, [gameId, leagueId, seriesId]);

  const [recordOpen, setRecordOpen] = useState(false);
  const [recordTab, setRecordTab] = useState("home");
  const [recordData, setRecordData] = useState(null);

  useEffect(() => {
    if (Number(leagueId) === 1) return;

    const fetchRecord = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/relay/record`, {
          params: {
            le_id: leagueId,
            sr_id: seriesId,
            g_id: gameId,
          },
        });
        setRecordData(res.data);
      } catch (err) {
        console.error("기록지 API 실패:", err);
      }
    };

    if (gameId) {
      fetchRecord();
      const recordInterval = setInterval(fetchRecord, 10000);
      return () => clearInterval(recordInterval);
    }
  }, [leagueId, seriesId, gameId]);

  const renderLineup = (lineup, teamName) => {
    if (!lineup || lineup.length === 0 || !teamName) return null;
    const teamStyle = teamData[teamName] || {};
    let inlineStyle = { backgroundColor: '#1f2937' };
    if (teamStyle.mainColor) {
      const rawColor = teamStyle.mainColor.replace('[', '').replace(']', '');
      inlineStyle = { backgroundColor: rawColor };
    }

    const teamIdStr = getTeamIdFromName(teamName);
    const gameYear = parseInt(gameId.slice(0, 4)) || new Date().getFullYear();
    const teamIconUrl = teamIdStr ? `https://statiz.co.kr/data/team/ci/${gameYear}/${teamIdStr}.svg` : teamStyle.icon;

    return (
      <div
        className="rounded-lg shadow-xl overflow-hidden flex flex-col h-fit sticky top-4 border border-white/10 w-full"
        style={inlineStyle}
      >
        <div className="p-3 text-white font-bold text-center border-b border-white/20 flex flex-col items-center gap-1.5">
          {teamIconUrl && (
            <img src={teamIconUrl} alt={teamName} className="w-12 h-12 object-contain bg-white/20 p-1.5 rounded-full shadow-sm" />
          )}
          <span className="text-base font-extrabold tracking-tight">{teamName} 선발</span>
        </div>
        <div className="flex-1 p-2 space-y-1.5 bg-black/10 backdrop-blur-sm">
          {lineup.map((player, idx) => {
            const realPlayerId = getRealPlayerId(player.playerCode);
            const imageYear = getPlayerImageYear(gameYear, player.playerCode, seriesId);
            return (
              <div key={idx} className="flex justify-between items-center text-white py-2 px-2.5 rounded hover:bg-white/20 transition-all duration-200 shadow-sm bg-white/10 border border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-10 font-bold text-center bg-black/40 rounded py-1 text-[11px] shadow-inner shrink-0 tracking-tighter">
                    {player.positionName}
                  </span>
                  <img
                    src={`https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/${imageYear}/${realPlayerId}.jpg`}
                    alt={player.playerName}
                    className="w-10 h-10 rounded-full object-cover bg-white/20 shrink-0 shadow-sm"
                    loading="lazy"
                  />
                  <Link
                    to={`https://kbo-info.vercel.app/playerData/${realPlayerId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[14px] hover:text-blue-200 hover:underline transition-colors"
                  >
                    {player.playerName}
                  </Link>
                </div>
                <div className="flex flex-col items-end text-xs text-white/90 shrink-0">
                  <span className="font-medium opacity-80">{player.hitType}</span>
                  <span className="font-bold">No.{player.backnum}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRecordModal = () => {
    if (!recordOpen) return null;

    const awayTeamName = recordData?.away?.teamName || scoreData?.teamData?.[0] || "원정팀";
    const homeTeamName = recordData?.home?.teamName || scoreData?.teamData?.[1] || "홈팀";

    const currentData = recordTab === "away" ? recordData?.away : recordData?.home;
    const listHitter = currentData?.listHitter || [];
    const tableHitter = currentData?.tableHitter || [];
    const listPitcher = currentData?.listPitcher || [];
    const tablePitcher = currentData?.tablePitcher || [];

    const gameYear = parseInt(gameId.slice(0, 4)) || new Date().getFullYear();

    const getTeamRawColor = (teamName) => {
      if (!teamName) return "#1f2937";
      const style = teamData[teamName];
      if (style && style.mainColor) {
        return style.mainColor.replace(/[[\]]/g, "");
      }
      return "#1f2937";
    };

    const awayTeamColor = getTeamRawColor(awayTeamName);
    const homeTeamColor = getTeamRawColor(homeTeamName);
    const currentContainerColor = recordTab === "away" ? awayTeamColor : homeTeamColor;

    const rankCountMap = {};
    listHitter.forEach((hitter) => {
      const rank = String(hitter.RANK);
      rankCountMap[rank] = (rankCountMap[rank] || 0) + 1;
    });

    const hitterHeaders = ["타수", "득점", "안타", "홈런", "타점", "4사구", "삼진"];
    const pitcherHeaders = ["이닝", "투구수", "피안타", "피홈런", "4사구", "탈삼진", "실점"];

    return (
      <div
        className="mb-6 rounded-2xl border border-white/15 shadow-2xl transition-all duration-300 overflow-hidden"
        style={{ backgroundColor: currentContainerColor }}
      >
        <div className="bg-black/60 backdrop-blur-md p-4 sm:p-6">
          <div className="relative flex items-center justify-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-widest text-center drop-shadow-md">
              오늘의 기록
            </h2>
            <button
              onClick={() => setRecordOpen(false)}
              className="absolute right-0 px-5 sm:px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg shadow-md transition text-sm sm:text-base cursor-pointer border border-white/25 backdrop-blur-sm"
            >
              닫기
            </button>
          </div>

          <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-white/20 bg-black/40 mb-6 shadow-lg">
            <button
              onClick={() => setRecordTab("away")}
              style={recordTab === "away" ? { backgroundColor: awayTeamColor } : {}}
              className={`py-3 text-base sm:text-xl font-bold transition-all duration-200 flex items-center justify-center cursor-pointer border-r border-white/10 ${recordTab === "away"
                ? "text-white shadow-inner font-extrabold"
                : "bg-black/30 text-gray-300 hover:bg-black/50 hover:text-white"
                }`}
            >
              {awayTeamName}
            </button>
            <button
              onClick={() => setRecordTab("home")}
              style={recordTab === "home" ? { backgroundColor: homeTeamColor } : {}}
              className={`py-3 text-base sm:text-xl font-bold transition-all duration-200 flex items-center justify-center cursor-pointer ${recordTab === "home"
                ? "text-white shadow-inner font-extrabold"
                : "bg-black/30 text-gray-300 hover:bg-black/50 hover:text-white"
                }`}
            >
              {homeTeamName}
            </button>
          </div>

          <div className="space-y-3">
            {listHitter.length === 0 ? (
              <p className="text-center py-6 text-gray-400">타자 기록이 없습니다.</p>
            ) : (
              listHitter.map((hitter, idx) => {
                const realId = getRealPlayerId(hitter.P_ID);
                const imageYear = getPlayerImageYear(gameYear, hitter.P_ID, seriesId);
                const stats = tableHitter[idx] || [];

                const isSubOut = hitter.isSubOut !== undefined
                  ? Boolean(hitter.isSubOut)
                  : ((rankCountMap[String(hitter.RANK)] >= 2) && (Number(hitter.CHANGE) === 1));

                const isSubIn = hitter.isSubIn !== undefined
                  ? Boolean(hitter.isSubIn)
                  : ((rankCountMap[String(hitter.RANK)] >= 2) && !isSubOut);

                const replacedFrom = hitter.replacedFrom;
                const replacedTo = hitter.replacedTo;

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md transition ${isSubOut
                      ? "border-gray-800/80 bg-black/40 opacity-70"
                      : "border-white/10 bg-gray-900/80 hover:bg-gray-900"
                      }`}
                  >
                    <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                      <span
                        className={`w-16 font-bold text-center rounded py-1.5 text-xs shadow-inner shrink-0 border ${isSubOut
                          ? "bg-black/40 text-gray-500 border-gray-800"
                          : "bg-black/60 text-gray-200 border-white/10"
                          }`}
                      >
                        {hitter.SPAN || "타자"}
                      </span>
                      <Link
                        to={`https://kbo-info.vercel.app/playerData/${realId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <img
                          src={`https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/${imageYear}/${realId}.jpg`}
                          alt={hitter.NAME}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://statiz.co.kr/images/none.png";
                          }}
                          className={`w-12 h-12 rounded-full object-cover border bg-white/10 cursor-pointer hover:opacity-80 transition-opacity ${isSubOut ? "border-gray-700/40 grayscale opacity-60" : "border-white/20"
                            }`}
                          loading="lazy"
                        />
                      </Link>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`https://kbo-info.vercel.app/playerData/${realId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-bold text-base sm:text-lg transition ${isSubOut
                            ? "text-gray-500 hover:text-gray-400"
                            : "text-white hover:text-blue-300"
                            }`}
                        >
                          {hitter.NAME}
                        </Link>
                        {isSubOut ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-gray-400 bg-gray-800/80 border border-gray-700/60 px-1.5 py-0.5 rounded font-medium">
                              교체아웃
                            </span>
                            {replacedTo && (
                              <span className="text-[11px] text-gray-400 font-medium">
                                ({replacedTo} IN)
                              </span>
                            )}
                          </div>
                        ) : (
                          isSubIn && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-600/40 px-1.5 py-0.5 rounded font-medium">
                                교체
                              </span>
                              {replacedFrom && (
                                <span className="text-[11px] text-amber-300 font-medium">
                                  ({replacedFrom} ↔ {hitter.NAME})
                                </span>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="w-full md:w-[480px] bg-black/50 rounded-lg border border-white/5 p-2 overflow-x-auto shadow-inner">
                      <div className="grid grid-cols-7 min-w-[360px] text-center">
                        {hitterHeaders.map((header, hIdx) => (
                          <div
                            key={hIdx}
                            className={`text-xs font-semibold border-b pb-1.5 ${isSubOut
                              ? "text-gray-600 border-gray-800"
                              : "text-gray-400 border-white/10"
                              }`}
                          >
                            {header}
                          </div>
                        ))}
                        {hitterHeaders.map((_, sIdx) => (
                          <div
                            key={sIdx}
                            className={`text-base sm:text-lg pt-1 ${isSubOut
                              ? "text-gray-500 font-medium"
                              : "text-white font-bold"
                              }`}
                          >
                            {stats[sIdx] !== undefined && stats[sIdx] !== "" ? stats[sIdx] : "-"}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-8 mb-4 flex items-center gap-2 border-t border-white/15 pt-6">
            <span className="w-2.5 h-5 bg-white/70 rounded-full inline-block"></span>
            <h3 className="text-lg sm:text-xl font-bold text-white">투수 기록</h3>
          </div>

          <div className="space-y-3">
            {listPitcher.length === 0 ? (
              <p className="text-center py-6 text-gray-400">투수 기록이 없습니다.</p>
            ) : (
              listPitcher.map((pitcher, idx) => {
                const realId = getRealPlayerId(pitcher.P_ID);
                const imageYear = getPlayerImageYear(gameYear, pitcher.P_ID, seriesId);
                const stats = tablePitcher[idx] || [];

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-gray-900/80 hover:bg-gray-900 p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md transition"
                  >
                    <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                      <span className="w-16 font-bold text-center bg-black/60 text-gray-200 border border-white/10 rounded py-1.5 text-xs shadow-inner shrink-0">
                        {pitcher.SPAN || "투수"}
                      </span>
                      <Link
                        to={`https://kbo-info.vercel.app/playerData/${realId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <img
                          src={`https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/${imageYear}/${realId}.jpg`}
                          alt={pitcher.NAME}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://statiz.co.kr/images/none.png";
                          }}
                          className="w-12 h-12 rounded-full object-cover border bg-white/10"
                          loading="lazy"
                        />
                      </Link>
                      <Link
                        to={`https://kbo-info.vercel.app/playerData/${realId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-base sm:text-lg text-white hover:text-blue-300 transition"
                      >
                        {pitcher.NAME}
                      </Link>
                    </div>

                    <div className="w-full md:w-[540px] bg-black/50 rounded-lg border border-white/5 p-2 overflow-x-auto shadow-inner">
                      <div className="grid grid-cols-7 min-w-[440px] text-center">
                        {pitcherHeaders.map((header, hIdx) => (
                          <div key={hIdx} className="text-xs font-semibold text-gray-400 border-b border-white/10 pb-1.5">
                            {header}
                          </div>
                        ))}
                        {pitcherHeaders.map((_, sIdx) => (
                          <div key={sIdx} className="text-base sm:text-lg font-bold text-white pt-1">
                            {stats[sIdx] !== undefined && stats[sIdx] !== "" ? stats[sIdx] : "-"}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEntryModal = () => {
    if (!entryOpen) return null;

    const awayTeamName = recordData?.away?.teamName || scoreData?.teamData?.[0] || "원정팀";
    const homeTeamName = recordData?.home?.teamName || scoreData?.teamData?.[1] || "홈팀";

    const currentEntry = entryTab === "away" ? entryData?.away : entryData?.home;
    const pitchers = currentEntry?.pitcher || [];
    const batters = currentEntry?.batter || [];

    const getTeamRawColor = (teamName) => {
      if (!teamName) return "#1f2937";
      const style = teamData[teamName];
      if (style && style.mainColor) {
        return style.mainColor.replace(/[[\]]/g, "");
      }
      return "#1f2937";
    };

    const awayTeamColor = getTeamRawColor(awayTeamName);
    const homeTeamColor = getTeamRawColor(homeTeamName);
    const currentContainerColor = entryTab === "away" ? awayTeamColor : homeTeamColor;
    const gameYear = parseInt(gameId.slice(0, 4)) || new Date().getFullYear();

    return (
      <div
        className="mb-6 rounded-2xl border border-white/15 shadow-2xl transition-all duration-300 overflow-hidden"
        style={{ backgroundColor: currentContainerColor }}
      >
        <div className="bg-black/60 backdrop-blur-md p-4 sm:p-6">
          <div className="relative flex items-center justify-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-widest text-center drop-shadow-md">
              후보 선수 명단
            </h2>
            <button
              onClick={() => setEntryOpen(false)}
              className="absolute right-0 px-5 sm:px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg shadow-md transition text-sm sm:text-base cursor-pointer border border-white/25 backdrop-blur-sm"
            >
              닫기
            </button>
          </div>

          <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-white/20 bg-black/40 mb-6 shadow-lg">
            <button
              onClick={() => setEntryTab("away")}
              style={entryTab === "away" ? { backgroundColor: awayTeamColor } : {}}
              className={`py-3 text-base sm:text-xl font-bold transition-all duration-200 flex items-center justify-center cursor-pointer border-r border-white/10 ${entryTab === "away"
                ? "text-white shadow-inner font-extrabold"
                : "bg-black/30 text-gray-300 hover:bg-black/50 hover:text-white"
                }`}
            >
              {awayTeamName} ({pitchers.length + batters.length}명)
            </button>
            <button
              onClick={() => setEntryTab("home")}
              style={entryTab === "home" ? { backgroundColor: homeTeamColor } : {}}
              className={`py-3 text-base sm:text-xl font-bold transition-all duration-200 flex items-center justify-center cursor-pointer ${entryTab === "home"
                ? "text-white shadow-inner font-extrabold"
                : "bg-black/30 text-gray-300 hover:bg-black/50 hover:text-white"
                }`}
            >
              {homeTeamName} ({pitchers.length + batters.length}명)
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-5 bg-blue-500 rounded-full inline-block"></span>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                투수 후보 ({pitchers.length}명)
              </h3>
            </div>
            {pitchers.length === 0 ? (
              <p className="text-gray-400 py-3 text-sm">대기 투수가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pitchers.map((p, idx) => {
                  const realId = getRealPlayerId(p.pcode);
                  const imageYear = getPlayerImageYear(gameYear, p.pcode, seriesId);
                  return (
                    <div
                      key={idx}
                      className="bg-gray-900/80 border border-white/10 rounded-xl p-3 flex items-center justify-between shadow-md hover:bg-gray-900 transition"
                    >
                      <div className="flex items-center gap-3">
                        <Link
                          to={`https://kbo-info.vercel.app/playerData/${realId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={`https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/${imageYear}/${realId}.jpg`}
                            alt={p.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://statiz.co.kr/images/none.png";
                            }}
                            className="w-12 h-12 rounded-full object-cover border border-white/20 bg-white/10"
                            loading="lazy"
                          />
                        </Link>
                        <div>
                          <Link
                            to={`https://kbo-info.vercel.app/playerData/${realId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-white hover:text-blue-300 transition text-base"
                          >
                            {p.name}
                          </Link>
                          <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                            <span>{p.pos || "투수"}</span>
                            {p.pitchingStyle && (
                              <span className="text-blue-400 font-medium">{p.pitchingStyle}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {p.hittype && (
                        <span className="text-xs text-gray-300 bg-white/10 px-2 py-1 rounded">
                          {p.hittype}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-5 bg-emerald-500 rounded-full inline-block"></span>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                타자/야수 후보 ({batters.length}명)
              </h3>
            </div>
            {batters.length === 0 ? (
              <p className="text-gray-400 py-3 text-sm">대기 타자가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {batters.map((b, idx) => {
                  const realId = getRealPlayerId(b.pcode);
                  const imageYear = getPlayerImageYear(gameYear, b.pcode, seriesId);
                  return (
                    <div
                      key={idx}
                      className="bg-gray-900/80 border border-white/10 rounded-xl p-3 flex items-center justify-between shadow-md hover:bg-gray-900 transition"
                    >
                      <div className="flex items-center gap-3">
                        <Link
                          to={`https://kbo-info.vercel.app/playerData/${realId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={`https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/${imageYear}/${realId}.jpg`}
                            alt={b.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://statiz.co.kr/images/none.png";
                            }}
                            className="w-12 h-12 rounded-full object-cover border border-white/20 bg-white/10"
                            loading="lazy"
                          />
                        </Link>
                        <div>
                          <Link
                            to={`https://kbo-info.vercel.app/playerData/${realId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-white hover:text-blue-300 transition text-base"
                          >
                            {b.name}
                          </Link>
                          <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                            <span className="text-emerald-400 font-medium">{b.pos || "야수"}</span>
                          </div>
                        </div>
                      </div>
                      {b.hittype && (
                        <span className="text-xs text-gray-300 bg-white/10 px-2 py-1 rounded">
                          {b.hittype}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getTeamColor = (teamName) => {
    if (!teamName) return '#3b82f6';
    const style = teamData[teamName];
    if (style && style.mainColor) {
      return style.mainColor.replace(/[[\]]/g, '');
    }
    return '#3b82f6';
  };

  const getWinProbability = (winPercentage, topOrBottom) => {
    if (winPercentage.awayTeamWinRate === 0 && winPercentage.homeTeamWinRate === 0) return null;
    else if (topOrBottom === "초") return winPercentage.awayTeamWinRate;
    else if (topOrBottom === "말") return winPercentage.homeTeamWinRate;
    else return null;
  };

  if (loading) return <p className="text-center p-4 text-gray-300">불러오는 중...</p>;
  if (!live) return <p className="text-center p-4 text-gray-300">데이터가 없습니다.</p>;

  return (
    <div className="flex justify-center gap-6 p-4 w-full max-w-7xl mx-auto flex-1 text-gray-100">
      <div className="hidden xl:block w-72 shrink-0">
        {renderLineup(lineupData.away, scoreData?.teamData?.[0])}
      </div>

      <div className="w-full min-w-0 max-w-2xl flex flex-col">
        <div className="sticky top-[env(safe-area-inset-top,0px)] z-50 bg-[#0a0a0a] pt-2 pb-2 mb-6 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <Link
              to="/schedule"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-500 transition"
            >
              ⬅ 메인 화면으로
            </Link>

            <h1 className="hidden md:inline-block md:text-xl text-sm font-bold text-white">KBO 문자중계</h1>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              자동 스크롤
            </label>

            {videoUrl ? (
              <button
                onClick={() => setVideoVisible(!videoVisible)}
                className="text-xs font-medium px-3 py-2 bg-gray-700 text-gray-200 rounded-full hover:bg-gray-600 transition flex items-center gap-1"
              >
                {videoVisible ? "📺 비디오 숨기기" : "📺 비디오 보기"}
              </button>
            ) : (
              <div className="w-20" />
            )}
          </div>

          {videoUrl && videoVisible && (
            <div className="overflow-hidden rounded-2xl border border-gray-700 shadow-xl bg-black aspect-video relative group">
              {videoUrl.includes(".m3u8") ? (
                <video
                  src={videoUrl}
                  className="w-full h-full"
                  controls
                  autoPlay
                  muted
                  playsInline
                >
                  해당 브라우저는 비디오 재생을 지원하지 않습니다.
                </video>
              ) : (
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title="KBO Live Broadcast"
                ></iframe>
              )}

              <div className="absolute top-4 left-4 pointer-events-none">
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-lg animate-pulse">
                  {live?.postGame?.listResult?.length > 0 ? "REPLAY" : "LIVE"}
                </span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto mt-2 rounded-lg shadow border border-gray-700">
            <table className="border-collapse text-center text-xs bg-gray-900 text-gray-200 w-full">
              <thead className="bg-gray-800 text-gray-400">
                <tr>
                  <th className="border border-gray-700 px-3 py-2 text-left sticky left-0 z-10 bg-gray-800 font-semibold min-w-[4rem]">팀</th>
                  {[...Array(scoreData?.scoreData?.[0]?.length || 0)].map((_, i) => (
                    <th key={i} className="border border-gray-700 px-2 py-2 min-w-[1.75rem]">
                      {i + 1}
                    </th>
                  ))}
                  <th className="border border-gray-700 px-2 py-2 font-bold text-blue-400 bg-gray-800 min-w-[2rem]">R</th>
                  <th className="border border-gray-700 px-2 py-2 min-w-[2rem]">H</th>
                  <th className="border border-gray-700 px-2 py-2 min-w-[2rem]">E</th>
                  <th className="border border-gray-700 px-2 py-2 min-w-[2rem]">B</th>
                </tr>
              </thead>
              <tbody>
                {scoreData?.teamData && (
                  <>
                    <tr className="bg-gray-900">
                      <td className="border border-gray-700 px-3 py-2 font-semibold text-left sticky left-0 z-10 bg-gray-900">{scoreData.teamData[0]}</td>
                      {[...Array(scoreData.scoreData[0].length)].map((_, i) => (
                        <td key={i} className="border border-gray-700 px-2 py-2">{scoreData.scoreData[0][i]}</td>
                      ))}
                      <td className="border border-gray-700 px-2 py-2 font-bold text-blue-400">{scoreData.resultData[0][0]}</td>
                      <td className="border border-gray-700 px-2 py-2">{scoreData.resultData[0][1]}</td>
                      <td className="border border-gray-700 px-2 py-2">{scoreData.resultData[0][2]}</td>
                      <td className="border border-gray-700 px-2 py-2">{scoreData.resultData[0][3]}</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-700 px-3 py-2 font-semibold text-left sticky left-0 z-10 bg-gray-800/50">{scoreData.teamData[1]}</td>
                      {[...Array(scoreData.scoreData[0].length)].map((_, i) => (
                        <td key={i} className="border border-gray-700 px-2 py-2">{scoreData.scoreData[1][i]}</td>
                      ))}
                      <td className="border border-gray-700 px-2 py-2 font-bold text-blue-400">{scoreData.resultData[1][0]}</td>
                      <td className="border border-gray-700 px-2 py-2">{scoreData.resultData[1][1]}</td>
                      <td className="border border-gray-700 px-2 py-2">{scoreData.resultData[1][2]}</td>
                      <td className="border border-gray-700 px-2 py-2">{scoreData.resultData[1][3]}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-4">
            <select
              onChange={(e) => setInn(Number(e.target.value))}
              className="border border-gray-600 p-2 rounded flex-none w-32 bg-gray-800 text-white cursor-pointer"
              value={inn ?? "1"}
            >
              {[...Array(maxInn)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}회
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRecordOpen(!recordOpen)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 transition font-semibold text-sm cursor-pointer"
            >
              {recordOpen ? "기록지 닫기" : "기록지 보기"}
            </button>

            {(entryData?.away?.batter?.length > 0 ||
              entryData?.home?.batter?.length > 0 ||
              entryData?.away?.pitcher?.length > 0 ||
              entryData?.home?.pitcher?.length > 0) && (
                <button
                  onClick={() => setEntryOpen(!entryOpen)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow transition font-semibold text-sm cursor-pointer"
                >
                  {entryOpen ? "후보 닫기" : "후보 선수"}
                </button>
              )}

            <button
              onClick={() => setMobileLineupOpen(!mobileLineupOpen)}
              className="xl:hidden px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 transition font-semibold text-sm cursor-pointer"
            >
              {mobileLineupOpen ? "라인업 닫기" : "라인업 보기"}
            </button>
          </div>
        </div>

        {renderRecordModal()}
        {renderEntryModal()}

        {mobileLineupOpen && (
          <div className="xl:hidden w-full flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              {renderLineup(lineupData.away, scoreData?.teamData?.[0])}
            </div>
            <div className="flex-1">
              {renderLineup(lineupData.home, scoreData?.teamData?.[1])}
            </div>
          </div>
        )}

        {live?.live?.listInnTb?.map((inning, inningIdx) => {
          const attackTeamColor = getTeamColor(inning.T_NM);
          const gameYear = parseInt(gameId.slice(0, 4)) || new Date().getFullYear();
          const attackTeamLogo = `https://statiz.co.kr/data/team/ci/${gameYear}/${getTeamIdFromName(inning.T_NM)}.svg`;
          return (
            <div key={inningIdx} className="mb-6">
              <h4 className="text-s font-bold mb-2 text-gray-200">
                {inn}회{inning.TB_NM} {inning.T_NM} 공격
              </h4>

              <div className="border border-gray-700 rounded-lg p-4 bg-gray-900 shadow">
                {inning.listBatOrder.map((bat, batIdx) => (
                  <div key={batIdx} className="mb-4">
                    <div
                      className="relative overflow-hidden flex items-center justify-between p-4 border-l-4 bg-gray-800 shadow-sm rounded-md"
                      style={{ borderLeftColor: attackTeamColor }}
                    >
                      <div className="relative z-10 flex items-center gap-4">
                        <img
                          src={`https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/${getPlayerImageYear(parseInt(gameId.slice(0, 4)), bat.BAT_P_ID, seriesId)}/${getRealPlayerId(bat.BAT_P_ID)}.jpg`}
                          alt={bat.BAT_P_NM}
                          className="w-12 h-16 rounded-full object-cover"
                        />
                        <div>
                          <Link
                            to={`https://kbo-info.vercel.app/playerData/${getRealPlayerId(bat.BAT_P_ID)}`}
                            className="font-semibold text-gray-100 hover:text-blue-400 hover:underline transition-colors"
                          >
                            {bat.BAT_P_NM}
                          </Link>
                          <h2 className="text-gray-400 text-sm">
                            {bat.isPinchHitter ? "대타 " : `${bat.BAT_ORDER_NO}번타자`}
                          </h2>
                        </div>
                      </div>

                      <img
                        src={attackTeamLogo}
                        alt="team logo"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-20 opacity-15 pointer-events-none select-none"
                      />
                    </div>
                    <ul className="mt-2 space-y-2">
                      {bat.listData.map((play, playIdx) => (
                        <li key={playIdx} className="p-2 border-b border-gray-700/50 last:border-none text-sm text-gray-300">
                          <span
                            className={
                              play.TEXTSTYLE_SC === 2
                                ? "italic text-gray-500"
                                : play.TEXTSTYLE_SC === 13 || play.TEXTSTYLE_SC === 14
                                  ? "font-bold text-gray-100"
                                  : play.TEXTSTYLE_SC === 23 || play.TEXTSTYLE_SC === 24
                                    ? "font-bold text-blue-400"
                                    : ""
                            }
                          >
                            {play.LIVETEXT_IF}
                          </span>
                          {play.SPEED !== 0 && play.PITCH_TYPE !== "" ? (
                            <>
                              <div></div>
                              <span className="text-xs">
                                {play.SPEED}km/h {play.PITCH_TYPE}
                              </span>
                            </>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    <span className="p-2 border-b border-gray-700/50 last:border-none text-sm text-gray-300 font-bold">
                      {getWinProbability(bat.WinPercentage, inning.TB_NM) ? `${inning.T_NM} 승리 확률 : ${getWinProbability(bat.WinPercentage, inning.TB_NM)}% (${Number(bat.WinPercentage.wpaByPlate) > 0 ? `+${bat.WinPercentage.wpaByPlate}` : bat.WinPercentage.wpaByPlate}%p)` : `${inning.T_NM} 승리 확률 : 집계 중`}
                      {/* {getWinProbability(bat.WinPercentage, inning.TB_NM)} */}
                    </span>
                  </div>
                ))}
                {inn === maxInn &&
                  live.postGame?.listResult?.map((res, resIdx) => (
                    <ul className="mt-2 space-y-2" key={resIdx}>
                      <li className="p-2 border-b border-gray-700/50 last:border-none text-sm text-gray-300">
                        {parseInt(scoreData?.resultData?.[0]?.[0]) > parseInt(scoreData?.resultData?.[1]?.[0]) && inning.TB_SC === 'B' ?
                          <span>{res.LIVETEXT_IF}</span> :
                          parseInt(scoreData?.resultData?.[0]?.[0]) < parseInt(scoreData?.resultData?.[1]?.[0]) && inning.TB_SC === 'T' ?
                            <span>{res.LIVETEXT_IF}</span> : <span></span>
                        }
                      </li>
                    </ul>
                  ))
                }
              </div>
            </div>
          );
        })}
        {gameStatus?.gameId === gameId &&
          gameStatus.isGameOver &&
          Number(inn) === Number(maxInn) &&
          renderPitcherResultCards()}
        <div ref={bottomRef} />
      </div>

      <div className="hidden xl:block w-72 shrink-0">
        {renderLineup(lineupData.home, scoreData?.teamData?.[1])}
      </div>
    </div>
  );
}