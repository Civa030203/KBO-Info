import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

const NOTIF_STORAGE_KEY = "kbo_team_notification_enabled";

/**
 * 알림 설정 여부 확인
 */
export function isNotificationEnabled() {
  return localStorage.getItem(NOTIF_STORAGE_KEY) === "true";
}

/**
 * 알림 설정 변경
 */
export function setNotificationEnabled(enabled) {
  localStorage.setItem(NOTIF_STORAGE_KEY, enabled ? "true" : "false");
}

/**
 * iOS / 브라우저 알림 권한 요청
 */
export async function requestNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display !== "granted") {
        const req = await LocalNotifications.requestPermissions();
        return req.display === "granted";
      }
      return true;
    } catch (err) {
      console.warn("로컬 알림 권한 확인 실패:", err);
      return false;
    }
  } else if ("Notification" in window) {
    const perm = await Notification.requestPermission();
    return perm === "granted";
  }
  return false;
}

/**
 * 즉시 알림 발송 (점수 변동, 경기 종료 등)
 */
export async function sendInstantNotification({ title, body, id = Date.now() % 100000 }) {
  if (!isNotificationEnabled()) return;

  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: { at: new Date(Date.now() + 500) }, // 0.5초 후 즉시 발송
            sound: "default",
          },
        ],
      });
    } catch (err) {
      console.warn("로컬 알림 발송 실패:", err);
    }
  } else if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/logo192.png" });
  }
}

/**
 * 💡 [API 사용량 0회] 경기 시작 시간 10분 전 및 정시 알림 예약
 * - 추가적인 서버 API 호출 없이, 이미 조회된 경기 시간(예: "18:30")을 기준으로 미래 알림을 등록합니다.
 */
export async function scheduleGameStartNotifications(todayGame, selectedTeam) {
  if (!isNotificationEnabled() || !todayGame || todayGame.noGame || !selectedTeam) {
    return;
  }

  // 오늘 날짜 및 경기 시간 파싱
  const now = new Date();
  let gameDate = null;

  // todayGame.gameTime (예: "18:30")
  if (todayGame.gameTime && todayGame.gameTime.includes(":")) {
    const [hours, minutes] = todayGame.gameTime.split(":").map(Number);
    gameDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  } else {
    // 기본 경기 시간 18:30 가정 (주말은 14:00 또는 17:00일 수 있음)
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    gameDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), isWeekend ? 14 : 18, isWeekend ? 0 : 30, 0);
  }

  // 이미 경기가 지난 시간이면 예약하지 않음
  if (gameDate.getTime() <= now.getTime()) {
    return;
  }

  const opponent = todayGame.opponent || "상대팀";
  const stadium = todayGame.stadium ? ` (${todayGame.stadium})` : "";

  if (Capacitor.isNativePlatform()) {
    try {
      const notifications = [];

      // 1. 경기 10분 전 알림
      const tenMinutesBefore = new Date(gameDate.getTime() - 10 * 60 * 1000);
      if (tenMinutesBefore.getTime() > now.getTime()) {
        notifications.push({
          title: `⚾ [${selectedTeam}] 경기 시작 10분 전!`,
          body: `오늘 ${selectedTeam} vs ${opponent} 경기가 곧 시작됩니다!${stadium}`,
          id: 1001,
          schedule: { at: tenMinutesBefore },
          sound: "default",
        });
      }

      // 2. 경기 시작 정시 알림
      notifications.push({
        title: `⚾ [${selectedTeam}] 플레이볼! 경기 시작`,
        body: `${selectedTeam} vs ${opponent} 경기가 시작되었습니다! 지금 중계를 확인해 보세요.`,
        id: 1002,
        schedule: { at: gameDate },
        sound: "default",
      });

      // 기존 경기 시작 알림 취소 후 새로 등록
      await LocalNotifications.cancel({ notifications: [{ id: 1001 }, { id: 1002 }] });
      await LocalNotifications.schedule({ notifications });
      console.log(`✅ [${selectedTeam}] 경기 시작 알림 예약 완료:`, gameDate.toLocaleTimeString());
    } catch (err) {
      console.warn("경기 시작 알림 예약 실패:", err);
    }
  }
}
