const test = require("node:test");
const assert = require("node:assert/strict");

const load = () => import("../../src/utils/dictionaryKeywords.js");

test("only gpt-transcribe takes the dictionary as keywords", async () => {
  const { usesTranscriptionKeywords } = await load();
  assert.equal(usesTranscriptionKeywords("gpt-transcribe"), true);
  assert.equal(usesTranscriptionKeywords(" gpt-transcribe "), true);
  for (const model of ["gpt-4o-mini-transcribe", "gpt-4o-transcribe", "whisper-1", "", undefined]) {
    assert.equal(usesTranscriptionKeywords(model), false, String(model));
  }
});

test("keywords split the joined dictionary on commas and line breaks", async () => {
  const { dictionaryKeywords } = await load();
  assert.deepEqual(dictionaryKeywords("Void, Gizmo Labs,Corti\nVoxtral\r\nParakeet"), [
    "Void",
    "Gizmo Labs",
    "Corti",
    "Voxtral",
    "Parakeet",
  ]);
});

test("keywords drop the characters OpenAI rejects and any entry left empty", async () => {
  const { dictionaryKeywords } = await load();
  assert.deepEqual(dictionaryKeywords("<Void>, < >, ,, a<b>c\n\n"), ["Void", "abc"]);
  assert.deepEqual(dictionaryKeywords(null), []);
  assert.deepEqual(dictionaryKeywords(""), []);
});
