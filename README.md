# Instagram Card News Generator

Instagram 카드뉴스(캐러셀 포스트)를 자동으로 생성하는 도구입니다.  
HTML 템플릿 + JSON 데이터를 조합해 **1080×1350px PNG** 이미지를 렌더링합니다.

---

## 설치

```bash
git clone https://github.com/junghwaYang/instagram-card-news.git
cd instagram-card-news
npm install
```

> Puppeteer가 Chromium을 자동 다운로드합니다.

---

## 빠른 시작

### 1. 슬라이드 데이터 작성

`workspace/slides.json`에 슬라이드 배열을 작성합니다:

```json
[
  {
    "slide": 1,
    "type": "cover",
    "headline": "2025 <span class='highlight'>디지털 마케팅</span>\n트렌드 가이드",
    "headline_label": "카드뉴스",
    "subtext": "성공적인 마케팅을 위한 핵심 인사이트"
  },
  {
    "slide": 2,
    "type": "content",
    "badge_number": "01",
    "headline": "핵심 포인트",
    "body": "본문 내용을 작성합니다."
  },
  {
    "slide": 3,
    "type": "cta",
    "headline": "더 많은 인사이트가\n궁금하다면",
    "cta_text": "팔로우하고 트렌드 받아보기"
  }
]
```

### 2. 렌더링

```bash
node scripts/render.js \
  --slides workspace/slides.json \
  --style clean \
  --output output/ \
  --accent "#3B82F6" \
  --account "my_account"
```

### 3. 결과 확인

`output/` 디렉토리에 `slide_01.png`, `slide_02.png`, ... 파일이 생성됩니다.

---

## 렌더링 옵션

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `--slides` | `workspace/slides.json` | 슬라이드 JSON 파일 경로 |
| `--style` | `clean` | 템플릿 스타일 |
| `--output` | `output/` | PNG 출력 디렉토리 |
| `--accent` | `#3B82F6` | 악센트 색상 (hex) |
| `--account` | `my_account` | 계정명 |

---

## 템플릿 스타일 (7종)

| 스타일 | 설명 | 기본 악센트 | 배경 |
|---|---|---|---|
| **clean** | 클린 에디토리얼형 | `#3B82F6` 블루 | 라이트그레이 |
| **minimal** | 깔끔한 정보 전달형 | `#2D63E2` 블루 | 화이트 |
| **bold** | 강렬한 임팩트형 | `#6C5CE7` 퍼플 | 그라디언트 |
| **elegant** | 고급스러운 감성형 | `#D4AF37` 골드 | 다크 |
| **premium** | 다크 프리미엄형 | `#A855F7` 바이올렛 | 딥 다크 |
| **toss** | 토스 스타일 미니멀 | `#3182F6` 블루 | 다크 플랫 |
| **magazine** | 매거진/SNS형 | `#3B82F6` 블루 | 포토+화이트 |

---

## 슬라이드 타입 (13종)

| 타입 | 용도 | 주요 필드 |
|---|---|---|
| `cover` | 표지 | `headline`, `subtext`, `headline_label` |
| `content` | 일반 내용 | `headline`, `body` |
| `content-badge` | 카테고리 태그 | `badge_text`, `headline`, `body` |
| `content-stat` | 숫자/통계 강조 | `headline`, `emphasis`, `body` |
| `content-quote` | 인용구/명언 | `headline`(출처), `body`(인용문) |
| `content-image` | 이미지+텍스트 | `headline`, `body`, `image_url` |
| `content-steps` | 3단계 프로세스 | `headline`, `step1~3` |
| `content-list` | 항목 나열 (최대 5개) | `headline`, `item1~5` |
| `content-split` | 비교/대조 | `headline`, `left_title`, `left_body`, `right_title`, `right_body` |
| `content-highlight` | 핵심 강조 박스 | `headline`, `emphasis`, `body` |
| `content-grid` | 2×2 그리드 | `headline`, `grid1~4_icon`, `grid1~4_title`, `grid1~4_desc` |
| `content-bigdata` | 대형 숫자 강조 | `headline`, `bigdata_number`, `bigdata_unit`, `body` |
| `cta` | 행동 유도 (마지막) | `headline`, `cta_text`, `tag1~3` |

---

## 텍스트 하이라이트

headline이나 body에 `<span class='highlight'>텍스트</span>`를 사용하면 형광펜 마커 스타일의 하이라이트가 적용됩니다.

```json
{
  "headline": "2025 <span class='highlight'>디지털 마케팅</span> 트렌드"
}
```

---

## 프로젝트 구조

```
instagram-card-news/
├── templates/           # HTML 템플릿 (7 스타일 × 13 타입)
│   ├── clean/
│   ├── minimal/
│   ├── bold/
│   ├── elegant/
│   ├── premium/
│   ├── toss/
│   └── magazine/
├── scripts/
│   ├── render.js        # Puppeteer HTML → PNG 렌더러
│   └── generate-samples.js
├── workspace/           # 슬라이드 JSON 작업 공간
├── output/              # 최종 PNG 출력
├── config.json          # 기본 설정
├── CLAUDE.md            # Claude Code 오케스트레이터 문서
└── README.md            # 이 파일
```

---

## 설정 (config.json)

```json
{
  "defaults": {
    "template": "clean",
    "accent_color": "#3B82F6",
    "account_name": "my_account",
    "slide_count": 7
  }
}
```

---

## 라이선스

Private repository
