/** Cookie de la compuerta del Caso 001. Vive aparte para que la server action
 *  y el componente de la compuerta no se importen en círculo. */
export const CASO001_COOKIE = "totto_caso001_pass";

/** Ruta protegida: la usan la cookie (scope) y el redirect de la acción. */
export const CASO001_ROUTE = "/totto/caso-001";
