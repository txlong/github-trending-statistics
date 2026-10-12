const cheerio = require('cheerio');

function parseTrendingHtml(html, period = 'weekly') {
  if (!['weekly', 'monthly'].includes(period)) {
    throw new Error(`Unsupported trending period: ${period}`);
  }

  const $ = cheerio.load(html);

  return $('.Box-row').map((_, row) => {
    const card = $(row);
    const repositoryPath = card.find('h2 a').attr('href');

    if (!repositoryPath || !/^\/[^/]+\/[^/]+\/?$/.test(repositoryPath)) {
      return null;
    }

    const periodStars = card.find('span').last().text().trim().split(/\s+/)[0];
    const contributors = card
      .find('a[data-hovercard-type="user"] img.avatar-user')
      .map((__, image) => {
        const name = $(image).attr('alt')?.replace(/^@/, '');
        return name
          ? {
              name,
              url: `https://github.com/${name}`,
              avatar: $(image).attr('src') || '',
            }
          : null;
      })
      .get()
      .filter(Boolean);

    return {
      name: repositoryPath.replace(/^\/|\/$/g, ''),
      url: `https://github.com${repositoryPath}`,
      description: card.find('p').first().text().trim(),
      language: card.find('[itemprop="programmingLanguage"]').first().text().trim(),
      languageColor: card.find('.repo-language-color').first().css('background-color') || '',
      stars: card.find(`a[href="${repositoryPath}/stargazers"]`).text().trim(),
      forks: card.find(`a[href="${repositoryPath}/forks"]`).text().trim(),
      [`starsThis${period === 'weekly' ? 'Week' : 'Month'}`]: periodStars,
      contributors,
    };
  }).get().filter(Boolean);
}

module.exports = { parseTrendingHtml };
