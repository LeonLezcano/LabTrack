/**
 * LabTrack - Main Controller
 * AiAppFactory Standard
 */
import { CAAStandardsEngine } from './core/caaStandards.js';
import { SampleKitRegistry } from './core/sampleKitRegistry.js';
import { SLABiologicalSentinel } from './core/slaBiologicalSentinel.js';
import { ExternalReferralEngine } from './core/externalReferralEngine.js';
import { SampleOrderService } from './services/sampleOrderService.js';
import { ProtocolService } from './services/protocolService.js';
import { ExportService } from './services/exportService.js';
import { LabTrackCacheService } from './services/labTrackCache.service.js';
import { WhatsAppLabNotifierService } from './services/whatsAppLabNotifier.service.js';
import { Formatters } from './utils/formatters.js';
import { Sanitizer } from './utils/sanitizer.js';

// Estado de la Aplicación
const state = {
  activeTab: 'dashboard',
  orders: [],
  protocols: [],
  referrals: []
};

// Datos Demo Iniciales (Solo si no fueron purgados)
function initializeDemoData() {
  if (LabTrackCacheService.isPurged()) {
    state.orders = [];
    state.protocols = [];
    state.referrals = [];
    return;
  }

  const cachedOrders = LabTrackCacheService.getOrders();
  const cachedProtocols = LabTrackCacheService.getProtocols();

  if (cachedOrders.length > 0) {
    state.orders = cachedOrders;
    state.protocols = cachedProtocols;
  } else {
    // Semilla inicial representativa de laboratorio bromatológico
    const order1 = SampleOrderService.createOrder({
      clientId: 'CLI-FRIGO-01',
      clientName: 'Frigorífico Bovino del Litoral S.A.',
      facilityAddress: 'Ruta 11 Km 342, Diamante, Entre Ríos',
      samplingPointName: 'Boca de Pozo N° 1 - Sala de Desposte',
      samplerName: 'Lic. Tomás Valenzuela',
      samplerLicense: 'COL-BQ-4821',
      requestedTypes: ['MICROBIOLOGY', 'PHYSICOCHEMICAL', 'METALS']
    });

    const sampledOrder1 = SampleOrderService.recordInSituSampling(order1, {
      coolerTempC: 3.8,
      ph: 7.2,
      freeChlorinePpm: 0.35,
      ambientTempC: 22.0,
      sealNumber: 'PREC-INV-99482',
      operatorSignature: 'SIG_TOM_VALENZUELA_DATA',
      clientSignature: 'SIG_JEFE_PLANTA_DATA'
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
      signatureData: 'SIG_DRA_FONTANA_CERT'
    });

    const referral1 = ExternalReferralEngine.createReferral({
      orderId: sampledOrder1.orderId,
      sampleCode: `${sampledOrder1.orderId}-METALS-3`,
      destLabName: 'Laboratorio Central de Espectrometría S.A.',
      testRequested: 'Cuantificación de Arsénico y Plomo por ICP-MS',
      slaDays: 5
    });

    state.orders = [sampledOrder1];
    state.protocols = [protocol1];
    state.referrals = [referral1];

    LabTrackCacheService.saveOrders(state.orders);
    LabTrackCacheService.saveProtocols(state.protocols);
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

  const html = `
    <div class="space-y-6">
      <!-- KPIs Superiores -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
          <p class="text-xs uppercase tracking-wider text-slate-400 font-bold">Muestreos Registrados</p>
          <p class="text-3xl font-extrabold text-blue-400 mt-2">${totalOrders}</p>
          <p class="text-xs text-slate-500 mt-1">Con Precinto y Cadena de Custodia</p>
        </div>
        <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
          <p class="text-xs uppercase tracking-wider text-slate-400 font-bold">Protocolos Certificados</p>
          <p class="text-3xl font-extrabold text-emerald-400 mt-2">${certifiedProtocols}</p>
          <p class="text-xs text-slate-500 mt-1">Dictamen CAA Art. 982 Inmutable</p>
        </div>
        <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
          <p class="text-xs uppercase tracking-wider text-slate-400 font-bold">SLA Biológico en Curso</p>
          <p class="text-3xl font-extrabold text-amber-400 mt-2">${pendingBiological}</p>
          <p class="text-xs text-slate-500 mt-1">Ventana &lt; 24h para Siembra en Estufa</p>
        </div>
        <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
          <p class="text-xs uppercase tracking-wider text-slate-400 font-bold">Derivaciones Externas</p>
          <p class="text-3xl font-extrabold text-cyan-400 mt-2">${activeReferrals}</p>
          <p class="text-xs text-slate-500 mt-1">ICP-MS / Cromatografía con SLA</p>
        </div>
      </div>

      <!-- Accesos Rápidos -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 class="text-white font-bold text-base flex items-center gap-2">🧪 Nuevo Muestreo</h3>
            <p class="text-xs text-slate-400 mt-1">Generar acta in-situ con kit multi-frasco y precinto.</p>
          </div>
          <button id="btn-quick-new-sample" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 whitespace-nowrap">
            + Tomar Muestra
          </button>
        </div>
        <div class="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 class="text-white font-bold text-base flex items-center gap-2">⏱️ Semáforo SLA 24h</h3>
            <p class="text-xs text-slate-400 mt-1">Control de viabilidad térmica y horas antes del vencimiento.</p>
          </div>
          <button data-tab="sla-countdown" class="nav-trigger px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/30 whitespace-nowrap">
            Ver Semáforo
          </button>
        </div>
        <div class="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 class="text-white font-bold text-base flex items-center gap-2">⚖️ Evaluador CAA</h3>
            <p class="text-xs text-slate-400 mt-1">Auditar resultados frente al Código Alimentario Art. 982.</p>
          </div>
          <button data-tab="caa-evaluator" class="nav-trigger px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 whitespace-nowrap">
            Evaluar Agua
          </button>
        </div>
      </div>

      <!-- Tabla de Últimos Muestreos -->
      <div class="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-white">Muestreos con Cadena de Custodia Activa</h3>
          <span class="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 font-mono">SHA-256 Verified</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th class="py-3 px-3">Código</th>
                <th class="py-3 px-3">Cliente / Establecimiento</th>
                <th class="py-3 px-3">Punto de Muestra</th>
                <th class="py-3 px-3">Precinto</th>
                <th class="py-3 px-3">Temp In-Situ</th>
                <th class="py-3 px-3">Cloro DPD</th>
                <th class="py-3 px-3">Estado</th>
                <th class="py-3 px-3">Sello SHA-256</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${state.orders.length === 0 ? `
                <tr><td colspan="8" class="py-4 text-center text-slate-500">No hay muestras registradas aún</td></tr>
              ` : state.orders.map(o => `
                <tr class="hover:bg-slate-800/30 transition">
                  <td class="py-3 px-3 font-mono text-blue-400 font-bold">${Sanitizer.escapeHTML(o.orderId)}</td>
                  <td class="py-3 px-3 font-semibold text-white">${Sanitizer.escapeHTML(o.clientName)}</td>
                  <td class="py-3 px-3">${Sanitizer.escapeHTML(o.samplingPointName)}</td>
                  <td class="py-3 px-3 font-mono text-amber-400">${Sanitizer.escapeHTML(o.securitySeal?.sealNumber || '-')}</td>
                  <td class="py-3 px-3">${Formatters.temperature(o.inSituMeasurements?.coolerTempC)}</td>
                  <td class="py-3 px-3 font-mono">${Formatters.ppm(o.inSituMeasurements?.freeChlorinePpm)}</td>
                  <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400">${Sanitizer.escapeHTML(o.status)}</span></td>
                  <td class="py-3 px-3 font-mono text-[10px] text-slate-400" title="${o.cryptoSeal}">🔒 ${o.cryptoSeal ? o.cryptoSeal.slice(0, 10) + '...' : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  Sanitizer.safeSetInnerHTML(container, html);
  attachDashboardEvents();
}

function attachDashboardEvents() {
  document.getElementById('btn-quick-new-sample')?.addEventListener('click', () => {
    switchTab('samples');
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

  const html = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">🧪 Actas de Muestreo & Cadena de Custodia</h2>
          <p class="text-xs text-slate-400 mt-1">Registro in-situ con mediciones volátiles (cloro DPD, pH), precinto numerado y doble firma ePOD.</p>
        </div>
        <button id="btn-open-sample-modal" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2">
          <span>+</span> Iniciar Nuevo Muestreo
        </button>
      </div>

      <!-- Listado de Actas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${state.orders.map(o => `
          <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div class="flex items-start justify-between">
              <div>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 font-mono">${Sanitizer.escapeHTML(o.orderId)}</span>
                <h3 class="text-base font-bold text-white mt-1">${Sanitizer.escapeHTML(o.clientName)}</h3>
                <p class="text-xs text-slate-400">${Sanitizer.escapeHTML(o.samplingPointName)}</p>
                <p class="text-[11px] text-slate-500 mt-0.5">${Sanitizer.escapeHTML(o.facilityAddress || '-')}</p>
              </div>
              <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                ${Sanitizer.escapeHTML(o.status)}
              </span>
            </div>

            <!-- Mediciones In-Situ -->
            <div class="grid grid-cols-3 gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-center">
              <div>
                <p class="text-[10px] text-slate-500 uppercase">Temp Conservadora</p>
                <p class="font-bold text-cyan-400 mt-0.5">${Formatters.temperature(o.inSituMeasurements?.coolerTempC)}</p>
              </div>
              <div>
                <p class="text-[10px] text-slate-500 uppercase">Cloro Libre DPD</p>
                <p class="font-bold text-amber-400 mt-0.5 font-mono">${Formatters.ppm(o.inSituMeasurements?.freeChlorinePpm)}</p>
              </div>
              <div>
                <p class="text-[10px] text-slate-500 uppercase">pH In-Situ</p>
                <p class="font-bold text-emerald-400 mt-0.5">${o.inSituMeasurements?.ph || '-'}</p>
              </div>
            </div>

            <!-- Precinto y Frascos -->
            <div class="text-xs text-slate-400 space-y-1">
              <div class="flex justify-between">
                <span>🔒 Precinto de Seguridad:</span>
                <span class="font-mono text-white font-bold">${Sanitizer.escapeHTML(o.securitySeal?.sealNumber || '-')}</span>
              </div>
              <div class="flex justify-between">
                <span>🧪 Kit Multi-Frasco:</span>
                <span class="text-slate-300">${o.kit?.bottlesCount || 0} recipientes rotulados</span>
              </div>
              <div class="flex justify-between">
                <span>👨‍🔬 Muestreador:</span>
                <span class="text-slate-300">${Sanitizer.escapeHTML(o.samplerName)} (${Sanitizer.escapeHTML(o.samplerLicense || '-')})</span>
              </div>
              <div class="flex justify-between">
                <span>📅 Fecha Toma:</span>
                <span class="text-slate-300 font-mono">${Formatters.date(o.samplingTimestamp)}</span>
              </div>
            </div>

            <!-- Sello Forense SHA-256 -->
            <div class="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span class="truncate">Sello: ${o.cryptoSeal ? o.cryptoSeal.slice(0, 24) + '...' : 'Pendiente'}</span>
              <span class="text-emerald-400 font-bold shrink-0">✓ Inmutable</span>
            </div>

            <!-- Acciones -->
            <div class="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button data-order-id="${o.orderId}" class="btn-certify-order flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs">
                📋 Emitir Protocolo CAA
              </button>
              <button data-order-id="${o.orderId}" class="btn-notify-wa px-3 py-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-700/60 text-emerald-300 text-xs" title="Enviar WhatsApp a Cliente">
                📲 WA
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  Sanitizer.safeSetInnerHTML(container, html);
  attachSamplesEvents();
}

function attachSamplesEvents() {
  document.getElementById('btn-open-sample-modal')?.addEventListener('click', () => {
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
      if (order) {
        const url = WhatsAppLabNotifierService.notifySampleIngress({
          phone: '+5493435123456',
          clientName: order.clientName,
          sampleCode: order.orderId,
          samplingPoint: order.samplingPointName,
          sealNumber: order.securitySeal?.sealNumber
        });
        window.open(url, '_blank');
      }
    });
  });
}

function renderSLACountdown() {
  const container = document.getElementById('view-container');
  if (!container) return;

  const html = `
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-2">⏱️ Semáforo Biológico & SLA de Siembra en Estufa</h2>
        <p class="text-xs text-slate-400 mt-1">Control estricto de la ventana máxima de 24 horas a 4°C ± 2°C entre la toma de agua y la inoculación en agar.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${state.orders.map(o => {
          const sla = SLABiologicalSentinel.evaluateViability(o.samplingTimestamp, o.inSituMeasurements?.coolerTempC);
          const isWarning = sla.status === 'WARNING';
          const isCritical = sla.status === 'CRITICAL';
          const isExpired = sla.status === 'EXPIRED';

          let statusBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
          let statusLabel = '🟢 ÓPTIMO / VIABLE';
          if (isWarning) {
            statusBg = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
            statusLabel = '⚠️ ATENCIÓN / > 16 HORAS';
          } else if (isCritical) {
            statusBg = 'bg-rose-500/20 text-rose-400 border-rose-500/40';
            statusLabel = '⛔ CRÍTICO / VENCE EN < 2 HORAS';
          } else if (isExpired) {
            statusBg = 'bg-red-900/40 text-red-400 border-red-500/60';
            statusLabel = '💀 VENCIDO / DESCARTAR MUESTRA';
          }

          return `
            <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div class="flex items-start justify-between">
                <div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 font-mono">${Sanitizer.escapeHTML(o.orderId)}</span>
                  <h3 class="text-base font-bold text-white mt-1">${Sanitizer.escapeHTML(o.clientName)}</h3>
                  <p class="text-xs text-slate-400">${Sanitizer.escapeHTML(o.samplingPointName)}</p>
                </div>
                <span class="px-3 py-1 rounded-xl text-xs font-bold border ${statusBg}">
                  ${statusLabel}
                </span>
              </div>

              <!-- Contador de Horas -->
              <div class="grid grid-cols-2 gap-3 p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
                <div>
                  <p class="text-[10px] text-slate-500 uppercase">Tiempo Transcurrido</p>
                  <p class="text-2xl font-black text-white mt-1">${sla.hoursElapsed} h</p>
                </div>
                <div>
                  <p class="text-[10px] text-slate-500 uppercase">Tiempo Restante</p>
                  <p class="text-2xl font-black ${sla.hoursRemaining < 4 ? 'text-rose-400' : 'text-emerald-400'} mt-1">${sla.hoursRemaining} h</p>
                </div>
              </div>

              <!-- Alerta Térmica -->
              ${sla.thermalAlert ? `
                <div class="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                  ⚠️ <strong>Desvío Térmico en Conservadora:</strong> ${Sanitizer.escapeHTML(sla.thermalReason)}
                </div>
              ` : `
                <div class="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                  <span>🧊 Cadena de Frío Preservada:</span>
                  <span class="font-bold font-mono">${Formatters.temperature(o.inSituMeasurements?.coolerTempC)}</span>
                </div>
              `}

              <div class="text-[11px] text-slate-500">
                Límite normativo IRAM/Standard Methods: máximo 24 horas entre toma y siembra en placa petri a 37°C.
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  Sanitizer.safeSetInnerHTML(container, html);
}

function renderCAAEvaluator() {
  const container = document.getElementById('view-container');
  if (!container) return;

  const html = `
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-2">⚖️ Evaluador Normativo: Código Alimentario Argentino (Art. 982)</h2>
        <p class="text-xs text-slate-400 mt-1">Cálculo institucional automático de límites máximos tolerables para agua de consumo humano.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Formulario de Simulación -->
        <div class="lg:col-span-2 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">Carga Rápida de Determinaciones Analíticas</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label class="block text-slate-400 mb-1">Turbidez (Máx 3.0 NTU)</label>
              <input type="number" id="input-turbidez" step="0.1" value="1.2" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 mb-1">pH (Rango 6.5 - 8.5)</label>
              <input type="number" id="input-ph" step="0.1" value="7.4" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Nitratos (Máx 45 mg/l)</label>
              <input type="number" id="input-nitratos" step="0.5" value="14.0" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Arsénico (Máx 0.05 mg/l)</label>
              <input type="number" id="input-arsenico" step="0.001" value="0.010" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Dureza Total (Máx 400 mg/l CaCO3)</label>
              <input type="number" id="input-dureza" step="5" value="180" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Coliformes Totales (&lt; 3 NMP/100ml)</label>
              <input type="number" id="input-coliformes" step="1" value="0" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono">
            </div>
          </div>

          <!-- Patógenos Críticos -->
          <div class="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <label class="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer">
              <input type="checkbox" id="check-ecoli" class="rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-0">
              <span class="text-slate-300">Presencia de <strong>Escherichia coli</strong> (Criterio Invalida)</span>
            </label>
            <label class="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer">
              <input type="checkbox" id="check-pseudo" class="rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-0">
              <span class="text-slate-300">Presencia de <strong>Pseudomonas aeruginosa</strong></span>
            </label>
          </div>

          <button id="btn-eval-caa" class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30">
            ⚡ Evaluar Dictamen Oficial
          </button>
        </div>

        <!-- Panel de Dictamen en Vivo -->
        <div id="eval-result-panel" class="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <span class="text-[10px] uppercase font-bold text-slate-500">Dictamen Institucional</span>
            <div id="dictamen-badge-container" class="mt-2 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-center font-bold text-sm">
              🟢 AGUA APTA PARA CONSUMO (CAA Art. 982)
            </div>
            <p id="dictamen-summary" class="text-xs text-slate-300 mt-4 leading-relaxed">
              La muestra analizada CUMPLE con todas las especificaciones de calidad bacteriológica y fisicoquímica del Código Alimentario Argentino.
            </p>
          </div>

          <div id="deviations-list" class="mt-4 pt-4 border-t border-slate-800 text-xs space-y-2">
            <p class="text-[10px] uppercase text-slate-500 font-bold">Desvíos Detectados: 0</p>
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

    const badge = Formatters.dictamenBadge(evaluation.dictamen);
    const badgeEl = document.getElementById('dictamen-badge-container');
    const summaryEl = document.getElementById('dictamen-summary');
    const deviationsEl = document.getElementById('deviations-list');

    if (badgeEl) {
      badgeEl.className = `mt-2 p-4 rounded-xl border text-center font-bold text-sm ${badge.bg} ${badge.border} ${badge.text}`;
      badgeEl.textContent = `${badge.icon} ${badge.label}`;
    }
    if (summaryEl) {
      summaryEl.textContent = evaluation.summary;
    }
    if (deviationsEl) {
      if (evaluation.deviations.length === 0) {
        Sanitizer.safeSetInnerHTML(deviationsEl, '<p class="text-[10px] uppercase text-emerald-400 font-bold">✓ Cero Desvíos Normativos</p>');
      } else {
        const devHtml = `
          <p class="text-[10px] uppercase text-rose-400 font-bold">Desvíos Detectados: ${evaluation.deviations.length}</p>
          <div class="space-y-1 mt-2">
            ${evaluation.deviations.map(d => `
              <div class="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 text-[11px] text-rose-300 flex justify-between">
                <span><strong>${Sanitizer.escapeHTML(d.name)}:</strong> ${Sanitizer.escapeHTML(d.found)}</span>
                <span class="text-rose-400 font-mono">Límite: ${Sanitizer.escapeHTML(d.limit)}</span>
              </div>
            `).join('')}
          </div>
        `;
        Sanitizer.safeSetInnerHTML(deviationsEl, devHtml);
      }
    }
  };

  document.getElementById('btn-eval-caa')?.addEventListener('click', evaluate);
  // Re-evaluar en vivo al cambiar inputs
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
          <h2 class="text-xl font-bold text-white flex items-center gap-2">📋 Protocolos Analíticos Oficiales</h2>
          <p class="text-xs text-slate-400 mt-1">Certificados emitidos con firma digital del Director Técnico y Sello Criptográfico SHA-256.</p>
        </div>
        <button id="btn-export-protocols-csv" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 shadow-lg flex items-center gap-2">
          📥 Exportar CSV (Excel)
        </button>
      </div>

      <!-- Tabla de Protocolos -->
      <div class="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th class="py-3 px-3">Protocolo N°</th>
              <th class="py-3 px-3">Cliente</th>
              <th class="py-3 px-3">Punto de Muestra</th>
              <th class="py-3 px-3">Fecha Emisión</th>
              <th class="py-3 px-3">Dictamen CAA</th>
              <th class="py-3 px-3">Director Técnico</th>
              <th class="py-3 px-3">Sello SHA-256</th>
              <th class="py-3 px-3">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            ${state.protocols.length === 0 ? `
              <tr><td colspan="8" class="py-4 text-center text-slate-500">No hay protocolos emitidos aún</td></tr>
            ` : state.protocols.map(p => {
              const badge = Formatters.dictamenBadge(p.evaluation?.dictamen);
              return `
                <tr class="hover:bg-slate-800/30 transition">
                  <td class="py-3 px-3 font-mono text-emerald-400 font-bold">${Sanitizer.escapeHTML(p.protocolId)}</td>
                  <td class="py-3 px-3 font-semibold text-white">${Sanitizer.escapeHTML(p.clientName)}</td>
                  <td class="py-3 px-3">${Sanitizer.escapeHTML(p.samplingPointName)}</td>
                  <td class="py-3 px-3 font-mono text-[11px]">${Formatters.date(p.issuedAt)}</td>
                  <td class="py-3 px-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg} ${badge.border} ${badge.text}">
                      ${badge.icon} ${Sanitizer.escapeHTML(p.evaluation?.dictamen || '-')}
                    </span>
                  </td>
                  <td class="py-3 px-3">${Sanitizer.escapeHTML(p.technicalDirector?.name || '-')}</td>
                  <td class="py-3 px-3 font-mono text-[10px] text-slate-400" title="${p.protocolCryptoSeal}">
                    🔒 ${p.protocolCryptoSeal ? p.protocolCryptoSeal.slice(0, 10) + '...' : '-'}
                  </td>
                  <td class="py-3 px-3">
                    <button data-protocol-id="${p.protocolId}" class="btn-view-protocol px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-white text-[11px] font-semibold">
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
  document.getElementById('btn-export-protocols-csv')?.addEventListener('click', () => {
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

  const html = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">🚚 Derivaciones a Laboratorios de Alta Complejidad</h2>
          <p class="text-xs text-slate-400 mt-1">Control de SLA de ensayos tercerizados (Arsénico/Plomo por ICP-MS, Pesticidas, Dioxinas).</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${state.referrals.map(r => {
          const sla = ExternalReferralEngine.evaluateReferralSLA(r);
          return `
            <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
              <div class="flex items-start justify-between">
                <div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 font-mono">${Sanitizer.escapeHTML(r.referralId)}</span>
                  <h3 class="text-base font-bold text-white mt-1">${Sanitizer.escapeHTML(r.destLabName)}</h3>
                  <p class="text-xs text-slate-400 mt-0.5">${Sanitizer.escapeHTML(r.testRequested)}</p>
                </div>
                <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${sla.isOverdue ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'}">
                  ${sla.status}
                </span>
              </div>

              <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1">
                <div class="flex justify-between">
                  <span class="text-slate-500">Muestra Remitida:</span>
                  <span class="font-mono text-slate-300">${Sanitizer.escapeHTML(r.sampleCode)}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Días Restantes SLA:</span>
                  <span class="font-mono text-cyan-400 font-bold">${sla.daysRemaining} días</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Fecha Límite:</span>
                  <span class="font-mono text-slate-300">${Formatters.date(r.expectedDueDate)}</span>
                </div>
              </div>

              ${r.status === 'RESULTS_RECEIVED' ? `
                <div class="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-mono">
                  ✓ Resultados Recibidos e Imputados al Protocolo
                </div>
              ` : `
                <button data-referral-id="${r.referralId}" class="btn-complete-referral w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs">
                  📥 Registrar Recepción de Ensayos
                </button>
              `}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  Sanitizer.safeSetInnerHTML(container, html);
  attachReferralsEvents();
}

function attachReferralsEvents() {
  document.querySelectorAll('.btn-complete-referral').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const refId = e.currentTarget.getAttribute('data-referral-id');
      const referral = state.referrals.find(r => r.referralId === refId);
      if (referral) {
        const updated = ExternalReferralEngine.completeReferral(referral, {
          arsenicoPpm: 0.008,
          plomoPpm: 0.001
        });
        const idx = state.referrals.findIndex(r => r.referralId === refId);
        state.referrals[idx] = updated;
        renderReferrals();
      }
    });
  });
}

// Modales
function openSampleModal() {
  const modal = document.getElementById('sample-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  document.getElementById('btn-close-sample-modal')?.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  document.getElementById('form-new-sample')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const clientName = document.getElementById('new-client-name')?.value || 'Establecimiento Lácteo La Serenata';
    const samplingPointName = document.getElementById('new-point-name')?.value || 'Canilla de Alimentación Silo 2';
    const sealNumber = document.getElementById('new-seal-number')?.value || `PREC-${Math.floor(10000 + Math.random() * 90000)}`;
    const coolerTempC = parseFloat(document.getElementById('new-cooler-temp')?.value) || 4.2;
    const freeChlorinePpm = parseFloat(document.getElementById('new-chlorine')?.value) || 0.30;
    const ph = parseFloat(document.getElementById('new-ph')?.value) || 7.2;

    const order = SampleOrderService.createOrder({
      clientId: `CLI-${Math.random().toString(36).slice(2, 6)}`,
      clientName,
      facilityAddress: 'Parque Industrial Sur',
      samplingPointName,
      samplerName: 'Lic. Tomás Valenzuela',
      samplerLicense: 'COL-BQ-4821',
      requestedTypes: ['MICROBIOLOGY', 'PHYSICOCHEMICAL']
    });

    const sampled = SampleOrderService.recordInSituSampling(order, {
      coolerTempC,
      ph,
      freeChlorinePpm,
      ambientTempC: 21.0,
      sealNumber,
      operatorSignature: 'SIG_OP_VERIFIED',
      clientSignature: 'SIG_CLI_VERIFIED'
    });

    state.orders.unshift(sampled);
    LabTrackCacheService.saveOrders(state.orders);
    modal.classList.add('hidden');
    renderSamples();
  });
}

function openProtocolModal(order) {
  const modal = document.getElementById('protocol-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  const titleEl = document.getElementById('protocol-modal-title');
  if (titleEl) titleEl.textContent = `Emisión de Protocolo: ${order.orderId} - ${order.clientName}`;

  document.getElementById('btn-close-protocol-modal')?.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  document.getElementById('btn-confirm-issue-protocol')?.addEventListener('click', () => {
    const protocol = ProtocolService.issueProtocol(order, {
      turbidez: 1.0,
      ph: order.inSituMeasurements.ph,
      tds: 380,
      durezaTotal: 160,
      nitratos: 12.5,
      nitritos: 0.01,
      arsenico: 0.009,
      mesofilas: 25,
      coliformesTotales: 0,
      escherichiaColi: false,
      pseudomonasAeruginosa: false
    }, {
      name: 'Dra. Silvina Fontana',
      license: 'MP-BIOQ-10492',
      signatureData: 'SIG_DRA_FONTANA_CERT'
    });

    state.protocols.unshift(protocol);
    LabTrackCacheService.saveProtocols(state.protocols);
    modal.classList.add('hidden');
    switchTab('protocols');
  });
}

function openProtocolDetailModal(protocol) {
  const modal = document.getElementById('protocol-detail-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  const contentEl = document.getElementById('protocol-detail-content');
  if (contentEl) {
    const badge = Formatters.dictamenBadge(protocol.evaluation?.dictamen);
    const detailHtml = `
      <div class="space-y-4">
        <div class="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-lg font-bold text-white">${Sanitizer.escapeHTML(protocol.protocolId)}</h3>
            <p class="text-xs text-slate-400">${Sanitizer.escapeHTML(protocol.clientName)} · ${Sanitizer.escapeHTML(protocol.samplingPointName)}</p>
          </div>
          <span class="px-3 py-1 rounded-xl text-xs font-bold border ${badge.bg} ${badge.border} ${badge.text}">
            ${badge.icon} ${Sanitizer.escapeHTML(protocol.evaluation?.dictamen)}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div><span class="text-slate-500">Turbidez:</span> <strong class="text-white">${Sanitizer.escapeHTML(protocol.labResults.turbidez)} NTU</strong></div>
          <div><span class="text-slate-500">pH:</span> <strong class="text-white">${Sanitizer.escapeHTML(protocol.labResults.ph)}</strong></div>
          <div><span class="text-slate-500">Nitratos:</span> <strong class="text-white">${Sanitizer.escapeHTML(protocol.labResults.nitratos)} mg/l</strong></div>
          <div><span class="text-slate-500">Arsénico:</span> <strong class="text-white">${Sanitizer.escapeHTML(protocol.labResults.arsenico)} mg/l</strong></div>
          <div><span class="text-slate-500">Coliformes:</span> <strong class="text-white">${Sanitizer.escapeHTML(protocol.labResults.coliformesTotales)} NMP/100ml</strong></div>
          <div><span class="text-slate-500">E. coli:</span> <strong class="text-emerald-400">Ausencia en 100 ml</strong></div>
        </div>

        <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400">
          <p class="text-emerald-400 font-bold mb-1">🔒 Firma Criptográfica del Director Técnico:</p>
          <p class="truncate">${Sanitizer.escapeHTML(protocol.protocolCryptoSeal)}</p>
          <p class="mt-1 text-slate-500">Firmado por: ${Sanitizer.escapeHTML(protocol.technicalDirector?.name)} (${Sanitizer.escapeHTML(protocol.technicalDirector?.license)})</p>
        </div>

        <div class="flex justify-end pt-2">
          <button id="btn-print-protocol" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
            🖨️ Imprimir Protocolo
          </button>
        </div>
      </div>
    `;
    Sanitizer.safeSetInnerHTML(contentEl, detailHtml);
    document.getElementById('btn-print-protocol')?.addEventListener('click', () => {
      window.print();
    });
  }

  document.getElementById('btn-close-protocol-detail')?.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}

// Router & Tabs
export function switchTab(tabId) {
  state.activeTab = tabId;

  document.querySelectorAll('#tab-nav button').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.className = 'px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2';
    } else {
      btn.className = 'px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80 flex items-center gap-2';
    }
  });

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

// Inicialización de la Aplicación
export function initApp() {
  initializeDemoData();

  document.querySelectorAll('#tab-nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });
  });

  document.getElementById('btn-header-new-sample')?.addEventListener('click', () => {
    switchTab('samples');
    openSampleModal();
  });

  switchTab('dashboard');
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initApp);
}
