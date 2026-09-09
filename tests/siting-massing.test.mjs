import test from "node:test";
import assert from "node:assert/strict";
import { campusModel, GPU_PROFILES, MASSING_DEFAULTS, offsetCoordinate, validateSavedPlacements } from "../siting-massing.mjs";
const origin = [126.646, 36.889];
const model = (options) => campusModel(origin, options);

test("GPU nameplate power determines rounded systems, racks and floor area", () => {
  const h = model({ mw: 1 }).metrics;
  assert.equal(h.systems, 84);
  assert.equal(h.racks, 21);
  assert.equal(h.gpuCount, 672);
  assert.ok(Math.abs(h.grossArea - 21 * 3.6 * 1.8 / .85) < 1e-8);
  const b = model({ mw: 1, gpu: "b200", systemsPerRack: 2 }).metrics;
  assert.equal(b.systems, 60); assert.equal(b.racks, 30);
  assert.ok(b.grossArea > h.grossArea);
  const g = model({ mw: 1, gpu: "gb200", systemsPerRack: 1 }).metrics;
  assert.equal(g.racks, 8); assert.equal(g.gpuCount, 576);
  assert.ok(g.siteArea < h.siteArea);
  assert.equal(model({ gpu: "h100" }).metrics.grossArea, model({ gpu: "h200" }).metrics.grossArea);
});

test("capacity, rack spacing and floors change the appropriate dimensions", () => {
  const base = model({}).metrics;
  assert.ok(model({ mw: 100 }).metrics.siteArea > base.siteArea);
  assert.ok(model({ rackArea: 7.2 }).metrics.grossArea > base.grossArea);
  const taller = model({ floors: 4 }).metrics;
  assert.equal(taller.grossArea, base.grossArea);
  assert.equal(taller.hallFootprint, base.hallFootprint / 2);
  assert.ok(taller.height > base.height);
  assert.equal(model({ gpu: "manual", mw: 40, density: 1200 }).metrics.grossArea, 48000);
});

test("all profiles and supported MW extremes produce finite enclosed geometry", () => {
  for (const p of GPU_PROFILES) for (const mw of [1, 10, 40, 100, 300, 2000]) for (const floors of [1, 6]) {
    const result = model({ gpu: p.id, systemsPerRack: p.systemsPerRack, mw, floors });
    const bounds = result.footprint.geometry.coordinates[0];
    const xs = bounds.map((v) => v[0]), ys = bounds.map((v) => v[1]);
    for (const feature of result.features) {
      const ring = feature.geometry.coordinates[0];
      assert.deepEqual(ring[0], ring.at(-1));
      for (const [x, y] of ring) {
        assert.ok(Number.isFinite(x) && Number.isFinite(y));
        assert.ok(x >= Math.min(...xs) - 1e-9 && x <= Math.max(...xs) + 1e-9);
        assert.ok(y >= Math.min(...ys) - 1e-9 && y <= Math.max(...ys) + 1e-9);
      }
    }
  }
});

test("translation and rotation preserve campus dimensions", () => {
  const moved = offsetCoordinate(origin, 20, 0);
  assert.ok(moved[0] > origin[0]); assert.equal(moved[1], origin[1]);
  const north = offsetCoordinate(origin, 20, 0, 90);
  assert.ok(north[1] < origin[1]);
  assert.equal(campusModel(moved, { rotation: 90 }).metrics.siteArea, model({}).metrics.siteArea);
});

test("reject invalid models and preserve GPU assumptions in saved placements", () => {
  for (const options of [{ mw: NaN }, { mw: 0 }, { floors: 1.5 }, { gpu: "unknown" }, { gpu: "gb300", systemsPerRack: 4 }, { rackArea: -1 }]) assert.throws(() => model(options), RangeError);
  const saved = { id: "a", name: "나주", coords: origin, options: { ...MASSING_DEFAULTS, gpu: "gb300", systemsPerRack: 1 } };
  assert.deepEqual(validateSavedPlacements([saved]), [saved]);
  assert.deepEqual(validateSavedPlacements([{ ...saved, coords: [0, 0] }]), []);
  assert.equal(validateSavedPlacements(Array(20).fill(saved)).length, 12);
});
