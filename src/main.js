/**
 * LabTrack - Main Controller
 * AiAppFactory Standard
 */
import { CAAStandardsEngine } from './core/caaStandards.js';
import { SLABiologicalSentinel } from './core/slaBiologicalSentinel.js';
import { ExternalReferralEngine } from './core/externalReferralEngine.js';
import { SampleOrderService } from './services/sampleOrderService.js';
import { ProtocolService } from './services/protocolService.js';
import { ExportService } from './services/exportService.js';
import { LabTrackCacheService } from './services/labTrackCache.service.js';
import { WhatsAppLabNotifierService } from './services/whatsAppLabNotifier.service.js';
import { Formatters } from './utils/formatters.js';
import { Sanitizer } from './utils/sanitizer.js';

// Estado de la Aplicacion
const state = {
  activeTab: 'dashboard',
  orders: [],
  protocols: [],
  referrals: [],
  activeOrderId: null,
  activeReferralId: null,
  activeWaOrderId: null,
  lastFocusedElement: null,
  toastTimer: null
};

// Iconos SVG uniformes (stroke 1.75, aria-hidden="true")
function svgIcon(name, extraClass = 'w-4 h-4') {
  const paths = {
    flask: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082" />',
    clock: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />',
    scale: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47" />',
    file: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25" />',
    truck: '<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25" />',
    shield: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />',
    alert: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />',
    check: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />',
    download: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />',
    print: '<path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />',
    chat: '<path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />',
    plus: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />'
  };
  const d = paths[name] || paths.file;
  return `<svg aria-hidden="true" class="${extraClass} shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">${d}</svg>`;
}

function demoBadgeHtml(record) {
  if (!record?.isDemo) return '';
  return '<span class="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/40">[DEMO]</span>';
}

function dictamenVisual(dictamen) {
  const badge = Formatters.dictamenBadge(dictamen);
  let iconName = 'clock';
  if (dictamen === 'APTA') iconName = 'check';
  if (dictamen === 'NO_APTA_BACTERIOLOGICA' || dictamen === 'NO_APTA_FISICOQUIMICA') iconName = 'alert';

  let cls = 'bg-blue-500/15 text-blue-300 border-blue-500/40';
  if (dictamen === 'APTA') cls = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
  if (dictamen === 'NO_APTA_BACTERIOLOGICA') cls = 'bg-rose-500/15 text-rose-300 border-rose-500/40';
  if (dictamen === 'NO_APTA_FISICOQUIMICA') cls = 'bg-amber-500/15 text-amber-300 border-amber-500/40';

  return { label: badge.label, cls, iconName };
}

function showToast(message, variant = 'info') {
  const region = document.getElementById('app-toast-region');
  if (!region) return;

  if (state.toastTimer) {
    clearTimeout(state.toastTimer);
  }

  let styles = 'bg-[#111827] border-blue-500/50 text-blue-200';
  let icon = 'shield';
  if (variant === 'success') {
    styles = 'bg-[#111827] border-emerald-500/50 text-emerald-200';
    icon = 'check';
  } else if (variant === 'error') {
    styles = 'bg-[#111827] border-rose-500/50 text-rose-200';
    icon = 'alert';
  }

  region.setAttribute('role', variant === 'error' ? 'alert' : 'status');
  region.className = `no-print mb-4 p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${styles}`;
  Sanitizer.safeSetInnerHTML(region, `
    <div class="flex items-center gap-2.5">
      ${svgIcon(icon, 'w-4 h-4')}
      <span>${Sanitizer.escapeHTML(message)}</span>
    </div>
    <button type="button" id="btn-dismiss-toast" aria-label="Cerrar aviso" class="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-300">
      <svg aria-hidden="true" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
  `);
  region.classList.remove('hidden');

  document.getElementById('btn-dismiss-toast')?.addEventListener('click', () => {
    region.classList.add('hidden');
  });

  state.toastTimer = setTimeout(() => {
    region.classList.add('hidden');
  }, 6000);
}

function setFormError(elementId, message) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (!message) {
    el.textContent = '';
    el.classList.add('hidden');
  } else {
    el.textContent = message;
    el.classList.remove('hidden');
  }
}

// Datos Demo Iniciales (Solo si no fueron purgados)
function initializeDemoData() {
  if (LabTrackCacheService.isPurged()) {
    state.orders = [];
    state.protocols = [];
    state.referrals = [];
    return;
  }

  try {
    const cachedOrders = LabTrackCacheService.getOrders();
    const cachedProtocols = LabTrackCacheService.getProtocols();
    const cachedReferrals = LabTrackCacheService.getReferrals();

    if (cachedOrders.length > 0 || cachedProtocols.length > 0 || cachedReferrals.length > 0) {
      state.orders = cachedOrders;
      state.protocols = cachedProtocols;
      state.referrals = cachedReferrals;
      return;
    }

    // Semilla inicial representativa de laboratorio bromatologico marcada como [DEMO]
    const order1 = SampleOrderService.createOrder({
      clientId: 'CLI-FRIGO-01',
      clientName: 'Frigorífico Bovino del Litoral S.A.',
      clientPhone: '',
      facilityAddress: 'Ruta 11 Km 342, Diamante, Entre Ríos',
      samplingPointName: 'Boca de Pozo N° 1 - Sala de Desposte',
      samplerName: 'Lic. Tomás Valenzuela',
      samplerLicense: 'COL-BQ-4821',
      requestedTypes: ['MICROBIOLOGY', 'PHYSICOCHEMICAL', 'METALS'],
      isDemo: true
    });

    const sampledOrder1 = SampleOrderService.recordInSituSampling(order1, {
      coolerTempC: 3.8,
      ph: 7.2,
      freeChlorinePpm: 0.35,
      ambientTempC: 22.0,
      sealNumber: 'PREC-INV-99482',
      operatorSignature: 'Lic. Tomás Valenzuela (DEMO)',
      clientSignature: 'Jefatura Planta Litoral (DEMO)'
    });

    const protocol1 = ProtocolService.issueProtocol(sampledOrder1, {
      turbidez: 1.1,
      ph: 7.3,
      tds: 410,
      durezaTotal: 175,
      nitratos: 14.0,
      nitritos: 0.01,
      arsenico: 0.01,
      mesofilas: 20,
      coliformesTotales: 0,
      escherichiaColi: false,
      pseudomonasAeruginosa: false
    }, {
      name: 'Dra. Silvina Fontana',
      license: 'MP-BIOQ-10492',
      signatureData: 'Dra. Silvina Fontana (DEMO)'
    });

    const referral1 = ExternalReferralEngine.createReferral({
      orderId: sampledOrder1.orderId,
      sampleCode: `${sampledOrder1.orderId}-METALS-3`,
      destLabName: 'Laboratorio Central de Espectrometría S.A.',
      testRequested: 'Cuantificación de Arsénico y Plomo por ICP-MS',
      slaDays: 5,
      isDemo: true
    });

    state.orders = [sampledOrder1];
    state.protocols = [protocol1];
    state.referrals = [referral1];

    LabTrackCacheService.saveOrders(state.orders);
    LabTrackCacheService.saveProtocols(state.protocols);
    LabTrackCacheService.saveReferrals(state.referrals);
  } catch (err) {
    state.orders = [];
    state.protocols = [];
    state.referrals = [];
    showToast(err.message || 'Error al inicializar los datos locales.', 'error');
  }
}

// Renderizadores de Vistas
function renderDashboard() {
  const container = document.getElementById('view-container');
  if (!container) return;

  const totalOrders = state.orders.length;
  const certifiedProtocols = state.protocols.length;
  const pendingBiological = state.orders.filter(o => o.status === 'SAMPLED_IN_SITU').length;
  const activeReferrals = state.referrals.filter(r => r.status !== 'RESULTS_RECEIVED').length;
  const verifiedOrdersCount = state.orders.filter(o => SampleOrderService.verifyOrderIntegrity(o)).length;

  const html = `
    <div class="space-y-6">
      <!-- KPIs Superiores -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-[#111827] p-5 rounded-2xl border border-slate-800">
          <p class="text-xs uppercase tracking-wider text-slate-300 font-bold">Muestreos Registrados</p>
          <p class="text-3xl font-bold text-blue-400 mt-2 tabular-nums">${totalOrders}</p>
          <p class="text-xs text-slate-400 mt-1">Con Precinto y Cadena de Custodia</p>
        </div>
        <div class="bg-[#111827] p-5 rounded-2xl border border-slate-800">
          <p class="text-xs uppercase tracking-wider text-slate-300 font-bold">Protocolos Certificados</p>
          <p class="text-3xl font-bold text-emerald-400 mt-2 tabular-nums">${certifiedProtocols}</p>
          <p class="text-xs text-slate-400 mt-1">Dictamen CAA Art. 982 Inmutable</p>
        </div>
        <div class="bg-[#111827] p-5 rounded-2xl border border-slate-800">
          <p class="text-xs uppercase tracking-wider text-slate-300 font-bold">SLA Biológico en Curso</p>
          <p class="text-3xl font-bold text-amber-400 mt-2 tabular-nums">${pendingBiological}</p>
          <p class="text-xs text-slate-400 mt-1">Ventana &lt; 24h para Siembra en Estufa</p>
        </div>
        <div class="bg-[#111827] p-5 rounded-2xl border border-slate-800">
          <p class="text-xs uppercase tracking-wider text-slate-300 font-bold">Derivaciones Externas</p>
          <p class="text-3xl font-bold text-slate-100 mt-2 tabular-nums">${activeReferrals}</p>
          <p class="text-xs text-slate-400 mt-1">ICP-MS / Cromatografía con SLA</p>
        </div>
      </div>

      <!-- Accesos Rapidos -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-[#111827] p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-base text-white font-bold flex items-center gap-2">
              ${svgIcon('flask', 'w-4 h-4 text-blue-400')}
              <span>Nuevo Muestreo</span>
            </h2>
            <p class="text-xs text-slate-400 mt-1">Generar acta in-situ con kit multi-frasco y precinto.</p>
          </div>
          <button type="button" id="btn-quick-new-sample" class="min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs whitespace-nowrap transition-colors">
            + Tomar Muestra
          </button>
        </div>
        <div class="bg-[#111827] p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-base text-white font-bold flex items-center gap-2">
              ${svgIcon('clock', 'w-4 h-4 text-amber-400')}
              <span>Semáforo SLA 24h</span>
            </h2>
            <p class="text-xs text-slate-400 mt-1">Control de viabilidad térmica y horas antes del vencimiento.</p>
          </div>
          <button type="button" data-tab="sla-countdown" class="nav-trigger min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-xs whitespace-nowrap transition-colors">
            Ver Semáforo
          </button>
        </div>
        <div class="bg-[#111827] p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-base text-white font-bold flex items-center gap-2">
              ${svgIcon('scale', 'w-4 h-4 text-emerald-400')}
              <span>Evaluador CAA</span>
            </h2>
            <p class="text-xs text-slate-400 mt-1">Auditar resultados frente al Código Alimentario Art. 982.</p>
          </div>
          <button type="button" data-tab="caa-evaluator" class="nav-trigger min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-xs whitespace-nowrap transition-colors">
            Evaluar Agua
          </button>
        </div>
      </div>

      <!-- Tabla de Ultimos Muestreos -->
      <section class="bg-[#111827] p-6 rounded-2xl border border-slate-800">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 class="text-xl font-bold text-white">Muestreos con Cadena de Custodia Activa</h2>
          <span class="text-xs px-3 py-1 rounded-lg border font-mono ${verifiedOrdersCount === totalOrders && totalOrders > 0 ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' : 'bg-[#0d1322] text-slate-300 border-slate-700'}">
            Integridad SHA-256: ${verifiedOrdersCount}/${totalOrders} Actas
          </span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-200">
            <thead class="bg-[#0d1322] text-slate-300 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th scope="col" class="py-3 px-3">Código</th>
                <th scope="col" class="py-3 px-3">Cliente / Establecimiento</th>
                <th scope="col" class="py-3 px-3">Punto de Muestra</th>
                <th scope="col" class="py-3 px-3">Precinto</th>
                <th scope="col" class="py-3 px-3">Temp In-Situ</th>
                <th scope="col" class="py-3 px-3">Cloro DPD</th>
                <th scope="col" class="py-3 px-3">Estado</th>
                <th scope="col" class="py-3 px-3">Sello SHA-256</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              ${state.orders.length === 0 ? `
                <tr>
                  <td colspan="8" class="py-8 px-4 text-center text-slate-300">
                    <p class="mb-3">No hay muestras registradas todavía.</p>
                    <button type="button" id="btn-dashboard-empty-new-sample" class="min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors">
                      Iniciar Primer Muestreo In-Situ
                    </button>
                  </td>
                </tr>
              ` : state.orders.map(o => {
                const isSealValid = SampleOrderService.verifyOrderIntegrity(o);
                return `
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-3 font-mono text-blue-400 font-bold">
                      <div class="flex flex-wrap items-center gap-1.5">
                        <span>${Sanitizer.escapeHTML(o.orderId)}</span>
                        ${demoBadgeHtml(o)}
                      </div>
                    </td>
                    <td class="py-3 px-3 font-semibold text-white">${Sanitizer.escapeHTML(o.clientName)}</td>
                    <td class="py-3 px-3 text-slate-300">${Sanitizer.escapeHTML(o.samplingPointName)}</td>
                    <td class="py-3 px-3 font-mono text-amber-300">${Sanitizer.escapeHTML(o.securitySeal?.sealNumber || '-')}</td>
                    <td class="py-3 px-3 tabular-nums">${Formatters.temperature(o.inSituMeasurements?.coolerTempC)}</td>
                    <td class="py-3 px-3 font-mono tabular-nums">${Formatters.ppm(o.inSituMeasurements?.freeChlorinePpm)}</td>
                    <td class="py-3 px-3">
                      <span class="px-2 py-1 rounded text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">${Sanitizer.escapeHTML(o.status)}</span>
                    </td>
                    <td class="py-3 px-3 font-mono text-xs ${isSealValid ? 'text-emerald-300' : 'text-rose-300'}" title="${Sanitizer.escapeHTML(o.cryptoSeal || '')}">
                      <span class="inline-flex items-center gap-1.5">
                        ${svgIcon(isSealValid ? 'shield' : 'alert', 'w-3.5 h-3.5')}
                        <span>${o.cryptoSeal ? (isSealValid ? o.cryptoSeal.slice(0, 10) + '...' : 'Alterado') : 'Sin sello'}</span>
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;

  Sanitizer.safeSetInnerHTML(container, html);
  attachDashboardEvents();
}

function attachDashboardEvents() {
  document.getElementById('btn-quick-new-sample')?.addEventListener('click', () => {
    switchTab('samples');
    openSampleModal();
  });

  document.getElementById('btn-dashboard-empty-new-sample')?.addEventListener('click', () => {
    switchTab('samples');
    openSampleModal();
  });

  document.querySelectorAll('.nav-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });
  });
}

function renderSamples() {
  const container = document.getElementById('view-container');
  if (!container) return;

  const emptyStateHtml = `
    <div class="bg-[#111827] border border-slate-800 rounded-2xl p-8 text-center space-y-4">
      <div class="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto">
        ${svgIcon('flask', 'w-6 h-6')}
      </div>
      <div class="space-y-1 max-w-md mx-auto">
        <h3 class="text-base font-bold text-white">No hay actas de muestreo registradas</h3>
        <p class="text-xs text-slate-300">
          ${LabTrackCacheService.isPurged()
            ? 'Los datos de ejemplo fueron purgados. Inicie una nueva acta de muestreo in-situ para comenzar la cadena de custodia.'
            : 'Registre el primer muestreo con precinto inviolable, cloro DPD in-situ y doble firma ePOD.'}
        </p>
      </div>
      <button type="button" id="btn-empty-new-sample" class="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-2 transition-colors">
        ${svgIcon('plus', 'w-4 h-4')}
        <span>Iniciar Primer Muestreo In-Situ</span>
      </button>
    </div>
  `;

  const html = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            ${svgIcon('flask', 'w-5 h-5 text-blue-400')}
            <span>Actas de Muestreo y Cadena de Custodia</span>
          </h2>
          <p class="text-xs text-slate-300 mt-1">Registro in-situ con mediciones volátiles (cloro DPD, pH), precinto numerado y doble firma ePOD.</p>
        </div>
        <button type="button" id="btn-open-sample-modal" class="min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors">
          ${svgIcon('plus', 'w-4 h-4')}
          <span>Iniciar Nuevo Muestreo</span>
        </button>
      </div>

      ${state.orders.length === 0 ? emptyStateHtml : `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${state.orders.map(o => {
            const isSealValid = SampleOrderService.verifyOrderIntegrity(o);
            return `
              <article class="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-4">
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/15 text-blue-300 font-mono">${Sanitizer.escapeHTML(o.orderId)}</span>
                      ${demoBadgeHtml(o)}
                    </div>
                    <h3 class="text-base font-bold text-white mt-1.5">${Sanitizer.escapeHTML(o.clientName)}</h3>
                    <p class="text-xs text-slate-300">${Sanitizer.escapeHTML(o.samplingPointName)}</p>
                    <p class="text-xs text-slate-400 mt-0.5">${Sanitizer.escapeHTML(o.facilityAddress || '-')}</p>
                  </div>
                  <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0d1322] text-slate-200 font-mono">
                    ${Sanitizer.escapeHTML(o.status)}
                  </span>
                </div>

                <!-- Mediciones In-Situ (superficie plana sin borde anidado) -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#0d1322] rounded-xl text-xs sm:text-center">
                  <div>
                    <p class="text-xs text-slate-400 uppercase">Temp Conservadora</p>
                    <p class="font-bold text-white mt-0.5 tabular-nums">${Formatters.temperature(o.inSituMeasurements?.coolerTempC)}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400 uppercase">Cloro Libre DPD</p>
                    <p class="font-bold text-amber-300 mt-0.5 font-mono tabular-nums">${Formatters.ppm(o.inSituMeasurements?.freeChlorinePpm)}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400 uppercase">pH In-Situ</p>
                    <p class="font-bold text-emerald-300 mt-0.5 tabular-nums">${Sanitizer.escapeHTML(o.inSituMeasurements?.ph ?? '-')}</p>
                  </div>
                </div>

                <!-- Precinto y Frascos -->
                <div class="text-xs text-slate-300 space-y-1.5 border-t border-slate-800 pt-3">
                  <div class="flex justify-between gap-2">
                    <span class="text-slate-400">Precinto de Seguridad:</span>
                    <span class="font-mono text-white font-bold">${Sanitizer.escapeHTML(o.securitySeal?.sealNumber || '-')}</span>
                  </div>
                  <div class="flex justify-between gap-2">
                    <span class="text-slate-400">Kit Multi-Frasco:</span>
                    <span class="text-slate-200">${o.kit?.bottlesCount || 0} recipientes rotulados</span>
                  </div>
                  <div class="flex justify-between gap-2">
                    <span class="text-slate-400">Muestreador:</span>
                    <span class="text-slate-200">${Sanitizer.escapeHTML(o.samplerName)} (${Sanitizer.escapeHTML(o.samplerLicense || '-')})</span>
                  </div>
                  <div class="flex justify-between gap-2">
                    <span class="text-slate-400">Fecha Toma:</span>
                    <span class="text-slate-200 font-mono">${Formatters.date(o.samplingTimestamp)}</span>
                  </div>
                </div>

                <!-- Sello Forense SHA-256 -->
                <div class="pt-3 border-t border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between gap-2">
                  <span class="truncate">Sello: ${o.cryptoSeal ? Sanitizer.escapeHTML(o.cryptoSeal.slice(0, 24)) + '...' : 'Pendiente'}</span>
                  <span class="${isSealValid ? 'text-emerald-300' : 'text-rose-300'} font-bold shrink-0">
                    ${isSealValid ? 'Íntegro' : 'Verificar'}
                  </span>
                </div>

                <!-- Acciones -->
                <div class="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <button type="button" data-order-id="${Sanitizer.escapeHTML(o.orderId)}" class="btn-certify-order flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors">
                    ${svgIcon('file', 'w-4 h-4')}
                    <span>Emitir Protocolo CAA</span>
                  </button>
                  <button type="button" data-order-id="${Sanitizer.escapeHTML(o.orderId)}" aria-label="Notificar muestra ${Sanitizer.escapeHTML(o.orderId)} por WhatsApp" class="btn-notify-wa min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                    ${svgIcon('chat', 'w-4 h-4')}
                    <span>WA</span>
                  </button>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;

  Sanitizer.safeSetInnerHTML(container, html);
  attachSamplesEvents();
}

function attachSamplesEvents() {
  document.getElementById('btn-open-sample-modal')?.addEventListener('click', () => {
    openSampleModal();
  });
  document.getElementById('btn-empty-new-sample')?.addEventListener('click', () => {
    openSampleModal();
  });

  document.querySelectorAll('.btn-certify-order').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const orderId = e.currentTarget.getAttribute('data-order-id');
      const order = state.orders.find(o => o.orderId === orderId);
      if (order) openProtocolModal(order);
    });
  });

  document.querySelectorAll('.btn-notify-wa').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const orderId = e.currentTarget.getAttribute('data-order-id');
      const order = state.orders.find(o => o.orderId === orderId);
      if (!order) return;

      if (order.clientPhone && order.clientPhone.replace(/\D/g, '').length >= 8) {
        const url = WhatsAppLabNotifierService.notifySampleIngress({
          phone: order.clientPhone,
          clientName: order.clientName,
          sampleCode: order.orderId,
          samplingPoint: order.samplingPointName,
          sealNumber: order.securitySeal?.sealNumber
        });
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        openWhatsAppModal(order);
      }
    });
  });
}

function renderSLACountdown() {
  const container = document.getElementById('view-container');
  if (!container) return;

  const emptyStateHtml = `
    <div class="bg-[#111827] border border-slate-800 rounded-2xl p-8 text-center space-y-4">
      <div class="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto">
        ${svgIcon('clock', 'w-6 h-6')}
      </div>
      <div class="space-y-1 max-w-md mx-auto">
        <h3 class="text-base font-bold text-white">Sin muestras activas para monitoreo de SLA</h3>
        <p class="text-xs text-slate-300">Inicie un muestreo in-situ para activar la cuenta regresiva biológica de 24 horas y el control de cadena de frío.</p>
      </div>
      <button type="button" id="btn-sla-empty-new-sample" class="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-2 transition-colors">
        ${svgIcon('plus', 'w-4 h-4')}
        <span>Ir a Muestreos</span>
      </button>
    </div>
  `;

  const html = `
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          ${svgIcon('clock', 'w-5 h-5 text-amber-400')}
          <span>Semáforo Biológico y SLA de Siembra en Estufa</span>
        </h2>
        <p class="text-xs text-slate-300 mt-1">Control estricto de la ventana máxima de 24 horas a 4 °C ± 2 °C entre la toma de agua y la inoculación en agar.</p>
      </div>

      ${state.orders.length === 0 ? emptyStateHtml : `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${state.orders.map(o => {
            const sla = SLABiologicalSentinel.evaluateViability(o.samplingTimestamp, o.inSituMeasurements?.coolerTempC);
            const isWarning = sla.status === 'WARNING';
            const isCritical = sla.status === 'CRITICAL';
            const isExpired = sla.status === 'EXPIRED';

            let statusBg = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
            let statusLabel = 'ÓPTIMO / VIABLE';
            if (isWarning) {
              statusBg = 'bg-amber-500/15 text-amber-300 border-amber-500/40';
              statusLabel = 'ATENCIÓN / > 16 HORAS';
            } else if (isCritical) {
              statusBg = 'bg-rose-500/15 text-rose-300 border-rose-500/40';
              statusLabel = 'CRÍTICO / < 2 HORAS';
            } else if (isExpired) {
              statusBg = 'bg-rose-500/20 text-rose-200 border-rose-500/50';
              statusLabel = 'VENCIDO / DESCARTAR';
            }

            return `
              <article class="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-4">
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/15 text-blue-300 font-mono">${Sanitizer.escapeHTML(o.orderId)}</span>
                      ${demoBadgeHtml(o)}
                    </div>
                    <h3 class="text-base font-bold text-white mt-1.5">${Sanitizer.escapeHTML(o.clientName)}</h3>
                    <p class="text-xs text-slate-300">${Sanitizer.escapeHTML(o.samplingPointName)}</p>
                  </div>
                  <span class="px-3 py-1 rounded-xl text-xs font-bold border ${statusBg}">
                    ${statusLabel}
                  </span>
                </div>

                <!-- Contador de Horas (superficie plana) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#0d1322] rounded-xl text-center">
                  <div>
                    <p class="text-xs text-slate-400 uppercase">Tiempo Transcurrido</p>
                    <p class="text-2xl font-bold text-white mt-1 tabular-nums">${sla.hoursElapsed} h</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400 uppercase">Tiempo Restante</p>
                    <p class="text-2xl font-bold ${sla.hoursRemaining < 4 ? 'text-rose-300' : 'text-emerald-300'} mt-1 tabular-nums">${sla.hoursRemaining} h</p>
                  </div>
                </div>

                <!-- Alerta Termica -->
                ${sla.thermalAlert ? `
                  <div class="pt-3 border-t border-slate-800 text-xs text-rose-300 flex items-start gap-2">
                    ${svgIcon('alert', 'w-4 h-4 shrink-0 mt-0.5')}
                    <span><strong>Desvío Térmico en Conservadora:</strong> ${Sanitizer.escapeHTML(sla.thermalReason)}</span>
                  </div>
                ` : `
                  <div class="pt-3 border-t border-slate-800 text-xs text-emerald-300 flex items-center justify-between">
                    <span>Cadena de Frío Preservada:</span>
                    <span class="font-bold font-mono tabular-nums">${Formatters.temperature(o.inSituMeasurements?.coolerTempC)}</span>
                  </div>
                `}

                <p class="text-xs text-slate-400">
                  Límite normativo IRAM/Standard Methods: máximo 24 horas entre toma y siembra en placa petri a 37 °C.
                </p>
              </article>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;

  Sanitizer.safeSetInnerHTML(container, html);
  document.getElementById('btn-sla-empty-new-sample')?.addEventListener('click', () => {
    switchTab('samples');
  });
}

function renderCAAEvaluator() {
  const container = document.getElementById('view-container');
  if (!container) return;

  const html = `
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          ${svgIcon('scale', 'w-5 h-5 text-blue-400')}
          <span>Evaluador Normativo: Código Alimentario Argentino (Art. 982)</span>
        </h2>
        <p class="text-xs text-slate-300 mt-1">Cálculo institucional automático de límites máximos tolerables para agua de consumo humano.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Formulario de Simulacion -->
        <div class="lg:col-span-2 bg-[#111827] p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 class="text-base font-bold text-white">Carga Rápida de Determinaciones Analíticas</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label for="input-turbidez" class="block text-slate-300 font-medium mb-1">Turbidez (Máx 3.0 NTU)</label>
              <input type="number" id="input-turbidez" step="0.1" value="1.2" class="w-full min-h-[44px] bg-[#0a0e17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono tabular-nums">
            </div>
            <div>
              <label for="input-ph" class="block text-slate-300 font-medium mb-1">pH (Rango 6.5 - 8.5)</label>
              <input type="number" id="input-ph" step="0.1" value="7.4" class="w-full min-h-[44px] bg-[#0a0e17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono tabular-nums">
            </div>
            <div>
              <label for="input-nitratos" class="block text-slate-300 font-medium mb-1">Nitratos (Máx 45 mg/l)</label>
              <input type="number" id="input-nitratos" step="0.5" value="14.0" class="w-full min-h-[44px] bg-[#0a0e17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono tabular-nums">
            </div>
            <div>
              <label for="input-arsenico" class="block text-slate-300 font-medium mb-1">Arsénico (Máx 0.05 mg/l)</label>
              <input type="number" id="input-arsenico" step="0.001" value="0.010" class="w-full min-h-[44px] bg-[#0a0e17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono tabular-nums">
            </div>
            <div>
              <label for="input-dureza" class="block text-slate-300 font-medium mb-1">Dureza Total (Máx 400 mg/l CaCO3)</label>
              <input type="number" id="input-dureza" step="5" value="180" class="w-full min-h-[44px] bg-[#0a0e17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono tabular-nums">
            </div>
            <div>
              <label for="input-coliformes" class="block text-slate-300 font-medium mb-1">Coliformes Totales (&lt; 3 NMP/100ml)</label>
              <input type="number" id="input-coliformes" step="1" value="0" class="w-full min-h-[44px] bg-[#0a0e17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono tabular-nums">
            </div>
          </div>

          <!-- Patogenos Criticos (sin bordes anidados) -->
          <div class="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <label for="check-ecoli" class="min-h-[44px] flex items-center gap-3 p-3 bg-[#0d1322] rounded-xl cursor-pointer">
              <input type="checkbox" id="check-ecoli" class="w-4 h-4 rounded bg-[#0a0e17] border-slate-600 text-rose-500">
              <span class="text-slate-200">Presencia de <strong>Escherichia coli</strong> (Criterio Invalida)</span>
            </label>
            <label for="check-pseudo" class="min-h-[44px] flex items-center gap-3 p-3 bg-[#0d1322] rounded-xl cursor-pointer">
              <input type="checkbox" id="check-pseudo" class="w-4 h-4 rounded bg-[#0a0e17] border-slate-600 text-rose-500">
              <span class="text-slate-200">Presencia de <strong>Pseudomonas aeruginosa</strong></span>
            </label>
          </div>

          <button type="button" id="btn-eval-caa" class="w-full min-h-[44px] py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors">
            Evaluar Dictamen Oficial
          </button>
        </div>

        <!-- Panel de Dictamen en Vivo -->
        <div id="eval-result-panel" class="bg-[#111827] p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <span class="text-xs uppercase font-bold text-slate-400">Dictamen Institucional</span>
            <div id="dictamen-badge-container" class="mt-2 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-center font-bold text-sm">
              AGUA APTA PARA CONSUMO (CAA Art. 982)
            </div>
            <p id="dictamen-summary" class="text-xs text-slate-200 mt-4 leading-relaxed">
              La muestra analizada CUMPLE con todas las especificaciones de calidad bacteriológica y fisicoquímica del Código Alimentario Argentino.
            </p>
          </div>

          <div id="deviations-list" class="mt-4 pt-4 border-t border-slate-800 text-xs space-y-2">
            <p class="text-xs uppercase text-slate-400 font-bold">Desvíos Detectados: 0</p>
          </div>
        </div>
      </div>
    </div>
  `;

  Sanitizer.safeSetInnerHTML(container, html);
  attachCAAEvaluatorEvents();
}

function attachCAAEvaluatorEvents() {
  const evaluate = () => {
    const turbidez = parseFloat(document.getElementById('input-turbidez')?.value) || 0;
    const ph = parseFloat(document.getElementById('input-ph')?.value) || 7.0;
    const nitratos = parseFloat(document.getElementById('input-nitratos')?.value) || 0;
    const arsenico = parseFloat(document.getElementById('input-arsenico')?.value) || 0;
    const durezaTotal = parseFloat(document.getElementById('input-dureza')?.value) || 0;
    const coliformesTotales = parseInt(document.getElementById('input-coliformes')?.value, 10) || 0;
    const escherichiaColi = document.getElementById('check-ecoli')?.checked || false;
    const pseudomonasAeruginosa = document.getElementById('check-pseudo')?.checked || false;

    const evaluation = CAAStandardsEngine.evaluateWaterSample({
      turbidez,
      ph,
      nitratos,
      arsenico,
      durezaTotal,
      coliformesTotales,
      escherichiaColi,
      pseudomonasAeruginosa
    });

    const visual = dictamenVisual(evaluation.dictamen);
    const badgeEl = document.getElementById('dictamen-badge-container');
    const summaryEl = document.getElementById('dictamen-summary');
    const deviationsEl = document.getElementById('deviations-list');

    if (badgeEl) {
      badgeEl.className = `mt-2 p-4 rounded-xl border text-center font-bold text-sm flex items-center justify-center gap-2 ${visual.cls}`;
      Sanitizer.safeSetInnerHTML(badgeEl, `${svgIcon(visual.iconName, 'w-4 h-4')}<span>${Sanitizer.escapeHTML(visual.label)}</span>`);
    }
    if (summaryEl) {
      summaryEl.textContent = evaluation.summary;
    }
    if (deviationsEl) {
      if (evaluation.deviations.length === 0) {
        Sanitizer.safeSetInnerHTML(deviationsEl, '<p class="text-xs uppercase text-emerald-300 font-bold">Cero Desvíos Normativos</p>');
      } else {
        const devHtml = `
          <p class="text-xs uppercase text-rose-300 font-bold">Desvíos Detectados: ${evaluation.deviations.length}</p>
          <div class="space-y-1.5 mt-2">
            ${evaluation.deviations.map(d => `
              <div class="p-2.5 bg-[#0d1322] rounded-lg text-xs text-rose-200 flex flex-wrap justify-between gap-2">
                <span><strong>${Sanitizer.escapeHTML(d.name)}:</strong> ${Sanitizer.escapeHTML(d.found)}</span>
                <span class="text-rose-300 font-mono">Límite: ${Sanitizer.escapeHTML(d.limit)}</span>
              </div>
            `).join('')}
          </div>
        `;
        Sanitizer.safeSetInnerHTML(deviationsEl, devHtml);
      }
    }
  };

  document.getElementById('btn-eval-caa')?.addEventListener('click', evaluate);
  document.querySelectorAll('#view-container input').forEach(input => {
    input.addEventListener('input', evaluate);
    input.addEventListener('change', evaluate);
  });
}

function renderProtocols() {
  const container = document.getElementById('view-container');
  if (!container) return;

  const html = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            ${svgIcon('file', 'w-5 h-5 text-emerald-400')}
            <span>Protocolos Analíticos Oficiales</span>
          </h2>
          <p class="text-xs text-slate-300 mt-1">Certificados emitidos con firma digital del Director Técnico y Sello Criptográfico SHA-256.</p>
        </div>
        <button type="button" id="btn-export-protocols-csv" class="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-colors">
          ${svgIcon('download', 'w-4 h-4')}
          <span>Exportar CSV (Excel)</span>
        </button>
      </div>

      <!-- Tabla de Protocolos -->
      <div class="bg-[#111827] p-6 rounded-2xl border border-slate-800 overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-200">
          <thead class="bg-[#0d1322] text-slate-300 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th scope="col" class="py-3 px-3">Protocolo N°</th>
              <th scope="col" class="py-3 px-3">Cliente</th>
              <th scope="col" class="py-3 px-3">Punto de Muestra</th>
              <th scope="col" class="py-3 px-3">Fecha Emisión</th>
              <th scope="col" class="py-3 px-3">Dictamen CAA</th>
              <th scope="col" class="py-3 px-3">Director Técnico</th>
              <th scope="col" class="py-3 px-3">Sello SHA-256</th>
              <th scope="col" class="py-3 px-3">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            ${state.protocols.length === 0 ? `
              <tr>
                <td colspan="8" class="py-8 px-4 text-center text-slate-300">
                  <p class="mb-3">No hay protocolos emitidos aún.</p>
                  <button type="button" id="btn-protocols-empty-go-samples" class="min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors">
                    Ir a Muestreos para Certificar
                  </button>
                </td>
              </tr>
            ` : state.protocols.map(p => {
              const visual = dictamenVisual(p.evaluation?.dictamen);
              const isAuthentic = ProtocolService.verifyProtocolAuthenticity(p);
              return `
                <tr class="hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-3 font-mono text-emerald-300 font-bold">
                    <div class="flex flex-wrap items-center gap-1.5">
                      <span>${Sanitizer.escapeHTML(p.protocolId)}</span>
                      ${demoBadgeHtml(p)}
                    </div>
                  </td>
                  <td class="py-3 px-3 font-semibold text-white">${Sanitizer.escapeHTML(p.clientName)}</td>
                  <td class="py-3 px-3 text-slate-300">${Sanitizer.escapeHTML(p.samplingPointName)}</td>
                  <td class="py-3 px-3 font-mono text-xs tabular-nums">${Formatters.date(p.issuedAt)}</td>
                  <td class="py-3 px-3">
                    <span class="px-2 py-1 rounded text-xs font-bold border inline-flex items-center gap-1 ${visual.cls}">
                      ${svgIcon(visual.iconName, 'w-3.5 h-3.5')}
                      <span>${Sanitizer.escapeHTML(p.evaluation?.dictamen || '-')}</span>
                    </span>
                  </td>
                  <td class="py-3 px-3">${Sanitizer.escapeHTML(p.technicalDirector?.name || '-')}</td>
                  <td class="py-3 px-3 font-mono text-xs ${isAuthentic ? 'text-emerald-300' : 'text-rose-300'}" title="${Sanitizer.escapeHTML(p.protocolCryptoSeal || '')}">
                    ${p.protocolCryptoSeal ? (isAuthentic ? Sanitizer.escapeHTML(p.protocolCryptoSeal.slice(0, 10)) + '...' : 'Alterado') : '-'}
                  </td>
                  <td class="py-3 px-3">
                    <button type="button" data-protocol-id="${Sanitizer.escapeHTML(p.protocolId)}" class="btn-view-protocol min-h-[44px] px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold whitespace-nowrap transition-colors">
                      Ver Protocolo
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  Sanitizer.safeSetInnerHTML(container, html);
  attachProtocolsEvents();
}

function attachProtocolsEvents() {
  document.getElementById('btn-protocols-empty-go-samples')?.addEventListener('click', () => {
    switchTab('samples');
  });

  document.getElementById('btn-export-protocols-csv')?.addEventListener('click', () => {
    try {
      const rows = state.protocols.map(p => ({
        id: p.protocolId,
        client: p.clientName,
        point: p.samplingPointName,
        date: p.issuedAt,
        dictamen: p.evaluation?.dictamen,
        director: p.technicalDirector?.name,
        seal: p.protocolCryptoSeal
      }));

      ExportService.exportToExcelCSV('protocolos_labtrack', rows, [
        { key: 'id', label: 'ID Protocolo' },
        { key: 'client', label: 'Cliente' },
        { key: 'point', label: 'Punto de Muestra' },
        { key: 'date', label: 'Fecha Emisión' },
        { key: 'dictamen', label: 'Dictamen CAA' },
        { key: 'director', label: 'Director Técnico' },
        { key: 'seal', label: 'Sello Criptográfico SHA-256' }
      ]);
      showToast('Listado de protocolos exportado en formato CSV UTF-8.', 'success');
    } catch (err) {
      showToast(err.message || 'No se pudo exportar el CSV.', 'error');
    }
  });

  document.querySelectorAll('.btn-view-protocol').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const protocolId = e.currentTarget.getAttribute('data-protocol-id');
      const protocol = state.protocols.find(p => p.protocolId === protocolId);
      if (protocol) openProtocolDetailModal(protocol);
    });
  });
}

function renderReferrals() {
  const container = document.getElementById('view-container');
  if (!container) return;

  const emptyStateHtml = `
    <div class="bg-[#111827] border border-slate-800 rounded-2xl p-8 text-center space-y-4">
      <div class="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto">
        ${svgIcon('truck', 'w-6 h-6')}
      </div>
      <div class="space-y-1 max-w-md mx-auto">
        <h3 class="text-base font-bold text-white">No hay derivaciones externas registradas</h3>
        <p class="text-xs text-slate-300">Registre el envío de frascos para ensayos tercerizados (ICP-MS, pesticidas, dioxinas) con seguimiento de SLA.</p>
      </div>
      <button type="button" id="btn-empty-new-referral" class="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-2 transition-colors">
        ${svgIcon('plus', 'w-4 h-4')}
        <span>Registrar Primera Derivación</span>
      </button>
    </div>
  `;

  const html = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            ${svgIcon('truck', 'w-5 h-5 text-blue-400')}
            <span>Derivaciones a Laboratorios de Alta Complejidad</span>
          </h2>
          <p class="text-xs text-slate-300 mt-1">Control de SLA de ensayos tercerizados (Arsénico/Plomo por ICP-MS, Pesticidas, Dioxinas).</p>
        </div>
        <button type="button" id="btn-open-referral-create" class="min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors">
          ${svgIcon('plus', 'w-4 h-4')}
          <span>Nueva Derivación</span>
        </button>
      </div>

      ${state.referrals.length === 0 ? emptyStateHtml : `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${state.referrals.map(r => {
            const sla = ExternalReferralEngine.evaluateReferralSLA(r);
            const isDone = r.status === 'RESULTS_RECEIVED';
            return `
              <article class="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-3">
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/15 text-blue-300 font-mono">${Sanitizer.escapeHTML(r.referralId)}</span>
                      ${demoBadgeHtml(r)}
                    </div>
                    <h3 class="text-base font-bold text-white mt-1.5">${Sanitizer.escapeHTML(r.destLabName)}</h3>
                    <p class="text-xs text-slate-300 mt-0.5">${Sanitizer.escapeHTML(r.testRequested)}</p>
                  </div>
                  <span class="px-2.5 py-1 rounded-lg text-xs font-bold border ${isDone ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' : sla.isOverdue ? 'bg-rose-500/15 text-rose-300 border-rose-500/40' : 'bg-blue-500/15 text-blue-300 border-blue-500/40'}">
                    ${Sanitizer.escapeHTML(sla.status)}
                  </span>
                </div>

                <div class="p-3 bg-[#0d1322] rounded-xl text-xs space-y-1.5">
                  <div class="flex justify-between gap-2">
                    <span class="text-slate-400">Muestra Remitida:</span>
                    <span class="font-mono text-slate-200">${Sanitizer.escapeHTML(r.sampleCode)}</span>
                  </div>
                  <div class="flex justify-between gap-2">
                    <span class="text-slate-400">Días Restantes SLA:</span>
                    <span class="font-mono text-white font-bold tabular-nums">${isDone ? 'Completado' : `${sla.daysRemaining} días`}</span>
                  </div>
                  <div class="flex justify-between gap-2">
                    <span class="text-slate-400">Fecha Límite:</span>
                    <span class="font-mono text-slate-200">${Formatters.date(r.expectedDueDate)}</span>
                  </div>
                </div>

                ${isDone ? `
                  <div class="pt-3 border-t border-slate-800 text-xs text-emerald-300 space-y-1">
                    <div class="flex items-center gap-1.5 font-semibold">
                      ${svgIcon('check', 'w-4 h-4')}
                      <span>Resultados Recibidos (${Sanitizer.escapeHTML(r.results?.reportRef || 'Sin ref.')})</span>
                    </div>
                    <p class="font-mono text-slate-200">
                      As: ${Sanitizer.escapeHTML(r.results?.arsenicoPpm ?? '-')} mg/l · Pb: ${Sanitizer.escapeHTML(r.results?.plomoPpm ?? '-')} mg/l
                    </p>
                  </div>
                ` : `
                  <div class="pt-2 border-t border-slate-800">
                    <button type="button" data-referral-id="${Sanitizer.escapeHTML(r.referralId)}" class="btn-complete-referral w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors">
                      ${svgIcon('download', 'w-4 h-4')}
                      <span>Registrar Recepción de Ensayos</span>
                    </button>
                  </div>
                `}
              </article>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;

  Sanitizer.safeSetInnerHTML(container, html);
  attachReferralsEvents();
}

function attachReferralsEvents() {
  document.getElementById('btn-open-referral-create')?.addEventListener('click', openReferralCreateModal);
  document.getElementById('btn-empty-new-referral')?.addEventListener('click', openReferralCreateModal);

  document.querySelectorAll('.btn-complete-referral').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const refId = e.currentTarget.getAttribute('data-referral-id');
      const referral = state.referrals.find(r => r.referralId === refId);
      if (referral) openReferralCompleteModal(referral);
    });
  });
}

// Gestion accesible de Modales (un solo registro de listeners en initApp)
function openModalElement(modal) {
  if (!modal) return;
  state.lastFocusedElement = document.activeElement;
  const appShell = document.getElementById('app-shell');
  if (appShell) appShell.setAttribute('inert', '');
  modal.classList.remove('hidden');

  const firstFocusable = modal.querySelector('input, select, button, textarea, [tabindex]:not([tabindex="-1"])');
  if (firstFocusable) firstFocusable.focus();
}

function closeModalElement(modal) {
  if (!modal || modal.classList.contains('hidden')) return;
  modal.classList.add('hidden');
  const appShell = document.getElementById('app-shell');
  if (appShell) appShell.removeAttribute('inert');
  if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
    state.lastFocusedElement.focus();
  }
  state.lastFocusedElement = null;
}

function closeAllModals() {
  [
    'sample-modal',
    'protocol-modal',
    'protocol-detail-modal',
    'referral-create-modal',
    'referral-complete-modal',
    'whatsapp-modal',
    'confirm-purge-modal'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.classList.contains('hidden')) {
      closeModalElement(el);
    }
  });
}

function openSampleModal() {
  const modal = document.getElementById('sample-modal');
  const form = document.getElementById('form-new-sample');
  if (!modal || !form) return;
  form.reset();
  setFormError('sample-form-error', '');
  openModalElement(modal);
}

function openProtocolModal(order) {
  const modal = document.getElementById('protocol-modal');
  const form = document.getElementById('form-issue-protocol');
  if (!modal || !form || !order) return;

  state.activeOrderId = order.orderId;
  form.reset();
  setFormError('protocol-form-error', '');

  const titleEl = document.getElementById('protocol-modal-title');
  if (titleEl) {
    titleEl.textContent = `Emisión de Protocolo: ${order.orderId} - ${order.clientName}`;
  }
  const phInput = document.getElementById('prot-ph');
  if (phInput && order.inSituMeasurements?.ph != null) {
    phInput.value = String(order.inSituMeasurements.ph);
  }

  openModalElement(modal);
}

function openProtocolDetailModal(protocol) {
  const modal = document.getElementById('protocol-detail-modal');
  if (!modal || !protocol) return;

  const contentEl = document.getElementById('protocol-detail-content');
  if (contentEl) {
    const visual = dictamenVisual(protocol.evaluation?.dictamen);
    const isAuthentic = ProtocolService.verifyProtocolAuthenticity(protocol);
    const lr = protocol.labResults || {};
    const eColiPresent = Boolean(lr.escherichiaColi);
    const pseudoPresent = Boolean(lr.pseudomonasAeruginosa);

    const detailHtml = `
      <div class="space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="text-lg font-bold text-white">${Sanitizer.escapeHTML(protocol.protocolId)}</h4>
              ${demoBadgeHtml(protocol)}
            </div>
            <p class="text-xs text-slate-300 mt-1">${Sanitizer.escapeHTML(protocol.clientName)} · ${Sanitizer.escapeHTML(protocol.samplingPointName)}</p>
            <p class="text-xs text-slate-400">${Sanitizer.escapeHTML(protocol.facilityAddress || '-')}</p>
          </div>
          <span class="px-3 py-1.5 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 ${visual.cls}">
            ${svgIcon(visual.iconName, 'w-4 h-4')}
            <span>${Sanitizer.escapeHTML(protocol.evaluation?.dictamen || '-')}</span>
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#0d1322] p-4 rounded-xl">
          <div><span class="text-slate-400">Turbidez:</span> <strong class="text-white tabular-nums">${Sanitizer.escapeHTML(lr.turbidez ?? '-')} NTU</strong></div>
          <div><span class="text-slate-400">pH:</span> <strong class="text-white tabular-nums">${Sanitizer.escapeHTML(lr.ph ?? '-')}</strong></div>
          <div><span class="text-slate-400">TDS:</span> <strong class="text-white tabular-nums">${Sanitizer.escapeHTML(lr.tds ?? '-')} mg/l</strong></div>
          <div><span class="text-slate-400">Dureza Total:</span> <strong class="text-white tabular-nums">${Sanitizer.escapeHTML(lr.durezaTotal ?? '-')} mg/l</strong></div>
          <div><span class="text-slate-400">Nitratos:</span> <strong class="text-white tabular-nums">${Sanitizer.escapeHTML(lr.nitratos ?? '-')} mg/l</strong></div>
          <div><span class="text-slate-400">Nitritos:</span> <strong class="text-white tabular-nums">${Sanitizer.escapeHTML(lr.nitritos ?? '-')} mg/l</strong></div>
          <div><span class="text-slate-400">Arsénico:</span> <strong class="text-white tabular-nums">${Sanitizer.escapeHTML(lr.arsenico ?? '-')} mg/l</strong></div>
          <div><span class="text-slate-400">Mesófilas (37 °C):</span> <strong class="text-white tabular-nums">${Sanitizer.escapeHTML(lr.mesofilas ?? '-')} UFC/ml</strong></div>
          <div><span class="text-slate-400">Coliformes Totales:</span> <strong class="text-white tabular-nums">${Sanitizer.escapeHTML(lr.coliformesTotales ?? '-')} NMP/100ml</strong></div>
          <div><span class="text-slate-400">E. coli:</span> <strong class="${eColiPresent ? 'text-rose-300' : 'text-emerald-300'}">${eColiPresent ? 'PRESENCIA en 100 ml' : 'Ausencia en 100 ml'}</strong></div>
          <div><span class="text-slate-400">P. aeruginosa:</span> <strong class="${pseudoPresent ? 'text-rose-300' : 'text-emerald-300'}">${pseudoPresent ? 'PRESENCIA en 100 ml' : 'Ausencia en 100 ml'}</strong></div>
        </div>

        <div class="pt-3 border-t border-slate-800 text-xs font-mono text-slate-300 space-y-1">
          <p class="${isAuthentic ? 'text-emerald-300' : 'text-rose-300'} font-bold flex items-center gap-1.5">
            ${svgIcon(isAuthentic ? 'shield' : 'alert', 'w-4 h-4')}
            <span>${isAuthentic ? 'Firma Criptográfica Verificada (SHA-256 Íntegro)' : 'Advertencia: Sello Criptográfico Inválido'}</span>
          </p>
          <p class="break-all text-slate-300">${Sanitizer.escapeHTML(protocol.protocolCryptoSeal || '-')}</p>
          <p class="text-slate-400">Firmado por: ${Sanitizer.escapeHTML(protocol.technicalDirector?.name || '-')} (${Sanitizer.escapeHTML(protocol.technicalDirector?.license || '-')})</p>
        </div>

        <div class="no-print flex justify-end pt-2">
          <button type="button" id="btn-print-protocol" class="min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors">
            ${svgIcon('print', 'w-4 h-4')}
            <span>Imprimir Protocolo</span>
          </button>
        </div>
      </div>
    `;
    Sanitizer.safeSetInnerHTML(contentEl, detailHtml);
    document.getElementById('btn-print-protocol')?.addEventListener('click', () => {
      window.print();
    });
  }

  openModalElement(modal);
}

function openReferralCreateModal() {
  const modal = document.getElementById('referral-create-modal');
  const form = document.getElementById('form-create-referral');
  const select = document.getElementById('ref-order-id');
  if (!modal || !form || !select) return;

  form.reset();
  setFormError('referral-create-error', '');

  if (state.orders.length === 0) {
    showToast('Debe registrar al menos un muestreo antes de crear una derivación externa.', 'error');
    return;
  }

  const optionsHtml = state.orders.map(o =>
    `<option value="${Sanitizer.escapeHTML(o.orderId)}">${Sanitizer.escapeHTML(o.orderId)} - ${Sanitizer.escapeHTML(o.clientName)}</option>`
  ).join('');
  Sanitizer.safeSetInnerHTML(select, optionsHtml);

  const firstOrder = state.orders[0];
  const sampleCodeInput = document.getElementById('ref-sample-code');
  if (sampleCodeInput && firstOrder) {
    sampleCodeInput.value = `${firstOrder.orderId}-EXT-1`;
  }

  openModalElement(modal);
}

function openReferralCompleteModal(referral) {
  const modal = document.getElementById('referral-complete-modal');
  const form = document.getElementById('form-complete-referral');
  const summaryEl = document.getElementById('referral-complete-summary');
  if (!modal || !form || !referral) return;

  state.activeReferralId = referral.referralId;
  form.reset();
  setFormError('referral-complete-error', '');
  if (summaryEl) {
    summaryEl.textContent = `Derivación ${referral.referralId} (${referral.destLabName}) - Muestra ${referral.sampleCode}`;
  }

  openModalElement(modal);
}

function openWhatsAppModal(order) {
  const modal = document.getElementById('whatsapp-modal');
  const form = document.getElementById('form-whatsapp-phone');
  const summaryEl = document.getElementById('whatsapp-order-summary');
  if (!modal || !form || !order) return;

  state.activeWaOrderId = order.orderId;
  form.reset();
  setFormError('whatsapp-form-error', '');
  if (summaryEl) {
    summaryEl.textContent = `Orden ${order.orderId} para ${order.clientName} (${order.samplingPointName}).`;
  }

  openModalElement(modal);
}

function initModalListeners() {
  const modalClosePairs = [
    ['sample-modal', 'btn-close-sample-modal', 'btn-cancel-sample-modal'],
    ['protocol-modal', 'btn-close-protocol-modal', 'btn-cancel-protocol-modal'],
    ['protocol-detail-modal', 'btn-close-protocol-detail'],
    ['referral-create-modal', 'btn-close-referral-create', 'btn-cancel-referral-create'],
    ['referral-complete-modal', 'btn-close-referral-complete', 'btn-cancel-referral-complete'],
    ['whatsapp-modal', 'btn-close-whatsapp-modal', 'btn-cancel-whatsapp-modal'],
    ['confirm-purge-modal', 'btn-close-purge-modal', 'btn-cancel-purge-modal']
  ];

  modalClosePairs.forEach(([modalId, ...closeIds]) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    closeIds.forEach(cid => {
      document.getElementById(cid)?.addEventListener('click', () => closeModalElement(modal));
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModalElement(modal);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // 1. Submit Nuevo Muestreo
  document.getElementById('form-new-sample')?.addEventListener('submit', (e) => {
    e.preventDefault();
    setFormError('sample-form-error', '');

    try {
      const clientName = document.getElementById('new-client-name')?.value.trim();
      const clientPhone = document.getElementById('new-client-phone')?.value.trim();
      const facilityAddress = document.getElementById('new-facility-address')?.value.trim();
      const samplingPointName = document.getElementById('new-point-name')?.value.trim();
      const samplerName = document.getElementById('new-sampler-name')?.value.trim();
      const samplerLicense = document.getElementById('new-sampler-license')?.value.trim();
      const sealNumber = document.getElementById('new-seal-number')?.value.trim();
      const coolerTempC = parseFloat(document.getElementById('new-cooler-temp')?.value);
      const freeChlorinePpm = parseFloat(document.getElementById('new-chlorine')?.value);
      const ph = parseFloat(document.getElementById('new-ph')?.value);
      const operatorSignature = document.getElementById('new-operator-signature')?.value.trim();
      const clientSignature = document.getElementById('new-client-signature')?.value.trim();

      const requestedTypes = Array.from(document.querySelectorAll('input[name="kitType"]:checked')).map(cb => cb.value);
      if (requestedTypes.length === 0) {
        setFormError('sample-form-error', 'Seleccione al menos un recipiente del kit multi-frasco.');
        return;
      }
      if (!Number.isFinite(coolerTempC) || !Number.isFinite(freeChlorinePpm) || !Number.isFinite(ph)) {
        setFormError('sample-form-error', 'Ingrese valores numéricos válidos para temperatura, cloro DPD y pH.');
        return;
      }

      const order = SampleOrderService.createOrder({
        clientId: `CLI-${Date.now().toString(36).slice(-4)}`,
        clientName,
        clientPhone,
        facilityAddress,
        samplingPointName,
        samplerName,
        samplerLicense,
        requestedTypes,
        isDemo: false
      });

      const sampled = SampleOrderService.recordInSituSampling(order, {
        coolerTempC,
        ph,
        freeChlorinePpm,
        ambientTempC: 21.0,
        sealNumber,
        operatorSignature,
        clientSignature
      });

      state.orders.unshift(sampled);
      LabTrackCacheService.saveOrders(state.orders);
      closeModalElement(document.getElementById('sample-modal'));
      switchTab('samples');
      showToast(`Acta ${sampled.orderId} sellada con SHA-256 correctamente.`, 'success');
    } catch (err) {
      setFormError('sample-form-error', err.message || 'No se pudo registrar el muestreo.');
    }
  });

  // 2. Submit Emision de Protocolo
  document.getElementById('form-issue-protocol')?.addEventListener('submit', (e) => {
    e.preventDefault();
    setFormError('protocol-form-error', '');

    try {
      const order = state.orders.find(o => o.orderId === state.activeOrderId);
      if (!order) {
        setFormError('protocol-form-error', 'Orden de muestreo no encontrada. Vuelva a seleccionar la muestra.');
        return;
      }

      const labResults = {
        turbidez: parseFloat(document.getElementById('prot-turbidez')?.value),
        ph: parseFloat(document.getElementById('prot-ph')?.value),
        tds: parseFloat(document.getElementById('prot-tds')?.value),
        durezaTotal: parseFloat(document.getElementById('prot-dureza')?.value),
        nitratos: parseFloat(document.getElementById('prot-nitratos')?.value),
        nitritos: parseFloat(document.getElementById('prot-nitritos')?.value),
        arsenico: parseFloat(document.getElementById('prot-arsenico')?.value),
        mesofilas: parseInt(document.getElementById('prot-mesofilas')?.value, 10),
        coliformesTotales: parseInt(document.getElementById('prot-coliformes')?.value, 10),
        escherichiaColi: Boolean(document.getElementById('prot-ecoli')?.checked),
        pseudomonasAeruginosa: Boolean(document.getElementById('prot-pseudo')?.checked)
      };

      const numericKeys = ['turbidez', 'ph', 'tds', 'durezaTotal', 'nitratos', 'nitritos', 'arsenico', 'mesofilas', 'coliformesTotales'];
      if (numericKeys.some(k => !Number.isFinite(labResults[k]))) {
        setFormError('protocol-form-error', 'Complete todas las determinaciones numéricas con valores válidos.');
        return;
      }

      const directorName = document.getElementById('prot-director-name')?.value.trim();
      const directorLicense = document.getElementById('prot-director-license')?.value.trim();
      const directorSignature = document.getElementById('prot-director-signature')?.value.trim();

      const protocol = ProtocolService.issueProtocol(order, labResults, {
        name: directorName,
        license: directorLicense,
        signatureData: directorSignature
      });

      state.protocols.unshift(protocol);
      LabTrackCacheService.saveProtocols(state.protocols);
      state.activeOrderId = null;
      closeModalElement(document.getElementById('protocol-modal'));
      switchTab('protocols');
      showToast(`Protocolo ${protocol.protocolId} emitido y firmado digitalmente.`, 'success');
    } catch (err) {
      setFormError('protocol-form-error', err.message || 'No se pudo emitir el protocolo.');
    }
  });

  // 3. Submit Nueva Derivacion Externa
  document.getElementById('form-create-referral')?.addEventListener('submit', (e) => {
    e.preventDefault();
    setFormError('referral-create-error', '');

    try {
      const orderId = document.getElementById('ref-order-id')?.value;
      const sampleCode = document.getElementById('ref-sample-code')?.value.trim();
      const destLabName = document.getElementById('ref-dest-lab')?.value.trim();
      const testRequested = document.getElementById('ref-test-requested')?.value.trim();
      const slaDays = parseInt(document.getElementById('ref-sla-days')?.value, 10);

      if (!Number.isFinite(slaDays) || slaDays < 1) {
        setFormError('referral-create-error', 'Indique un plazo SLA válido en días (>= 1).');
        return;
      }

      const referral = ExternalReferralEngine.createReferral({
        orderId,
        sampleCode,
        destLabName,
        testRequested,
        slaDays,
        isDemo: false
      });

      state.referrals.unshift(referral);
      LabTrackCacheService.saveReferrals(state.referrals);
      closeModalElement(document.getElementById('referral-create-modal'));
      renderReferrals();
      showToast(`Derivación ${referral.referralId} registrada correctamente.`, 'success');
    } catch (err) {
      setFormError('referral-create-error', err.message || 'No se pudo crear la derivación.');
    }
  });

  // 4. Submit Recepcion de Ensayos Externos
  document.getElementById('form-complete-referral')?.addEventListener('submit', (e) => {
    e.preventDefault();
    setFormError('referral-complete-error', '');

    try {
      const idx = state.referrals.findIndex(r => r.referralId === state.activeReferralId);
      if (idx === -1) {
        setFormError('referral-complete-error', 'No se encontró la derivación seleccionada.');
        return;
      }

      const arsenicoPpm = parseFloat(document.getElementById('ref-result-arsenico')?.value);
      const plomoPpm = parseFloat(document.getElementById('ref-result-plomo')?.value);
      const reportRef = document.getElementById('ref-result-protocol')?.value.trim();

      if (!Number.isFinite(arsenicoPpm) || !Number.isFinite(plomoPpm)) {
        setFormError('referral-complete-error', 'Ingrese concentraciones numéricas válidas para Arsénico y Plomo.');
        return;
      }

      const updated = ExternalReferralEngine.completeReferral(state.referrals[idx], {
        arsenicoPpm,
        plomoPpm,
        reportRef
      });

      state.referrals[idx] = updated;
      LabTrackCacheService.saveReferrals(state.referrals);
      state.activeReferralId = null;
      closeModalElement(document.getElementById('referral-complete-modal'));
      renderReferrals();
      showToast(`Resultados recibidos para derivación ${updated.referralId}.`, 'success');
    } catch (err) {
      setFormError('referral-complete-error', err.message || 'No se pudieron guardar los resultados.');
    }
  });

  // 5. Submit Telefono WhatsApp
  document.getElementById('form-whatsapp-phone')?.addEventListener('submit', (e) => {
    e.preventDefault();
    setFormError('whatsapp-form-error', '');

    const order = state.orders.find(o => o.orderId === state.activeWaOrderId);
    const phone = document.getElementById('wa-phone-input')?.value.trim() || '';
    const digits = phone.replace(/\D/g, '');
    if (!order || digits.length < 8) {
      setFormError('whatsapp-form-error', 'Ingrese un teléfono internacional válido (mínimo 8 dígitos, ej: +5493435123456).');
      return;
    }

    order.clientPhone = phone;
    try {
      LabTrackCacheService.saveOrders(state.orders);
    } catch (_) {
      // Continuar con apertura de enlace aunque falle cache
    }

    const url = WhatsAppLabNotifierService.notifySampleIngress({
      phone,
      clientName: order.clientName,
      sampleCode: order.orderId,
      samplingPoint: order.samplingPointName,
      sealNumber: order.securitySeal?.sealNumber
    });
    state.activeWaOrderId = null;
    closeModalElement(document.getElementById('whatsapp-modal'));
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  // 6. Confirmar Purga de Datos Demo
  document.getElementById('btn-confirm-purge')?.addEventListener('click', () => {
    try {
      LabTrackCacheService.purgeData();
      state.orders = [];
      state.protocols = [];
      state.referrals = [];
      closeModalElement(document.getElementById('confirm-purge-modal'));
      switchTab(state.activeTab);
      showToast('Datos demo y caché local purgados correctamente.', 'success');
    } catch (err) {
      showToast(err.message || 'No se pudo completar la purga local.', 'error');
    }
  });
}

// Router & Tabs
export function switchTab(tabId) {
  state.activeTab = tabId;

  const activeClasses = 'min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white border border-blue-500 flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors';
  const inactiveClasses = 'min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#111827] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors';

  let activeTabElId = 'tab-dashboard';
  document.querySelectorAll('#tab-nav [role="tab"]').forEach(btn => {
    const isActive = btn.getAttribute('data-tab') === tabId;
    btn.className = isActive ? activeClasses : inactiveClasses;
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    btn.setAttribute('tabindex', isActive ? '0' : '-1');
    if (isActive && btn.id) {
      activeTabElId = btn.id;
    }
  });

  const viewContainer = document.getElementById('view-container');
  if (viewContainer) {
    viewContainer.setAttribute('aria-labelledby', activeTabElId);
  }

  switch (tabId) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'samples':
      renderSamples();
      break;
    case 'sla-countdown':
      renderSLACountdown();
      break;
    case 'caa-evaluator':
      renderCAAEvaluator();
      break;
    case 'protocols':
      renderProtocols();
      break;
    case 'referrals':
      renderReferrals();
      break;
    default:
      renderDashboard();
  }
}

// Inicializacion de la Aplicacion
export function initApp() {
  initializeDemoData();
  initModalListeners();

  const tabList = document.getElementById('tab-nav');
  const tabs = Array.from(document.querySelectorAll('#tab-nav [role="tab"]'));

  tabs.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });

    btn.addEventListener('keydown', (e) => {
      let nextIdx = null;
      if (e.key === 'ArrowRight') nextIdx = (index + 1) % tabs.length;
      if (e.key === 'ArrowLeft') nextIdx = (index - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') nextIdx = 0;
      if (e.key === 'End') nextIdx = tabs.length - 1;

      if (nextIdx !== null) {
        e.preventDefault();
        const targetTab = tabs[nextIdx];
        const tabId = targetTab.getAttribute('data-tab');
        if (tabId) switchTab(tabId);
        targetTab.focus();
      }
    });
  });

  if (tabList) {
    tabList.setAttribute('aria-orientation', 'horizontal');
  }

  document.getElementById('btn-header-new-sample')?.addEventListener('click', () => {
    switchTab('samples');
    openSampleModal();
  });

  document.getElementById('btn-purge-demo')?.addEventListener('click', () => {
    openModalElement(document.getElementById('confirm-purge-modal'));
  });

  switchTab('dashboard');
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initApp);
}
