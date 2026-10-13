# GitHub Trending Statistics

This repository archives GitHub's weekly and monthly trending repositories once per day.
The collector follows the approach used by
[github-trending-api](https://github.com/isboyjc/github-trending-api): it requests
GitHub Trending with the matching `since` period and parses the repository cards.

## Data

Daily snapshots are saved under `data/weekly/YYYY-MM-DD.json` and
`data/monthly/YYYY-MM-DD.json` using the Asia/Shanghai date. Each snapshot
includes the fetch time, source URL, and the repositories' names, URLs,
descriptions, languages, total stars and forks, stars gained during that period
(`starsThisWeek` or `starsThisMonth`), and contributor information.

## Automation

The `Fetch GitHub Trending` workflow runs daily at 00:17 UTC
(08:17 Asia/Shanghai), avoiding the top-of-hour scheduling peak. It saves dated
weekly and monthly snapshots and commits
them to the default branch. It can also be started manually from the Actions tab.

## Run locally

```sh
npm ci
npm run fetch:weekly
npm run fetch:monthly
npm test
```
