/**
 * WhatsApp Lab Notifier Service
 * Formatea enlaces directos E.164 para notificaciones a directivos y clientes
 */
export class WhatsAppLabNotifierService {
  /**
   * Genera enlace de notificación de muestra ingresada
   */
  static notifySampleIngress({ phone, clientName, sampleCode, samplingPoint, sealNumber }) {
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const text = `🧪 *LabTrack Informa* 🧪\n\nEstimado/a *${clientName}*:\nSe ha registrado la toma de muestra *${sampleCode}* en *${samplingPoint}*.\n\n🔒 *Precinto:* ${sealNumber}\n🧊 *Cadena de custodia:* Activa y refrigerada.\n\nEl protocolo se emitirá al finalizar el período de incubación.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }

  /**
   * Genera enlace de notificación de Protocolo Emitido
   */
  static notifyProtocolReady({ phone, clientName, protocolId, dictamen, verifyUrl }) {
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const icon = dictamen === 'APTA' ? '🟢' : '⛔';
    const text = `📋 *LabTrack - Protocolo Analítico Emitido*\n\nEstimado/a *${clientName}*:\nSu protocolo oficial *${protocolId}* ya está disponible.\n\n${icon} *Dictamen:* ${dictamen}\n🔍 *Verificación Criptográfica:* ${verifyUrl}\n\nEmitido bajo estándares del Código Alimentario Argentino (CAA Art. 982).`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }
}
