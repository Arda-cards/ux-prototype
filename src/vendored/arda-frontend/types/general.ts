/***********************************************************************************************************************************
 * General Types, Recommend to move to separate files
 ***********************************************************************************************************************************/
// Consider using the uuid package `npm install uuid`.
export type UUID = string;
export const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(uuid: UUID): boolean {
  return uuidRegex.test(uuid);
}

// This would only be necessary if the Browser Built-in `URL` type is not available.
// Ideally these types would be used both in the Browser SPA as well as the Node.js based BFF.
export type URL = string;

export const urlRegex = /^(https?:\/\/)?([\w.-]+)(:[0-9]+)?(\/[\w.-]*)*\/?$/i;
export function isValidUrl(url: URL): boolean {
  return urlRegex.test(url);
}
export type Timestamp = number;
export function nowMillis(): Timestamp {
  return new Date().getTime();
}

export interface TimeCoordinates {
  recordedAsOf: Timestamp;
  effectiveAsOf: Timestamp;
}

export function nowTimeCoordinates(): TimeCoordinates {
  return {
    recordedAsOf: nowMillis(),
    effectiveAsOf: nowMillis(),
  };
}

export type TimeUnit = 'SECOND' | 'MINUTE' | 'HOUR' | 'DAY' | 'WEEK';

// Note that this is a "system-wide" default. Specific use cases or UI components may
// have more specialized defaults.
export const defaultTimeUnit: TimeUnit = 'SECOND';

export interface Duration {
  length: number;
  unit: TimeUnit;
}

export const defaultDuration: Duration = {
  length: 0,
  unit: defaultTimeUnit,
};
