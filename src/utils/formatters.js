/**
 * Formatters para LabTrack
 */
export const Formatters = {
  currencyARS(amount) {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2
    }).format(num);
  },

  currencyUSD(amount) {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(num);
  },

  date(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  temperature(temp) {
    if (temp === null || temp === undefined || isNaN(temp)) return '-';
    return `${Number(temp).toFixed(1)} °C`;
  },

  ppm(val) {
    if (val === null || val === undefined || isNaN(val)) return '-';
    return `${Number(val).toFixed(2)} mg/l`;
  },

  dictamenBadge(dictamen) {
    if (dictamen === 'APTA') {
      return {
        label: 'AGUA APTA PARA CONSUMO (CAA Art. 982)',
        bg: 'bg-emerald-500/20',
        text: 'text-emerald-400',
        border: 'border-emerald-500/40',
        icon: '🟢'
      };
    }
    if (dictamen === 'NO_APTA_BACTERIOLOGICA') {
      return {
        label: 'NO APTA (CONTAMINACIÓN BACTERIOLÓGICA)',
        bg: 'bg-rose-500/20',
        text: 'text-rose-400',
        border: 'border-rose-500/40',
        icon: '⛔'
      };
    }
    if (dictamen === 'NO_APTA_FISICOQUIMICA') {
      return {
        label: 'NO APTA (DESVÍO FISICOQUÍMICO)',
        bg: 'bg-amber-500/20',
        text: 'text-amber-400',
        border: 'border-amber-500/40',
        icon: '⚠️'
      };
    }
    return {
      label: 'EN ANÁLISIS / PENDIENTE',
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      border: 'border-blue-500/40',
      icon: '⏳'
    };
  }
};
