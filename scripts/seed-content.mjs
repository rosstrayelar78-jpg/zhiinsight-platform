import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const defaultReportPath = path.join(root, "seeds", "银发经济内容报告_30条政策_20案例_5专题_5报告.md");

const reportPath = process.env.CONTENT_REPORT_PATH || defaultReportPath;
const databaseUrl =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/seri_mvp";
const dryRun = process.argv.includes("--dry-run");

function ensureContentReportExists() {
  if (fs.existsSync(reportPath)) return;

  console.error("Seed content report not found.");
  console.error(`Expected path: ${reportPath}`);
  console.error("Fix options:");
  console.error("1. Put the content report at ./seeds/银发经济内容报告_30条政策_20案例_5专题_5报告.md");
  console.error("2. Or set CONTENT_REPORT_PATH to an existing Markdown file path.");
  process.exit(1);
}

function createSlug(input, fallback = "content") {
  const ascii = input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (ascii) return ascii.slice(0, 120);
  const encoded = Buffer.from(input).toString("hex").slice(0, 32);
  return `${fallback}-${encoded || Date.now()}`;
}

function extractSection(markdown, startHeading, endHeading) {
  const start = markdown.indexOf(startHeading);
  if (start < 0) return "";
  const end = endHeading ? markdown.indexOf(endHeading, start + startHeading.length) : -1;
  return markdown.slice(start, end > -1 ? end : markdown.length);
}

function splitEntries(section, pattern) {
  const matches = [...section.matchAll(pattern)];
  return matches.map((match, index) => {
    const start = match.index;
    const end = matches[index + 1]?.index ?? section.length;
    return {
      number: Number(match[1]),
      title: match[2].replace(/★+/g, "").trim(),
      body: section.slice(start, end).trim(),
    };
  });
}

function splitHeadingEntries(section, pattern) {
  const matches = [...section.matchAll(pattern)];
  return matches.map((match, index) => {
    const start = match.index;
    const end = matches[index + 1]?.index ?? section.length;
    return {
      number: index + 1,
      title: match[1].trim(),
      body: section.slice(start, end).trim(),
    };
  });
}

function field(body, label) {
  const match = body.match(new RegExp(`- \\*\\*${label}\\*\\*：([^\\n]+)`));
  return match?.[1]?.replace(/[<>]/g, "").trim() || null;
}

function source(body) {
  const match = body.match(/- \*\*来源\*\*：<?([^>\n]+)>?/);
  return match?.[1]?.trim() || null;
}

function dateFromTitle(title) {
  const match = title.match(/(20\d{2})[.年/-](\d{1,2})(?:[.月/-](\d{1,2}))?/);
  if (!match) return null;
  const year = match[1];
  const month = match[2].padStart(2, "0");
  const day = (match[3] || "01").padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function regionFromText(text) {
  const map = [
    ["上海", "上海"],
    ["北京", "北京"],
    ["海淀", "北京"],
    ["广州", "广州"],
    ["广东", "广东"],
    ["日本", "日本"],
    ["德国", "德国"],
    ["美国", "美国"],
  ];
  return map.find(([needle]) => text.includes(needle))?.[1] || null;
}

function policyLevel(number, title) {
  if (number <= 12 || number >= 21) return "national";
  if (title.includes("广东")) return "provincial";
  if (title.includes("静安") || title.includes("海淀")) return "district";
  return "municipal";
}

function normalizePolicy(entry) {
  const core = field(entry.body, "核心内容");
  const meaning = field(entry.body, "战略意义");
  const authority = field(entry.body, "发布机关") || field(entry.body, "来源");
  const sourceUrl = source(entry.body);

  return {
    title: entry.title,
    slug: `policy-${String(entry.number).padStart(2, "0")}-${createSlug(entry.title, "policy")}`,
    summary: core || meaning,
    content: [`核心内容：${core || "未提取"}`, `战略意义：${meaning || "未提取"}`, "", entry.body].join(
      "\n",
    ),
    issuing_authority: authority,
    region: regionFromText(entry.title + entry.body),
    policy_level: policyLevel(entry.number, entry.title),
    publish_date: dateFromTitle(entry.title),
    source_url: sourceUrl,
    status: "published",
    seo_title: `${entry.title} | 银发经济政策库`,
    seo_description: core || meaning,
  };
}

function normalizeCase(entry) {
  const type = field(entry.body, "类型");
  const scale = field(entry.body, "规模");
  const model = field(entry.body, "模式");
  const profit = field(entry.body, "利润层");
  const keywords = field(entry.body, "关键词");
  const insight = field(entry.body, "启示");
  const sourceUrl = source(entry.body);
  const summary = insight || model || scale || type;

  return {
    title: entry.title,
    slug: `case-${String(entry.number).padStart(2, "0")}-${createSlug(entry.title, "case")}`,
    summary,
    content: [
      type ? `类型：${type}` : null,
      scale ? `规模：${scale}` : null,
      model ? `模式：${model}` : null,
      profit ? `利润层：${profit}` : null,
      keywords ? `关键词：${keywords}` : null,
      sourceUrl ? `来源：${sourceUrl}` : null,
      insight ? `启示：${insight}` : null,
      "",
      entry.body,
    ]
      .filter(Boolean)
      .join("\n"),
    region: regionFromText(entry.title + entry.body),
    case_type: type,
    industry: keywords,
    source_url: sourceUrl,
    status: "published",
    seo_title: `${entry.title} | 银发经济案例库`,
    seo_description: summary,
    tags: keywords
      ? keywords
          .split(/[、,+，=]/)
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
  };
}

function boldField(body, label) {
  const match = body.match(new RegExp(`\\*\\*${label}\\*\\*：([^\\n]+)`));
  return match?.[1]?.replace(/[<>]/g, "").trim() || null;
}

function normalizeTopic(entry) {
  const status = boldField(entry.body, "现状");
  const opportunity = boldField(entry.body, "机遇");
  const sourceMatch = entry.body.match(/关键来源\*\*：(.+)/);
  const summary = status || opportunity || entry.body.split("\n").find((line) => line.trim()) || "";
  return {
    title: entry.title,
    slug: `topic-${String(entry.number).padStart(2, "0")}-${createSlug(entry.title, "topic")}`,
    summary,
    content: entry.body,
    cover_image: null,
    status: "published",
    seo_title: `${entry.title} | 银发经济产业专题`,
    seo_description: summary,
    source_note: sourceMatch?.[1]?.trim() || null,
  };
}

function normalizeReport(entry) {
  const version = field(entry.body, "版本") || field(entry.body, "字数");
  const core = field(entry.body, "核心");
  const usage = field(entry.body, "用途");
  const file = field(entry.body, "文件");
  const summary = core || usage || version;
  return {
    title: entry.title.replace(/^《|》$/g, ""),
    slug: `report-${String(entry.number).padStart(2, "0")}-${createSlug(entry.title, "report")}`,
    summary,
    content: [version ? `版本/字数：${version}` : null, core ? `核心：${core}` : null, usage ? `用途：${usage}` : null, file ? `文件：${file}` : null, "", entry.body]
      .filter(Boolean)
      .join("\n"),
    publisher: "知璟远珩 · 银发经济产业研究院（筹）",
    publish_date: "2026-06-27",
    is_downloadable: false,
    status: "published",
    seo_title: `${entry.title} | 银发经济研究报告`,
    seo_description: summary,
  };
}

async function getOrCreateRegion(client, name) {
  if (!name) return null;
  const found = await client.query("SELECT id FROM regions WHERE name = $1 LIMIT 1", [name]);
  if (found.rows[0]) return found.rows[0].id;
  const level = ["广东", "日本", "德国", "美国"].includes(name) ? "province" : "city";
  const created = await client.query(
    "INSERT INTO regions (name, level) VALUES ($1, $2) RETURNING id",
    [name, level],
  );
  return created.rows[0].id;
}

async function getOrCreateTag(client, name) {
  const slug = createSlug(name, "tag");
  const found = await client.query("SELECT id FROM tags WHERE slug = $1 LIMIT 1", [slug]);
  if (found.rows[0]) return found.rows[0].id;
  const created = await client.query(
    "INSERT INTO tags (name, slug, type) VALUES ($1, $2, 'case') RETURNING id",
    [name, slug],
  );
  return created.rows[0].id;
}

async function seed() {
  ensureContentReportExists();
  const markdown = fs.readFileSync(reportPath, "utf8");
  const policySection = extractSection(markdown, "## 第一部分", "## 第二部分");
  const caseSection = extractSection(markdown, "## 第二部分", "## 第三部分");
  const topicSection = extractSection(markdown, "## 第三部分", "## 第四部分");
  const reportSection = extractSection(markdown, "## 第四部分", "*报告编制");

  const policies = splitEntries(policySection, /\*\*(\d+)\.\s*([^*]+)\*\*/g).map(normalizePolicy);
  const cases = splitEntries(caseSection, /\*\*案例(\d+)：([^*]+)\*\*/g).map(normalizeCase);
  const topics = splitHeadingEntries(topicSection, /### 专题[一二三四五]：(.+)/g).map(normalizeTopic);
  const reports = splitHeadingEntries(reportSection, /### 报告[一二三四五]：(.+)/g).map(normalizeReport);

  fs.writeFileSync(
    path.join(root, "seeds", "parsed-content-preview.json"),
    JSON.stringify({ policies, cases, topics, reports }, null, 2),
    "utf8",
  );

  if (dryRun) {
    console.log(
      `Seed dry run: parsed ${policies.length} policies, ${cases.length} cases, ${topics.length} topics, ${reports.length} reports.`,
    );
    return;
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const policy of policies) {
      const regionId = await getOrCreateRegion(client, policy.region);
      await client.query(
        `
        INSERT INTO policies (
          title, slug, summary, content, issuing_authority, region_id, policy_level,
          publish_date, source_url, status, seo_title, seo_description, published_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, now())
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          content = EXCLUDED.content,
          issuing_authority = EXCLUDED.issuing_authority,
          region_id = EXCLUDED.region_id,
          policy_level = EXCLUDED.policy_level,
          publish_date = EXCLUDED.publish_date,
          source_url = EXCLUDED.source_url,
          status = EXCLUDED.status,
          seo_title = EXCLUDED.seo_title,
          seo_description = EXCLUDED.seo_description,
          updated_at = now()
        `,
        [
          policy.title,
          policy.slug,
          policy.summary,
          policy.content,
          policy.issuing_authority,
          regionId,
          policy.policy_level,
          policy.publish_date,
          policy.source_url,
          policy.status,
          policy.seo_title,
          policy.seo_description,
        ],
      );
    }

    for (const item of cases) {
      const regionId = await getOrCreateRegion(client, item.region);
      const result = await client.query(
        `
        INSERT INTO cases (
          title, slug, summary, content, region_id, case_type, industry,
          status, seo_title, seo_description, published_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now())
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          content = EXCLUDED.content,
          region_id = EXCLUDED.region_id,
          case_type = EXCLUDED.case_type,
          industry = EXCLUDED.industry,
          status = EXCLUDED.status,
          seo_title = EXCLUDED.seo_title,
          seo_description = EXCLUDED.seo_description,
          updated_at = now()
        RETURNING id
        `,
        [
          item.title,
          item.slug,
          item.summary,
          item.content,
          regionId,
          item.case_type,
          item.industry,
          item.status,
          item.seo_title,
          item.seo_description,
        ],
      );

      const caseId = result.rows[0].id;
      await client.query("DELETE FROM content_tags WHERE content_type = 'case' AND content_id = $1", [
        caseId,
      ]);
      for (const tag of item.tags) {
        const tagId = await getOrCreateTag(client, tag);
        await client.query(
          `
          INSERT INTO content_tags (content_type, content_id, tag_id)
          VALUES ('case', $1, $2)
          ON CONFLICT DO NOTHING
          `,
          [caseId, tagId],
        );
      }
    }

    for (const topic of topics) {
      await client.query(
        `
        INSERT INTO topics (title, slug, summary, content, cover_image, status, seo_title, seo_description, published_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now())
        ON CONFLICT (slug) DO UPDATE SET
          title=EXCLUDED.title,
          summary=EXCLUDED.summary,
          content=EXCLUDED.content,
          cover_image=EXCLUDED.cover_image,
          status=EXCLUDED.status,
          seo_title=EXCLUDED.seo_title,
          seo_description=EXCLUDED.seo_description,
          updated_at=now()
        `,
        [
          topic.title,
          topic.slug,
          topic.summary,
          topic.content,
          topic.cover_image,
          topic.status,
          topic.seo_title,
          topic.seo_description,
        ],
      );
    }

    for (const report of reports) {
      await client.query(
        `
        INSERT INTO reports (
          title, slug, summary, content, publisher, publish_date, is_downloadable,
          status, seo_title, seo_description, published_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now())
        ON CONFLICT (slug) DO UPDATE SET
          title=EXCLUDED.title,
          summary=EXCLUDED.summary,
          content=EXCLUDED.content,
          publisher=EXCLUDED.publisher,
          publish_date=EXCLUDED.publish_date,
          is_downloadable=EXCLUDED.is_downloadable,
          status=EXCLUDED.status,
          seo_title=EXCLUDED.seo_title,
          seo_description=EXCLUDED.seo_description,
          updated_at=now()
        `,
        [
          report.title,
          report.slug,
          report.summary,
          report.content,
          report.publisher,
          report.publish_date,
          report.is_downloadable,
          report.status,
          report.seo_title,
          report.seo_description,
        ],
      );
    }

    await client.query("COMMIT");
    console.log(
      `Seed completed: ${policies.length} policies, ${cases.length} cases, ${topics.length} topics, ${reports.length} reports.`,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
