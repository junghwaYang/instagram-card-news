# Claude Code CLI 사용법 — 리서치 문서

> 작성일: 2026-02-21 | 카드뉴스 제작용 리서치

---

## 핵심 포인트

### 1. Claude Code란 무엇인가?
Claude Code는 Anthropic이 만든 **터미널 기반 AI 코딩 에이전트**다. 코드베이스를 이해하고, 파일을 편집하고, 터미널 명령을 실행하며, Git 워크플로를 자연어 대화만으로 처리한다. 기존 IDE나 개발 환경을 바꾸지 않아도 그대로 사용할 수 있다는 것이 핵심 철학이다.

> "Your workspace is wherever you work, and I'll meet you there."
> — Claude Code 설계 철학 (Anthropic)

---

### 2. 설치 방법 (3가지)

| 방법 | 명령어 |
|---|---|
| macOS / Linux (권장) | `curl -fsSL https://claude.ai/install.sh \| bash` |
| Windows PowerShell | `irm https://claude.ai/install.ps1 \| iex` |
| npm 글로벌 설치 | `npm install -g @anthropic-ai/claude-code` |

- **요구 사항**: Node.js 18 이상
- **지원 OS**: macOS 10.15+, Ubuntu 20.04+, Debian 10+, WSL(Windows)
- 설치 후 `claude` 명령어로 즉시 실행 가능
- `sudo npm install -g` 사용 금지 (권한 오류 및 보안 위험)

---

### 3. 주요 기능 5가지

1. **코드베이스 온보딩**: 프로젝트 전체 구조, 의존성, 아키텍처를 자동으로 파악
2. **멀티 파일 자동 편집**: 자연어 지시 한 마디로 여러 파일 동시 수정
3. **테스트/빌드/린트 실행**: 코드 변경 후 자동 검증 파이프라인 실행
4. **Git 워크플로 자동화**: 커밋 메시지 작성, PR 생성, 머지 컨플릭트 해결까지 처리
5. **MCP 프로토콜 통합**: GitHub, Jira, Slack 등 300개 이상 외부 서비스 연동

---

### 4. 슬래시 명령어와 단축키

- `/help` — 사용 가능한 명령어 목록 확인
- `/clear` — 대화 초기화 (토큰 절약을 위해 새 작업 시작 전 필수)
- `/compact` — 긴 대화 압축
- `/model` — 사용 모델 변경 (Opus 4.6 / Sonnet 4.6 / Haiku 4.5)
- `/plan` — 계획 모드 진입 (실행 전 Claude가 계획 먼저 제시)
- `Shift+Tab` — 세 가지 권한 모드 전환 (일반 / 자동 수락 / 계획 모드)
- `claude doctor` — 설치 상태 진단 및 문제 해결

커스텀 슬래시 명령어도 만들 수 있다. `.claude/commands/` 폴더에 마크다운 파일을 넣으면 자동으로 `/파일명` 명령어로 등록된다.

---

### 5. 멀티 서피스 지원

Claude Code는 터미널 하나에 국한되지 않는다:
- **웹 / iOS 앱**에서 긴 작업 시작 → `/teleport`로 터미널에 이어받기
- **터미널 세션** → `/desktop`으로 Desktop 앱에서 비주얼 diff 리뷰
- **Slack**에서 `@Claude` 멘션으로 버그 리포트 → PR 자동 생성

---

### 6. 지원 모델

Claude Code는 세 가지 모델을 지원한다:
- **Claude Opus 4.6** — 복잡한 아키텍처, 대규모 리팩토링
- **Claude Sonnet 4.6** — 일반 개발 작업, 기능 구현
- **Claude Haiku 4.5** — 빠른 검색, 가벼운 쿼리

엔터프라이즈 사용자는 Amazon Bedrock 또는 Google Cloud Vertex AI를 통해 자체 인프라에서 실행 가능.

---

### 7. MCP(Model Context Protocol) 에코시스템

MCP는 Claude Code를 외부 도구와 연결하는 표준 프로토콜이다:
- GitHub PR 자동 리뷰 및 코멘트
- Jira 티켓 자동 생성 및 업데이트
- 프로덕션 데이터베이스 직접 쿼리
- 2026년 1월 기준: **월 약 1억 다운로드**, **10,000개 이상의 MCP 서버** 존재

---

### 8. 실제 활용 사례

- **지루한 반복 작업 자동화**: 테스트 코드 작성, 린트 오류 수정, 의존성 업데이트, 릴리즈 노트 작성
- **대규모 리팩토링**: 프로젝트 전체 코드 스타일 통일, API 구조 변경
- **코드 온보딩**: 새 팀원이 복잡한 레거시 코드베이스를 빠르게 파악
- **GitHub Actions CI/CD 자동화**: 훅 시스템으로 빌드/배포 파이프라인 제어
- **`/install-github-app` 명령**: 실행 후 Claude가 PR을 자동 리뷰

---

## 관련 통계 및 수치

| 지표 | 수치 | 시점 |
|---|---|---|
| Claude Code 개발자 수 | **115,000명** | 2025년 7월 |
| 주간 처리 코드 라인 수 | **1억 9,500만 줄** | 2025년 7월 |
| Claude Code ARR | **$10억(약 1.4조원)** 돌파 | 출시 6개월 만에 달성 |
| Anthropic 전체 ARR | **$140억** | 2026년 2월 |
| ARR 성장률 | 연간 **10배 이상** | 3년 연속 |
| 엔터프라이즈 구독 증가 | **4배** 증가 | 2026년 초 대비 연초 |
| 개발자 AI 도구 사용률 | **84%** | 2025년 (Stack Overflow 2025) |
| MCP 서버 수 | **10,000개 이상** | 2026년 1월 |
| MCP 월간 다운로드 | **약 1억 건** | 2026년 1월 |
| 개발 속도 향상 (팀 도입 사례) | **2~10배** | 2025년 |
| 스토리 완료율 향상 | **164%** | 도입 팀 사례 |
| PR 머지율 향상 | **약 2배** | 도입 팀 사례 |

---

## 인용구

### 인용구 1 — Dario Amodei (Anthropic CEO)
> "앞으로 3~6개월 안에 AI가 코드의 90%를 작성하게 될 것이다. 12개월 안에는 사실상 모든 코드를 AI가 쓰는 세상이 올 수 있다."
> — Dario Amodei, Anthropic CEO (2025년 3월)

### 인용구 2 — Anthropic 공식 발표 (Accenture 파트너십)
> "수만 명의 Accenture 개발자들이 Claude Code를 사용하게 되는 것은 역대 최대 규모의 배포다."
> — Dario Amodei (2025년 12월, Anthropic-Accenture 파트너십 발표)

---

## 최신 트렌드 및 맥락

### AI 코딩 도구 시장 경쟁 구도 (2025~2026)

| 도구 | 특징 | 강점 |
|---|---|---|
| **Claude Code** | 터미널 기반, 에이전트형 | 대규모 리팩토링, 멀티 파일 편집, MCP 에코시스템 |
| **GitHub Copilot** | IDE 통합, 20M+ 사용자 | 빠른 자동완성, 기업 생태계 |
| **Cursor** | AI 네이티브 IDE | 프로젝트 전체 컨텍스트, 매끄러운 인라인 AI |

- 세 도구 합산 시장 점유율 **70% 이상**
- Cursor는 2025년 초 $2억 ARR → 연말 $5억 ARR로 급성장
- Claude Code는 출시 6개월 만에 $10억 ARR — 업계에서 "ChatGPT 모멘트"로 불림
- GitHub Copilot: **20M+ 사용자**, **유료 구독자 42% 시장 점유**

### 핵심 트렌드

1. **"Vibe Coding" 부상**: 자연어로 코드를 설명하고 AI가 구현하는 개발 방식이 주류화
2. **에이전트형 AI로의 전환**: 단순 자동완성을 넘어, 전체 작업 흐름을 자율 실행하는 에이전트형 도구로 패러다임 이동
3. **엔터프라이즈 확산**: Claude Code 엔터프라이즈 매출이 전체의 절반 이상을 차지, 대기업 도입 가속화
4. **MCP 표준화**: 2026년 초 MCP가 AI-툴 통합의 사실상 표준으로 자리잡음
5. **자율 PR 생성**: Claude Code가 Slack 멘션만으로 버그를 인식하고 PR을 만드는 수준에 도달
6. **AI 코딩 시장 참여 개발자 비율**: 2025~2026년 기준 **67%의 개발자**가 AI 도구를 일상 업무에 활용 (2년 전 30% 대비 2배 이상 성장)

---

### 9. 권한 모드와 안전 설계

Claude Code는 3가지 권한 모드를 제공한다:
- **기본 모드**: 모든 파일 수정/명령 실행 전 사용자 승인 필요
- **자동 승인 모드** (Shift+Tab): 반복 승인 없이 빠르게 작업 진행
- **플랜 모드**: 실행 전 Claude가 계획을 먼저 제시하고 승인 후 실행

`Escape` 키로 언제든 작업 중단 가능. 안전한 에이전트 사용을 위한 핵심 설계.

---

### 10. CLAUDE.md — 프로젝트 맞춤 설정

프로젝트 루트에 `CLAUDE.md` 파일을 두면 Claude Code가 자동으로 읽어 프로젝트별 지침을 따른다:
- 코딩 스타일, 네이밍 컨벤션
- 테스트 실행 방법, 빌드 명령어
- 프로젝트 아키텍처 설명
- 개인용 `CLAUDE.local.md`도 지원 (gitignore 가능)

---

### 11. 요금제

| 플랜 | 월 요금 | 특징 |
|---|---|---|
| Free | $0 | 제한된 사용량 |
| Pro | $20 | 일반 개발 작업에 적합 |
| Max (5x) | $100 | 대규모 프로젝트, Opus 모델 |
| Max (20x) | $200 | 최대 사용량, 팀 프로젝트 |

---

### 12. 흔한 실수와 베스트 프랙티스

- **즉시 코딩 시작** ❌ → `/plan`으로 계획 먼저 세우기 ✅
- **결과 검증 생략** ❌ → 변경 후 테스트/빌드 확인 ✅
- **대화 무한 연장** ❌ → `/clear`로 새 작업마다 초기화 ✅
- **테스트 코드 직접 수정** ❌ → 소스 코드를 수정하여 테스트 통과시키기 ✅

---

## 참고 출처

- [Claude Code 공식 문서 (한국어)](https://docs.anthropic.com/ko/docs/agents-and-tools/claude-code/overview)
- [Claude Code 설정 가이드](https://code.claude.com/docs/en/setup)
- [GitHub - anthropics/claude-code](https://github.com/anthropics/claude-code)
- [Claude Code ARR $1B 달성 (Anthropic 공식)](https://www.anthropic.com/news/anthropic-acquires-bun-as-claude-code-reaches-usd1b-milestone)
- [Claude Code 115,000 개발자 돌파](https://ppc.land/claude-code-reaches-115-000-developers-processes-195-million-lines-weekly/)
- [Anthropic ARR $140억 달성](https://www.saastr.com/anthropic-just-hit-14-billion-in-arr-up-from-1-billion-just-14-months-ago/)
- [AI 코딩 도구 비교 2026](https://localaimaster.com/tools/best-ai-coding-tools)
- [Claude Code 슬래시 명령어 공식 가이드](https://code.claude.com/docs/en/slash-commands)
- [Dario Amodei AI 코딩 90% 발언](https://www.itpro.com/software/development/claude-code-creator-boris-cherny-says-software-engineers-are-more-important-than-ever-as-ai-transforms-the-profession-but-anthropic-ceo-dario-amodei-still-thinks-full-automation-is-coming)
- [개발자 AI 도구 생산성 통계](https://www.index.dev/blog/developer-productivity-statistics-with-ai-tools)
