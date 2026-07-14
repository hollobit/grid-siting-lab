const stats = {
  generation: 121404,
  plants: 4089,
  lines: 15176,
  kv154: 9420,
  kv345: 4584,
  kv765: 557,
};

const candidates = [
  {
    id: "dangjin",
    name: "당진",
    region: "충청남도",
    score: 86,
    coords: [36.889, 126.646],
    distance: "6.8 km",
    grid: "345 / 765 kV",
    water: "LOW",
    latency: "12 ms",
    status: "EXCELLENT FIT",
    summary: "345 kV·765 kV 계통 접근성과 대형 발전원 인접성이 강점입니다.",
    reason: "EHV corridor + generation cluster",
    factors: { grid: 94, reserve: 84, water: 82, fiber: 69, hazard: 87, land: 61 },
    headroom: 86,
  },
  {
    id: "naju",
    name: "나주",
    region: "전라남도",
    score: 82,
    coords: [35.015, 126.711],
    distance: "9.4 km",
    grid: "345 kV",
    water: "MED",
    latency: "18 ms",
    status: "STRONG FIT",
    summary: "광주·전남권 계통과 산업용지 접근성이 균형 잡힌 후보입니다.",
    reason: "balanced grid + land profile",
    factors: { grid: 86, reserve: 78, water: 74, fiber: 76, hazard: 84, land: 88 },
    headroom: 72,
  },
  {
    id: "sejong",
    name: "세종",
    region: "세종특별자치시",
    score: 78,
    coords: [36.504, 127.249],
    distance: "13.6 km",
    grid: "345 kV",
    water: "LOW",
    latency: "15 ms",
    status: "STRONG FIT",
    summary: "중부권 네트워크 중심성과 수도권 이중 경로 가능성이 있습니다.",
    reason: "central network position",
    factors: { grid: 81, reserve: 76, water: 80, fiber: 82, hazard: 80, land: 63 },
    headroom: 56,
  },
  {
    id: "icheon",
    name: "이천",
    region: "경기도",
    score: 74,
    coords: [37.272, 127.435],
    distance: "11.2 km",
    grid: "345 kV",
    water: "MED",
    latency: "8 ms",
    status: "WATCH LIST",
    summary: "수도권 지연시간은 유리하지만 토지·접속 경쟁 리스크가 큽니다.",
    reason: "latency advantage, land pressure",
    factors: { grid: 76, reserve: 61, water: 70, fiber: 94, hazard: 76, land: 42 },
    headroom: 38,
  },
  {
    id: "ulsan",
    name: "울산",
    region: "울산광역시",
    score: 76,
    coords: [35.538, 129.311],
    distance: "8.2 km",
    grid: "345 / 765 kV",
    water: "MED",
    latency: "24 ms",
    status: "STRONG FIT",
    summary: "산업단지·발전원 밀집도가 높고 동남권 계통 활용이 가능합니다.",
    reason: "industrial power cluster",
    factors: { grid: 91, reserve: 82, water: 68, fiber: 62, hazard: 70, land: 73 },
    headroom: 64,
  },
];

const contextProfiles = {
  dangjin: { urban: 68, transport: 82, telecom: 72, cloud: 58, university: 64, railAir: 65, satellite: 91, water: 82, resilience: 89, land: 61, cityContext: "대전·세종 생활권", networkContext: "2개 이중 경로 · 1개 IDC권", talentContext: "반경 60 km 내 4개" },
  naju: { urban: 74, transport: 76, telecom: 76, cloud: 62, university: 78, railAir: 70, satellite: 86, water: 74, resilience: 82, land: 88, cityContext: "광주 생활권 · 36 min", networkContext: "3개 백본 경로 · 1개 IDC권", talentContext: "반경 60 km 내 7개" },
  sejong: { urban: 82, transport: 91, telecom: 82, cloud: 73, university: 78, railAir: 78, satellite: 88, water: 80, resilience: 84, land: 63, cityContext: "대전·청주 생활권", networkContext: "4개 이중 경로 · 2개 IDC권", talentContext: "반경 60 km 내 9개" },
  icheon: { urban: 94, transport: 86, telecom: 94, cloud: 88, university: 82, railAir: 91, satellite: 76, water: 70, resilience: 73, land: 42, cityContext: "수도권 생활권 · 48 min", networkContext: "5개 백본 경로 · 6개 IDC권", talentContext: "반경 60 km 내 26개" },
  ulsan: { urban: 77, transport: 84, telecom: 62, cloud: 58, university: 76, railAir: 83, satellite: 89, water: 68, resilience: 80, land: 73, cityContext: "울산·부산 생활권", networkContext: "3개 이중 경로 · 2개 IDC권", talentContext: "반경 60 km 내 8개" },
};
candidates.forEach((site) => {
  site.factors = { ...site.factors, ...contextProfiles[site.id] };
});

const fallbackLines = [
  { voltage: 765, coords: [[37.06, 126.42], [36.78, 126.72], [36.55, 127.05], [36.21, 126.9], [35.86, 127.26], [35.56, 127.86]] },
  { voltage: 765, coords: [[37.06, 126.42], [37.19, 127.04], [37.32, 127.46], [36.95, 128.01], [36.62, 128.56], [36.25, 129.02]] },
  { voltage: 345, coords: [[36.97, 126.55], [36.61, 126.88], [36.4, 127.29], [36.18, 127.54], [35.88, 127.85], [35.54, 128.2]] },
  { voltage: 345, coords: [[36.22, 126.84], [36.5, 127.27], [36.9, 127.44], [37.28, 127.43], [37.48, 127.82]] },
  { voltage: 345, coords: [[35.03, 126.72], [35.38, 126.88], [35.71, 127.18], [36.18, 127.54]] },
  { voltage: 154, coords: [[35.03, 126.72], [35.34, 127.05], [35.62, 127.5], [35.78, 128.21], [35.54, 129.31]] },
  { voltage: 154, coords: [[36.5, 127.27], [36.2, 127.54], [35.9, 127.89], [35.54, 128.2], [35.1, 128.9]] },
  { voltage: 154, coords: [[37.28, 127.43], [37.04, 127.78], [36.62, 128.56], [36.25, 129.02]] },
];

const contextData = {
  urban: [
    [37.5665, 126.978, "서울 배후 도시권", 13], [37.456, 126.705, "인천 배후 도시권", 9], [36.35, 127.385, "대전 배후 도시권", 10],
    [35.872, 128.602, "대구 배후 도시권", 10], [35.16, 126.85, "광주 배후 도시권", 8], [35.179, 129.075, "부산 배후 도시권", 12],
    [35.54, 129.31, "울산 배후 도시권", 8], [37.88, 127.73, "춘천 배후 도시권", 6],
  ],
  transport: [
    { coords: [[37.57, 126.98], [37.28, 127.43], [36.82, 127.12], [36.35, 127.39], [35.87, 128.6], [35.18, 129.08]], label: "경부 고속도로 축" },
    { coords: [[36.82, 127.12], [36.5, 127.27], [35.16, 126.85], [34.81, 126.39]], label: "호남 고속도로 축" },
    { coords: [[37.57, 126.98], [37.88, 127.73], [37.35, 128.39], [37.08, 129.4]], label: "동서 물류 축" },
  ],
  railAir: {
    rail: [
      { coords: [[37.57, 126.98], [36.35, 127.39], [35.87, 128.6], [35.18, 129.08]], label: "경부 KTX" },
      { coords: [[36.35, 127.39], [35.16, 126.85], [34.81, 126.39]], label: "호남 KTX" },
    ],
    airports: [
      [37.46, 126.44, "인천국제공항"], [37.56, 126.8, "김포공항"], [36.72, 127.5, "청주공항"],
      [35.18, 128.94, "김해공항"], [35.9, 128.66, "대구공항"], [35.12, 126.81, "광주공항"],
    ],
  },
  telecom: [
    { coords: [[37.57, 126.98], [36.35, 127.39], [35.16, 126.85], [35.18, 129.08]], label: "국가 광통신 백본 프록시" },
    { coords: [[37.57, 126.98], [37.28, 127.43], [36.35, 127.39], [35.87, 128.6], [35.54, 129.31]], label: "동부 백본 이중화 프록시" },
    { coords: [[37.46, 126.44], [35.18, 129.08]], label: "국제·해저케이블 연결축 프록시" },
  ],
  cloud: [
    [37.88, 127.73, "NAVER GAK 춘천 · 기존 IDC"], [36.5, 127.27, "NAVER GAK 세종 · 기존 IDC"],
    [37.51, 127.04, "서울 클라우드 리전·IDC 클러스터"], [37.39, 126.95, "수도권 IDC 클러스터"],
    [36.35, 127.39, "대전 공공·연구 클라우드권"], [35.18, 129.08, "부산 엣지·IDC 클러스터"],
  ],
  university: [
    [37.46, 126.95, "서울대학교"], [36.37, 127.36, "KAIST"], [36.37, 127.34, "충남대학교"],
    [35.67, 129.19, "UNIST"], [36.1, 128.9, "DGIST"], [35.23, 128.68, "POSTECH"],
    [35.23, 126.84, "GIST"], [35.15, 129.1, "부산대학교"],
  ],
  satellite: [
    [37.24, 127.18, "위성통신 지상국 프록시 · 용인권"], [36.1, 127.49, "위성통신 지상국 프록시 · 금산권"],
    [36.49, 127.72, "위성통신 지상국 프록시 · 보은권"],
  ],
};

// Facility registry: lifecycle / operator type / capacity / source / confidence.
// 위치가 비공개인 시설은 공개 자료 기반 프록시 좌표를 사용하고 confidence LOW로 표기한다.
const lifecycleMeta = {
  operational: { label: "OPERATIONAL", color: "#7ad6a2" },
  construction: { label: "CONSTRUCTION", color: "#f2a35b" },
  planned: { label: "PLANNED", color: "#52d1dc" },
  unknown: { label: "UNKNOWN", color: "#8e9aa0" },
};

const operatorMeta = {
  hyperscaler: { label: "HYPERSCALER", color: "#aa91ff" },
  colocation: { label: "COLOCATION", color: "#52d1dc" },
  enterprise: { label: "ENTERPRISE", color: "#7ad6a2" },
  sovereign: { label: "SOVEREIGN·공공", color: "#f2a35b" },
  unknown: { label: "UNKNOWN", color: "#8e9aa0" },
};

const facilityRegistry = [
  { id: "gak-chuncheon", name: "NAVER GAK 춘천", campus: "GAK · 강원", coords: [37.8, 127.66], lifecycle: "operational", operator: "enterprise", capacityMW: null, source: "NAVER 공개자료", confirmed: "2013 개소 · 2026-07 조사", confidence: "MED" },
  { id: "gak-sejong", name: "NAVER GAK 세종", campus: "GAK · 세종", coords: [36.6, 127.25], lifecycle: "operational", operator: "enterprise", capacityMW: null, source: "NAVER 공개자료", confirmed: "2023 개소 · 2026-07 조사", confidence: "MED" },
  { id: "kakao-ansan", name: "카카오 데이터센터 안산", campus: "단독 · 경기", coords: [37.29, 126.83], lifecycle: "operational", operator: "enterprise", capacityMW: null, source: "카카오 공개자료", confirmed: "2024 개소 · 2026-07 조사", confidence: "MED" },
  { id: "lgu-pyeongchon", name: "LG U+ 평촌 메가센터", campus: "단독 · 경기", coords: [37.39, 126.96], lifecycle: "operational", operator: "colocation", capacityMW: null, source: "LG U+ 공개자료", confirmed: "2015 개소 · 2026-07 조사", confidence: "MED" },
  { id: "kt-yongsan", name: "KT 용산 IDC", campus: "KT IDC망 · 서울", coords: [37.53, 126.96], lifecycle: "operational", operator: "colocation", capacityMW: null, source: "KT cloud 공개자료", confirmed: "2020 개소 · 2026-07 조사", confidence: "MED" },
  { id: "sds-sangam", name: "삼성SDS 상암 데이터센터", campus: "SDS DC망 · 서울", coords: [37.58, 126.89], lifecycle: "operational", operator: "enterprise", capacityMW: null, source: "삼성SDS 공개자료", confirmed: "2026-07 조사", confidence: "MED" },
  { id: "equinix-sl1", name: "Equinix SL1 서울", campus: "Equinix · 서울권", coords: [37.51, 127.02], lifecycle: "operational", operator: "colocation", capacityMW: null, source: "Equinix 공개자료 · 위치 프록시", confirmed: "2026-07 조사", confidence: "LOW" },
  { id: "dr-icn10", name: "Digital Realty ICN10 서울", campus: "Digital Realty · 서울권", coords: [37.57, 126.9], lifecycle: "operational", operator: "colocation", capacityMW: 12, source: "Digital Realty 공개자료 · 위치 프록시", confirmed: "2026-07 조사", confidence: "LOW" },
  { id: "stack-icn01", name: "STACK 인천 캠퍼스", campus: "STACK · 인천", coords: [37.41, 126.68], lifecycle: "construction", operator: "colocation", capacityMW: null, source: "STACK Infrastructure 공개자료 · 위치 프록시", confirmed: "2026-07 조사", confidence: "LOW" },
  { id: "ms-busan", name: "Microsoft Korea South 리전", campus: "Azure · 부산권", coords: [35.1, 128.85], lifecycle: "operational", operator: "hyperscaler", capacityMW: null, source: "Azure 리전 공개정보 · AZ 위치 비공개", confirmed: "2026-07 조사", confidence: "LOW" },
  { id: "aws-seoul", name: "AWS 서울 리전", campus: "AWS · 수도권", coords: [37.49, 127.03], lifecycle: "operational", operator: "hyperscaler", capacityMW: null, source: "AWS 리전 공개정보 · AZ 위치 비공개", confirmed: "2026-07 조사", confidence: "LOW" },
  { id: "solaseado", name: "해남 솔라시도 데이터센터 파크", campus: "계획 캠퍼스 · 전남", coords: [34.6, 126.3], lifecycle: "planned", operator: "unknown", capacityMW: null, source: "전남도·언론 공개계획", confirmed: "2026-07 조사", confidence: "LOW" },
  { id: "saemangeum", name: "새만금 데이터센터 클러스터", campus: "계획 클러스터 · 전북", coords: [35.8, 126.6], lifecycle: "planned", operator: "unknown", capacityMW: null, source: "새만금개발청 공개계획", confirmed: "2026-07 조사", confidence: "LOW" },
];

// 후보지별 환경·수자원·탄소 프록시. 탄소집약도(kgCO2/kWh)와 요금은 공개 통계 기반 탐색용 값이다.
const envProfiles = {
  dangjin: { waterSource: "아산호·삽교호 광역용수", waterStress: "LOW", carbonIntensity: 0.52, renewableShare: 12, envNote: "석탄화력 비중이 높은 계통권으로 탄소집약도 프록시가 높습니다." },
  naju: { waterSource: "영산강 계열 공업용수", waterStress: "MED", carbonIntensity: 0.38, renewableShare: 21, envNote: "호남권 재생에너지 비중이 높아 탄소집약도 프록시가 낮습니다." },
  sejong: { waterSource: "대청댐 금강 광역용수", waterStress: "LOW", carbonIntensity: 0.42, renewableShare: 9, envNote: "충청권 광역상수도 여유는 실제 배분계획 확인이 필요합니다." },
  icheon: { waterSource: "팔당댐 남한강 계열", waterStress: "MED", carbonIntensity: 0.44, renewableShare: 7, envNote: "수도권 취수 경합과 규제로 신규 대량 용수 확보 난이도가 높습니다." },
  ulsan: { waterSource: "회야댐·대암댐 공업용수", waterStress: "MED", carbonIntensity: 0.46, renewableShare: 11, envNote: "산단 공업용수 재배분 협의가 전제되는 프록시입니다." },
};

const waterAssets = [
  [36.9, 126.85, "아산호·삽교호 담수 · 당진권 취수 프록시"],
  [36.48, 127.48, "대청댐 광역용수 · 세종·대전권 취수 프록시"],
  [37.52, 127.28, "팔당댐 광역용수 · 수도권 취수 프록시"],
  [35.05, 126.86, "영산강 계열 · 나주권 취수 프록시"],
  [35.47, 129.2, "회야댐·대암댐 · 울산권 공업용수 프록시"],
];

// 냉각 방식별 WUE(L/kWh) 프록시: 공랭 0.10 / 하이브리드 0.90 / 수랭(냉각탑) 1.80
const coolingProfiles = {
  air: { label: "공랭", wue: 0.1 },
  hybrid: { label: "하이브리드", wue: 0.9 },
  water: { label: "수랭", wue: 1.8 },
};
const POWER_COST_KRW_PER_KWH = 160; // 산업용 평균 요금 프록시

// CAPEX 프록시(억원): 공개 벤치마크 기반 IT MW당 구축비 + 계통 인입비. 탐색용 개산이며 실제 견적을 대체하지 않는다.
const CAPEX_PER_IT_MW = 120; // 억원/MW · 하이퍼스케일급 구축비 프록시
const CAPEX_GRID_PER_KM = 25; // 억원/km · 345 kV급 인입 선로 프록시
const CAPEX_SUBSTATION_PER_MW = 2; // 억원/MW · 수전 변전설비 프록시
const redundancyCapexFactor = [.92, 1, 1.12]; // N / N+1 / N+2
const coolingCapexFactor = { air: 1, hybrid: 1.04, water: 1.09 };
// 냉각수 가용량 프록시(m³/년): 취수원 스트레스 기준 탐색용 값
const WATER_AVAIL_M3 = { LOW: 3000000, MED: 1200000 };

const factorLabels = [
  ["계통 접근성", "grid"], ["수전 여유", "reserve"], ["초고속 백본", "telecom"],
  ["배후 도시", "urban"], ["도로·교통", "transport"], ["클라우드·기존 IDC", "cloud"],
  ["대학·R&D 인재", "university"], ["수자원", "water"], ["재해·위성 회복력", "resilience"], ["토지·인허가", "land"],
];

let selected = candidates[0];
let map;
let gridData = null; // OSM/Overpass 정적 스냅샷 (data/kr_power_*.json)
let mapLayers = { power: [], plants: [], suitability: [], context: [], urban: [], transport: [], telecom: [], cloud: [], university: [], railAir: [], satellite: [], water: [] };
let facilityMarkers = []; // { marker, facility } — lifecycle/operator 필터와 동기화
let registryFilter = { lifecycle: "all", operator: "all" };
let coolingMode = "hybrid";
let siteMapMarkers = {};
let simulationTimer;
let apiSyncTimer;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function classifyOverpassElement(element) {
  const tags = element.tags || {};
  if (tags.power === "substation") return "substations";
  if (tags.power === "plant") return "plants";
  if (tags.railway === "station" || tags.public_transport === "station") return "rail";
  if (tags.aeroway === "aerodrome") return "airports";
  if (tags.amenity === "university" || tags.education === "university") return "universities";
  if (tags.man_made === "data_center" || tags.building === "data_center") return "dataCenters";
  return null;
}

async function syncOpenData() {
  const button = $("#sync-open-data");
  const status = $("#api-status");
  if (!button || !status) return;
  button.disabled = true;
  button.innerHTML = '<span class="spin">↻</span> SYNCING';
  status.textContent = `${selected.name} 반경 50 km · OpenStreetMap 공개 태그 조회 중...`;
  const [lat, lon] = selected.coords;
  const query = `[out:json][timeout:20];(nwr(around:50000,${lat},${lon})["power"="substation"];nwr(around:50000,${lat},${lon})["power"="plant"];nwr(around:50000,${lat},${lon})["railway"="station"];nwr(around:50000,${lat},${lon})["aeroway"="aerodrome"];nwr(around:50000,${lat},${lon})["amenity"="university"];nwr(around:50000,${lat},${lon})["man_made"="data_center"];nwr(around:50000,${lat},${lon})["building"="data_center"];);out center tags;`;
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];
  try {
    let payload;
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`Overpass ${response.status}`);
        payload = await response.json();
        break;
      } catch (error) {
        console.warn(`Open data endpoint unavailable: ${endpoint}`, error);
      }
    }
    if (!payload) throw new Error("No Overpass endpoint available");
    const counts = { substations: 0, plants: 0, rail: 0, airports: 0, universities: 0, dataCenters: 0 };
    (payload.elements || []).forEach((element) => {
      const category = classifyOverpassElement(element);
      if (category) counts[category] += 1;
    });
    const countText = `변전소 ${counts.substations} · 발전소 ${counts.plants} · 철도역 ${counts.rail} · 공항 ${counts.airports} · 대학 ${counts.universities} · IDC ${counts.dataCenters}`;
    status.textContent = `LIVE · ${selected.name} 반경 50 km · ${countText}`;
    showToast(`${selected.name} 주변 공개 인프라 ${Object.values(counts).reduce((sum, count) => sum + count, 0).toLocaleString()}개를 동기화했습니다`);
  } catch (error) {
    console.warn("OpenStreetMap Overpass sync failed; keeping snapshot data.", error);
    status.textContent = "API 연결 실패 · 기존 공개 데이터 스냅샷으로 계속합니다";
    showToast("공개 API가 응답하지 않아 기존 스냅샷을 유지합니다");
  } finally {
    window.clearTimeout(apiSyncTimer);
    apiSyncTimer = window.setTimeout(() => {
      button.disabled = false;
      button.innerHTML = '<span>↻</span> SYNC OPEN DATA';
    }, 450);
  }
}

function renderFactors(site) {
  $("#factor-list").innerHTML = factorLabels.map(([label, key]) => `
    <div class="factor-row">
      <div>
        <div class="factor-name"><span>${label}</span><span class="factor-score">${site.factors[key]}</span></div>
        <div class="factor-track"><i style="width:${site.factors[key]}%"></i></div>
      </div>
      <span class="factor-number">${site.factors[key]}</span>
    </div>
  `).join("");
}

function renderSelected(site) {
  selected = site;
  $("#selected-name").textContent = `${site.name} · ${site.region}`;
  $("#selected-score").textContent = site.score;
  $("#score-ring").style.setProperty("--score", site.score);
  $("#selected-status").textContent = site.status;
  $("#selected-summary").textContent = site.summary;
  $("#selected-distance").textContent = site.distance;
  $("#selected-grid").textContent = site.grid;
  $("#selected-water").textContent = site.water;
  $("#selected-latency").textContent = site.latency;
  $("#selected-city-context").textContent = site.factors.cityContext;
  $("#selected-network-context").textContent = site.factors.networkContext;
  $("#selected-talent-context").textContent = site.factors.talentContext;
  $("#context-site-name").textContent = site.name;
  $("#method-score").textContent = site.score;
  const env = envFor(site);
  if (env && $("#selected-water-source")) {
    $("#selected-water-source").textContent = env.waterSource;
    $("#env-note").textContent = `${env.envNote} (재생에너지 비중 프록시 ${env.renewableShare}%)`;
  }
  ["grid", "reserve", "telecom", "urban", "transport", "cloud", "university", "resilience"].forEach((key) => {
    const bar = $(`#method-${key}`);
    if (bar) bar.style.width = `${site.factors[key]}%`;
  });
  $$('[data-context-score]').forEach((score) => {
    const key = score.dataset.contextScore;
    score.textContent = site.factors[key];
    score.parentElement.style.setProperty("--tile-score", `${site.factors[key]}%`);
  });
  renderFactors(site);
  if ($("#power-priority")) applyModelWeights(false);
  $$(".candidate-item").forEach((item) => item.classList.toggle("selected", item.dataset.id === site.id));
  calculateScenario(false);
}

function renderCandidates() {
  $("#candidate-list").innerHTML = candidates.map((site, index) => `
    <button class="candidate-item ${index === 0 ? "selected" : ""}" data-id="${site.id}" type="button">
      <span class="candidate-rank">0${index + 1}</span><span class="candidate-score">${site.score}</span>
      <h3>${site.name}</h3><p>${site.region} · ${site.reason}</p>
      <div class="candidate-bar"><i style="width:${site.score}%"></i></div>
      <div class="candidate-meta"><span>HV <b>${site.distance}</b></span><span>${site.grid}</span></div>
    </button>
  `).join("");
  $$(".candidate-item").forEach((item) => item.addEventListener("click", () => {
    const next = candidates.find((site) => site.id === item.dataset.id);
    renderSelected(next);
    flyToSite(next);
    showToast(`${next.name} 후보를 선택했습니다`);
  }));
}

function colorForVoltage(voltage) {
  if (voltage >= 765) return "#aa91ff";
  if (voltage >= 345) return "#f36d91";
  return "#52d1dc";
}

const plantSourceStyles = [
  [/nuclear/, { color: "#aa91ff", label: "원자력" }],
  [/coal/, { color: "#9aa5ad", label: "석탄" }],
  [/gas|oil|diesel/, { color: "#f2c06e", label: "가스·유류" }],
  [/hydro|tidal|pumped/, { color: "#52a8dc", label: "수력·조력" }],
  [/solar|photovoltaic/, { color: "#f5d76e", label: "태양광" }],
  [/wind/, { color: "#7ad6a2", label: "풍력" }],
  [/battery|storage/, { color: "#f36d91", label: "ESS" }],
];

function styleForPlantSource(source) {
  const normalized = (source || "").toLowerCase();
  for (const [pattern, style] of plantSourceStyles) {
    if (pattern.test(normalized)) return style;
  }
  return { color: "#7ad6a2", label: source || "미분류" };
}

async function loadGridData() {
  try {
    const [linesRes, plantsRes] = await Promise.all([
      fetch("data/kr_power_lines.json"),
      fetch("data/kr_power_plants.json"),
    ]);
    if (!linesRes.ok || !plantsRes.ok) throw new Error("grid snapshot missing");
    const [lines, plants] = await Promise.all([linesRes.json(), plantsRes.json()]);
    gridData = { lines, plants };
    // 교통 스냅샷은 선택적: 없어도 전력망 기능은 유지하고 프록시 선형으로 degrade
    try {
      const transportRes = await fetch("data/kr_transport.json");
      if (transportRes.ok) gridData.transport = await transportRes.json();
    } catch (error) {
      console.warn("Transport snapshot unavailable; keeping schematic corridors.", error);
    }
    return true;
  } catch (error) {
    console.warn("Static grid snapshot unavailable; falling back to schematic lines.", error);
    return false;
  }
}

// 근사 거리(km): 후보지 주변 계산용 equirectangular 근사 — 국내 스케일에서 충분
function approxKm(a, b) {
  const dLat = (a[0] - b[0]) * 111.32;
  const dLng = (a[1] - b[1]) * 111.32 * Math.cos((a[0] * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function computeSiteReality(coords) {
  if (!gridData) return null;
  let nearestHv = Infinity;
  let nearest765 = Infinity;
  let hvLines50 = 0;
  gridData.lines.lines.forEach((line) => {
    if (line.v < 345) return;
    let lineMin = Infinity;
    line.c.forEach((point) => {
      const distance = approxKm(coords, point);
      if (distance < lineMin) lineMin = distance;
    });
    if (lineMin < nearestHv) nearestHv = lineMin;
    if (line.v >= 765 && lineMin < nearest765) nearest765 = lineMin;
    if (lineMin <= 50) hvLines50 += 1;
  });
  let mw50 = 0;
  let plants50 = 0;
  gridData.plants.plants.forEach(([lat, lng, mw]) => {
    if (approxKm(coords, [lat, lng]) <= 50) {
      plants50 += 1;
      if (mw) mw50 += mw;
    }
  });
  return { nearestHv, nearest765, hvLines50, mw50: Math.round(mw50), plants50 };
}

function computeGridReality() {
  if (!gridData) return;
  candidates.forEach((site) => {
    site.gridReality = computeSiteReality(site.coords);
    site.distance = `${site.gridReality.nearestHv.toFixed(1)} km`;
  });
}

// ---- 사용자 지정 지점 분석: 지도 임의 위치를 정적 레이어·OSM 스냅샷 기반 프록시로 평가 ----
const scoreFromDistance = (distanceKm, decayPerKm) => Math.round(Math.max(20, Math.min(95, 95 - distanceKm * decayPerKm)));
const clampScore = (value, min = 5, max = 95) => Math.round(Math.max(min, Math.min(max, value)));

function nearestPoint(coords, points) {
  return points.reduce((best, point) => {
    const distance = approxKm(coords, [point[0], point[1]]);
    return distance < best.distance ? { distance, label: point[2] } : best;
  }, { distance: Infinity, label: null });
}

function nearestLineKm(coords, lines) {
  let best = Infinity;
  lines.forEach((line) => line.coords.forEach((point) => {
    const distance = approxKm(coords, point);
    if (distance < best) best = distance;
  }));
  return best;
}

function nearestFlatLineKm(coords, latlngGroups) {
  let best = Infinity;
  latlngGroups.forEach((group) => group.forEach((point) => {
    const distance = approxKm(coords, point);
    if (distance < best) best = distance;
  }));
  return best;
}

function buildCustomSite(lat, lng) {
  const coords = [lat, lng];
  const reality = computeSiteReality(coords);
  const city = nearestPoint(coords, contextData.urban);
  const cloudNear = nearestPoint(coords, contextData.cloud);
  const airport = nearestPoint(coords, contextData.railAir.airports);
  const satellite = nearestPoint(coords, contextData.satellite);
  const waterAsset = nearestPoint(coords, waterAssets);
  const telecomKm = nearestLineKm(coords, contextData.telecom);
  const hasTransport = gridData && gridData.transport;
  const transportKm = hasTransport
    ? nearestFlatLineKm(coords, gridData.transport.road)
    : nearestLineKm(coords, contextData.transport);
  const railKm = hasTransport
    ? nearestFlatLineKm(coords, gridData.transport.rail.map((r) => r.c))
    : nearestLineKm(coords, contextData.railAir.rail);
  const universityCount = contextData.university.filter((u) => approxKm(coords, [u[0], u[1]]) <= 60).length;
  const factors = {
    grid: reality ? scoreFromDistance(reality.nearestHv, 2.2) : 55,
    reserve: reality ? clampScore(30 + reality.mw50 / 400, 25, 92) : 55,
    telecom: scoreFromDistance(telecomKm, 1.4),
    urban: scoreFromDistance(city.distance, 1.1),
    transport: scoreFromDistance(Math.min(transportKm, railKm), 1.6),
    cloud: scoreFromDistance(cloudNear.distance, .9),
    university: clampScore(40 + universityCount * 12, 30, 92),
    railAir: scoreFromDistance(Math.min(railKm, airport.distance), 1.2),
    satellite: scoreFromDistance(satellite.distance, .5),
    water: scoreFromDistance(waterAsset.distance, 1.2),
    resilience: 60, // 재해·회복력은 임의 지점에서 미산정 → 중립 프록시
    land: 60, // 토지·인허가도 미산정 → 중립 프록시
    cityContext: city.label ? `${city.label} · ${city.distance.toFixed(0)} km` : "배후 도시 정보 없음",
    networkContext: `백본 프록시 ${telecomKm.toFixed(0)} km · IDC권 ${cloudNear.distance.toFixed(0)} km`,
    talentContext: `반경 60 km 내 ${universityCount}개 (표본)`,
  };
  const gridClass = !reality ? "미확인"
    : reality.nearest765 <= 20 ? "345 / 765 kV"
      : reality.nearestHv <= 30 ? "345 kV" : "154 kV권";
  const seoulKm = approxKm(coords, [37.5665, 126.978]);
  const site = {
    id: "custom",
    name: city.distance <= 25 ? `${(city.label || "").replace(" 배후 도시권", "")} 인근` : "사용자 지정 지점",
    region: `${lat.toFixed(3)}, ${lng.toFixed(3)}`,
    coords,
    distance: reality ? `${reality.nearestHv.toFixed(1)} km` : "미확인",
    grid: gridClass,
    water: factors.water >= 75 ? "LOW" : "MED",
    latency: `${Math.round(5 + seoulKm * .045)} ms`,
    reason: "map-selected point",
    factors,
    headroom: reality ? clampScore(20 + reality.mw50 / 600 - reality.nearestHv, 5, 90) : 40,
    gridReality: reality,
    env: {
      waterSource: waterAsset.label ? `${waterAsset.label.split(" · ")[0]} (${waterAsset.distance.toFixed(0)} km)` : "취수원 프록시 없음",
      waterStress: factors.water >= 75 ? "LOW" : "MED",
      carbonIntensity: .44,
      renewableShare: 10,
      envNote: "사용자 지정 지점 · 탄소집약도는 전국 평균 프록시, 재해·토지 요인은 미산정 중립값입니다.",
    },
  };
  site.score = getModelScore(site);
  site.status = site.score >= 82 ? "EXCELLENT FIT" : site.score >= 70 ? "STRONG FIT" : "WATCH LIST";
  site.summary = reality
    ? `지도에서 선택한 지점입니다. 반경 50 km 매핑 발전 ${reality.mw50.toLocaleString()} MW, 345 kV+ 회선까지 ${reality.nearestHv.toFixed(1)} km — OSM 실측과 거리 프록시로 계산한 탐색용 점수입니다.`
    : "지도에서 선택한 지점입니다. 정적 레이어 거리 프록시로 계산한 탐색용 점수입니다.";
  return site;
}

let customMarker = null;
let lastCustomSite = null;

function selectCustomLocation(lat, lng) {
  const site = buildCustomSite(lat, lng);
  lastCustomSite = site;
  if (map) {
    if (!customMarker) {
      customMarker = L.circleMarker(site.coords, { radius: 8, color: "#f2a35b", weight: 2.4, fillColor: "#0e1820", fillOpacity: .95, dashArray: "3 3" })
        .bindTooltip("", { direction: "top", className: "dark-tooltip" })
        .on("click", () => { if (lastCustomSite) renderSelected(lastCustomSite); })
        .addTo(map);
    }
    customMarker.setLatLng(site.coords);
    customMarker.setTooltipContent(`${site.name} · ${site.score}/100 · 탐색용 프록시`);
  }
  renderSelected(site);
  showToast(`${site.name} 분석 · 반경 50 km OSM 실측 + 거리 프록시`);
}

const envFor = (site) => site.env || envProfiles[site.id];

function createLeafletMap() {
  if (!window.L) return false;
  try {
    map = L.map("map", { zoomControl: false, attributionControl: true, preferCanvas: true }).setView([36.25, 127.187], 7.1);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      minZoom: 5,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    document.body.classList.add("has-leaflet");
    drawPowerLayer();
    drawGenerationLayer();
    drawSuitabilityLayer();
    drawContextLayer();
    drawFacilityLayer();
    map.on("click", (event) => {
      const closest = candidates.reduce((best, site) => {
        const distance = map.distance(event.latlng, site.coords);
        return distance < best.distance ? { site, distance } : best;
      }, { site: null, distance: Infinity });
      if (closest.distance < 25000) {
        renderSelected(closest.site);
        showToast(`${closest.site.name} 후보를 선택했습니다`);
        return;
      }
      // 후보지에서 떨어진 도시·임의 지점은 사용자 지정 지점으로 즉석 분석한다.
      selectCustomLocation(event.latlng.lat, event.latlng.lng);
    });
    return true;
  } catch (error) {
    console.warn("Map layer unavailable; using the embedded preview.", error);
    return false;
  }
}

function drawPowerLayer() {
  if (!map) return;
  if (gridData) {
    // OSM 스냅샷 전체 송전선: 전압급별로 하나의 MultiPolyline로 묶어 캔버스 렌더링 부하를 줄인다.
    const groups = { 765: [], 345: [], 154: [], 66: [] };
    gridData.lines.lines.forEach((line) => { (groups[line.v] || groups[66]).push(line.c); });
    [[765, 2.6, .92], [345, 1.6, .8], [154, .9, .55], [66, .6, .3]].forEach(([voltage, weight, opacity]) => {
      if (!groups[voltage].length) return;
      const path = L.polyline(groups[voltage], { color: colorForVoltage(voltage), weight, opacity, interactive: false }).addTo(map);
      mapLayers.power.push(path);
    });
  } else {
    fallbackLines.forEach((line) => {
      const glow = L.polyline(line.coords, { color: colorForVoltage(line.voltage), weight: line.voltage >= 765 ? 9 : 6, opacity: .11, interactive: false }).addTo(map);
      const path = L.polyline(line.coords, { color: colorForVoltage(line.voltage), weight: line.voltage >= 765 ? 2.8 : 2, opacity: line.voltage >= 765 ? .9 : .68, dashArray: line.voltage === 154 ? "2 5" : undefined }).addTo(map);
      mapLayers.power.push(glow, path);
    });
  }
  const substations = [
    [36.97, 126.55, "당진 계통 허브"], [36.52, 127.28, "세종 계통 허브"], [35.02, 126.72, "나주 계통 허브"],
    [37.28, 127.43, "이천 계통 허브"], [35.54, 129.31, "울산 계통 허브"], [37.06, 126.42, "서해 EHV"],
  ];
  substations.forEach(([lat, lng, label]) => {
    const marker = L.circleMarker([lat, lng], { radius: 4, color: "#d8f1f1", weight: 1.5, fillColor: "#20373d", fillOpacity: 1 })
      .bindTooltip(label, { direction: "top", className: "dark-tooltip" })
      .on("click", () => selectCustomLocation(lat, lng))
      .addTo(map);
    mapLayers.power.push(marker);
  });
}

function drawGenerationLayer() {
  if (!map) return;
  if (gridData) {
    gridData.plants.plants.forEach(([lat, lng, mw, name, source]) => {
      const style = styleForPlantSource(source);
      const radius = mw ? Math.max(2, Math.min(11, Math.sqrt(mw) / 4)) : 1.6;
      const marker = L.circleMarker([lat, lng], { radius, color: style.color, weight: .8, opacity: .5, fillColor: style.color, fillOpacity: .3 })
        .bindTooltip(`${name || "발전소"} · ${mw ? `${mw.toLocaleString()} MW` : "용량 미표기"} · ${style.label}`, { direction: "top", className: "dark-tooltip" })
        .on("click", () => selectCustomLocation(lat, lng)) // 마커가 지도 클릭을 흡수하므로 동일 위치 분석으로 연결
        .addTo(map);
      mapLayers.plants.push(marker);
    });
    return;
  }
  const plants = [
    [37.06, 126.51, 6040, "당진화력"], [36.74, 126.14, 6446, "태안화력"], [35.34, 126.42, 5913, "한빛원자력"],
    [35.32, 129.29, 7489, "고리원자력"], [37.08, 129.4, 5881, "한울원자력"], [35.11, 129.03, 256, "부산 신재생"],
  ];
  plants.forEach(([lat, lng, capacity, label]) => {
    const radius = Math.max(4, Math.min(11, capacity / 800));
    const marker = L.circleMarker([lat, lng], { radius, color: "#7ad6a2", weight: 1, fillColor: "#7ad6a2", fillOpacity: .22 }).bindTooltip(`${label} · ${capacity.toLocaleString()} MW`, { direction: "top", className: "dark-tooltip" }).addTo(map);
    mapLayers.plants.push(marker);
  });
}

function drawSuitabilityLayer() {
  if (!map) return;
  candidates.forEach((site, index) => {
    const mapScore = site.adjustedScore || site.score;
    const circle = L.circle(site.coords, { radius: 31000 - index * 1800, color: index === 0 ? "#f2a35b" : "#52d1dc", weight: 1, opacity: .2, fillColor: index === 0 ? "#f2a35b" : "#52d1dc", fillOpacity: .055, interactive: false }).addTo(map);
    const marker = L.circleMarker(site.coords, { radius: index === 0 ? 8 : 6, color: "#0e1820", weight: 2, fillColor: index === 0 ? "#f2a35b" : "#d5f2ef", fillOpacity: 1 }).bindTooltip(`${site.name} · ${mapScore}/100`, { direction: "top", className: "dark-tooltip" }).on("click", () => {
      renderSelected(site);
      showToast(`${site.name} 후보를 선택했습니다`);
    }).addTo(map);
    siteMapMarkers[site.id] = marker;
    mapLayers.suitability.push(circle, marker);
  });
}

function addContextPoint(layerName, coords, label, style = {}) {
  const marker = L.circleMarker(coords, {
    radius: style.radius || 5,
    color: style.color || "#c7e6e4",
    weight: style.weight || 1.5,
    fillColor: style.fillColor || style.color || "#52d1dc",
    fillOpacity: style.fillOpacity ?? .8,
  }).bindTooltip(label, { direction: "top", className: "dark-tooltip" }).addTo(map);
  mapLayers[layerName].push(marker);
  mapLayers.context.push(marker);
}

function addContextLine(layerName, line, style = {}) {
  const path = L.polyline(line.coords, {
    color: style.color || "#52d1dc",
    weight: style.weight || 2,
    opacity: style.opacity || .68,
    dashArray: style.dashArray,
    lineCap: "round",
  }).bindTooltip(line.label, { sticky: true, className: "dark-tooltip" }).addTo(map);
  mapLayers[layerName].push(path);
  mapLayers.context.push(path);
}

function addContextMultiline(layerName, latlngGroups, style) {
  const path = L.polyline(latlngGroups, { ...style, interactive: false }).addTo(map);
  mapLayers[layerName].push(path);
  mapLayers.context.push(path);
}

function drawContextLayer() {
  if (!map) return;
  contextData.urban.forEach(([lat, lng, label, radius]) => addContextPoint("urban", [lat, lng], label, { radius, color: "#f2a35b", fillColor: "#f2a35b", fillOpacity: .16 }));
  if (gridData && gridData.transport) {
    // OSM 실측 고속도로·철도: 그룹 MultiPolyline로 묶어 렌더링 부하를 줄인다.
    const transport = gridData.transport;
    addContextMultiline("transport", transport.road, { color: "#f2c06e", weight: 1.3, opacity: .5 });
    const conventional = transport.rail.filter((r) => !r.h).map((r) => r.c);
    const highspeed = transport.rail.filter((r) => r.h).map((r) => r.c);
    if (conventional.length) addContextMultiline("railAir", conventional, { color: "#b9c6cd", weight: .8, opacity: .42 });
    if (highspeed.length) addContextMultiline("railAir", highspeed, { color: "#eef3f5", weight: 1.7, opacity: .85 });
  } else {
    contextData.transport.forEach((line) => addContextLine("transport", line, { color: "#f2c06e", weight: 2.2, dashArray: "9 8", opacity: .58 }));
    contextData.railAir.rail.forEach((line) => addContextLine("railAir", line, { color: "#e8edf0", weight: 1.6, dashArray: "3 6", opacity: .72 }));
  }
  contextData.railAir.airports.forEach(([lat, lng, label]) => addContextPoint("railAir", [lat, lng], label, { radius: 5, color: "#f0f2df", fillColor: "#f0f2df" }));
  contextData.telecom.forEach((line) => addContextLine("telecom", line, { color: "#52d1dc", weight: 2.3, dashArray: "2 7", opacity: .8 }));
  contextData.cloud.forEach(([lat, lng, label]) => addContextPoint("cloud", [lat, lng], label, { radius: 6, color: "#aa91ff", fillColor: "#aa91ff", fillOpacity: .28 }));
  contextData.university.forEach(([lat, lng, label]) => addContextPoint("university", [lat, lng], label, { radius: 4, color: "#7ad6a2", fillColor: "#7ad6a2", fillOpacity: .72 }));
  contextData.satellite.forEach(([lat, lng, label]) => {
    const ring = L.circle([lat, lng], { radius: 24000, color: "#e8c9ff", weight: 1, opacity: .3, fillOpacity: .03, interactive: false }).addTo(map);
    mapLayers.satellite.push(ring);
    mapLayers.context.push(ring);
    addContextPoint("satellite", [lat, lng], label, { radius: 5, color: "#e8c9ff", fillColor: "#e8c9ff", fillOpacity: .7 });
  });
  waterAssets.forEach(([lat, lng, label]) => {
    const ring = L.circle([lat, lng], { radius: 18000, color: "#52d1dc", weight: 1, opacity: .35, fillColor: "#52d1dc", fillOpacity: .05, interactive: false }).addTo(map);
    mapLayers.water.push(ring);
    mapLayers.context.push(ring);
    addContextPoint("water", [lat, lng], label, { radius: 5, color: "#8fe3ea", fillColor: "#8fe3ea", fillOpacity: .75 });
  });
  // Context is opt-in from the toolbar or the individual tiles.
  mapLayers.context.forEach((layer) => map.removeLayer(layer));
}

function facilityMatchesFilter(facility) {
  return (registryFilter.lifecycle === "all" || facility.lifecycle === registryFilter.lifecycle)
    && (registryFilter.operator === "all" || facility.operator === registryFilter.operator);
}

function drawFacilityLayer() {
  if (!map) return;
  facilityRegistry.forEach((facility) => {
    const meta = lifecycleMeta[facility.lifecycle] || lifecycleMeta.unknown;
    const capacity = facility.capacityMW ? `${facility.capacityMW} MW` : "용량 비공개";
    const marker = L.circleMarker(facility.coords, {
      radius: facility.lifecycle === "planned" ? 7 : 6,
      color: "#0e1820",
      weight: 1.5,
      fillColor: meta.color,
      fillOpacity: facility.lifecycle === "operational" ? .92 : .6,
      dashArray: facility.lifecycle === "operational" ? undefined : "2 3",
    }).bindTooltip(
      `${facility.name} · ${meta.label} · ${operatorMeta[facility.operator].label}<br>${capacity} · CONF ${facility.confidence} · ${facility.source}`,
      { direction: "top", className: "dark-tooltip" },
    ).on("click", () => selectCustomLocation(facility.coords[0], facility.coords[1]));
    facilityMarkers.push({ marker, facility });
  });
  // Facilities are opt-in from the FACILITIES toolbar button.
}

function refreshFacilityMarkers() {
  if (!map) return;
  const control = $('[data-layer="facilities"]');
  const active = control ? control.classList.contains("active") : false;
  facilityMarkers.forEach(({ marker, facility }) => {
    if (active && facilityMatchesFilter(facility)) marker.addTo(map);
    else map.removeLayer(marker);
  });
}

function renderRegistry() {
  const list = $("#registry-list");
  if (!list) return;
  const filtered = facilityRegistry.filter(facilityMatchesFilter);
  list.innerHTML = filtered.map((facility) => {
    const lifecycle = lifecycleMeta[facility.lifecycle] || lifecycleMeta.unknown;
    const operator = operatorMeta[facility.operator] || operatorMeta.unknown;
    return `
      <div class="registry-row">
        <span class="registry-dot" style="background:${lifecycle.color}"></span>
        <span class="registry-name"><b>${facility.name}</b><small>${facility.campus}</small></span>
        <span class="registry-badges">
          <i class="registry-badge" style="color:${lifecycle.color}">${lifecycle.label}</i>
          <i class="registry-badge" style="color:${operator.color}">${operator.label}</i>
        </span>
        <span class="registry-mw">${facility.capacityMW ? `${facility.capacityMW} MW` : "비공개"}</span>
        <span class="registry-src">${facility.source}<br>${facility.confirmed} · CONF ${facility.confidence}</span>
      </div>
    `;
  }).join("") || '<div class="registry-empty">조건에 맞는 시설이 없습니다.</div>';
  const counts = { operational: 0, construction: 0, planned: 0 };
  facilityRegistry.forEach((facility) => { if (counts[facility.lifecycle] !== undefined) counts[facility.lifecycle] += 1; });
  $("#registry-summary").textContent = `표시 ${filtered.length} / 전체 ${facilityRegistry.length} · 운영 ${counts.operational} · 건설 ${counts.construction} · 계획 ${counts.planned} · 좌표는 공개 자료 기반 프록시`;
  refreshFacilityMarkers();
}

function setLayerVisibility(layerName, shouldShow) {
  if (!map || !mapLayers[layerName]) return;
  mapLayers[layerName].forEach((layer) => {
    if (shouldShow) layer.addTo(map);
    else map.removeLayer(layer);
  });
}

function setContextTiles(active) {
  $$('[data-context]').forEach((tile) => tile.classList.toggle("active", active));
}

function toggleLayer(layerName) {
  const control = $(`[data-layer="${layerName}"]`);
  const shouldShow = control ? control.classList.contains("active") : false;
  if (layerName === "facilities") {
    refreshFacilityMarkers();
    return;
  }
  if (layerName === "context") {
    setLayerVisibility("context", shouldShow);
    setContextTiles(shouldShow);
    return;
  }
  setLayerVisibility(layerName, shouldShow);
}

function flyToSite(site) {
  if (map) map.flyTo(site.coords, 8.4, { duration: .65 });
}

function updateRangeFill(input) {
  const min = Number(input.min);
  const max = Number(input.max);
  const progress = ((Number(input.value) - min) / (max - min)) * 100;
  input.style.setProperty("--range-progress", `${progress}%`);
}

function getModelScore(site) {
  const powerWeight = Number($("#power-priority").value);
  const ecosystemWeight = Number($("#ecosystem-priority").value);
  const resilienceWeight = Number($("#resilience-priority").value);
  const total = powerWeight + ecosystemWeight + resilienceWeight;
  const power = (site.factors.grid + site.factors.reserve) / 2;
  const ecosystem = (site.factors.urban + site.factors.transport + site.factors.telecom + site.factors.cloud + site.factors.university) / 5;
  const resilience = (site.factors.water + site.factors.resilience + site.factors.land) / 3;
  return Math.round((power * powerWeight + ecosystem * ecosystemWeight + resilience * resilienceWeight) / total);
}

function applyModelWeights(showMessage = false) {
  const values = [
    ["power-priority", "power-priority-value"],
    ["ecosystem-priority", "ecosystem-priority-value"],
    ["resilience-priority", "resilience-priority-value"],
  ];
  values.forEach(([inputId, valueId]) => {
    const input = $(`#${inputId}`);
    $(`#${valueId}`).textContent = `${input.value}%`;
    updateRangeFill(input);
  });
  const adjustedScore = getModelScore(selected);
  candidates.forEach((site) => {
    const score = getModelScore(site);
    site.adjustedScore = score;
    const card = $(`.candidate-item[data-id="${site.id}"]`);
    if (card) {
      card.querySelector(".candidate-score").textContent = score;
      card.querySelector(".candidate-bar i").style.width = `${score}%`;
    }
    if (siteMapMarkers[site.id]) siteMapMarkers[site.id].setTooltipContent(`${site.name} · ${score}/100`);
  });
  $("#selected-score").textContent = adjustedScore;
  $("#score-ring").style.setProperty("--score", adjustedScore);
  $("#method-score").textContent = adjustedScore;
  if (showMessage) showToast(`${selected.name} · 가중치 변경을 반영해 적합도를 ${adjustedScore}점으로 재계산했습니다`);
}

function calculateScenario(showMessage = false) {
  const load = Number($("#load-range").value);
  const pue = Number($("#pue-range").value) / 100;
  const redundancy = Number($("#redundancy-range").value);
  const utilization = Number($("#util-range").value) / 100;
  const redundancyFactor = [1.1, 1.25, 1.42][redundancy];
  const env = envFor(selected);
  const cooling = coolingProfiles[coolingMode];
  const annualEnergy = Math.round(load * utilization * pue * 8760 / 1000); // GWh/yr
  const intake = load * redundancyFactor;
  const headroom = selected.headroom - (intake - 50) * .72;
  // GWh × WUE(L/kWh) × 1,000 = m³/yr · GWh × CI(kg/kWh) × 1,000 = tCO2/yr
  const waterUse = Math.round(annualEnergy * cooling.wue * 1000);
  const carbon = Math.round(annualEnergy * env.carbonIntensity * 1000);
  const powerCost = Math.round(annualEnergy * 1e6 * POWER_COST_KRW_PER_KWH / 1e8); // 억원/yr
  const waterAlert = env.waterStress !== "LOW" && waterUse > 350000;
  $("#load-value").textContent = load;
  $("#pue-value").textContent = pue.toFixed(2);
  $("#redundancy-value").textContent = `N${redundancy ? `+${redundancy}` : ""}`;
  $("#util-value").textContent = Math.round(utilization * 100);
  $("#energy-output").textContent = annualEnergy.toLocaleString();
  $("#intake-output").textContent = intake.toFixed(1);
  $("#headroom-output").textContent = `${headroom >= 0 ? "+" : ""}${Math.round(headroom)}`;
  $("#headroom-output").style.color = headroom >= 0 ? "var(--green)" : "var(--pink)";
  $("#headroom-label").textContent = headroom >= 0 ? "MW at selected site" : "MW · capacity alert";
  $("#water-output").textContent = waterUse.toLocaleString();
  $("#carbon-output").textContent = carbon.toLocaleString();
  $("#cost-output").textContent = powerCost.toLocaleString();
  $("#carbon-intensity-label").textContent = env.carbonIntensity.toFixed(2);
  const waterBadge = $("#impact-water-badge");
  waterBadge.textContent = waterAlert ? "STRESS ALERT" : `${env.waterStress} STRESS`;
  waterBadge.classList.toggle("warn", waterAlert);
  if (selected.gridReality) {
    const reality = selected.gridReality;
    $("#reality-strip").hidden = false;
    $("#reality-mw").textContent = reality.mw50 ? `${reality.mw50.toLocaleString()} MW` : "미표기";
    $("#reality-plants").textContent = `${reality.plants50.toLocaleString()}개`;
    $("#reality-hv").textContent = `${reality.nearestHv.toFixed(1)} km · ${reality.hvLines50}회선`;
    const share = reality.mw50 ? (intake / reality.mw50) * 100 : null;
    $("#reality-share").textContent = share ? `${share.toFixed(1)}%` : "—";
  }
  // ---- CAPEX 프록시와 표준구성(N+1·하이브리드·PUE 1.25·인입 5 km) 대비 증감 ----
  const hvKm = selected.gridReality ? selected.gridReality.nearestHv : (parseFloat(selected.distance) || 10);
  const pueCapexFactor = Math.max(.88, Math.min(1.12, 1 + (1.25 - pue) * .6));
  const gridConnectCost = hvKm * CAPEX_GRID_PER_KM + load * CAPEX_SUBSTATION_PER_MW;
  const capex = Math.round(load * CAPEX_PER_IT_MW * redundancyCapexFactor[redundancy] * coolingCapexFactor[coolingMode] * pueCapexFactor + gridConnectCost);
  const capexBaseline = Math.round(load * CAPEX_PER_IT_MW * 1 * coolingCapexFactor.hybrid * 1 + 5 * CAPEX_GRID_PER_KM + load * CAPEX_SUBSTATION_PER_MW);
  const capexDelta = ((capex - capexBaseline) / capexBaseline) * 100;
  $("#capex-output").textContent = capex.toLocaleString();
  $("#capex-grid").textContent = `계통 인입 ${Math.round(gridConnectCost).toLocaleString()}억`;
  const capexBadge = $("#capex-badge");
  capexBadge.textContent = Math.abs(capexDelta) < .5 ? "표준구성 수준" : `${capexDelta > 0 ? "▲" : "▼"} ${Math.abs(capexDelta).toFixed(1)}% vs 표준`;
  capexBadge.classList.toggle("warn", capexDelta > 10);
  // ---- 현재 조건에서의 최대 가능 IT capacity 추정 (계통 vs 냉각 용수 중 병목) ----
  const gridMaxIt = (selected.headroom / .72 + 50) / redundancyFactor;
  const waterMaxIt = WATER_AVAIL_M3[env.waterStress] / (utilization * pue * 8.76 * cooling.wue * 1000);
  const maxIt = Math.max(5, Math.min(gridMaxIt, waterMaxIt));
  const bindingConstraint = gridMaxIt <= waterMaxIt ? "계통 수전" : "냉각 용수";
  $("#capacity-output").textContent = `~${Math.round(maxIt)}`;
  const capacityBadge = $("#capacity-badge");
  capacityBadge.textContent = `${bindingConstraint} 제약`;
  capacityBadge.classList.toggle("warn", load > maxIt);
  $("#capacity-note").textContent = load > maxIt
    ? `현재 IT LOAD ${load} MW가 추정 한도를 초과합니다`
    : `현재 조건(N${redundancy ? `+${redundancy}` : ""} · ${cooling.label} · 부하율 ${Math.round(utilization * 100)}%) 최대 추정`;
  [$("#load-range"), $("#pue-range"), $("#redundancy-range"), $("#util-range")].forEach(updateRangeFill);
  if (showMessage) {
    window.clearTimeout(simulationTimer);
    const button = $("#run-simulation");
    button.disabled = true;
    button.innerHTML = '<span class="play-icon">◌</span> ANALYZING';
    simulationTimer = window.setTimeout(() => {
      button.disabled = false;
      button.innerHTML = '<span class="play-icon">▶</span> RUN SIMULATION';
      showToast(`${selected.name} · ${annualEnergy.toLocaleString()} GWh 수요 시나리오를 계산했습니다`);
    }, 600);
  }
}

function bindUI() {
  renderCandidates();
  renderRegistry();
  renderSelected(selected);
  [$("#load-range"), $("#pue-range"), $("#redundancy-range"), $("#util-range")].forEach((input) => input.addEventListener("input", () => calculateScenario(false)));
  $$("#cooling-control button").forEach((button) => button.addEventListener("click", () => {
    coolingMode = button.dataset.cooling;
    $$("#cooling-control button").forEach((item) => item.classList.toggle("active", item === button));
    $("#cooling-value").textContent = coolingProfiles[coolingMode].label;
    calculateScenario(false);
  }));
  $$("[data-registry-filter]").forEach((chip) => chip.addEventListener("click", () => {
    registryFilter[chip.dataset.registryFilter] = chip.dataset.value;
    $$(`[data-registry-filter="${chip.dataset.registryFilter}"]`).forEach((item) => item.classList.toggle("active", item === chip));
    renderRegistry();
  }));
  [$("#power-priority"), $("#ecosystem-priority"), $("#resilience-priority")].forEach((input) => input.addEventListener("input", () => applyModelWeights(false)));
  $("#run-simulation").addEventListener("click", () => calculateScenario(true));
  $("#apply-model").addEventListener("click", () => applyModelWeights(true));
  $("#sync-open-data").addEventListener("click", syncOpenData);
  $("#use-site").addEventListener("click", () => {
    $("#scenario-panel").scrollIntoView({ behavior: "smooth", block: "center" });
    showToast(`${selected.name}를 시나리오 대상지로 고정했습니다`);
  });
  $$("[data-scroll-target]").forEach((item) => item.addEventListener("click", () => {
    const target = document.getElementById(item.dataset.scrollTarget);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (item.classList.contains("nav-item")) {
      $$(".nav-item").forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");
    }
  }));
  $$(".map-tool").forEach((tool) => tool.addEventListener("click", () => {
    const layer = tool.dataset.layer;
    const wasActive = tool.classList.contains("active");
    tool.classList.toggle("active", !wasActive);
    if (map) toggleLayer(layer);
    else if (layer === "power") $(".fallback-grid").style.opacity = wasActive ? ".18" : "1";
    else if (layer === "plants") showToast("발전원 레이어는 지도 연결 후 표시됩니다");
    else if (layer === "facilities") showToast("시설 레지스트리 레이어는 지도 연결 후 표시됩니다");
    else if (layer === "context") showToast(wasActive ? "주변 인프라 레이어를 숨겼습니다" : "도시·교통·통신·IDC 레이어를 표시했습니다");
    else showToast(wasActive ? "적합도 레이어를 숨겼습니다" : "적합도 레이어를 표시했습니다");
  }));
  $$('[data-context]').forEach((tile) => tile.addEventListener("click", () => {
    const layer = tile.dataset.context;
    const shouldShow = !tile.classList.contains("active");
    tile.classList.toggle("active", shouldShow);
    if (map) setLayerVisibility(layer === "railAir" ? "railAir" : layer, shouldShow);
    showToast(`${tile.querySelector("b").textContent} 레이어 ${shouldShow ? "표시" : "숨김"}`);
  }));
  $("#zoom-in").addEventListener("click", () => map && map.zoomIn());
  $("#zoom-out").addEventListener("click", () => map && map.zoomOut());
  $("#reset-view").addEventListener("click", () => map ? map.setView([36.25, 127.187], 7.1) : showToast("대한민국 전체 보기"));
  $("#compare-button").addEventListener("click", () => {
    $("#candidates-section").classList.toggle("compare-mode");
    showToast("후보지 비교 모드 · 카드별 지표를 확인하세요");
  });
  $("#help-button").addEventListener("click", () => $("#info-modal").classList.add("open"));
  $("#info-button").addEventListener("click", () => $("#info-modal").classList.add("open"));
  $$('[data-close-modal]').forEach((item) => item.addEventListener("click", () => $("#info-modal").classList.remove("open")));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") $("#info-modal").classList.remove("open");
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  bindUI();
  const hasGrid = await loadGridData();
  if (hasGrid) {
    computeGridReality();
    renderCandidates();
    renderSelected(selected);
  }
  createLeafletMap();
  if (hasGrid) {
    showToast(`OSM 전력망 스냅샷 로드 · 송전선 ${gridData.lines.count.toLocaleString()} · 발전소 ${gridData.plants.count.toLocaleString()}`);
  }
});
