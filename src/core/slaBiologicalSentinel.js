/**
 * SLA Sentinel Biológico & Térmico
 * Control de viabilidad microbiológica (Ventana < 24h a 4°C ± 2°C)
 */
export class SLABiologicalSentinel {
  /**
   * Evalúa el estado de viabilidad de una muestra biológica
   * @param {string|Date} sampleTakenAt
   * @param {number} coolerTemperature in °C
   * @param {string|Date} [platedAt]
   * @param {number} [maxHours=24]
   */
  static evaluateViability(sampleTakenAt, coolerTemperature, platedAt = null, maxHours = 24) {
    if (!sampleTakenAt) {
      return {
        status: 'UNKNOWN',
        hoursElapsed: 0,
        hoursRemaining: maxHours,
        isViable: false,
        reason: 'Fecha de toma de muestra no especificada'
      };
    }

    const start = new Date(sampleTakenAt).getTime();
    const end = platedAt ? new Date(platedAt).getTime() : Date.now();

    if (isNaN(start) || isNaN(end)) {
      return {
        status: 'INVALID_DATE',
        hoursElapsed: 0,
        hoursRemaining: maxHours,
        isViable: false,
        reason: 'Fechas de muestreo o siembra inválidas'
      };
    }

    const diffMs = Math.max(0, end - start);
    const hoursElapsed = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
    const hoursRemaining = Number(Math.max(0, maxHours - hoursElapsed).toFixed(2));

    // Evaluación térmica
    let thermalAlert = false;
    let thermalReason = '';
    if (typeof coolerTemperature === 'number') {
      if (coolerTemperature > 8.0) {
        thermalAlert = true;
        thermalReason = `Temperatura de conservadora (${coolerTemperature}°C) supera el límite de 8.0°C. Riesgo de proliferación bacteriana no representativa.`;
      } else if (coolerTemperature < 0.0) {
        thermalAlert = true;
        thermalReason = `Temperatura de conservadora (${coolerTemperature}°C) bajo cero. Riesgo de lisis celular por congelamiento.`;
      }
    }

    let status = 'OPTIMAL';
    let isViable = true;

    if (hoursElapsed > maxHours) {
      status = 'EXPIRED';
      isViable = false;
    } else if (hoursElapsed >= maxHours - 2) {
      status = 'CRITICAL';
    } else if (hoursElapsed >= maxHours - 8) {
      status = 'WARNING';
    }

    // Si hubo desvío térmico grave, afecta la viabilidad
    if (thermalAlert && coolerTemperature > 15.0) {
      isViable = false;
    }

    return {
      status,
      isViable,
      hoursElapsed,
      hoursRemaining,
      maxHours,
      coolerTemperature,
      thermalAlert,
      thermalReason,
      plated: Boolean(platedAt)
    };
  }
}
