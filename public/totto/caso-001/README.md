# Evidencia · Caso 001 (Stoik Intel × Totto)

Las capturas del expediente se sirven desde esta carpeta como
`/totto/caso-001/<slug>.webp`. El microsite (`/totto/caso-001`) las pide por su
nombre semántico; si un archivo no está montado, el marco lo declara como
**anexo pendiente** en vez de romperse o de fingir la evidencia.

## Archivos esperados

| Archivo                        | Qué muestra                                                        |
| ------------------------------ | ------------------------------------------------------------------ |
| `fb-post-modal-trio.webp`      | Post de Facebook «TRIO TOTTO TIPO RÉPLICA $55.000»                  |
| `corpus-grid.webp`             | Mosaico del corpus de falsificaciones etiquetadas a mano            |
| `dropi-leydi-header.webp`      | Encabezado del perfil de proveedor: órdenes, revendedores, despacho |
| `dropi-catalogo-stocks.webp`   | Catálogo con el stock por referencia                                |
| `wa-leidy-fabricante.webp`     | Perfil «Fabricante de Bolsos · Cel 3223551657»                      |
| `incautacion-bodega.webp`      | Incautación de la Policía Nacional                                  |
| `dropi-cristobal-perfil.webp`  | Perfil de proveedor del segundo hermano                             |
| `dropi-cards-200.webp`         | Tarjetas de los revendedores asociados a la cuenta                  |
| `fb-jlshoes-contacto.webp`     | Ficha de contacto de la página JL Shoes                             |
| `fb-post-sonia.webp`           | Publicación de otra vendedora con la misma foto de fábrica          |

## Reglas

1. **Nunca deformar una evidencia.** El marco usa `object-fit: contain` y
   respeta la relación de aspecto original: basta con exportar la captura tal
   cual, sin recortes que cambien lo que se ve.
2. **Formato `.webp` optimizado**, no base64. Peso objetivo ≤ 250 KB por pieza
   para no comprometer el LCP.
3. **Evidencia congelada.** Ninguna imagen debe enlazar ni incrustar contenido
   vivo del infractor: no se le da tráfico a la falsificación.
4. **Verificar contra el original** antes de dar el microsite por cerrado: cada
   cifra en pantalla tiene que poder rastrearse a la captura que la sostiene.
5. Los textos alternativos de cada pieza están en
   `src/lib/totto/caso001.ts` (`EVIDENCE`), no en el nombre del archivo.
