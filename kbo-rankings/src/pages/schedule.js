import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { teamData } from "./src/teamData";

export default function Schedule() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayForDefault = today.toISOString().slice(0, 10);
  const [defaultDate, setDefaultDate] = useState(todayForDefault);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}${month}${day}`;

  const [inputDate, setInputDate] = useState(formattedDate);
  const [inputLeague, setInputLeague] = useState(1);
  const [searchParams, setSearchParams] = useState({ date: formattedDate, league: 1 });

  const handleChange = (e) => {
    const selected = e.target.value.replace(/-/g, ""); // YYYY-MM-DD → YYYYMMDD
    setInputDate(selected);
  };

  const selectLeague = (e) => {
    const selected = e.target.value;
    setInputLeague(selected);
  }

  const handleSearch = () => {
    setSearchParams({ date: inputDate, league: inputLeague });
  }

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    axios
      .get(`http://kbo-info.onrender.com/api/schedule?&date=${searchParams.date}&leId=${searchParams.league}`)
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
  }, [searchParams]);

  function getTeamIcon(year, teamName) {
    var teamID = 0;
    switch (teamName) {
      case '삼성':
        teamID = 1001;
        break;

      case '해태':
        teamID = 2001;
        break;

      case 'KIA':
        teamID = 2002;
        break;

      case '롯데':
        teamID = 3001;
        break;

      case '현대':
        teamID = 4004;
        break;

      case 'LG':
        teamID = 5002;
        break;

      case '두산':
        teamID = 6002;
        break;

      case '한화':
        teamID = 7002;
        break;

      case 'SK':
        teamID = 9001;
        break;

      case 'SSG':
        teamID = 9002;
        break;

      case '우리':
      case '히어로즈':
      case '넥센':
      case '키움':
        teamID = 10001;
        break;

      case 'NC':
        teamID = 11001;
        break;

      case 'KT':
        teamID = 12001;
        break;

      case "대한민국":
        teamID = "KR";
        break;

      case "체코":
        teamID = "CZ";
        break;

      case "일본":
        teamID = "JP";
        break;

      case "대만":
        teamID = "TW";
        break;

      case "호주":
        teamID = "AU";
        break;

      case "도미니카":
        teamID = "DO";
        break;

      default:
        break;
    }
    teamID = String(teamID);
    return teamID;
  };

  const getTeamLogoUrl = (year, teamName) => {
    if (teamName.includes("상무")) return "/sangmu.svg";
    if (teamName.includes("고양")) return "/goyang.svg";
    if (teamName.includes("울산")) return "/ulsan.svg";

    const iconID = getTeamIcon(year, teamName);
    if (isNaN(iconID)) {
      return `https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/emblem/international/emblem_${iconID}.png`;
    }
    return `https://statiz.co.kr/data/team/ci/${year}/${iconID}.svg`;
  };

  const isRelayAvailable = (game, searchDate) => {
    // 2: 진행 중, 3: 종료
    if (String(game.gameState) === "2" || String(game.gameState) === "3") return true;
    // 4 이상: 취소 등
    if (game.gameState >= 4) return false;

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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6">
      {/* 메인 화면 버튼 */}
      <div className="mb-4">
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          ⬅ 메인 화면으로
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-center mb-6 text-white">📅 KBO 경기 일정</h1>

      <div className="overflow-x-auto">
        <div className="flex gap-2 mb-4 items-center">
          <input type="date" onChange={handleChange} className="border border-gray-600 bg-gray-800 text-white p-2 rounded" defaultValue={defaultDate} />
          <select className="border border-gray-600 bg-gray-800 text-white p-2 rounded" onChange={selectLeague} defaultValue="1">
            <option value="1">1군</option>
            <option value="2">2군</option>
          </select>
          <button onClick={handleSearch} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition">
            조회
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xl text-gray-400 font-medium">Loading...</div>
        ) : games.length > 0 ? (
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

            <tbody>
              {games.map((game, idx) => {
                const getRowStyle = (g) => {
                  if (g.gameState >= 4) return { backgroundColor: '#3f3f46' }; // canceled
                  const awayName = g.awayTeamName || "히어로즈";
                  const homeName = g.homeTeamName || "히어로즈";
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
                    {game.gameType === "정규경기" ? (
                      <td className="py-2 px-1 md:py-3 md:px-4 whitespace-nowrap hidden md:table-cell">{game.date}</td>
                    ) : (
                      <td className="py-2 px-1 md:py-3 md:px-4 whitespace-nowrap hidden md:table-cell">
                        <span>
                          {game.date}
                          <br />
                          {game.gameType}
                        </span>
                      </td>
                    )}

                    <td className="py-2 px-1 md:py-3 md:px-4 text-xs md:text-sm">{game.gameTime}</td>
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
                        <><span className="hidden sm:inline text-gray-400 drop-shadow-md">취소된 경기입니다.</span>
                          <span className="sm:hidden text-gray-400 drop-shadow-md">취소</span></>
                      ) : String(game.gameState) === "2" ? (
                        <div className="flex flex-col items-center justify-center drop-shadow-md">
                          <span className="text-red-400 text-base">{game.gameScore}</span>
                          <span className="text-[10px] md:text-xs text-gray-200 font-normal mt-0.5 bg-black/40 px-1.5 py-0.5 rounded shadow-sm">{game.gameMaxInn}회{game.isTopOrBottom}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center drop-shadow-md">
                          <span className="text-white text-base">{game.gameScore}</span>
                          <span className="text-[10px] md:text-xs text-gray-200 font-normal mt-0.5 bg-black/40 px-1.5 py-0.5 rounded shadow-sm">종료</span>
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
                        {String(game.gameState) === "3" && homeOutcome === "W" && game.winPitcher && (
                          <span className="text-[10px] md:text-xs text-gray-300 font-medium">승 - {game.winPitcher}</span>
                        )}
                        {String(game.gameState) === "3" && homeOutcome === "L" && game.lostPitcher && (
                          <span className="text-[10px] md:text-xs text-gray-300 font-medium">패 - {game.lostPitcher}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-1 md:py-3 md:px-4 hidden md:table-cell"></td>

                    {/* 경기 정보 */}
                    <td className="py-2 px-1 md:py-3 md:px-4">
                      {isRelayAvailable(game, searchParams.date) &&
                        parseInt(game.gameID.slice(0, 4)) >= 2010 ? (
                        <Link
                          to={`/relay/${searchParams.league}/${game.seriesId}/${game.gameID}`}
                          className="inline-block px-2 py-1 md:px-4 md:py-2 bg-blue-600/90 text-white text-xs md:text-sm rounded-lg shadow hover:bg-blue-500 transition whitespace-nowrap"
                          target="_blank"
                        >
                          문자 중계
                        </Link>
                      ) : (
                        <span></span>
                      )}
                    </td>
                  </tr>
                )
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
