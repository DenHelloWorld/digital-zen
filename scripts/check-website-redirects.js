const fs = require('fs');
const path = require('path');

async function main() {
  const filePath = path.join(
    __dirname,
    '..',
    'src',
    'modules',
    'common',
    'constants',
    'websites.const.ts'
  );

  const content = await fs.promises.readFile(filePath, 'utf8');
  const entryRegex =
    /export const (WEBSITE_[A-Z0-9_-]+)[\s\S]*?name:\s*'([^']+)'[\s\S]*?url:\s*'([^']+)'/g;

  const entries = [];
  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    entries.push({
      index: entries.length,
      constName: match[1],
      name: match[2],
      url: match[3],
    });
  }

  if (entries.length === 0) {
    console.log('No website constants found to check');
    return;
  }

  const results = [];
  const concurrency = Math.min(6, entries.length);
  const queue = entries.slice();

  async function fetchEntry(entry) {
    try {
      const response = await fetch(entry.url, {
        method: 'GET',
        redirect: 'follow',
      });
      return {
        ...entry,
        finalUrl: response.url,
        status: response.status,
      };
    } catch (error) {
      return {
        ...entry,
        error: error.message,
      };
    }
  }

  const workers = Array.from({ length: concurrency }, async () => {
    while (true) {
      const entry = queue.shift();
      if (!entry) break;
      const result = await fetchEntry(entry);
      results.push(result);
    }
  });

  await Promise.all(workers);
  results.sort((a, b) => a.index - b.index);

  console.log('\nRedirect report (original url -> final url [status]):');
  for (const result of results) {
    if (result.error) {
      console.log(
        `${result.name} (${result.constName}): ${result.url} -> failed (${result.error})`
      );
    } else {
      console.log(
        `${result.name} (${result.constName}): ${result.url} -> ${result.finalUrl} [${result.status}]`
      );
    }
  }
}

main().catch(error => {
  console.error('Error while checking redirects:', error);
  process.exitCode = 1;
});
