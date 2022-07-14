import CalRule, { CalRuleInValidError, CalRuleRequiredError, init } from '../src/index';
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
      console.warn = jest.fn();
      expect(() => init(rule)).toThrowError(CalRuleInValidError);
    });

    it('Unvalid rule <case: parse failed>', () => {
      const rule = '1A&2B)';
      console.warn = jest.fn();
      expect(() => init(rule)).toThrowError(CalRuleInValidError);
    });

    it('Both Missing', () => {
      const rule: CalRule = init('1A&2B');
      expect(() => rule.parse()).toThrowError(CalRuleRequiredError);
    });

    it('Missing choices', () => {
      const rule: CalRule = init('1A&2B');
      rule.values = [undefined, undefined, undefined];
      expect(() => rule.parse()).toThrowError(CalRuleRequiredError);
    });

    it('Missing values', () => {
      const rule: CalRule = init('1A&2B');
      rule.choices = [undefined, undefined, undefined];
      expect(() => rule.parse()).toThrowError(CalRuleRequiredError);
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

  describe('1A&2B|!(3C&(4))', () => {
    const rule = init('1A&2B|!(3C&(4))');
    it('true&true|!(true&(true))', () => {
      const choices = [
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D']
      ];
      const values = ['A', 'B', 'C', 'D'];
      rule.choices = choices;
      rule.values = values;

      expect(rule.parse()).toBe(!!Function('return ' + 'true&true|!(true&(true));')());
    });

    it('true&false|!(true&(true))', () => {
      const choices = [
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D']
      ];
      const values = ['A', undefined, 'C', 'D'];
      rule.choices = choices;
      rule.values = values;

      expect(rule.parse()).toBe(!!Function('return ' + 'true&false|!(true&(true));')());
    });
  });
});
