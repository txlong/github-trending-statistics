const fs = require('node:fs/promises');
const path = require('node:path');
const { parseTrendingHtml } = require('./trending');

const PERIODS = ['weekly', 'monthly'];

function getChinaDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

async function main() {
  const period = process.argv[2] || 'weekly';
  if (!PERIODS.includes(period)) {
    throw new Error(`Unsupported trending period "${period}". Use weekly or monthly.`);
  }

  const trendingUrl = `https://github.com/trending?since=${period}`;
  const response = await fetch(trendingUrl, {
    headers: {
      'user-agent': 'github-trending-statistics (https://github.com/txlong/github-trending-statistics)',
      accept: 'text/html',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub Trending returned HTTP ${response.status} for ${trendingUrl}`);
  }

  const repositories = parseTrendingHtml(await response.text(), period);
  if (repositories.length === 0) {
    throw new Error(`No repositories were found on the ${period} GitHub Trending page`);
  }

  const date = getChinaDate();
  const outputPath = path.join(__dirname, '..', 'data', period, `${date}.json`);
  const snapshot = {
    date,
    period,
    source: trendingUrl,
    fetchedAt: new Date().toISOString(),
    repositories,
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Saved ${repositories.length} repositories to ${outputPath}`);
}

main().catch((error) => {
  console.error('Failed to fetch GitHub Trending:', error);
  process.exitCode = 1;
});
