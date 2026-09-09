import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { GAME_VIDEO_MAP as LOCAL_FALLBACK_MAP } from "../pages/videoMap";

const CACHE_KEY = "kbo_video_map_cache";
const CACHE_TIME_KEY = "kbo_video_map_cache_time";
const CACHE_EXPIRE_MS = 6 * 60 * 60 * 1000; // 6시간 동안은 캐시 유지하여 불필요한 API 호출 방지

// 메모리 캐시
let memoryMap = null;

/**
 * 중계 비디오 맵을 가져옵니다.
 * @param {boolean} forceRefresh - 사용자가 새로고침 버튼을 눌렀을 때만 true로 전달하여 서버에서 1회 갱신
 */
export async function fetchVideoMap(forceRefresh = false) {
  // 1. 강제 새로고침이 아니고 메모리에 있으면 메모리 값 반환
  if (!forceRefresh && memoryMap) {
    return memoryMap;
  }

  // 2. 강제 새로고침이 아니면 LocalStorage 캐시 확인
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      if (cached && cachedTime && (Date.now() - Number(cachedTime) < CACHE_EXPIRE_MS)) {
        memoryMap = JSON.parse(cached);
        return memoryMap;
      }
    } catch (e) {
      console.warn("로컬 캐시 읽기 실패:", e);
    }
  }

  // 3. 서버에서 1회 갱신 (강제 새로고침이거나 캐시 만료 시)
  try {
    const res = await axios.get(`${API_BASE_URL}/api/videoMap`, { timeout: 4000 });
    if (res.data && res.data.result) {
      memoryMap = { ...LOCAL_FALLBACK_MAP, ...res.data.result };
      localStorage.setItem(CACHE_KEY, JSON.stringify(memoryMap));
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
      return memoryMap;
    }
  } catch (err) {
    console.warn("videoMap API 조회 실패(오프라인 등), 로컬 폴백 사용:", err.message);
  }

  // 4. 실패 시 로컬 기본값
  memoryMap = LOCAL_FALLBACK_MAP;
  return memoryMap;
}

/**
 * gameId로 비디오 URL을 동기/즉시 조회
 */
export function getVideoUrlSync(gameId) {
  if (memoryMap && memoryMap[gameId]) {
    return memoryMap[gameId];
  }
  // 메모리에 없으면 로컬스토리지 시도
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed[gameId]) return parsed[gameId];
    }
  } catch (e) {}
  return LOCAL_FALLBACK_MAP[gameId] || null;
}
