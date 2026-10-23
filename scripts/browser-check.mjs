import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const baseURL = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {}),
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await mkdir('test-results/screenshots', { recursive: true });
const report = [];
try {
  for (const [width, height] of [
    [402, 740],
    [375, 667],
    [320, 740],
  ]) {
    await page.setViewportSize({ width, height });
    for (const view of ['start', 'home', 'easy', 'medium', 'hard', 'countdown']) {
      await page.goto(`${baseURL}/?view=${view}&solo`);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('.screen').waitFor();
      await page.waitForFunction(() => [...document.images].every((img) => img.complete));
      const result = await page.evaluate(() => {
        const bounds = (selector) =>
          [...document.querySelectorAll(selector)].map((el) => {
            const r = el.getBoundingClientRect();
            return {
              x: r.x,
              y: r.y,
              width: r.width,
              height: r.height,
              bottom: r.bottom,
              right: r.right,
            };
          });
        return {
          width: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
          brokenImages: [...document.images]
            .filter((img) => !img.naturalWidth)
            .map((img) => img.src),
          tiles: bounds('.letter-tile'),
          arena: bounds('.arena'),
          actions: bounds('.game-actions'),
          gameplayRows: bounds('.gameplay > *'),
          font: getComputedStyle(document.querySelector('.screen')).fontFamily,
        };
      });
      assert.equal(result.brokenImages.length, 0, `${view}: missing images`);
      assert.ok(result.font.includes('WordokenFixture'), `${view}: theme missing`);
      assert.ok(result.width <= width, `${view}: horizontal overflow at ${width}`);
      assert.ok(
        result.height <= height + 1,
        `${view}: vertical overflow at ${width}×${height}: ${result.height}`,
      );
      if (result.tiles.length) {
        const count = view === 'easy' ? 6 : view === 'medium' ? 7 : 8;
        assert.equal(result.tiles.length, count);
        assert.equal(result.arena[0].height, 160);
        assert.ok(result.actions[0].bottom + 7 <= height, `${view}: action shadow clipped`);
        for (let i = 1; i < result.gameplayRows.length; i++) {
          assert.ok(
            result.gameplayRows[i].y >= result.gameplayRows[i - 1].bottom,
            `${view}: overlapping rows`,
          );
        }
      }
      report.push({ view, viewport: { width, height }, ...result });
      await page.screenshot({
        path: `test-results/screenshots/${view}-${width}x${height}.png`,
        fullPage: true,
      });
    }
  }
  await page.setViewportSize({ width: 1100, height: 850 });
  await page.goto(`${baseURL}/?view=hard`);
  await page.getByRole('button', { name: 'C', exact: true }).click();
  await page
    .locator('.preview-sidebar output')
    .filter({ hasText: 'Gameplay.onLetterSelect' })
    .waitFor();
  assert.equal(
    await page.locator('.word-entry output').textContent(),
    'COMPUTER',
    'Visual-only callbacks must not mutate game values',
  );
  await page.getByLabel('Feedback state').selectOption('success');
  await page.getByRole('status').filter({ hasText: 'GREAT WORD!' }).waitFor();
  await page.getByLabel('Feedback state').selectOption('none');
  assert.equal(await page.locator('.word-feedback').count(), 0);
  await page.getByRole('button', { name: 'Scroll found words' }).click();
  await page.waitForFunction(() => document.querySelector('.found-words').scrollLeft > 0);
  await page
    .getByRole('navigation', { name: 'Preview screens' })
    .getByRole('button', { name: 'home', exact: true })
    .click();
  await page.locator('input[value="medium"]').check();
  assert.equal(await page.locator('input[value="medium"]').isChecked(), true);
  await page.getByRole('button', { name: 'Edit avatar', exact: true }).click();
  await page.locator('.preview-sidebar output').filter({ hasText: 'Edit avatar' }).waitFor();
  assert.deepEqual(errors, []);
  if (process.env.CONSUMER_URL) {
    await page.goto(process.env.CONSUMER_URL);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(
      () =>
        document.images.length === 10 &&
        [...document.images].every((img) => img.complete && img.naturalWidth > 0),
    );
    assert.equal(await page.getByRole('button', { name: 'PACKAGE CONSUMER' }).count(), 1);
    assert.equal(
      await page.locator('.action').evaluate((el) => getComputedStyle(el).backgroundColor),
      'rgb(247, 206, 16)',
    );
    console.log('PASS: built package consumer renders its stylesheet and all sprite assets.');
  }
  console.log(
    `PASS: ${report.length} screen/viewport checks, image loading, layout boundaries, callbacks, feedback, scrolling and radio selection.`,
  );
} finally {
  await writeFile('test-results/browser-report.json', JSON.stringify({ report, errors }, null, 2));
  await browser.close();
}
