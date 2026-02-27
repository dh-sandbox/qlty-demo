import { describe, it, expect } from 'vitest';
import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  celsiusToKelvin,
  milesToKilometers,
  kilometersToMiles,
  feetToMeters,
  metersToFeet,
  poundsToKilograms,
  kilogramsToPounds,
  batchConvert,
  formatConversion,
  normalizeTemperature,
  chainConversions,
  windChill,
} from '../utils/convert';

describe('celsiusToFahrenheit', () => {
  it('converts 0°C to 32°F', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
  });

  it('converts 100°C to 212°F', () => {
    expect(celsiusToFahrenheit(100)).toBe(212);
  });

  it('converts -40°C to -40°F', () => {
    expect(celsiusToFahrenheit(-40)).toBe(-40);
  });
});

describe('fahrenheitToCelsius', () => {
  it('converts 32°F to 0°C', () => {
    expect(fahrenheitToCelsius(32)).toBe(0);
  });

  it('converts 212°F to 100°C', () => {
    expect(fahrenheitToCelsius(212)).toBeCloseTo(100);
  });

  it('converts -40°F to -40°C', () => {
    expect(fahrenheitToCelsius(-40)).toBeCloseTo(-40);
  });
});

describe('celsiusToKelvin', () => {
  it('converts 0°C to 273.15K', () => {
    expect(celsiusToKelvin(0)).toBe(273.15);
  });

  it('converts -273.15°C to 0K', () => {
    expect(celsiusToKelvin(-273.15)).toBeCloseTo(0);
  });
});

describe('milesToKilometers', () => {
  it('converts 1 mile to 1.60934 km', () => {
    expect(milesToKilometers(1)).toBeCloseTo(1.60934);
  });

  it('converts 0 miles to 0 km', () => {
    expect(milesToKilometers(0)).toBe(0);
  });
});

describe('kilometersToMiles', () => {
  it('converts 1.60934 km to 1 mile', () => {
    expect(kilometersToMiles(1.60934)).toBeCloseTo(1);
  });
});

describe('feetToMeters', () => {
  it('converts 1 foot to 0.3048 meters', () => {
    expect(feetToMeters(1)).toBeCloseTo(0.3048);
  });
});

describe('metersToFeet', () => {
  it('converts 1 meter to ~3.28 feet', () => {
    expect(metersToFeet(1)).toBeCloseTo(3.28084);
  });
});

describe('poundsToKilograms', () => {
  it('converts 1 pound to ~0.4536 kg', () => {
    expect(poundsToKilograms(1)).toBeCloseTo(0.453592);
  });
});

describe('kilogramsToPounds', () => {
  it('converts 1 kg to ~2.2046 pounds', () => {
    expect(kilogramsToPounds(1)).toBeCloseTo(2.20462);
  });
});

describe('batchConvert', () => {
  it('converts an array of values', () => {
    const results = batchConvert([0, 100], celsiusToFahrenheit);
    expect(results).toEqual([32, 212]);
  });

  it('returns an empty array for empty input', () => {
    expect(batchConvert([], celsiusToFahrenheit)).toEqual([]);
  });
});

describe('formatConversion', () => {
  it('formats a value with unit and precision', () => {
    expect(formatConversion(98.6543, '°F', 1)).toBe('98.7 °F');
  });

  it('formats with 0 precision', () => {
    expect(formatConversion(3.7, 'km', 0)).toBe('4 km');
  });

  it('formats with 2 decimal places', () => {
    expect(formatConversion(1.60934, 'km', 2)).toBe('1.61 km');
  });
});

describe('normalizeTemperature', () => {
  it('normalizes to 0 at min', () => {
    expect(normalizeTemperature(0, 0, 100)).toBe(0);
  });

  it('normalizes to 1 at max', () => {
    expect(normalizeTemperature(100, 0, 100)).toBe(1);
  });

  it('normalizes to 0.5 at midpoint', () => {
    expect(normalizeTemperature(50, 0, 100)).toBe(0.5);
  });

  it('clamps values below min', () => {
    expect(normalizeTemperature(-10, 0, 100)).toBe(0);
  });

  it('clamps values above max', () => {
    expect(normalizeTemperature(150, 0, 100)).toBe(1);
  });

  it('throws if min >= max', () => {
    expect(() => normalizeTemperature(50, 100, 0)).toThrow('min must be less than max');
  });
});

describe('chainConversions', () => {
  it('applies conversions in order', () => {
    // Celsius -> Fahrenheit -> back to Celsius
    const result = chainConversions(100, [celsiusToFahrenheit, fahrenheitToCelsius]);
    expect(result).toBeCloseTo(100);
  });

  it('returns original value with no steps', () => {
    expect(chainConversions(42, [])).toBe(42);
  });
});

describe('windChill', () => {
  it('returns temp when above 50°F', () => {
    expect(windChill(60, 10)).toBe(60);
  });

  it('returns temp when wind <= 3 mph', () => {
    expect(windChill(30, 2)).toBe(30);
  });

  it('calculates wind chill for cold windy conditions', () => {
    const result = windChill(20, 15);
    expect(result).toBeCloseTo(6.2, 0);
  });

  it('calculates wind chill at 0°F with 10 mph wind', () => {
    const result = windChill(0, 10);
    expect(result).toBeCloseTo(-16, 0);
  });
});
