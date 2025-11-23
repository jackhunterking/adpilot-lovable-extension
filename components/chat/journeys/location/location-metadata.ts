/**
 * Feature: Location Metadata Builder
 * Purpose: Create metadata for location-related messages
 */

export function createLocationMetadata(
  mode: 'include' | 'exclude',
  locationInput: string
): Record<string, unknown> {
  return {
    locationSetupMode: true,
    locationMode: mode,
    locationInput,
  };
}

