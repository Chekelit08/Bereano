# La oferta de Bereano Plus

Usa la ecuación de valor:

> **Valor = resultado soñado × probabilidad de lograrlo ÷ (tiempo hasta verlo × esfuerzo)**

Cada parte de la oferta tiene que subir algo de arriba o bajar algo de abajo. Si no mueve nada, sobra.

## El puente entero

Se vende el resultado, no una lista de funciones.

| | |
|---|---|
| **Punto A** (en palabras del usuario) | "Empiezo a leer la Biblia y a los pocos días lo dejo. Leo y no entiendo. No sé cómo aplicarlo." |
| **Punto B** | "Leo cada día, entiendo lo que leo y lo vivo." |
| **Núcleo** (el dolor principal) | El compañero que explica cualquier pasaje, con citas verificadas. |
| **Lo que completa el puente** | Planes (la Biblia en un año y por tema), escuchar la Biblia, recordatorio y racha, oración guiada, memorizar, diario. |

## Las seis partes

1. **Promesa:** "Leé la Biblia cada día y entendé lo que leés. 10 minutos por día." Prometemos solo lo que depende de nosotros, nunca "te va a cambiar la vida en 30 días".
2. **Núcleo:** el compañero de estudio.
3. **Lo que completa el puente:** se agrupa en "Entendé · Sostenelo · Vivilo".
4. **Plazo:** primera respuesta en 1 minuto (el onboarding lleva directo al devocional y a una pregunta). El hábito se arma con el plan diario.
5. **Garantía:** 7 días gratis; si no te sirve, cancelás antes y no pagás nada. La maneja la tienda.
6. **Precio, al lado del costo:** USD 3,33 por mes con el plan anual, menos que un café. Lo esencial sigue gratis: la Biblia, el devocional, los temas y la oración.

## Cómo sube cada parte de la ecuación

- **Resultado soñado:** hábito diario + entender + aplicar.
- **Probabilidad:**
  - citas verificadas contra el texto bíblico;
  - prueba gratis;
  - **falta:** testimonios reales de la prueba con 30 a 50 personas. Nunca inventarlos.
- **Tiempo:** valor en el primer minuto.
- **Esfuerzo:** 10 minutos por día, escuchar en vez de leer, recordatorio, nada que configurar.

## Dónde está aplicada

- Paywall: `app/src/app/plus.tsx`.
- Landing: las secciones Plus, precio y preguntas frecuentes de `landing/index.html`.

## Para probar después (semanas 11 a 13)

Tests A/B de mensaje en la landing y en el paywall:

- promesa "entendé lo que leés" vs. "no lo dejes a los pocos días";
- ancla "menos que un café" vs. precio por día.

Errores a evitar:

- vender funciones sueltas;
- dar el precio sin el ancla;
- prometer resultados que no dependen de nosotros.
