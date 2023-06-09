import { mkdirSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import test from "ava";

import { hashOfDirectory } from "../src/index.js";

const createTmpDir = () => {
  const tmpDir = tmpdir();
  const name = `bun-test-${Math.random().toString(36).slice(2)}`;
  const dir = path.join(tmpDir, name);
  mkdirSync(dir);
  return dir;
};

test("empty dir", async (t) => {
  const dir = createTmpDir();
  const hash = await hashOfDirectory(dir);

  t.snapshot(hash);
});

test("dir with empty folders", async (t) => {
  const dir = createTmpDir();

  const emptyDirHash = await hashOfDirectory(dir);

  mkdirSync(path.join(dir, "a"));
  const hash = await hashOfDirectory(dir);

  t.not(hash, emptyDirHash);
});

test("dir with empty nested folders", async (t) => {
  const dir = createTmpDir();

  const emptyDirHash = await hashOfDirectory(dir);

  mkdirSync(path.join(dir, "a"));
  const singleDirHash = await hashOfDirectory(dir);

  mkdirSync(path.join(dir, "a", "b"));
  const hash = await hashOfDirectory(dir);

  t.not(hash, emptyDirHash);
  t.not(hash, singleDirHash);
});

test("dir with files", async (t) => {
  const dir = createTmpDir();

  const emptyDirHash = await hashOfDirectory(dir);

  writeFileSync(path.join(dir, "a.txt"), "a");
  const hash = await hashOfDirectory(dir);

  t.not(hash, emptyDirHash);

  writeFileSync(path.join(dir, "a.txt"), "b");
  const hash2 = await hashOfDirectory(dir);

  t.not(hash, hash2);
});

test("dir with nested files", async (t) => {
  const dir = createTmpDir();

  const emptyDirHash = await hashOfDirectory(dir);

  writeFileSync(path.join(dir, "a.txt"), "a");
  const singleFileHash = await hashOfDirectory(dir);

  mkdirSync(path.join(dir, "a"));
  const singleDirHash = await hashOfDirectory(dir);

  writeFileSync(path.join(dir, "a", "b.txt"), "b");
  const hash = await hashOfDirectory(dir);

  t.not(hash, emptyDirHash);
  t.not(hash, singleFileHash);
  t.not(hash, singleDirHash);
});

test("custom algorithm", async (t) => {
  const dir = createTmpDir();
  const defaultHash = await hashOfDirectory(dir);
  const customHash = await hashOfDirectory(dir, { algorithm: "sha1" });

  t.not(defaultHash, customHash);
});

test("custom encoding", async (t) => {
  const dir = createTmpDir();
  const defaultHash = await hashOfDirectory(dir);
  const customHash = await hashOfDirectory(dir, { encoding: "hex" });

  t.not(defaultHash, customHash);
});
