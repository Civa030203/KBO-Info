import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { teamData } from "./src/teamData";

export default function Data() {
    const { pId } = useParams();   // ← URL에서 바로 pId 가져오는 부분!
    const [player, setPlayer] = useState(null);
    const [yearIndex, setYearIndex] = useState(0);
    const [mainColor, setMainColor] = useState(null);
    const [subColor, setSubColor] = useState(null);
    const [teamFullName, setTeamFullName] = useState(null);
    const [teamId, setTeamId] = useState(null);

    useEffect(() => {
        if (!pId) return;

        axios
            .get(`https://kbo-info.onrender.com/api/playerData?pId=${pId}`)
            .then((res) => {
                setPlayer(res.data);
                if (res.data.records && res.data.records.length > 0) {
                    setYearIndex(res.data.records.length - 1); // 최신 시즌으로 설정
                } else {
                    setYearIndex(-1);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }, [pId]);


    const GetStatYear = (event) => {
        if (!player || !player.records) return;
        const selectedYear = String(event.target.value);
        const index = player.records.findIndex(r => String(r.year) === selectedYear);
        if (index !== -1) setYearIndex(index);
    };

    useEffect(() => {
        if (!player) return;

        if (!player.records || player.records.length === 0 || yearIndex === -1) {
            setMainColor("#9ca3af");
            setSubColor("#d1d5db");
            setTeamFullName("소속팀 없음");
            setTeamId(null);
            return;
        }

        let team = player.records[yearIndex].team;
        if (team === "SK") team = "SSG";
        if (team === "우리" || team === "히어로즈" || team === "넥센") team = "키움";
        if (team === "해태") team = "KIA";
        if (team === "OB") team = "두산";

        if (teamData[team]) {
            setMainColor(teamData[team].mainColor.substr(1, 7));
            setSubColor(teamData[team].subColor.substr(1, 7));
        }

        switch (player.records[yearIndex].team) {
            case "MBC":
                setTeamFullName("MBC 청룡");
                setTeamId("5001");
                break;

            case "LG":
                setTeamFullName("LG 트윈스");
                setTeamId("5002");
                break;

            case "OB":
                setTeamFullName("OB 베어스");
                setTeamId("6001");
                break;

            case "두산":
                setTeamFullName("두산 베어스");
                setTeamId("6002");
                break;

            case "삼미":
                setTeamFullName("삼미 슈퍼스타즈");
                setTeamId("4001");
                break;

            case "청보":
                setTeamFullName("청보 핀토스");
                setTeamId("4002");
                break;

            case "태평양":
                setTeamFullName("태평양 돌핀스");
                setTeamId("4003");
                break;

            case "현대":
                setTeamFullName("현대 유니콘스");
                setTeamId("4004");
                break;

            case "우리":
                setTeamFullName("우리 히어로즈");
                setTeamId("10001");
                break;

            case "히어로즈":
                setTeamFullName("서울 히어로즈");
                setTeamId("10001");
                break;

            case "넥센":
                setTeamFullName("넥센 히어로즈");
                setTeamId("10001");
                break;

            case "키움":
                setTeamFullName("키움 히어로즈");
                setTeamId("10001");
                break;

            case "삼성":
                setTeamFullName("삼성 라이온즈");
                setTeamId("1001");
                break;

            case "롯데":
                setTeamFullName("롯데 자이언츠");
                setTeamId("3001");
                break;

            case "해태":
                setTeamFullName("해태 타이거즈");
                setTeamId("2001");
                break;

            case "KIA":
                setTeamFullName("KIA 타이거즈");
                setTeamId("2002");
                break;

            case "빙그레":
                setTeamFullName("빙그레 이글스");
                setTeamId("7001");
                break;

            case "한화":
                setTeamFullName("한화 이글스");
                setTeamId("7002");
                break;

            case "쌍방울":
                setTeamFullName("쌍방울 레이더스");
                setTeamId("8001");
                break;

            case "SK":
                setTeamFullName("SK 와이번스");
                setTeamId("9001");
                break;

            case "SSG":
                setTeamFullName("SSG 랜더스");
                setTeamId("9002");
                break;

            case "NC":
                setTeamFullName("NC 다이노스");
                setTeamId("11001");
                break;

            case "KT":
                setTeamFullName("KT 위즈");
                setTeamId("12001");
                break;

            default:
                break;
        }

    }, [player, yearIndex]);   // ← 이 둘이 변할 때만 색 업데이트



    if (!player) {
        return <div className="text-center mt-10 text-lg">불러오는 중...</div>;
    } else {
        return (
            <><div className="m-4">
                <Link
                    to="/playerData"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                    ⬅ 이전 화면으로
                </Link>
            </div>
                <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">

                    {/* 상단 배너 + 프로필 */}
                    <div
                        className="h-36 w-full"
                        style={{
                            background: `linear-gradient(135deg, ${mainColor}, ${subColor})`,
                        }}
                    ></div>

                    <div className="relative px-6 pb-6 -mt-32 flex items-center">
                        <img
                            src={(player.records && player.records.length > 0 && yearIndex !== -1 && player.records[yearIndex].year >= 2017) ?
                                `https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/${player.records[yearIndex].year}/${pId}.jpg` :
                                `https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/2017/${pId}.jpg`}
                            alt={player.name}
                            className="w-24 h-28 rounded-full border-4 border-white shadow-md"
                        />
                        <div className="ml-4">
                            <h2 className="text-2xl font-bold text-gray-100">{player.name}</h2>
                            {teamId && player.records && player.records.length > 0 && yearIndex !== -1 && (
                                <img
                                    src={`https://statiz.co.kr/data/team/ci/${player.records[yearIndex].year}/${teamId}.svg`}
                                    className="absolute right-6 top-6 w-24 opacity-30"
                                    alt="팀 로고"
                                />
                            )}
                            <p className="text-gray-400">{player.position}</p>
                            <p className="text-sm font-medium mt-1">
                                <span
                                    className="inline-block px-2 py-1 rounded-md text-white text-xs"
                                    style={{ backgroundColor: mainColor }}
                                >
                                    {teamFullName}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* 기본 정보 */}
                    <div className="px-6 py-4 border-t border-gray-100">
                        <h3 className="text-lg font-semibold mb-2">선수 정보</h3>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <div className="text-gray-500">등번호</div>
                            <div>{player.backNo}</div>

                            <div className="text-gray-500">생년월일</div>
                            <div>{player.birth}</div>

                            <div className="text-gray-500">체격</div>
                            <div>{player.body}</div>

                            <div className="text-gray-500">포지션</div>
                            <div>{player.position}</div>

                            <div className="text-gray-500">입단</div>
                            <div>{player.proDebut}</div>
                        </div>
                    </div>

                    {/* 시즌 스탯 */}
                    <div className="px-6 py-4 border-t border-gray-100">
                        {(!player.records || player.records.length === 0 || yearIndex === -1) ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500 font-medium">시즌 기록이 없습니다.</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-semibold mb-2">{player.records[yearIndex].year} 시즌 성적</h3>
                                <select name="yearSelect" onChange={GetStatYear} defaultValue={player.records[yearIndex].year}>
                                    {player.records.map((r) => (
                                        <option key={r.year} value={r.year}>
                                            {r.year}
                                        </option>
                                    ))}
                                </select>
                                <div className="grid grid-cols-3 text-center text-sm">
                                    <div>
                                        <p className="text-gray-500">{player.position.substr(0, 1) == "투" ? "승리" : "타율"}</p>
                                        <p className="text-xl font-semibold">{player.position.substr(0, 1) == "투" ? player.records[yearIndex].win : player.records[yearIndex].avg}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">{player.position.substr(0, 1) == "투" ? "패배" : "홈런"}</p>
                                        <p className="text-xl font-semibold">{player.position.substr(0, 1) == "투" ? player.records[yearIndex].loss : player.records[yearIndex].hr}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">{player.position.substr(0, 1) == "투" ? "평균자책점" : "타점"}</p>
                                        <p className="text-xl font-semibold">{player.position.substr(0, 1) == "투" ? player.records[yearIndex].era : player.records[yearIndex].rbi}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 text-center text-sm mt-4">
                                    <div>
                                        <p className="text-gray-500">{player.position.substr(0, 1) == "투" ? "세이브" : "출루율"}</p>
                                        <p className="text-xl font-semibold">{player.position.substr(0, 1) == "투" ? player.records[yearIndex].save : player.records[yearIndex].obp}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">{player.position.substr(0, 1) == "투" ? "홀드" : "장타율"}</p>
                                        <p className="text-xl font-semibold">{player.position.substr(0, 1) == "투" ? player.records[yearIndex].hold : player.records[yearIndex].slg}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">{player.position.substr(0, 1) == "투" ? "WHIP" : "OPS"}</p>
                                        <p className="text-xl font-semibold">{player.position.substr(0, 1) == "투" ? player.records[yearIndex].whip : player.records[yearIndex].ops}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* KBO 공식 페이지 링크 */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <Link
                            to={"https://www.koreabaseball.com/Record/Player/" + (player.position.substr(0, 1) === "투" ? "PitcherDetail" : "HitterDetail") + `/Basic.aspx?playerId=${pId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 font-medium hover:underline text-sm"
                        >
                            KBO 공식 선수 정보 보기 →
                        </Link>
                    </div>
                </div></>
        );
    }
}
