import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
// 1. teamData.js 파일 임포트 (경로가 src/teamData.js 이므로 상대 경로 확인 필요)
import { teamData } from "./src/teamData";

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
            });
    };

    function getTeamName(teamID) {
        switch (teamID) {
            case "삼성": return "삼성 라이온즈";

            case "해태": return "해태 타이거즈";
            case "KIA": return "KIA 타이거즈";

            case "롯데": return "롯데 자이언츠";

            case "삼미": return "삼미 슈퍼스타즈";
            case "청보": return "청보 핀토스";
            case "태평양": return "태평양 돌핀스";
            case "현대": return "현대 유니콘스";

            case "MBC ": return "MBC 청룡";
            case "LG": return "LG 트윈스";

            case "OB": return "OB 베어스";
            case "두산": return "두산 베어스";

            case "빙그레": return "빙그레 이글스";
            case "한화": return "한화 이글스";

            case "쌍방울": return "쌍방울 레이더스";

            case "SK": return "SK 와이번스";
            case "SSG": return "SSG 랜더스";

            case "우리": return "우리 히어로즈";
            case "히어로즈": return "서울 히어로즈";
            case "넥센": return "넥센 히어로즈";
            case "키움": return "키움 히어로즈";

            case "NC": return "NC 다이노스";

            case "KT": return "KT 위즈";

            case "울산": return "울산 웨일즈";
            case "상무": return "상무 피닉스";
            case "경찰": return "경찰 야구단";
            default: return teamID;
        }
    }

    return (
        <>
            <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
                <div className="m-4 pt-4">
                    <Link
                        to="/"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 transition"
                    >
                        ⬅ 메인 화면으로
                    </Link>
                </div>
                <div className="flex justify-center mt-10">
                    <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
                        <input
                            className="px-3 py-2 outline-none bg-gray-800 text-white placeholder-gray-400"
                            placeholder="선수를 검색하세요"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button
                            className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-500 transition"
                            onClick={clickSearchBtn}
                        >
                            검색
                        </button>
                    </div>
                </div>

                {/* 검색 결과 카드 영역 */}
                <div className="flex justify-center mt-10">
                    <div className="w-full max-w-4xl px-4">
                        {data.length === 0 ? (
                            <p className="text-center text-gray-400">검색 결과가 없습니다.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {data.map((player, idx) => {
                                    // 2. pData.js 기준 records 배열의 마지막 요소에서 활약 연도 추출
                                    let activeYear = "2026"; // 기본 디폴트 값
                                    if (player.records && player.records.length > 0) {
                                        // records의 가장 마지막 데이터의 year 추출
                                        activeYear = player.records[player.records.length - 1].year;
                                    }

                                    const profileImgUrl = `https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/${activeYear}/${player.pId}.jpg`;

                                    // 3. teamData에서 현재 선수의 팀 정보 매칭 및 대괄호 제거 후 컬러값 추출
                                    const teamKey = player.team; // 예: "두산", "키움" 등
                                    const teamStyle = teamData[teamKey] || { mainColor: "[#1f2937]", subColor: "[#4b5563]" };

                                    // "[#1a1748]" -> "#1a1748" 형태로 변환
                                    const pureMainColor = teamStyle.mainColor.replace(/[\[\]]/g, "");
                                    const pureSubColor = teamStyle.subColor.replace(/[\[\]]/g, "");

                                    return (
                                        <Link
                                            to={`/playerData/${player.pId}`}
                                            key={idx}
                                            className="block overflow-hidden rounded-xl border p-6 transition-all duration-200 hover:scale-[1.01] hover:shadow-xl"
                                            style={{
                                                // 팀 고유 컬러를 활용한 다크 그라데이션 및 테두리선 부여
                                                background: `linear-gradient(135deg, ${pureMainColor}dd, #0b0f19)`,
                                                borderColor: pureSubColor
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-6">
                                                <div className="flex items-center gap-6">
                                                    {/* 프로필 이미지 */}
                                                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 bg-slate-900/50 flex-shrink-0 shadow-md"
                                                        style={{ borderColor: pureSubColor }}>
                                                        <img
                                                            src={profileImgUrl}
                                                            alt={player.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.src = "https://mykbo.net/images/default_player.png";
                                                            }}
                                                        />
                                                    </div>

                                                    {/* 선수 스펙 정보 */}
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-2xl font-bold text-white">
                                                                {player.name}
                                                            </span>
                                                            {player.backNo && (
                                                                <span className="text-sm font-semibold text-gray-300">
                                                                    No.{player.backNo}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <span className="text-sm text-gray-300 font-medium">
                                                            {player.position}
                                                        </span>

                                                        {/* 소속팀 뱃지 */}
                                                        <div className="mt-1.5">
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white rounded-full bg-black/40 border border-white/10">
                                                                {teamStyle.icon && (
                                                                    <img src={teamStyle.icon} alt="" className="w-4 h-4 object-contain" />
                                                                )}
                                                                {getTeamName(player.team)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 우측 배경 디자인 요소: 은은하게 깔아주는 대형 팀 로고 아이콘 */}
                                                {teamStyle.icon && (
                                                    <div className="w-24 h-24 opacity-15 pointer-events-none select-none hidden sm:block">
                                                        <img src={teamStyle.icon} alt="" className="w-full h-full object-contain filter grayscale invert" />
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}