import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { appearanceBootstrap, normalizeTheme, appearanceKey } from "../lib/appearance.ts";
test("theme input is restricted to light and dark, preserving dark by default", () => {
  for (const value of [null, undefined, "system", "", "LIGHT", {}, "dark"]) assert.equal(normalizeTheme(value), "dark");
  assert.equal(normalizeTheme("light"), "light");
});
function bootstrap(saved, blocked=false, metaAvailable=true) {
  const root={dataset:{},style:{},classList:{toggle:(name,on)=>{root.dark=on;assert.equal(name,"dark");}}};
  const meta={content:""};
  vm.runInNewContext(appearanceBootstrap,{
    localStorage:{getItem:key=>{assert.equal(key,appearanceKey);if(blocked)throw Error("Blocked");return saved;}},
    document:{documentElement:root,querySelector:()=>metaAvailable ? meta : null},
  });
  return {root,meta};
}
test("bootstrap applies saved light before hydration without changing React metadata", () => {
  const {root,meta}=bootstrap("light");
  assert.equal(root.dataset.theme,"light");assert.equal(root.dark,false);
  assert.equal(root.style.colorScheme,"light");assert.equal(meta.content,"");
});
test("bootstrap tolerates unavailable storage, invalid values and missing metadata", () => {
  for (const value of [null,"invalid","dark"]) {
    const {root,meta}=bootstrap(value);
    assert.equal(root.dataset.theme,"dark");assert.equal(root.dark,true);
    assert.equal(meta.content,"");
  }
  assert.equal(bootstrap("light",true).root.dataset.theme,"dark");
  assert.equal(bootstrap("light",false,false).root.dataset.theme,"light");
});
