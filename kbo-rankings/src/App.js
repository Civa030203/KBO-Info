import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Ranking from "./pages/ranking.js";
import Schedule from "./pages/schedule.js";
import Relay from "./pages/relay.js";
import PlayerSearch from "./pages/player-search.js"
import Data from "./pages/data.js";

function Home() {
  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 sm:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center my-6 sm:my-8 text-gray-800">
        ⚾ 프로야구 정보 서비스
      </h1>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-8">
        <Link
          to="/ranking"
          className="flex flex-col items-center justify-center bg-white border-2 border-blue-500 text-blue-600 rounded-2xl shadow-md hover:bg-blue-600 hover:text-white transition-all duration-300 group"
        >
          <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏆</span>
          <span className="text-2xl font-semibold">팀 순위</span>
        </Link>
        <Link
          to="/schedule"
          className="flex flex-col items-center justify-center bg-white border-2 border-blue-500 text-blue-600 rounded-2xl shadow-md hover:bg-blue-600 hover:text-white transition-all duration-300 group"
        >
          <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">📅</span>
          <span className="text-2xl font-semibold">경기 일정</span>
        </Link>
        <Link
          to="https://civa030203.github.io/KBO-Music"
          className="flex flex-col items-center justify-center bg-white border-2 border-blue-500 text-blue-600 rounded-2xl shadow-md hover:bg-blue-600 hover:text-white transition-all duration-300 group"
        >
          <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎵</span>
          <span className="text-2xl font-semibold">선수 응원가</span>
        </Link>
        <Link
          to="/playerData"
          className="flex flex-col items-center justify-center bg-white border-2 border-blue-500 text-blue-600 rounded-2xl shadow-md hover:bg-blue-600 hover:text-white transition-all duration-300 group"
        >
          <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</span>
          <span className="text-2xl font-semibold">선수 기록실</span>
        </Link>
      </div>
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
        <Route path="/playerData" element={<PlayerSearch />}/>
        <Route path="/playerData/:pId" element={<Data />}/>
      </Routes>
    </Router>
  );
}

export default App;
