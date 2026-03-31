import { globalCancerDataset, globalKpis } from './data.js';

const formatNumber = (value) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
const formatRate = (value) => value.toFixed(1);

const elements = {
  dataScopeNote: document.querySelector('#data-scope-note'),
  kpiGrid: document.querySelector('#kpi-grid'),
  searchInput: document.querySelector('#search-input'),
  cancerTypeFilter: document.querySelector('#cancer-type-filter'),
  yearFilter: document.querySelector('#year-filter'),
  genderFilter: document.querySelector('#gender-filter'),
  topTenList: document.querySelector('#top-ten-list'),
  countryName: document.querySelector('#country-name'),
  riskPill: document.querySelector('#risk-pill'),
  countryStats: document.querySelector('#country-stats'),
  comparisonStrip: document.querySelector('#comparison-strip'),
  countrySources: document.querySelector('#country-sources'),
  regionTitle: document.querySelector('#region-title'),
  regionEmpty: document.querySelector('#region-empty'),
};

const state = {
  search: '',
  cancerType: 'All cancers',
  year: globalKpis.year,
  gender: 'All',
  selectedIso: globalCancerDataset[0].iso3,
};

function init() {
  elements.dataScopeNote.textContent = `Bundled snapshots focus on the latest official release year in this demo: ${globalKpis.year}.`;
  renderKpis();
  setupFilters();
  bindEvents();
  render();
}

function setupFilters() {
  const cancerTypes = ['All cancers', ...new Set(globalCancerDataset.flatMap((country) => country.topCancerTypes.map((item) => item.type)))];
  elements.cancerTypeFilter.innerHTML = cancerTypes.map((type) => `<option>${type}</option>`).join('');
  elements.yearFilter.innerHTML = `<option value="${globalKpis.year}">${globalKpis.year}</option>`;
}

function bindEvents() {
  elements.searchInput.addEventListener('input', (event) => {
    state.search = event.target.value;
    render();
  });
  elements.cancerTypeFilter.addEventListener('change', (event) => {
    state.cancerType = event.target.value;
    render();
  });
  elements.yearFilter.addEventListener('change', (event) => {
    state.year = Number(event.target.value);
    render();
  });
  elements.genderFilter.addEventListener('change', (event) => {
    state.gender = event.target.value;
    render();
  });
}

function renderKpis() {
  const cards = [
    ['Global cases', formatNumber(globalKpis.totalCases), 'WHO / IARC estimate for 2022'],
    ['Global deaths', formatNumber(globalKpis.totalDeaths), 'WHO / IARC estimate for 2022'],
    ['Highest-risk country', globalKpis.highestRiskCountry, 'Based on mortality-rate band in the bundled data'],
    ['Fastest-growing type', globalKpis.fastestGrowingCancerType, 'Largest increase across 2020–2022 bundled snapshots'],
  ];
  elements.kpiGrid.innerHTML = cards.map(([label, value, helper]) => `
    <article class="card kpi-card">
      <p class="eyebrow">${label}</p>
      <h3>${value}</h3>
      <p class="muted">${helper}</p>
    </article>
  `).join('');
}

function getFilteredCountries() {
  return globalCancerDataset.filter((country) => {
    const matchesSearch = country.country.toLowerCase().includes(state.search.toLowerCase());
    const matchesType = state.cancerType === 'All cancers' || country.topCancerTypes.some((item) => item.type === state.cancerType);
    const matchesYear = country.year === state.year;
    const matchesGender = state.gender === 'All' || ['Breast', 'Prostate', 'Cervix uteri'].includes(state.cancerType) || state.cancerType === 'All cancers';
    return matchesSearch && matchesType && matchesYear && matchesGender;
  });
}

function render() {
  const filtered = getFilteredCountries();
  const selected = filtered.find((item) => item.iso3 === state.selectedIso) || filtered[0] || globalCancerDataset[0];
  state.selectedIso = selected.iso3;
  renderMap(filtered, selected);
  renderTopTen(filtered, selected);
  renderCountryDetails(filtered, selected);
}

function renderMap(filtered, selected) {
  const colorscale = [
    [0, '#0f766e'],
    [0.45, '#ca8a04'],
    [1, '#be123c'],
  ];
  const trace = {
    type: 'choropleth',
    locationmode: 'ISO-3',
    locations: filtered.map((item) => item.iso3),
    z: filtered.map((item) => item.mortalityRate),
    text: filtered.map((item) => `${item.country}<br>Total cancer cases: ${formatNumber(item.totalCases)}<br>Mortality rate: ${formatRate(item.mortalityRate)}<br>Most common cancer: ${item.mostCommonCancer}`),
    hovertemplate: '%{text}<extra></extra>',
    colorscale,
    marker: { line: { color: '#0f172a', width: 0.6 } },
    colorbar: { title: 'Mortality rate', tickfont: { color: '#e2e8f0' }, titlefont: { color: '#e2e8f0' } },
  };

  const selectedTrace = {
    type: 'scattergeo',
    mode: 'markers+text',
    locationmode: 'ISO-3',
    locations: [selected.iso3],
    text: [selected.country],
    textposition: 'top center',
    marker: { size: 10, color: '#fb7185', line: { color: '#fff1f2', width: 1 } },
    hoverinfo: 'skip',
    showlegend: false,
  };

  const layout = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    margin: { l: 0, r: 0, t: 0, b: 0 },
    geo: {
      projection: { type: 'natural earth' },
      bgcolor: 'transparent',
      showframe: false,
      showcoastlines: false,
      landcolor: '#1f2937',
      showcountries: true,
      countrycolor: '#334155',
    },
  };

  Plotly.newPlot('world-map', [trace, selectedTrace], layout, { responsive: true, displayModeBar: false });
  document.getElementById('world-map').on('plotly_click', (event) => {
    const iso = event.points?.[0]?.location;
    if (iso) {
      state.selectedIso = iso;
      render();
    }
  });
}

function renderTopTen(filtered, selected) {
  const topTen = [...filtered].sort((a, b) => b.totalCases - a.totalCases).slice(0, 10);
  elements.topTenList.innerHTML = topTen.map((country) => `
    <li class="${country.iso3 === selected.iso3 ? 'active' : ''}">
      <button type="button" data-iso="${country.iso3}">
        <span>${country.country}</span>
        <strong>${formatNumber(country.totalCases)}</strong>
      </button>
    </li>
  `).join('');
  elements.topTenList.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedIso = button.dataset.iso;
      render();
    });
  });
}

function renderCountryDetails(filtered, selected) {
  const avgMortality = filtered.reduce((sum, item) => sum + item.mortalityRate, 0) / Math.max(filtered.length, 1);
  const avgIncidence = filtered.reduce((sum, item) => sum + item.incidenceRate, 0) / Math.max(filtered.length, 1);

  elements.countryName.textContent = selected.country;
  elements.riskPill.textContent = `${selected.riskLevel} risk`;
  elements.riskPill.className = `pill ${selected.riskLevel.toLowerCase()}`;
  elements.countryStats.innerHTML = [
    ['Total cases', formatNumber(selected.totalCases)],
    ['Deaths', formatNumber(selected.deaths)],
    ['Survival rate', `${selected.survivalRate.toFixed(1)}%`],
    ['Top cancer', selected.mostCommonCancer],
  ].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');

  elements.comparisonStrip.innerHTML = [
    [`Incidence vs global bundle average`, `${selected.incidenceRate.toFixed(1)} / ${avgIncidence.toFixed(1)}`],
    [`Mortality vs global bundle average`, `${selected.mortalityRate.toFixed(1)} / ${avgMortality.toFixed(1)}`],
  ].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');

  elements.countrySources.innerHTML = `<span>Sources</span>${selected.sources.map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a>`).join('')}`;

  Plotly.newPlot('trend-chart', [
    { x: selected.trend.map((item) => item.year), y: selected.trend.map((item) => item.cases), mode: 'lines+markers', name: 'Cases', line: { color: '#f43f5e', width: 3 } },
    { x: selected.trend.map((item) => item.year), y: selected.trend.map((item) => item.deaths), mode: 'lines+markers', name: 'Deaths', line: { color: '#38bdf8', width: 3 } },
  ], chartLayout(), { responsive: true, displayModeBar: false });

  Plotly.newPlot('cancer-type-chart', [{
    labels: selected.topCancerTypes.map((item) => item.type),
    values: selected.topCancerTypes.map((item) => item.share),
    type: 'pie',
    hole: 0.35,
    marker: { colors: ['#f43f5e', '#fb7185', '#fdba74', '#facc15', '#38bdf8'] },
    textinfo: 'label+percent',
  }], { ...chartLayout(), showlegend: false }, { responsive: true, displayModeBar: false });

  if (selected.regions?.length) {
    elements.regionTitle.textContent = 'Bundled official regional snapshot';
    elements.regionEmpty.classList.add('hidden');
    Plotly.newPlot('region-chart', [
      { x: selected.regions.map((item) => item.region), y: selected.regions.map((item) => item.cases), type: 'bar', name: 'Cases', marker: { color: '#f43f5e' } },
      { x: selected.regions.map((item) => item.region), y: selected.regions.map((item) => item.deaths), type: 'bar', name: 'Deaths', marker: { color: '#38bdf8' } },
    ], { ...chartLayout(), barmode: 'group' }, { responsive: true, displayModeBar: false });
  } else {
    elements.regionTitle.textContent = 'No regional drill-down bundled yet';
    elements.regionEmpty.classList.remove('hidden');
    Plotly.purge('region-chart');
    document.getElementById('region-chart').innerHTML = '';
  }
}

function chartLayout() {
  return {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    margin: { l: 40, r: 10, t: 10, b: 40 },
    font: { color: '#e2e8f0' },
    xaxis: { color: '#94a3b8', gridcolor: '#334155' },
    yaxis: { color: '#94a3b8', gridcolor: '#334155' },
    legend: { orientation: 'h', y: 1.1 },
  };
}

init();
