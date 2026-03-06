import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

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
  "10218": "79345",
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
  "10257": "67341"
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
  );
}
