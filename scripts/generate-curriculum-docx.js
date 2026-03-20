const fs = require("fs");
const path = require("path");
const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} = require("docx");

const ACCENT = "2D63E2";
const HEADER_BG = "EAF1FF";
const BORDER = "C7D7F5";

const root = path.resolve(__dirname, "..");
const curriculumPath = path.join(root, "workspace", "curriculum.md");
const outputPath = path.join(root, "output", "curriculum.docx");

const md = fs.readFileSync(curriculumPath, "utf8");
const lines = md.split("\n");

const text = (value, opts = {}) =>
  new TextRun({ text: value, font: "Malgun Gothic", ...opts });

const p = (content, opts = {}) => {
  const arr = Array.isArray(content) ? content : [content];
  return new Paragraph({
    children: arr.map((item) => (item instanceof TextRun ? item : text(item))),
    ...opts,
  });
};

const heading = (value, level = HeadingLevel.HEADING_1) =>
  p(value, { heading: level });

const normal = (value, opts = {}) => p(value, { spacing: { after: 120 }, ...opts });

const bullet = (value, level = 0) =>
  p(value, {
    numbering: { reference: "bullet-list", level },
    spacing: { after: 100 },
  });

const numbered = (value, ref = "number-list") =>
  p(value, {
    numbering: { reference: ref, level: 0 },
    spacing: { after: 100 },
  });

const borderCell = {
  top: { style: BorderStyle.SINGLE, size: 1, color: BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER },
  left: { style: BorderStyle.SINGLE, size: 1, color: BORDER },
  right: { style: BorderStyle.SINGLE, size: 1, color: BORDER },
};

const tableCell = (value, width, isHeader = false, center = false) =>
  new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: borderCell,
    verticalAlign: VerticalAlign.CENTER,
    shading: isHeader ? { fill: HEADER_BG, type: ShadingType.CLEAR } : undefined,
    children: [
      p(
        [
          text(value.replace(/\*\*/g, ""), {
            bold: isHeader,
            color: isHeader ? ACCENT : "111111",
            size: isHeader ? 21 : 22,
          }),
        ],
        {
          alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { before: 80, after: 80 },
        }
      ),
    ],
  });

const makeTable = (headers, rows, widths, centerCols = []) =>
  new Table({
    columnWidths: widths,
    margins: { top: 90, bottom: 90, left: 120, right: 120 },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => tableCell(h, widths[i], true, centerCols.includes(i))),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map((cell, i) =>
              tableCell(cell, widths[i], false, centerCols.includes(i))
            ),
          })
      ),
    ],
  });

const parseTable = (titleLine) => {
  const idx = lines.findIndex((line) => line.trim() === titleLine.trim());
  const tableStart = idx + 2;
  const body = [];
  for (let i = tableStart + 2; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.startsWith("|")) break;
    const cols = line
      .split("|")
      .slice(1, -1)
      .map((v) => v.trim());
    body.push(cols);
  }
  return body;
};

const extractBetween = (start, end) => {
  const s = lines.findIndex((line) => line.trim() === start.trim());
  const e = end ? lines.findIndex((line) => line.trim() === end.trim()) : -1;
  const endIndex = e === -1 ? lines.length : e;
  return lines.slice(s + 1, endIndex).map((line) => line.trim()).filter(Boolean);
};

const extractPartKeyMessage = (titleLine) => {
  const start = lines.findIndex((line) => line.trim() === titleLine.trim());
  const end = lines.findIndex((line, i) => i > start && line.trim() === "---");
  if (start === -1 || end === -1) return [];
  return lines
    .slice(start + 1, end)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("**핵심 메시지**"));
};

const cleanMdText = (value) => value.replace(/^\*\*(.+?)\*\*: ?/, "$1: ").replace(/\*\*/g, "");

const title = lines[0].replace(/^#\s*/, "").trim();
const conceptBlock = extractBetween("## 강의 콘셉트", "## 프로젝트 기술 개요");
const projectBlock = extractBetween("## 프로젝트 기술 개요", "## 타임라인 (총 120분)");
const ratioBlock = extractBetween("## 시간 배분 비율", "## 사전 준비 안내 (수강생)").filter((line) =>
  line.startsWith("-") && !/^-+$/.test(line.replace(/\s/g, ""))
);
const prepBlock = extractBetween("## 사전 준비 안내 (수강생)", "## 강사 준비물").filter((line) =>
  /^\d+\./.test(line)
);
const instructorBlock = extractBetween("## 강사 준비물").filter((line) => line.startsWith("-"));

const partTitles = [
  "### 파트 1: Why & What (15분)",
  "### 파트 2: CLAUDE.md — AI 오케스트레이션의 핵심 (25분)",
  "### 파트 3: 멀티 에이전트 토론 시스템 (25분)",
  "### 파트 4: 템플릿 + 렌더링 파이프라인 (25분)",
  "### 파트 5: 실전 — 처음부터 끝까지 (20분)",
  "### 파트 6: 확장과 마무리 (10분)",
];

const partTables = partTitles.map((titleLine) => ({
  title: titleLine.replace(/^###\s*/, ""),
  titleLine,
  rows: parseTable(titleLine),
}));

const labRows = parseTable("## 실습 요약 (4개, 총 ~30분)");

const formatDate = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

const children = [
  p(title, {
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { before: 2400, after: 360 },
  }),
  p("2시간 강의 커리큘럼", {
    alignment: AlignmentType.CENTER,
    spacing: { after: 180 },
    children: [text("2시간 강의 커리큘럼", { color: ACCENT, bold: true, size: 28 })],
  }),
  p(`작성일: ${formatDate()}`, {
    alignment: AlignmentType.CENTER,
    spacing: { after: 720 },
    children: [text(`작성일: ${formatDate()}`, { size: 22, color: "444444" })],
  }),
  p("", { children: [new PageBreak()] }),

  heading("목차"),
  new TableOfContents("", { hyperlink: true, headingStyleRange: "1-2" }),
  p("", { children: [new PageBreak()] }),

  heading("강의 콘셉트"),
  ...conceptBlock
    .filter((line) => !/^\d+\./.test(line) && line !== "---")
    .map((line) => normal(cleanMdText(line))),
  ...conceptBlock
    .filter((line) => /^\d+\./.test(line))
    .map((line) => numbered(line.replace(/^\d+\.\s*/, ""), "concept-number-list")),

  heading("프로젝트 기술 개요"),
  ...projectBlock
    .filter((line) => line.startsWith("**프로젝트**") || line.startsWith("**핵심 컨셉**"))
    .map((line) => normal(cleanMdText(line))),
  normal("기술 스택", {
    children: [text("기술 스택", { bold: true, color: ACCENT })],
  }),
  ...projectBlock
    .filter((line) => line.startsWith("- Node.js") || line.startsWith("- Claude Code") || line.startsWith("- HTML+CSS") || line.startsWith("- Team 모드"))
    .map((line) => bullet(line.replace(/^-\s*/, ""))),
  normal("5단계 파이프라인", {
    children: [text("5단계 파이프라인", { bold: true, color: ACCENT })],
  }),
  ...projectBlock
    .filter((line) => /^Step\s\d/.test(line))
    .map((line) => numbered(line, "pipeline-number-list")),
  normal("렌더링 파이프라인", {
    children: [text("렌더링 파이프라인", { bold: true, color: ACCENT })],
  }),
  ...projectBlock
    .filter((line) => line.startsWith("- slides.json") || line.startsWith("- applyPlaceholders"))
    .map((line) => bullet(line.replace(/^-\s*/, ""))),
  normal("템플릿 시스템", {
    children: [text("템플릿 시스템", { bold: true, color: ACCENT })],
  }),
  ...projectBlock
    .filter((line) => line.startsWith("- 8개 스타일") || line.startsWith("- 14개 슬라이드 타입") || line.startsWith("- 각 템플릿"))
    .map((line) => bullet(line.replace(/^-\s*/, ""))),
  normal("Team 모드 토론 시스템 (Step 3.5)", {
    children: [text("Team 모드 토론 시스템 (Step 3.5)", { bold: true, color: ACCENT })],
  }),
  ...projectBlock
    .filter((line) => line.startsWith("- TeamCreate") || line.startsWith("- 라운드") || line.startsWith("- 합의 기준") || line.startsWith("- 최대"))
    .map((line) => bullet(line.replace(/^-\s*/, ""))),

  heading("타임라인 (총 120분)"),
  ...partTables.flatMap((part) => [
    heading(part.title, HeadingLevel.HEADING_2),
    makeTable(["시간", "내용", "형식"], part.rows, [1600, 5800, 1960], [0, 2]),
    ...extractPartKeyMessage(part.titleLine).map((line) => normal(cleanMdText(line))),
  ]),

  heading("실습 요약 (4개, 총 ~30분)"),
  makeTable(["#", "실습", "소요", "난이도", "산출물"], labRows, [600, 3600, 1000, 900, 3260], [0, 2, 3]),

  heading("시간 배분 비율"),
  ...ratioBlock.map((line) => bullet(line.replace(/^-\s*/, ""))),

  heading("사전 준비 안내 (수강생)"),
  ...prepBlock.map((line) => numbered(line.replace(/^\d+\.\s*/, ""), "prep-number-list")),

  heading("강사 준비물"),
  ...instructorBlock.map((line) => bullet(line.replace(/^-\s*/, ""))),
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Malgun Gothic", size: 22, color: "111111" } } },
    paragraphStyles: [
      {
        id: "Title",
        name: "Title",
        basedOn: "Normal",
        next: "Normal",
        run: { font: "Malgun Gothic", size: 52, bold: true, color: "111111" },
        paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 180 } },
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font: "Malgun Gothic", size: 34, bold: true, color: ACCENT },
        paragraph: { spacing: { before: 280, after: 180 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { font: "Malgun Gothic", size: 28, bold: true, color: ACCENT },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 1 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullet-list",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 540, hanging: 300 } } },
          },
        ],
      },
      ...["number-list", "concept-number-list", "pipeline-number-list", "prep-number-list"].map((reference) => ({
        reference,
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 540, hanging: 300 } } },
          },
        ],
      })),
    ],
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          pageNumbers: { start: 1, formatType: "decimal" },
        },
      },
      footers: {
        default: new Footer({
          children: [
            p(
              [
                text("페이지 ", { size: 18, color: "666666" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "666666" }),
                text(" / ", { size: 18, color: "666666" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: "666666" }),
              ],
              { alignment: AlignmentType.CENTER, spacing: { before: 80 } }
            ),
          ],
        }),
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
});
