/**
 * Pause execution for some milliseconds (or a bit more).
 * @param milliseconds 
 * @returns 
 */
export const sleep = (milliseconds: number) => new Promise((r) => setTimeout(r, milliseconds));
