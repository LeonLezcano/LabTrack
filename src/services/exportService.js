/**
 * Universal CSV Exporter con BOM UTF-8 (\uFEFF)
 * Directiva Inquebrantable #17 AiAppFactory Standard
 */
export class ExportService {
  /**
   * Genera y descarga un CSV compatible con Microsoft Excel en Windows
   * @param {string} filename
   * @param {Array<Object>} rows
   * @param {Array<{key: string, label: string}>} columns
   */
  static exportToExcelCSV(filename, rows = [], columns = []) {
    if (!columns.length) {
      throw new Error('Debe especificar columnas para la exportación');
    }

    const headerLine = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(';');

    const dataLines = rows.map(row => {
      return columns.map(c => {
        let val = row[c.key];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(';');
    });

    const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');

    if (typeof window !== 'undefined' && typeof window.Blob !== 'undefined') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    return csvContent;
  }
}
