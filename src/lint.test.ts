import { loadBaseConfig } from './config/config-resolver';
import { lint, discoverModules } from './lint';
import { expectAllResourcesRegexValid } from './utils/tests';

const baseDir = 'src/rules/test-cases/general';
const baseConfig = loadBaseConfig(baseDir, '.monolint.json');
const baseConfig2 = loadBaseConfig(baseDir, '.monolint2.json');

describe('lint', () => {
  it('discoverModules by specific marker', async () => {
    const results = discoverModules(baseDir, baseConfig2, '.monolint2.json');
    expect(results).toHaveLength(1);
    expect(results[0].path.includes('group1')).toBeTruthy();
    expect(results[0].name).toEqual('mod3-svc');
  });

  it("discoverModules don't find ignored modules", async () => {
    const results = discoverModules(baseDir, baseConfig, '.monolint.json');
    const rr = results.filter((elem) => elem.path.includes('node_modules'));
    expect(rr).toHaveLength(0);
  });

  it('discoverModules by marker considering duplicate and ignoring folders', async () => {
    const results = discoverModules(baseDir, baseConfig, '.monolint.json');
    expect(results).toHaveLength(7);
  });

  it('discoverModules and check config hierarchy', async () => {
    const results = discoverModules(baseDir, baseConfig, '.monolint.json');
    expect(results).toHaveLength(7);

    expect(results[5].config.rules).toBeDefined();
    if (results[5].config.rules) {
      expect(results[5].config.rules['serverless-same-name']).toBeFalsy();
      expect(results[5].config.rules['packagejson-same-name']).toBeFalsy();
    }

    expect(results[6].config.rules).toBeDefined();
    if (results[6].config.rules) {
      expect(results[6].config.rules['serverless-same-name']).toBeTruthy();
      expect(results[6].config.rules['packagejson-same-name']).toBeFalsy();
    }
  });

  it('lint test repo', async () => {
    const results = lint(baseDir, '.monolint.json');

    expectAllResourcesRegexValid(
      results.filter((rr) => rr.rule === 'module-name-regex'),
      'src/rules/test-cases/general/modules/mod1-js',
      true,
    );

    expectAllResourcesRegexValid(
      results.filter((rr) => rr.rule === 'packagejson-same-name'),
      'src/rules/test-cases/general/modules/mod1-js/package.json',
      false,
    );

    expectAllResourcesRegexValid(
      results.filter((rr) => rr.rule === 'module-name-regex'),
      'src/rules/test-cases/general/modules/group3/group3a/mod7-xyz',
      false,
    );

    expectAllResourcesRegexValid(
      results.filter((rr) => rr.rule === 'module-name-regex'),
      'src/rules/test-cases/general/modules/group3/group3a/mod6-abc',
      true,
    );

    expectAllResourcesRegexValid(
      results.filter((rr) => rr.rule === 'serverless-same-name'),
      'src/rules/test-cases/general/modules/mod5-thx/serverless.yml',
      true,
    );
  });
});
