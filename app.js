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

// political: 지자체 유치 의지·정책 정합성·규제 리스크 프록시 / balance: 국가 균형발전 기여(비수도권 가산) 프록시
const contextProfiles = {
  dangjin: { urban: 68, transport: 82, telecom: 72, cloud: 58, university: 64, railAir: 65, satellite: 91, water: 82, resilience: 89, land: 61, political: 76, balance: 78, cityContext: "대전·세종 생활권", networkContext: "2개 이중 경로 · 1개 IDC권", talentContext: "반경 60 km 내 4개" },
  naju: { urban: 74, transport: 76, telecom: 76, cloud: 62, university: 78, railAir: 70, satellite: 86, water: 74, resilience: 82, land: 88, political: 86, balance: 92, cityContext: "광주 생활권 · 36 min", networkContext: "3개 백본 경로 · 1개 IDC권", talentContext: "반경 60 km 내 7개" },
  sejong: { urban: 82, transport: 91, telecom: 82, cloud: 73, university: 78, railAir: 78, satellite: 88, water: 80, resilience: 84, land: 63, political: 81, balance: 74, cityContext: "대전·청주 생활권", networkContext: "4개 이중 경로 · 2개 IDC권", talentContext: "반경 60 km 내 9개" },
  icheon: { urban: 94, transport: 86, telecom: 94, cloud: 88, university: 82, railAir: 91, satellite: 76, water: 70, resilience: 73, land: 42, political: 34, balance: 25, cityContext: "수도권 생활권 · 48 min", networkContext: "5개 백본 경로 · 6개 IDC권", talentContext: "반경 60 km 내 26개" },
  ulsan: { urban: 77, transport: 84, telecom: 62, cloud: 58, university: 76, railAir: 83, satellite: 89, water: 68, resilience: 80, land: 73, political: 72, balance: 81, cityContext: "울산·부산 생활권", networkContext: "3개 이중 경로 · 2개 IDC권", talentContext: "반경 60 km 내 8개" },
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

// 컴퓨트 환산 프록시: H100급 가속기 서버 환산 전력과 FP8 연산력
const KW_PER_ACCELERATOR = 1.2; // 가속기 1장당 서버 환산 IT 전력(kW)
const ACCELERATOR_IT_SHARE = .85; // IT load 중 가속기 비중 프록시
const PFLOPS_PER_ACCELERATOR = 2; // FP8 dense 기준 프록시

// 지역사회 영향 환산 프록시 (주민 체감 단위)
const MWH_PER_HOUSEHOLD_YEAR = 3.6; // 가구당 연간 전력 사용량(MWh)
const M3_PER_PERSON_YEAR = 67; // 1인 연간 생활용수(m³, 일 183L)
const TCO2_PER_CAR_YEAR = 2; // 승용차 1대 연간 배출(tCO₂)

const factorLabels = [
  ["계통 접근성", "grid"], ["수전 여유", "reserve"], ["초고속 백본", "telecom"],
  ["배후 도시", "urban"], ["도로·교통", "transport"], ["클라우드·기존 IDC", "cloud"],
  ["대학·R&D 인재", "university"], ["수자원", "water"], ["재해·위성 회복력", "resilience"], ["토지·인허가", "land"],
  ["정치적 고려", "political"], ["지역균형발전", "balance"],
];

let selected = candidates[0];
let map;
let gridData = null; // OSM/Overpass 정적 스냅샷 (data/kr_power_*.json)
let mapLayers = { power: [], plants: [], suitability: [], context: [], urban: [], transport: [], telecom: [], cloud: [], university: [], railAir: [], satellite: [], water: [], hazard: [] };
let kepcoData = null; // 한전 접속여유 데이터 (data/kepco_capacity.json, 선택적)
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
  ["grid", "reserve", "telecom", "urban", "transport", "cloud", "university", "resilience", "political", "balance"].forEach((key) => {
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
    // 한전 접속여유(선택적): data/kepco_capacity.json이 있으면 후보지 수전 여유를 실데이터로 교체
    // 스키마는 data/kepco_capacity.sample.json 참조 (공공데이터포털 한전 변전소 여유용량 API 정규화 결과를 배치)
    try {
      const kepcoRes = await fetch("data/kepco_capacity.json");
      if (kepcoRes.ok) {
        kepcoData = await kepcoRes.json();
        applyKepcoOverrides();
      }
    } catch (error) {
      console.warn("KEPCO capacity file not present; using screening headroom proxy.", error);
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

// 한전 접속여유 데이터로 후보지 headroom을 교체: 반경 30 km 내 최근접 변전소의 여유용량 기준
function applyKepcoOverrides() {
  if (!kepcoData || !Array.isArray(kepcoData.substations)) return;
  candidates.forEach((site) => {
    let best = null;
    kepcoData.substations.forEach((substation) => {
      const distance = approxKm(site.coords, [substation.lat, substation.lng]);
      if (distance <= 30 && (!best || substation.availableMw > best.availableMw)) best = { ...substation, distance };
    });
    if (best) {
      site.kepco = best;
      // 시나리오 headroom 모델 역산: 최대 수전 ≈ headroom/0.72 + 50 이 되도록 설정
      site.headroom = Math.max(5, Math.round((best.availableMw - 50) * .72));
    }
  });
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
    resilience: hazardResilienceScore(coords), // 재해 프록시존 근접도 기반
    land: 60, // 토지·인허가는 미산정 → 중립 프록시
    political: 55, // 정치적 고려는 임의 지점 미산정 → 중립보다 소폭 낮게
    balance: approxKm(coords, [37.5665, 126.978]) >= 150 ? 88 : approxKm(coords, [37.5665, 126.978]) >= 60 ? 72 : 30, // 수도권 거리 기반 균형발전 프록시
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

// ---- 재해 프록시존: 공개 알려진 홍수 저지대·지진 다발권 (공공데이터 연동 전 탐색용) ----
const hazardZones = {
  flood: [
    [37.62, 126.68, 18, "한강 하류 저지대 · 김포·고양권"],
    [36.46, 126.98, 16, "금강 하류 저지대 · 공주·부여권"],
    [35.0, 126.78, 12, "영산강 하류 저지대 · 나주 일부"],
    [35.25, 128.85, 16, "낙동강 하류 저지대 · 김해·양산권"],
    [36.85, 126.75, 12, "삽교천 유역 저지대 · 아산·당진 일부"],
  ],
  seismic: [
    [35.84, 129.21, 28, "경주권 · 2016 M5.8 계기지진"],
    [36.02, 129.36, 22, "포항권 · 2017 M5.4 계기지진"],
    [35.4, 129.1, 30, "양산단층대 인접권"],
  ],
};

// 재해존 근접도로 회복력 점수를 산정: 존 밖 82, 존 중심에 가까울수록 감점
function hazardResilienceScore(coords) {
  let score = 82;
  const applyZones = (zones, maxPenalty) => zones.forEach(([lat, lng, radiusKm, ]) => {
    const distance = approxKm(coords, [lat, lng]);
    if (distance < radiusKm) score -= maxPenalty * (1 - distance / radiusKm);
  });
  applyZones(hazardZones.flood, 22);
  applyZones(hazardZones.seismic, 30);
  return clampScore(score, 25, 90);
}

// ---- AIDC 규모 모델: 전력·용수 공급 충족 + 민원 최소 전제의 규모별 적합도 ----
const aidcClasses = [
  { id: "hyper", label: "초대형 AIDC", itMw: 300, tagline: "300 MW+ · 프론티어 학습 캠퍼스" },
  { id: "large", label: "대형 AIDC", itMw: 100, tagline: "100 MW · 하이퍼스케일 리전급" },
  { id: "medium", label: "중형 AIDC", itMw: 40, tagline: "40 MW · 학습·서빙 혼합" },
  { id: "small", label: "소형 AIDC", itMw: 10, tagline: "10 MW · 엣지·서빙 특화" },
];

// 표준구성(N+1 · 하이브리드 · 부하율 80% · PUE 1.25) 기준 공급 한도
function siteSupplyLimits(site) {
  const env = envFor(site);
  const gridMax = (site.headroom / .72 + 50) / 1.25;
  const waterMax = WATER_AVAIL_M3[env.waterStress] / (.8 * 1.25 * 8.76 * coolingProfiles.hybrid.wue * 1000);
  return { gridMax, waterMax };
}

// 민원 리스크 페널티: 토지·인허가 갈등, 용수 경합, 주민 전력 경합(발전량 점유), 대도시 인접 — 규모가 클수록 증폭
function complaintPenalty(site, cls) {
  const env = envFor(site);
  const intakeAtClass = cls.itMw * 1.25;
  const share = site.gridReality && site.gridReality.mw50 ? (intakeAtClass / site.gridReality.mw50) * 100 : null;
  let penalty = (100 - site.factors.land) * .15;
  if (env.waterStress !== "LOW") penalty += 6;
  if (share !== null) penalty += share >= 5 ? 10 : share >= 2 ? 5 : 0;
  if (cls.itMw >= 100 && site.factors.urban >= 85) penalty += 6;
  const scale = cls.itMw >= 300 ? 1.4 : cls.itMw >= 100 ? 1.2 : cls.itMw >= 40 ? 1 : .7;
  return penalty * scale;
}

function classFitScore(site, cls) {
  const base = getModelScore(site);
  const { gridMax, waterMax } = siteSupplyLimits(site);
  const supply = Math.min(gridMax, waterMax);
  const supplyFit = Math.min(1, supply / cls.itMw);
  const penalty = complaintPenalty(site, cls);
  const score = Math.max(5, Math.min(99, Math.round(base * (.45 + .55 * supplyFit) - penalty)));
  const ok = supplyFit >= 1 && penalty < 12;
  const bottleneck = supplyFit < 1 ? (gridMax <= waterMax ? "계통 수전 부족" : "냉각 용수 부족") : (penalty >= 12 ? "민원 리스크" : null);
  return { score, supplyFit, supply, penalty, ok, bottleneck };
}

function renderClassFit() {
  const wrap = $("#scale-grid");
  if (!wrap) return;
  const pool = selected.id === "custom" ? [...candidates, selected] : candidates;
  wrap.innerHTML = aidcClasses.map((cls) => {
    const mine = classFitScore(selected, cls);
    const accels = Math.round((cls.itMw * 1000 * ACCELERATOR_IT_SHARE) / KW_PER_ACCELERATOR);
    const verdict = mine.ok ? (mine.score >= 75 ? "적합" : "조건부 적합") : mine.bottleneck;
    const verdictClass = mine.ok ? (mine.score >= 75 ? "good" : "cond") : "bad";
    let recoHtml;
    if (recommendedByClass && recommendedByClass[cls.id]) {
      recoHtml = `전국 추천 TOP 5 (지도 표시): ${recommendedByClass[cls.id]
        .map((entry, rank) => `${rank + 1}. <b>${entry.site.name}</b> ${entry.fit.score}${entry.fit.ok ? "" : "△"}`)
        .join(" · ")}${recommendedByClass[cls.id].some((entry) => !entry.fit.ok) ? "<br><small>△ 전력·용수/민원 전제 미충족 — 보강 전제 후보</small>" : ""}`;
    } else {
      const ranked = pool.map((site) => ({ site, fit: classFitScore(site, cls) })).sort((a, b) => b.fit.score - a.fit.score);
      const recommended = ranked.find((r) => r.fit.ok) || null;
      recoHtml = recommended
        ? `추천 입지: <b>${recommended.site.name}</b> ${recommended.fit.score}점 · 공급 ~${Math.round(recommended.fit.supply)} MW`
        : "전제 충족 후보 없음 — 계통·용수 보강 또는 규모 축소 필요";
    }
    return `
      <div class="scale-card">
        <div class="scale-head"><b>${cls.label}</b><small>${cls.tagline} · H100급 ~${accels.toLocaleString()}장</small></div>
        <div class="scale-score"><span>${selected.name}</span><strong>${mine.score}</strong><i class="scale-badge ${verdictClass}">${verdict}</i></div>
        <div class="scale-bar"><i style="width:${mine.score}%"></i></div>
        <div class="scale-meta">공급 한도 ~${Math.round(mine.supply)} MW (충족률 ${(mine.supplyFit * 100).toFixed(0)}%) · 민원 페널티 ${mine.penalty.toFixed(1)}</div>
        <div class="scale-reco">${recoHtml}</div>
      </div>
    `;
  }).join("");
}

// ---- 규모별 전국 추천: 345 kV+ 회선 시드 → 임의 지점 채점 → 클래스별 상위 5곳을 지도에 표시 ----
let seedSites = null;
let recommendedByClass = null;
let recommendationMarkers = [];
const classMarkerStyles = {
  hyper: { color: "#aa91ff", radius: 13 },
  large: { color: "#f36d91", radius: 10 },
  medium: { color: "#52d1dc", radius: 7.5 },
  small: { color: "#7ad6a2", radius: 5.5 },
};

// 시드: 345 kV+ 회선 중간점을 0.18°(~20 km) 셀로 중복 제거 — 계통 인접·육상 지점만 남는다
function generateSeedPoints() {
  if (!gridData) return [];
  const cells = new Map();
  gridData.lines.lines.forEach((line) => {
    if (line.v < 345) return;
    const mid = line.c[Math.floor(line.c.length / 2)];
    const key = `${Math.round(mid[0] / .18)}:${Math.round(mid[1] / .18)}`;
    if (!cells.has(key)) cells.set(key, mid);
  });
  return [...cells.values()];
}

function computeClassRecommendations(onDone) {
  if (!gridData) return;
  const seeds = generateSeedPoints();
  seedSites = [];
  let cursor = 0;
  const CHUNK = 12; // UI 블로킹 방지: 시드를 배치로 나눠 채점
  const step = () => {
    const end = Math.min(cursor + CHUNK, seeds.length);
    for (; cursor < end; cursor++) {
      const [lat, lng] = seeds[cursor];
      const site = buildCustomSite(lat, lng);
      site.id = `seed-${cursor}`;
      if (site.name === "사용자 지정 지점") site.name = `신규 후보 ${lat.toFixed(2)}·${lng.toFixed(2)}`;
      seedSites.push(site);
    }
    if (cursor < seeds.length) window.setTimeout(step, 0);
    else {
      rankRecommendations();
      if (onDone) onDone(seeds.length);
    }
  };
  step();
}

function rankRecommendations() {
  if (!seedSites) return;
  const pool = [...candidates, ...seedSites];
  recommendedByClass = {};
  aidcClasses.forEach((cls) => {
    const ranked = pool
      .map((site) => ({ site, fit: classFitScore(site, cls) }))
      .sort((a, b) => (b.fit.ok - a.fit.ok) || (b.fit.score - a.fit.score));
    const picks = [];
    for (const entry of ranked) {
      if (picks.length >= 5) break;
      if (picks.some((pick) => approxKm(pick.site.coords, entry.site.coords) < 30)) continue; // 지리적 분산 보장
      picks.push(entry);
    }
    recommendedByClass[cls.id] = picks;
  });
  drawRecommendationLayer();
}

// ---- 초대형 신설 후보: GW급 발전 클러스터 인접지 + 직접연계(전용선로·PPA) 전제 ----
const DIRECT_LINK_SHARE = .10; // 발전 클러스터 용량 중 전용 공급 가능 프록시 (협상 전제)
let hyperNewbuild = null;
let hyperMarkers = [];

const improvementLabels = [
  ["telecom", 65, "초고속 백본 전용선 신설"],
  ["water", 70, "해수·재이용수 냉각 협약"],
  ["land", 65, "산업단지 지정·토지 선매입"],
  ["urban", 60, "운영인력 주거·통근 인프라"],
  ["transport", 60, "진입도로·물류 접근 개선"],
  ["university", 55, "원격 운영센터 분리 운용"],
  ["resilience", 60, "내진·재해 설계 상향"],
];

function computeHyperNewbuild() {
  if (!gridData) return;
  // 앵커: 800 MW+ 태그 발전소, 클러스터 용량 = 반경 15 km 태그 합계
  const anchors = gridData.plants.plants.filter((plant) => plant[2] && plant[2] >= 800);
  const clusters = anchors.map(([lat, lng, mw, name]) => {
    let clusterMw = 0;
    gridData.plants.plants.forEach(([la, ln, m]) => {
      if (m && approxKm([lat, lng], [la, ln]) <= 15) clusterMw += m;
    });
    return { coords: [lat, lng], anchor: name || "무명 발전단지", mw, clusterMw: Math.round(clusterMw) };
  }).sort((a, b) => b.clusterMw - a.clusterMw);
  const hubs = [];
  for (const cluster of clusters) {
    if (hubs.length >= 9) break;
    if (cluster.clusterMw < 1500) continue; // GW 전략 허브 최소 프록시
    if (hubs.some((hub) => approxKm(hub.coords, cluster.coords) < 40)) continue;
    hubs.push(cluster);
  }
  const picks = hubs.filter((hub) => hub.clusterMw >= 2500).slice(0, 5); // 초대형(300 MW) 신설 표시용
  hyperNewbuild = picks.map((cluster, index) => {
    const site = buildCustomSite(cluster.coords[0], cluster.coords[1]);
    site.id = `hyper-${index}`;
    site.name = `${cluster.anchor} 인접`;
    const directMw = Math.round(cluster.clusterMw * DIRECT_LINK_SHARE);
    const maxIt = Math.round(directMw / 1.25); // N+1 전제
    const improvements = improvementLabels
      .filter(([key, threshold]) => site.factors[key] < threshold)
      .map(([, , label]) => label);
    if (envFor(site).waterStress !== "LOW" && !improvements.includes("해수·재이용수 냉각 협약")) improvements.push("해수·재이용수 냉각 협약");
    const improvedFactors = { ...site.factors };
    ["telecom", "water", "land", "urban", "transport", "railAir", "university", "resilience"].forEach((key) => {
      if (improvedFactors[key] < 72) improvedFactors[key] = 72; // 개선 목표치 프록시
    });
    return { site, cluster, directMw, maxIt, improvements, improvedFactors, feasible: maxIt >= 300 };
  });
  drawHyperNewbuildLayer();
  renderHyperNewbuild();
  computeGwStrategy(hubs);
}

// ---- GW 전략: 1 GW+ 최적 입지와 정부 로드맵(2029 8.4 GW → 2035 18.4 GW) 배분 ----
const PHASE1_SHARE = .10; // 기존 클러스터 직접연계 프록시 (2029)
const PHASE2_SHARE = .20; // 계통 보강·신규 전원 병행 프록시 (2035)
const GW_TARGET_2029 = 8400; // MW (정부 1단계)
const GW_TARGET_2035 = 18400; // MW (정부 최대 목표)
let gwStrategy = null;

function computeGwStrategy(hubs) {
  gwStrategy = hubs.map((cluster) => {
    const site = buildCustomSite(cluster.coords[0], cluster.coords[1]);
    site.name = `${cluster.anchor} 인접`;
    const it2029 = Math.round((cluster.clusterMw * PHASE1_SHARE) / 1.25);
    const it2035 = Math.round((cluster.clusterMw * PHASE2_SHARE) / 1.25);
    const tasks = improvementLabels
      .filter(([key, threshold]) => site.factors[key] < threshold)
      .map(([, , label]) => label);
    return { site, cluster, it2029, it2035, tasks };
  });
  renderGwStrategy();
  renderMegaAlloc();
}

function renderGwStrategy() {
  const wrap = $("#gw-strategy-body");
  if (!wrap || !gwStrategy) return;
  $("#gw-strategy").hidden = false;
  const sum2029 = gwStrategy.reduce((sum, hub) => sum + hub.it2029, 0);
  const sum2035 = gwStrategy.reduce((sum, hub) => sum + hub.it2035, 0);
  const gap2029 = GW_TARGET_2029 - sum2029;
  const gap2035 = GW_TARGET_2035 - sum2035;
  // 1 GW+ 최적: 2035 프록시 기준 1 GW 이상 가능한 허브 중 기본 적합도 최고
  const gwCapable = gwStrategy.filter((hub) => hub.it2035 >= 1000)
    .sort((a, b) => getModelScore(b.site) - getModelScore(a.site));
  const best = gwCapable[0] || gwStrategy.slice().sort((a, b) => b.it2035 - a.it2035)[0];
  const bestScore = getModelScore(best.site);
  const rows = gwStrategy.map((hub) => `
    <tr>
      <td><b>${hub.site.name}</b><br><small>${hub.cluster.clusterMw.toLocaleString()} MW 클러스터</small></td>
      <td>${hub.it2029.toLocaleString()} MW</td>
      <td>${hub.it2035.toLocaleString()} MW</td>
      <td class="gw-tasks">${hub.tasks.length ? hub.tasks.slice(0, 3).join(" · ") : "주요 취약 없음"}</td>
    </tr>
  `).join("");
  wrap.innerHTML = `
    <div class="gw-best">
      <span class="gw-best-kicker">1 GW+ 최적 추천</span>
      <div class="gw-best-line"><b>${best.site.name}</b> — 적합도 ${bestScore} · 클러스터 ${best.cluster.clusterMw.toLocaleString()} MW · 2035 프록시 IT ~${best.it2035.toLocaleString()} MW</div>
      <div class="gw-best-tasks">해결 과제: 765 kV/HVDC 전용 인입·계통영향평가 패스트트랙 ${best.tasks.length ? "· " + best.tasks.join(" · ") : ""} · 전용 신규 전원(SMR·해상풍력 PPA) 확보 · 단계 증설 마스터플랜</div>
    </div>
    <table class="gw-table">
      <thead><tr><th>허브 (발전 클러스터)</th><th>2029 배분<br><small>직접연계 10%</small></th><th>2035 확장<br><small>보강+신규 전원 20%</small></th><th>핵심 과제</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr>
        <td><b>합계 / 목표</b></td>
        <td><b>${sum2029.toLocaleString()}</b> / ${GW_TARGET_2029.toLocaleString()} MW<br><small class="gw-gap">부족분 ${Math.max(0, gap2029).toLocaleString()} MW</small></td>
        <td><b>${sum2035.toLocaleString()}</b> / ${GW_TARGET_2035.toLocaleString()} MW<br><small class="gw-gap">부족분 ${Math.max(0, gap2035).toLocaleString()} MW</small></td>
        <td class="gw-tasks">부족분 충당: 신규 전용 전원(SMR·해상풍력·LNG 직결) · HVDC 동해안—수도권 · 호남 RE100 캠퍼스 · 한전 접속여유 실데이터 연동 후 재배분</td>
      </tr></tfoot>
    </table>
    <div class="gw-roadmap">
      <b>달성 경로 제안</b> — <em>1단계(~2029, 8.4 GW)</em>: 서해안 화력벨트(당진·보령·태안권)와 동남권 원전벨트(고리권)에 직접연계형 캠퍼스를 병행 착공하고, 수도권 서부(서인천권)는 저지연 서빙 전용으로 한정. 계통영향평가·인허가 패스트트랙과 지역 상생요금이 전제.
      <em>2단계(~2035, 18.4 GW)</em>: 동해안(한울·신한울) HVDC 연계와 SMR·해상풍력 전용 전원으로 허브당 규모를 2배 확장, 호남 재생에너지 클러스터를 RE100 전용 존으로 추가. 냉각은 해수·재이용수 표준화로 담수 의존을 제한.
    </div>
  `;
}

function drawHyperNewbuildLayer() {
  if (!map || !hyperNewbuild) return;
  hyperMarkers.forEach((marker) => map.removeLayer(marker));
  mapLayers.suitability = mapLayers.suitability.filter((layer) => !hyperMarkers.includes(layer));
  hyperMarkers = [];
  const control = $('[data-layer="suitability"]');
  const visible = control ? control.classList.contains("active") : true;
  hyperNewbuild.forEach((entry, rank) => {
    const marker = L.circleMarker(entry.site.coords, {
      radius: 16, color: "#f2a35b", weight: 2.4, fillColor: "#f2a35b", fillOpacity: .07, dashArray: "7 5",
    }).bindTooltip(
      `초대형 신설 후보 ${rank + 1} · ${entry.site.name}<br>클러스터 ${entry.cluster.clusterMw.toLocaleString()} MW · 직접연계 프록시 ${entry.directMw.toLocaleString()} MW → IT ~${entry.maxIt.toLocaleString()} MW${entry.feasible ? "" : " · 300 MW 미달"}<br>개선 과제 ${entry.improvements.length}건 (클릭: 상세 분석)`,
      { direction: "top", className: "dark-tooltip" },
    ).on("click", () => selectCustomLocation(entry.site.coords[0], entry.site.coords[1]));
    if (visible) marker.addTo(map);
    mapLayers.suitability.push(marker);
    hyperMarkers.push(marker);
  });
}

function renderHyperNewbuild() {
  const wrap = $("#hyper-list");
  if (!wrap || !hyperNewbuild) return;
  $("#hyper-newbuild").hidden = false;
  wrap.innerHTML = hyperNewbuild.map((entry, rank) => {
    const currentScore = getModelScore(entry.site);
    const improvedScore = getModelScore({ factors: entry.improvedFactors });
    return `
      <div class="hyper-row">
        <span class="hyper-rank">${rank + 1}</span>
        <span class="hyper-name"><b>${entry.site.name}</b><small>${entry.site.region} · 클러스터 ${entry.cluster.clusterMw.toLocaleString()} MW</small></span>
        <span class="hyper-supply"><b>IT ~${entry.maxIt.toLocaleString()} MW</b><small>직접연계 ${entry.directMw.toLocaleString()} MW (${(DIRECT_LINK_SHARE * 100).toFixed(0)}% 프록시)</small></span>
        <span class="hyper-score">${currentScore} <em>→</em> <b>${improvedScore}</b><small>현재 → 개선 시</small></span>
        <span class="hyper-actions">${entry.improvements.length
          ? entry.improvements.map((item) => `<i>${item}</i>`).join("")
          : "<i>주요 취약 요인 없음</i>"}</span>
      </div>
    `;
  }).join("");
}

function drawRecommendationLayer() {
  if (!map || !recommendedByClass) return;
  recommendationMarkers.forEach((marker) => map.removeLayer(marker));
  mapLayers.suitability = mapLayers.suitability.filter((layer) => !recommendationMarkers.includes(layer));
  recommendationMarkers = [];
  const control = $('[data-layer="suitability"]');
  const visible = control ? control.classList.contains("active") : true;
  aidcClasses.forEach((cls) => {
    recommendedByClass[cls.id].forEach((entry, rank) => {
      const style = classMarkerStyles[cls.id];
      const marker = L.circleMarker(entry.site.coords, {
        radius: style.radius, color: style.color, weight: rank === 0 ? 2.2 : 1.4,
        fillColor: style.color, fillOpacity: .1, dashArray: "4 3",
      }).bindTooltip(
        `${cls.label} 추천 ${rank + 1}위 · ${entry.site.name} · ${entry.fit.score}점${entry.fit.ok ? "" : " · 전제 미충족(보강 필요)"}<br>공급 한도 ~${Math.round(entry.fit.supply)} MW · 민원 페널티 ${entry.fit.penalty.toFixed(1)}`,
        { direction: "top", className: "dark-tooltip" },
      ).on("click", () => {
        if (String(entry.site.id).startsWith("seed-")) selectCustomLocation(entry.site.coords[0], entry.site.coords[1]);
        else renderSelected(entry.site);
      });
      if (visible) marker.addTo(map);
      mapLayers.suitability.push(marker);
      recommendationMarkers.push(marker);
    });
  });
}

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
    drawHazardLayer();
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

// 재해 프록시존 레이어: 홍수 저지대(파랑)·지진 다발권(핑크). HAZARD 툴바로 opt-in.
function drawHazardLayer() {
  if (!map) return;
  hazardZones.flood.forEach(([lat, lng, radiusKm, label]) => {
    const zone = L.circle([lat, lng], { radius: radiusKm * 1000, color: "#52a8dc", weight: 1.2, dashArray: "5 5", opacity: .55, fillColor: "#52a8dc", fillOpacity: .08 })
      .bindTooltip(`홍수 저지대 프록시 · ${label}`, { direction: "top", className: "dark-tooltip" });
    mapLayers.hazard.push(zone);
  });
  hazardZones.seismic.forEach(([lat, lng, radiusKm, label]) => {
    const zone = L.circle([lat, lng], { radius: radiusKm * 1000, color: "#f36d91", weight: 1.2, dashArray: "3 6", opacity: .55, fillColor: "#f36d91", fillOpacity: .06 })
      .bindTooltip(`지진 다발권 프록시 · ${label}`, { direction: "top", className: "dark-tooltip" });
    mapLayers.hazard.push(zone);
  });
  // opt-in: 초기에는 지도에 올리지 않음 (setLayerVisibility가 addTo로 표시)
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
  const politicalWeight = Number($("#political-priority").value);
  const balanceWeight = Number($("#balance-priority").value);
  const total = powerWeight + ecosystemWeight + resilienceWeight + politicalWeight + balanceWeight;
  const power = (site.factors.grid + site.factors.reserve) / 2;
  const ecosystem = (site.factors.urban + site.factors.transport + site.factors.telecom + site.factors.cloud + site.factors.university) / 5;
  const resilience = (site.factors.water + site.factors.resilience + site.factors.land) / 3;
  return Math.round((power * powerWeight + ecosystem * ecosystemWeight + resilience * resilienceWeight
    + site.factors.political * politicalWeight + site.factors.balance * balanceWeight) / total);
}

function applyModelWeights(showMessage = false) {
  const values = [
    ["power-priority", "power-priority-value"],
    ["ecosystem-priority", "ecosystem-priority-value"],
    ["resilience-priority", "resilience-priority-value"],
    ["political-priority", "political-priority-value"],
    ["balance-priority", "balance-priority-value"],
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
  if (seedSites) rankRecommendations(); // 가중치 변경 시 전국 추천 재순위 (시드 채점은 재사용)
  renderClassFit();
  renderHyperNewbuild(); // 신설 후보의 현재/개선 점수도 가중치 반영
  renderGwStrategy(); // GW 전략의 1GW+ 최적 추천도 가중치 반영
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
    $("#reality-kepco").textContent = selected.kepco
      ? `${selected.kepco.name} ${selected.kepco.availableMw.toLocaleString()} MW (${selected.kepco.updated})`
      : "미연동 · 스크리닝 프록시";
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
  renderBrief({
    load, pue, redundancy, utilization, cooling, env,
    annualEnergy, waterUse, carbon, powerCost, intake, headroom,
    capex, capexDelta, gridConnectCost, pueCapexFactor,
    maxIt, gridMaxIt, waterMaxIt, bindingConstraint, waterAlert,
  });
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

// 시뮬레이션 결과를 장점/단점/컴퓨트 용량/개선 방향 설명문으로 조립하는 규칙 기반 해석기
function renderBrief(s) {
  const wrap = $("#brief-grid");
  if (!wrap) return;
  const site = selected;
  const f = site.factors;
  const reality = site.gridReality;
  const strengths = [];
  const risks = [];
  const actions = [];

  // ---- 장점 ----
  const hvKmValue = reality ? reality.nearestHv : parseFloat(site.distance) || 99;
  if (f.grid >= 85 && hvKmValue <= 10) strengths.push(`계통 접근성이 최상급입니다 — ${site.grid} 회랑, 최근접 고압선 ${site.distance}.`);
  else if (f.grid >= 70) strengths.push(`계통 접근성이 양호합니다 (${site.grid}, 최근접 ${site.distance}).`);
  if (reality && reality.mw50 >= 5000) strengths.push(`반경 50 km 매핑 발전용량 ${reality.mw50.toLocaleString()} MW · 발전소 ${reality.plants50.toLocaleString()}개 — 현재 수요(${s.intake.toFixed(0)} MW)는 그 ${((s.intake / reality.mw50) * 100).toFixed(1)}% 수준입니다.`);
  if (reality && reality.hvLines50 >= 40) strengths.push(`345 kV+ 회선이 반경 50 km에 ${reality.hvLines50}개 지나 이중 인입 경로 확보에 유리합니다.`);
  if (s.capexDelta <= 0) strengths.push(`CAPEX 개산이 표준구성보다 ${Math.abs(s.capexDelta).toFixed(1)}% 낮습니다 (총 ${s.capex.toLocaleString()}억원).`);
  if (s.env.waterStress === "LOW" && s.cooling.wue >= .9) strengths.push(`취수원 스트레스가 낮아(${s.env.waterSource}) ${s.cooling.label} 냉각의 용수 리스크가 작습니다.`);
  if (f.telecom >= 80) strengths.push("초고속 백본 접근성이 좋아 저지연 서빙·멀티리전 구성에 유리합니다.");
  if (s.env.carbonIntensity <= .40) strengths.push(`지역 탄소집약도 프록시가 낮아(${s.env.carbonIntensity.toFixed(2)} kg/kWh) 동일 부하 대비 배출이 적습니다.`);
  if (!strengths.length) strengths.push("두드러진 강점 요인이 없습니다 — 인접 후보지와 비교 검토를 권장합니다.");

  // ---- 단점·리스크 ----
  if (s.headroom < 0) risks.push(`필요 수전용량 ${s.intake.toFixed(0)} MW가 수전 여유를 ${Math.abs(Math.round(s.headroom))} MW 초과합니다 — 계통 보강 없이는 수용이 어렵습니다.`);
  if (s.load > s.maxIt) risks.push(`현재 IT LOAD ${s.load} MW가 입지 최대 추정치(~${Math.round(s.maxIt)} MW)를 초과합니다 (${s.bindingConstraint} 병목).`);
  if (s.waterAlert || (s.env.waterStress !== "LOW" && s.cooling.wue >= .9)) risks.push(`용수 스트레스(${s.env.waterStress}) 지역에서 ${s.cooling.label} 냉각은 연간 ${s.waterUse.toLocaleString()} m³ 취수 협의가 전제됩니다.`);
  if (s.env.carbonIntensity >= .45) risks.push(`지역 계통 탄소집약도가 높아(연 ${s.carbon.toLocaleString()} tCO₂ 프록시) RE 조달 없이는 지속가능성 목표 달성이 어렵습니다.`);
  if (s.capexDelta > 10) risks.push(`CAPEX가 표준구성 대비 ${s.capexDelta.toFixed(1)}% 높습니다 — 계통 인입 ${Math.round(s.gridConnectCost).toLocaleString()}억원 비중을 확인하세요.`);
  const weakFactors = factorLabels.filter(([, key]) => (f[key] ?? 100) <= 60).map(([label, key]) => `${label}(${f[key]})`);
  if (weakFactors.length) risks.push(`취약 요인: ${weakFactors.slice(0, 3).join(" · ")} — 초기 스크리닝 기준 하위 구간입니다.`);
  if (site.id === "custom") risks.push("사용자 지정 지점은 재해·토지 요인이 미산정 중립값(60)입니다 — 정식 입지조사가 필요합니다.");
  if (!risks.length) risks.push("시나리오 기준으로 치명적 리스크는 보이지 않습니다. 단, 모든 값은 공개 데이터 프록시입니다.");

  // ---- 기대 컴퓨트 용량 ----
  const accels = Math.round((s.load * 1000 * ACCELERATOR_IT_SHARE) / KW_PER_ACCELERATOR);
  const maxAccels = Math.round((s.maxIt * 1000 * ACCELERATOR_IT_SHARE) / KW_PER_ACCELERATOR);
  const eflops = (accels * PFLOPS_PER_ACCELERATOR) / 1000;
  const maxEflops = (maxAccels * PFLOPS_PER_ACCELERATOR) / 1000;
  const frontierPct = Math.round((accels / 25000) * 100);
  const computeText = `현재 조건(IT ${s.load} MW · 부하율 ${Math.round(s.utilization * 100)}%)에서 H100급 가속기 약 <b>${accels.toLocaleString()}장</b>, FP8 기준 약 <b>${eflops.toFixed(1)} EFLOPS</b>를 수용할 수 있습니다 — 프론티어급 학습 클러스터(약 2.5만 장)의 ${frontierPct}% 규모입니다. 입지 최대 추정(~${Math.round(s.maxIt)} MW, ${s.bindingConstraint} 병목)까지 확장하면 약 <b>${maxAccels.toLocaleString()}장 · ${maxEflops.toFixed(1)} EFLOPS</b>까지 가능합니다. 연간 ${s.annualEnergy.toLocaleString()} GWh 전력과 전기요금 약 ${s.powerCost.toLocaleString()}억원이 소요됩니다. (장당 1.2 kW 서버 환산 · 가속기 비중 85% 프록시)`;

  // ---- 개선 방향 ----
  if (s.bindingConstraint === "계통 수전") actions.push("한전 계통접속 사전검토로 실제 여유용량·접속비를 확정하고, 전용 변전소·이중 인입(155/345 kV) 옵션을 비교하세요.");
  else actions.push("공업용수 재배분·하수 재이용수(중수) 협의로 용수 한도를 늘리거나 공랭 비중을 높여 병목을 해소하세요.");
  if (s.cooling.wue >= 1.8 && s.env.waterStress !== "LOW") actions.push(`하이브리드 냉각 전환 시 용수를 연 약 ${Math.round(s.waterUse / 2).toLocaleString()} m³(50%) 절감할 수 있습니다.`);
  if (s.pue > 1.2) {
    const savedGwh = Math.round(s.load * s.utilization * (s.pue - 1.15) * 8.76);
    actions.push(`PUE를 1.15까지 낮추면 연간 약 ${savedGwh.toLocaleString()} GWh(전기요금 약 ${Math.round(savedGwh * 1.6).toLocaleString()}억원)를 절감합니다 — 수랭 밀도 상향이 유효합니다.`);
  }
  if (s.redundancy === 2) {
    const saved = Math.round(s.load * CAPEX_PER_IT_MW * coolingCapexFactor[coolingMode] * s.pueCapexFactor * .12);
    actions.push(`전체 N+2가 필수가 아니라면 학습 전용 구역을 N+1로 낮춰 CAPEX 약 ${saved.toLocaleString()}억원을 절감할 수 있습니다.`);
  }
  if (s.env.carbonIntensity >= .42) actions.push("재생에너지 PPA·REC 조달로 탄소집약도를 상쇄하세요 — 호남·해상풍력권 인접 입지는 직접 PPA 협상력이 있습니다.");
  if (s.load < s.maxIt * .6 && s.headroom > 20) actions.push(`수전 여유가 남습니다 — 단계 증설(현재 ${s.load} MW → 최대 ~${Math.round(s.maxIt)} MW) 마스터플랜으로 부지·변전 용량을 선확보하세요.`);
  if (site.id === "custom") actions.push("토지 용도지역·재해이력·인허가 조건 현장조사로 미산정 요인을 보완한 뒤 정식 후보로 승격하세요.");

  // ---- 지역사회 영향 (최대 용량 가동 가정) ----
  const community = [];
  const redundancyFactorValue = [1.1, 1.25, 1.42][s.redundancy];
  const maxIntake = s.maxIt * redundancyFactorValue;
  const maxEnergy = Math.round(s.maxIt * s.utilization * s.pue * 8.76); // GWh/yr
  const maxWater = Math.round(maxEnergy * s.cooling.wue * 1000); // m³/yr
  const maxCarbon = Math.round(maxEnergy * s.env.carbonIntensity * 1000); // t/yr
  const households = Math.round((maxEnergy * 1000) / MWH_PER_HOUSEHOLD_YEAR);
  const persons = Math.round(maxWater / M3_PER_PERSON_YEAR);
  const cars = Math.round(maxCarbon / TCO2_PER_CAR_YEAR);
  const gridShare = reality && reality.mw50 ? (maxIntake / reality.mw50) * 100 : null;
  const waterShare = (maxWater / WATER_AVAIL_M3[s.env.waterStress]) * 100;
  community.push(`<b>전력수급</b> — 최대 용량(IT ~${Math.round(s.maxIt)} MW · 수전 ${maxIntake.toFixed(0)} MW) 가동 시 연간 ${maxEnergy.toLocaleString()} GWh를 소비합니다. 약 <b>${households.toLocaleString()}가구</b>의 연간 사용량과 같고${gridShare ? `, 반경 50 km 매핑 발전량의 ${gridShare.toFixed(1)}%를 점유합니다` : ""}. ${gridShare && gridShare >= 3 ? "피크 시 지역 계통 혼잡과 신규 산업·주거 수요와의 경합이 생길 수 있어, 계통 보강 없이는 지역 전력수급 안정성에 부담이 됩니다." : "매핑 발전량 대비 점유율은 낮지만, 실제 여유는 한전 계통검토로 확인해야 합니다."}`);
  community.push(`<b>물공급</b> — 냉각용수 연 ${maxWater.toLocaleString()} m³는 주민 약 <b>${persons.toLocaleString()}명</b>의 생활용수와 같으며, 지역 가용 프록시의 ${Math.min(100, waterShare).toFixed(0)}% 수준입니다. ${s.env.waterStress !== "LOW" || waterShare >= 50 ? "가뭄기에 생활·농업용수 배분 경합, 취수원 수위 저하와 하류 유량 감소 민원이 발생할 수 있습니다." : "취수원 여유가 있으나 가뭄 시나리오의 우선순위 협약은 사전에 필요합니다."}`);
  community.push(`<b>환경</b> — 연간 배출 프록시 ${maxCarbon.toLocaleString()} tCO₂(승용차 약 ${cars.toLocaleString()}대 분). ${s.cooling.wue >= 1.8 ? "냉각탑 백연·소음과 온배수 방류 시 하천 수온 상승이 쟁점이 될 수 있습니다." : s.cooling.wue <= .1 ? "대형 공랭 설비의 소음과 배열(열섬) 영향이 인접 주거지 쟁점이 될 수 있습니다." : "냉각탑 백연·소음과 배열 영향은 배치 설계에 따라 달라집니다."} 비상 디젤 발전기 시험가동 시 대기질, 송전선로 신설 경과지의 경관·전자파 우려도 주민 수용성 항목입니다.`);
  community.push(`<b>완화 방안</b> — 폐열의 지역난방·온실 재이용, 하수 재이용수(중수) 냉각 전환, 저소음 설비·차폐 설계, 상생요금·지방세수·상시 고용(운영인력 프록시 ${Math.max(30, Math.round(s.maxIt * 1.2)).toLocaleString()}명)과 주민설명회를 통한 이익공유가 표준 완화 패키지입니다.`);

  const list = (items) => `<ul>${items.slice(0, 4).map((item) => `<li>${item}</li>`).join("")}</ul>`;
  wrap.innerHTML = `
    <div class="brief-block"><h3 class="brief-title strength">장점</h3>${list(strengths)}</div>
    <div class="brief-block"><h3 class="brief-title risk">단점 · 리스크</h3>${list(risks)}</div>
    <div class="brief-block brief-compute"><h3 class="brief-title compute">기대 컴퓨트 용량</h3><p>${computeText}</p></div>
    <div class="brief-block"><h3 class="brief-title action">개선 방향</h3>${list(actions)}</div>
    <div class="brief-block brief-community"><h3 class="brief-title community">지역사회 영향 · 최대 용량(~${Math.round(s.maxIt)} MW) 가동 가정</h3>${list(community)}</div>
  `;
  $("#brief-site-name").textContent = site.name;
}

// ---- MEGA PROJECT: 1단계(2029)·2단계(2035) 지도 레이어와 배분 테이블 ----
const re100Zones = [
  { name: "새만금 RE100 캠퍼스", coords: [35.8, 126.6], mw: 1200, note: "수상태양광·산단 계통 연계" },
  { name: "솔라시도 RE100 캠퍼스", coords: [34.6, 126.3], mw: 1000, note: "태양광+ESS 직결" },
  { name: "신안 해상풍력 연계존", coords: [34.9, 126.15], mw: 1500, note: "8 GW급 해상풍력 직접 PPA" },
];
const smrHubProposal = { name: "동해안 SMR 직결 허브 (제안)", coords: [36.6, 129.35], mw: 2000, note: "SMR 0.7 GW급 × N + HVDC 병행" };
const hvdcProposals = [
  { label: "HVDC 동해안—수도권 (계획 참조 회랑)", coords: [[37.09, 129.39], [37.3, 128.6], [37.45, 127.8], [37.5, 127.3]] },
  { label: "서해안 화력벨트—중부 보강 (제안 회랑)", coords: [[36.4, 126.49], [36.6, 126.9], [36.9, 127.2]] },
];
let megaLayers = { p1: [], p2: [] };
let megaDrawn = false;

function drawMegaLayers() {
  if (!map || !gwStrategy || megaDrawn) return;
  megaDrawn = true;
  gwStrategy.forEach((hub) => {
    const p1 = L.circleMarker(hub.site.coords, {
      radius: Math.max(7, Math.min(14, hub.it2029 / 70)), color: "#0e1820", weight: 1.6,
      fillColor: "#f2a35b", fillOpacity: .55,
    }).bindTooltip(`1단계 2029 · ${hub.site.name}<br>IT ${hub.it2029.toLocaleString()} MW (직접연계 10% 프록시)`, { direction: "top", className: "dark-tooltip" })
      .on("click", () => selectCustomLocation(hub.site.coords[0], hub.site.coords[1]));
    megaLayers.p1.push(p1);
    const p2 = L.circle(hub.site.coords, {
      radius: 24000, color: "#52d1dc", weight: 2, opacity: .6, dashArray: "6 6", fillColor: "#52d1dc", fillOpacity: .04,
    }).bindTooltip(`2단계 2035 · ${hub.site.name}<br>IT ${hub.it2035.toLocaleString()} MW (계통 보강 + 신규 전원 20% 프록시)`, { direction: "top", className: "dark-tooltip" });
    megaLayers.p2.push(p2);
  });
  re100Zones.forEach((zone) => {
    const marker = L.circleMarker(zone.coords, { radius: 10, color: "#7ad6a2", weight: 2.2, dashArray: "4 3", fillColor: "#7ad6a2", fillOpacity: .15 })
      .bindTooltip(`2단계 RE100 존 · ${zone.name}<br>목표 ${zone.mw.toLocaleString()} MW · ${zone.note}`, { direction: "top", className: "dark-tooltip" })
      .on("click", () => selectCustomLocation(zone.coords[0], zone.coords[1]));
    megaLayers.p2.push(marker);
  });
  const smrMarker = L.circleMarker(smrHubProposal.coords, { radius: 11, color: "#aa91ff", weight: 2.2, dashArray: "4 3", fillColor: "#aa91ff", fillOpacity: .15 })
    .bindTooltip(`2단계 · ${smrHubProposal.name}<br>목표 ${smrHubProposal.mw.toLocaleString()} MW · ${smrHubProposal.note}`, { direction: "top", className: "dark-tooltip" })
    .on("click", () => selectCustomLocation(smrHubProposal.coords[0], smrHubProposal.coords[1]));
  megaLayers.p2.push(smrMarker);
  hvdcProposals.forEach((line) => {
    const path = L.polyline(line.coords, { color: "#aa91ff", weight: 3.4, opacity: .5, dashArray: "10 8" })
      .bindTooltip(line.label, { sticky: true, className: "dark-tooltip" });
    megaLayers.p2.push(path);
  });
}

let megaPhaseState = { p1: false, p2: false };

// 섹션 버튼과 지도 툴바 옵션이 같은 상태를 공유한다
function setMegaPhase(phase, show, { scroll = false } = {}) {
  drawMegaLayers();
  if (!map) { showToast("메가 프로젝트 레이어는 지도 연결 후 표시됩니다"); return; }
  if (!gwStrategy) { showToast("허브 배분 계산 중입니다 — 잠시 후 다시 시도해주세요"); return; }
  megaPhaseState[phase] = show;
  megaLayers[phase].forEach((layer) => { if (show) layer.addTo(map); else map.removeLayer(layer); });
  const sectionButton = $(`#mega-${phase}-btn`);
  const mapOption = $(`#map-mega-${phase}`);
  if (sectionButton) sectionButton.classList.toggle("active", show);
  if (mapOption) mapOption.classList.toggle("active", show);
  const megaTool = $('[data-mega-toggle]');
  if (megaTool) megaTool.classList.toggle("active", megaPhaseState.p1 || megaPhaseState.p2 || !$("#mega-map-options").hidden);
  if (show && scroll) $("#map-section").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast(show
    ? `${phase === "p1" ? "1단계 2029 허브 9곳" : "2단계 2035 확장(허브 확장 + RE100 + SMR + HVDC)"}을 지도에 표시했습니다`
    : `${phase === "p1" ? "1단계" : "2단계"} 레이어를 숨겼습니다`);
}

function toggleMegaPhase(phase, button) {
  setMegaPhase(phase, !button.classList.contains("active"), { scroll: true });
}

function renderMegaAlloc() {
  const wrap = $("#mega-alloc");
  if (!wrap || !gwStrategy) return;
  const sum2029 = gwStrategy.reduce((sum, hub) => sum + hub.it2029, 0);
  const sum2035 = gwStrategy.reduce((sum, hub) => sum + hub.it2035, 0);
  const re100Total = re100Zones.reduce((sum, zone) => sum + zone.mw, 0);
  const gap2029 = GW_TARGET_2029 - sum2029;
  const residual2035 = GW_TARGET_2035 - sum2035 - re100Total - smrHubProposal.mw;
  wrap.innerHTML = `
    <table class="gw-table mega-table">
      <thead><tr><th>구성 요소</th><th>1단계 2029</th><th>2단계 2035</th><th>근거·수단</th></tr></thead>
      <tbody>
        <tr><td><b>GW급 발전 클러스터 허브 9곳</b><br><small>고리·서인천·한울·보령·당진·광양·한빛·포천·월성</small></td>
          <td>${sum2029.toLocaleString()} MW</td><td>${sum2035.toLocaleString()} MW</td>
          <td class="gw-tasks">직접연계 10% → 계통 보강·신규 전원 병행 20% 프록시</td></tr>
        <tr><td><b>폐지화력 부지 전환 + 수도권 서빙존</b></td>
          <td>${Math.max(0, gap2029).toLocaleString()} MW</td><td>—</td>
          <td class="gw-tasks">석탄 단계 폐지(당진·보령·태안권) 부지·계통 재활용, 서인천권 저지연 서빙 한정</td></tr>
        <tr><td><b>호남 RE100 존 3곳</b><br><small>새만금 · 솔라시도 · 신안 해상풍력</small></td>
          <td>—</td><td>${re100Total.toLocaleString()} MW</td>
          <td class="gw-tasks">재생에너지 확충 계획 연계 직접 PPA · RE100 전용 캠퍼스</td></tr>
        <tr><td><b>SMR 직결 허브 (동해안 제안)</b></td>
          <td>—</td><td>${smrHubProposal.mw.toLocaleString()} MW</td>
          <td class="gw-tasks">전기본 SMR 실증 방향 연계 · 0.7 GW급 × N 직결</td></tr>
        <tr><td><b>HVDC 재배분·예비</b></td>
          <td>—</td><td>${Math.max(0, residual2035).toLocaleString()} MW</td>
          <td class="gw-tasks">동해안—수도권 HVDC 개통 후 허브 재배분 · 수요 변동 예비</td></tr>
      </tbody>
      <tfoot><tr><td><b>합계 / 정부 목표</b></td>
        <td><b>${GW_TARGET_2029.toLocaleString()}</b> MW</td>
        <td><b>${GW_TARGET_2035.toLocaleString()}</b> MW</td>
        <td class="gw-tasks">모든 배분은 탐색용 프록시 — 한전 접속여유·전기본 확정치 연동 시 재계산</td></tr></tfoot>
    </table>
  `;
}

// ---- 후보지 비교 리포트: 인쇄 뷰 생성 후 브라우저 인쇄(PDF 저장) 호출 ----
function buildReportHtml() {
  const pool = selected.id === "custom" ? [...candidates, selected] : candidates;
  const weightLine = [
    ["POWER", "power-priority"], ["ECOSYSTEM", "ecosystem-priority"], ["RESILIENCE", "resilience-priority"],
    ["POLITICAL", "political-priority"], ["BALANCE", "balance-priority"],
  ].map(([label, id]) => `${label} ${$(`#${id}`).value}%`).join(" · ");
  const scenarioLine = `IT ${$("#load-value").textContent} MW · PUE ${$("#pue-value").textContent} · ${$("#redundancy-value").textContent} · 부하율 ${$("#util-value").textContent}% · ${coolingProfiles[coolingMode].label}`;
  const headCells = aidcClasses.map((cls) => `<th>${cls.label.replace(" AIDC", "")}<br><small>${cls.itMw} MW</small></th>`).join("");
  const rows = pool.map((site) => {
    const env = envFor(site);
    const { gridMax, waterMax } = siteSupplyLimits(site);
    const classCells = aidcClasses.map((cls) => {
      const fit = classFitScore(site, cls);
      return `<td class="${fit.ok ? "ok" : "no"}">${fit.score}<br><small>${fit.ok ? (fit.score >= 75 ? "적합" : "조건부") : fit.bottleneck}</small></td>`;
    }).join("");
    return `<tr>
      <td><b>${site.name}</b><br><small>${site.region}</small></td>
      <td>${getModelScore(site)}</td>
      ${classCells}
      <td>${site.gridReality ? `${site.gridReality.mw50.toLocaleString()} MW · ${site.gridReality.nearestHv.toFixed(1)} km` : "—"}</td>
      <td>~${Math.round(Math.min(gridMax, waterMax))} MW<br><small>${gridMax <= waterMax ? "계통" : "용수"} 병목</small></td>
      <td>${env.waterStress}<br><small>${env.carbonIntensity.toFixed(2)} kg/kWh</small></td>
      <td>${site.kepco ? `${site.kepco.availableMw.toLocaleString()} MW` : "미연동"}</td>
    </tr>`;
  }).join("");
  const recoRows = aidcClasses.map((cls) => {
    const ranked = pool.map((site) => ({ site, fit: classFitScore(site, cls) })).sort((a, b) => b.fit.score - a.fit.score);
    const reco = ranked.find((r) => r.fit.ok);
    return `<tr><td>${cls.label}</td><td>${reco ? `<b>${reco.site.name}</b> · ${reco.fit.score}점 · 공급 ~${Math.round(reco.fit.supply)} MW` : "전제 충족 후보 없음 (계통·용수 보강 필요)"}</td></tr>`;
  }).join("");
  return `
    <h1>GRID / SITING LAB · 후보지 비교 리포트</h1>
    <p class="report-meta">생성일 2026-07-15 · 가중치: ${weightLine} · 시나리오: ${scenarioLine}</p>
    <h2>후보지 × 규모 모델 적합도 (표준구성 N+1 · 하이브리드 · 부하율 80% · PUE 1.25 기준)</h2>
    <table>
      <thead><tr><th>후보지</th><th>적합도</th>${headCells}<th>반경 50 km 발전 · 최근접 345 kV+</th><th>공급 한도</th><th>용수 · 탄소</th><th>한전 접속여유</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <h2>규모 모델별 추천 입지 (전력·용수 충족 + 민원 페널티 &lt; 12 전제)</h2>
    <table><tbody>${recoRows}</tbody></table>
    <p class="report-note">본 리포트는 OpenStreetMap/OpenInfraMap 공개 데이터 스냅샷(2026-07-15)과 탐색용 프록시 가중치로 생성된 초기 스크리닝 자료입니다.
    한전 계통접속 검토, 용수 배분 협의, 토지·인허가, 재해·환경영향평가, 주민 수용성 조사를 대체하지 않습니다.
    재해·정치·균형발전 요인과 민원 페널티는 공개 자료 기반 프록시이며, 한전 접속여유는 data/kepco_capacity.json 연동 시 실데이터로 대체됩니다.</p>
  `;
}

function exportReport() {
  $("#report-view").innerHTML = buildReportHtml();
  document.body.classList.add("printing-report");
  const cleanup = () => document.body.classList.remove("printing-report");
  window.addEventListener("afterprint", cleanup, { once: true });
  window.setTimeout(() => window.print(), 60);
  showToast("브라우저 인쇄 대화상자에서 'PDF로 저장'을 선택하세요");
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
    if (!layer) return; // MEGA 등 data-layer 없는 버튼은 전용 핸들러가 처리
    const wasActive = tool.classList.contains("active");
    tool.classList.toggle("active", !wasActive);
    if (map) toggleLayer(layer);
    else if (layer === "power") $(".fallback-grid").style.opacity = wasActive ? ".18" : "1";
    else if (layer === "plants") showToast("발전원 레이어는 지도 연결 후 표시됩니다");
    else if (layer === "facilities") showToast("시설 레지스트리 레이어는 지도 연결 후 표시됩니다");
    else if (layer === "hazard") showToast("재해 리스크 레이어는 지도 연결 후 표시됩니다");
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
  $("#export-report").addEventListener("click", exportReport);
  $("#mega-p1-btn").addEventListener("click", () => toggleMegaPhase("p1", $("#mega-p1-btn")));
  $("#mega-p2-btn").addEventListener("click", () => toggleMegaPhase("p2", $("#mega-p2-btn")));
  $('[data-mega-toggle]').addEventListener("click", () => {
    const panel = $("#mega-map-options");
    panel.hidden = !panel.hidden;
    $('[data-mega-toggle]').classList.toggle("active", !panel.hidden || megaPhaseState.p1 || megaPhaseState.p2);
  });
  $("#map-mega-p1").addEventListener("click", () => setMegaPhase("p1", !megaPhaseState.p1));
  $("#map-mega-p2").addEventListener("click", () => setMegaPhase("p2", !megaPhaseState.p2));
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
    // 전국 시드 채점은 무거우므로 초기 렌더 후 백그라운드 배치로 수행
    window.setTimeout(() => computeClassRecommendations((seedCount) => {
      renderClassFit();
      computeHyperNewbuild();
      showToast(`규모별 전국 추천 계산 완료 · 시드 ${seedCount}곳 + 초대형 신설 후보 ${hyperNewbuild ? hyperNewbuild.length : 0}곳`);
    }), 600);
  }
});
