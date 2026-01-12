// src/pages/Schedule.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Schedule() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [league, setLeague] = useState(1);

  const today = new Date();
  const todayForDefault = today.toISOString().slice(0, 10);
  const [defaultDate, setDefaultDate] = useState(todayForDefault);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}${month}${day}`;

  const [date, setDate] = useState(formattedDate);

  const handleChange = (e) => {
    const selected = e.target.value.replace(/-/g, ""); // YYYY-MM-DD → YYYYMMDD
    setDate(selected);
  };

  const selectLeague = (e) => {
    const selected = e.target.value;
    setLeague(selected);
  }

  useEffect(() => {
    axios
      .get(`https://kbo-info.onrender.com/api/schedule?&date=${date}&leId=${league}`)
      .then((res) => {
        setGames(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [date]);



  if (loading) return <div className="p-6">Loading...</div>;

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

      default:
        break;
    }
    teamID = String(teamID);
    return teamID;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 메인 화면 버튼 */}
      <div className="mb-4">
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          ⬅ 메인 화면으로
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-center mb-6">📅 KBO 경기 일정</h1>

      <div className="overflow-x-auto">
        <input type="date" onChange={handleChange} className="border p-2 rounded mb-4" defaultValue={defaultDate}/>
        <select className="p-2" onChange={selectLeague}>
          <option value="1">1군</option>
          <option value="2">2군</option>
        </select>

        {games.length > 0 ? (
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden text-center md:text-sm table-fixed">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 hidden md:table-cell text-left">날짜</th>
                <th className="py-3 px-4">시간</th>
                <th className="py-3 px-4 hidden md:table-cell">구장</th>
                <th className="py-3 px-4 whitespace-nowrap">원정팀</th>
                <th className="py-3 px-4 whitespace-nowrap">스코어</th>
                <th className="py-3 px-4 whitespace-nowrap">홈팀</th>
                <th className="py-3 px-4 hidden md:table-cell"></th>
                <th className="py-3 px-4 whitespace-nowrap">경기 정보</th>
              </tr>
            </thead>

            <tbody>
              {games.map((game, idx) => (
                <tr
                  key={idx}
                  className={
                    game.gameState >= 4
                      ? "border-b bg-gray-400 transition"
                      : "border-b hover:bg-gray-100 transition"
                  }
                >
                  {game.gameType === "정규경기" ? (
                    <td className="py-3 px-4 whitespace-nowrap hidden md:table-cell">{game.date}</td>
                  ) : (
                    <td className="py-3 px-4 whitespace-nowrap hidden md:table-cell">
                      <span>
                        {game.date}
                        <br />
                        {game.gameType}
                      </span>
                    </td>
                  )}

                  <td className="py-3 px-4">{game.gameTime}</td>
                  <td className="py-3 px-4 hidden md:table-cell">{game.stadium}</td>

                  {/* 원정팀 */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2 shrink-0">
                      <span className="text-base hidden md:table-cell">
                        {game.awayTeamName === ""
                          ? "히어로즈"
                          : game.awayTeamName}
                      </span>
                      <img
                        src={`https://statiz.co.kr/data/team/ci/${date.slice(
                          0,
                          4
                        )}/${getTeamIcon(
                          date.slice(0, 4),
                          game.awayTeamName
                        )}.svg`}
                        alt={game.awayTeamName}
                        className="w-12 h-12"
                      />
                    </div>
                  </td>

                  {/* 스코어 */}
                  <td className="py-3 px-4 whitespace-nowrap md:text-sm">
                    {game.gameState < 2 ? (
                      <span>경기 전</span>
                    ) : game.gameState >= 4 ? (
                      <><span className="hidden sm:inline">취소된 경기입니다.</span>
                      <span className="sm:hidden">경기취소</span></>
                    ) : (
                      game.gameScore
                    )}
                  </td>

                  {/* 홈팀 */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2 shrink-0">
                      <span className="text-base hidden md:table-cell">
                        {game.homeTeamName === ""
                          ? "히어로즈"
                          : game.homeTeamName}
                      </span>
                      <img
                        src={`https://statiz.co.kr/data/team/ci/${date.slice(
                          0,
                          4
                        )}/${getTeamIcon(
                          date.slice(0, 4),
                          game.homeTeamName
                        )}.svg`}
                        alt={game.homeTeamName}
                        className="w-12 h-12"
                      />
                    </div>
                  </td>

                  <td className="py-3 px-4 hidden md:table-cell"></td>

                  {/* 경기 정보 */}
                  <td className="py-3 px-4">
                    {(game.gameState === "2" || game.gameState === "3") &&
                    parseInt(game.gameID.slice(0, 4)) >= 2010 ? (
                      <Link
                        to={`/relay/${league}/${game.seriesId}/${game.gameID}`}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                        target="_blank"
                      >
                        문자 중계
                      </Link>
                    ) : (
                      <span></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <h4 className="text-gray-400 text-center">경기가 없습니다.</h4>
        )
      }

      </div>
    </div>
  );
}
