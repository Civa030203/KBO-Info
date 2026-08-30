import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// 1. teamData.js 파일 임포트
import { teamData } from "./src/teamData";

// 연도 목록 생성 (1982년부터 현재 연도까지)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1982 + 1 }, (_, i) => currentYear - i);
const LIMIT_OPTIONS = [30, 50, 100, 300];
const PAGE_SIZE = 50;

// 타자 및 투수 부문별 메타데이터 정의
const HITTER_CATEGORIES = [
    { key: "hitterHra", label: "타율", unit: "", isDecimal: true, digits: 3 },
    { key: "hitterHr", label: "홈런", unit: "개", isDecimal: false },
    { key: "hitterRbi", label: "타점", unit: "점", isDecimal: false },
    { key: "hitterOps", label: "OPS", unit: "", isDecimal: true, digits: 3 },
    { key: "hitterSb", label: "도루", unit: "개", isDecimal: false },
    { key: "hitterWar", label: "WAR", unit: "", isDecimal: true, digits: 2 },
];

const PITCHER_CATEGORIES = [
    { key: "pitcherEra", label: "평균자책점", unit: "", isDecimal: true, digits: 2 },
    { key: "pitcherWin", label: "다승", unit: "승", isDecimal: false },
    { key: "pitcherKk", label: "탈삼진", unit: "개", isDecimal: false },
    { key: "pitcherSave", label: "세이브", unit: "세이브", isDecimal: false },
    { key: "pitcherHold", label: "홀드", unit: "홀드", isDecimal: false },
    { key: "pitcherWhip", label: "WHIP", unit: "", isDecimal: true, digits: 2 },
    { key: "pitcherWar", label: "WAR", unit: "", isDecimal: true, digits: 2 },
];

export default function PlayerSearch() {
    const [query, setQuery] = useState("");
    const [data, setData] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // 연도 및 조회 인원 수 상태
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedLimit, setSelectedLimit] = useState(30);
    const [currentPage, setCurrentPage] = useState(1);

    // 순위 데이터 상태
    const [rankingData, setRankingData] = useState({ hitters: [], pitchers: [] });
    const [isRankingLoading, setIsRankingLoading] = useState(true);
    const [rankingType, setRankingType] = useState("HITTER"); // "HITTER" | "PITCHER"
    const [selectedStat, setSelectedStat] = useState("hitterHra");

    // 연도 또는 조회 인원 수 변경 시 순위 데이터 조회
    useEffect(() => {
        setIsRankingLoading(true);
        const apiUrl = `https://trees-dans-collectible-strategy.trycloudflare.com/api/playerRankings?season=${selectedYear}&limit=${selectedLimit}`;
        // const apiUrl = `http://localhost:5001/api/playerRankings?season=${selectedYear}&limit=${selectedLimit}`;
        axios
            .get(apiUrl)
            .then((res) => {
                if (res.data?.result) {
                    setRankingData({
                        hitters: res.data.result.hitters || [],
                        pitchers: res.data.result.pitchers || [],
                    });
                }
            })
            .catch((err) => {
                console.error("순위 데이터 호출 실패:", err);
            })
            .finally(() => {
                setIsRankingLoading(false);
            });
    }, [selectedYear, selectedLimit]);

    // 타자/투수 탭 변경 시 기본 스탯 선택 및 페이지 초기화
    const handleRankingTypeChange = (type) => {
        setRankingType(type);
        setCurrentPage(1);
        if (type === "HITTER") {
            setSelectedStat("hitterHra");
        } else {
            setSelectedStat("pitcherEra");
        }
    };

    // 세부 부문 변경 시 페이지 1로 리셋
    const handleStatChange = (statKey) => {
        setSelectedStat(statKey);
        setCurrentPage(1);
    };

    // 연도 변경 핸들러
    const handleYearChange = (e) => {
        setSelectedYear(Number(e.target.value));
        setCurrentPage(1);
    };

    // 불러올 인원수 변경 핸들러
    const handleLimitChange = (e) => {
        setSelectedLimit(Number(e.target.value));
        setCurrentPage(1);
    };

    const clickSearchBtn = () => {
        const trimmed = query.trim();
        if (!trimmed) {
            setHasSearched(false);
            setData([]);
            return;
        }
        setIsSearching(true);
        setHasSearched(true);
        axios
            .get(`https://trees-dans-collectible-strategy.trycloudflare.com/api/playerSearch?query=${encodeURIComponent(trimmed)}`)
            .then((res) => {
                setData(res.data || []);
            })
            .catch((err) => {
                console.error(err);
                setData([]);
            })
            .finally(() => {
                setIsSearching(false);
            });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            clickSearchBtn();
        }
    };

    const handleClearQuery = () => {
        setQuery("");
        setHasSearched(false);
        setData([]);
    };

    function getTeamName(teamName, teamID) {
        switch (teamName) {
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
            case "고양": return "고양 원더스";
            default: return teamName || teamID || "";
        }
    }

    // 프로필 이미지 URL 생성: 2017년 이후는 선택한 연도, 2016년 이전은 2017년 고정
    const getProfileImgUrl = (playerId, year) => {
        const targetYear = Number(year) >= 2017 ? year : 2017;
        return `https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/${targetYear}/${playerId}.jpg`;
    };

    // 이미지 로드 실패 시 fallback 처리
    const handleImgError = (e, pId, year) => {
        const currentSrc = e.target.src;
        // 선택한 연도가 2017년보다 큰데 해당 연도 이미지가 없을 경우 2017년으로 재시도
        if (year && Number(year) > 2017 && currentSrc.includes(`/${year}/`)) {
            e.target.src = `https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/2017/${pId}.jpg`;
        } else {
            e.target.src = "https://www.koreabaseball.com/file/image/bg/no_buddy.png";
        }
    };

    // 현재 선택된 부문의 상위 전체 선수 목록 추출
    const getCurrentRankingList = () => {
        const currentGroup = rankingType === "HITTER" ? rankingData.hitters : rankingData.pitchers;
        const found = currentGroup.find((item) => item.type === selectedStat);
        return found?.rankings || [];
    };

    // 주요 지표 수치 포맷터
    const formatStatValue = (val, statKey) => {
        if (val === undefined || val === null || val === "") return "-";
        const num = Number(val);
        if (isNaN(num)) return val;

        const allCats = [...HITTER_CATEGORIES, ...PITCHER_CATEGORIES];
        const config = allCats.find((c) => c.key === statKey);

        if (config?.isDecimal) {
            return num.toFixed(config.digits);
        }
        return config?.unit ? `${num}${config.unit}` : `${num}`;
    };

    const currentRankingList = getCurrentRankingList();
    const activeCategories = rankingType === "HITTER" ? HITTER_CATEGORIES : PITCHER_CATEGORIES;
    const currentCategoryInfo = activeCategories.find((c) => c.key === selectedStat);

    // 50명 단위 페이지네이션 계산
    const totalPages = Math.ceil(currentRankingList.length / PAGE_SIZE) || 1;
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const displayedPlayers = currentRankingList.slice(startIndex, endIndex);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-100 pb-16">
            {/* 상단 네비게이션 */}
            <div className="max-w-6xl mx-auto px-4 pt-6 flex items-center justify-between">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/90 text-white rounded-xl shadow-lg hover:bg-blue-500 transition duration-200 font-medium text-sm border border-blue-400/20"
                >
                    <span>⬅</span> 메인 화면으로
                </Link>
                <div className="text-xs text-gray-400 font-medium">
                    KBO 리그 실시간 선수 정보
                </div>
            </div>

            {/* 검색 헤더 영역 */}
            <div className="max-w-4xl mx-auto px-4 mt-8">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                        🔍 KBO 선수 검색
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        선수 이름을 검색하거나 시즌별 순위와 기록을 확인하세요.
                    </p>
                </div>

                {/* 검색창 */}
                <div className="relative flex items-center bg-gray-900/90 border border-gray-700/80 rounded-2xl p-1.5 shadow-2xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all backdrop-blur-sm">
                    <input
                        className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-500 outline-none text-base font-normal"
                        placeholder="선수 이름을 입력하세요 (예: 레이예스, 곽빈, 구자욱...)"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            if (e.target.value === "") {
                                setHasSearched(false);
                                setData([]);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                    />
                    {query && (
                        <button
                            onClick={handleClearQuery}
                            className="mr-2 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition"
                            title="검색어 지우기"
                        >
                            ✕
                        </button>
                    )}
                    <button
                        className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-6 py-3 rounded-xl font-semibold transition shadow-md flex items-center gap-2 flex-shrink-0"
                        onClick={clickSearchBtn}
                        disabled={isSearching}
                    >
                        {isSearching ? (
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            "검색"
                        )}
                    </button>
                </div>
            </div>

            {/* 메인 컨텐츠 영역 */}
            <div className="max-w-5xl mx-auto px-4 mt-10">
                {/* 1. 검색어가 있고 검색을 실행한 경우: 검색 결과 리스트 */}
                {hasSearched ? (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span>🎯</span> 검색 결과 <span className="text-blue-400">({data.length})</span>
                            </h2>
                            <button
                                onClick={handleClearQuery}
                                className="text-xs text-gray-400 hover:text-blue-400 underline transition"
                            >
                                순위 표로 돌아가기
                            </button>
                        </div>

                        {data.length === 0 ? (
                            <div className="text-center py-16 bg-gray-900/40 rounded-2xl border border-gray-800">
                                <p className="text-lg text-gray-400">"{query}"에 대한 검색 결과가 없습니다.</p>
                                <p className="text-sm text-gray-500 mt-1">선수 이름이 올바른지 다시 확인해주세요.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.map((player, idx) => {
                                    const activeYear = player.activeYear || "2026";
                                    const profileImgUrl = `https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/${activeYear}/${player.pId}.jpg`;

                                    const teamKey = player.team;
                                    const teamStyle = teamData[teamKey] || { mainColor: "[#1f2937]", subColor: "[#4b5563]" };

                                    const pureMainColor = teamStyle.mainColor.replace(/[[\]]/g, "");
                                    const pureSubColor = teamStyle.subColor.replace(/[[\]]/g, "");

                                    return (
                                        <Link
                                            to={`/playerData/${player.pId}`}
                                            key={idx}
                                            className="group block overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative"
                                            style={{
                                                background: `linear-gradient(135deg, ${pureMainColor}cc, #0c1017)`,
                                                borderColor: pureSubColor,
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    {/* 프로필 이미지 */}
                                                    <div
                                                        className="w-20 h-20 rounded-2xl overflow-hidden border-2 bg-slate-900/60 flex-shrink-0 shadow-md group-hover:border-blue-400 transition"
                                                        style={{ borderColor: pureSubColor }}
                                                    >
                                                        <img
                                                            src={profileImgUrl}
                                                            alt={player.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => handleImgError(e, player.pId, activeYear)}
                                                        />
                                                    </div>

                                                    {/* 선수 정보 */}
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-xl font-bold text-white group-hover:text-blue-300 transition">
                                                                {player.name}
                                                            </span>
                                                            {player.backNo && (
                                                                <span className="text-xs font-semibold text-gray-300 px-1.5 py-0.5 rounded bg-black/40">
                                                                    No.{player.backNo}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <span className="text-xs text-gray-300 font-medium">
                                                            {player.position} {player.hand ? `(${player.hand})` : ""}
                                                        </span>

                                                        {/* 소속팀 뱃지 */}
                                                        <div className="mt-1">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white rounded-full bg-black/50 border border-white/10">
                                                                {teamStyle.icon && (
                                                                    <img src={teamStyle.icon} alt="" className="w-3.5 h-3.5 object-contain" />
                                                                )}
                                                                {getTeamName(player.team, player.teamID)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 우측 배경 디자인 요소 */}
                                                {teamStyle.icon && (
                                                    <div className="w-16 h-16 opacity-10 pointer-events-none select-none hidden sm:block group-hover:opacity-20 transition">
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
                ) : (
                    /* 2. 검색창이 비어있을 때: 타자 및 투수 부문별 순위 표 */
                    <div className="space-y-6">
                        {/* 상단 순위 컨트롤 바 (타자/투수 토글, 연도 선택, 인원수 선택) */}
                        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-800 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <span>🏆</span> KBO 부문별 선수 순위
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {selectedYear}시즌 기록 (선수명을 클릭하면 상세 페이지로 이동합니다)
                                </p>
                            </div>

                            <div className="flex items-center flex-wrap gap-3">
                                {/* 연도 선택 셀렉트 박스 */}
                                <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-1.5">
                                    <span className="text-xs text-gray-400 font-medium">시즌:</span>
                                    <select
                                        value={selectedYear}
                                        onChange={handleYearChange}
                                        className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer pr-1"
                                    >
                                        {YEARS.map((y) => (
                                            <option key={y} value={y} className="bg-gray-900 text-white">
                                                {y}년
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 불러올 인원수 셀렉트 박스 */}
                                <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-1.5">
                                    <span className="text-xs text-gray-400 font-medium">조회:</span>
                                    <select
                                        value={selectedLimit}
                                        onChange={handleLimitChange}
                                        className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer pr-1"
                                    >
                                        {LIMIT_OPTIONS.map((lim) => (
                                            <option key={lim} value={lim} className="bg-gray-900 text-white">
                                                {lim}명
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 타자 / 투수 대분류 토글 */}
                                <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl">
                                    <button
                                        onClick={() => handleRankingTypeChange("HITTER")}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition duration-200 flex items-center gap-1.5 ${rankingType === "HITTER"
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        <span>🏏</span> 타자
                                    </button>
                                    <button
                                        onClick={() => handleRankingTypeChange("PITCHER")}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition duration-200 flex items-center gap-1.5 ${rankingType === "PITCHER"
                                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        <span>⚾</span> 투수
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 서브 부문 선택 뱃지 탭 */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {activeCategories.map((cat) => {
                                const isSelected = selectedStat === cat.key;
                                return (
                                    <button
                                        key={cat.key}
                                        onClick={() => handleStatChange(cat.key)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${isSelected
                                            ? rankingType === "HITTER"
                                                ? "bg-blue-600/20 text-blue-400 border-blue-500 shadow-sm"
                                                : "bg-emerald-600/20 text-emerald-400 border-emerald-500 shadow-sm"
                                            : "bg-gray-900/60 text-gray-400 border-gray-800 hover:border-gray-700 hover:text-gray-200"
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* 순위 테이블 카드 */}
                        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
                            {isRankingLoading ? (
                                <div className="text-center py-20">
                                    <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                    <p className="text-gray-400 text-sm">
                                        {selectedYear}년 선수 순위를 불러오는 중입니다...
                                    </p>
                                </div>
                            ) : currentRankingList.length === 0 ? (
                                <div className="text-center py-16 text-gray-400">
                                    {selectedYear}년 해당 부문의 순위 데이터가 없습니다.
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-800 bg-gray-900/90 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                    <th className="py-4 px-4 text-center w-16">순위</th>
                                                    <th className="py-4 px-4">선수</th>
                                                    <th className="py-4 px-4 text-center">팀</th>
                                                    <th className="py-4 px-4 text-right">
                                                        <span className={`px-2 py-1 rounded font-bold ${rankingType === "HITTER"
                                                            ? "bg-blue-500/20 text-blue-300"
                                                            : "bg-emerald-500/20 text-emerald-300"
                                                            }`}>
                                                            {currentCategoryInfo?.label || "기록"}
                                                        </span>
                                                    </th>
                                                    {rankingType === "HITTER" ? (
                                                        <>
                                                            <th className="py-4 px-4 text-center hidden sm:table-cell">경기</th>
                                                            <th className="py-4 px-4 text-center hidden sm:table-cell">안타</th>
                                                            <th className="py-4 px-4 text-center hidden md:table-cell">홈런</th>
                                                            <th className="py-4 px-4 text-center hidden md:table-cell">타점</th>
                                                            <th className="py-4 px-4 text-center hidden lg:table-cell">OPS</th>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <th className="py-4 px-4 text-center hidden sm:table-cell">경기</th>
                                                            <th className="py-4 px-4 text-center hidden sm:table-cell">이닝</th>
                                                            <th className="py-4 px-4 text-center hidden md:table-cell">승/패</th>
                                                            <th className="py-4 px-4 text-center hidden md:table-cell">탈삼진</th>
                                                            <th className="py-4 px-4 text-center hidden lg:table-cell">ERA</th>
                                                        </>
                                                    )}
                                                    <th className="py-4 px-4 text-center w-20">상세</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800/60 text-sm">
                                                {displayedPlayers.map((player, idx) => {
                                                    const absoluteIndex = startIndex + idx;
                                                    const rankNum = player.ranking || absoluteIndex + 1;
                                                    const teamKey = player.teamShortName || player.teamName;
                                                    const teamStyle = teamData[teamKey] || {
                                                        mainColor: "[#1f2937]",
                                                        subColor: "[#4b5563]",
                                                    };

                                                    const pureSubColor = teamStyle.subColor.replace(/[[\]]/g, "");

                                                    // 1, 2, 3위 메달 뱃지 스타일
                                                    let rankBadge = (
                                                        <span className="text-gray-400 font-semibold text-sm">
                                                            {rankNum}
                                                        </span>
                                                    );
                                                    if (rankNum === 1) {
                                                        rankBadge = (
                                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 text-black font-black text-xs shadow-md shadow-yellow-500/30">
                                                                1
                                                            </span>
                                                        );
                                                    } else if (rankNum === 2) {
                                                        rankBadge = (
                                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-slate-400 to-gray-200 text-black font-black text-xs shadow-md shadow-gray-400/30">
                                                                2
                                                            </span>
                                                        );
                                                    } else if (rankNum === 3) {
                                                        rankBadge = (
                                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-amber-800 to-amber-600 text-white font-black text-xs shadow-md shadow-amber-700/30">
                                                                3
                                                            </span>
                                                        );
                                                    }

                                                    const mainStatValue = player[selectedStat];
                                                    // 2017년 이후는 선택한 연도, 2016년 이전은 2017년 고정
                                                    const profileImg = getProfileImgUrl(player.playerId, selectedYear);

                                                    return (
                                                        <tr
                                                            key={player.playerId || absoluteIndex}
                                                            className="hover:bg-gray-800/50 transition duration-150 group"
                                                        >
                                                            {/* 순위 */}
                                                            <td className="py-3.5 px-4 text-center">
                                                                {rankBadge}
                                                            </td>

                                                            {/* 선수 프로필 + 이름 */}
                                                            <td className="py-3.5 px-4">
                                                                <Link
                                                                    to={`/playerData/${player.playerId}`}
                                                                    className="flex items-center gap-3 group-hover:text-blue-400 transition"
                                                                >
                                                                    <div
                                                                        className="w-11 h-11 rounded-full overflow-hidden border bg-slate-900 flex-shrink-0 shadow-sm"
                                                                        style={{ borderColor: pureSubColor }}
                                                                    >
                                                                        <img
                                                                            src={profileImg}
                                                                            alt={player.playerName}
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => handleImgError(e, player.playerId, selectedYear)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-white group-hover:text-blue-300 transition flex items-center gap-1.5">
                                                                            <span>{player.playerName}</span>
                                                                            {player.backNumber && (
                                                                                <span className="text-xs text-gray-400 font-normal">
                                                                                    #{player.backNumber}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-xs text-gray-400">
                                                                            {player.position || (rankingType === "HITTER" ? "타자" : "투수")}
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            </td>

                                                            {/* 팀 */}
                                                            <td className="py-3.5 px-4 text-center">
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-800/90 text-gray-200 border border-gray-700/60">
                                                                    {teamStyle.icon && (
                                                                        <img
                                                                            src={teamStyle.icon}
                                                                            alt=""
                                                                            className="w-3.5 h-3.5 object-contain"
                                                                        />
                                                                    )}
                                                                    {player.teamShortName || player.teamName}
                                                                </span>
                                                            </td>

                                                            {/* 주요 기록 수치 */}
                                                            <td className="py-3.5 px-4 text-right">
                                                                <span className={`text-base font-extrabold ${rankingType === "HITTER" ? "text-blue-400" : "text-emerald-400"
                                                                    }`}>
                                                                    {formatStatValue(mainStatValue, selectedStat)}
                                                                </span>
                                                            </td>

                                                            {/* 보조 기록 컬럼 */}
                                                            {rankingType === "HITTER" ? (
                                                                <>
                                                                    <td className="py-3.5 px-4 text-center text-gray-300 hidden sm:table-cell">
                                                                        {player.hitterGameCount ?? "-"}
                                                                    </td>
                                                                    <td className="py-3.5 px-4 text-center text-gray-300 hidden sm:table-cell">
                                                                        {player.hitterHit ?? "-"}
                                                                    </td>
                                                                    <td className="py-3.5 px-4 text-center text-gray-300 hidden md:table-cell">
                                                                        {player.hitterHr ?? "-"}
                                                                    </td>
                                                                    <td className="py-3.5 px-4 text-center text-gray-300 hidden md:table-cell">
                                                                        {player.hitterRbi ?? "-"}
                                                                    </td>
                                                                    <td className="py-3.5 px-4 text-center text-gray-300 hidden lg:table-cell">
                                                                        {player.hitterOps !== undefined ? Number(player.hitterOps).toFixed(3) : "-"}
                                                                    </td>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <td className="py-3.5 px-4 text-center text-gray-300 hidden sm:table-cell">
                                                                        {player.pitcherGameCount ?? "-"}
                                                                    </td>
                                                                    <td className="py-3.5 px-4 text-center text-gray-300 hidden sm:table-cell">
                                                                        {player.pitcherInning ?? "-"}
                                                                    </td>
                                                                    <td className="py-3.5 px-4 text-center text-gray-300 hidden md:table-cell">
                                                                        {player.pitcherWin ?? 0}승 {player.pitcherLose ?? 0}패
                                                                    </td>
                                                                    <td className="py-3.5 px-4 text-center text-gray-300 hidden md:table-cell">
                                                                        {player.pitcherKk ?? "-"}
                                                                    </td>
                                                                    <td className="py-3.5 px-4 text-center text-gray-300 hidden lg:table-cell">
                                                                        {player.pitcherEra !== undefined ? Number(player.pitcherEra).toFixed(2) : "-"}
                                                                    </td>
                                                                </>
                                                            )}

                                                            {/* 상세 이동 버튼 */}
                                                            <td className="py-3.5 px-4 text-center">
                                                                <Link
                                                                    to={`/playerData/${player.playerId}`}
                                                                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white transition duration-150 text-xs font-semibold"
                                                                    title="상세 기록 보기"
                                                                >
                                                                    ➔
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* 페이지네이션 및 인원 표시 바 (50명 단위) */}
                                    <div className="flex items-center justify-between flex-wrap gap-4 px-6 py-4 border-t border-gray-800/80 bg-gray-900/40 text-xs text-gray-400">
                                        <div>
                                            총 <span className="text-white font-semibold">{currentRankingList.length}</span>명 중{" "}
                                            <span className="text-white font-semibold">{startIndex + 1}</span> -{" "}
                                            <span className="text-white font-semibold">{Math.min(endIndex, currentRankingList.length)}</span>명 표시
                                        </div>

                                        {totalPages > 1 && (
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition"
                                                >
                                                    이전
                                                </button>

                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`w-7 h-7 rounded-lg font-bold transition ${currentPage === pageNum
                                                            ? "bg-blue-600 text-white shadow"
                                                            : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                ))}

                                                <button
                                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition"
                                                >
                                                    다음
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}