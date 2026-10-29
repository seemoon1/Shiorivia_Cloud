/** Only let the Fal API key reach the queue API host that issued the task URL. */
export function isAllowedFalQueueUrl(raw: string | null): raw is string {
  if (!raw || raw.length > 2048) return false;
  try {
    const url = new URL(raw);
    return url.protocol === "https:"
      && url.hostname === "queue.fal.run"
      && !url.username
      && !url.password
      && !url.port
      && !url.hash;
  } catch {
    return false;
  }
}
