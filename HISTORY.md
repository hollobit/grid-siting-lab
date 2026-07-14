# 작업 경과

## 2026-07-15

### OSM 전국 전력망 스냅샷 표출 + 시뮬레이션 연동

- Overpass API에서 대한민국 `power=line` 전체(3,652개 way)와 `power=plant` 전체(4,129개)를 추출.
- ETL 스크립트로 전압급 분류(765/345/154/기타), 좌표 반올림·간격 기반 단순화, `plant:output:electricity` MW 파싱을 수행해 `data/kr_power_lines.json`(721KB)·`data/kr_power_plants.json`(155KB) 정적 스냅샷 생성 (2026-07-15 추출, ODbL).
- 지도 POWER GRID 레이어를 실제 송전선으로 교체: 전압급별 MultiPolyline 4개로 묶어 캔버스 렌더링 성능 확보.
- GENERATION 레이어를 실제 발전소 4,129개로 교체: 발전원별 색상(원자력/석탄/가스/수력/태양광/풍력/ESS), 용량 비례 반지름, 이름·MW·발전원 tooltip.
- 후보지별 반경 50 km 실측 프록시 계산: 매핑 발전용량 MW, 발전소 수, 345 kV+ 최근접 거리·회선 수. 후보지 카드 NEAREST HV와 시나리오 카드 "OSM GRID SNAPSHOT" 스트립에 표출하고, 수요/주변 발전용량 비율을 시뮬레이션과 연동.
- 스냅샷 로드 실패 시 기존 개략도 프록시 라인으로 자동 degrade.

### 시설 레지스트리 · 수자원/환경 · 시뮬레이션 확장

- 시설 레지스트리 추가: lifecycle(operational/construction/planned) × 사업자 유형(hyperscaler/colocation/enterprise/sovereign) 표준화, 시설별 용량·출처·확인일·confidence 표기, 13개 공개 시설 수록. 필터 칩과 지도 FACILITIES 레이어 동기화. 비공개 위치는 프록시 좌표 + CONF LOW로 명시.
- 수자원·환경 확장: 후보지별 취수원·water stress·탄소집약도·재생에너지 비중 프록시, 컨텍스트 8번째 타일(수자원·환경)과 취수원 지도 레이어 추가.
- 시뮬레이션 확장: UTILIZATION(평균 부하율 50–100%), COOLING(공랭/하이브리드/수랭 · WUE 0.10/0.90/1.80 L/kWh) 컨트롤 추가. 연간 용수(m³), 연간 탄소(tCO₂ · 지역 탄소집약도 프록시), 연간 전력비용(억원 · 160원/kWh 프록시) 출력과 water stress 경고 배지 추가.

### 검증 (Playwright)

- Leaflet 지도 + 실데이터 레이어 캔버스 렌더링 확인(전국 형상 시각 검증), 후보지 선택·시나리오 재계산·레지스트리 필터 동작 확인.
- unpkg/타일 차단 상태에서 fallback map 표시와 시뮬레이션 지속 동작 확인.
- 모바일 390px 폭에서 가로 오버플로 없음 확인. 콘솔 오류는 favicon 404뿐이어서 인라인 SVG favicon으로 해결.

### 지도 임의 지점 시뮬레이션 + CAPEX·최대 용량 추정

- 지도에서 후보지 반경 25 km 밖의 도시·임의 지점 클릭 시 사용자 지정 지점을 즉석 분석: OSM 스냅샷 반경 50 km 실측(발전용량·발전소·345 kV+ 최근접/회선)과 정적 레이어 거리 프록시(도시·백본·IDC·대학·공항·위성·취수원)로 요인 점수·적합도·시나리오를 계산. 재해·토지 요인은 미산정 중립값(60)으로 명시. 도시 25 km 이내면 "○○ 인근"으로 라벨링.
- 발전소·변전 허브·시설 마커가 지도 클릭을 흡수하는 문제를 마커 클릭 → 동일 위치 분석으로 연결해 해결.
- CAPEX 개산 추가: 구축비 120억/MW 프록시 × 이중화(N .92 / N+1 1 / N+2 1.12) × 냉각(공랭 1 / 하이브리드 1.04 / 수랭 1.09) × PUE 계수 + 계통 인입비(최근접 345 kV+ 거리 × 25억/km + 변전 2억/MW). 표준구성 대비 증감률 배지(▲/▼)로 CAPEX 증가 여부 표시.
- 최대 가능 IT capacity 추정 추가: 계통 수전 여유 프록시(헤드룸 모델 역산)와 냉각 용수 가용 프록시(WUE·부하율·PUE 반영) 중 병목값. 병목 요인(계통 수전/냉각 용수) 라벨과 현재 IT LOAD 초과 경고.
- Playwright 검증: 평창권 임의 지점(발전 4,530 MW·13.0 km → CAPEX ▲3.8%·최대 ~57 MW), N+2·수랭 전환 시 CAPEX ▲20.5% 반응, 세종 25 km 이내 클릭은 큐레이션 후보로 스냅.

### 철도·고속도로 실측 레이어

- Overpass에서 간선 철도(`railway=rail` usage=main/branch, 13,414 way)와 고속도로(`highway=motorway`) 전체를 추출해 `data/kr_transport.json` 스냅샷 생성 (`etl/compact_transport_data.py`, 400 m 간격 단순화).
- TRANSPORT(도로)·RAIL/AIR(철도) 컨텍스트 레이어의 프록시 축선을 실측 선형으로 교체: 고속도로(주황), 일반 간선철도(회백 얇게), 고속철(밝은 백색 굵게) 구분. 스냅샷 없으면 기존 프록시로 degrade.
- 지도 범례에 RAIL/EXPWY 추가. 임의 지점 채점의 도로·철도 접근성 프록시도 실측 선형 최근접 거리로 전환.

### 배포

- GitHub 저장소 생성 및 GitHub Pages 배포 (아래 README 참조).

## 2026-07-14

### 초기 구현

- 빈 작업공간에서 정적 웹 프로토타입 생성.
- `index.html`, `styles.css`, `app.js`, `package.json`, `README.md` 추가.
- OpenInfraMap South Korea 통계 스냅샷 반영:
  - 발전소 4,089개 / 121,404 MW
  - 전력선 15,176 km
  - 154 kV 9,420 km, 345 kV 4,584 km, 765 kV 557 km
- Leaflet + OpenStreetMap 타일을 사용하고, 타일 로드 실패 시 내장 fallback map이 표시되도록 구성.
- 당진·나주·세종·이천·울산 후보지, 전압급별 전력망, 발전원, 적합도 점수, IT load/PUE/N+1 시나리오를 구현.
- 데이터 출처와 실제 현장 검증 필요성을 화면과 README에 명시.

### 요구사항 확장 반영

- 배후 도시, 도로·교통, 초고속 백본, 클라우드·기존 IDC, 대학·R&D, 철도·공항, 위성통신 회복력을 평가 모델과 지도 컨텍스트 레이어로 확장.
- 후보지별 컨텍스트 점수와 전력/생태계/회복력 우선순위를 조정하는 적합도 가중치 컨트롤 추가.
- 가중치 변경 시 후보지 카드·적합도 링·지도 후보 마커 tooltip의 점수를 함께 갱신하도록 연결.
- Leaflet 지도에서 도시·도로·철도·공항·백본·클라우드/IDC·대학·위성 지상국 프록시 레이어를 개별 또는 전체 토글하도록 구성.
- OpenStreetMap Overpass API를 선택 후보지 반경 50 km 동기화 버튼으로 연결. 변전소·발전소·철도역·공항·대학·데이터센터 태그 개수를 표시하고 실패 시 스냅샷 유지.
- 공공 API 확장 방향을 README에 기록: 전력 접속 여유용량, 교통·철도·공항, 통신 백본, IDC 현황, 위성 무선국, 환경·재해·수자원.
- `Plans.md`에 통합 계획과 검증 체크리스트 추가.
- `AGENTS.md`에 서브에이전트 런타임 부재, 병렬 도구 호출, 역할 분리 및 변경 규칙 기록.

### 검증

- `node --check app.js` 통과.
- `npm run dev`로 Python 정적 서버 실행 확인.
- 권한이 필요한 로컬 포트 확인을 통해 `index.html` HTTP 200 응답 확인.
- 브라우저 자동화 도구가 노출되지 않아 실제 클릭/모바일 렌더링은 정적 로직 검증 상태로 남김.

### 기존 서비스 조사 · AI Data Center Map

- 조사 대상: `https://aidatacentermap.org/map`
- 직접 접속은 BotStopper(Anubis) 접근 제한으로 차단되어, 검색 색인에 노출된 페이지 설명과 통계만 확인함.
- 색인상 US Data Centers 중심이며, 검색·Status 필터·Company Type 필터, 지도에서 영역/시설 클릭, 운영/계획/하이퍼스케일러 분류, 총 전력량 집계가 제공됨.
- 색인 스냅샷에 노출된 지표: Data Centers 4,450, Operating 2,014, Planned 902, Hyperscalers 623, Total Power 110,084.324 MW. 현재 값으로 간주하지 않고 조사 시점 참고값으로만 기록함.
- 외부 소개/검색 색인에는 수자원·대수층·전력망 영향 오버레이와 지역 영향 추정, Ecology Report 유도 흐름도 언급됨.
- 우리 서비스에 반영할 우선순위:
  1. 시설 레이어를 `operational / planned / construction / cancelled / unknown` lifecycle로 분리하고 후보지 분석과 동기화.
  2. 사업자 유형을 `hyperscaler / colocation / sovereign / enterprise / unknown`으로 표준화.
  3. 시설별 `capacity MW`, 출처, 확인일, confidence, facility/campus 관계를 보존하는 registry 모델 추가.
  4. 전력망뿐 아니라 수자원·대수층·지역사회·환경 영향과 AIDC 수요 시나리오를 같은 지도에서 비교.
  5. 모든 시설/수치에 원문 출처와 최신성·불확실성을 표시.
- 직접 연계는 공개 API·이용약관·데이터 라이선스가 확인되기 전에는 보류. 공개 API가 확인되면 서버 캐시/정규화 후 사용하고, 현재는 OpenStreetMap/Overpass 및 공식·사업자 공개 자료를 우선 사용.
