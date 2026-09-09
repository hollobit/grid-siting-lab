export const TERRAIN_TILES = "https://tiles.mapterhorn.com/{z}/{x}/{y}.webp";
export const demSourceOptions = () => ({ type: "raster-dem", tiles: [TERRAIN_TILES], tileSize: 512, encoding: "terrarium", minzoom: 0, maxzoom: 12, attribution: '<a href="https://mapterhorn.com/attribution">© Mapterhorn</a>' });
let contourLibrary, contourDem;

function loadContours() {
  if (window.mlcontour) return Promise.resolve(window.mlcontour);
  if (contourLibrary) return contourLibrary;
  contourLibrary = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/maplibre-contour@0.1.0/dist/index.min.js";
    script.crossOrigin = "anonymous";
    const fail = () => { clearTimeout(timer); script.remove(); reject(new Error("등고선 라이브러리 연결 실패")); };
    const timer = setTimeout(fail, 15000);
    script.onerror = fail;
    script.onload = () => { clearTimeout(timer); resolve(window.mlcontour); };
    document.head.append(script);
  }).catch((error) => { contourLibrary = null; throw error; });
  return contourLibrary;
}

export function addTopography(map, note) {
  let removed = false, contoursOn = true, shadeOn = true, theme = "day", loading = false;
  map.once("remove", () => { removed = true; });
  const before = map.getStyle().layers.find((layer) => layer.type === "line" || layer.type === "symbol" || layer.type === "fill-extrusion")?.id;
  // Terrain and hillshade require separate source instances, even with the same DEM URL.
  map.addSource("aidc-hillshade-dem", demSourceOptions());
  map.addLayer({ id: "aidc-hillshade", type: "hillshade", source: "aidc-hillshade-dem", paint: { "hillshade-exaggeration": .45, "hillshade-illumination-anchor": "map", "hillshade-illumination-direction": 315 } }, before);
  const building = map.getStyle().layers.find((layer) => layer.type === "fill-extrusion" && layer["source-layer"] === "building");
  if (building) map.addLayer({ id: "aidc-building-outline", type: "line", source: building.source, "source-layer": "building", minzoom: 14, paint: { "line-width": ["interpolate", ["linear"], ["zoom"], 14, .35, 18, 1], "line-opacity": .65 } }, building.id);

  function setTheme(value) {
    theme = value;
    const night = theme === "night", sunset = theme === "sunset";
    const ink = night ? "#a5b9c3" : sunset ? "#79503c" : "#786449";
    map.setPaintProperty("aidc-hillshade", "hillshade-shadow-color", night ? "#030a13" : "#414f50");
    map.setPaintProperty("aidc-hillshade", "hillshade-highlight-color", night ? "#426276" : "#fff5d9");
    map.setPaintProperty("aidc-hillshade", "hillshade-accent-color", night ? "#183442" : "#877958");
    if (map.getLayer("aidc-building-outline")) map.setPaintProperty("aidc-building-outline", "line-color", night ? "#97b2c4" : "#5d686b");
    if (map.getLayer("aidc-contour-lines")) {
      map.setPaintProperty("aidc-contour-lines", "line-color", ink);
      map.setPaintProperty("aidc-contour-labels", "text-color", ink);
      map.setPaintProperty("aidc-contour-labels", "text-halo-color", night ? "#101d2a" : "#fff8e9");
    }
  }
  async function setContours(on) {
    contoursOn = on;
    if (!map.getSource("aidc-contours") && on && !loading) {
      loading = true; note("등고선을 계산합니다. 확대하면 20 m 간격·100 m 굵은 선이 표시됩니다.");
      try {
        const lib = await loadContours();
        if (removed) return;
        if (!contourDem) {
          contourDem = new lib.DemSource({ url: TERRAIN_TILES, encoding: "terrarium", maxzoom: 12, worker: true, cacheSize: 100, timeoutMs: 10000 });
          contourDem.setupMaplibre(window.maplibregl);
        }
        map.addSource("aidc-contours", { type: "vector", tiles: [contourDem.contourProtocolUrl({ thresholds: { 12: [100, 500], 14: [20, 100] }, elevationKey: "ele", levelKey: "level", contourLayer: "contours", buffer: 1, overzoom: 2 })], minzoom: 12, maxzoom: 14 });
        const labelLayer = map.getStyle().layers.find((layer) => layer.type === "symbol")?.id;
        map.addLayer({ id: "aidc-contour-lines", type: "line", source: "aidc-contours", "source-layer": "contours", minzoom: 12, layout: { visibility: contoursOn ? "visible" : "none" }, paint: { "line-width": ["match", ["get", "level"], 1, 1.3, .55], "line-opacity": .7 } }, labelLayer);
        const font = map.getStyle().layers.find((layer) => layer.type === "symbol" && Array.isArray(layer.layout?.["text-font"]) && layer.layout["text-font"].every((item) => typeof item === "string"))?.layout["text-font"];
        map.addLayer({ id: "aidc-contour-labels", type: "symbol", source: "aidc-contours", "source-layer": "contours", minzoom: 12, filter: [">", ["get", "level"], 0], layout: { visibility: contoursOn ? "visible" : "none", "symbol-placement": "line", "symbol-spacing": 350, "text-size": 11, "text-field": ["concat", ["number-format", ["get", "ele"], {}], " m"], ...(font ? { "text-font": font } : {}) }, paint: { "text-halo-width": 1.5 } }, labelLayer);
        setTheme(theme);
        note("확대 시 등고선 20 m / 굵은 선 100 m · 축소 시 100 m / 500 m. 약 30 m DEM에서 계산한 참고 지형입니다.");
      } catch {
        if (!removed) note("등고선을 불러오지 못했습니다. 등고선 버튼을 껐다 켜 재시도하세요. 기본 지도와 배치 계산은 유지됩니다.");
      } finally { loading = false; }
    }
    if (removed) return;
    for (const id of ["aidc-contour-lines", "aidc-contour-labels"]) if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", contoursOn ? "visible" : "none");
  }
  map.on("error", (event) => {
    if (event.sourceId === "aidc-contours") note("일부 등고선 고도 자료를 불러오지 못했습니다. 다른 위치로 이동하거나 등고선을 다시 켜세요.");
    if (event.sourceId === "aidc-hillshade-dem") note("일부 지형 음영 자료를 불러오지 못했습니다. 기본 지도는 유지됩니다.");
  });
  setTheme(theme);
  setContours(true);
  return { setTheme, toggleContours() { setContours(!contoursOn); return contoursOn; }, toggleShade() { shadeOn = !shadeOn; map.setLayoutProperty("aidc-hillshade", "visibility", shadeOn ? "visible" : "none"); return shadeOn; } };
}
