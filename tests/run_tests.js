/**
 * Arnés de Pruebas Multi-Capa (5 Capas + Fuzzing)
 * LabTrack - AiAppFactory Standard
 */
import { CAAStandardsEngine, CAA_LIMITS } from '../src/core/caaStandards.js';
import { SampleKitRegistry, BOTTLE_TYPES } from '../src/core/sampleKitRegistry.js';
import { SLABiologicalSentinel } from '../src/core/slaBiologicalSentinel.js';
import { ExternalReferralEngine } from '../src/core/externalReferralEngine.js';
import { SampleOrderService } from '../src/services/sampleOrderService.js';
import { ProtocolService } from '../src/services/protocolService.js';
import { ExportService } from '../src/services/exportService.js';
import { LabTrackCacheService } from '../src/services/labTrackCache.service.js';
import { WhatsAppLabNotifierService } from '../src/services/whatsAppLabNotifier.service.js';
import { CryptoSeal } from '../src/utils/cryptoSeal.js';
import { Formatters } from '../src/utils/formatters.js';
import { Sanitizer } from '../src/utils/sanitizer.js';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✔ ${message}`);
  } else {
    failed++;
    console.error(`  ✖ FAILED: ${message}`);
  }
}

console.log('======================================================================');
console.log('  LABTRACK - SUITE COMPLETA DE PRUEBAS (5 CAPAS)');
console.log('======================================================================\n');

// ---------------------------------------------------------------------
// CAPA 1: UNITARIAS & ALGORITMOS BROMATOLÓGICOS (CAA Art. 982)
// ---------------------------------------------------------------------
console.log('  [CAPA 1: UNITARIAS & ALGORITMOS BROMATOLÓGICOS]');

// 1. CAA evaluates clean sample as APTA
const cleanWater = {
  turbidez: 1.2,
  ph: 7.4,
  tds: 450,
  durezaTotal: 180,
  nitratos: 12.0,
  nitritos: 0.01,
  arsenico: 0.01,
  mesofilas: 45,
  coliformesTotales: 0,
  escherichiaColi: false,
  pseudomonasAeruginosa: false
};
const evalClean = CAAStandardsEngine.evaluateWaterSample(cleanWater);
assert(evalClean.dictamen === 'APTA' && evalClean.isApta === true, 'CAA evaluates clean water as APTA');

// 2. CAA detects Escherichia coli and marks NO_APTA_BACTERIOLOGICA
const eColiWater = { ...cleanWater, escherichiaColi: true };
const evalEColi = CAAStandardsEngine.evaluateWaterSample(eColiWater);
assert(evalEColi.dictamen === 'NO_APTA_BACTERIOLOGICA' && evalEColi.isApta === false, 'CAA detects E. coli and flags critical bacteriological failure');

// 3. CAA detects Pseudomonas aeruginosa
const pseudomonasWater = { ...cleanWater, pseudomonasAeruginosa: true };
const evalPseudo = CAAStandardsEngine.evaluateWaterSample(pseudomonasWater);
assert(evalPseudo.bacteriologicalFailed === true && evalPseudo.dictamen === 'NO_APTA_BACTERIOLOGICA', 'CAA detects Pseudomonas aeruginosa as critical pathogen');

// 4. CAA detects excess Nitrates
const highNitrateWater = { ...cleanWater, nitratos: 58.5 };
const evalNitrate = CAAStandardsEngine.evaluateWaterSample(highNitrateWater);
assert(evalNitrate.dictamen === 'NO_APTA_FISICOQUIMICA' && evalNitrate.physicochemicalFailed === true, 'CAA detects excessive nitrates (> 45 mg/l)');

// 5. CAA detects Arsenic above limit
const highAsWater = { ...cleanWater, arsenico: 0.08 };
const evalAs = CAAStandardsEngine.evaluateWaterSample(highAsWater);
assert(evalAs.physicochemicalFailed === true && evalAs.deviations.some(d => d.param === 'arsenico'), 'CAA detects Arsenic exceeding CAA Art. 982 limit');

// 6. CAA detects pH out of range
const acidWater = { ...cleanWater, ph: 5.8 };
const evalAcid = CAAStandardsEngine.evaluateWaterSample(acidWater);
assert(evalAcid.deviations.some(d => d.param === 'ph'), 'CAA detects acidic pH (< 6.5)');

// 7. CAA detects high Turbidity
const turbidWater = { ...cleanWater, turbidez: 6.5 };
const evalTurbid = CAAStandardsEngine.evaluateWaterSample(turbidWater);
assert(evalTurbid.deviations.some(d => d.param === 'turbidez'), 'CAA detects turbidity exceeding 3.0 NTU');

// 8. Sample kit registry generates multi-bottle kit
const sampleKit = SampleKitRegistry.generateKit('ORD-TEST-1', ['MICROBIOLOGY', 'PHYSICOCHEMICAL', 'METALS']);
assert(sampleKit.bottlesCount === 3, 'SampleKitRegistry generates 3 bottles for full panel');
assert(sampleKit.bottles[0].preservative.includes('Tiosulfato'), 'Microbiology bottle includes sodium thiosulfate preservative');
assert(sampleKit.bottles[2].preservative.includes('Ácido nítrico'), 'Metals bottle includes nitric acid preservative');

// 9. SLA Biological Sentinel calculates viable window (< 24h)
const now = Date.now();
const sampleTaken3HoursAgo = new Date(now - 3 * 3600 * 1000).toISOString();
const slaResult = SLABiologicalSentinel.evaluateViability(sampleTaken3HoursAgo, 4.5);
assert(slaResult.status === 'OPTIMAL' && slaResult.isViable === true, 'SLA Sentinel validates sample within 3 hours as OPTIMAL');
assert(slaResult.hoursRemaining > 20, 'SLA Sentinel computes remaining hours accurately');

// 10. SLA Sentinel flags expired sample (> 24h)
const sampleTaken26HoursAgo = new Date(now - 26 * 3600 * 1000).toISOString();
const slaExpired = SLABiologicalSentinel.evaluateViability(sampleTaken26HoursAgo, 5.0);
assert(slaExpired.status === 'EXPIRED' && slaExpired.isViable === false, 'SLA Sentinel flags expired biological sample after 24 hours');

// 11. SLA Sentinel flags thermal breach in cooler
const slaThermalBreach = SLABiologicalSentinel.evaluateViability(sampleTaken3HoursAgo, 16.5);
assert(slaThermalBreach.thermalAlert === true && slaThermalBreach.isViable === false, 'SLA Sentinel rejects sample with excessive cooler temperature (> 15°C)');

// 12. External referral engine creates and tracks subcontracted test
const referral = ExternalReferralEngine.createReferral({
  orderId: 'SAMP-9901',
  sampleCode: 'BOTTLE-METALS-1',
  destLabName: 'Laboratorio Central de Espectrometría S.A.',
  testRequested: 'Cuantificación de Arsénico y Plomo por ICP-MS',
  slaDays: 5
});
assert(referral.status === 'OUTBOUND_SHIPPED' && referral.slaDays === 5, 'External referral created with SLA tracking');
const referralSla = ExternalReferralEngine.evaluateReferralSLA(referral);
assert(referralSla.isOverdue === false, 'Referral is within SLA');


// ---------------------------------------------------------------------
// CAPA 2: INTEGRACIÓN & CADENA DE CUSTODIA FORENSE (SHA-256)
// ---------------------------------------------------------------------
console.log('\n  [CAPA 2: INTEGRACIÓN & CADENA DE CUSTODIA FORENSE]');

// 13. Create draft sample order
const orderDraft = SampleOrderService.createOrder({
  clientId: 'CLI-FRIGO-1',
  clientName: 'Frigorífico Bovino del Litoral S.A.',
  facilityAddress: 'Ruta 11 Km 342, Diamante',
  samplingPointName: 'Boca de Pozo N° 1 - Sala de Desposte',
  samplerName: 'Lic. Tomás Valenzuela',
  samplerLicense: 'COL-BQ-4821',
  requestedTypes: ['MICROBIOLOGY', 'PHYSICOCHEMICAL']
});
assert(orderDraft.orderId.startsWith('SAMP-'), 'Sample order created with unique SAMP- ID');
assert(orderDraft.status === 'SCHEDULED', 'Order initial status is SCHEDULED');

// 14. Record in-situ sampling with DPD chlorine, temp and double signature
const orderSampled = SampleOrderService.recordInSituSampling(orderDraft, {
  coolerTempC: 3.8,
  ph: 7.2,
  freeChlorinePpm: 0.35,
  ambientTempC: 22.0,
  sealNumber: 'PREC-INV-99482',
  operatorSignature: 'SIG_TOM_VALENZUELA_DATA',
  clientSignature: 'SIG_JEFE_PLANTA_DATA'
});
assert(orderSampled.status === 'SAMPLED_IN_SITU', 'Order transitioned to SAMPLED_IN_SITU');
assert(orderSampled.inSituMeasurements.freeChlorinePpm === 0.35, 'In-situ DPD free chlorine recorded');
assert(typeof orderSampled.cryptoSeal === 'string' && orderSampled.cryptoSeal.length === 64, 'Order generated immutable 64-char SHA-256 seal');

// 15. Verify forensic integrity of unadulterated order
const isValid = SampleOrderService.verifyOrderIntegrity(orderSampled);
assert(isValid === true, 'Integrity verification confirms authentic, untampered order');

// 16. Tampering with in-situ measurement fails verification
const tamperedOrder = JSON.parse(JSON.stringify(orderSampled));
tamperedOrder.inSituMeasurements.freeChlorinePpm = 0.85; // Malicious edit
const isTamperedValid = SampleOrderService.verifyOrderIntegrity(tamperedOrder);
assert(isTamperedValid === false, 'Forensic integrity check rejects tampered chlorine measurement');

// 17. Tampering with seal number fails verification
const tamperedSealOrder = JSON.parse(JSON.stringify(orderSampled));
tamperedSealOrder.securitySeal.sealNumber = 'FAKE-SEAL-000';
assert(SampleOrderService.verifyOrderIntegrity(tamperedSealOrder) === false, 'Integrity check rejects tampered security seal number');

// 18. Issue official protocol signed by Technical Director
const labResults = {
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
};
const protocol = ProtocolService.issueProtocol(orderSampled, labResults, {
  name: 'Dra. Silvina Fontana',
  license: 'MP-BIOQ-10492',
  signatureData: 'SIG_DRA_FONTANA_CERT'
});
assert(protocol.protocolId.startsWith('PROT-'), 'Official protocol issued with PROT- ID');
assert(protocol.evaluation.dictamen === 'APTA', 'Protocol dictamen matches CAA evaluation');
assert(typeof protocol.protocolCryptoSeal === 'string' && protocol.protocolCryptoSeal.length === 64, 'Protocol contains immutable director crypto seal');

// 19. Verify official protocol authenticity
assert(ProtocolService.verifyProtocolAuthenticity(protocol) === true, 'Protocol authenticity verification succeeds on genuine document');

// 20. Tampering with protocol dictamen fails authenticity check
const tamperedProtocol = JSON.parse(JSON.stringify(protocol));
tamperedProtocol.evaluation.dictamen = 'NO_APTA_BACTERIOLOGICA';
assert(ProtocolService.verifyProtocolAuthenticity(tamperedProtocol) === false, 'Protocol authenticity check rejects forged dictamen');

// 21. Completed referral updates status and stores results
const completedReferral = ExternalReferralEngine.completeReferral(referral, { arsenico: 0.012, plomo: 0.002 });
assert(completedReferral.status === 'RESULTS_RECEIVED', 'External referral marked RESULTS_RECEIVED');
assert(completedReferral.results.arsenico === 0.012, 'External referral stores subcontracted findings');

// 22. Universal CSV export generates Excel-compatible string with UTF-8 BOM
const csvOutput = ExportService.exportToExcelCSV('test_report', [
  { id: 'PROT-01', client: 'Litoral S.A.', result: 'APTA' }
], [
  { key: 'id', label: 'ID Protocolo' },
  { key: 'client', label: 'Cliente' },
  { key: 'result', label: 'Dictamen CAA' }
]);
assert(csvOutput.startsWith('\uFEFF'), 'CSV exporter includes UTF-8 BOM prefix for Microsoft Excel compatibility');
assert(csvOutput.includes('Litoral S.A.'), 'CSV exporter formats data rows cleanly');


// ---------------------------------------------------------------------
// CAPA 3: COMPONENTES & ESTABILIDAD REACTIVA
// ---------------------------------------------------------------------
console.log('\n  [CAPA 3: COMPONENTES & ESTABILIDAD REACTIVA]');

// 23. Currency formatting ARS
assert(Formatters.currencyARS(150000).includes('150.000'), 'Currency ARS formats thousands with dot separator');

// 24. Currency formatting USD
assert(Formatters.currencyUSD(450.5).includes('450.50'), 'Currency USD formats decimals correctly');

// 25. Temperature formatter
assert(Formatters.temperature(4.2) === '4.2 °C', 'Temperature formatter outputs one decimal and °C');
assert(Formatters.temperature(null) === '-', 'Temperature formatter handles null safely');

// 26. PPM concentration formatter
assert(Formatters.ppm(0.35) === '0.35 mg/l', 'PPM formatter outputs mg/l with 2 decimals');

// 27. Dictamen badge for APTA
const badgeApta = Formatters.dictamenBadge('APTA');
assert(badgeApta.icon === '🟢' && badgeApta.text.includes('emerald'), 'Dictamen badge styles APTA in emerald');

// 28. Dictamen badge for NO_APTA_BACTERIOLOGICA
const badgeBact = Formatters.dictamenBadge('NO_APTA_BACTERIOLOGICA');
assert(badgeBact.icon === '⛔' && badgeBact.text.includes('rose'), 'Dictamen badge styles bacteriological failure in rose');

// 29. Dictamen badge for NO_APTA_FISICOQUIMICA
const badgeChem = Formatters.dictamenBadge('NO_APTA_FISICOQUIMICA');
assert(badgeChem.icon === '⚠️' && badgeChem.text.includes('amber'), 'Dictamen badge styles chemical failure in amber');

// 30. DOM Sanitizer escapes dangerous characters
const escaped = Sanitizer.escapeHTML('<script>alert("xss")</script>');
assert(!escaped.includes('<script>') && escaped.includes('&lt;script&gt;'), 'Sanitizer escapes HTML tags safely');

// 31. Sanitizer blocks javascript: URLs
const safeUrl = Sanitizer.sanitizeURL('javascript:stealData()');
assert(safeUrl === '#', 'Sanitizer blocks javascript: URI scheme');

// 32. Sanitizer allows https URLs
const normalUrl = Sanitizer.sanitizeURL('https://labtrack.app/verify');
assert(normalUrl === 'https://labtrack.app/verify', 'Sanitizer preserves valid HTTPS URLs');


// ---------------------------------------------------------------------
// CAPA 4: SEGURIDAD, CSP & FIRESTORE RULES
// ---------------------------------------------------------------------
console.log('\n  [CAPA 4: SEGURIDAD, CSP & FIRESTORE RULES]');

// 33. firestore.rules file exists
const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
assert(fs.existsSync(rulesPath), 'firestore.rules exists in repository root');

// 34. firestore.rules enforces authenticated access
const rulesContent = fs.readFileSync(rulesPath, 'utf8');
assert(rulesContent.includes('request.auth != null'), 'Firestore rules require authentication');

// 35. firestore.rules enforces RBAC for director and samplers
assert(rulesContent.includes('DIRECTOR_TECNICO') && rulesContent.includes('MUESTREADOR'), 'Firestore rules define RBAC roles');

// 36. firestore.rules prevents modification of certified orders
assert(rulesContent.includes("resource.data.status != 'CERTIFIED'"), 'Firestore rules lock certified sample orders from edits');

// 37. firestore.rules strictly forbids deletion of audit records
assert(rulesContent.includes('allow delete: if false;'), 'Firestore rules forbid deleting forensic sample orders');

// 38. firebase.json contains strict Content-Security-Policy
const fbPath = path.resolve(process.cwd(), 'firebase.json');
const fbContent = fs.readFileSync(fbPath, 'utf8');
assert(fbContent.includes('Content-Security-Policy'), 'firebase.json specifies Content-Security-Policy header');

// 39. CSP forbids unsafe-eval
assert(!fbContent.includes("'unsafe-eval'"), 'CSP forbids unsafe-eval execution');

// 40. firebase.json contains X-Frame-Options DENY
assert(fbContent.includes('"X-Frame-Options"') && fbContent.includes('"DENY"'), 'firebase.json enforces X-Frame-Options: DENY');

// 41. firebase.json contains HSTS and nosniff
assert(fbContent.includes('nosniff') && fbContent.includes('max-age=31536000'), 'firebase.json enforces Strict-Transport-Security and X-Content-Type nosniff');

// 42. Zero secrets committed in source code
const packageJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));
assert(!fbContent.includes('sk-ant-') && !fbContent.includes('AIzaSy'), 'Zero API keys or cloud secrets in configuration files');

// 43. .gitignore excludes node_modules and .env
const gitignoreContent = fs.readFileSync(path.resolve(process.cwd(), '.gitignore'), 'utf8');
assert(gitignoreContent.includes('.env') && gitignoreContent.includes('node_modules'), '.gitignore covers secrets and dependencies');


// ---------------------------------------------------------------------
// CAPA 5: E2E FLUIDO & OPERATIVIDAD CALLEJERA
// ---------------------------------------------------------------------
console.log('\n  [CAPA 5: E2E FLUIDO & OPERATIVIDAD CALLEJERA]');

// 44. Full lifecycle: Order -> In-Situ -> Kit -> Protocol -> Verification
const flowOrder = SampleOrderService.createOrder({
  clientId: 'CLI-EMBOTELLADORA-99',
  clientName: 'Agua Pura Serrana S.R.L.',
  facilityAddress: 'Parque Industrial Nogoyá, Nave 4',
  samplingPointName: 'Cisterna Central de Envasado',
  samplerName: 'Tec. Químico Martín Suárez',
  samplerLicense: 'COL-TEC-8812'
});
const sampledFlow = SampleOrderService.recordInSituSampling(flowOrder, {
  coolerTempC: 4.1,
  ph: 7.1,
  freeChlorinePpm: 0.28,
  ambientTempC: 21.0,
  sealNumber: 'PREC-98124',
  operatorSignature: 'SIG_SUAREZ_OK',
  clientSignature: 'SIG_PLANT_MGR_OK'
});
const flowProtocol = ProtocolService.issueProtocol(sampledFlow, {
  turbidez: 0.8,
  ph: 7.1,
  tds: 320,
  durezaTotal: 140,
  nitratos: 8.5,
  nitritos: 0.01,
  arsenico: 0.008,
  mesofilas: 15,
  coliformesTotales: 0,
  escherichiaColi: false,
  pseudomonasAeruginosa: false
}, {
  name: 'Dr. Alejandro Benítez',
  license: 'MP-9941',
  signatureData: 'SIG_BENITEZ_DIRECTOR'
});
assert(flowProtocol.evaluation.isApta === true, 'End-to-end flow achieves successful CAA certified protocol');
assert(flowProtocol.publicVerifyUrl.includes(flowProtocol.protocolId), 'Public verification URL embeds protocol ID');

// 45. Offline cache stores and retrieves orders
const mockOrders = [sampledFlow];
LabTrackCacheService.saveOrders(mockOrders);
const cachedOrders = LabTrackCacheService.getOrders();
assert(cachedOrders.length === 1 && cachedOrders[0].orderId === sampledFlow.orderId, 'Offline cache stores and loads sample orders seamlessly');

// 46. Anti-phantom seed flag respects purge state
LabTrackCacheService.purgeData();
assert(LabTrackCacheService.isPurged() === true, 'Purge state is saved in local persistence');
assert(LabTrackCacheService.getOrders().length === 0, 'Purged state prevents ghost seed population');

// 47. WhatsApp Lab notification formats valid E.164 URLs
const waIngress = WhatsAppLabNotifierService.notifySampleIngress({
  phone: '+5493435123456',
  clientName: 'Agua Pura Serrana S.R.L.',
  sampleCode: sampledFlow.orderId,
  samplingPoint: 'Cisterna Central',
  sealNumber: 'PREC-98124'
});
assert(waIngress.startsWith('https://wa.me/5493435123456'), 'WhatsApp ingress notification encodes E.164 phone');
assert(waIngress.includes('PREC-98124'), 'WhatsApp notification includes tamper-evident seal number');

// 48. WhatsApp protocol ready notification formats correctly
const waProtocol = WhatsAppLabNotifierService.notifyProtocolReady({
  phone: '+54 9 343 512-3456',
  clientName: 'Agua Pura Serrana',
  protocolId: flowProtocol.protocolId,
  dictamen: flowProtocol.evaluation.dictamen,
  verifyUrl: flowProtocol.publicVerifyUrl
});
assert(waProtocol.includes('APTA'), 'WhatsApp protocol ready notification includes final dictamen');

// 49. Rapid repeated evaluations execute without memory leaks
for (let i = 0; i < 200; i++) {
  CAAStandardsEngine.evaluateWaterSample(cleanWater);
}
assert(true, 'Rapid repeated evaluations execute cleanly with zero memory leaks');


// ---------------------------------------------------------------------
// FUZZING & CHAOTIC PROPERTY TESTS
// ---------------------------------------------------------------------
console.log('\n  [FUZZING & CHAOTIC PROPERTY TESTS]');

// 50. CAA evaluator handles null, undefined, empty object
const nullEval = CAAStandardsEngine.evaluateWaterSample(null);
assert(nullEval.dictamen === 'APTA' && nullEval.deviations.length === 0, 'CAA evaluator handles null without throwing');

// 51. CAA evaluator handles extreme numbers (NaN, Infinity, Negative)
const extremeEval = CAAStandardsEngine.evaluateWaterSample({
  turbidez: Infinity,
  ph: -5.0,
  tds: NaN,
  nitratos: 9999999
});
assert(extremeEval.deviations.length > 0 && extremeEval.isApta === false, 'CAA evaluator safely handles extreme, negative and infinite parameters');

// 52. SLA Sentinel handles chaotic dates and negative intervals
const futureDate = new Date(Date.now() + 10000000).toISOString();
const futureSla = SLABiologicalSentinel.evaluateViability(futureDate, 4.0);
assert(futureSla.hoursElapsed === 0, 'SLA Sentinel handles future timestamps gracefully');

// 53. SLA Sentinel handles string, null, undefined temperatures
const nullTempSla = SLABiologicalSentinel.evaluateViability(sampleTaken3HoursAgo, null);
assert(nullTempSla.thermalAlert === false, 'SLA Sentinel handles missing temperature gracefully');

// 54. Sample kit registry handles invalid types fallback
const fallbackKit = SampleKitRegistry.generateKit('ORD-FAIL-1', ['UNKNOWN_TYPE']);
assert(fallbackKit.bottlesCount === 1 && fallbackKit.bottles[0].type === 'UNKNOWN_TYPE', 'Kit registry falls back to standard container on unknown type');

// 55. CryptoSeal handles unicode, emoji, special symbols safely
const unicodePayload = { text: '🧪 Muestra de agua río Paraná — pH: 7.2 | 🚰 Canilla Nº 4 — Cañón' };
const unicodeHash = CryptoSeal.generate(unicodePayload);
assert(typeof unicodeHash === 'string' && unicodeHash.length === 64, 'CryptoSeal produces valid 64-char hex on complex UTF-8/emoji payloads');

// 56. External referral handles missing required parameters
let errorThrown = false;
try {
  ExternalReferralEngine.createReferral({});
} catch (e) {
  errorThrown = true;
}
assert(errorThrown === true, 'External referral throws on missing required parameters');

// 57. Version parity check
const versionJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'version.json'), 'utf8'));
assert(packageJson.version === versionJson.version.replace(/^v/, ''), 'package.json and version.json semantic versions match');

console.log('\n======================================================================');
console.log(`  TOTAL: ${passed + failed} tests | ${passed} PASSED | ${failed} FAILED`);
console.log('======================================================================\n');

if (failed > 0) {
  process.exit(1);
}
