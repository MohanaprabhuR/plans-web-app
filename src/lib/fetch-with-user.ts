type FetchWithUserInit = RequestInit & {
  signal?: AbortSignal;
};

export async function fetchWithUser(
  url: string,
  userId: string,
  init: FetchWithUserInit = {},
): Promise<Response> {
  const { headers, ...rest } = init;
  return fetch(url, {
    cache: "no-store",
    ...rest,
    headers: {
      "X-User-Id": userId,
      ...headers,
    },
  });
}

export async function fetchJsonWithUser<T>(
  url: string,
  userId: string,
  init: FetchWithUserInit = {},
): Promise<T> {
  const response = await fetchWithUser(url, userId, init);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText ||
        `Request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
