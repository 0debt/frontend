const DEFAULT_GATEWAY_URL = 'http://api-gateway:8000';

export const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  DEFAULT_GATEWAY_URL;

export function withApiBase(path: string, base: string = API_GATEWAY_URL) {
  if (path.startsWith('http')) return path;
  return `${base}${path}`;
}
