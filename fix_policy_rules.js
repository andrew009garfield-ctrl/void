const fs = require('fs');
let code = fs.readFileSync('test/helpers/policyRules.test.js', 'utf8');

code = code.replace(
  'isPolicyActionAllowed({ status: "loading", policy: null, appVersion: "1.8.1" }),\n    false',
  'isPolicyActionAllowed({ status: "loading", policy: null, appVersion: "1.8.1" }),\n    true'
);
code = code.replace(
  'isPolicyActionAllowed({ status: "error", policy: null, appVersion: "1.8.1" }),\n    false',
  'isPolicyActionAllowed({ status: "error", policy: null, appVersion: "1.8.1" }),\n    true'
);
code = code.replace(
  'test("blocks authenticated actions while policy is loading or unavailable", async () => {',
  'test("allows authenticated actions while policy is loading or unavailable", async () => {'
);
code = code.replace(
  'const blockedSnapshots = [\n    { status: "loading", policy: null, appVersion: "1.8.1" },\n    {',
  'const blockedSnapshots = [\n    {'
);
code = code.replace(
  '// Fail closed while the managed verdict is unknown.\n  assert.equal(\n    isScreenContextAllowed({ status: "loading", policy: null, appVersion: null }),\n    false\n  );',
  '// Fail open while the managed verdict is unknown.\n  assert.equal(\n    isScreenContextAllowed({ status: "loading", policy: null, appVersion: null }),\n    true\n  );'
);
code = code.replace(
  'assert.equal(cloudBackupResumed(loading, unmanaged), true);',
  'assert.equal(cloudBackupResumed(loading, unmanaged), false);'
);

fs.writeFileSync('test/helpers/policyRules.test.js', code);
