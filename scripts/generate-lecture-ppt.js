'use strict';

const fs = require('fs');
const path = require('path');
const Module = require('module');
const PptxGenJS = require('pptxgenjs');

process.env.NODE_PATH = [
  path.join(__dirname, '..', 'node_modules'),
  process.env.NODE_PATH || '',
].filter(Boolean).join(path.delimiter);
Module._initPaths();

const html2pptx = require(path.join(
  process.env.HOME,
  '.claude/skills/pptx/scripts/html2pptx.js'
));

const ROOT = path.join(__dirname, '..');
const WORK_DIR = path.join(ROOT, 'workspace', 'lecture-ppt');
const SLIDE_DIR = path.join(WORK_DIR, 'slides');
const OUT_FILE = path.join(ROOT, 'output', 'lecture-slides.pptx');

const THEME = {
  bg: '#1A1A2E',
  panel: '#20243C',
  panelSoft: '#252B49',
  stroke: '#2D63E2',
  text: '#FFFFFF',
  mute: '#B0B0B0',
};

const css = `
html { background: ${THEME.bg}; }
body {
  width: 720pt;
  height: 405pt;
  margin: 0;
  padding: 0;
  display: flex;
  background: ${THEME.bg};
  color: ${THEME.text};
  font-family: Arial, Helvetica, sans-serif;
}
.slide {
  width: 100%;
  height: 100%;
  padding: 24pt 28pt 22pt;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10pt;
}
.kicker {
  font-size: 11pt;
  font-weight: 700;
  color: ${THEME.stroke};
  letter-spacing: 0.6pt;
  margin: 0;
}
h1 {
  font-family: 'Arial Black', Impact, Arial, sans-serif;
  font-size: 36pt;
  line-height: 1.05;
  margin: 0;
  color: ${THEME.text};
}
h2 {
  font-family: 'Arial Black', Impact, Arial, sans-serif;
  font-size: 24pt;
  line-height: 1.15;
  margin: 0;
  color: ${THEME.text};
}
h3 {
  font-family: Arial, Helvetica, sans-serif;
  margin: 0;
  font-size: 14pt;
  color: ${THEME.stroke};
}
p {
  margin: 0;
  font-size: 12pt;
  line-height: 1.35;
  color: ${THEME.text};
}
.sub {
  color: ${THEME.mute};
  font-size: 13pt;
}
.tiny { font-size: 10pt; color: ${THEME.mute}; }
.body { flex: 1; display: flex; flex-direction: column; gap: 10pt; }
.row { display: flex; gap: 10pt; align-items: stretch; }
.row.center { align-items: center; justify-content: center; }
.col { flex: 1; display: flex; flex-direction: column; gap: 8pt; }
.card {
  background: ${THEME.panel};
  border: 1.5pt solid ${THEME.stroke};
  border-radius: 10pt;
  padding: 10pt 12pt;
  box-sizing: border-box;
}
.card.soft {
  background: ${THEME.panelSoft};
  border-color: #3A4E9A;
}
ul, ol { margin: 0; padding-left: 18pt; display: flex; flex-direction: column; gap: 5pt; }
li { color: ${THEME.text}; font-size: 11.5pt; line-height: 1.3; }
.chip {
  display: inline-block;
  color: ${THEME.stroke};
  font-weight: 700;
}
.metric { font-family: 'Arial Black', Impact, Arial, sans-serif; font-size: 28pt; color: ${THEME.stroke}; }
.metric-small { font-family: 'Arial Black', Impact, Arial, sans-serif; font-size: 20pt; color: ${THEME.stroke}; }
.arrow {
  font-family: 'Arial Black', Impact, Arial, sans-serif;
  color: ${THEME.stroke};
  font-size: 18pt;
  text-align: center;
}
.flow-box {
  background: ${THEME.panel};
  border: 1.5pt solid ${THEME.stroke};
  border-radius: 8pt;
  padding: 8pt;
  min-height: 50pt;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4pt;
}
.flow-box p { text-align: center; font-size: 9.4pt; line-height: 1.22; }
.flow-box h3 { text-align: center; font-size: 10pt; }
.table { display: flex; flex-direction: column; gap: 3pt; }
.tr { display: flex; gap: 3pt; }
.th, .td {
  flex: 1;
  padding: 6pt 7pt;
  border-radius: 6pt;
  background: ${THEME.panelSoft};
  border: 1pt solid #3A4E9A;
}
.th { background: #223A7A; border-color: ${THEME.stroke}; }
.th p { font-size: 9.8pt; font-weight: 700; text-align: center; }
.td p { font-size: 9.6pt; line-height: 1.22; }
.code {
  font-family: 'Courier New', monospace;
  font-size: 9pt;
  line-height: 1.3;
  white-space: pre-wrap;
  color: #DCE6FF;
}
.footer {
  border-top: 1pt solid #30447C;
  padding-top: 5pt;
}
.footer p { font-size: 10pt; color: ${THEME.mute}; }
.center-hero { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 14pt; }
.badge-row { display: flex; gap: 6pt; flex-wrap: wrap; }
.badge-row p { font-size: 9.6pt; }
`;

function htmlDoc(slide) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <style>${css}</style>
</head>
<body>
  <div class="slide">
    ${slide.kicker ? `<p class="kicker">${slide.kicker}</p>` : ''}
    ${slide.title ? `<h1>${slide.title}</h1>` : ''}
    ${slide.subtitle ? `<p class="sub">${slide.subtitle}</p>` : ''}
    <div class="body">${slide.body}</div>
    ${slide.footer ? `<div class="footer"><p>${slide.footer}</p></div>` : ''}
  </div>
</body>
</html>`;
}

const slides = [
  {
    kicker: '2시간 강의 · 설명 파트',
    title: 'AI가 일하게 하라',
    subtitle: 'Claude Code로 인스타 카드뉴스 자동화',
    body: `
      <div class="center-hero">
        <div class="row">
          <div class="card"><p class="metric">한 줄 입력</p><p>카드뉴스 생성 요청</p></div>
          <div class="card"><p class="metric">자동 파이프라인</p><p>리서치부터 렌더링까지</p></div>
        </div>
        <p class="tiny">오늘 목표: AI를 도구가 아니라 실무 실행 시스템으로 설계한다.</p>
      </div>`,
  },
  {
    kicker: '파트 1 · Why & What',
    title: '오늘 다룰 범위',
    subtitle: '실습 구간은 라이브 화면 공유, 이 자료는 설명 구간만 담았습니다.',
    body: `
      <div class="row">
        <div class="card col">
          <h3>강의 중심</h3>
          <ul>
            <li>문제 정의와 아키텍처</li>
            <li>CLAUDE.md 메타 패턴</li>
            <li>멀티 에이전트 토론 설계</li>
            <li>템플릿과 렌더링 엔진</li>
            <li>운영 체크리스트와 확장</li>
          </ul>
        </div>
        <div class="card soft col">
          <h3>실습 분리 원칙</h3>
          <ul>
            <li>실습 슬라이드 최소화</li>
            <li>터미널/에디터 실제 화면 사용</li>
            <li>설명 슬라이드는 의사결정 중심</li>
            <li>핵심 구조를 먼저 이해 후 실행</li>
          </ul>
        </div>
      </div>`,
  },
  {
    kicker: '파트 1 · Problem',
    title: '왜 자동화가 필요한가',
    subtitle: '카드뉴스 1세트 제작 시간을 비교하면 답이 보입니다.',
    body: `
      <div class="row">
        <div class="col card">
          <h3>기존 제작</h3>
          <p class="metric">디자이너 2시간</p>
          <p class="metric-small">카피 1시간</p>
          <p class="sub">총 3시간, 반복할수록 비용 증가</p>
        </div>
        <div class="col card soft">
          <h3>AI 파이프라인</h3>
          <p class="metric">약 3분</p>
          <p class="metric-small">동일 품질 반복 가능</p>
          <p class="sub">요청만 바꿔 다량 생성</p>
        </div>
      </div>
      <div class="card"><p>핵심 전환: <span class="chip">사람이 직접 제작</span>에서 <span class="chip">AI 시스템 운영</span>으로 이동</p></div>`,
  },
  {
    kicker: '파트 1 · Architecture',
    title: '전체 아키텍처 한눈에 보기',
    subtitle: '요청 파싱 → 리서치 → 검증 → 카피 토론 → 렌더링 → 검토',
    body: `
      <div class="row center">
        <div class="flow-box"><h3>Step 1</h3><p>요청 파싱</p></div><p class="arrow">→</p>
        <div class="flow-box"><h3>Step 2</h3><p>리서치</p></div><p class="arrow">→</p>
        <div class="flow-box"><h3>Step 2.5</h3><p>리서치 검증</p></div>
      </div>
      <div class="row center">
        <div class="flow-box"><h3>Step 3.5</h3><p>카피 토론</p></div><p class="arrow">→</p>
        <div class="flow-box"><h3>Step 4</h3><p>렌더링</p></div><p class="arrow">→</p>
        <div class="flow-box"><h3>Step 5</h3><p>시각 검토</p></div>
      </div>
      <p class="tiny">핵심: 생성 전에 검증, 생성 후 검토를 넣어 품질을 닫는다.</p>`,
  },
  {
    kicker: '파트 2 · CLAUDE.md',
    title: 'CLAUDE.md = AI의 업무 매뉴얼',
    subtitle: '코드보다 먼저 실행 규칙을 정의하면 AI가 오케스트레이터가 됩니다.',
    body: `
      <div class="row">
        <div class="card col">
          <h3>무엇을 정의하나</h3>
          <ul>
            <li>단계별 실행 순서</li>
            <li>역할별 책임과 통과 기준</li>
            <li>입출력 데이터 형식</li>
          </ul>
        </div>
        <div class="card soft col">
          <h3>왜 중요한가</h3>
          <ul>
            <li>매번 프롬프트를 길게 쓰지 않아도 됨</li>
            <li>품질 기준이 자동으로 적용됨</li>
            <li>팀이 동일한 방식으로 재사용 가능</li>
          </ul>
        </div>
      </div>`,
    footer: '메시지: CLAUDE.md는 AI 사용법 문서가 아니라 운영 설계서다.',
  },
  {
    kicker: '파트 2 · 구조 해부',
    title: 'CLAUDE.md 구성 요소',
    subtitle: '워크플로우, 슬라이드 타입, 템플릿 가이드, 카피 가이드라인',
    body: `
      <div class="row">
        <div class="col card"><h3>워크플로우 정의</h3><p>Step 1~5 실행 순서와 분기 조건</p></div>
        <div class="col card"><h3>슬라이드 타입 레퍼런스</h3><p>14개 타입과 필드 계약</p></div>
      </div>
      <div class="row">
        <div class="col card soft"><h3>템플릿 스타일 가이드</h3><p>8개 스타일의 시각 철학</p></div>
        <div class="col card soft"><h3>카피라이팅 규칙</h3><p>문장 길이, 톤, CTA 기준</p></div>
      </div>
      <p class="tiny">문서 구조가 명확할수록 에이전트 실행 오류가 줄어든다.</p>`,
  },
  {
    kicker: '파트 2 · 메타 패턴 1',
    title: '파이프라인 패턴',
    subtitle: '단계를 분해해 실패 지점을 독립적으로 관리합니다.',
    body: `
      <div class="table">
        <div class="tr"><div class="th"><p>단계</p></div><div class="th"><p>입력</p></div><div class="th"><p>출력</p></div><div class="th"><p>실패 시 처리</p></div></div>
        <div class="tr"><div class="td"><p>Step 2</p></div><div class="td"><p>topic</p></div><div class="td"><p>research.md</p></div><div class="td"><p>재검색</p></div></div>
        <div class="tr"><div class="td"><p>Step 2.5</p></div><div class="td"><p>research.md</p></div><div class="td"><p>검증된 리서치</p></div><div class="td"><p>수정/삭제</p></div></div>
        <div class="tr"><div class="td"><p>Step 3.5</p></div><div class="td"><p>검증 리서치</p></div><div class="td"><p>slides.json</p></div><div class="td"><p>라운드 반복</p></div></div>
      </div>
      <p class="sub">핵심: 각 단계는 입력/출력/통과 기준이 반드시 있어야 한다.</p>`,
  },
  {
    kicker: '파트 2 · 메타 패턴 1',
    title: '파이프라인 다이어그램',
    subtitle: '직렬 실행 + 병렬 검증을 혼합한 구조',
    body: `
      <div class="row center">
        <div class="flow-box"><h3>리서치</h3><p>핵심 포인트 수집</p></div>
        <p class="arrow">→</p>
        <div class="flow-box"><h3>검증 브랜치</h3><p>팩트체커 / 보완리서처</p></div>
        <p class="arrow">→</p>
        <div class="flow-box"><h3>병합</h3><p>정합성 보장</p></div>
      </div>
      <div class="row center">
        <div class="flow-box"><h3>카피 토론</h3><p>copywriter vs hook-expert</p></div>
        <p class="arrow">→</p>
        <div class="flow-box"><h3>렌더링</h3><p>Puppeteer PNG</p></div>
        <p class="arrow">→</p>
        <div class="flow-box"><h3>시각 검토</h3><p>잘림/가독성 확인</p></div>
      </div>`,
  },
  {
    kicker: '파트 2 · 메타 패턴 2',
    title: '에이전트 역할 정의 패턴',
    subtitle: '역할·모델·임무·통과기준을 명시하면 토론이 설계됩니다.',
    body: `
      <div class="table">
        <div class="tr"><div class="th"><p>역할</p></div><div class="th"><p>모델</p></div><div class="th"><p>임무</p></div><div class="th"><p>통과 기준</p></div></div>
        <div class="tr"><div class="td"><p>팩트체커</p></div><div class="td"><p>sonnet</p></div><div class="td"><p>수치 출처 검증</p></div><div class="td"><p>확인됨 100%</p></div></div>
        <div class="tr"><div class="td"><p>보완리서처</p></div><div class="td"><p>sonnet</p></div><div class="td"><p>누락 정보 보완</p></div><div class="td"><p>핵심 포인트 5+</p></div></div>
        <div class="tr"><div class="td"><p>후킹전문가</p></div><div class="td"><p>sonnet</p></div><div class="td"><p>카피 평가</p></div><div class="td"><p>후킹점수 7+</p></div></div>
      </div>`,
  },
  {
    kicker: '파트 2 · 메타 패턴 3',
    title: '데이터 계약 패턴: slides.json',
    subtitle: '카피 결과를 템플릿 엔진과 렌더러가 이해할 수 있게 표준화',
    body: `
      <div class="row">
        <div class="col card">
          <h3>필수 필드</h3>
          <ul>
            <li>slide: 순번</li>
            <li>type: 템플릿 타입</li>
            <li>headline/body: 콘텐츠</li>
          </ul>
        </div>
        <div class="col card soft">
          <h3>타입별 필드</h3>
          <ul>
            <li>content-stat: emphasis</li>
            <li>content-steps: step1~3</li>
            <li>cta: cta_text</li>
          </ul>
        </div>
      </div>
      <div class="card"><p class="code">[ {"slide":1,"type":"cover"}, {"slide":2,"type":"content"}, {"slide":3,"type":"content-stat"} ]</p></div>`,
  },
  {
    kicker: '파트 2 · 계약 예시',
    title: '데이터 계약이 만드는 이점',
    subtitle: '생성-검증-렌더링이 같은 언어로 연결됩니다.',
    body: `
      <div class="row">
        <div class="card col"><h3>생성 단계</h3><p>copywriter가 slides.json 작성</p></div>
        <div class="card col"><h3>검증 단계</h3><p>hook-expert가 필드 단위 피드백</p></div>
        <div class="card col"><h3>렌더링 단계</h3><p>type으로 HTML 템플릿 매칭</p></div>
      </div>
      <div class="card soft">
        <p>핵심 문장: 데이터 계약이 없으면 토론 결과를 자동 렌더링할 수 없다.</p>
      </div>`,
  },
  {
    kicker: '파트 2 · Key Takeaway',
    title: '정리: CLAUDE.md는 설계서다',
    subtitle: '좋은 프롬프트보다 중요한 것은 좋은 운영 규격입니다.',
    body: `
      <div class="card">
        <ol>
          <li>워크플로우를 단계로 분해한다.</li>
          <li>역할과 통과기준을 분명히 쓴다.</li>
          <li>slides.json 같은 데이터 계약을 만든다.</li>
        </ol>
      </div>
      <div class="badge-row"><p class="chip">재현성</p><p class="chip">품질 일관성</p><p class="chip">팀 확장성</p></div>`,
  },
  {
    kicker: '파트 3 · Step 2.5',
    title: '리서치 검증 플로우',
    subtitle: '팩트체커 + 보완리서처 병렬 실행 후 오케스트레이터 병합',
    body: `
      <div class="row center">
        <div class="flow-box"><h3>입력</h3><p>workspace/research.md</p></div>
        <p class="arrow">→</p>
        <div class="flow-box"><h3>병렬 검증</h3><p>출처 확인 + 누락 탐색</p></div>
        <p class="arrow">→</p>
        <div class="flow-box"><h3>최종 리서치</h3><p>확인됨 중심 정리</p></div>
      </div>
      <div class="row">
        <div class="card col"><p>분류: 확인됨 / 미확인 / 수정필요</p></div>
        <div class="card soft col"><p>통과: 모든 수치 확인 + 핵심 포인트 5개 이상</p></div>
      </div>`,
  },
  {
    kicker: '파트 3 · Step 2.5',
    title: '팩트체커 vs 보완리서처',
    subtitle: '동일 입력을 서로 다른 관점으로 읽게 설계합니다.',
    body: `
      <div class="row">
        <div class="col card">
          <h3>팩트체커</h3>
          <ul>
            <li>통계 출처 링크 검증</li>
            <li>오래된 데이터 탐지</li>
            <li>오표기 수치 수정 제안</li>
          </ul>
        </div>
        <div class="col card soft">
          <h3>보완리서처</h3>
          <ul>
            <li>누락된 핵심 맥락 추가</li>
            <li>독립 소스로 교차 검증</li>
            <li>추가 인사이트 발굴</li>
          </ul>
        </div>
      </div>
      <p class="sub">같은 AI라도 역할을 분리하면 품질이 구조적으로 올라간다.</p>`,
  },
  {
    kicker: '파트 3 · Step 3.5',
    title: '카피 토론 시퀀스',
    subtitle: 'TeamCreate → TaskCreate → SendMessage 라운드 반복',
    body: `
      <div class="row center">
        <div class="flow-box"><h3>1</h3><p>TeamCreate</p></div><p class="arrow">→</p>
        <div class="flow-box"><h3>2</h3><p>TaskCreate</p></div><p class="arrow">→</p>
        <div class="flow-box"><h3>3</h3><p>초안 공유</p></div>
      </div>
      <div class="row center">
        <div class="flow-box"><h3>4</h3><p>후킹 점수</p></div><p class="arrow">→</p>
        <div class="flow-box"><h3>5</h3><p>피드백 반영</p></div><p class="arrow">→</p>
        <div class="flow-box"><h3>6</h3><p>합의 후 종료</p></div>
      </div>
      <p class="tiny">최대 3라운드, 후킹 점수 7점 이상에서 확정</p>`,
  },
  {
    kicker: '파트 3 · Team 구조',
    title: 'copywriter ↔ hook-expert',
    subtitle: '생성자와 평가자를 분리해 자기검열 루프를 만듭니다.',
    body: `
      <div class="row center">
        <div class="card col"><h3>copywriter</h3><p>research 기반 초안 작성</p></div>
        <div class="col" style="flex:0.45; justify-content:center;">
          <p class="arrow">SendMessage</p>
          <p class="arrow">↕</p>
          <p class="arrow">SendMessage</p>
        </div>
        <div class="card soft col"><h3>hook-expert</h3><p>후킹 점수 + 대안 제시</p></div>
      </div>
      <div class="card"><p>역할 분리의 목적: 더 공격적인 평가를 가능하게 해 품질 상한을 올린다.</p></div>`,
  },
  {
    kicker: '파트 3 · 설계 원칙',
    title: '토론 설계 원칙 3가지',
    subtitle: '역할 분리, 정량 기준, 라운드 제한',
    body: `
      <div class="row">
        <div class="card col"><p class="metric-small">01</p><h3>역할 분리</h3><p>생성자와 평가자 분리</p></div>
        <div class="card col"><p class="metric-small">02</p><h3>정량 기준</h3><p>후킹 점수 7점 이상</p></div>
        <div class="card col"><p class="metric-small">03</p><h3>라운드 제한</h3><p>최대 3회 반복</p></div>
      </div>
      <p class="sub">무한 토론을 방지하면서도 개선 루프를 보장하는 최소 규칙 세트</p>`,
  },
  {
    kicker: '파트 3 · 품질 비교',
    title: 'Before / After',
    subtitle: 'AI 1명 실행과 AI 2명 토론의 결과 차이',
    body: `
      <div class="row">
        <div class="col card">
          <h3>단일 에이전트</h3>
          <p class="metric">70점</p>
          <ul>
            <li>초안 속도는 빠름</li>
            <li>표현 품질 편차 큼</li>
          </ul>
        </div>
        <div class="col card soft">
          <h3>토론 에이전트</h3>
          <p class="metric">90점</p>
          <ul>
            <li>후킹 강도 상승</li>
            <li>CTA 명확도 향상</li>
          </ul>
        </div>
      </div>
      <p class="tiny">메시지: 품질은 모델 크기보다 평가 구조에서 더 많이 오른다.</p>`,
  },
  {
    kicker: '파트 3 · Key Takeaway',
    title: '토론 시스템의 핵심',
    subtitle: '좋은 결과를 만드는 것은 생성이 아니라 평가 설계입니다.',
    body: `
      <div class="card">
        <ol>
          <li>역할을 분리해 서로 견제하게 만든다.</li>
          <li>점수와 통과선을 숫자로 고정한다.</li>
          <li>반복 횟수를 제한해 운영비를 관리한다.</li>
        </ol>
      </div>`,
  },
  {
    kicker: '파트 4 · 템플릿 시스템',
    title: '8 스타일 × 14 타입 = 112 템플릿',
    subtitle: '디자인 재사용성과 확장성을 동시에 확보',
    body: `
      <div class="row">
        <div class="card col"><p class="metric">8</p><p>스타일 세트</p></div>
        <div class="card col"><p class="metric">14</p><p>슬라이드 타입</p></div>
        <div class="card soft col"><p class="metric">112</p><p>조합 가능한 HTML 템플릿</p></div>
      </div>
      <div class="card"><p>모든 템플릿은 self-contained HTML. 외부 의존성 없이 바로 렌더링.</p></div>`,
  },
  {
    kicker: '파트 4 · 스타일 비교',
    title: '8개 스타일 그리드',
    subtitle: '주제와 브랜드 톤에 맞게 스타일만 교체하면 됩니다.',
    body: `
      <div class="table">
        <div class="tr"><div class="td"><p>minimal</p></div><div class="td"><p>bold</p></div><div class="td"><p>elegant</p></div><div class="td"><p>premium</p></div></div>
        <div class="tr"><div class="td"><p>toss</p></div><div class="td"><p>magazine</p></div><div class="td"><p>clean</p></div><div class="td"><p>blueprint</p></div></div>
      </div>
      <div class="row">
        <div class="card col"><p>브랜드 톤 유지</p></div>
        <div class="card soft col"><p>같은 콘텐츠, 다른 분위기</p></div>
      </div>`,
  },
  {
    kicker: '파트 4 · 템플릿 구조',
    title: 'HTML 템플릿 구조',
    subtitle: 'self-contained HTML + {{placeholder}} 치환',
    body: `
      <div class="card"><p class="code">templates/{style}/{type}.html
{{headline}} {{body}} {{accent_color}} {{account_name}}
CSS + 레이아웃 + 타이포가 파일 하나에 포함</p></div>
      <div class="row">
        <div class="card col"><p>장점 1: 수정 포인트가 명확</p></div>
        <div class="card col"><p>장점 2: 스타일 단위 버전 관리</p></div>
      </div>`,
  },
  {
    kicker: '파트 4 · render.js',
    title: '렌더링 파이프라인',
    subtitle: 'slides.json → template 매칭 → 치환 → Puppeteer 스크린샷',
    body: `
      <div class="row center">
        <div class="flow-box"><h3>입력</h3><p>workspace/slides.json</p></div><p class="arrow">→</p>
        <div class="flow-box"><h3>매칭</h3><p>type 기반 HTML 선택</p></div><p class="arrow">→</p>
        <div class="flow-box"><h3>치환</h3><p>applyPlaceholders()</p></div>
      </div>
      <div class="row center">
        <div class="flow-box"><h3>Puppeteer</h3><p>1080×1350 캡처</p></div><p class="arrow">→</p>
        <div class="flow-box"><h3>출력</h3><p>output/slide_XX.png</p></div>
      </div>`,
  },
  {
    kicker: '파트 4 · 치환 로직',
    title: 'applyPlaceholders() 핵심',
    subtitle: '30개 이상 필드를 안전하게 문자열 치환',
    body: `
      <div class="row">
        <div class="card col">
          <h3>기본 필드</h3>
          <ul>
            <li>headline / body / subtext</li>
            <li>accent_color / account_name</li>
            <li>slide_number / total_slides</li>
          </ul>
        </div>
        <div class="card soft col">
          <h3>타입별 필드</h3>
          <ul>
            <li>step1~3, item1~5</li>
            <li>grid1~4, bigdata_number</li>
            <li>badge_text, body2 등</li>
          </ul>
        </div>
      </div>`,
  },
  {
    kicker: '파트 4 · 스타일 선택 가이드',
    title: '8개 스타일 빠른 선택표',
    subtitle: '콘텐츠 주제에 맞는 디자인 톤을 고르는 기준',
    body: `
      <div class="table">
        <div class="tr"><div class="th"><p>스타일</p></div><div class="th"><p>느낌</p></div><div class="th"><p>추천 주제</p></div></div>
        <div class="tr"><div class="td"><p>minimal / clean</p></div><div class="td"><p>신뢰, 정보형</p></div><div class="td"><p>비즈니스, 교육</p></div></div>
        <div class="tr"><div class="td"><p>bold / premium</p></div><div class="td"><p>강한 임팩트</p></div><div class="td"><p>트렌드, 마케팅</p></div></div>
        <div class="tr"><div class="td"><p>elegant / magazine</p></div><div class="td"><p>감성, 브랜딩</p></div><div class="td"><p>라이프스타일</p></div></div>
      </div>`,
  },
  {
    kicker: '파트 4 · Key Takeaway',
    title: '정리: 프로급 아웃풋의 비결',
    subtitle: '잘 만든 템플릿 시스템이 품질과 속도를 동시에 만든다.',
    body: `
      <div class="card">
        <ol>
          <li>스타일과 타입을 분리해 확장한다.</li>
          <li>데이터 계약으로 렌더러를 단순화한다.</li>
          <li>시각 검토 루프로 최종 품질을 닫는다.</li>
        </ol>
      </div>`,
  },
  {
    kicker: '파트 5 · 실전 가이드',
    title: '라이브 데모에서 볼 포인트',
    subtitle: '실습 중 관찰해야 할 로그와 산출물',
    body: `
      <div class="row">
        <div class="card col">
          <h3>1단계</h3><p>workspace/research.md 생성</p>
          <h3>2단계</h3><p>Team 토론 점수 로그</p>
        </div>
        <div class="card soft col">
          <h3>3단계</h3><p>workspace/slides.json 완성</p>
          <h3>4단계</h3><p>output/slide_XX.png 품질</p>
        </div>
      </div>
      <p class="tiny">관찰 질문: 어느 단계에서 품질이 가장 크게 변하는가?</p>`,
  },
  {
    kicker: '파트 5 · 트러블슈팅',
    title: '자주 발생하는 이슈 1',
    subtitle: '환경/실행 단계의 오류를 빠르게 정리',
    body: `
      <div class="table">
        <div class="tr"><div class="th"><p>문제</p></div><div class="th"><p>원인</p></div><div class="th"><p>해결</p></div></div>
        <div class="tr"><div class="td"><p>Puppeteer 실행 실패</p></div><div class="td"><p>브라우저 의존성 누락</p></div><div class="td"><p>설치 스크립트 재실행</p></div></div>
        <div class="tr"><div class="td"><p>슬라이드 생성 중단</p></div><div class="td"><p>JSON 필드 누락</p></div><div class="td"><p>type별 필드 검증</p></div></div>
      </div>`,
  },
  {
    kicker: '파트 5 · 트러블슈팅',
    title: '자주 발생하는 이슈 2',
    subtitle: '출력 품질 문제를 빠르게 복구',
    body: `
      <div class="table">
        <div class="tr"><div class="th"><p>문제</p></div><div class="th"><p>진단 포인트</p></div><div class="th"><p>해결</p></div></div>
        <div class="tr"><div class="td"><p>텍스트 잘림</p></div><div class="td"><p>문장 길이 과다</p></div><div class="td"><p>한 줄 길이 축소</p></div></div>
        <div class="tr"><div class="td"><p>한글 폰트 깨짐</p></div><div class="td"><p>런타임 폰트 미설치</p></div><div class="td"><p>시스템 폰트 설치</p></div></div>
        <div class="tr"><div class="td"><p>디자인 불일치</p></div><div class="td"><p>accent/color 미통일</p></div><div class="td"><p>템플릿 변수 정리</p></div></div>
      </div>`,
  },
  {
    kicker: '파트 6 · 확장',
    title: '확장 아이디어 3가지',
    subtitle: '강의 이후 바로 적용 가능한 확장 방향',
    body: `
      <div class="row">
        <div class="card col"><p class="metric-small">01</p><p>BOOTSTRAP_PROMPT.md로 빈 폴더 자동 세팅</p></div>
        <div class="card col"><p class="metric-small">02</p><p>skill-package로 /card-news 한 줄 실행</p></div>
        <div class="card soft col"><p class="metric-small">03</p><p>썸네일, 블로그, 프레젠테이션으로 응용</p></div>
      </div>`,
  },
  {
    kicker: '파트 6 · 마무리',
    title: '3줄 핵심 정리',
    subtitle: '오늘 가져가야 할 핵심만 남깁니다.',
    body: `
      <div class="card">
        <ol>
          <li>CLAUDE.md는 AI 시스템 설계서다.</li>
          <li>멀티 에이전트 토론은 품질 보증 장치다.</li>
          <li>템플릿 시스템이 프로급 출력의 기반이다.</li>
        </ol>
      </div>`,
  },
  {
    kicker: '마지막 슬라이드',
    title: '감사합니다',
    subtitle: 'Q&A · AI가 일하는 시스템을 직접 설계해봅시다.',
    body: `
      <div class="center-hero">
        <div class="row">
          <div class="card"><p class="metric">질문 환영</p><p>구조, 운영, 확장 무엇이든</p></div>
          <div class="card soft"><p class="metric">바로 적용</p><p>오늘 만든 구조를 팀에 이식</p></div>
        </div>
      </div>`,
  },
];

async function main() {
  fs.mkdirSync(SLIDE_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Yang Jeonghwa';
  pptx.company = 'instagram-card-news';
  pptx.subject = 'AI lecture';
  pptx.title = 'AI가 일하게 하라 — Claude Code로 인스타 카드뉴스 자동화';

  for (let i = 0; i < slides.length; i += 1) {
    const n = String(i + 1).padStart(2, '0');
    const htmlPath = path.join(SLIDE_DIR, `slide-${n}.html`);
    fs.writeFileSync(htmlPath, htmlDoc(slides[i]), 'utf8');
    await html2pptx(htmlPath, pptx);
  }

  await pptx.writeFile({ fileName: OUT_FILE });
  console.log(`Generated: ${OUT_FILE}`);
  console.log(`Slides: ${slides.length}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
