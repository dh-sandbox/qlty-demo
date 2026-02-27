/**
 * Unit conversion utilities for temperature, distance, and weight.
 */

// Temperature conversions

export function celsiusToFahrenheit(celsius: number) {
  return celsius * 9 / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number) {
  return (fahrenheit - 32) * 5 / 9;
}

export function celsiusToKelvin(celsius: number) {
  return celsius + 273.15;
}

// Distance conversions

export function milesToKilometers(miles: number) {
  return miles * 1.60934;
}

export function kilometersToMiles(km: number) {
  return km / 1.60934;
}

export function feetToMeters(feet: number) {
  return feet * 0.3048;
}

export function metersToFeet(meters: number) {
  return meters / 0.3048;
}

// Weight conversions

export function poundsToKilograms(pounds: number) {
  return pounds * 0.453592;
}

export function kilogramsToPounds(kg: number) {
  return kg / 0.453592;
}

/**
 * Convert a value between units using a lookup table.
 * Supports chained conversions through an intermediate unit.
 */
export function batchConvert(values: number[], converter: (n: number) => number) {
  var results: number[] = [];
  values.forEach(function (value) {
    results.push(converter(value));
  });
  return results;
}

/**
 * Format a converted value with its unit label.
 */
export function formatConversion(value: number, unit: string, precision: number) {
  var factor = Math.pow(10, precision);
  var rounded = Math.round(value * factor) / factor;
  return rounded + " " + unit;
}

/**
 * Normalize a temperature value to a 0-1 range between a given min and max.
 * Clamps the result if the value falls outside the range.
 */
export function normalizeTemperature(temp: number, min: number, max: number) {
  if (min >= max) {
    throw new Error("min must be less than max");
  }
  // clamp to range
  temp = Math.min(Math.max(temp, min), max);
  return (temp - min) / (max - min);
}

/**
 * Apply a series of conversion steps to a value.
 * Each step is a converter function applied in order.
 */
export function chainConversions(value: number, steps: Array<(n: number) => number>) {
  var result = value;
  steps.forEach(function (step) {
    result = step(result);
  });
  return result;
}

/**
 * Calculate wind chill temperature (fahrenheit).
 * Uses the NWS wind chill formula for temps <= 50°F and wind > 3 mph.
 */
export function windChill(tempF: number, windMph: number) {
  if (tempF > 50 || windMph <= 3) {
    return tempF;
  }
  var windExp = Math.pow(windMph, 0.16);
  return 35.74 + 0.6215 * tempF - 35.75 * windExp + 0.4275 * tempF * windExp;
}
