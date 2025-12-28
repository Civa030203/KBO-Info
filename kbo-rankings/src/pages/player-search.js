import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function PlayerSearch() {
    const [query, setQuery] = useState("");
    const [data, setData] = useState([]);

    const clickSearchBtn = () => {
        axios
            .get(`https://kbo-info.onrender.com/api/playerSearch?query=${query}`)
            .then((res) => {
                setData(res.data);
            })
            .catch((err) => {
                console.error(err);
            })
    };

    function getTeamName(teamID) {
        console.log(teamID);
        
        switch (teamID) {
            case "HT":
                return "KIA 타이거즈";

            case "SS":
                return "삼성 라이온즈";

            case "OB":
                return "두산 베어스";

            case "SK":
                return "SSG 랜더스";

            case "LG":
                return "LG 트윈스";

            case "LT":
                return "롯데 자이언츠";

            case "HH":
                return "한화 이글스";

            case "KT":
                return "KT 위즈";

            case "NC":
                return "NC 다이노스";

            case "WO":
                return "키움 히어로즈";
        
            default:
                console.log("error!");
                
                break;
        }
    }

    return (
        <>
        <div className="m-4">
            <Link
                to="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
                ⬅ 메인 화면으로
            </Link>
        </div>
        <div className="flex justify-center mt-10">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <input
                    className="px-3 py-2 outline-none"
                    placeholder="선수를 검색하세요"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    />
                <button
                    className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
                    onClick={clickSearchBtn}
                >
                    검색
                </button>
            </div>
        </div>
        {/* 검색 결과 테이블 */}
        <div className="flex justify-center mt-10">
            <div className="w-full max-w-4xl">

                {data.length === 0 ? (
                <p className="text-center text-gray-500">검색 결과가 없습니다.</p>
                ) : (
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="border px-4 py-2">선수 이름</th>
                        <th className="border px-4 py-2">포지션</th>
                        <th className="border px-4 py-2">등번호</th>
                        <th className="border px-4 py-2">소속팀</th>
                        <th className="border px-4 py-2">투/타정보</th>
                    </tr>
                    </thead>

                    <tbody>
                    {data.map((player, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">

                        {/* 선수 이름 클릭 → 상세페이지 이동 */}
                        <td className="border px-4 py-2 text-blue-600 hover:underline">
                            <Link to={`/playerData/${player.pId}`}>
                            {player.name}
                            </Link>
                        </td>

                        <td className="border px-4 py-2">{player.position}</td>
                        <td className="border px-4 py-2">{player.backNo}</td>
                        <td className="border px-4 py-2">{getTeamName(player.team)}</td>
                        <td className="border px-4 py-2">{player.hand}</td>

                        </tr>
                    ))}
                    </tbody>
                </table>
                )}

            </div>
        </div>
        </>
    );
};