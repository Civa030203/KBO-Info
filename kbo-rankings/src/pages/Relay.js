import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

export default function LiveTextPage() {
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seriesId, setSeriesId] = useState(useParams().seriesId);
  const [gameId, setGameId] = useState(useParams().gameID);
  const [awayTeamColor1, setAwayTeamColor1] = useState(null);
  const [awayTeamColor2, setAwayTeamColor2] = useState(null);
  const [homeTeamColor1, setHomeTeamColor1] = useState(null);
  const [homeTeamColor2, setHomeTeamColor2] = useState(null);
  const [maxInn, setMaxInn] = useState(1);
  const [inn, setInn] = useState(null);

  useEffect(() => {
    if (maxInn) {
      setInn(maxInn); // maxInn 값이 들어오면 inn을 maxInn으로 설정
    }
  }, [maxInn]);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const gData = await axios.get(
          `http://localhost:5001/api/schedule?date=${gameId.slice(0, 8)}`
        );

        gData.data.forEach((dt) => {
          if (dt.gameID === gameId) {
            setMaxInn(dt.gameMaxInn);
          }
        });

        // inn이 아직 null이면 요청하지 않음
        if (!inn) return;

        // 서버에 요청
        const res = await axios.get(`http://localhost:5001/api/relay`, {
          params: {
            le_id: 1,
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
  }, [inn, seriesId, gameId, maxInn]);

  if (loading) return <p className="text-center p-4">불러오는 중...</p>;
  if (!live) return <p className="text-center p-4">데이터가 없습니다.</p>;

  const handleChange = (e) => {
    const selected = e.target.value;
    setInn(selected);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <Link
          to="/schedule"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
          ⬅ 메인 화면으로
        </Link>
      </div>
      <h1 className="text-xl font-bold mb-4">KBO 문자중계</h1>
      <select
        onChange={(e) => setInn(Number(e.target.value))}
        className="border p-2 rounded mb-4"
        value={inn ?? ""} // inn 값 없으면 빈 값
      >
        {[...Array(maxInn)].map((_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}회
          </option>
        ))}
      </select>

      {live.listInnTb.map((inning, inningIdx) => (
        <div key={inningIdx} className="mb-6">
          <h4 className="text-s font-bold mb-2">
            {inn}회{inning.TB_NM} {inning.T_NM} 공격
          </h4>

          <div className="border rounded-lg p-4 bg-white shadow">
            {inning.listBatOrder.map((bat, batIdx) => (
              <div key={batIdx} className="mb-4">
                <div className={`flex items-center gap-4 p-4 border-l-4 border-blue-600 bg-white shadow-sm rounded-md`}>
                  <img
                    src={parseInt(gameId.slice(0, 4)) > 2016
                      ? `https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/${gameId.slice(0, 4)}/${bat.BAT_P_ID}.jpg`
                      : `https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/2016/${bat.BAT_P_ID}.jpg`
                    }
                    alt={bat.BAT_P_NM}
                    className="w-12 h-16 rounded-full"
                  />
                  <div>
                    <h2 className="font-semibold text-gray-800">{bat.BAT_ORDER_NO}번타자</h2>
                    <p className="text-gray-600">{bat.BAT_P_NM}</p>
                  </div>
                </div>
                <ul className="mt-2 space-y-2">
                  {bat.listData.map((play, playIdx) => (
                    <li
                      key={playIdx}
                      className="p-2 border-b last:border-none text-sm"
                    >
                      <span className={play.TEXTSTYLE_SC === "2" ?
                                        "italic text-gray-400" :
                                        play.TEXTSTYLE_SC === "13" || play.TEXTSTYLE_SC === "14" ?
                                          "font-bold" :
                                          play.TEXTSTYLE_SC === "23" || play.TEXTSTYLE_SC === "24" ?
                                          "font-bold text-blue-300" :
                                          ""
                                      }>
                        {play.LIVETEXT_IF}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

  );
}
