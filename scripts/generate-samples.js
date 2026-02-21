'use strict';

const fs = require('fs');
const path = require('path');
const { render } = require('./render.js');

const configPath = path.join(__dirname, '..', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Sample Korean content: "2025 디지털 마케팅 트렌드 가이드"
const sampleSlides = [
  {
    slide: 1,
    type: 'cover',
    headline: '2025 디지털 마케팅\n트렌드 가이드',
    headline_label: '카드뉴스',
    subtext: '성공적인 마케팅을 위한 핵심 인사이트',
    tag1: '#디지털마케팅',
    tag2: '#AI트렌드',
    tag3: '#2025전략',
  },
  {
    slide: 2,
    type: 'content-badge',
    badge_text: 'TREND',
    badge_number: '01',
    headline: 'AI가 마케팅의\n판도를 바꾼다',
    body: 'AI 기반 콘텐츠 생성과 자동화가\n마케팅 산업의 새로운 표준이 되고 있습니다.',
    subtext: '2025년 최대 화두',
  },
  {
    slide: 3,
    type: 'content-stat',
    headline: 'AI 마케팅 도입률',
    emphasis: '78%',
    body: '글로벌 기업의 78%가 마케팅에\nAI 도구를 활용하고 있습니다.',
  },
  {
    slide: 4,
    type: 'content-image',
    badge_number: '02',
    headline: '숏폼 콘텐츠의 시대',
    body: '15초 이내의 짧은 영상이\n가장 높은 참여율을 기록하고 있습니다.\n릴스, 쇼츠, 틱톡이 핵심 채널입니다.',
    image_url: '',
  },
  {
    slide: 5,
    type: 'content-steps',
    headline: 'AI 마케팅 도입 3단계',
    step1: '현재 마케팅 프로세스 분석 및 자동화 가능 영역 파악',
    step2: 'AI 도구 선정 및 파일럿 테스트 진행',
    step3: '성과 측정 후 전사 확대 적용',
    body: '',
  },
  {
    slide: 6,
    type: 'content-list',
    headline: '2025 핵심 마케팅 채널',
    item1: 'Instagram Reels — 숏폼 콘텐츠 최강자',
    item2: 'YouTube Shorts — 검색 연동 강점',
    item3: 'TikTok — Z세대 핵심 플랫폼',
    item4: 'LinkedIn — B2B 마케팅 필수',
    item5: 'Threads — 텍스트 기반 신흥 채널',
  },
  {
    slide: 7,
    type: 'content-split',
    headline: '전통 마케팅 vs AI 마케팅',
    left_title: '전통 마케팅',
    left_body: '수동 타겟팅\n긴 제작 기간\n제한된 A/B 테스트\n높은 인건비',
    right_title: 'AI 마케팅',
    right_body: '자동 세그먼테이션\n실시간 콘텐츠 생성\n무한 변형 테스트\n비용 효율성',
    subtext: '',
  },
  {
    slide: 8,
    type: 'content-highlight',
    headline: '가장 중요한 한 가지',
    emphasis: '고객 경험이\n모든 것을 결정한다',
    body: '기술이 아무리 발전해도 결국\n고객의 마음을 사로잡는 것은\n진정성 있는 경험입니다.',
    subtext: '',
  },
  {
    slide: 9,
    type: 'content-quote',
    badge_number: '03',
    headline: '— Seth Godin',
    body: '"마케팅은 더 이상\n만든 것을 파는 기술이 아니라,\n팔릴 것을 만드는 기술이다."',
    subtext: '마케팅의 본질',
  },
  {
    slide: 10,
    type: 'content',
    badge_number: '04',
    headline: '지금 시작하세요',
    body: '변화는 이미 시작되었습니다.\n2025년, 당신의 마케팅 전략을\nAI와 데이터로 무장하세요.\n\n작은 실험부터 시작하면\n큰 변화를 만들 수 있습니다.',
  },
  {
    slide: 11,
    type: 'content-grid',
    headline: '2025 마케팅 4대 핵심 전략',
    grid1_icon: '🎯',
    grid1_title: '타겟 정밀화',
    grid1_desc: 'AI 기반 고객 세그먼트',
    grid2_icon: '📱',
    grid2_title: '숏폼 콘텐츠',
    grid2_desc: '15초 이내 영상 제작',
    grid3_icon: '🤖',
    grid3_title: 'AI 자동화',
    grid3_desc: '콘텐츠 생성 자동화',
    grid4_icon: '📊',
    grid4_title: '데이터 분석',
    grid4_desc: '실시간 성과 측정',
  },
  {
    slide: 12,
    type: 'content-bigdata',
    headline: '글로벌 AI 마케팅 시장 규모',
    bigdata_number: '48.8',
    bigdata_unit: '조원',
    body: '2025년 전 세계 AI 마케팅 시장은\n약 48.8조원 규모로 성장할 전망입니다.',
    subtext: 'Source: Statista 2025',
  },
  {
    slide: 13,
    type: 'content-fullimage',
    headline: 'AI 마케팅의\n미래를 만나다',
    badge_text: '핵심 인사이트',
    body: 'AI 기반 마케팅 자동화로\n업무 효율을 극대화할 수 있습니다.',
    badge2_text: '주의할 점',
    body2: 'AI 도구 도입 시 데이터 품질과\n개인정보 보호를 반드시\n고려해야 합니다.',
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080&h=1350&fit=crop',
  },
  {
    slide: 14,
    type: 'cta',
    headline: '더 많은 인사이트가\n궁금하다면',
    cta_text: '팔로우하고 트렌드 받아보기',
    subtext: '매주 새로운 마케팅 인사이트',
    tag1: '#마케팅트렌드',
    tag2: '#AI마케팅',
    tag3: '#디지털전략',
  },
];

const templateStyles = [
  { name: 'minimal', accent: '#2D63E2' },
  { name: 'bold', accent: '#6C5CE7' },
  { name: 'elegant', accent: '#D4AF37' },
  { name: 'premium', accent: '#A855F7' },
  { name: 'toss', accent: '#3182F6' },
  { name: 'magazine', accent: '#3B82F6' },
  { name: 'clean', accent: '#8BC34A' },
  { name: 'blueprint', accent: '#7BA7CC' },
];

async function generateSamples() {
  const workspaceDir = path.join(process.cwd(), config.workspace_dir);
  fs.mkdirSync(workspaceDir, { recursive: true });

  const slidesJsonPath = path.join(workspaceDir, 'slides.json');

  // Write sample slides.json once (shared content, style varies)
  fs.writeFileSync(slidesJsonPath, JSON.stringify(sampleSlides, null, 2), 'utf8');
  console.log(`Wrote sample slides.json to: ${slidesJsonPath}\n`);

  for (const template of templateStyles) {
    console.log(`Generating samples for '${template.name}' style...`);

    const outputDir = path.join(process.cwd(), 'sample-output', template.name);
    fs.mkdirSync(outputDir, { recursive: true });

    try {
      await render({
        slidesPath: slidesJsonPath,
        style: template.name,
        outputDir,
        accent: template.accent,
        account: config.defaults.account_name,
      });
      console.log(`  Completed '${template.name}' style.\n`);
    } catch (err) {
      console.error(`  Error generating '${template.name}' style:`, err.message);
    }
  }

  console.log('Sample images generated at sample-output/');
  console.log('  sample-output/minimal/');
  console.log('  sample-output/bold/');
  console.log('  sample-output/elegant/');
}

generateSamples().catch((err) => {
  console.error('Sample generation failed:', err.message);
  process.exit(1);
});
