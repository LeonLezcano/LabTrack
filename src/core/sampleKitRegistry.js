/**
 * Registro de Kits de Muestreo Multi-Frasco
 * AiAppFactory Engine #164 Standard
 */
export const BOTTLE_TYPES = {
  MICROBIOLOGY: {
    id: 'MICRO',
    name: 'Frasco Bacteriológico Estéril',
    container: 'Vidrio boro / Polipropileno estéril',
    volumeMl: 500,
    preservative: 'Tiosulfato de sodio (neutralizador de cloro)',
    storageTemp: '2°C a 6°C con hielo',
    maxHoursToPlating: 24,
    colorCode: '#3b82f6' // Blue
  },
  PHYSICOCHEMICAL: {
    id: 'PHYSICO',
    name: 'Bidón Fisicoquímico General',
    container: 'Polietileno de alta densidad',
    volumeMl: 1500,
    preservative: 'Sin conservante químico (enjuague in-situ)',
    storageTemp: 'Refrigerado 4°C',
    maxHoursToPlating: 48,
    colorCode: '#10b981' // Green
  },
  METALS: {
    id: 'METALS',
    name: 'Frasco Metales Pesados',
    container: 'Polietileno lavado con ácido',
    volumeMl: 500,
    preservative: 'Ácido nítrico (HNO3) hasta pH < 2',
    storageTemp: 'Ambiente / Refrigerado',
    maxHoursToPlating: 168, // 7 days
    colorCode: '#f59e0b' // Amber
  }
};

export class SampleKitRegistry {
  /**
   * Genera un kit multi-frasco para un punto de muestreo
   * @param {string} orderId
   * @param {Array<string>} requestedTypes ['MICROBIOLOGY', 'PHYSICOCHEMICAL', 'METALS']
   */
  static generateKit(orderId, requestedTypes = ['MICROBIOLOGY', 'PHYSICOCHEMICAL']) {
    if (!orderId) throw new Error('Se requiere un orderId para generar el kit');

    const bottles = requestedTypes.map((typeKey, idx) => {
      const spec = BOTTLE_TYPES[typeKey] || BOTTLE_TYPES.MICROBIOLOGY;
      const bottleCode = `${orderId}-${spec.id}-${idx + 1}`;
      return {
        code: bottleCode,
        type: typeKey,
        name: spec.name,
        container: spec.container,
        volumeMl: spec.volumeMl,
        preservative: spec.preservative,
        colorCode: spec.colorCode,
        maxHoursToPlating: spec.maxHoursToPlating,
        qrPayload: `LABTRACK://${orderId}/${bottleCode}`
      };
    });

    return {
      kitId: `KIT-${orderId}`,
      orderId,
      createdAt: new Date().toISOString(),
      bottlesCount: bottles.length,
      bottles
    };
  }
}
