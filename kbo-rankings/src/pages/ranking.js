// frontend/src/pages/Ranking.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { teamData } from "./src/teamData";
import { Link } from "react-router-dom";

export default function Ranking() {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/rankings")
      .then((res) => setRankings(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-2 sm:p-6">
    {/* 메인 화면 버튼 */}
      <div className="mb-4">
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 transition"
          >
          ⬅ 메인 화면으로
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-center mb-6 text-white">📊 KBO 팀 순위</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#18181b] shadow-md rounded-lg overflow-hidden text-sm sm:text-base whitespace-nowrap border border-gray-700">
          <thead className="bg-gray-900 text-gray-300 border-b border-gray-700">
            <tr>
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-center">순위</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-left">팀명</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-center">승</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-center">패</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-center">무</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-center">승률</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 text-center">게임차</th>
            </tr>
          </thead>
          <tbody>
          {rankings.map((team, idx) => {
            const tData = teamData[team.team] || {};
            const teamColor = tData.mainColor ? tData.mainColor.replace(/[\[\]]/g, '') : null;
            const rowStyle = teamColor ? { background: `linear-gradient(135deg, ${teamColor}cc, ${teamColor}66)` } : {};
            return (
              <tr
                key={idx}
                style={rowStyle}
                className="border-b border-gray-700/50 transition-colors hover:brightness-125 text-gray-100"
              >
                <td className="py-2 px-2 sm:py-3 sm:px-4 text-center font-semibold">{team.rank}</td>
                <td className="py-2 px-2 sm:py-3 sm:px-4 flex items-center gap-1 sm:gap-2">
                  {tData.icon && (
                    <img
                      src={tData.icon}
                      alt={team.team}
                      className="w-5 h-5 sm:w-6 sm:h-6"
                    />
                  )}
                  <span className="font-medium drop-shadow-md">{team.team}</span>
                </td>
                <td className="py-2 px-2 sm:py-3 sm:px-4 text-center">{team.win}</td>
                <td className="py-2 px-2 sm:py-3 sm:px-4 text-center">{team.lose}</td>
                <td className="py-2 px-2 sm:py-3 sm:px-4 text-center">{team.draw}</td>
                <td className="py-2 px-2 sm:py-3 sm:px-4 text-center">{team.winRate}</td>
                <td className="py-2 px-2 sm:py-3 sm:px-4 text-center">{team.gamesBehind}</td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
