---
name: card-news-setup
description: Instagram 카드뉴스 자동 생성 프로젝트를 현재 폴더에 세팅합니다. 빈 폴더에서 /card-news-setup을 실행하면 팀 에이전트 기반 카드뉴스 파이프라인(리서치→검증→카피→토론→렌더링→검토)이 완성됩니다.
argument-hint: [--account 계정명] [--accent #HEX색상]
disable-model-invocation: true
allowed-tools: Write, Bash, Read, Glob, Grep, Edit
---

# Instagram 카드뉴스 프로젝트 세팅

현재 폴더에 Instagram 카드뉴스 자동 생성 프로젝트를 세팅합니다.

사용자 인수 `$ARGUMENTS`에서 옵션을 파싱합니다:
- `--account <이름>`: config.json의 account_name (기본: "my_account")
- `--accent <#HEX>`: config.json의 accent_color (기본: "#8BC34A")

---

## 실행 순서

아래 단계를 **순서대로** 실행합니다. 각 단계가 완료되면 다음으로 넘어갑니다.

---

### 1단계: 디렉토리 + 인프라 파일 생성

```bash
mkdir -p templates/clean scripts workspace output
```

#### package.json

```json
{
  "name": "instagram-card-news",
  "version": "1.0.0",
  "description": "Instagram card news generator with team agent orchestration",
  "scripts": {
    "render": "node scripts/render.js",
    "sample": "node scripts/generate-samples.js"
  },
  "dependencies": {
    "puppeteer": "^23.0.0"
  }
}
```

#### .gitignore

```
node_modules/
output/
sample-output/
.DS_Store
```

#### config.json

account_name과 accent_color는 사용자 인수가 있으면 적용합니다.

```json
{
  "version": "3.0",
  "defaults": {
    "template": "clean",
    "accent_color": "#8BC34A",
    "account_name": "my_account",
    "slide_count": 7
  },
  "templates": {
    "clean": {
      "description": "클린 에디토리얼 스타일 라이트그레이 + 그린 하이라이트",
      "accent_color": "#8BC34A",
      "background": "light-gray"
    }
  },
  "dimensions": {
    "width": 1080,
    "height": 1350
  },
  "output_dir": "output",
  "workspace_dir": "workspace"
}
```

---

### 2단계: scripts/render.js 생성

아래 코드를 **그대로** 생성합니다:

```javascript
'use strict';

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function applyPlaceholders(html, slide, opts, index, total) {
  const body = (slide.body || '').replace(/\n/g, '<br>');

  const replacements = {
    '{{headline}}': (slide.headline || '').replace(/\n/g, '<br>'),
    '{{subtext}}': (slide.subtext || '').replace(/\n/g, '<br>'),
    '{{body}}': body,
    '{{emphasis}}': (slide.emphasis || '').replace(/\n/g, '<br>'),
    '{{cta_text}}': slide.cta_text || '',
    '{{slide_number}}': String(index + 1).padStart(2, '0'),
    '{{total_slides}}': String(total).padStart(2, '0'),
    '{{accent_color}}': opts.accent || config.defaults.accent_color,
    '{{account_name}}': opts.account || config.defaults.account_name,
    '{{image_url}}': slide.image_url || '',
    '{{badge_text}}': slide.badge_text || '',
    '{{step1}}': (slide.step1 || '').replace(/\n/g, '<br>'),
    '{{step2}}': (slide.step2 || '').replace(/\n/g, '<br>'),
    '{{step3}}': (slide.step3 || '').replace(/\n/g, '<br>'),
    '{{item1}}': (slide.item1 || '').replace(/\n/g, '<br>'),
    '{{item2}}': (slide.item2 || '').replace(/\n/g, '<br>'),
    '{{item3}}': (slide.item3 || '').replace(/\n/g, '<br>'),
    '{{item4}}': (slide.item4 || '').replace(/\n/g, '<br>'),
    '{{item5}}': (slide.item5 || '').replace(/\n/g, '<br>'),
    '{{left_title}}': slide.left_title || '',
    '{{left_body}}': (slide.left_body || '').replace(/\n/g, '<br>'),
    '{{right_title}}': slide.right_title || '',
    '{{right_body}}': (slide.right_body || '').replace(/\n/g, '<br>'),
    '{{grid1_icon}}': (slide.grid1_icon || '').replace(/\n/g, '<br>'),
    '{{grid1_title}}': (slide.grid1_title || '').replace(/\n/g, '<br>'),
    '{{grid1_desc}}': (slide.grid1_desc || '').replace(/\n/g, '<br>'),
    '{{grid2_icon}}': (slide.grid2_icon || '').replace(/\n/g, '<br>'),
    '{{grid2_title}}': (slide.grid2_title || '').replace(/\n/g, '<br>'),
    '{{grid2_desc}}': (slide.grid2_desc || '').replace(/\n/g, '<br>'),
    '{{grid3_icon}}': (slide.grid3_icon || '').replace(/\n/g, '<br>'),
    '{{grid3_title}}': (slide.grid3_title || '').replace(/\n/g, '<br>'),
    '{{grid3_desc}}': (slide.grid3_desc || '').replace(/\n/g, '<br>'),
    '{{grid4_icon}}': (slide.grid4_icon || '').replace(/\n/g, '<br>'),
    '{{grid4_title}}': (slide.grid4_title || '').replace(/\n/g, '<br>'),
    '{{grid4_desc}}': (slide.grid4_desc || '').replace(/\n/g, '<br>'),
    '{{bigdata_number}}': slide.bigdata_number || '',
    '{{bigdata_unit}}': slide.bigdata_unit || '',
    '{{headline_label}}': slide.headline_label || '',
    '{{tag1}}': slide.tag1 || '',
    '{{tag2}}': slide.tag2 || '',
    '{{tag3}}': slide.tag3 || '',
    '{{badge_number}}': slide.badge_number || '',
  };

  let result = html;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.split(placeholder).join(value);
  }
  const accentColor = opts.accent || config.defaults.accent_color;
  result = result.split('{{accent_color}}').join(accentColor);
  return result;
}

async function render(opts = {}) {
  const slidesPath = opts.slidesPath || path.join(process.cwd(), config.workspace_dir, 'slides.json');
  const style = opts.style || config.defaults.template;
  const outputDir = opts.outputDir || path.join(process.cwd(), config.output_dir);
  const accent = opts.accent || config.defaults.accent_color;
  const account = opts.account || config.defaults.account_name;

  if (!fs.existsSync(slidesPath)) {
    throw new Error('slides.json not found at: ' + slidesPath);
  }
  const slides = JSON.parse(fs.readFileSync(slidesPath, 'utf8'));

  fs.mkdirSync(outputDir, { recursive: true });

  const templateDir = path.join(__dirname, '..', 'templates', style);
  if (!fs.existsSync(templateDir)) {
    throw new Error('Template directory not found: ' + templateDir);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);
    await page.setViewport({
      width: config.dimensions.width,
      height: config.dimensions.height,
    });

    const total = slides.length;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideType = slide.type || 'content';
      const templateFile = path.join(templateDir, slideType + '.html');

      if (!fs.existsSync(templateFile)) {
        console.warn('  Warning: template not found for type "' + slideType + '", skipping slide ' + (i + 1));
        continue;
      }

      console.log('Rendering slide ' + (i + 1) + '/' + total + '...');

      const rawHtml = fs.readFileSync(templateFile, 'utf8');
      const processedHtml = applyPlaceholders(rawHtml, slide, { accent, account }, i, total);

      await page.setContent(processedHtml, { waitUntil: 'networkidle0' });

      const slideNum = String(i + 1).padStart(2, '0');
      const outputFile = path.join(outputDir, 'slide_' + slideNum + '.png');

      await page.screenshot({
        path: outputFile,
        clip: { x: 0, y: 0, width: config.dimensions.width, height: config.dimensions.height },
      });

      console.log('  Saved: ' + outputFile);
    }
  } finally {
    await browser.close();
  }

  console.log('\nDone. ' + slides.length + ' slide(s) rendered to: ' + outputDir);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--slides': opts.slidesPath = args[++i]; break;
      case '--style': opts.style = args[++i]; break;
      case '--output': opts.outputDir = args[++i]; break;
      case '--accent': opts.accent = args[++i]; break;
      case '--account': opts.account = args[++i]; break;
      default: console.warn('Unknown argument: ' + args[i]);
    }
  }
  return opts;
}

if (require.main === module) {
  const opts = parseArgs(process.argv);
  render(opts).catch((err) => {
    console.error('Render failed:', err.message);
    process.exit(1);
  });
}

module.exports = { render };
```

---

### 3단계: scripts/generate-samples.js 생성

clean 스타일에 대해 13개 슬라이드 타입을 모두 포함하는 샘플을 생성합니다.
한국어 샘플 데이터(디지털 마케팅 주제)를 내장합니다.

```javascript
'use strict';

const fs = require('fs');
const path = require('path');
const { render } = require('./render.js');

const configPath = path.join(__dirname, '..', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const sampleSlides = [
  { slide: 1, type: 'cover', headline: '2025 디지털 마케팅\n트렌드 가이드', headline_label: '카드뉴스', subtext: '성공적인 마케팅을 위한 핵심 인사이트' },
  { slide: 2, type: 'content-badge', badge_text: 'TREND', badge_number: '01', headline: 'AI가 마케팅의\n판도를 바꾼다', body: 'AI 기반 콘텐츠 생성과 자동화가\n마케팅 산업의 새로운 표준이 되고 있습니다.', subtext: '2025년 최대 화두' },
  { slide: 3, type: 'content-stat', headline: 'AI 마케팅 도입률', emphasis: '78%', body: '글로벌 기업의 78%가 마케팅에\nAI 도구를 활용하고 있습니다.' },
  { slide: 4, type: 'content', badge_number: '02', headline: '숏폼 콘텐츠의 시대', body: '15초 이내의 짧은 영상이\n가장 높은 참여율을 기록하고 있습니다.\n릴스, 쇼츠, 틱톡이 핵심 채널입니다.' },
  { slide: 5, type: 'content-steps', headline: 'AI 마케팅 도입 3단계', step1: '현재 마케팅 프로세스 분석 및 자동화 가능 영역 파악', step2: 'AI 도구 선정 및 파일럿 테스트 진행', step3: '성과 측정 후 전사 확대 적용', body: '' },
  { slide: 6, type: 'content-list', headline: '2025 핵심 마케팅 채널', item1: 'Instagram Reels — 숏폼 콘텐츠 최강자', item2: 'YouTube Shorts — 검색 연동 강점', item3: 'TikTok — Z세대 핵심 플랫폼', item4: 'LinkedIn — B2B 마케팅 필수', item5: 'Threads — 텍스트 기반 신흥 채널' },
  { slide: 7, type: 'content-split', headline: '전통 마케팅 vs AI 마케팅', left_title: '전통 마케팅', left_body: '수동 타겟팅\n긴 제작 기간\n제한된 A/B 테스트\n높은 인건비', right_title: 'AI 마케팅', right_body: '자동 세그먼테이션\n실시간 콘텐츠 생성\n무한 변형 테스트\n비용 효율성', subtext: '' },
  { slide: 8, type: 'content-highlight', headline: '가장 중요한 한 가지', emphasis: '고객 경험이\n모든 것을 결정한다', body: '기술이 아무리 발전해도 결국\n고객의 마음을 사로잡는 것은\n진정성 있는 경험입니다.', subtext: '' },
  { slide: 9, type: 'content-quote', badge_number: '03', headline: '— Seth Godin', body: '"마케팅은 더 이상\n만든 것을 파는 기술이 아니라,\n팔릴 것을 만드는 기술이다."' },
  { slide: 10, type: 'content-grid', headline: '2025 마케팅 4대 핵심 전략', grid1_icon: '🎯', grid1_title: '타겟 정밀화', grid1_desc: 'AI 기반 고객 세그먼트', grid2_icon: '📱', grid2_title: '숏폼 콘텐츠', grid2_desc: '15초 이내 영상 제작', grid3_icon: '🤖', grid3_title: 'AI 자동화', grid3_desc: '콘텐츠 생성 자동화', grid4_icon: '📊', grid4_title: '데이터 분석', grid4_desc: '실시간 성과 측정' },
  { slide: 11, type: 'content-bigdata', headline: '글로벌 AI 마케팅 시장 규모', bigdata_number: '48.8', bigdata_unit: '조원', body: '2025년 전 세계 AI 마케팅 시장은\n약 48.8조원 규모로 성장할 전망입니다.', subtext: 'Source: Statista 2025' },
  { slide: 12, type: 'content-image', badge_number: '04', headline: '비주얼 콘텐츠의 힘', body: '이미지와 영상 콘텐츠는\n텍스트 대비 65% 높은\n기억 유지율을 보여줍니다.', image_url: '' },
  { slide: 13, type: 'cta', headline: '더 많은 인사이트가\n궁금하다면', cta_text: '팔로우하고 트렌드 받아보기', subtext: '매주 새로운 마케팅 인사이트', tag1: '#마케팅트렌드', tag2: '#AI마케팅', tag3: '#디지털전략' },
];

async function generateSamples() {
  const workspaceDir = path.join(process.cwd(), config.workspace_dir);
  fs.mkdirSync(workspaceDir, { recursive: true });

  const slidesJsonPath = path.join(workspaceDir, 'slides.json');
  fs.writeFileSync(slidesJsonPath, JSON.stringify(sampleSlides, null, 2), 'utf8');
  console.log('Wrote sample slides.json to: ' + slidesJsonPath + '\n');

  const outputDir = path.join(process.cwd(), 'sample-output', 'clean');
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("Generating samples for 'clean' style...");
  try {
    await render({
      slidesPath: slidesJsonPath,
      style: 'clean',
      outputDir,
      accent: config.defaults.accent_color,
      account: config.defaults.account_name,
    });
    console.log("  Completed 'clean' style.\n");
  } catch (err) {
    console.error("  Error generating 'clean' style:", err.message);
  }

  console.log('Sample images generated at sample-output/clean/');
}

generateSamples().catch((err) => {
  console.error('Sample generation failed:', err.message);
  process.exit(1);
});
```

---

### 4단계: HTML 템플릿 13개 생성 (templates/clean/)

**팀 에이전트를 사용해서 13개 파일을 병렬로 생성합니다.**

아래는 모든 템플릿이 준수해야 하는 **clean 스타일 디자인 시스템**입니다.

#### 공통 CSS 베이스 (모든 템플릿에 적용)

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  width: 1080px;
  height: 1350px;
  overflow: hidden;
  background: #F0F0F0;
  font-family: 'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.02em;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.highlight {
  background: linear-gradient(to top, {{accent_color}}66 45%, transparent 45%);
  color: #1A1A1A;
  padding: 0 4px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
```

#### 공통 컴포넌트

**브랜드 마크** (대부분의 슬라이드 상단에 배치):
```html
<div class="brand">
  <span class="brand-dot"></span>
  <span class="brand-name">{{account_name}}</span>
</div>
```
```css
.brand { position: absolute; top: 40px; left: 48px; display: flex; align-items: center; gap: 12px; }
.brand-dot { width: 18px; height: 18px; border-radius: 50%; background: {{accent_color}}; flex-shrink: 0; }
.brand-name { font-size: 28px; font-weight: 600; color: #9CA3AF; }
```

**악센트 라인** (구분선):
```css
.accent-line { width: 48px; height: 3px; background: {{accent_color}}; margin: 0 auto; }
```

**쉐브론 화살표** (cover/cta 푸터에만):
```html
<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>
```

#### 색상 팔레트

| 용도 | 색상 |
|---|---|
| 배경 | `#F0F0F0` |
| 카드 | `#FFFFFF` |
| 헤드라인 | `#1A1A1A` |
| 본문 | `#4B5563` 또는 `#6B7280` |
| 보조 텍스트 | `#9CA3AF` |
| 악센트 | `{{accent_color}}` |
| 구분선 | `#E5E7EB` |

#### 타이포그래피

| 용도 | 크기 | 굵기 | 색상 |
|---|---|---|---|
| 커버 헤드라인 | 108px | 900 | #1A1A1A |
| 본문 헤드라인 | 76~84px | 800~900 | #1A1A1A |
| 서브 헤드라인 | 48px | 500 | #9CA3AF |
| 본문 텍스트 | 36~40px | 400 | #4B5563 또는 #6B7280 |
| 강조 숫자 | 160~220px | 900 | {{accent_color}} |
| 브랜드 이름 | 28px | 600 | #9CA3AF |

---

#### 참조 템플릿 A: cover.html

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cover</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1350px; overflow: hidden;
      background: #F0F0F0;
      font-family: 'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, sans-serif;
      letter-spacing: -0.02em;
      display: flex; flex-direction: column; padding: 0; position: relative;
    }
    .icon-area { height: 580px; flex-shrink: 0; }
    .content { padding: 24px 72px 0; display: flex; flex-direction: column; align-items: flex-start; }
    .hook-text { font-size: 46px; font-weight: 400; color: #6B7280; line-height: 1.55; margin-bottom: 20px; word-break: keep-all; text-align: left; }
    .headline { font-size: 108px; font-weight: 900; color: #1A1A1A; line-height: 1.22; letter-spacing: -0.025em; text-align: left; word-break: keep-all; margin-bottom: 16px; }
    .subtitle { font-size: 40px; font-weight: 500; color: #374151; text-align: left; letter-spacing: -0.01em; }
    .footer { position: absolute; bottom: 48px; left: 72px; right: 72px; display: flex; align-items: center; justify-content: space-between; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-dot { width: 18px; height: 18px; border-radius: 50%; background: {{accent_color}}; flex-shrink: 0; }
    .brand-name { font-size: 28px; font-weight: 600; color: #9CA3AF; letter-spacing: 0.01em; }
    .chevron { display: flex; align-items: center; gap: 0; }
    .chevron svg { width: 44px; height: 44px; }
    .highlight { background: linear-gradient(to top, {{accent_color}}66 45%, transparent 45%); color: #1A1A1A; padding: 0 4px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
  </style>
</head>
<body>
  <div class="icon-area"></div>
  <div class="content">
    <p class="hook-text">{{subtext}}</p>
    <h1 class="headline">{{headline}}</h1>
    <p class="subtitle">{{headline_label}}</p>
  </div>
  <div class="footer">
    <div class="brand">
      <div class="brand-dot"></div>
      <span class="brand-name">{{account_name}}</span>
    </div>
    <span class="chevron"><svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg></span>
  </div>
</body>
</html>
```

#### 참조 템플릿 B: content-stat.html

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>content-stat</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1080px; height: 1350px; overflow: hidden; background: #F0F0F0; font-family: 'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, sans-serif; letter-spacing: -0.02em; position: relative; display: flex; align-items: center; justify-content: center; }
    .highlight { background: linear-gradient(to top, {{accent_color}}66 45%, transparent 45%); color: #1A1A1A; padding: 0 4px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
    .brand { position: absolute; top: 40px; left: 48px; display: flex; align-items: center; gap: 12px; }
    .brand-dot { width: 18px; height: 18px; border-radius: 50%; background: {{accent_color}}; flex-shrink: 0; }
    .brand-name { font-size: 28px; font-weight: 600; color: #9CA3AF; }
    .content { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 72px; width: 100%; }
    .headline { font-size: 48px; font-weight: 500; color: #9CA3AF; text-align: center; margin-bottom: 40px; letter-spacing: 0.02em; word-break: keep-all; }
    .emphasis { font-size: 160px; font-weight: 900; color: {{accent_color}}; text-align: center; line-height: 1; letter-spacing: -0.05em; margin-bottom: 32px; }
    .accent-line { width: 48px; height: 3px; background: {{accent_color}}; margin: 0 auto 40px auto; }
    .body-text { font-size: 40px; font-weight: 400; color: #6B7280; text-align: center; line-height: 1.75; word-break: keep-all; }
  </style>
</head>
<body>
  <div class="brand"><span class="brand-dot"></span><span class="brand-name">{{account_name}}</span></div>
  <div class="content">
    <p class="headline">{{headline}}</p>
    <div class="emphasis">{{emphasis}}</div>
    <div class="accent-line"></div>
    <p class="body-text">{{body}}</p>
  </div>
</body>
</html>
```

#### 참조 템플릿 C: cta.html

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>cta</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1080px; height: 1350px; overflow: hidden; background: #F0F0F0; font-family: 'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, sans-serif; letter-spacing: -0.02em; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 72px; }
    .highlight { background: linear-gradient(to top, {{accent_color}}66 45%, transparent 45%); color: #1A1A1A; padding: 0 4px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
    .upper-spacer { flex: 0 0 auto; height: 20%; width: 100%; }
    .content { display: flex; flex-direction: column; align-items: center; width: 100%; }
    .headline { font-size: 84px; font-weight: 900; color: #1A1A1A; text-align: center; line-height: 1.3; word-break: keep-all; margin-bottom: 32px; }
    .subtext { font-size: 38px; font-weight: 400; color: #9CA3AF; text-align: center; margin-bottom: 48px; word-break: keep-all; }
    .cta-button { background: {{accent_color}}; color: #FFFFFF; font-size: 40px; font-weight: 700; padding: 18px 56px; border-radius: 50px; white-space: nowrap; display: inline-block; border: none; }
    .tag-row { display: flex; gap: 12px; justify-content: center; margin-top: 32px; flex-wrap: wrap; }
    .tag { font-size: 32px; font-weight: 400; color: #9CA3AF; }
    .lower-spacer { flex: 1; }
    .footer { position: absolute; bottom: 48px; left: 60px; right: 60px; display: flex; align-items: center; justify-content: space-between; }
    .footer-brand { display: flex; align-items: center; gap: 12px; }
    .brand-dot { width: 18px; height: 18px; border-radius: 50%; background: {{accent_color}}; flex-shrink: 0; }
    .brand-name { font-size: 28px; font-weight: 600; color: #9CA3AF; }
    .footer-chevron svg { width: 44px; height: 44px; }
  </style>
</head>
<body>
  <div class="upper-spacer"></div>
  <div class="content">
    <h2 class="headline">{{headline}}</h2>
    <p class="subtext">{{subtext}}</p>
    <button class="cta-button">{{cta_text}}</button>
    <div class="tag-row">
      <span class="tag">{{tag1}}</span>
      <span class="tag">{{tag2}}</span>
      <span class="tag">{{tag3}}</span>
    </div>
  </div>
  <div class="lower-spacer"></div>
  <div class="footer">
    <div class="footer-brand"><span class="brand-dot"></span><span class="brand-name">{{account_name}}</span></div>
    <div class="footer-chevron"><svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg></div>
  </div>
</body>
</html>
```

#### 나머지 10개 템플릿 생성 가이드

위 3개 참조 템플릿(cover, content-stat, cta)의 디자인 시스템을 따라 나머지 10개를 생성합니다:

| 파일 | 레이아웃 | 핵심 요소 |
|---|---|---|
| **content.html** | 상단 브랜드마크, 중앙 콘텐츠 | badge_number 원형 배지(선택), headline(76px), accent-line, body(36px) |
| **content-quote.html** | 상단 빈공간(아이콘 영역), 중앙 인용문 | 큰 따옴표 마크(accent색, 100px), body(인용문, 44px, #374151), headline(출처, 36px, #9CA3AF) |
| **content-badge.html** | 상단 브랜드마크, 중앙 콘텐츠 | badge_text pill(accent 배경, 흰색 글씨, border-radius 100px), headline(80px), accent-line, body, subtext |
| **content-steps.html** | 상단 브랜드마크, 수직 3단계 | headline, 3개 화이트 카드(border-radius 24px) 각각 체크마크 SVG(accent색) + step 텍스트, body |
| **content-list.html** | 상단 브랜드마크, 수직 리스트 | headline, accent-line, 5개 항목(악센트색 번호 원형 + 텍스트), border-bottom #E5E7EB 구분선 |
| **content-split.html** | 상단 헤드라인, 좌우 2컬럼 | headline, 2개 화이트 카드(border-radius 24px), left/right_title(accent색), left/right_body, "VS" 배지(accent 배경, 원형) |
| **content-highlight.html** | 상단 헤드라인, 중앙 강조카드 | headline(48px, #9CA3AF), 화이트 카드(left border 5px accent), emphasis(68px, accent색), body, subtext |
| **content-image.html** | 상하 분할 (이미지+텍스트) | badge_number(선택), 상단 이미지 영역(border-radius 24px, 배경 #E5E7EB, 카메라 SVG 플레이스홀더), 하단 headline + body |
| **content-grid.html** | 상단 헤드라인, 2x2 그리드 | headline, 4개 화이트 카드(border-radius 28px), 각 카드: icon(이모지) + title(36px, #1A1A1A) + desc(28px, #9CA3AF) |
| **content-bigdata.html** | 중앙 정렬, 거대 숫자 | headline(48px, #9CA3AF), bigdata_number(220px, accent색) + bigdata_unit(56px), accent-line, body, subtext |

**중요**: 모든 템플릿은 참조 템플릿과 동일한 CSS 리셋, 폰트, 색상 팔레트, 브랜드마크 스타일을 사용해야 합니다.

---

### 5단계: CLAUDE.md 생성

프로젝트 루트에 `CLAUDE.md`를 생성합니다. 이 파일이 **카드뉴스 생성 파이프라인의 핵심**입니다.

CLAUDE.md에는 다음 내용을 포함합니다:

1. **프로젝트 개요**: 카드뉴스 자동 생성 시스템 설명
2. **Step 1 요청 파싱**: topic, tone, slide_count, accent_color, account_name 추출
3. **Step 2 리서치**: general-purpose 에이전트로 웹 검색 → `workspace/research.md` 작성 (핵심 포인트 5~10개, 통계, 인용구, 트렌드)
4. **Step 2.5 리서치 검증**: 팩트체커 + 보완 리서처 2개 에이전트 **병렬** 실행, 교차 검증
5. **Step 3 카피라이팅**: Step 3.5에 통합되어 별도 실행하지 않음 (slides.json 포맷과 카피라이팅 가이드라인만 참조 정보로 포함)
6. **Step 3.5 카피 토론 (Team 모드 실시간 토론)**: `TeamCreate(team_name="copy-debate")` → 카피 작가(`copywriter`) + 후킹 전문가(`hook-expert`) 스폰 → `SendMessage`로 실시간 토론 → 후킹 점수 7점 이상 + 양측 합의 시 `workspace/slides.json` 최종 확정 (최대 3라운드, 합의 실패 시 마지막 버전 채택)
7. **Step 4 렌더링**: `node scripts/render.js` 실행
8. **Step 5 검토**: general-purpose 에이전트로 PNG 시각 검토, 문제 발견 시 Step 3.5 Team 모드 재실행

그리고 다음 참조 정보를 포함합니다:
- slides.json 포맷 (13개 타입별 예시)
- 카피라이팅 가이드라인 (한 줄 15자, 하이라이트 사용법 등)
- 슬라이드 타입 레퍼런스 테이블
- 빠른 명령어 예시
- 디렉토리 구조

---

### 6단계: npm install

```bash
npm install
```

---

### 7단계: 샘플 렌더링 검증

```bash
node scripts/generate-samples.js
```

- 성공: `sample-output/clean/` 에 13개 PNG 생성 확인
- 실패: 에러 메시지 확인 → 해당 템플릿 수정 → 재실행
- **모든 13개 슬라이드가 정상 렌더링될 때까지 반복**

---

### 8단계: Git 초기화

```bash
git init && git add -A && git commit -m "Initial commit: Instagram card news generator"
```

---

### 완료 안내

세팅이 끝나면 다음 메시지를 출력합니다:

> 카드뉴스 프로젝트 세팅이 완료되었습니다!
>
> **사용법**: 아래처럼 입력하면 자동으로 카드뉴스가 생성됩니다.
>
> ```
> 카드뉴스 만들어줘: AI 트렌드 2025
> ```
>
> **출력 위치**: `output/` 디렉토리 (1080×1350px PNG)
>
> **파이프라인**: 리서치 → 팩트체크 → 카피 토론 (Team 모드) → 렌더링 → 시각 검토
