import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Ranking from "./pages/ranking.js";
import Schedule from "./pages/schedule.js";
import Relay from "./pages/relay.js";
import PlayerSearch from "./pages/player-search.js";
import Data from "./pages/data.js";
import { teamData } from "./pages/src/teamData.js";

const TEAM_LIST = ["LG", "한화", "SSG", "삼성", "NC", "KT", "롯데", "KIA", "두산", "키움"];

const TEAM_NAMES_ENG = {
  "LG": "LG TWINS",
  "한화": "HANWHA EAGLES",
  "SSG": "SSG LANDERS",
  "삼성": "SAMSUNG LIONS",
  "NC": "NC DINOS",
  "KT": "KT WIZ",
  "롯데": "LOTTE GIANTS",
  "KIA": "KIA TIGERS",
  "두산": "DOOSAN BEARS",
  "키움": "KIWOOM HEROES"
};

const DUMMY_SCHEDULE = [
  { date: "7/16", opponent: "NC", stadium: "창원" },
  { date: "7/17", opponent: "NC", stadium: "창원" },
  { date: "7/18", opponent: "NC", stadium: "창원" },
  { date: "7/19", opponent: "NC", stadium: "창원" },
  { date: "7/20", opponent: "NO GAME", stadium: "창원", noGame: true },
  { date: "7/21", opponent: "KT", stadium: "수원" },
  { date: "7/22", opponent: "KT", stadium: "수원" },
];

const DUMMY_RANKING = {
  rank: 5,
  win: 44,
  lose: 41,
  draw: 2
};

function Home() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  const [rankingData, setRankingData] = useState({});

  useEffect(() => {
    if (!selectedTeam) return;

    const fetchTeamData = async () => {
      try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}${mm}${dd}`;

        // 1. 일정 데이터 가져오기
        const scheduleRes = await fetch(`http://kbo-info.onrender.com/api/schedule/weekly?date=${formattedDate}&leId=1`);
        const allGames = await scheduleRes.json();

        const next7Days = [];
        for (let i = 0; i < 6; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() + i);
          next7Days.push(d);
        }

        const newScheduleData = next7Days.map(d => {
          const m = d.getMonth() + 1;
          const day = d.getDate();
          const dateQuery = `${m}월 ${day}일`; // KBO API에서 반환하는 "2026년 7월 16일" 문자열의 일부

          const gamesForDay = allGames.filter(g => g.date && g.date.includes(dateQuery));
          const game = gamesForDay.find(g => g.awayTeamName === selectedTeam || g.homeTeamName === selectedTeam);

          const shortDate = `${m}/${day}`;

          if (game) {
            const isCanceled = game.gameState >= 4 || game.isCanceled === "1";
            const opponent = game.awayTeamName === selectedTeam ? game.homeTeamName : game.awayTeamName;
            return {
              date: shortDate,
              opponent: opponent,
              stadium: game.stadium,
              noGame: isCanceled
            };
          } else {
            return {
              date: shortDate,
              opponent: "NO GAME",
              noGame: true
            };
          }
        });
        setScheduleData(newScheduleData);

        // 2. 순위 데이터 가져오기
        const rankingRes = await fetch(`http://localhost:5001/api/rankings`);
        const rankings = await rankingRes.json();

        const teamRank = rankings.find(r => r.team === selectedTeam);
        if (teamRank) {
          setRankingData({
            rank: teamRank.rank,
            win: teamRank.win,
            lose: teamRank.lose,
            draw: teamRank.draw
          });
        }

      } catch (error) {
        console.error("데이터 연동 중 오류 발생:", error);
        // 에러 발생 시 더미 데이터로 폴백
        setScheduleData(DUMMY_SCHEDULE);
        setRankingData(DUMMY_RANKING);
      }
    };

    fetchTeamData();
  }, [selectedTeam]);

  const renderDropdown = () => (
    <div className="relative z-50">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex flex-col items-center justify-center bg-white rounded-lg shadow-md px-2 py-2 border border-gray-200 w-20 md:w-24 transition-transform hover:scale-105"
      >
        {selectedTeam ? (
          <>
            <img src={teamData[selectedTeam]?.icon} alt={selectedTeam} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
            <span className="text-[10px] md:text-xs font-semibold text-gray-700 mt-1">팀 선택</span>
          </>
        ) : (
          <>
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-3xl">⚾</div>
            <span className="text-[10px] md:text-xs font-semibold text-gray-700 mt-1">팀 선택</span>
          </>
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-20 md:w-24 bg-white rounded-lg shadow-xl border border-gray-200 py-2 flex flex-col items-center max-h-96 overflow-y-auto z-50">
          <button
            className="w-full py-2 flex justify-center hover:bg-gray-100 transition-colors border-b border-gray-100"
            onClick={() => { setSelectedTeam(null); setIsDropdownOpen(false); }}
          >
            <span className="text-xs font-medium text-gray-500">초기화</span>
          </button>
          {TEAM_LIST.map(team => (
            <button
              key={team}
              className="w-full py-2 flex justify-center hover:bg-gray-100 transition-colors"
              onClick={() => { setSelectedTeam(team); setIsDropdownOpen(false); }}
            >
              <img src={teamData[team]?.icon} alt={team} className="w-10 h-10 object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] p-4 sm:p-8 font-sans">
      <div className="flex items-center justify-between mb-6">
        {renderDropdown()}
        <h1 className="text-2xl sm:text-4xl font-bold text-center flex-1 text-white drop-shadow-md">
          ⚾ 프로야구 정보 서비스
        </h1>
        <div className="w-20 md:w-24"></div> {/* Spacer to keep title centered */}
      </div>

      {!selectedTeam ? (
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-8">
          <Link
            to="/ranking"
            className="flex flex-col items-center justify-center bg-[#18181b] border border-gray-700 text-blue-400 rounded-3xl shadow-lg hover:bg-[#27272a] hover:border-blue-500 hover:text-blue-300 transition-all duration-300 group"
          >
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow">🏆</span>
            <span className="text-3xl font-semibold">팀 순위</span>
          </Link>
          <Link
            to="/schedule"
            className="flex flex-col items-center justify-center bg-[#18181b] border border-gray-700 text-blue-400 rounded-3xl shadow-lg hover:bg-[#27272a] hover:border-blue-500 hover:text-blue-300 transition-all duration-300 group"
          >
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow">📅</span>
            <span className="text-3xl font-semibold">경기 일정</span>
          </Link>
          <Link
            to="https://civa030203.github.io/KBO-Music"
            className="flex flex-col items-center justify-center bg-[#18181b] border border-gray-700 text-blue-400 rounded-3xl shadow-lg hover:bg-[#27272a] hover:border-blue-500 hover:text-blue-300 transition-all duration-300 group"
          >
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow">🎵</span>
            <span className="text-3xl font-semibold">선수 응원가</span>
          </Link>
          <Link
            to="/playerData"
            className="flex flex-col items-center justify-center bg-[#18181b] border border-gray-700 text-blue-400 rounded-3xl shadow-lg hover:bg-[#27272a] hover:border-blue-500 hover:text-blue-300 transition-all duration-300 group"
          >
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow">📊</span>
            <span className="text-3xl font-semibold">선수 기록실</span>
          </Link>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 sm:gap-6 pb-4 sm:pb-8 h-full">
          {/* Top Half: Schedule Banner */}
          <Link
            to="/schedule"
            className="flex-1 relative rounded-3xl shadow-xl overflow-hidden group hover:brightness-110 transition-all flex flex-col p-6 md:p-10 border border-gray-800"
            style={{
              background: `linear-gradient(135deg, ${teamData[selectedTeam]?.mainColor?.replace(/[[\]]/g, '') || '#1a1748'}, ${teamData[selectedTeam]?.subColor?.replace(/[[\]]/g, '') || '#0a0a0a'})`
            }}
          >
            {/* Watermark Logo */}
            <img
              src={teamData[selectedTeam]?.icon}
              className="absolute -left-10 top-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 opacity-20 object-contain pointer-events-none mix-blend-overlay"
              alt=""
            />

            <div className="relative z-10 flex flex-col md:flex-row h-full justify-between w-full">
              {/* Left Side */}
              <div className="flex flex-col justify-between mb-4 md:mb-0">
                <div className="flex items-center gap-4 md:gap-6">
                  <h2 className="text-white text-5xl md:text-7xl font-bold tracking-tight leading-none drop-shadow-lg">NEXT<br />GAME</h2>
                  {scheduleData.length > 0 && !scheduleData[0].noGame && teamData[scheduleData[0].opponent] && (
                    <img
                      src={teamData[scheduleData[0].opponent]?.icon}
                      alt={scheduleData[0].opponent}
                      className="w-16 h-16 md:w-48 md:h-48 object-contain drop-shadow-lg"
                    />
                  )}
                </div>
                <div className="text-white/90 text-lg md:text-2xl font-medium drop-shadow mt-4 md:mt-0">
                  {scheduleData.length > 0
                    ? scheduleData[0].noGame
                      ? "오늘 경기 없음"
                      : `${scheduleData[0].date}, ${scheduleData[0].stadium || ""}`
                    : "일정 없음"}
                </div>
              </div>

              {/* Right Side */}
              <div className="flex justify-end items-center">
                <div className="grid grid-cols-2 gap-x-6 md:gap-x-12 gap-y-3 md:gap-y-6 bg-black/20 p-4 md:p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                  {scheduleData.map((game, idx) => (
                    <div key={idx} className="flex items-center gap-3 md:gap-5">
                      <span className="text-white text-lg md:text-2xl font-medium">{game.date}</span>
                      {game.noGame ? (
                        <span className="text-white/80 text-base md:text-xl font-medium tracking-wider">NO GAME</span>
                      ) : (
                        <img src={teamData[game.opponent]?.icon} alt={game.opponent} className="w-10 h-10 md:w-14 md:h-14 object-contain drop-shadow-md" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>

          {/* Bottom Half */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Ranking */}
            <Link
              to="/ranking"
              className="h-full rounded-3xl shadow-xl p-6 md:p-8 flex flex-col justify-between group hover:brightness-110 transition-all relative overflow-hidden border border-gray-800"
              style={{ backgroundColor: teamData[selectedTeam]?.mainColor?.replace(/[[\]]/g, '') || '#18181b' }}
            >
              {/* Slight tint based on team subcolor */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundColor: teamData[selectedTeam]?.subColor?.replace(/[[\]]/g, '') || '#000000' }}></div>
              <div className="relative z-10 flex flex-col h-full">
                <h2 className="text-white text-4xl md:text-5xl font-extrabold uppercase tracking-widest mb-2 drop-shadow-md">
                  {TEAM_NAMES_ENG[selectedTeam] || selectedTeam}
                </h2>
                <div className="flex items-end justify-between mt-auto w-full">
                  <div className="text-white font-bold flex items-baseline drop-shadow-md">
                    <span className="text-7xl md:text-8xl leading-none">{rankingData.rank || '-'}</span>
                    <span className="text-3xl md:text-4xl ml-2">위</span>
                  </div>
                  <div className="text-right text-white/90 text-xl md:text-3xl font-medium leading-snug tracking-wide space-y-1">
                    <div>{rankingData.win || 0}승</div>
                    <div>{rankingData.lose || 0}패</div>
                    <div>{rankingData.draw || 0}무</div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Other Menus */}
            <div className="flex gap-4 sm:gap-6 h-full">
              <Link
                to="https://civa030203.github.io/KBO-Music"
                className="flex-1 flex flex-col items-center justify-center bg-[#18181b] border border-gray-700 text-blue-400 rounded-3xl shadow-xl hover:bg-[#27272a] hover:border-blue-500 hover:text-blue-300 transition-all duration-300 group"
              >
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow">🎵</span>
                <span className="text-xl md:text-2xl font-semibold">선수 응원가</span>
              </Link>
              <Link
                to="/playerData"
                className="flex-1 flex flex-col items-center justify-center bg-[#18181b] border border-gray-700 text-blue-400 rounded-3xl shadow-xl hover:bg-[#27272a] hover:border-blue-500 hover:text-blue-300 transition-all duration-300 group"
              >
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow">📊</span>
                <span className="text-xl md:text-2xl font-semibold">선수 기록실</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/relay/:leagueId/:seriesId/:gameID" element={<Relay />} />
        <Route path="/playerData" element={<PlayerSearch />} />
        <Route path="/playerData/:pId" element={<Data />} />
      </Routes>
    </Router>
  );
}

export default App;
