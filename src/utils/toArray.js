export default function toArray(data) {
  if (typeof data !== 'object' || data === null) return [];

  return Object.keys(data).map((id) => ({
    id,
    ...data[id],
  }));
}
