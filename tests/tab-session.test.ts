import assert from "node:assert/strict";
import test from "node:test";

import {
  PROFILE_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  clearLegacySharedSession,
  clearTabSession,
  readTabProfile,
  readTabSession,
  writeTabProfile,
  writeTabSession,
  type BrowserStorage,
} from "../lib/tab-session.ts";

function memoryStorage(initial: Record<string, string> = {}): BrowserStorage {
  const values = new Map(Object.entries(initial));
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: key => { values.delete(key); },
  };
}

test("旧版 localStorage 共享会话会在新版首次加载时清除", () => {
  const shared = memoryStorage({
    [SESSION_STORAGE_KEY]: "legacy-user-1111111-token",
    [PROFILE_STORAGE_KEY]: JSON.stringify({ studentId: "1111111" }),
    unrelated: "keep",
  });

  clearLegacySharedSession(shared);

  assert.equal(shared.getItem(SESSION_STORAGE_KEY), null);
  assert.equal(shared.getItem(PROFILE_STORAGE_KEY), null);
  assert.equal(shared.getItem("unrelated"), "keep");
});

test("同一浏览器的两个标签页可以保存不同账号会话", () => {
  const tabA = memoryStorage();
  const tabB = memoryStorage();

  writeTabSession(tabA, "student-a-token");
  writeTabProfile(tabA, { studentId: "1111111" });
  writeTabSession(tabB, "student-b-token");
  writeTabProfile(tabB, { studentId: "2222222" });

  assert.equal(readTabSession(tabA), "student-a-token");
  assert.equal(readTabSession(tabB), "student-b-token");
  assert.deepEqual(readTabProfile(tabA), { studentId: "1111111" });
  assert.deepEqual(readTabProfile(tabB), { studentId: "2222222" });

  clearTabSession(tabA);
  assert.equal(readTabSession(tabA), "");
  assert.equal(readTabSession(tabB), "student-b-token");
});
