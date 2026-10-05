import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { teamData } from "./src/teamData";
import { API_BASE_URL } from "../config/api";
import { fetchVideoMap, getVideoUrlSync } from "../utils/videoMapService";

export default function Schedule() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoMap, setVideoMap] = useState({});

  useEffect(() => {
    fetchVideoMap().then(setVideoMap);
  }, []);

  const today = new Date();
  const todayForDefault = today.toISOString().slice(0, 10);
  const [defaultDate, setDefaultDate] = useState(todayForDefault);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}${month}${day}`;

  const [inputDate, setInputDate] = useState(formattedDate);
  const [inputLeague, setInputLeague] = useState(1);
  const [searchParams, setSearchParams] = useState({ date: formattedDate, league: 1 });

  // ----------------------------------------------------
  // 1. 맞대결 상태 추가
  // ----------------------------------------------------
  const [matchupTeam1, setMatchupTeam1] = useState("");
  const [matchupTeam2, setMatchupTeam2] = useState("");
  const [matchupData, setMatchupData] = useState(null);
  const [matchupLoading, setMatchupLoading] = useState(false);
  const [isMatchupMode, setIsMatchupMode] = useState(false); // 맞대결 모드 활성화 여부

  const handleChange = (e) => {
    const selected = e.target.value.replace(/-/g, "");
    setInputDate(selected);
  };

  const selectLeague = (e) => {
    const selected = e.target.value;
    setInputLeague(selected);
  };

  function getTeamIcon(year, teamName) {
    if (!teamName) return "6002"; // 기본값 (두산/키움 등)

    let teamID = 0;
    // 팀 이름에 포함된 키워드로 유연하게 매칭
    if (teamName.includes("삼성")) teamID = 1001;
    else if (teamName.includes("해태")) teamID = 2001;
    else if (teamName.includes("KIA") || teamName.includes("기아")) teamID = 2002;
    else if (teamName.includes("롯데")) teamID = 3001;
    else if (teamName.includes("현대")) teamID = 4004;
    else if (teamName.includes("LG") || teamName.includes("엘지")) teamID = 5002;
    else if (teamName.includes("두산")) teamID = 6002;
    else if (teamName.includes("한화")) teamID = 7002;
    else if (teamName.includes("SK")) teamID = 9001;
    else if (teamName.includes("SSG")) teamID = 9002;
    else if (
      teamName.includes("우리") ||
      teamName.includes("히어로즈") ||
      teamName.includes("넥센") ||
      teamName.includes("키움")
    )
      teamID = 10001;
    else if (teamName.includes("NC")) teamID = 11001;
    else if (teamName.includes("KT")) teamID = 12001;
    else if (teamName.includes("대한민국") || teamName.includes("한국")) teamID = "KR";
    else if (teamName.includes("체코")) teamID = "CZ";
    else if (teamName.includes("일본")) teamID = "JP";
    else if (teamName.includes("대만")) teamID = "TW";
    else if (teamName.includes("호주")) teamID = "AU";
    else if (teamName.includes("도미니카")) teamID = "DO";
    else if (teamName.includes("중국")) teamID = "CN";
    else if (teamName.includes("태국")) teamID = "TH";
    else if (teamName.includes("홍콩")) teamID = "HK";
    else if (teamName.includes("베네수엘라")) teamID = "VE";
    else if (teamName.includes("멕시코")) teamID = "MX";
    else if (teamName.includes("미국")) teamID = "US";
    else if (teamName.includes("쿠바")) teamID = "CU";
    else if (teamName.includes("네덜란드")) teamID = "NL";

    return String(teamID);
  }

  const getTeamLogoUrl = (year, teamName) => {
    if (!teamName) return "https://statiz.co.kr/images/none.png";
    if (teamName.includes("상무")) return "/sangmu.svg";
    if (teamName.includes("고양")) return "/goyang.svg";
    if (teamName.includes("울산")) return "/ulsan.svg";
    if (teamName.includes("나눔")) return "/nanumallstar.webp";
    if (teamName.includes("드림")) return "/dreamallstar.webp";

    const targetYear = year || "2026"; // 연도 값이 비어있을 경우 기본 2026년
    const iconID = getTeamIcon(targetYear, teamName);

    // 국가 대표팀 등 문자로 된 국가 코드인 경우
    if (isNaN(Number(iconID))) {
      return `https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/emblem/international/emblem_${iconID}.png`;
    }

    // KBO 프로팀 Statiz CI 이미지
    return `https://statiz.co.kr/data/team/ci/${targetYear}/${iconID}.svg`;
  };

  const handleSearch = () => {
    setIsMatchupMode(false); // 일자별 검색 시 맞대결 모드 해제
    setMatchupData(null);
    setSearchParams({ date: inputDate, league: inputLeague });
  };

  const isRelayAvailable = (game, searchDate) => {
    // 2: 진행 중, 3: 종료
    if (String(game.gameState) === "2" || String(game.gameState) === "3") return true;
    // 4 이상: 취소 등
    if (game.gameState >= 4) {
      // 노게임(우천 취소) 경기 중 영상이 남아있는 경우 문자 중계 진입 허용
      if (getVideoUrlSync(game.gameID) || videoMap[game.gameID]) return true;
      return false;
    }

    // 경기 전(1 등)인 경우 시간 체크
    if (!game.gameTime || !searchDate) return false;

    const timeParts = game.gameTime.split(":");
    if (timeParts.length !== 2) return false;

    const year = parseInt(searchDate.substring(0, 4), 10);
    const month = parseInt(searchDate.substring(4, 6), 10) - 1;
    const day = parseInt(searchDate.substring(6, 8), 10);
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);

    const gameDate = new Date(year, month, day, hour, minute);
    const now = new Date();

    // 경기 시작 20분 전
    const relayOpenTime = new Date(gameDate.getTime() - 20 * 60 * 1000);
    return now >= relayOpenTime;
  };

  // 일자별 경기 목록 Fetch
  useEffect(() => {
    if (isMatchupMode) return; // 맞대결 모드일 때는 일자별 fetch 스킵

    let ignore = false;
    setLoading(true);

    axios
      .get(`${API_BASE_URL}/api/schedule?&date=${searchParams.date}&leId=${searchParams.league}`)
      .then((res) => {
        if (!ignore) {
          setGames(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error(err);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [searchParams, isMatchupMode]);

  // ----------------------------------------------------
  // 2. 맞대결 조회 및 초기화 핸들러
  // ----------------------------------------------------
  const handleMatchupSearch = () => {
    if (matchupTeam1 === matchupTeam2) {
      alert("서로 다른 팀을 선택해 주세요.");
      return;
    }
    setMatchupLoading(true);
    const searchYear = searchParams.date ? searchParams.date.slice(0, 4) : String(year);

    axios
      .get(`${API_BASE_URL}/api/schedule/head-to-head?year=${searchYear}&team1=${matchupTeam1}&team2=${matchupTeam2}`)
      .then((res) => {
        setMatchupData(res.data);
        setIsMatchupMode(true); // 맞대결 모드 전환
        setMatchupLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMatchupLoading(false);
      });
  };

  const resetMatchupMode = () => {
    setIsMatchupMode(false);
    setMatchupData(null);
  };

  // ----------------------------------------------------
  // 3. 테이블에 바인딩할 데이터 및 로딩 상태 정제
  // ----------------------------------------------------
  const displayGames = isMatchupMode ? (matchupData?.games || []) : games;
  const currentLoading = isMatchupMode ? matchupLoading : loading;

  return (
    <div className="flex-1 text-gray-100 p-4 sm:p-6">
      <div className="mb-4">
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          ⬅ 메인 화면으로
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-center mb-6 text-white">📅 KBO 경기 일정</h1>

      {/* 팀 간 상대 전적 조회 카드 */}
      <div className="bg-gray-800/80 p-4 rounded-lg mb-6 border border-gray-700 shadow-md">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            ⚔️ 팀 간 상대 전적
          </h2>
          {isMatchupMode && (
            <button
              onClick={resetMatchupMode}
              className="text-xs text-gray-400 hover:text-white underline"
            >
              일자별 일정 보기로 돌아가기
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center mb-4">
          <select
            value={matchupTeam1}
            onChange={(e) => setMatchupTeam1(e.target.value)}
            className="bg-gray-900 border border-gray-600 text-white p-2 rounded"
          >
            {["두산", "LG", "KIA", "삼성", "SSG", "KT", "NC", "롯데", "한화", "키움"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <span className="text-gray-400 font-bold">VS</span>

          <select
            value={matchupTeam2}
            onChange={(e) => setMatchupTeam2(e.target.value)}
            className="bg-gray-900 border border-gray-600 text-white p-2 rounded"
          >
            {["두산", "LG", "KIA", "삼성", "SSG", "KT", "NC", "롯데", "한화", "키움"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button
            onClick={handleMatchupSearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition font-medium"
          >
            전적 조회
          </button>
        </div>

        {/* 요약 승무패 정보 */}
        {matchupData && isMatchupMode && (
          <div className="bg-gray-900/90 p-4 rounded-lg text-center border border-gray-700/60 mt-2">
            <div className="text-sm text-gray-300 font-medium mb-1">
              {matchupData.year}시즌 {matchupData.matchup.team1} vs {matchupData.matchup.team2}
            </div>
            <div className="text-2xl font-black text-blue-400 tracking-wide">
              {matchupData.matchup.stats[matchupData.matchup.team1].win}승{" "}
              {matchupData.matchup.stats[matchupData.matchup.team1].draw}무{" "}
              {matchupData.matchup.stats[matchupData.matchup.team1].loss}패
            </div>
            <div className="text-xs text-gray-400 mt-1">
              총 득점: {matchupData.matchup.stats[matchupData.matchup.team1].runs} : {matchupData.matchup.stats[matchupData.matchup.team2].runs}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        {/* 일자 및 리그 선택 필터 (맞대결 모드일 때는 일자 선택을 비활성화하거나 안내 문구 표시) */}
        {!isMatchupMode ? (
          <div className="flex gap-2 mb-4 items-center">
            <input
              type="date"
              onChange={handleChange}
              className="border border-gray-600 bg-gray-800 text-white p-2 rounded"
              defaultValue={defaultDate}
            />
            <select
              className="border border-gray-600 bg-gray-800 text-white p-2 rounded"
              onChange={selectLeague}
              defaultValue="1"
            >
              <option value="1">1군</option>
              <option value="2">2군</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
            >
              조회
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-4 bg-gray-800/40 p-2.5 rounded border border-gray-700/50">
            <span className="text-sm text-gray-300 font-semibold">
              📋 {matchupTeam1} vs {matchupTeam2} 전시즌 맞대결 경기 목록 ({displayGames.length}경기)
            </span>
            <button
              onClick={resetMatchupMode}
              className="px-3 py-1 bg-gray-700 text-xs text-gray-200 rounded hover:bg-gray-600 transition"
            >
              일자별 일정 조회로 전환
            </button>
          </div>
        )}

        {/* 하단 일정표 테이블 */}
        {currentLoading ? (
          <div className="py-12 text-center text-xl text-gray-400 font-medium">Loading...</div>
        ) : displayGames.length > 0 ? (
          <table className="min-w-full bg-[#18181b] shadow-md rounded-lg overflow-hidden text-center md:text-sm table-fixed border border-gray-700">
            <thead className="bg-gray-900 text-gray-300 text-xs md:text-sm border-b border-gray-700">
              <tr>
                <th className="py-2 px-1 md:py-3 md:px-4 hidden md:table-cell text-left">날짜</th>
                <th className="py-2 px-1 md:py-3 md:px-4">시간</th>
                <th className="py-2 px-1 md:py-3 md:px-4 hidden md:table-cell">구장</th>
                <th className="py-2 px-1 md:py-3 md:px-4 whitespace-nowrap">원정팀</th>
                <th className="py-2 px-1 md:py-3 md:px-4 whitespace-nowrap">스코어</th>
                <th className="py-2 px-1 md:py-3 md:px-4 whitespace-nowrap">홈팀</th>
                <th className="py-2 px-1 md:py-3 md:px-4 hidden md:table-cell"></th>
                <th className="py-2 px-1 md:py-3 md:px-4 whitespace-nowrap">경기 정보</th>
              </tr>
            </thead>

            {/* 테이블 바디 부분 */}
            <tbody>
              {displayGames.map((game, idx) => {
                // 1. 팀명 필드 동기화 (맞대결 API: awayTeam / 일자별 API: awayTeamName)
                const awayName = game.awayTeamName || game.awayTeam || "히어로즈";
                const homeName = game.homeTeamName || game.homeTeam || "히어로즈";

                // 2. 연도 안전 추출 (game.gameID나 game.date 등에서 4자리 연도 추출)
                let gameYear = year; // 기본값: 현재 연도
                if (game.gameID && game.gameID.length >= 4) {
                  gameYear = game.gameID.slice(0, 4);
                } else if (game.date) {
                  const match = game.date.match(/\d{4}/);
                  if (match) gameYear = match[0];
                }

                // 3. 팀 메인 컬러 가져오기 및 그라디언트 스타일 계산
                const getRowStyle = (g) => {
                  if (g.gameState >= 4) return { backgroundColor: '#3f3f46' };
                  const awayColor = teamData[awayName]?.mainColor?.replace(/[\[\]]/g, '') || '#3f3f46';
                  const homeColor = teamData[homeName]?.mainColor?.replace(/[\[\]]/g, '') || '#3f3f46';
                  return {
                    background: `linear-gradient(to right, ${awayColor}99, ${homeColor}99)`
                  };
                };

                let awayOutcome = "";
                let homeOutcome = "";
                if (String(game.gameState) === "3" && game.gameScore && game.gameScore.includes(":")) {
                  const [awayStr, homeStr] = game.gameScore.split(":");
                  const awayScore = parseInt(awayStr.trim(), 10);
                  const homeScore = parseInt(homeStr.trim(), 10);
                  if (awayScore > homeScore) {
                    awayOutcome = "W";
                    homeOutcome = "L";
                  } else if (awayScore < homeScore) {
                    awayOutcome = "L";
                    homeOutcome = "W";
                  }
                }

                return (
                  <tr
                    key={idx}
                    style={getRowStyle(game)}
                    className="border-b border-gray-700/50 hover:brightness-125 transition text-gray-100"
                  >
                    <td className="py-2 px-1 md:py-3 md:px-4 whitespace-nowrap text-left text-xs md:text-sm font-medium">
                      {game.date}
                    </td>

                    <td className="py-2 px-1 md:py-3 md:px-4 text-xs md:text-sm">{game.gameTime || "-"}</td>
                    <td className="py-2 px-1 md:py-3 md:px-4 hidden md:table-cell">{game.stadium}</td>

                    {/* 원정팀 */}
                    <td className="py-2 px-1 md:py-3 md:px-4">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          <span className="text-sm md:text-base hidden md:table-cell font-semibold drop-shadow-md">
                            {game.awayTeamName === ""
                              ? "히어로즈"
                              : game.awayTeamName}
                          </span>
                          <img
                            src={getTeamLogoUrl(searchParams.date.slice(0, 4), game.awayTeamName)}
                            alt={game.awayTeamName}
                            className="w-8 h-8 md:w-12 md:h-12 object-contain shrink-0 drop-shadow-md"
                          />
                        </div>
                        {game.gameState < 2 && game.awaySPitcherName && (
                          <span className="text-[10px] md:text-xs text-gray-300 font-medium">선 - {game.awaySPitcherName}</span>
                        )}
                        {String(game.gameState) === "2" && game.awayTeamCurrentPlayer && (
                          <span className="text-[10px] md:text-xs text-gray-300 font-medium">
                            {game.isTopOrBottom === "초" ? "타 - " : "투 - "}
                            {game.awayTeamCurrentPlayer}
                          </span>
                        )}
                        {String(game.gameState) === "3" && awayOutcome === "W" && game.winPitcher && (
                          <span className="text-[10px] md:text-xs text-gray-300 font-medium">승 - {game.winPitcher}</span>
                        )}
                        {String(game.gameState) === "3" && awayOutcome === "L" && game.lostPitcher && (
                          <span className="text-[10px] md:text-xs text-gray-300 font-medium">패 - {game.lostPitcher}</span>
                        )}
                      </div>
                    </td>

                    {/* 스코어 */}
                    <td className="py-2 px-1 md:py-3 md:px-4 whitespace-nowrap text-xs md:text-sm font-semibold">
                      {game.gameState < 2 ? (
                        <span className="text-gray-300 drop-shadow-md">경기 전</span>
                      ) : game.gameState >= 4 ? (
                        <span className="text-gray-400 drop-shadow-md">취소</span>
                      ) : String(game.gameState) === "2" ? (
                        <div className="flex flex-col items-center justify-center drop-shadow-md">
                          <span className="text-red-400 text-base">{game.gameScore || `${game.awayScore} : ${game.homeScore}`}</span>
                          <span className="text-[10px] md:text-xs text-gray-200 font-normal mt-0.5 bg-black/40 px-1.5 py-0.5 rounded">진행중</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center drop-shadow-md">
                          <span className="text-white text-base">{game.gameScore || `${game.awayScore} : ${game.homeScore}`}</span>
                          <span className="text-[10px] md:text-xs text-gray-200 font-normal mt-0.5 bg-black/40 px-1.5 py-0.5 rounded">종료</span>
                        </div>
                      )}
                    </td>

                    {/* 홈팀 */}
                    <td className="py-2 px-1 md:py-3 md:px-4">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          <span className="text-sm md:text-base hidden md:table-cell font-semibold drop-shadow-md">
                            {game.homeTeamName === ""
                              ? "히어로즈"
                              : game.homeTeamName}
                          </span>
                          <img
                            src={getTeamLogoUrl(searchParams.date.slice(0, 4), game.homeTeamName)}
                            alt={game.homeTeamName}
                            className="w-8 h-8 md:w-12 md:h-12 object-contain shrink-0 drop-shadow-md"
                          />
                        </div>
                        {game.gameState < 2 && game.homeSPitcherName && (
                          <span className="text-[10px] md:text-xs text-gray-300 font-medium">선 - {game.homeSPitcherName}</span>
                        )}
                        {String(game.gameState) === "2" && game.homeTeamCurrentPlayer && (
                          <span className="text-[10px] md:text-xs text-gray-300 font-medium">
                            {game.isTopOrBottom === "초" ? "투 - " : "타 - "}
                            {game.homeTeamCurrentPlayer}
                          </span>
                        )}
                        {String(game.gameState) === "3" && homeOutcome === "W" && game.winPitcher && (
                          <span className="text-[10px] md:text-xs text-gray-300 font-medium">승 - {game.winPitcher}</span>
                        )}
                        {String(game.gameState) === "3" && homeOutcome === "L" && game.lostPitcher && (
                          <span className="text-[10px] md:text-xs text-gray-300 font-medium">패 - {game.lostPitcher}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-1 md:py-3 md:px-4 hidden md:table-cell"></td>

                    {/* 경기 정보 열 */}
                    <td className="py-2 px-1 md:py-3 md:px-4">
                      {(() => {
                        // 경기의 실제 날짜(YYYYMMDD) 추출
                        let targetDate = searchParams.date;

                        if (isMatchupMode && game.date) {
                          // game.date가 "2026년 3월 28일" 또는 "2026-03-28" 형태일 경우 YYYYMMDD로 변환
                          const digits = game.date.replace(/[^0-9]/g, "");
                          if (digits.length === 8) {
                            targetDate = digits;
                          }
                        }

                        const gameYear = parseInt(game.gameID?.slice(0, 4) || "2026", 10);

                        // 문자 중계 진입 가능 여부 체크
                        if (isRelayAvailable(game, targetDate) && gameYear >= 2010) {
                          return (
                            <Link
                              to={`/relay/${searchParams.league}/${game.seriesId || 0}/${game.gameID}`}
                              className="inline-block px-2 py-1 md:px-4 md:py-2 bg-blue-600/90 text-white text-xs md:text-sm rounded-lg shadow hover:bg-blue-500 transition whitespace-nowrap"
                            >
                              문자 중계
                            </Link>
                          );
                        }
                        return null;
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <h4 className="text-gray-400 text-center py-10">경기가 없습니다.</h4>
        )}
      </div>
    </div>
  );
}