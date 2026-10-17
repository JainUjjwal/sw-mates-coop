/**
 * Lightweight Zero-Dependency Unit Test Runner for In-Browser and Node/Headless Verification
 */
export class TestRunner {
  constructor(name = 'Unit Tests') {
    this.name = name;
    this.tests = [];
    this.results = [];
  }

  test(description, fn) {
    this.tests.push({ description, fn });
  }

  async run() {
    this.results = [];
    let passed = 0;
    let failed = 0;

    for (const { description, fn } of this.tests) {
      const startTime = performance.now();
      try {
        await fn();
        const duration = (performance.now() - startTime).toFixed(1);
        this.results.push({ description, status: 'pass', duration });
        passed++;
      } catch (err) {
        const duration = (performance.now() - startTime).toFixed(1);
        this.results.push({ description, status: 'fail', duration, error: err.message || String(err) });
        failed++;
      }
    }

    return {
      suite: this.name,
      total: this.tests.length,
      passed,
      failed,
      results: this.results,
      allPassed: failed === 0
    };
  }
}

export function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertEqual(actual, expected, message) {
  const detail = `Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`;
  if (actual !== expected) {
    throw new Error(message ? `${message} (${detail})` : detail);
  }
}

export function assertDeepEqual(actual, expected, message) {
  const actStr = JSON.stringify(actual);
  const expStr = JSON.stringify(expected);
  if (actStr !== expStr) {
    throw new Error(message ? `${message} (Expected: ${expStr}, Actual: ${actStr})` : `Expected: ${expStr}, Actual: ${actStr}`);
  }
}
