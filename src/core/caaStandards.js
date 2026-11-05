/**
 * Normas del Código Alimentario Argentino (CAA Art. 982)
 * Agua Potable / Suministro Público y Privado
 */
export const CAA_LIMITS = {
  // Fisicoquímicos
  turbidez: { max: 3.0, unit: 'NTU', name: 'Turbidez' },
  ph: { min: 6.5, max: 8.5, unit: 'Escala', name: 'pH' },
  tds: { max: 1500.0, unit: 'mg/l', name: 'Sólidos Disueltos Totales' },
  durezaTotal: { max: 400.0, unit: 'mg/l CaCO3', name: 'Dureza Total' },
  cloroResidual: { min: 0.20, max: 0.50, unit: 'mg/l Cl2', name: 'Cloro Libre Residual (In-situ)' },
  nitratos: { max: 45.0, unit: 'mg/l NO3-', name: 'Nitratos' },
  nitritos: { max: 0.10, unit: 'mg/l NO2-', name: 'Nitritos' },
  arsenico: { max: 0.05, unit: 'mg/l As', name: 'Arsénico' },
  cloruros: { max: 350.0, unit: 'mg/l Cl-', name: 'Cloruros' },
  sulfatos: { max: 400.0, unit: 'mg/l SO4=', name: 'Sulfatos' },

  // Bacteriológicos (Criterios Críticos de Inocuidad)
  mesofilas: { max: 500, unit: 'UFC/ml', name: 'Bacterias Aerobias Mesófilas (37°C - 24h)' },
  coliformesTotales: { max: 3, unit: 'NMP/100ml', name: 'Coliformes Totales' },
  escherichiaColi: { allowed: false, unit: 'en 100ml', name: 'Escherichia coli (Ausencia)' },
  pseudomonasAeruginosa: { allowed: false, unit: 'en 100ml', name: 'Pseudomonas aeruginosa (Ausencia)' }
};

export class CAAStandardsEngine {
  /**
   * Evalúa los resultados analíticos contra el Código Alimentario Argentino
   * @param {Object} results
   * @returns {Object} dictamen, deviations, summary
   */
  static evaluateWaterSample(results = {}) {
    const data = results || {};
    const deviations = [];
    let bacteriologicalFailed = false;
    let physicochemicalFailed = false;

    // 1. Evaluación Bacteriológica (Crítica)
    if (data.escherichiaColi === true || data.escherichiaColi === 'PRESENCIA') {
      deviations.push({
        param: 'escherichiaColi',
        name: CAA_LIMITS.escherichiaColi.name,
        found: 'PRESENCIA',
        limit: 'Ausencia en 100 ml',
        severity: 'CRITICAL',
        type: 'BACTERIOLOGICAL'
      });
      bacteriologicalFailed = true;
    }

    if (data.pseudomonasAeruginosa === true || data.pseudomonasAeruginosa === 'PRESENCIA') {
      deviations.push({
        param: 'pseudomonasAeruginosa',
        name: CAA_LIMITS.pseudomonasAeruginosa.name,
        found: 'PRESENCIA',
        limit: 'Ausencia en 100 ml',
        severity: 'CRITICAL',
        type: 'BACTERIOLOGICAL'
      });
      bacteriologicalFailed = true;
    }

    if (typeof data.coliformesTotales === 'number' && data.coliformesTotales > CAA_LIMITS.coliformesTotales.max) {
      deviations.push({
        param: 'coliformesTotales',
        name: CAA_LIMITS.coliformesTotales.name,
        found: data.coliformesTotales,
        limit: `< ${CAA_LIMITS.coliformesTotales.max} ${CAA_LIMITS.coliformesTotales.unit}`,
        severity: 'HIGH',
        type: 'BACTERIOLOGICAL'
      });
      bacteriologicalFailed = true;
    }

    if (typeof data.mesofilas === 'number' && data.mesofilas > CAA_LIMITS.mesofilas.max) {
      deviations.push({
        param: 'mesofilas',
        name: CAA_LIMITS.mesofilas.name,
        found: data.mesofilas,
        limit: `< ${CAA_LIMITS.mesofilas.max} ${CAA_LIMITS.mesofilas.unit}`,
        severity: 'MEDIUM',
        type: 'BACTERIOLOGICAL'
      });
      bacteriologicalFailed = true;
    }

    // 2. Evaluación Fisicoquímica
    if (typeof data.nitratos === 'number' && data.nitratos > CAA_LIMITS.nitratos.max) {
      deviations.push({
        param: 'nitratos',
        name: CAA_LIMITS.nitratos.name,
        found: data.nitratos,
        limit: `Max ${CAA_LIMITS.nitratos.max} ${CAA_LIMITS.nitratos.unit}`,
        severity: 'HIGH',
        type: 'PHYSICOCHEMICAL'
      });
      physicochemicalFailed = true;
    }

    if (typeof data.arsenico === 'number' && data.arsenico > CAA_LIMITS.arsenico.max) {
      deviations.push({
        param: 'arsenico',
        name: CAA_LIMITS.arsenico.name,
        found: data.arsenico,
        limit: `Max ${CAA_LIMITS.arsenico.max} ${CAA_LIMITS.arsenico.unit}`,
        severity: 'CRITICAL',
        type: 'PHYSICOCHEMICAL'
      });
      physicochemicalFailed = true;
    }

    if (typeof data.turbidez === 'number' && data.turbidez > CAA_LIMITS.turbidez.max) {
      deviations.push({
        param: 'turbidez',
        name: CAA_LIMITS.turbidez.name,
        found: data.turbidez,
        limit: `Max ${CAA_LIMITS.turbidez.max} ${CAA_LIMITS.turbidez.unit}`,
        severity: 'MEDIUM',
        type: 'PHYSICOCHEMICAL'
      });
      physicochemicalFailed = true;
    }

    if (typeof data.ph === 'number' && (data.ph < CAA_LIMITS.ph.min || data.ph > CAA_LIMITS.ph.max)) {
      deviations.push({
        param: 'ph',
        name: CAA_LIMITS.ph.name,
        found: data.ph,
        limit: `${CAA_LIMITS.ph.min} - ${CAA_LIMITS.ph.max}`,
        severity: 'MEDIUM',
        type: 'PHYSICOCHEMICAL'
      });
      physicochemicalFailed = true;
    }

    if (typeof data.tds === 'number' && data.tds > CAA_LIMITS.tds.max) {
      deviations.push({
        param: 'tds',
        name: CAA_LIMITS.tds.name,
        found: data.tds,
        limit: `Max ${CAA_LIMITS.tds.max} ${CAA_LIMITS.tds.unit}`,
        severity: 'MEDIUM',
        type: 'PHYSICOCHEMICAL'
      });
      physicochemicalFailed = true;
    }

    if (typeof data.durezaTotal === 'number' && data.durezaTotal > CAA_LIMITS.durezaTotal.max) {
      deviations.push({
        param: 'durezaTotal',
        name: CAA_LIMITS.durezaTotal.name,
        found: data.durezaTotal,
        limit: `Max ${CAA_LIMITS.durezaTotal.max} ${CAA_LIMITS.durezaTotal.unit}`,
        severity: 'LOW',
        type: 'PHYSICOCHEMICAL'
      });
      physicochemicalFailed = true;
    }

    // Dictamen Final
    let dictamen = 'APTA';
    let summary = 'La muestra analizada CUMPLE con las especificaciones del Código Alimentario Argentino (Art. 982) para agua potable de suministro.';

    if (bacteriologicalFailed) {
      dictamen = 'NO_APTA_BACTERIOLOGICA';
      summary = 'La muestra NO ES APTA para consumo humano debido a contaminación bacteriológica. Se recomienda desinfección urgente de reservorios y cañerías.';
    } else if (physicochemicalFailed) {
      dictamen = 'NO_APTA_FISICOQUIMICA';
      summary = 'La muestra NO ES APTA para consumo humano debido a desvíos fisicoquímicos en relación a los límites máximos tolerables.';
    }

    return {
      dictamen,
      isApta: dictamen === 'APTA',
      bacteriologicalFailed,
      physicochemicalFailed,
      deviations,
      summary,
      evaluatedAt: new Date().toISOString()
    };
  }
}
