import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Ranking from "./pages/ranking.js";
import Schedule from "./pages/schedule.js";
import Relay from "./pages/relay.js";
import PlayerSearch from "./pages/player-search.js"
import Data from "./pages/data.js";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">⚾ 프로야구 정보 서비스</h1>
      <Link
        to="/ranking"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        팀 순위 보러가기
      </Link>
      <Link
        to="/schedule"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        경기 일정 보러가기
      </Link>
      <Link
        to="https://civa030203.github.io/KBO-Music"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        선수 응원가 들으러 가기
      </Link>
      <Link
        to="/playerData"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        선수 기록실
      </Link>
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
