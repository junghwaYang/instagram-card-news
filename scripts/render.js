'use strict';

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Load config
const configPath = path.join(__dirname, '..', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

/**
 * Replace all template placeholders in HTML content.
 * @param {string} html - Raw HTML template string
 * @param {object} slide - Slide data object
 * @param {object} opts - Rendering options
 * @param {number} index - 0-based slide index
 * @param {number} total - Total slide count
 * @returns {string} Processed HTML
 */
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
    // v2 placeholders
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
    // content-grid placeholders
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
    // content-bigdata placeholders
    '{{bigdata_number}}': slide.bigdata_number || '',
    '{{bigdata_unit}}': slide.bigdata_unit || '',
    // magazine style placeholders
    '{{headline_label}}': slide.headline_label || '',
    '{{tag1}}': slide.tag1 || '',
    '{{tag2}}': slide.tag2 || '',
    '{{tag3}}': slide.tag3 || '',
    '{{badge_number}}': slide.badge_number || '',
    // content-fullimage placeholders
    '{{badge2_text}}': slide.badge2_text || '',
    '{{body2}}': (slide.body2 || '').replace(/\n/g, '<br>'),
  };

  let result = html;
  for (const [placeholder, value] of Object.entries(replacements)) {
    // Replace all occurrences
    result = result.split(placeholder).join(value);
  }
  // Second pass: replace {{accent_color}} that may exist inside injected data (e.g. SVG icons)
  const accentColor = opts.accent || config.defaults.accent_color;
  result = result.split('{{accent_color}}').join(accentColor);
  return result;
}

/**
 * Main render function.
 * @param {object} opts - Options
 * @param {string} opts.slidesPath - Path to slides.json
 * @param {string} opts.style - Template style (minimal|bold|elegant)
 * @param {string} opts.outputDir - Output directory path
 * @param {string} opts.accent - Accent color hex
 * @param {string} opts.account - Account name string
 */
async function render(opts = {}) {
  const slidesPath = opts.slidesPath || path.join(process.cwd(), config.workspace_dir, 'slides.json');
  const style = opts.style || config.defaults.template;
  const outputDir = opts.outputDir || path.join(process.cwd(), config.output_dir);
  const accent = opts.accent || config.defaults.accent_color;
  const account = opts.account || config.defaults.account_name;

  // Read slides
  if (!fs.existsSync(slidesPath)) {
    throw new Error(`slides.json not found at: ${slidesPath}`);
  }
  const slides = JSON.parse(fs.readFileSync(slidesPath, 'utf8'));

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  const templateDir = path.join(__dirname, '..', 'templates', style);
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template directory not found: ${templateDir}`);
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
      const templateFile = path.join(templateDir, `${slideType}.html`);

      if (!fs.existsSync(templateFile)) {
        console.warn(`  Warning: template not found for type "${slideType}", skipping slide ${i + 1}`);
        continue;
      }

      console.log(`Rendering slide ${i + 1}/${total}...`);

      const rawHtml = fs.readFileSync(templateFile, 'utf8');
      const processedHtml = applyPlaceholders(rawHtml, slide, { accent, account }, i, total);

      await page.setContent(processedHtml, { waitUntil: 'networkidle0' });

      const slideNum = String(i + 1).padStart(2, '0');
      const outputFile = path.join(outputDir, `slide_${slideNum}.png`);

      await page.screenshot({
        path: outputFile,
        clip: {
          x: 0,
          y: 0,
          width: config.dimensions.width,
          height: config.dimensions.height,
        },
      });

      console.log(`  Saved: ${outputFile}`);
    }
  } finally {
    await browser.close();
  }

  console.log(`\nDone. ${slides.length} slide(s) rendered to: ${outputDir}`);
}

// Parse CLI arguments
function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--slides':
        opts.slidesPath = args[++i];
        break;
      case '--style':
        opts.style = args[++i];
        break;
      case '--output':
        opts.outputDir = args[++i];
        break;
      case '--accent':
        opts.accent = args[++i];
        break;
      case '--account':
        opts.account = args[++i];
        break;
      default:
        console.warn(`Unknown argument: ${args[i]}`);
    }
  }
  return opts;
}

// Run as CLI if executed directly
if (require.main === module) {
  const opts = parseArgs(process.argv);
  render(opts).catch((err) => {
    console.error('Render failed:', err.message);
    process.exit(1);
  });
}

module.exports = { render };
