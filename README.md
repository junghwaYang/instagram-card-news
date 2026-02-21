# Instagram Card News Generator

Claude Code에 **한 줄만 입력**하면 Instagram 카드뉴스가 자동으로 만들어집니다.

```
카드뉴스 만들어줘: AI 트렌드 2025
```

리서치 → 팩트체크 → 카피 토론(Team 모드) → 렌더링 → 시각 검토까지 전체 파이프라인이 자동 실행됩니다.

**출력**: `output/` 디렉토리에 1080x1350px PNG 이미지 (Instagram 세로형)

---

## 시작하기

### 방법 1: 기존 프로젝트 클론

```bash
git clone https://github.com/junghwaYang/instagram-card-news.git
cd instagram-card-news
npm install
```

Claude Code를 실행하고 카드뉴스를 요청하세요:

```bash
claude
```

```
카드뉴스 만들어줘: 2025 디지털 마케팅 트렌드
```

### 방법 2: 빈 폴더에서 스킬로 세팅

Claude Code 스킬을 설치하면 빈 폴더에서 프로젝트 전체를 자동 생성할 수 있습니다.

**스킬 설치 (택 1)**:

```bash
# curl
curl -sSL https://raw.githubusercontent.com/junghwaYang/card-news-setup/main/install.sh | bash

# 또는 수동
mkdir -p ~/.claude/skills/card-news-setup
curl -sSL https://raw.githubusercontent.com/junghwaYang/card-news-setup/main/SKILL.md \
  -o ~/.claude/skills/card-news-setup/SKILL.md
```

**사용법**:

```bash
mkdir my-card-news && cd my-card-news
claude
```

```
/card-news-setup
```

스킬이 프로젝트 구조, 템플릿, 스크립트, CLAUDE.md를 모두 생성합니다.

---

## 사용 예시

```
카드뉴스 만들어줘: AI 트렌드 2025
```
```
볼드 스타일로 "성공하는 아침 루틴" 카드뉴스 5장
```
```
"ChatGPT 활용법" 카드뉴스, 엘레건트, 10장, 악센트 #FF6B6B
```
```
미니멀 스타일로 투자 기초 지식 카드뉴스, @finance_tips 계정
```

### 파라미터

| 파라미터 | 기본값 | 설명 |
|---|---|---|
| 주제 | (필수) | 카드뉴스 주제 |
| 톤 | `professional` | professional / casual / energetic |
| 템플릿 | `clean` | 템플릿 스타일 (아래 8종 참고) |
| 슬라이드 수 | `7` | 5~12장 |
| 악센트 색상 | `#8BC34A` | hex 코드 |
| 계정명 | `my_account` | Instagram 계정명 |

---

## 자동 생성 파이프라인

Claude Code가 아래 단계를 순서대로 실행합니다:

```
Step 1  요청 파싱 — 주제, 톤, 스타일, 슬라이드 수 추출
  ↓
Step 2  리서치 — 웹 검색으로 핵심 포인트, 통계, 인용구 수집
  ↓
Step 2.5  리서치 검증 — 팩트체커 + 보완 리서처 (병렬 실행, 교차 검증)
  ↓
Step 3.5  카피 토론 (Team 모드) — 카피 작가 + 후킹 전문가가 실시간 토론
           → 후킹 점수 7점 이상 + 양측 합의까지 최대 3라운드
  ↓
Step 4  렌더링 — Puppeteer로 HTML → PNG 변환 (1080x1350px)
  ↓
Step 5  시각 검토 — 가독성, 텍스트 잘림, 흐름, CTA 명확성 확인
```

### Team 모드 카피 토론 (Step 3.5)

카피라이팅과 품질 검증이 하나의 Team 모드로 통합되어 있습니다:

- **카피 작가** (`copywriter`): 리서치 기반으로 slides.json 초안 작성
- **후킹 전문가** (`hook-expert`): 스크롤 스톱 파워, 호기심 유발, CTA 클릭 유도력 평가

두 에이전트가 `SendMessage`로 실시간 피드백을 주고받으며 합의에 도달합니다.

---

## 템플릿 스타일 (8종)

| 스타일 | 설명 | 기본 악센트 | 배경 |
|---|---|---|---|
| **clean** | 클린 에디토리얼형 | `#8BC34A` 라임그린 | 라이트그레이 |
| **minimal** | 깔끔한 정보 전달형 | `#2D63E2` 블루 | 화이트 |
| **bold** | 강렬한 임팩트형 | `#6C5CE7` 퍼플 | 그라디언트 |
| **elegant** | 고급스러운 감성형 | `#D4AF37` 골드 | 다크 |
| **premium** | 다크 프리미엄형 | `#A855F7` 바이올렛 | 딥 다크 |
| **toss** | 토스 스타일 미니멀 | `#3182F6` 블루 | 다크 플랫 |
| **magazine** | 매거진/SNS형 | `#3B82F6` 블루 | 포토+화이트 |
| **blueprint** | 블루프린트 프레젠테이션형 | `#7BA7CC` 소프트블루 | 라이트블루그레이 |

---

## 슬라이드 타입 (14종)

| 타입 | 용도 | 주요 필드 |
|---|---|---|
| `cover` | 표지 (항상 첫 번째) | `headline`, `subtext`, `headline_label` |
| `content` | 일반 내용 | `headline`, `body` |
| `content-badge` | 카테고리 태그 | `badge_text`, `headline`, `body` |
| `content-stat` | 숫자/통계 강조 | `headline`, `emphasis`, `body` |
| `content-quote` | 인용구/명언 | `headline`(출처), `body`(인용문) |
| `content-image` | 이미지+텍스트 | `headline`, `body`, `image_url` |
| `content-steps` | 3단계 프로세스 | `headline`, `step1~3` |
| `content-list` | 항목 나열 (최대 5개) | `headline`, `item1~5` |
| `content-split` | 비교/대조 | `headline`, `left/right_title`, `left/right_body` |
| `content-highlight` | 핵심 강조 박스 | `headline`, `emphasis`, `body` |
| `content-grid` | 2x2 그리드 | `headline`, `grid1~4_icon/title/desc` |
| `content-bigdata` | 대형 숫자 강조 | `headline`, `bigdata_number`, `bigdata_unit`, `body` |
| `content-fullimage` | 풀 배경 이미지 오버레이 | `headline`, `badge_text`, `body`, `badge2_text`, `body2`, `image_url` |
| `cta` | 행동 유도 (항상 마지막) | `headline`, `cta_text`, `tag1~3` |

---

## 수동 렌더링

slides.json을 직접 작성하고 렌더링만 실행할 수도 있습니다:

```bash
node scripts/render.js \
  --slides workspace/slides.json \
  --style clean \
  --output output/ \
  --accent "#8BC34A" \
  --account "my_account"
```

### 샘플 생성

13개 슬라이드 타입을 모두 포함하는 샘플을 렌더링합니다:

```bash
node scripts/generate-samples.js
```

결과: `sample-output/clean/` 디렉토리

---

## 텍스트 하이라이트

headline이나 body에 `<span class='highlight'>텍스트</span>`를 사용하면 형광펜 마커 스타일이 적용됩니다.

```json
{
  "headline": "2025 <span class='highlight'>디지털 마케팅</span> 트렌드"
}
```

---

## 설정 (config.json)

```json
{
  "defaults": {
    "template": "clean",
    "accent_color": "#8BC34A",
    "account_name": "my_account",
    "slide_count": 7
  }
}
```

---

## 프로젝트 구조

```
instagram-card-news/
├── templates/           # HTML 템플릿 (8 스타일 x 14 타입)
│   ├── clean/
│   ├── minimal/
│   ├── bold/
│   ├── elegant/
│   ├── premium/
│   ├── toss/
│   ├── magazine/
│   └── blueprint/
├── scripts/
│   ├── render.js        # Puppeteer HTML → PNG 렌더러
│   └── generate-samples.js
├── skill-package/       # Claude Code 스킬 배포 패키지
├── workspace/           # 슬라이드 JSON 작업 공간
├── output/              # 최종 PNG 출력
├── config.json          # 기본 설정
├── CLAUDE.md            # Claude Code 파이프라인 오케스트레이터 문서
└── BOOTSTRAP_PROMPT.md  # 빈 폴더 부트스트랩 프롬프트
```

---

## 라이선스

MIT
