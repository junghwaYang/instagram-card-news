# Instagram 카드뉴스 생성 프로젝트

> **v5.3** — 14종 슬라이드 타입 + 8종 템플릿 스타일 + Team 모드 실시간 토론 파이프라인

## 프로젝트 개요

이 프로젝트는 주어진 주제에 대해 Instagram 카드뉴스(캐러셀 포스트)를 자동으로 생성합니다.
Claude Code가 오케스트레이터 역할을 하며, 리서치 → **리서치 검증 (팀 토론)** → **카피 토론 (Team 모드 실시간 토론)** → 렌더링 → 검토 파이프라인을 실행합니다.

**입력**: 주제, 톤, 템플릿 스타일, 슬라이드 수, 악센트 색상
**출력**: `output/` 디렉토리에 PNG 이미지 파일들 (1080×1350px, Instagram 세로형)

### 사용 가능한 템플릿 스타일
- `minimal` — 깔끔한 정보 전달형, 밝은 배경, 전문적
- `bold` — 강렬한 임팩트형, 그라디언트 배경, 에너지
- `elegant` — 고급스러운 감성형, 어두운 배경, 세련
- `premium` — 다크 프리미엄형, 딥 다크 배경, 글래스모피즘, 바이브런트 그라디언트
- `toss` — 토스 스타일 울트라 미니멀, 다크 플랫 배경, 극한의 여백, Pretendard 폰트
- `magazine` — 매거진 스타일, 포토 오버레이 + 화이트 클린
- `clean` — 클린 에디토리얼형, 라이트그레이 배경, 그린 하이라이트, 브랜드 마크
- `blueprint` — 블루프린트 프레젠테이션형, 라이트블루그레이 배경, 소프트블루 악센트, ○○○ 장식

---

## 카드뉴스 생성 워크플로우

사용자가 카드뉴스를 요청하면 (예: "AI 프롬프트 팁으로 카드뉴스 만들어줘") 아래 파이프라인을 순서대로 실행합니다.

### Step 1: 요청 파싱

사용자 입력에서 다음 파라미터를 추출합니다:

| 파라미터 | 기본값 | 설명 |
|---|---|---|
| `topic` | (필수) | 카드뉴스 주제 |
| `tone` | `professional` | 톤 (professional / casual / energetic) |
| `template` | `minimal` | 템플릿 스타일 |
| `slide_count` | `7` | 슬라이드 수 (최소 5, 최대 12) |
| `accent_color` | `#2D63E2` | 악센트 색상 (hex) |
| `account_name` | `my_account` | 계정명 (@ 없이 입력, 템플릿에서 자동 추가) |

명시되지 않은 파라미터는 `config.json`의 기본값을 사용합니다.

---

### Step 2: 리서치 (Task 에이전트)

**에이전트**: general-purpose
**모델**: sonnet
**출력 파일**: `workspace/research.md`

주제에 대한 웹 검색을 수행하고 다음 내용을 포함한 `workspace/research.md`를 작성합니다:

- 핵심 포인트 5–10개
- 관련 통계 및 수치
- 인용구 1–2개 (전문가 의견, 명언 등)
- 최신 트렌드 및 맥락 정보

---

### Step 2.5: 리서치 검증 (팀 토론)

리서치 결과의 정확성과 완성도를 팀 에이전트가 교차 검증합니다.

**방식**: 2개의 Task 에이전트를 **병렬**로 실행한 뒤, 오케스트레이터가 종합

#### 에이전트 구성

| 역할 | 에이전트 | 모델 | 임무 |
|---|---|---|---|
| 팩트체커 | general-purpose | sonnet | 통계/수치의 출처 확인, 오래된 데이터 지적, 잘못된 정보 식별 |
| 보완 리서처 | general-purpose | sonnet | 빠진 핵심 정보 보완, 다른 소스로 교차 검증, 추가 인사이트 제안 |

#### 실행 흐름

1. `workspace/research.md`를 두 에이전트에게 동시에 전달
2. **팩트체커**: 각 통계/수치에 대해 웹 검색으로 출처 확인, 정확도를 `확인됨/미확인/수정필요`로 분류
3. **보완 리서처**: 주제에 대해 독립적으로 웹 검색 수행, 기존 리서치에 없는 중요 정보 식별
4. 오케스트레이터가 두 에이전트의 피드백을 종합하여 `workspace/research.md`를 최종 수정
   - 수정필요 항목: 정확한 데이터로 교체
   - 미확인 항목: 출처 불분명 표기 또는 제거
   - 보완 정보: 유용한 내용만 선별하여 추가

**통과 기준**: 모든 통계/수치가 `확인됨` 상태이고, 핵심 포인트가 5개 이상일 때

---

### Step 3: 카피라이팅 (Task 에이전트)

**에이전트**: general-purpose
**모델**: sonnet
**입력**: `workspace/research.md` + 톤 + 슬라이드 수
**출력 파일**: `workspace/slides.json`

#### slides.json 포맷

```json
[
  {"slide": 1, "type": "cover", "headline": "...", "subtext": "..."},
  {"slide": 2, "type": "content", "headline": "...", "body": "..."},
  {"slide": 3, "type": "content-badge", "badge_text": "TREND", "headline": "핵심 트렌드", "body": "설명 텍스트", "subtext": "2025년"},
  {"slide": 4, "type": "content-steps", "headline": "진행 절차", "step1": "첫 번째 단계", "step2": "두 번째 단계", "step3": "세 번째 단계"},
  {"slide": 5, "type": "content-list", "headline": "핵심 포인트", "item1": "항목 1", "item2": "항목 2", "item3": "항목 3", "item4": "항목 4", "item5": "항목 5"},
  {"slide": 6, "type": "content-split", "headline": "A vs B", "left_title": "A", "left_body": "설명", "right_title": "B", "right_body": "설명"},
  {"slide": 7, "type": "content-highlight", "headline": "핵심 포인트", "emphasis": "키워드", "body": "설명"},
  {"slide": 8, "type": "content-image", "headline": "이미지 슬라이드", "body": "설명", "image_url": ""},
  {"slide": 9, "type": "content-stat", "headline": "...", "emphasis": "85%", "body": "..."},
  {"slide": 10, "type": "content-quote", "headline": "— 출처", "body": "인용문..."},
  {"slide": 11, "type": "cta", "headline": "...", "cta_text": "팔로우하기"},
  {"slide": 12, "type": "content-grid", "headline": "4대 핵심 전략", "grid1_icon": "search", "grid1_title": "타겟팅", "grid1_desc": "설명", "grid2_icon": "code", "grid2_title": "콘텐츠", "grid2_desc": "설명", "grid3_icon": "robot", "grid3_title": "자동화", "grid3_desc": "설명", "grid4_icon": "chart", "grid4_title": "분석", "grid4_desc": "설명"},
  {"slide": 13, "type": "content-bigdata", "headline": "시장 규모", "bigdata_number": "48.8", "bigdata_unit": "조원", "body": "설명 텍스트", "subtext": "출처"},
  {"slide": 14, "type": "content-fullimage", "headline": "풀이미지 타이틀", "badge_text": "핵심 인사이트", "body": "첫 번째 섹션 설명", "badge2_text": "주의할 점", "body2": "두 번째 섹션 설명", "image_url": "https://..."}
]
```

#### 카피라이팅 가이드라인

- **슬라이드 1 (cover)**: 강력한 훅 문장, 호기심 유발, 핵심 키워드 포함
- **중간 슬라이드**: 한 슬라이드에 하나의 포인트만, 명확하고 간결하게
- **숫자/통계가 있으면** `content-stat` 타입으로 강조
- **인용구/명언/전문가 의견이 있으면** `content-quote` 타입 활용
- **카테고리/태그가 있으면** `content-badge` 타입으로 시작 (예: "TREND", "EVENT", "TIP")
- **절차/과정 설명은** `content-steps` 타입 활용 (3단계)
- **여러 항목 나열은** `content-list` 타입 활용 (최대 5개)
- **비교/대조가 필요하면** `content-split` 타입 활용
- **핵심 메시지 강조는** `content-highlight` 타입 활용
- **이미지가 필요한 슬라이드는** `content-image` 타입 (image_url은 비워두면 플레이스홀더 표시)
- **2x2 그리드 정보 정리는** `content-grid` 타입 활용 (4개 항목, SVG 아이콘 키 사용)
- **대형 숫자/금액/규모 강조는** `content-bigdata` 타입 활용 (거대 숫자 + 단위)
- **풀 배경 이미지 + 텍스트 오버레이는** `content-fullimage` 타입 활용 (두 개의 배지 섹션, 다크 오버레이)
- **마지막 슬라이드 (cta)**: 명확한 행동 유도 (저장, 팔로우, 공유 등)
- **문장 길이**: 짧고 임팩트 있게, 한 줄 15자 이내 권장
- **어조**: 요청된 톤(professional / casual / energetic)에 맞게 작성
- **이모지 사용 금지**: slides.json의 모든 필드에서 이모지(emoji) 절대 사용하지 않는다. 아이콘이 필요한 경우 템플릿의 SVG 아이콘 키(예: robot, code, chart 등)를 사용할 것.

---

### Step 3.5: 카피 토론 (Team 모드 실시간 토론)

카피 작가와 후킹 전문가가 **Team 모드**에서 실시간 토론하며 slides.json을 완성합니다.

**방식**: `TeamCreate` → `TaskCreate` → `Task(team_name)` 스폰 → 에이전트 간 `SendMessage` 토론 → 합의 도달 → `workspace/slides.json` 최종 확정

#### 에이전트 구성

| 역할 | 이름 | 에이전트 | 모델 | 임무 |
|---|---|---|---|---|
| 카피 작가 | `copywriter` | general-purpose | sonnet | research.md 기반 slides.json 초안 작성, 후킹 전문가 피드백 반영하여 수정 |
| 후킹 전문가 | `hook-expert` | general-purpose | sonnet | 커버 헤드라인 스크롤 스톱 파워, 호기심 유발 강도, CTA 클릭 유도력 평가 및 구체적 대안 제시 |

#### 실행 흐름

1. 오케스트레이터가 `TeamCreate(team_name="copy-debate")`로 팀 생성
2. `TaskCreate`로 두 에이전트의 작업 정의:
   - `copywriter` 태스크: research.md + 톤 + 슬라이드 수를 기반으로 slides.json 초안 작성
   - `hook-expert` 태스크: copywriter의 초안을 평가하고 피드백/대안 제시
3. `Task(team_name="copy-debate", name="copywriter")` + `Task(team_name="copy-debate", name="hook-expert")` 동시 스폰
4. **라운드 1**: 카피 작가가 research.md 기반으로 slides.json 초안 작성 → `SendMessage`로 후킹 전문가에게 전달
5. **라운드 1 평가**: 후킹 전문가가 초안 평가 → 후킹 점수 (1~10점) + 구체적 피드백/대안을 `SendMessage`로 카피 작가에게 전달
   - 평가 기준:
     - 커버 헤드라인: "이걸 왜 봐야 하지?"에 3초 안에 답하는가
     - 각 슬라이드: 다음 장을 넘기고 싶은 호기심을 유발하는가
     - CTA: 구체적이고 즉시 행동 가능한 문구인가
     - 문장 길이: 한 줄 15자 이내 준수 여부
     - 톤 일관성, 슬라이드 간 흐름, 슬라이드 타입 적절성
6. **라운드 2~3** (필요 시): 카피 작가가 피드백 반영하여 수정 → 다시 후킹 전문가에게 전달 → 재평가
7. **합의 도달**: 후킹 점수 7점 이상 달성 시 카피 작가가 `workspace/slides.json` 최종 저장
8. 오케스트레이터가 `SendMessage(type="shutdown_request")`로 팀 종료 → Step 4로 진행

#### 통과 기준

- 후킹 점수 **7점 이상**
- 카피 작가와 후킹 전문가 **양측 합의**
- 최대 **3라운드** 내 합의 실패 시 마지막 버전 채택 후 진행

#### Step 3 변경사항

> Team 모드 도입으로 **Step 3 (카피라이팅)은 별도 실행하지 않습니다**. Step 3.5의 카피 작가(`copywriter`)가 research.md를 직접 읽고 slides.json 초안을 작성하므로, 기존 Step 3의 카피라이팅 역할이 Step 3.5에 통합됩니다. 단, slides.json 포맷과 카피라이팅 가이드라인은 그대로 적용됩니다.

---

### Step 4: 렌더링 (Bash)

> Step 3.5 통과 후 실행

`render.js` 스크립트를 실행하여 슬라이드 JSON을 PNG 이미지로 변환합니다.

```bash
node scripts/render.js \
  --slides workspace/slides.json \
  --style {template} \
  --output output/ \
  --accent "{accent_color}" \
  --account "{account_name}"
```

렌더링 완료 후 `output/` 디렉토리에 `slide-01.png` ~ `slide-0N.png` 파일이 생성됩니다.

---

### Step 5: 검토 (Task 에이전트)

**에이전트**: general-purpose
**모델**: sonnet

`output/` 디렉토리의 PNG 파일들을 읽어 다음 항목을 검토합니다:

- 가독성: 텍스트가 충분히 크고 읽기 쉬운지
- 텍스트 잘림: 내용이 프레임을 벗어나지 않는지
- 흐름: 슬라이드 간 내용이 자연스럽게 연결되는지
- CTA 명확성: 마지막 슬라이드의 행동 유도가 구체적인지
- 주제 일관성: 전체 카드뉴스가 주제에 집중되어 있는지

**문제 발견 시**: Step 3.5 (카피 토론)으로 돌아가 구체적인 피드백과 함께 Team 모드 재실행
**이상 없음**: 사용자에게 완료 보고 및 출력 파일 경로 안내

---

## 슬라이드 타입 레퍼런스

| 타입 | 사용 시점 | 필드 |
|---|---|---|
| `cover` | 항상 첫 번째 슬라이드 (표지) | `headline`, `subtext` |
| `content` | 일반 내용 설명 | `headline`, `body` |
| `content-stat` | 숫자/통계/퍼센트 강조 | `headline`, `emphasis`, `body` |
| `content-quote` | 인용구, 명언, 전문가 의견 | `headline` (출처), `body` (인용문) |
| `cta` | 항상 마지막 슬라이드 (행동 유도) | `headline`, `cta_text` |
| `content-image` | 이미지와 텍스트를 함께 보여줄 때 | `headline`, `body`, `image_url` |
| `content-steps` | 단계별 프로세스/절차 설명 | `headline`, `step1`, `step2`, `step3`, `body` |
| `content-list` | 항목을 나열할 때 (최대 5개) | `headline`, `item1`~`item5` |
| `content-badge` | 카테고리/태그 + 대형 헤드라인 | `badge_text`, `headline`, `body`, `subtext` |
| `content-split` | 두 가지를 비교/대조할 때 | `headline`, `left_title`, `left_body`, `right_title`, `right_body`, `subtext` |
| `content-highlight` | 핵심 정보를 강조 박스로 표시 | `headline`, `emphasis`, `body`, `subtext` |
| `content-grid` | 4가지 항목을 그리드로 정리할 때 | `headline`, `grid1_icon`~`grid4_icon`, `grid1_title`~`grid4_title`, `grid1_desc`~`grid4_desc` |
| `content-bigdata` | 거대 숫자/금액/규모를 강조할 때 | `headline`, `bigdata_number`, `bigdata_unit`, `body`, `subtext` |
| `content-fullimage` | 풀 배경 이미지 위에 텍스트 오버레이 | `headline`, `badge_text`, `body`, `badge2_text`, `body2`, `image_url` |

---

## 템플릿 스타일 가이드

### minimal
- 스타일: 깔끔한 정보 전달형
- 배경: 밝은 흰색 계열
- 느낌: 전문적, 신뢰감, 가독성 최우선
- 기본 악센트: `#2D63E2` (블루)
- 추천 주제: 비즈니스, IT, 교육, 자기계발

### bold
- 스타일: 강렬한 임팩트형
- 배경: 그라디언트 (다크 계열)
- 느낌: 에너지, 강렬함, 젊은 감각
- 기본 악센트: `#6C5CE7` (퍼플)
- 추천 주제: 마케팅, 동기부여, 트렌드, 엔터테인먼트

### elegant
- 스타일: 고급스러운 감성형
- 배경: 어두운 배경 (블랙/딥그레이)
- 느낌: 세련됨, 고급감, 럭셔리
- 기본 악센트: `#D4AF37` (골드)
- 추천 주제: 라이프스타일, 뷰티, 패션, 프리미엄 브랜드

### premium
- 스타일: 다크 프리미엄 바이브런트형
- 배경: 딥 다크 (#0D0D1A) + 글래스모피즘 카드
- 느낌: 프리미엄, 세련됨, 현대적, 생동감
- 기본 악센트: `#A855F7` (바이올렛)
- 추천 주제: 테크, 스타트업, 데이터, 프리미엄 서비스, 앱 프로모션

### toss
- 스타일: 토스 스타일 울트라 미니멀
- 배경: 다크 플랫 (#191F28), 장식 요소 없음
- 느낌: 미니멀, 신뢰감, 핀테크, 현대적
- 기본 악센트: `#3182F6` (토스 블루)
- 폰트: Pretendard
- 추천 주제: 금융, 테크, 비즈니스, 데이터, 생산성

### magazine
- 스타일: 매거진/SNS 카드뉴스형
- 배경: 커버/CTA는 다크 포토 오버레이, 본문은 화이트(#FFFFFF)
- 느낌: 트렌디, 깔끔, SNS 네이티브, 전문적
- 기본 악센트: `#3B82F6` (블루)
- 폰트: Pretendard
- 특징: 해시태그 필 배지, 챕터/번호 배지, 대시 구분선, 상하 분할 레이아웃
- 추가 필드: `headline_label`, `tag1~3`, `badge_number`
- 추천 주제: 블로그, SNS 마케팅, 교육 콘텐츠, 여행, 라이프스타일

### clean
- 스타일: 클린 에디토리얼형
- 배경: 라이트그레이 (#F5F5F5)
- 느낌: 깔끔, 전문적, 에디토리얼, 신뢰감
- 기본 악센트: `#8BC34A` (라임 그린)
- 폰트: Pretendard
- 특징: 브랜드 도트+계정명, 녹색 텍스트 하이라이트, 화이트 카드 UI, 쉐브론 화살표 (커버/CTA), 슬라이드 번호 없음
- 하이라이트: headline에 `<span class='highlight'>텍스트</span>` 사용 시 녹색 배경 강조 효과
- 추천 주제: 블로그, 교육 콘텐츠, 수익화, 마케팅 전략, 자기계발

### blueprint
- 스타일: 블루프린트 프레젠테이션형
- 배경: 라이트 블루그레이 (#EDF0F5)
- 느낌: 깔끔, 프레젠테이션, 기업 문서, 신뢰감
- 기본 악센트: `#7BA7CC` (소프트 블루)
- 폰트: Pretendard
- 특징: 상단 악센트 라인, ○○○ 점 장식 (우상단), 블루 보더 카드, 번호+구분선 리스트, 커버 바 하이라이트
- 하이라이트: headline에 `<span class='accent'>텍스트</span>` 사용 시 악센트 블루 컬러, `<span class='bar-highlight'>텍스트</span>` 사용 시 블루 바 배경 효과
- 추천 주제: 비즈니스, 프레젠테이션, 교육, IT, 데이터, 기획

---

## 설정 (config.json)

`config.json`에서 기본값을 변경할 수 있습니다:

```json
{
  "version": "3.0",
  "defaults": {
    "template": "minimal",
    "accent_color": "#2D63E2",
    "account_name": "my_account",
    "slide_count": 7
  }
}
```

- `template`: 기본 템플릿 스타일 (`minimal` / `bold` / `elegant` / `premium` / `toss` / `magazine` / `clean` / `blueprint`)
- `accent_color`: 기본 악센트 색상 (hex 코드)
- `account_name`: Instagram 계정명 (슬라이드에 표시)
- `slide_count`: 기본 슬라이드 수

---

## 빠른 명령어 예시

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
```
"건강한 식습관 7가지" 카드뉴스, 캐주얼 톤, 볼드 스타일
```

---

## 디렉토리 구조

```
instagram-card-news/
├── templates/           # HTML 템플릿
│   ├── minimal/         # cover.html, content.html, content-stat.html, content-quote.html, cta.html
│   │                    # content-image.html, content-steps.html, content-list.html
│   │                    # content-badge.html, content-split.html, content-highlight.html
│   │                    # content-grid.html, content-bigdata.html
│   ├── blueprint/       # 블루프린트 프레젠테이션 스타일 (동일 13종)
│   ├── bold/
│   ├── elegant/
│   ├── premium/
│   ├── toss/
│   ├── magazine/
│   └── clean/
├── scripts/
│   ├── render.js        # Puppeteer HTML → PNG 렌더러
│   └── generate-samples.js
├── workspace/           # 런타임 작업 공간 (research.md, slides.json)
├── output/              # 최종 PNG 출력
├── config.json          # 기본 설정
└── CLAUDE.md            # 이 파일
```

`workspace/` 디렉토리는 매 생성 시 덮어쓰기됩니다. 이전 결과물은 `output/`에 보관됩니다.
