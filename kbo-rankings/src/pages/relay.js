import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

export default function LiveTextPage() {
  const [live, setLive] = useState(null);
  const [postGame, setPostGame] = useState(null);
  const [pgLoading, setPgLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [seriesId, setSeriesId] = useState(useParams().seriesId);
  const [gameId, setGameId] = useState(useParams().gameID);
  const [leagueId, setLeagueId] = useState(useParams().leagueId);
  const [maxInn, setMaxInn] = useState(1);
  const [inn, setInn] = useState(null);

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
  


  if (loading) return <p className="text-center p-4">불러오는 중...</p>;
  if (!live) return <p className="text-center p-4">데이터가 없습니다.</p>;

  const handleChange = (e) => {
    const selected = e.target.value;
    setInn(selected);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* 메인으로 돌아가기 */}
      <div className="mb-4">
        <Link
          to="/schedule"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          ⬅ 메인 화면으로
        </Link>
      </div>

      <h1 className="text-xl font-bold mb-4">KBO 문자중계</h1>

      {/* ✅ 스코어보드 (임시 데이터용 틀) */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border border-gray-300 text-center text-sm bg-white shadow rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">팀</th>
              {[...Array(scoreData.scoreData[0].length)].map((_, i) => (
                <th key={i} className="border px-2 py-1">
                  {i + 1}
                </th>
              ))}
              <th className="border px-2 py-1 font-bold">R</th>
              <th className="border px-2 py-1">H</th>
              <th className="border px-2 py-1">E</th>
              <th className="border px-2 py-1">B</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-blue-50">
              <td className="border px-2 py-1 font-semibold">{scoreData.teamData[0]}</td>
              {[...Array(scoreData.scoreData[0].length)].map((_, i) => (
                <td key={i} className="border px-2 py-1">{scoreData.scoreData[0][i]}</td>
              ))}
              <td className="border px-2 py-1 font-bold">{scoreData.resultData[0][0]}</td>
              <td className="border px-2 py-1">{scoreData.resultData[0][1]}</td>
              <td className="border px-2 py-1">{scoreData.resultData[0][2]}</td>
              <td className="border px-2 py-1">{scoreData.resultData[0][3]}</td>
            </tr>
            <tr className="bg-red-50">
              <td className="border px-2 py-1 font-semibold">{scoreData.teamData[1]}</td>
              {[...Array(scoreData.scoreData[0].length)].map((_, i) => (
                <td key={i} className="border px-2 py-1">{scoreData.scoreData[1][i]}</td>
              ))}
              <td className="border px-2 py-1 font-bold">{scoreData.resultData[1][0]}</td>
              <td className="border px-2 py-1">{scoreData.resultData[1][1]}</td>
              <td className="border px-2 py-1">{scoreData.resultData[1][2]}</td>
              <td className="border px-2 py-1">{scoreData.resultData[1][3]}</td>
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
                    src={
                      parseInt(gameId.slice(0, 4)) > 2016
                        ? `https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/${gameId.slice(0, 4)}/${bat.BAT_P_ID}.jpg`
                        : `https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/2016/${bat.BAT_P_ID}.jpg`
                    }
                    alt={bat.BAT_P_NM}
                    className="w-12 h-16 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{bat.BAT_P_NM}</p>
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
                    <span>{res.LIVETEXT_IF}</span>
                  </li>
                </ul>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
