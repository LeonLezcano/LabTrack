import { CAAStandardsEngine } from '../core/caaStandards.js';
import { CryptoSeal } from '../utils/cryptoSeal.js';

export class ProtocolService {
  /**
   * Emite el protocolo oficial de análisis firmado por el Director Técnico
   * @param {Object} sampleOrder
   * @param {Object} labResults
   * @param {Object} directorSignature
   */
  static issueProtocol(sampleOrder, labResults, directorSignature = {}) {
    if (!sampleOrder) throw new Error('Se requiere la orden de muestreo para emitir protocolo');
    if (!sampleOrder.cryptoSeal) {
      throw new Error('La orden de muestreo debe contar con acta in-situ sellada y cadena de custodia');
    }
    if (!directorSignature.name || !directorSignature.license) {
      throw new Error('Se requiere nombre y matrícula profesional del Director Técnico');
    }

    // Evaluación oficial CAA Art. 982
    const caaEvaluation = CAAStandardsEngine.evaluateWaterSample(labResults);

    const protocolId = `PROT-${sampleOrder.orderId.replace('SAMP-', '')}`;
    const issuedAt = new Date().toISOString();

    const protocol = {
      protocolId,
      orderId: sampleOrder.orderId,
      clientId: sampleOrder.clientId,
      clientName: sampleOrder.clientName,
      facilityAddress: sampleOrder.facilityAddress,
      samplingPointName: sampleOrder.samplingPointName,
      samplingTimestamp: sampleOrder.samplingTimestamp,
      issuedAt,
      sampleOrderSeal: sampleOrder.cryptoSeal,
      inSituMeasurements: sampleOrder.inSituMeasurements,
      labResults: {
        turbidez: labResults.turbidez ?? null,
        ph: labResults.ph ?? sampleOrder.inSituMeasurements.ph,
        tds: labResults.tds ?? null,
        durezaTotal: labResults.durezaTotal ?? null,
        nitratos: labResults.nitratos ?? null,
        nitritos: labResults.nitritos ?? null,
        arsenico: labResults.arsenico ?? null,
        mesofilas: labResults.mesofilas ?? null,
        coliformesTotales: labResults.coliformesTotales ?? null,
        escherichiaColi: labResults.escherichiaColi ?? false,
        pseudomonasAeruginosa: labResults.pseudomonasAeruginosa ?? false
      },
      evaluation: caaEvaluation,
      technicalDirector: {
        name: directorSignature.name,
        license: directorSignature.license,
        signedAt: issuedAt,
        digitalSignature: directorSignature.signatureData || 'SIG_DT_VERIFIED'
      },
      publicVerifyUrl: `https://labtrack.app/verify?id=${protocolId}`,
      protocolCryptoSeal: null
    };

    // Sellado criptográfico del protocolo oficial
    const sealPayload = {
      protocolId: protocol.protocolId,
      orderId: protocol.orderId,
      dictamen: caaEvaluation.dictamen,
      results: protocol.labResults,
      directorLicense: protocol.technicalDirector.license,
      issuedAt: protocol.issuedAt
    };

    protocol.protocolCryptoSeal = CryptoSeal.generate(sealPayload);
    return protocol;
  }

  /**
   * Valida la autenticidad del protocolo oficial
   */
  static verifyProtocolAuthenticity(protocol) {
    if (!protocol || !protocol.protocolCryptoSeal) return false;

    const sealPayload = {
      protocolId: protocol.protocolId,
      orderId: protocol.orderId,
      dictamen: protocol.evaluation?.dictamen,
      results: protocol.labResults,
      directorLicense: protocol.technicalDirector?.license,
      issuedAt: protocol.issuedAt
    };

    return CryptoSeal.verify(sealPayload, protocol.protocolCryptoSeal);
  }
}
