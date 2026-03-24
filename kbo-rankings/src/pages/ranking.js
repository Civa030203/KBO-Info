// frontend/src/pages/Ranking.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { teamData } from "./src/teamData";
import { Link } from "react-router-dom";

export default function Ranking() {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    axios
      .get("https://kbo-info.onrender.com/api/rankings")
      .then((res) => setRankings(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-6">
    {/* 메인 화면 버튼 */}
      <div className="mb-4">
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
          ⬅ 메인 화면으로
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-center mb-6">📊 KBO 팀 순위</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden text-sm sm:text-base whitespace-nowrap">
          <thead className="bg-blue-600 text-white">
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
            return (
              <tr
                key={idx}
                className={`border-b transition-colors hover:bg-yellow-400 ${
                  tData.mainColor ? "bg-" + tData.mainColor + " text-white" : ""
                }`}
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
                  <span className="font-medium">{team.team}</span>
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
