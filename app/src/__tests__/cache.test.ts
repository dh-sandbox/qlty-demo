import { describe, it, expect, vi } from 'vitest';
import { LRUCache } from '../utils/cache';

describe('LRUCache', () => {
  it('should store and retrieve values', () => {
    const cache = new LRUCache();
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return undefined for missing keys', () => {
    const cache = new LRUCache();
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('should evict LRU entries when maxSize exceeded', () => {
    const cache = new LRUCache(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);
  });

  it('should expire entries based on TTL', () => {
    vi.useFakeTimers();
    const cache = new LRUCache(100, 1000);
    cache.set('temp', 'data');
    vi.advanceTimersByTime(1500);
    expect(cache.get('temp')).toBeUndefined();
    vi.useRealTimers();
  });

  it('should track hit/miss stats', () => {
    const cache = new LRUCache();
    cache.set('x', 1);
    cache.get('x');
    cache.get('y');
    const s = cache.stats();
    expect(s.hits).toBe(1);
    expect(s.misses).toBe(1);
    expect(s.hitRate).toBe(0.5);
  });

  it('should clear all entries and reset stats', () => {
    const cache = new LRUCache();
    cache.set('a', 1);
    cache.get('a');
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.stats().hits).toBe(0);
  });

  it('should cleanup expired entries', () => {
    vi.useFakeTimers();
    const cache = new LRUCache(100, 500);
    cache.set('e1', 'v1');
    cache.set('e2', 'v2');
    vi.advanceTimersByTime(600);
    const removed = cache.cleanup();
    expect(removed).toBe(2);
    expect(cache.size).toBe(0);
    vi.useRealTimers();
  });

  it('should report has correctly for valid and expired keys', () => {
    vi.useFakeTimers();
    const cache = new LRUCache(100, 500);
    cache.set('k', 'v');
    expect(cache.has('k')).toBe(true);
    vi.advanceTimersByTime(600);
    expect(cache.has('k')).toBe(false);
    vi.useRealTimers();
  });

  it('should return all keys', () => {
    const cache = new LRUCache();
    cache.set('a', 1);
    cache.set('b', 2);
    expect(cache.keys()).toEqual(['a', 'b']);
  });

  it('should update existing key without growing size', () => {
    const cache = new LRUCache(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('a', 10);
    expect(cache.size).toBe(2);
    expect(cache.get('a')).toBe(10);
  });
});
