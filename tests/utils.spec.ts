import { extend } from '../src/utils/extends';

describe('Utility Functions', () => {
    describe('extend function', () => {
        it('should merge simple objects', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { c: 3, d: 4 };
            const result = extend(obj1, obj2);

            expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
        });

        it('should override properties from left to right', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { b: 3, c: 4 };
            const result = extend(obj1, obj2);

            expect(result).toEqual({ a: 1, b: 3, c: 4 });
        });

        it('should handle nested objects recursively', () => {
            const obj1 = {
                a: 1,
                nested: { x: 1, y: 2 }
            };
            const obj2 = {
                b: 2,
                nested: { y: 3, z: 4 }
            };
            const result = extend(obj1, obj2);

            expect(result).toEqual({
                a: 1,
                b: 2,
                nested: { x: 1, y: 3, z: 4 }
            });
        });

        it('should handle null and undefined sources', () => {
            const obj1 = { a: 1, b: 2 };
            const result = extend(obj1, null, undefined, { c: 3 });

            expect(result).toEqual({ a: 1, b: 2, c: 3 });
        });

        it('should handle empty objects', () => {
            const result = extend({}, {}, { a: 1 });

            expect(result).toEqual({ a: 1 });
        });

        it('should handle symbol properties', () => {
            const sym1 = Symbol('test1');
            const sym2 = Symbol('test2');

            const obj1 = { a: 1, [sym1]: 'symbol1' };
            const obj2 = { b: 2, [sym2]: 'symbol2' };
            const result = extend(obj1, obj2);

            expect(result.a).toBe(1);
            expect(result.b).toBe(2);
            expect(result[sym1]).toBe('symbol1');
            expect(result[sym2]).toBe('symbol2');
        });

        it('should only copy own properties', () => {
            const parent = { inherited: 'value' };
            const child = Object.create(parent);
            child.own = 'ownValue';

            const result = extend({}, child);

            expect(result.own).toBe('ownValue');
            expect(result.inherited).toBeUndefined();
        });

        it('should handle non-object values correctly', () => {
            const obj1 = { a: 1, b: 'string' };
            const obj2 = { b: 42, c: true };
            const result = extend(obj1, obj2);

            expect(result).toEqual({ a: 1, b: 42, c: true });
        });

        it('should handle array values (not merge them)', () => {
            const obj1 = { arr: [1, 2, 3] };
            const obj2 = { arr: [4, 5] };
            const result = extend(obj1, obj2);

            expect(result.arr).toEqual([4, 5]);
        });

        it('should handle mixed object and non-object values', () => {
            const obj1 = {
                config: { theme: 'dark', size: 'large' },
                value: 42
            };
            const obj2 = {
                config: 'overridden',
                value: { nested: true }
            };
            const result = extend(obj1, obj2);

            expect(result.config).toBe('overridden');
            expect(result.value).toEqual({ nested: true });
        });

        it('should handle deeply nested objects', () => {
            const obj1 = {
                level1: {
                    level2: {
                        level3: {
                            value: 'deep'
                        }
                    }
                }
            };
            const obj2 = {
                level1: {
                    level2: {
                        level3: {
                            newValue: 'added'
                        },
                        newLevel3: 'new'
                    }
                }
            };
            const result = extend(obj1, obj2) as any;

            expect(result.level1.level2.level3.value).toBe('deep');
            expect(result.level1.level2.level3.newValue).toBe('added');
            expect(result.level1.level2.newLevel3).toBe('new');
        });

        it('should work with multiple sources', () => {
            const obj1 = { a: 1 };
            const obj2 = { b: 2 };
            const obj3 = { c: 3 };
            const obj4 = { d: 4 };
            const result = extend(obj1, obj2, obj3, obj4);

            expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
        });

        it('should handle objects with toString and valueOf methods', () => {
            const obj1 = {
                custom: {
                    toString: () => 'string',
                    valueOf: () => 42,
                    value: 'original'
                }
            };
            const obj2 = {
                custom: {
                    value: 'updated',
                    newProp: 'new'
                }
            };
            const result = extend(obj1, obj2) as any;

            expect(result.custom.value).toBe('updated');
            expect(result.custom.newProp).toBe('new');
            expect(typeof result.custom.toString).toBe('function');
            expect(typeof result.custom.valueOf).toBe('function');
        });

        it('should preserve original objects (not mutate them)', () => {
            const obj1 = { a: 1, nested: { x: 1 } };
            const obj2 = { b: 2, nested: { y: 2 } };
            const result = extend(obj1, obj2);

            expect(obj1).toEqual({ a: 1, nested: { x: 1 } });
            expect(obj2).toEqual({ b: 2, nested: { y: 2 } });
            expect(result).toEqual({ a: 1, b: 2, nested: { x: 1, y: 2 } });
        });

        it('should handle SmileDrawer options merging scenario', () => {
            // Test realistic scenario from the plugin
            const defaultOptions = {
                theme: 'dark',
                width: 500,
                height: 500,
                themes: {
                    dark: { C: '#fff', O: '#e74c3c' },
                    light: { C: '#222', O: '#e74c3c' }
                }
            };

            const blockOptions = {
                width: 400,
                themes: {
                    dark: { N: '#3498db' }
                }
            };

            const inlineOptions = {
                height: 300,
                experimental: true
            };

            const result = extend(defaultOptions, blockOptions, inlineOptions) as any;

            expect(result.theme).toBe('dark');
            expect(result.width).toBe(400);
            expect(result.height).toBe(300);
            expect(result.experimental).toBe(true);
            expect(result.themes.dark.C).toBe('#fff');
            expect(result.themes.dark.O).toBe('#e74c3c');
            expect(result.themes.dark.N).toBe('#3498db');
            expect(result.themes.light).toEqual({ C: '#222', O: '#e74c3c' });
        });
    });
}); 