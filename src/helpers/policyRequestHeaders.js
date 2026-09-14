const { isCanonicalAppVersion } = require("./appVersion");

const POLICY_CAPABILITY_VERSION = "1";

function withPolicyRequestHeaders(headers, appVersion) {
  if (!isCanonicalAppVersion(appVersion)) {
    throw new Error("Policy requests require a canonical app version");
  }
  return {
    ...headers,
    "x-void-policy-version": POLICY_CAPABILITY_VERSION,
    "x-void-version": appVersion,
  };
}

module.exports = { POLICY_CAPABILITY_VERSION, withPolicyRequestHeaders };
