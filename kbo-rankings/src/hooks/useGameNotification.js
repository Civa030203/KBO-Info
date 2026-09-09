import { useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import {
  isNotificationEnabled,
  scheduleGameStartNotifications,
  sendInstantNotification,
} from "../services/notificationService";

/**
 * 💡 백엔드 API 절약형 Favorite 팀 경기 모니터링 훅
 * - 경기 시작 알림: 추가 API 호출 없이 1회 로컬 예약
 * - 점수 변동 알림: 경기가 실제로 '진행 중(gameState 2)'일 때만 3분 간격으로 최소 확인
 */
export function useGameNotification(selectedTeam, todayGame) {
  const lastScoreRef = useRef(null);
  const hasNotifiedEndRef = useRef(false);

  // 1. 경기 시작 시간 알림 예약 (API 호출 0회)
  useEffect(() => {
    if (!selectedTeam || !todayGame) return;
    if (isNotificationEnabled()) {
      scheduleGameStartNotifications(todayGame, selectedTeam);
    }
  }, [selectedTeam, todayGame]);

  // 2. 경기 진행 중일 때만 점수 변동 감지 (최소 주기 폴링: 3분)
  useEffect(() => {
    if (!selectedTeam || !todayGame || !isNotificationEnabled()) return;
    // 경기가 없거나, 취소되었거나, 아직 시작 전이거나, 이미 종료된 경우 폴링 차단!
    if (todayGame.noGame || todayGame.gameState !== "2") {
      return;
    }

    const checkScore = async () => {
      try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}${mm}${dd}`;

        const res = await axios.get(`${API_BASE_URL}/api/schedule?date=${dateStr}&leId=1`, {
          timeout: 4000,
        });

        const games = res.data || [];
        const myGame = games.find(
          (g) => g.awayTeamName === selectedTeam || g.homeTeamName === selectedTeam
        );

        if (!myGame) return;

        const currentScore = `${myGame.awayScore} : ${myGame.homeScore}`;

        // 점수가 변동되었을 때 알림 발송
        if (lastScoreRef.current && lastScoreRef.current !== currentScore) {
          sendInstantNotification({
            title: `⚾ [${selectedTeam}] 점수 변동!`,
            body: `${myGame.awayTeamName} ${myGame.awayScore} : ${myGame.homeScore} ${myGame.homeTeamName} (${myGame.gameMaxInn || ""}회)`,
          });
        }
        lastScoreRef.current = currentScore;

        // 경기 종료 감지 (gameState 3)
        if (myGame.gameState === "3" && !hasNotifiedEndRef.current) {
          hasNotifiedEndRef.current = true;
          sendInstantNotification({
            title: `⚾ [${selectedTeam}] 경기 종료!`,
            body: `최종 스코어 ${myGame.awayTeamName} ${myGame.awayScore} : ${myGame.homeScore} ${myGame.homeTeamName}`,
          });
        }
      } catch (err) {
        console.warn("스코어 확인 중 오류 (재시도 대기):", err.message);
      }
    };

    // 3분(180,000ms) 주기로 API 호출 한도 극소화
    const interval = setInterval(checkScore, 180000);
    return () => clearInterval(interval);
  }, [selectedTeam, todayGame]);
}
