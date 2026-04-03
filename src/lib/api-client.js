/**
 * Thin fetch wrapper for JSON API calls.
 */

/**
 * POST JSON to a URL and return the parsed response.
 * Throws on HTTP errors with the response body as the message.
 */
export async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json();
}
