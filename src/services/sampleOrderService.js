import { CryptoSeal } from '../utils/cryptoSeal.js';
import { SampleKitRegistry } from '../core/sampleKitRegistry.js';
import { SLABiologicalSentinel } from '../core/slaBiologicalSentinel.js';

export class SampleOrderService {
  /**
   * Crea una orden de muestreo in-situ
   */
  static createOrder({
    clientId,
    clientName,
    facilityAddress,
    samplingPointName, // Ej: 'Canilla de Red - Cocina Comedor' o 'Boca de Pozo N° 1'
    samplerName,
    samplerLicense,
    requestedTypes = ['MICROBIOLOGY', 'PHYSICOCHEMICAL'],
    notes = ''
  }) {
    if (!clientId || !clientName || !samplingPointName || !samplerName) {
      throw new Error('Datos obligatorios incompletos para crear orden de muestreo');
    }

    const orderId = `SAMP-${Date.now().toString(36).slice(-4)}-${Math.random().toString(36).slice(2, 6)}`;
    const kit = SampleKitRegistry.generateKit(orderId, requestedTypes);

    return {
      orderId,
      clientId,
      clientName,
      facilityAddress,
      samplingPointName,
      samplerName,
      samplerLicense,
      notes,
      kit,
      status: 'SCHEDULED', // SCHEDULED, SAMPLED_IN_SITU, IN_LAB, CERTIFIED
      inSituMeasurements: {
        coolerTempC: null,
        ph: null,
        freeChlorinePpm: null, // Reactivo DPD in-situ
        ambientTempC: null
      },
      securitySeal: {
        sealNumber: null,
        photoWitnessUrl: null
      },
      samplingTimestamp: null,
      operatorSignature: null,
      clientSignature: null,
      cryptoSeal: null
    };
  }

  /**
   * Registra las determinaciones in-situ y precinto de seguridad en el punto de toma
   */
  static recordInSituSampling(order, {
    coolerTempC,
    ph,
    freeChlorinePpm,
    ambientTempC = 20.0,
    sealNumber,
    photoWitnessUrl = 'data:image/svg+xml;base64,sampleWitness',
    operatorSignature,
    clientSignature
  }) {
    if (!order) throw new Error('Orden no especificada');
    if (order.status === 'CERTIFIED') {
      throw new Error('No se puede modificar una orden ya certificada');
    }
    if (!sealNumber) {
      throw new Error('El número de precinto inviolable es obligatorio para la cadena de custodia');
    }
    if (!operatorSignature || !clientSignature) {
      throw new Error('Se requiere la doble firma ePOD (Muestreador y Responsable de Planta)');
    }

    const samplingTimestamp = new Date().toISOString();

    const updated = {
      ...order,
      status: 'SAMPLED_IN_SITU',
      samplingTimestamp,
      inSituMeasurements: {
        coolerTempC: Number(coolerTempC) || 4.0,
        ph: Number(ph) || 7.0,
        freeChlorinePpm: Number(freeChlorinePpm) || 0.0,
        ambientTempC: Number(ambientTempC) || 20.0
      },
      securitySeal: {
        sealNumber: String(sealNumber).trim(),
        photoWitnessUrl
      },
      operatorSignature: {
        signedBy: order.samplerName,
        license: order.samplerLicense,
        timestamp: samplingTimestamp,
        signatureData: operatorSignature
      },
      clientSignature: {
        signedBy: order.clientName,
        timestamp: samplingTimestamp,
        signatureData: clientSignature
      }
    };

    // Sello Criptográfico Inmutable SHA-256
    const payloadToSeal = {
      orderId: updated.orderId,
      clientId: updated.clientId,
      samplingPointName: updated.samplingPointName,
      samplingTimestamp: updated.samplingTimestamp,
      inSituMeasurements: updated.inSituMeasurements,
      securitySeal: updated.securitySeal,
      signatures: {
        op: updated.operatorSignature.signatureData,
        cli: updated.clientSignature.signatureData
      }
    };

    updated.cryptoSeal = CryptoSeal.generate(payloadToSeal);
    return updated;
  }

  /**
   * Verifica la integridad forense del acta de muestreo
   */
  static verifyOrderIntegrity(order) {
    if (!order || !order.cryptoSeal) return false;

    const payloadToSeal = {
      orderId: order.orderId,
      clientId: order.clientId,
      samplingPointName: order.samplingPointName,
      samplingTimestamp: order.samplingTimestamp,
      inSituMeasurements: order.inSituMeasurements,
      securitySeal: order.securitySeal,
      signatures: {
        op: order.operatorSignature?.signatureData,
        cli: order.clientSignature?.signatureData
      }
    };

    return CryptoSeal.verify(payloadToSeal, order.cryptoSeal);
  }
}
