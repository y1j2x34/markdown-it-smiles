import { hello } from '~/index';

describe('test hello', () => {
    it('should hello() return "Hello"', () => {
        expect(hello()).toBe('Hello');
    });
});
