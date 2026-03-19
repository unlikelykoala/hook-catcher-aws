import { appOrigin, backendOrigin } from "@/config/env";

export function getInspectPath(binId: string) {
  return `/bins/${binId}`;
}

export function getInspectUrl(binId: string) {
  return `${appOrigin}${getInspectPath(binId)}`;
}

export function getSendPath(binId: string) {
  return `/api/hooks/${binId}`;
}

export function getSendUrl(binId: string) {
  return `${backendOrigin}${getSendPath(binId)}`;
}
