

/**
 * Resolves with [lng, lat] and rejects with GeolocationPositionError.
 */
export default async function locate(): Promise<number[]> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      // Success handler.
      (position: GeolocationPosition) => {
        const location = [
          position.coords.longitude,
          position.coords.latitude
        ];
        // Resolve promise with location array.
        resolve(location);
      },
      // Error handler
      (error: GeolocationPositionError) => {
        reject(error)
      },
      { maximumAge: 1500000, timeout: 100000 }
    );
  })
}