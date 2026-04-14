import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { GAME_VIDEO_MAP } from "./videoMap";
import { teamData } from "./src/teamData";

// 국가대표 경기 등에서 변경되는 선수 ID를 원본 KBO 선수 ID로 매핑하는 객체
const playerIdMap = {
  // "변경된_국대_ID": "원본_KBO_ID" 형식으로 추가해주시면 됩니다.
  // 예: "12345": "67890",
  "10200": "68220",
  "10204": "54263",
  "10206": "52060",
  "10209": "67143",
  "10215": "55743",
  "10216": "51897",
  "10218": "79365",
  "10222": "51907",
  "10223": "69737",
  "10224": "69102",
  "10225": "53764",
  "10228": "65207",
  "10231": "62415",
  "10232": "52001",
  "10243": "64001",
  "10244": "67119",
  "10245": "68900",
  "10246": "73211",
  "10248": "76715",
  "10249": "50030",
  "10250": "51111",
  "10251": "50106",
  "10252": "68912",
  "10253": "52605",
  "10254": "67304",
  "10256": "62404",
  "10257": "67341",
  "15121": "56632",
  "15117": "31012"
};

// 매핑된 ID가 있으면 반환하고, 없으면 원래 ID를 반환하는 함수
const getRealPlayerId = (id) => playerIdMap[id] || id;

// 해외 진출 등 KBO를 떠난 선수의 마지막 KBO 연도를 지정하는 객체
const lastKboYearMap = {
  // "원본_KBO_ID": 마지막_KBO_연도 (숫자) 형식으로 추가해주세요.
  // 예: "67341": 2023, // 이정후
  // 예: "64300": 2020, // 김하성
  "67341": 2023,
  "67304": 2024,
  "67119": 2023
};

// 프로필 이미지의 연도를 구하는 헬퍼 함수
const getPlayerImageYear = (gameYear, playerId) => {
  const realId = getRealPlayerId(playerId);
  if (lastKboYearMap[realId]) {
    return lastKboYearMap[realId];
  }
  return gameYear > 2016 ? gameYear : 2016;
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

// SOOP(아프리카TV) 등 외부 중계/리플레이 링크 매핑 객체는 videoMap.js에서 관리합니다.

export default function LiveTextPage() {
  const { leagueId, seriesId, gameID: gameId } = useParams();
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maxInn, setMaxInn] = useState(1);
  const [inn, setInn] = useState(null);
  const [videoVisible, setVideoVisible] = useState(true);

  // 현재 경기의 비디오 링크 가져오기
  const videoUrl = GAME_VIDEO_MAP[gameId];

  useEffect(() => {
    if (maxInn) {
      setInn(maxInn);
    }
  }, [maxInn]);

  useEffect(() => {
    let intervalId;

    const fetchLive = async () => {
      try {
        const gData = await axios.get(
          `https://kbo-info.onrender.com/api/schedule?&date=${gameId.slice(0, 8)}&leId=${leagueId}`
        );

        gData.data.forEach((dt) => {
          if (dt.gameID === gameId) {
            console.log(dt);
            setMaxInn(dt.gameMaxInn);
          }
        });

        if (!inn) return;

        const res = await axios.get(`https://kbo-info.onrender.com/api/relay`, {
          params: {
            le_id: leagueId,
            sr_id: seriesId,
            g_id: gameId,
            inning: inn,
            order: "ASC",
          },
        });
        setLive(res.data);

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

  // state 추가
  const [scoreData, setScoreData] = useState(null);

  // useEffect 내부에서 추가 요청
  useEffect(() => {
    const fetchScore = async () => {
      try {
        const resScore = await axios.get(
          `https://kbo-info.onrender.com/api/scoreBoardData?le_id=${leagueId}&sr_id=${seriesId}&g_id=${gameId}`
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

  const [lineupData, setLineupData] = useState({ away: [], home: [] });

  // 라인업 데이터 가져오기
  useEffect(() => {
    const fetchLineup = async () => {
      // 1이 아니거나 8인 경우 호출 패스
      if (Number(leagueId) !== 1 || Number(seriesId) === 8) return;

      try {
        let apiGameId = "";
        const year = gameId.substring(0, 4);

        if (['3', '4', '5', '7'].includes(String(seriesId))) {
          const prefix = String(seriesId).repeat(4);
          apiGameId = `${prefix}${gameId.substring(4)}${year}`;
        } else {
          apiGameId = `${gameId}${year}`;
        }

        const targetUrl = `https://api-gw.sports.naver.com/schedule/games/${apiGameId}/preview`;

        // corsproxy.io 등 다수의 프록시가 네이버 보안에 의해 403을 반환하는 상황으로 판단됨
        // 마지막 무료 퍼블릭 프록시인 api.codetabs.com 으로 시도
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${targetUrl}`;

        const res = await axios.get(proxyUrl);
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

  const renderLineup = (lineup, teamName) => {
    if (!lineup || lineup.length === 0 || !teamName) return null;
    const teamStyle = teamData[teamName] || {};
    let inlineStyle = { backgroundColor: '#1f2937' }; // default dark gray
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
            const imageYear = getPlayerImageYear(gameYear, player.playerCode);
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



  if (loading) return <p className="text-center p-4">불러오는 중...</p>;
  if (!live) return <p className="text-center p-4">데이터가 없습니다.</p>;

  const handleChange = (e) => {
    const selected = e.target.value;
    setInn(selected);
  };

  return (
    <div className="flex justify-center gap-6 p-4 w-full max-w-7xl mx-auto min-h-screen">
      {/* 원정팀 라인업 (PC 전용) */}
      <div className="hidden xl:block w-72 shrink-0">
        {renderLineup(lineupData.away, scoreData?.teamData?.[0])}
      </div>

      {/* 메인 중계 컨텐츠 */}
      <div className="w-full max-w-2xl flex flex-col">
        {/* 메인으로 돌아가기 */}
        <div className="mb-4">
          <Link
            to="/schedule"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            ⬅ 메인 화면으로
          </Link>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">KBO 문자중계</h1>
          {videoUrl && (
            <button
              onClick={() => setVideoVisible(!videoVisible)}
              className="text-xs font-medium px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition flex items-center gap-1"
            >
              {videoVisible ? "📺 비디오 숨기기" : "📺 비디오 보기"}
            </button>
          )}
        </div>

        {/* ✅ SOOP 비디오 컨테이너 */}
        {videoUrl && videoVisible && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 shadow-xl bg-black aspect-video relative group sticky top-4 z-50">
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

        {/* ✅ 스코어보드 */}
        <div className="overflow-x-auto mb-6 rounded-lg shadow border border-gray-200">
          <table className="border-collapse text-center text-xs bg-white w-full">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="border border-gray-200 px-3 py-2 text-left sticky left-0 z-10 bg-gray-100 font-semibold min-w-[4rem]">팀</th>
                {[...Array(scoreData.scoreData[0].length)].map((_, i) => (
                  <th key={i} className="border border-gray-200 px-2 py-2 min-w-[1.75rem]">
                    {i + 1}
                  </th>
                ))}
                <th className="border border-gray-200 px-2 py-2 font-bold text-blue-700 bg-blue-50 min-w-[2rem]">R</th>
                <th className="border border-gray-200 px-2 py-2 min-w-[2rem]">H</th>
                <th className="border border-gray-200 px-2 py-2 min-w-[2rem]">E</th>
                <th className="border border-gray-200 px-2 py-2 min-w-[2rem]">B</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-blue-50">
                <td className="border border-gray-200 px-3 py-2 font-semibold text-left sticky left-0 z-10 bg-blue-50">{scoreData.teamData[0]}</td>
                {[...Array(scoreData.scoreData[0].length)].map((_, i) => (
                  <td key={i} className="border border-gray-200 px-2 py-2">{scoreData.scoreData[0][i]}</td>
                ))}
                <td className="border border-gray-200 px-2 py-2 font-bold text-blue-700 bg-blue-100">{scoreData.resultData[0][0]}</td>
                <td className="border border-gray-200 px-2 py-2">{scoreData.resultData[0][1]}</td>
                <td className="border border-gray-200 px-2 py-2">{scoreData.resultData[0][2]}</td>
                <td className="border border-gray-200 px-2 py-2">{scoreData.resultData[0][3]}</td>
              </tr>
              <tr className="bg-red-50">
                <td className="border border-gray-200 px-3 py-2 font-semibold text-left sticky left-0 z-10 bg-red-50">{scoreData.teamData[1]}</td>
                {[...Array(scoreData.scoreData[0].length)].map((_, i) => (
                  <td key={i} className="border border-gray-200 px-2 py-2">{scoreData.scoreData[1][i]}</td>
                ))}
                <td className="border border-gray-200 px-2 py-2 font-bold text-blue-700 bg-blue-100">{scoreData.resultData[1][0]}</td>
                <td className="border border-gray-200 px-2 py-2">{scoreData.resultData[1][1]}</td>
                <td className="border border-gray-200 px-2 py-2">{scoreData.resultData[1][2]}</td>
                <td className="border border-gray-200 px-2 py-2">{scoreData.resultData[1][3]}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 회차 선택 */}
        <select
          onChange={(e) => setInn(Number(e.target.value))}
          className="border p-2 rounded mb-4"
          value={inn ?? "1"}
        >
          {[...Array(maxInn)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}회
            </option>
          ))}
        </select>

        {/* 문자중계 */}
        {live.live.listInnTb.map((inning, inningIdx) => (
          <div key={inningIdx} className="mb-6">
            <h4 className="text-s font-bold mb-2">
              {inn}회{inning.TB_NM} {inning.T_NM} 공격
            </h4>

            <div className="border rounded-lg p-4 bg-white shadow">
              {inning.listBatOrder.map((bat, batIdx) => (
                <div key={batIdx} className="mb-4">
                  <div className="flex items-center gap-4 p-4 border-l-4 border-blue-600 bg-white shadow-sm rounded-md">
                    <img
                      src={`https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/${getPlayerImageYear(parseInt(gameId.slice(0, 4)), bat.BAT_P_ID)}/${getRealPlayerId(bat.BAT_P_ID)}.jpg`}
                      alt={bat.BAT_P_NM}
                      className="w-12 h-16 rounded-full"
                    />
                    <div>
                      <Link to={`https://kbo-info.vercel.app/playerData/${getRealPlayerId(bat.BAT_P_ID)}`} className="font-semibold">{bat.BAT_P_NM}</Link>
                      <h2 className="text-gray-600 text-sm">{bat.BAT_ORDER_NO}번타자</h2>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-2">
                    {bat.listData.map((play, playIdx) => (
                      <li key={playIdx} className="p-2 border-b last:border-none text-sm">
                        <span
                          className={
                            play.TEXTSTYLE_SC === "2"
                              ? "italic text-gray-400"
                              : play.TEXTSTYLE_SC === "13" || play.TEXTSTYLE_SC === "14"
                                ? "font-bold"
                                : play.TEXTSTYLE_SC === "23" || play.TEXTSTYLE_SC === "24"
                                  ? "font-bold text-blue-300"
                                  : ""
                          }
                        >
                          {play.LIVETEXT_IF}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {inn === maxInn &&
                live.postGame.listResult.map((res, resIdx) => (
                  <ul className="mt-2 space-y-2" key={resIdx}>
                    <li className="p-2 border-b last:border-none text-sm">
                      {parseInt(scoreData.resultData[0][0]) > parseInt(scoreData.resultData[1][0]) && inning.TB_SC === 'B' ?
                        <span>{res.LIVETEXT_IF}</span> :
                        parseInt(scoreData.resultData[0][0]) < parseInt(scoreData.resultData[1][0]) && inning.TB_SC === 'T' ?
                          <span>{res.LIVETEXT_IF}</span> : <span></span>
                      }
                    </li>
                  </ul>
                ))
              }
            </div>
          </div>
        ))}
      </div>

      {/* 홈팀 라인업 (PC 전용) */}
      <div className="hidden xl:block w-72 shrink-0">
        {renderLineup(lineupData.home, scoreData?.teamData?.[1])}
      </div>
    </div>
  );
}
