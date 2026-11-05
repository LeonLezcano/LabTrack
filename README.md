# 🧪 LabTrack — Cadena de Custodia & Laboratorios de Aguas y Bromatología

> **AiAppFactory Standard · Versión v1.0.00**  
> *Gestión de Muestreos In-Situ, Precintos Inviolables, Semáforo de SLA Biológico (< 24h a 4°C), Dictamen Código Alimentario Argentino (CAA Art. 982) y Protocolos Criptográficos con SHA-256.*

---

## 🔬 La Problemática del Sector

Los laboratorios de análisis de aguas, alimentos y muestras ambientales enfrentan cuatro focos críticos de fricción legal y operativa:
1. **Caída de la Cadena de Custodia en Juicios o Inspecciones:** Disputas cuando un análisis de agua o hisopado de frigorífico resulta contaminado (*Escherichia coli*, arsénico o nitratos altos). Sin un acta inmutable, el auditado impugna alegando mala preservación o vencimiento de la muestra.
2. **Pérdida de Parámetros Volátiles In-Situ:** El cloro libre activo se degrada en 15 minutos al contacto con la luz. Si el tomador de muestras no mide el Cloro DPD y pH en la canilla misma, el ensayo bacteriológico posterior carece de validez pericial.
3. **Vencimiento del Tiempo de Tránsito (SLA Biológico < 24h):** Por normas IRAM y *Standard Methods for the Examination of Water and Wastewater*, no pueden transcurrir más de 24 horas a $4^\circ\text{C} \pm 2^\circ\text{C}$ entre la extracción y la inoculación en agar a $37^\circ\text{C}$. Muestra fuera de término es muestra invalidada.
4. **Dictamen Manual del Código Alimentario Argentino (CAA Art. 982):** Comparación manual tediosa y propensa a errores entre determinaciones de laboratorio y límites de turbidez ($< 3\text{ NTU}$), nitratos ($< 45\text{ mg/l}$), arsénico ($< 0.05\text{ mg/l}$) y coliformes.

---

## ⚡ Soluciones Arquitectónicas Implementadas en LabTrack

### 1. 🔒 Acta Digital In-Situ con Doble Firma ePOD y Sello SHA-256
- Registro en el punto de toma con georreferenciación, número de precinto inviolable y foto testigo.
- Determinación obligatoria in-situ de **Cloro Libre Residual (Reactivo DPD en mg/l)**, **pH** y **Temperatura de Conservadora**.
- Doble firma digital (Tomador de Muestras y Responsable de Planta/Cliente) sellada con hash SHA-256 inmutable contra cualquier alteración posterior (Engine #159 y #245).

### 2. 🧪 Kits Multi-Frasco con Identificadores Cruzados
- Registro automático de recipientes específicos por matriz:
  - **Frasco Bacteriológico:** Estéril con Tiosulfato de sodio (neutralizador de cloro).
  - **Bidón Fisicoquímico:** Polietileno alta densidad sin conservante químico.
  - **Frasco Metales Pesados:** Acidificado con Ácido Nítrico ($HNO_3$) hasta $\text{pH} < 2$.

### 3. ⏱️ Semáforo de SLA Biológico (< 24h) y Alerta Térmica
- Cuenta regresiva visual en vivo de las horas restantes antes del vencimiento de la muestra para siembra en estufa a $37^\circ\text{C}$.
- Detección de desvíos térmicos en conservadora ($> 8.0^\circ\text{C}$ o $< 0.0^\circ\text{C}$).

### 4. ⚖️ Motor de Evaluación Oficial CAA Art. 982
- Comparación algorítmica instantánea de las determinaciones de laboratorio contra los límites máximos tolerables de la ley nacional.
- Generación automática de dictamen institucional:
  - 🟢 **AGUA APTA PARA CONSUMO (CAA Art. 982)**
  - ⛔ **NO APTA (CONTAMINACIÓN BACTERIOLÓGICA)**
  - ⚠️ **NO APTA (DESVÍO FISICOQUÍMICO)**

### 5. 📋 Protocolos Analíticos Oficiales & Exportación Excel
- Emisión de certificado digital firmado por el **Director Técnico (Bioquímico / Químico)** con matrícula profesional y sello criptográfico.
- Código QR público de verificación para inspectores municipales o bromatológicos.
- Exportación universal de protocolos en CSV con prefijo **BOM UTF-8 (`\uFEFF`)** para compatibilidad nativa con Microsoft Excel en Windows (Directiva Inquebrantable #17).

### 6. 🚚 Gestión de Derivaciones Externas de Alta Complejidad
- Trazabilidad y cuenta de días de SLA para análisis tercerizados a laboratorios centrales (Espectrometría de Masas ICP-MS, Pesticidas, Dioxinas) (Engine #133).

---

## 🧪 Arnés de Pruebas Multi-Capa (72 Tests en 5 Capas)

Ejecución de la suite completa:
```bash
node tests/run_tests.js
```
- **Capa 1 (Unitarias & Bromatología):** Validación CAA Art. 982, SLA biológico, kits multi-frasco y derivaciones.
- **Capa 2 (Integración & Forense):** Actas in-situ, precintos, sellos SHA-256, detección de adulteración, protocolos y exportador CSV con BOM UTF-8.
- **Capa 3 (Componentes & DOM):** Formateadores de moneda/temperatura/ppm, badges de dictamen y prevención de XSS con Sanitizer Zero-Sink.
- **Capa 4 (Seguridad, CSP & Firestore Rules):** Auditoría AppSec Guardian 100/100, aislamiento multi-cliente y reglas RBAC.
- **Capa 5 (E2E & Fuzzing Caótico):** Flujo completo de muestreo, persistencia offline, alertas WhatsApp E.164 y fuzzing con valores extremos de pH/concentraciones.

---

## 🛡️ Auditoría de Seguridad AppSec Guardian

```bash
node ../AiAppFactory/tools/security-guardian/index.mjs .
```
- **Puntaje de Seguridad:** **100 / 100**
- **Vulnerabilidades:** 0 Críticas | 0 Altas | 0 Medias | 0 Bajas.

---

## 🚀 Despliegue & Ejecución

```bash
# Servidor local
python -m http.server 5220

# Abrir en navegador
http://localhost:5220
```

---

*Desarrollado bajo los estándares de ingeniería y seguridad de AiAppFactory.*
