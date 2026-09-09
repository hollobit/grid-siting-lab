import { campusModel, MASSING_DEFAULTS, GPU_PROFILES, offsetCoordinate, validLocation, validateSavedPlacements } from "./siting-massing.mjs";

const MAPLIBRE_VERSION = "5.24.0";
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const TERRAIN_TILES = "https://tiles.mapterhorn.com/{z}/{x}/{y}.webp";
const STORAGE_KEY = "aidc-siting-placements-v1";
const bridge = window.AIDCSiting;
let dialog, map3d, modelMarker, priorFocus, libraryPromise;
let candidateMarkers = [], ready = false, placing = false, terrainOn = false, initializing = false;
let anchor, options = { ...MASSING_DEFAULTS }, currentModel, analysis, lastGoodAnchor;
let selectedId = "", saved = [], dirty = false;
const el = (id) => dialog.querySelector(`#${id}`);
const format = (value, digits = 0) => Number(value).toLocaleString("ko-KR", { maximumFractionDigits: digits });
const animate = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function stylesheet(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link"); link.rel = "stylesheet"; link.href = href; document.head.append(link);
}
stylesheet("siting-3d.css");

function createWorkspace() {
  dialog = document.createElement("dialog");
  dialog.className = "siting-dialog";
  dialog.setAttribute("aria-labelledby", "siting-title");
  dialog.innerHTML = `
    <header class="siting-header"><div><h2 id="siting-title">AIDC 3D 입지 탐색</h2><p>실제 지도 위에서 캠퍼스 규모와 배치 비교</p></div><button type="button" class="siting-button" id="siting-close">2D 지도로 돌아가기 ×</button></header>
    <div class="siting-layout">
      <aside class="siting-controls" aria-label="AIDC 배치 설정">
        <div class="siting-field"><label for="siting-candidate">탐색할 후보지</label><select id="siting-candidate"></select></div>
        <div class="siting-presets" aria-label="AIDC 규모 선택"><button type="button" class="siting-button" data-mw="10">10<small>소형 MW</small></button><button type="button" class="siting-button" data-mw="40">40<small>중형 MW</small></button><button type="button" class="siting-button" data-mw="100">100<small>대형 MW</small></button><button type="button" class="siting-button" data-mw="300">300<small>초대형 MW</small></button></div>
        <div class="siting-field"><label for="siting-mw">IT 전력 규모 · MW</label><input id="siting-mw" type="number" min="1" max="2000" step="1" value="40" required /></div>
        <div class="siting-field"><label for="siting-gpu">GPU 시스템 · 자동 크기 산정</label><select id="siting-gpu">${GPU_PROFILES.map((p) => `<option value="${p.id}">${p.label}</option>`).join("")}<option value="manual">면적 직접 지정 · m²/MW</option></select></div>
        <p class="siting-caption" id="siting-gpu-spec"></p>
        <div id="siting-rack-settings">
          <div class="siting-field-row"><div class="siting-field"><label for="siting-rack-count">랙당 시스템 수</label><input id="siting-rack-count" type="number" min="1" max="4" step="1" value="4" required /></div><div class="siting-field"><label for="siting-compute-share">GPU 시스템 전력 비중 %</label><input id="siting-compute-share" type="number" min="10" max="95" step="1" value="85" required /></div></div>
          <div class="siting-field-row"><div class="siting-field"><label for="siting-rack-area">통로 포함 m²/랙</label><input id="siting-rack-area" type="number" min="2" max="12" step="0.1" value="3.6" required /></div><div class="siting-field"><label for="siting-support">지원 공간 배수</label><input id="siting-support" type="number" min="1" max="5" step="0.1" value="1.8" required /></div></div>
          <p class="siting-caption">면적·전력 비중은 조정 가능한 계획 가정입니다. 정격 최대전력 기준의 수량 추정이며, 처리 성능이 같은 GPU 수를 뜻하지 않습니다.</p>
        </div>
        <div class="siting-field-row"><div class="siting-field"><label for="siting-floors">데이터홀 층수</label><select id="siting-floors">${[1,2,3,4,5,6].map((n) => `<option value="${n}" ${n === 2 ? "selected" : ""}>${n}층</option>`).join("")}</select></div><div class="siting-field"><label for="siting-density">연면적 · m²/MW</label><input id="siting-density" type="number" min="600" max="3000" step="100" value="1200" required /></div></div>
        <dl class="siting-metrics" id="siting-dimensions"></dl>
        <p class="siting-caption">규모를 바꾸면 데이터홀·냉각 설비·전력동과 도로를 포함한 용지가 자동 생성됩니다. 건물 동수는 동당 최대 20 MW 가정입니다.</p>
        <div class="siting-divider"><h3>배치 조정</h3><label for="siting-rotation">방향 <output id="siting-angle">0°</output></label><input id="siting-rotation" type="range" min="0" max="355" step="5" value="0" /><div class="siting-nudge" aria-label="모델 20미터 이동"><button type="button" class="siting-button" data-nudge="0,20" aria-label="북쪽으로 20미터">↑</button><button type="button" class="siting-button" data-nudge="-20,0" aria-label="서쪽으로 20미터">←</button><button type="button" class="siting-button" data-nudge="0,-20" aria-label="남쪽으로 20미터">↓</button><button type="button" class="siting-button" data-nudge="20,0" aria-label="동쪽으로 20미터">→</button><span>20 m씩 이동</span></div><p class="siting-caption">주황색 이동점을 드래그하거나 ‘위치 배치’를 켜고 지도를 클릭하세요. 이동점에 초점을 두고 방향키로도 이동할 수 있습니다.</p></div>
        <div class="siting-divider"><h3>현재 위치의 규모 적합도</h3><div class="siting-fit" id="siting-fit" aria-live="polite"></div><p class="siting-caption">표준 N+1·PUE 1.25·하이브리드 냉각 기준 프록시입니다. GPU별 냉각 차이는 이 점수에 반영되지 않습니다. 필지 경계·소유권·경사·건축 가능 여부는 확인되지 않았습니다.</p><button type="button" class="siting-button primary" id="siting-apply">이 위치를 2D 분석에 적용</button></div>
        <div class="siting-divider"><h3>배치안 비교</h3><button type="button" class="siting-button" id="siting-save">현재 배치안 저장</button><p class="siting-caption" id="siting-save-note">이 브라우저에만 최대 12개를 저장합니다.</p><ul class="siting-saved" id="siting-saved"></ul></div>
        <details class="siting-divider"><summary>모델 가정과 지도 출처</summary><p class="siting-caption">시스템 수 = 올림(IT kW × GPU 전력 비중 ÷ 시스템 최대 kW). 랙 수 = 올림(시스템 수 ÷ 랙당 시스템). 데이터홀 연면적 = 랙 수 × 통로 포함 m²/랙 × 지원 공간 배수 ÷ GPU 전력 비중. 비중의 나머지는 네트워크·스토리지 공간으로 같은 비율만큼 예약하는 가정입니다. 직접 지정 모드에서는 IT MW × m²/MW를 사용합니다.</p><p class="siting-caption">건물 바닥면적 = 연면적 ÷ 층수. 층고 6 m, 지붕 2 m, 냉각 설비 2.5 m. 동간·외곽 도로 20 m, 서비스 구역 55 m, 최소 용지 폭 100 m. 냉각 설비 형상은 공통 개념 모델이며 GPU별 실제 CDU·배관·열제거 설계는 포함하지 않습니다. 직사각형 용지는 지적도나 설계 도면이 아닙니다.</p><p class="siting-caption">주변 건물은 OSM 형상과 지도 제공자의 추정 높이를 사용합니다. 누락된 건물도 있습니다. 지형은 약 30 m 해상도로, 부지 경사 검증용 측량 자료가 아닙니다.</p><p><a href="https://openfreemap.org/" target="_blank" rel="noopener">OpenFreeMap / OSM</a> · <a href="https://mapterhorn.com/" target="_blank" rel="noopener">Mapterhorn 지형</a> · <a href="https://maplibre.org/" target="_blank" rel="noopener">MapLibre</a></p></details>
      </aside>
      <section class="siting-stage" aria-label="후보지 3D 지도"><div id="siting-map" class="siting-map" aria-label="회전·확대 가능한 3D 지도"></div><div class="siting-map-tools"><button type="button" class="siting-button" id="siting-place" aria-pressed="false">위치 배치</button><button type="button" class="siting-button" id="siting-focus">모델 중심</button><button type="button" class="siting-button" id="siting-top">위에서 보기</button><button type="button" class="siting-button" id="siting-terrain" aria-pressed="false">지형 켜기</button><p id="siting-status" class="siting-status" role="status">3D 지도를 불러옵니다.</p></div><div class="siting-location"><strong id="siting-location-name"></strong><p id="siting-coords"></p></div><div class="siting-legend"><span>데이터홀</span><span>전력동</span><span>냉각 설비</span></div><div id="siting-error" class="siting-error" hidden><h3>3D 지도를 열 수 없습니다</h3><p id="siting-error-message"></p><button type="button" class="siting-button" id="siting-retry">다시 시도</button></div></section>
    </div>`;
  document.body.append(dialog);
  el("siting-close").onclick = dismissWorkspace;
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); dismissWorkspace(); });
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    document.body.style.overflow = "";
    priorFocus?.focus({ preventScroll: true });
  });
  el("siting-candidate").onchange = () => {
    const candidate = bridge.candidates().find((entry) => entry.id === el("siting-candidate").value);
    if (!candidate) return;
    selectedId = candidate.id;
    if (candidate.suggestedMw) options.mw = candidate.suggestedMw;
    moveTo([candidate.coords[1], candidate.coords[0]], { focus: true, label: candidate.name });
  };
  dialog.querySelectorAll("[data-mw]").forEach((button) => { button.onclick = () => { options.mw = Number(button.dataset.mw); regenerate(true); focusModel(); }; });
  el("siting-gpu").onchange = () => { options.gpu = el("siting-gpu").value; options.systemsPerRack = GPU_PROFILES.find((p) => p.id === options.gpu)?.systemsPerRack || 1; regenerate(true); focusModel(); };
  for (const [id, key] of [["siting-mw", "mw"], ["siting-floors", "floors"], ["siting-density", "density"], ["siting-rack-count", "systemsPerRack"], ["siting-compute-share", "computeShare"], ["siting-rack-area", "rackArea"], ["siting-support", "supportMultiplier"]]) {
    el(id).addEventListener("change", () => {
      if (!el(id).checkValidity()) { el(id).reportValidity(); return; }
      options[key] = Number(el(id).value); regenerate(true); focusModel();
    });
  }
  el("siting-rotation").oninput = () => { options.rotation = Number(el("siting-rotation").value); regenerate(false); dirty = true; };
  dialog.querySelectorAll("[data-nudge]").forEach((button) => { button.onclick = () => { const [east, north] = button.dataset.nudge.split(",").map(Number); moveTo(offsetCoordinate(anchor, east, north)); }; });
  el("siting-place").onclick = () => { placing = !placing; el("siting-place").setAttribute("aria-pressed", String(placing)); if (map3d) map3d.getCanvas().style.cursor = placing ? "crosshair" : ""; status(placing ? "지도를 클릭하면 캠퍼스 전체가 이동합니다." : "주황색 이동점을 드래그해 배치할 수 있습니다."); };
  el("siting-focus").onclick = focusModel;
  el("siting-top").onclick = () => map3d?.easeTo({ pitch: 0, bearing: 0, duration: animate() ? 450 : 0 });
  el("siting-terrain").onclick = toggleTerrain;
  el("siting-retry").onclick = initMap;
  el("siting-apply").onclick = () => { bridge.apply(anchor[1], anchor[0]); dirty = false; dismissWorkspace(); };
  el("siting-save").onclick = savePlacement;
  try { saved = validateSavedPlacements(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch { saved = []; }
  renderSaved();
}

function status(message) { el("siting-status").textContent = message; }
function error(message) { el("siting-error").hidden = false; el("siting-error-message").textContent = message; status("3D 연결 실패 · 배치 계산과 2D 지도는 계속 사용할 수 있습니다."); }

function loadLibrary() {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  if (libraryPromise) return libraryPromise;
  stylesheet(`https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css`);
  libraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js`;
    script.crossOrigin = "anonymous";
    const timer = setTimeout(() => { script.remove(); reject(new Error("3D 라이브러리 응답 시간이 초과됐습니다.")); }, 20000);
    script.onload = () => { clearTimeout(timer); resolve(window.maplibregl); };
    script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error("지도 라이브러리를 다운로드하지 못했습니다.")); };
    document.head.append(script);
  }).catch((failure) => { libraryPromise = null; throw failure; });
  return libraryPromise;
}

async function initMap() {
  if (initializing) return;
  initializing = true;
  ready = false; terrainOn = false;
  el("siting-terrain").setAttribute("aria-pressed", "false"); el("siting-terrain").textContent = "지형 켜기";
  el("siting-error").hidden = true; status("3D 지도를 불러옵니다.");
  el("siting-retry").disabled = true;
  try {
    const lib = await loadLibrary();
    if (map3d) { modelMarker?.remove(); candidateMarkers.forEach((marker) => marker.remove()); candidateMarkers = []; map3d.remove(); }
    const instance = new lib.Map({ container: el("siting-map"), style: STYLE_URL, center: anchor, zoom: 15.6, pitch: 58, bearing: -25, maxPitch: 75, maxZoom: 19, maxBounds: [[124, 33], [132, 39.5]], attributionControl: { compact: true } });
    map3d = instance;
    instance.addControl(new lib.NavigationControl({ visualizePitch: true }), "top-right");
    instance.addControl(new lib.ScaleControl({ unit: "metric" }), "bottom-left");
    const timeout = setTimeout(() => { if (!ready && map3d === instance) error("배경지도 응답이 지연되고 있습니다. 네트워크를 확인한 뒤 다시 시도하세요."); }, 25000);
    instance.on("remove", () => clearTimeout(timeout));
    instance.on("error", (event) => {
      if (map3d !== instance) return;
      console.warn("3D map resource unavailable", event.error?.message);
      if (terrainOn && (event.sourceId === "aidc-terrain" || /mapterhorn/i.test(`${event.error?.message || ""} ${event.error?.url || ""}`))) { instance.setTerrain(null); terrainOn = false; el("siting-terrain").setAttribute("aria-pressed", "false"); el("siting-terrain").textContent = "지형 켜기"; status("지형 자료 연결 실패 · 평면 지도를 유지합니다."); }
      else if (ready) status("일부 배경지도 자료를 불러오지 못했습니다. 캠퍼스는 개념 배치로 표시됩니다.");
    });
    instance.on("load", () => {
      if (map3d !== instance) return;
      clearTimeout(timeout); el("siting-error").hidden = true;
      const buildings = instance.getStyle().layers.find((layer) => layer["source-layer"] === "building" && layer.type === "fill");
      if (buildings && !instance.getStyle().layers.some((layer) => layer.type === "fill-extrusion")) instance.addLayer({ id: "aidc-context-buildings", source: buildings.source, "source-layer": "building", type: "fill-extrusion", minzoom: 13, paint: { "fill-extrusion-color": "#b2c2c1", "fill-extrusion-height": ["coalesce", ["get", "render_height"], 9], "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0], "fill-extrusion-opacity": .8 } });
      instance.addSource("aidc-campus", { type: "geojson", data: currentModel });
      instance.addLayer({ id: "aidc-campus-solid", type: "fill-extrusion", source: "aidc-campus", paint: { "fill-extrusion-color": ["get", "color"], "fill-extrusion-height": ["get", "height"], "fill-extrusion-base": ["get", "base"], "fill-extrusion-opacity": .98 } });
      instance.addSource("aidc-boundary", { type: "geojson", data: currentModel.footprint });
      instance.addLayer({ id: "aidc-boundary-line", type: "line", source: "aidc-boundary", paint: { "line-color": "#f2a35b", "line-width": 3, "line-dasharray": [3, 2] } });
      const handle = document.createElement("button"); handle.type = "button"; handle.className = "siting-anchor"; handle.textContent = "✥"; handle.setAttribute("aria-label", "AIDC 캠퍼스 이동점. 드래그하거나 방향키로 20미터 이동");
      modelMarker = new lib.Marker({ element: handle, draggable: true }).setLngLat(anchor).addTo(instance);
      modelMarker.on("dragstart", () => { lastGoodAnchor = [...anchor]; });
      modelMarker.on("drag", () => { const point = modelMarker.getLngLat(); if (validLocation([point.lng, point.lat])) { anchor = [point.lng, point.lat]; regenerate(false); } });
      modelMarker.on("dragend", () => { const point = modelMarker.getLngLat(); moveTo(validLocation([point.lng, point.lat]) ? [point.lng, point.lat] : lastGoodAnchor); });
      handle.addEventListener("keydown", (event) => { const steps = { ArrowUp: [0, 20], ArrowDown: [0, -20], ArrowLeft: [-20, 0], ArrowRight: [20, 0] }; if (steps[event.key]) { event.preventDefault(); moveTo(offsetCoordinate(anchor, ...steps[event.key])); } });
      instance.on("click", (event) => { if (placing) moveTo([event.lngLat.lng, event.lngLat.lat]); });
      instance.getCanvas().addEventListener("webglcontextlost", () => error("3D 그래픽 연결이 끊겼습니다. 배치안을 저장한 뒤 다시 시도하거나 2D 지도로 돌아가세요."));
      ready = true; regenerate(true); refreshCandidates(); focusModel(); status("주황색 이동점을 드래그해 입지를 비교하세요. 주변 건물 높이는 일부 추정입니다.");
    });
  } catch (failure) { error(failure.message); }
  finally { initializing = false; el("siting-retry").disabled = false; }
}

function refreshCandidates() {
  if (!dialog) return;
  const selector = el("siting-candidate"); selector.replaceChildren();
  const entries = bridge.candidates();
  const placeholder = document.createElement("option"); placeholder.value = ""; placeholder.textContent = "직접 배치한 위치"; selector.append(placeholder);
  const groups = new Map();
  entries.forEach((entry) => { if (!groups.has(entry.group)) { const group = document.createElement("optgroup"); group.label = entry.group; groups.set(entry.group, group); selector.append(group); } const option = document.createElement("option"); option.value = entry.id; option.textContent = entry.name; groups.get(entry.group).append(option); });
  selector.value = selectedId;
  if (!ready) return;
  candidateMarkers.forEach((marker) => marker.remove());
  candidateMarkers = entries.map((entry) => { const point = document.createElement("button"); point.type = "button"; point.className = "siting-candidate"; point.title = entry.name; point.setAttribute("aria-label", `${entry.name} 3D로 보기`); point.onclick = (event) => { event.stopPropagation(); selectedId = entry.id; if (entry.suggestedMw) options.mw = entry.suggestedMw; moveTo([entry.coords[1], entry.coords[0]], { focus: true, label: entry.name }); }; return new window.maplibregl.Marker({ element: point }).setLngLat([entry.coords[1], entry.coords[0]]).addTo(map3d); });
}

function regenerate(evaluate = false) {
  currentModel = campusModel(anchor, options);
  const m = currentModel.metrics;
  if (ready) { map3d.getSource("aidc-campus").setData(currentModel); map3d.getSource("aidc-boundary").setData(currentModel.footprint); modelMarker.setLngLat(anchor); }
  el("siting-mw").value = options.mw; el("siting-floors").value = options.floors; el("siting-density").value = options.density; el("siting-rotation").value = options.rotation; el("siting-angle").textContent = `${options.rotation}°`;
  const profile = GPU_PROFILES.find((p) => p.id === options.gpu);
  el("siting-gpu").value = options.gpu;
  el("siting-density").disabled = !!profile;
  if (profile) el("siting-density").value = Math.round(m.density);
  el("siting-rack-settings").hidden = !profile;
  el("siting-rack-count").disabled = !!profile && !profile.rackUnits;
  for (const [id, key] of [["siting-rack-count", "systemsPerRack"], ["siting-compute-share", "computeShare"], ["siting-rack-area", "rackArea"], ["siting-support", "supportMultiplier"]]) el(id).value = options[key];
  el("siting-gpu-spec").replaceChildren();
  if (profile) {
    el("siting-gpu-spec").append(`${profile.gpus} GPU/${profile.rackUnits ? `${profile.rackUnits}U 시스템` : "랙"} · 최대 ${profile.kw} kW · ${profile.cooling}. ${profile.id === "h200" ? "4대/랙은 H100 구성 준용 가정. " : ""}${profile.id === "b200" && options.systemsPerRack > 2 ? "고밀도 구성은 특수 공랭·랙 설계 필요. " : ""}`);
    const source = document.createElement("a"); source.href = profile.source; source.target = "_blank"; source.rel = "noopener"; source.textContent = "NVIDIA 공식 사양"; el("siting-gpu-spec").append(source);
  } else el("siting-gpu-spec").textContent = "GPU 수량 없이 연면적 계수를 직접 지정합니다.";
  dialog.querySelectorAll("[data-mw]").forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.mw) === options.mw)));
  el("siting-dimensions").innerHTML = `<div><dt>데이터홀</dt><dd>${m.halls}동 · ${m.floors}층</dd></div><div><dt>최고 높이</dt><dd>${format(m.height, 1)} m</dd></div><div><dt>필요 용지</dt><dd>${format(m.siteArea / 10000, 2)} ha</dd></div><div><dt>부지 가로 × 세로</dt><dd>${format(m.width)} × ${format(m.depth)} m</dd></div><div><dt>데이터홀 연면적</dt><dd>${format(m.grossArea)} m²</dd></div><div><dt>용지 면적</dt><dd>${format(m.siteArea)} m²</dd></div>`;
  if (profile) el("siting-dimensions").insertAdjacentHTML("afterbegin", `<div><dt>GPU / 컴퓨트 랙</dt><dd>${format(m.gpuCount)}개 / ${format(m.racks)}랙</dd></div><div><dt>완전 적재 랙 전력</dt><dd>${format(m.rackKw, 1)} kW</dd></div><div><dt>계산된 면적 계수</dt><dd>${format(m.density)} m²/MW</dd></div><div><dt>설치 시스템 최대전력</dt><dd>${format(m.systems * profile.kw / 1000, 3)} MW</dd></div>`);
  el("siting-coords").textContent = `${anchor[1].toFixed(5)}° N, ${anchor[0].toFixed(5)}° E · ${format(options.mw)} MW · ${format(m.siteArea / 10000, 2)} ha`;
  if (evaluate) { dirty = true; evaluateLocation(); }
}

function moveTo(coords, { focus = false, label } = {}) {
  if (!validLocation(coords)) { status("대한민국 분석 범위 안에서 배치하세요."); return; }
  anchor = [...coords]; lastGoodAnchor = [...coords];
  if (!label) selectedId = "";
  el("siting-candidate").value = selectedId;
  regenerate(true);
  el("siting-location-name").textContent = label || "직접 배치한 AIDC 캠퍼스";
  if (focus) focusModel();
}

function evaluateLocation() {
  analysis = bridge.evaluate(anchor[1], anchor[0], options.mw);
  const fit = el("siting-fit"); fit.dataset.fit = analysis.ok && analysis.gridAvailable ? "good" : "review";
  fit.replaceChildren();
  const title = document.createElement("strong"); title.textContent = `${analysis.score}점 · ${analysis.gridAvailable ? (analysis.ok ? "규모 전제 충족 (프록시)" : analysis.bottleneck || "추가 검토") : "전력 스냅샷 미연결"}`;
  const details = document.createElement("p"); details.textContent = `계통 ~${format(analysis.gridMax)} MW / 용수 ~${format(analysis.waterMax)} MW. ${Number.isFinite(analysis.nearestHv) ? `345 kV+ 회선 ${format(analysis.nearestHv, 1)} km.` : "고압 회선 거리 미확인."} 필지 적합성은 별도 검토가 필요합니다.`;
  fit.append(title, details);
}

function focusModel() {
  if (!map3d || !ready) return;
  const size = Math.max(currentModel.metrics.width, currentModel.metrics.depth);
  const viewportAdjustment = Math.max(0, Math.log2(900 / Math.max(280, map3d.getCanvas().clientWidth)));
  const zoom = Math.max(10, Math.min(17, 17 - Math.log2(size / 130) - viewportAdjustment));
  map3d.flyTo({ center: anchor, zoom, pitch: 58, bearing: options.rotation - 25, duration: animate() ? 900 : 0 });
}

function toggleTerrain() {
  if (!ready) { status("지도가 준비된 후 지형을 켤 수 있습니다."); return; }
  terrainOn = !terrainOn;
  if (terrainOn && !map3d.getSource("aidc-terrain")) map3d.addSource("aidc-terrain", { type: "raster-dem", tiles: [TERRAIN_TILES], tileSize: 512, encoding: "terrarium", minzoom: 0, maxzoom: 12, attribution: '<a href="https://mapterhorn.com/attribution">© Mapterhorn</a>' });
  map3d.setTerrain(terrainOn ? { source: "aidc-terrain", exaggeration: 1 } : null);
  el("siting-terrain").setAttribute("aria-pressed", String(terrainOn)); el("siting-terrain").textContent = terrainOn ? "지형 끄기" : "지형 켜기";
  status(terrainOn ? "30 m급 지형을 불러옵니다 · 부지 경사는 측량으로 확인하세요." : "평면 지형에서 건물과 부지 크기를 비교합니다.");
}

function persistPlacements() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); el("siting-save-note").textContent = "이 브라우저에 저장됐습니다. 다른 기기와 동기화되지 않습니다."; }
  catch { el("siting-save-note").textContent = "브라우저 저장 공간을 사용할 수 없어 현재 화면에서만 유지됩니다."; }
}

function savePlacement() {
  if (saved.length >= 12) { status("저장한 배치안은 최대 12개입니다. 기존 배치안을 삭제한 후 저장하세요."); return; }
  saved.push({ id: crypto.randomUUID(), name: el("siting-location-name").textContent, coords: [...anchor], options: { ...options } });
  persistPlacements(); renderSaved(); status("현재 위치와 규모·방향을 배치안으로 저장했습니다.");
}

function renderSaved() {
  el("siting-saved").replaceChildren();
  saved.forEach((item) => {
    const li = document.createElement("li"), button = document.createElement("button"), remove = document.createElement("button");
    button.type = remove.type = "button"; button.className = remove.className = "siting-button";
    button.textContent = `${format(item.options.mw)} MW · ${GPU_PROFILES.find((p) => p.id === item.options.gpu)?.label || "직접 지정"} · ${item.name}`;
    button.onclick = () => { options = { ...item.options }; selectedId = ""; moveTo(item.coords, { focus: true, label: item.name }); };
    remove.textContent = "×"; remove.setAttribute("aria-label", `${item.name} 배치안 삭제`); remove.onclick = () => { saved = saved.filter((entry) => entry.id !== item.id); persistPlacements(); renderSaved(); };
    li.append(button, remove); el("siting-saved").append(li);
  });
}

async function openWorkspace() {
  if (dialog?.open) return;
  priorFocus = document.activeElement;
  if (!dialog) createWorkspace();
  const current = bridge.selected();
  if (!anchor || (!dirty && current.id !== selectedId)) { anchor = [current.coords[1], current.coords[0]]; selectedId = current.id; el("siting-location-name").textContent = current.name; }
  refreshCandidates(); regenerate(true);
  dialog.showModal(); document.body.style.overflow = "hidden";
  el("siting-close").focus();
  if (!map3d || !ready) await initMap(); else { map3d.resize(); focusModel(); }
}

function dismissWorkspace() {
  location.hash = "map-section";
  closeWorkspace();
}

function closeWorkspace() {
  // Release immediately; the queued dialog close event may wait behind site scoring.
  document.body.style.overflow = "";
  dialog.close();
}

function syncWorkspaceFromUrl() {
  if (location.hash === "#siting-3d") openWorkspace();
  else if (dialog?.open) closeWorkspace();
}
window.addEventListener("hashchange", syncWorkspaceFromUrl);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", syncWorkspaceFromUrl, { once: true });
else syncWorkspaceFromUrl();
window.addEventListener("aidc:recommendations", () => { refreshCandidates(); if (dialog?.open) evaluateLocation(); });
window.addEventListener("aidc:selection", () => {
  if (!dialog || dialog.open) return;
  const current = bridge.selected(); selectedId = current.id; anchor = [current.coords[1], current.coords[0]]; dirty = false;
  el("siting-location-name").textContent = current.name;
});
