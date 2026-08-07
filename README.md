# ⚾ KBO 프로야구 실시간 정보 & 문자중계 (KBO Info)

> KBO 리그의 실시간 문자중계, 경기 스케줄, 스코어보드, 라인업 및 중계 영상을 한눈에 확인할 수 있는 웹/모바일 애플리케이션입니다.

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)

---

## 📌 1. 프로젝트 간략 정보 (Overview)

* **서비스 URL:** [https://kbo-info.vercel.app](https://kbo-info.vercel.app)
* **백엔드 API Server:** [https://kbo-info.onrender.com](https://kbo-info.onrender.com)
* **주요 타겟:** KBO 야구 팬 및 실시간 경기 정보/문자중계를 빠르게 확인하고자 하는 유저
* **기술 스택:**
  * **Frontend:** React, React Router, Tailwind CSS, Axios
  * **Backend:** Node.js, Express (REST API 데이터 정제 및 파싱)
  * **App Packaging:** Capacitor (iOS / Android)
  * **Deployment:** Vercel (Front-end), Render (Back-end)

---

## 🧭 2. 프로젝트 설명 및 청사진 (Description & Blueprint)

### 💡 기획 의도 및 핵심 기능
기존 야구 앱들의 복잡한 UI에서 벗어나, **직관적이고 빠르게 경기 상황을 파악**할 수 있도록 설계된 서비스입니다.

1. **실시간 KBO 문자중계 & 스트리밍 비디오**
   * SOOP 비디오 라이브 중계 화면 연동
   * 화면 스크롤 시에도 비디오 및 상단 컨트롤러가 고정되는 **Sticky Header UI** 적용
   * 실시간 자동 스크롤 및 회차별 선택 조회 기능
2. **상세 스코어보드 & 팀/선수 정보**
   * 이닝별 득점, 안타(H), 에러(E), 사사구(B) 실시간 스코어보드
   * 팀별 시그니처 컬러 및 Statiz CI 연동
   * 국대 ID 변환, 해외 진출/은퇴 선수 연도 매핑 알고리즘 기반의 정확한 선수 프로필 이미지 제공
3. **모바일 앱 크로스 플랫폼 지원**
   * Capacitor를 활용하여 웹(Web)뿐만 아니라 iOS/Android 네이티브 앱 환경 지원

### 🚀 향후 발전 계획 (Roadmap)
- [ ] **푸시 알림 (Push Notification):** 응원 팀 경기 시작, 점수 변동, 경기 종료 실시간 알림
- [ ] **백그라운드 응원가 플레이어:** Native Audio 모듈을 활용한 화면 꺼짐 시 구단/선수 응원가 백그라운드 재생
- [ ] **AI 승부 예측 모델 연동:** 팀간 상대 전적 및 최근 기세를 바탕으로 한 경기 승률 예측 모델 도입

---

## 💻 3. 기능 소개 및 특장점

---

### ⚾ 1. 팀 특화 대시보드형 메인 페이지

![메인 화면](https://github.com/Civa030203/KBO-Info/blob/main/kbo-rankings/main_screen.png?raw=true)

> 메인 화면에서 자신의 응원팀을 탭하면, 이후 6일간의 해당 팀의 앞으로 있을 경기의 상대 팀, 현재 팀의 순위와 전적 등을 빠르게 확인해보실 수 있습니다.

---

### 📊 2. 간단하지만 단순하지는 않은, 팀 순위표 페이지

![팀 순위표](https://github.com/Civa030203/KBO-Info/blob/main/kbo-rankings/rank_screen.png?raw=true)

> 치열한 KBO 리그의 순위 경쟁, 한 눈에 확인해보세요. 지난 시즌들의 데이터 역시 확인할 수 있답니다.  
> 연도가 바뀔 때마다 그 당시의 팀 로고로 바뀌는 깨알같은 디테일은 서비스랍니다 😉

---

### 📅 3. 각 팀의 상징색에 맞춘 깔끔한 일정 페이지

![일정 페이지](https://github.com/Civa030203/KBO-Info/blob/main/kbo-rankings/schedule_screen.png?raw=true)

> 오늘은 어느 팀과 어느 팀의 경기가 있을까요? 맞붙는 두 팀의 상징색을 적절히 섞은 그라데이션 색상은 보는 눈을 즐겁게 하죠.  
> 좋아하는 팀의 경기 중계로 바로 넘어가보세요. 진행 예정 (경기 시작 20분 전), 진행 중이거나 종료된 경기의 경우 곧바로 중계 페이지로 건너갈 수 있답니다.

---

### 🧢 4. 2군 경기 또한 놓치지 않고 챙겨볼 수 있습니다

![2군 경기 일정](https://github.com/Civa030203/KBO-Info/blob/main/kbo-rankings/schedule_futures_screen.png?raw=true)

> 오늘 우리 팀의 미래는 어떤 경기를 했을까요? 2군 경기 비록 영상 중계는 없지만, KBO 공식 문자 중계로 만나볼 수 있어요. 1군에 없는 팀이라고 소홀히 코딩하지 않았습니다. 고양 히어로즈, 상무 피닉스, 울산 웨일즈 역시 1군에 있는 모든 팀과 동일하게 그라데이션 색이 적용돼요.

---

### 📺 5. 지난 경기는 물론, 실시간으로 진행되는 경기까지

![실시간 중계](https://github.com/Civa030203/KBO-Info/blob/main/kbo-rankings/relay_screen.png?raw=true)

> 문자 중계와 실시간 중계를 동시에 즐기고 싶지 않은가요? 깔끔한 UI로 대접해드리겠습니다. 문자 중계를 스크롤해도 영상 중계는 상단에 고정되고, 실시간으로 업데이트되는 문자 중계는 물론 오늘 경기의 양 팀 선발 라인업도 확인할 수 있어요. 김대한은 터진다.

---

### 🔍 6. 선수의 데이터를 검색하고 싶다면, 찾아보면 됩니다

| 선수 검색 화면 | 선수 상세 데이터 화면 |
| :---: | :---: |
| ![선수 검색](https://github.com/Civa030203/KBO-Info/blob/main/kbo-rankings/player_search_screen.png?raw=true) | ![선수 데이터](https://github.com/Civa030203/KBO-Info/blob/main/kbo-rankings/player_data_screen.png?raw=true) |

> KBO 데이터베이스에 등록되어 있는 모든 선수를 다 찾아볼 수 있습니다. 좋아하는 선수를 검색해서 시즌별 데이터까지 확인해보세요. 연도가 변할 때마다 변하는 선수들의 사진이 세월을 실감하게 하네요.  
> *(2017시즌 이후만 프로필 사진 제공. 이전의 경우 2017시즌 프로필로 고정)*

---
## 📝 4. 업데이트 내역 (Changelog)

---

### 🚀 v1.3.0
<!-- * **모바일 앱 지원:** Capacitor 패키징 적용 (iOS 및 Android 크롤링/웹뷰 환경 대응) -->
* **문자중계 UI 개선:** 스크롤 시 비디오 및 상단 컨트롤 바가 깔끔하게 고정되는 Sticky 헤더 레이아웃 구현
* **Tailwind CSS 반응형 보정:** 모바일/PC 화면 크기에 따른 요소 노출(`hidden md:inline-block`) 최적화

---

### ⚡ v1.2.0
* **백엔드 API 최적화:** 기존 Cheerio 기반 HTML 크롤링 구조를 KBO JSON API 직접 파싱 방식으로 전면 개편하여 파싱 속도 및 데이터 정확도 향상
* **선수 프로필 매핑 보정:** 국가대표 ID 및 해외 진출/은퇴 선수 연도별 프로필 이미지 매핑 예외 처리 추가

---

### 🎨 v1.1.0
* **라인업 & 스코어보드 연동:** 경기 전 선발 라인업 및 실시간 스코어보드 UI 구현
* **팀별 브랜딩:** 각 구단별 메인 컬러 및 Statiz CI 로고 자동 적용

---

### 🎉 v1.0.0
* 프로젝트 최초 오픈 (React 기반 KBO 경기 일정 및 실시간 문자중계 서비스)