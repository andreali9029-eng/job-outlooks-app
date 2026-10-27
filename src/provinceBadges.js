/**
 * @file provinceBadges.js
 * @description Province/territory badge definitions: representative gradient
 *   colours (inspired by each region's flag palette) + a symbol for the chip
 *   marker. CA uses the maple leaf; others use their 2-letter abbreviation.
 * @author andreali9029-eng
 * @copyright © 2026 andreali9029-eng
 * @version 1.0.0
 */

/** Badge config per province/territory code (CA included). */
export const PROVINCE_BADGES = {
  CA: { sym: '🍁', from: '#d52b1e', to: '#ef7a5b' },
  NL: { sym: 'NL', from: '#4b6fa5', to: '#8fb3dd' },
  PE: { sym: 'PE', from: '#c8102e', to: '#4a7c59' },
  NS: { sym: 'NS', from: '#1a5c96', to: '#7fb0e0' },
  NB: { sym: 'NB', from: '#c8102e', to: '#f4b41a' },
  QC: { sym: 'QC', from: '#0a4c9c', to: '#7fb0e0' },
  ON: { sym: 'ON', from: '#0e7a4b', to: '#d6a824' },
  MB: { sym: 'MB', from: '#0e7a4b', to: '#8fc93a' },
  SK: { sym: 'SK', from: '#0e7a4b', to: '#f4b41a' },
  AB: { sym: 'AB', from: '#1a5c96', to: '#c8102e' },
  BC: { sym: 'BC', from: '#1a5c96', to: '#6da8d6' },
  YT: { sym: 'YT', from: '#d6a824', to: '#1a5c96' },
  NT: { sym: 'NT', from: '#c8102e', to: '#0e7a4b' },
  NU: { sym: 'NU', from: '#f4b41a', to: '#1a5c96' },
}

/**
 * Get the badge config for a province/territory code.
 * @param {string} code - standard 2-letter code (CA, ON, QC, ...).
 * @param {string} [fallback='CA'] - code to use when the requested one is unknown.
 * @returns {{ sym: string, from: string, to: string }}
 */
export function badgeFor(code, fallback = 'CA') {
  return PROVINCE_BADGES[code] || PROVINCE_BADGES[fallback]
}
