// Conceptual gross floor area, not a certified facility design or parcel model.
export const GPU_PROFILES = Object.freeze([
  { id: "h100", label: "DGX H100", gpus: 8, kw: 10.2, rackUnits: 8, systemsPerRack: 4, cooling: "공랭", source: "https://docs.nvidia.com/dgx/dgxh100-user-guide/introduction-to-dgxh100.html" },
  { id: "h200", label: "DGX H200", gpus: 8, kw: 10.2, rackUnits: 8, systemsPerRack: 4, cooling: "공랭", source: "https://docs.nvidia.com/dgx/dgxh100-user-guide/introduction-to-dgxh100.html" },
  { id: "b200", label: "DGX B200", gpus: 8, kw: 14.3, rackUnits: 10, systemsPerRack: 2, cooling: "공랭", source: "https://docs.nvidia.com/dgx/dgxb200-user-guide/dgxb200-user-guide.pdf" },
  { id: "gb200", label: "GB200 NVL72", gpus: 72, kw: 120, rackUnits: null, systemsPerRack: 1, cooling: "액체·공랭 혼합", source: "https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html" },
  { id: "gb300", label: "GB300 NVL72", gpus: 72, kw: 142, rackUnits: null, systemsPerRack: 1, cooling: "액체냉각", source: "https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/components.html" },
].map(Object.freeze));
export const MASSING_DEFAULTS = Object.freeze({ mw: 40, floors: 2, density: 1200, rotation: 0, gpu: "h100", systemsPerRack: 4, computeShare: 85, rackArea: 3.6, supportMultiplier: 1.8 });
export const KOREA_BOUNDS = Object.freeze({ west: 124, east: 132, south: 33, north: 39.5 });
const EARTH_RADIUS = 6378137;

export function validLocation(coords) {
  return Array.isArray(coords) && coords.length === 2 && coords.every(Number.isFinite)
    && coords[0] >= KOREA_BOUNDS.west && coords[0] <= KOREA_BOUNDS.east
    && coords[1] >= KOREA_BOUNDS.south && coords[1] <= KOREA_BOUNDS.north;
}

export function offsetCoordinate(origin, east, north, rotation = 0) {
  const angle = rotation * Math.PI / 180;
  const x = east * Math.cos(angle) + north * Math.sin(angle);
  const y = north * Math.cos(angle) - east * Math.sin(angle);
  return [origin[0] + x / (EARTH_RADIUS * Math.cos(origin[1] * Math.PI / 180)) * 180 / Math.PI,
    origin[1] + y / EARTH_RADIUS * 180 / Math.PI];
}

export function campusModel(origin, options = {}) {
  if (!validLocation(origin)) throw new RangeError("분석 범위 밖의 좌표입니다.");
  const settings = { ...MASSING_DEFAULTS, ...options };
  const { mw, floors, rotation, gpu, systemsPerRack, computeShare, rackArea, supportMultiplier } = settings;
  let { density } = settings;
  if (![mw, floors, density, rotation].every(Number.isFinite) || mw < 1 || mw > 2000 || !Number.isInteger(floors) || floors < 1 || floors > 6 || density < 600 || density > 3000) throw new RangeError("규모·층수·면적 가정을 확인하세요.");
  const profile = GPU_PROFILES.find((entry) => entry.id === gpu);
  if (gpu !== "manual" && !profile) throw new RangeError("GPU 프로필을 확인하세요.");
  if (![systemsPerRack, computeShare, rackArea, supportMultiplier].every(Number.isFinite)
    || !Number.isInteger(systemsPerRack) || systemsPerRack < 1 || systemsPerRack > 4
    || (profile && !profile.rackUnits && systemsPerRack !== 1)
    || computeShare < 10 || computeShare > 95 || rackArea < 2 || rackArea > 12
    || supportMultiplier < 1 || supportMultiplier > 5) throw new RangeError("랙 구성·면적 가정을 확인하세요.");
  const systems = profile ? Math.ceil(mw * 1000 * computeShare / 100 / profile.kw) : 0;
  const racks = profile ? Math.ceil(systems / systemsPerRack) : 0;
  // Remaining IT power is network/storage. The same share reserves floor space;
  // this is a visible planning assumption, not a manufacturer floor-area spec.
  const grossArea = profile ? racks * rackArea * supportMultiplier / (computeShare / 100) : mw * density;
  density = grossArea / mw;
  const halls = Math.ceil(mw / 20);
  const columns = Math.min(halls, Math.ceil(Math.sqrt(halls * 1.5)));
  const rows = Math.ceil(halls / columns);
  const hallArea = (mw * density / floors) / halls;
  const hallWidth = Math.sqrt(hallArea * 1.5);
  const hallDepth = hallArea / hallWidth;
  const road = 20;
  const yard = 55;
  const width = Math.max(100, columns * hallWidth + (columns + 1) * road);
  const depth = rows * (hallDepth + road) + road + yard;
  const height = floors * 6 + 2;
  const features = [];
  function block(x, y, w, d, base, top, color, kind) {
    const ring = [[x, y], [x + w, y], [x + w, y + d], [x, y + d], [x, y]].map(([east, north]) => offsetCoordinate(origin, east, north, rotation));
    const feature = { type: "Feature", properties: { base, height: top, color, kind }, geometry: { type: "Polygon", coordinates: [ring] } };
    features.push(feature);
    return feature;
  }
  const footprint = block(-width / 2, -depth / 2, width, depth, 0, .4, "#355b62", "site");
  for (let i = 0; i < halls; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = -width / 2 + road + col * (hallWidth + road);
    const y = -depth / 2 + road + yard + row * (hallDepth + road);
    block(x, y, hallWidth, hallDepth, .4, height, "#f2a35b", "hall");
    const units = Math.max(1, Math.min(5, Math.floor(hallWidth / 22)));
    for (let unit = 0; unit < units; unit++) {
      block(x + hallWidth * (unit + .2) / units, y + hallDepth * .2, hallWidth * .55 / units, hallDepth * .5, height, height + 2.5, "#95b5bd", "cooling");
    }
  }
  block(-width / 2 + road, -depth / 2 + road, Math.max(15, (width - 3 * road) * .6), 35, .4, 8, "#52d1dc", "power");
  block(width / 2 - road - Math.max(15, (width - 3 * road) * .3), -depth / 2 + road, Math.max(15, (width - 3 * road) * .3), 35, .4, 11, "#d4e2e1", "operations");
  return { type: "FeatureCollection", features, footprint, metrics: {
    mw, floors, density, rotation, halls, width, depth, height: height + 2.5,
    grossArea, hallFootprint: grossArea / floors, siteArea: width * depth,
    gpu, systems, racks, gpuCount: systems * (profile?.gpus || 0), rackKw: (profile?.kw || 0) * systemsPerRack,
    cooling: profile?.cooling || "사용자 가정", computeShare, rackArea, supportMultiplier,
  } };
}

export function validateSavedPlacements(input) {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 12).filter((item) => {
    if (!item || typeof item.id !== "string" || typeof item.name !== "string" || !validLocation(item.coords)) return false;
    try { campusModel(item.coords, item.options); return !!item.options && Number.isFinite(item.options.mw); } catch { return false; }
  }).map(({ id, name, coords, options }) => ({ id: id.slice(0, 100), name: name.slice(0, 100), coords: [...coords], options: Object.fromEntries(Object.keys(MASSING_DEFAULTS).map((key) => [key, options[key] ?? (key === "gpu" ? "manual" : MASSING_DEFAULTS[key])])) }));
}
