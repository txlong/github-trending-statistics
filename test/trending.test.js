const test = require('node:test');
const assert = require('node:assert/strict');
const { parseTrendingHtml } = require('../scripts/trending');

test('parses weekly trending repository details', () => {
  const html = `
    <article class="Box-row">
      <h2><a href="/octocat/hello-world">octocat / hello-world</a></h2>
      <p>A sample project</p>
      <span class="repo-language-color" style="background-color: #f1e05a"></span>
      <span itemprop="programmingLanguage">JavaScript</span>
      <a href="/octocat/hello-world/stargazers">12,345</a>
      <a href="/octocat/hello-world/forks">678</a>
      <a data-hovercard-type="user"><img class="avatar avatar-user" alt="@octocat" src="https://example.com/avatar.png"></a>
      <span>1,234 stars this week</span>
    </article>
  `;

  assert.deepEqual(parseTrendingHtml(html), [
    {
      name: 'octocat/hello-world',
      url: 'https://github.com/octocat/hello-world',
      description: 'A sample project',
      language: 'JavaScript',
      languageColor: '#f1e05a',
      stars: '12,345',
      forks: '678',
      starsThisWeek: '1,234',
      contributors: [
        {
          name: 'octocat',
          url: 'https://github.com/octocat',
          avatar: 'https://example.com/avatar.png',
        },
      ],
    },
  ]);
});

test('parses monthly stars separately from weekly stars', () => {
  const html = `
    <article class="Box-row">
      <h2><a href="/octocat/hello-world">octocat / hello-world</a></h2>
      <span>4,321 stars this month</span>
    </article>
  `;

  assert.equal(parseTrendingHtml(html, 'monthly')[0].starsThisMonth, '4,321');
  assert.equal('starsThisWeek' in parseTrendingHtml(html, 'monthly')[0], false);
});

test('ignores rows without a repository link', () => {
  assert.deepEqual(parseTrendingHtml('<article class="Box-row"><h2>Invalid row</h2></article>'), []);
});
