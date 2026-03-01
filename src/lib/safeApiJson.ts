function getEndpointName(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

export async function parseJsonResponse<T>(
  response: Response,
  endpointName: string
): Promise<T> {
  const rawBody = await response.text();
  const bodyPreview = rawBody.slice(0, 200);

  if (!rawBody.trim()) {
    const message = response.ok
      ? `Respuesta vacia desde ${endpointName}`
      : `Error ${response.status} al llamar ${endpointName}`;

    console.error(
      `[${endpointName}] Empty JSON response (status ${response.status}). Body preview: ${bodyPreview}`
    );
    throw new Error(message);
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch (error) {
    console.error(
      `[${endpointName}] Failed to parse JSON (status ${response.status}). Body preview: ${bodyPreview}`,
      error
    );
    throw new Error(`Respuesta invalida desde ${endpointName}`);
  }

  if (!response.ok) {
    const errorMessage =
      parsed &&
      typeof parsed === "object" &&
      "error" in parsed &&
      typeof parsed.error === "string"
        ? parsed.error
        : `Error ${response.status} al llamar ${endpointName}`;

    throw new Error(errorMessage);
  }

  return parsed as T;
}

export async function fetchJsonSafely<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const endpointName = getEndpointName(input);
  const response = await fetch(input, init);
  return parseJsonResponse<T>(response, endpointName);
}
