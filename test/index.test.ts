import CalRule, { init } from '../src/index';
describe('', () => {
  it('init', () => {
    const rule: CalRule = init('1A&2B');
    expect(rule).toBeDefined();
    expect(rule.calculator).toBeDefined();
    expect(rule.choices).toBeUndefined();
    expect(rule.values).toBeUndefined();
  });

  describe('error', () => {
    it('Unvalid rule <case: unexpected operator>', () => {
      const rule = '108*23';
      expect(() => init(rule)).toThrowError(`[cal-rule]: inValid rule ${rule}`);
    });

    it('Both Missing', () => {
      const rule: CalRule = init('1A&2B');
      expect(() => rule.parse()).toThrowError('[cal-rule]: choices needed');
    });

    it('Missing choices', () => {
      const rule: CalRule = init('1A&2B');
      rule.values = [undefined, undefined, undefined];
      expect(() => rule.parse()).toThrowError('[cal-rule]: choices needed');
    });

    it('Missing values', () => {
      const rule: CalRule = init('1A&2B');
      rule.choices = [undefined, undefined, undefined];
      expect(() => rule.parse()).toThrowError('[cal-rule]: values needed');
    });

    it('Unvalid rule <case: parse failed>', () => {
      const rule = '1A&2B)';
      expect(() => init(rule)).toThrowError(`[cal-rule]: inValid rule ${rule}`);
    });
  });

  describe('1A&2B', () => {
    const rule = init('1A&2B');
    it('true&true', () => {
      const choices = [
        ['option1A', 'option1B', 'option1C'],
        ['option2A', 'option2B', 'option2C', 'option2D'],
        ['option3A', 'option3B']
      ];

      const values = ['option1A', 'option2B', undefined];

      rule.choices = choices;
      rule.values = values;

      expect(rule.parse()).toBe(true);
    });

    it('true&false', () => {
      const choices = [
        ['option1A', 'option1B', 'option1C'],
        ['option2A', 'option2B', 'option2C', 'option2D'],
        ['option3A', 'option3B']
      ];

      const values = ['option1A', 'option2C', undefined];

      rule.choices = choices;
      rule.values = values;

      expect(rule.parse()).toBe(false);
    });

    it('true&false <case: value undefined>', () => {
      const choices = [
        ['option1A', 'option1B', 'option1C'],
        ['option2A', 'option2B', 'option2C', 'option2D'],
        ['option3A', 'option3B']
      ];

      const values = ['option1A', undefined, undefined];

      rule.choices = choices;
      rule.values = values;

      expect(rule.parse()).toBe(false);
    });

    it('false&false <case: value undefined>', () => {
      const choices = [
        ['option1A', 'option1B', 'option1C'],
        ['option2A', 'option2B', 'option2C', 'option2D'],
        ['option3A', 'option3B']
      ];

      const values = [undefined, undefined, undefined];

      rule.choices = choices;
      rule.values = values;

      expect(rule.parse()).toBe(false);
    });
  });

  describe('Warning', () => {
    const rule = init('1A&2B');
    it('unexpected undefined', () => {
      console.warn = jest.fn();
      const choices = [['option1A', 'option1B', 'option1C'], undefined, ['option3A', 'option3B']];

      const values = [undefined, undefined, undefined];

      rule.choices = choices;
      rule.values = values;

      expect(rule.parse()).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(
        `[cal-rule]: ${rule.rule} require choices for position [1], but undefined is provided; Since this reason, rule '2B' will always return false`
      );
    });

    it('unexpected [undefined]', () => {
      console.warn = jest.fn();
      const choices = [
        ['option1A', 'option1B', 'option1C'],
        ['option2A'],
        ['option3A', 'option3B']
      ];

      const values = [undefined, undefined, undefined];

      rule.choices = choices;
      rule.values = values;

      expect(rule.parse()).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(
        `[cal-rule]: ${rule.rule} require choice for position [1][1], but undefined is provided; Since this reason, rule '2B' will always return false`
      );
    });
  });

  describe('1A&2', () => {
    const rule = init('1A&2');
    it('true&true', () => {
      const choices = [['option1A', 'option1B', 'option1C'], undefined, ['option3A', 'option3B']];

      const values = ['option1A', 'input value', undefined];

      rule.choices = choices;
      rule.values = values;

      expect(rule.parse()).toBe(true);
    });

    it('true&false', () => {
      const choices = [['option1A', 'option1B', 'option1C'], undefined, ['option3A', 'option3B']];

      const values = ['option1A', '', undefined];

      rule.choices = choices;
      rule.values = values;

      expect(rule.parse()).toBe(false);
    });

    it('true&false <case: value undefined>', () => {
      const choices = [['option1A', 'option1B', 'option1C'], undefined, ['option3A', 'option3B']];

      const values = ['option1A', undefined, undefined];

      rule.choices = choices;
      rule.values = values;

      expect(rule.parse()).toBe(false);
    });

    it('false&false <case: value undefined>', () => {
      const choices = [['option1A', 'option1B', 'option1C'], undefined, ['option3A', 'option3B']];

      const values = [undefined, undefined, undefined];

      rule.choices = choices;
      rule.values = values;

      expect(rule.parse()).toBe(false);
    });

    it('true&false <case: useless choices provided[required choice]>', () => {
      const choices = [['option1A', 'option1B', 'option1C'], undefined, ['option3A', 'option3B']];

      const values = [undefined, undefined, undefined];

      rule.choices = choices;
      rule.values = values;

      expect(rule.parse()).toBe(false);
    });
  });
});
