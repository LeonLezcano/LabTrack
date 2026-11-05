/**
 * Motor de Derivaciones a Laboratorios Externos
 * AiAppFactory Engine #133 Standard
 */
export class ExternalReferralEngine {
  /**
   * Crea una derivación de muestra para análisis de alta complejidad
   * @param {Object} data
   */
  static createReferral({
    orderId,
    sampleCode,
    destLabName,
    testRequested,
    slaDays = 5,
    shippedAt = new Date().toISOString()
  }) {
    if (!orderId || !sampleCode || !destLabName || !testRequested) {
      throw new Error('Faltan datos obligatorios para registrar la derivación');
    }

    const shippedTime = new Date(shippedAt).getTime();
    const expectedDueDate = new Date(shippedTime + slaDays * 24 * 60 * 60 * 1000).toISOString();

    return {
      referralId: `REF-${orderId.slice(-4)}-${Math.random().toString(36).slice(2, 6)}`,
      orderId,
      sampleCode,
      destLabName,
      testRequested,
      slaDays,
      shippedAt,
      expectedDueDate,
      status: 'OUTBOUND_SHIPPED', // OUTBOUND_SHIPPED, IN_PROCESS, RESULTS_RECEIVED
      results: null,
      receivedAt: null
    };
  }

  /**
   * Evalúa el cumplimiento de SLA de una derivación
   * @param {Object} referral
   */
  static evaluateReferralSLA(referral) {
    if (!referral) return { isOverdue: false, daysRemaining: 0 };
    if (referral.status === 'RESULTS_RECEIVED') {
      return { isOverdue: false, completed: true, status: 'RECEIVED' };
    }

    const dueTime = new Date(referral.expectedDueDate).getTime();
    const now = Date.now();
    const diffMs = dueTime - now;
    const daysRemaining = Number((diffMs / (1000 * 60 * 60 * 24)).toFixed(1));

    return {
      isOverdue: diffMs < 0,
      daysRemaining: Math.max(0, daysRemaining),
      status: diffMs < 0 ? 'OVERDUE_SLA' : 'ON_TRACK'
    };
  }

  /**
   * Registra recepción de resultados del laboratorio externo
   * @param {Object} referral
   * @param {Object} results
   */
  static completeReferral(referral, results) {
    if (!referral) throw new Error('Referral inválido');
    return {
      ...referral,
      status: 'RESULTS_RECEIVED',
      results,
      receivedAt: new Date().toISOString()
    };
  }
}
