import CalRule, { init } from '../src/index';

describe('check other option', () => {
  describe('rule.other not set', () => {
    const rule: CalRule = init('1E');
    const choices = [
      ['A', 'B', 'C', 'D'],
      ['A', 'B', 'C', 'D'],
      ['A', 'B', 'C', 'D'],
      ['A', 'B', 'C', 'D']
    ];
    it('other option', () => {
      rule.choices = choices;
      rule.values = ['other'];
      console.warn = jest.fn();
      expect(rule.parse()).toBe(false);
      expect(console.warn).toBeCalled();
    });
  });

  describe('rule.other = true', () => {
    it('1E => true', () => {
      const rule: CalRule = init('1E', {
        'other': true
      });
      const choices = [
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D']
      ];
      rule.choices = choices;
      rule.values = ['other'];
      expect(rule.parse()).toBe(true);
    });

    it('1E => true <mult-select-1>', () => {
      const rule: CalRule = init('1E', {
        'other': true
      });
      const choices = [
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D']
      ];
      rule.choices = choices;
      rule.values = [['A', 'other']];
      expect(rule.parse()).toBe(true);
    });

    it('1E => true <mult-select-2>', () => {
      const rule: CalRule = init('1A&1E', {
        'other': true
      });
      const choices = [
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D']
      ];
      rule.choices = choices;
      rule.values = [['A', 'other']];
      expect(rule.parse()).toBe(true);
    });

    it('1E => false <mult-select-3>', () => {
      const rule: CalRule = init('1B&1E', {
        'other': true
      });
      const choices = [
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D']
      ];
      rule.choices = choices;
      rule.values = [['A', 'other']];
      expect(rule.parse()).toBe(false);
    });

    it('1E => false <mult-select-4>', () => {
      const rule: CalRule = init('1B&1A', {
        'other': true
      });
      const choices = [
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D']
      ];
      rule.choices = choices;
      rule.values = [['A', 'other']];
      expect(rule.parse()).toBe(false);
    });

    it('1E => false <mult-select-5>', () => {
      const rule: CalRule = init('1E', {
        'other': true
      });
      const choices = [
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D']
      ];
      rule.choices = choices;
      rule.values = [['A', 'B']];
      expect(rule.parse()).toBe(false);
    });

    it('1F => false <2 items more larger than choices[x].length>', () => {
      const rule: CalRule = init('1F', {
        'other': true
      });
      const choices = [
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D']
      ];
      rule.choices = choices;
      rule.values = ['other'];
      expect(rule.parse()).toBe(false);
      expect(console.warn).toBeCalled();
    });
  });

  describe('!1E', () => {
    const rule: CalRule = init('!1E', {
      'other': true
    });
    const choices = [
      ['A', 'B', 'C', 'D'],
      ['A', 'B', 'C', 'D'],
      ['A', 'B', 'C', 'D'],
      ['A', 'B', 'C', 'D']
    ];
    it('!1E => true', () => {
      rule.choices = choices;
      rule.values = ['A'];
      expect(rule.parse()).toBe(true);
    });
    it('!1E => true', () => {
      rule.choices = choices;
      rule.values = ['Extra'];
      expect(rule.parse()).toBe(false);
    });
  });
});
