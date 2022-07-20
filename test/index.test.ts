import CalRule, {
  CalRuleInValidError,
  CalRuleRequiredError,
  CalRuleXssError,
  init
} from '../src/index';
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

    it('Missing calculator', () => {
      const rule = new CalRule('1A&2B');
      rule.choices = [undefined, undefined, undefined];
      rule.values = [undefined, undefined, undefined];
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

    it('true&true <case: value is array>', () => {
      const choices = [
        ['option1A', 'option1B', 'option1C'],
        ['option2A', 'option2B', 'option2C', 'option2D'],
        ['option3A', 'option3B']
      ];

      const values = ['option1A', ['option2A', 'option2B', 'option2C', 'option2D'], undefined];

      rule.choices = choices;
      rule.values = values;

      expect(rule.parse()).toBe(true);
    });

    it('true&false <case: value is array>', () => {
      const choices = [
        ['option1A', 'option1B', 'option1C'],
        ['option2A', 'option2B', 'option2C', 'option2D'],
        ['option3A', 'option3B']
      ];

      const values = ['option1A', ['option2A', 'option2C', 'option2D'], undefined];

      rule.choices = choices;
      rule.values = values;

      expect(rule.parse()).toBe(false);
    });
  });

  describe('1A', () => {
    const rule = init('1A');
    const choices = [
      ['A', 'B', 'C', 'D'],
      ['A', 'B', 'C', 'D'],
      ['A', 'B', 'C', 'D'],
      ['A', 'B', 'C', 'D']
    ];
    rule.choices = choices;
    test('true', () => {
      const values = [['A'], 'B', 'C', 'D'];
      rule.values = values;
      expect(rule.parse()).toBe(true);
    });
    test('false', () => {
      const values = [['B'], 'B', 'C', 'D'];
      rule.values = values;
      expect(rule.parse()).toBe(false);
    });
    test('false <case: value undefined>', () => {
      const values = [undefined, 'B', 'C', 'D'];
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

  describe('different type of input', () => {
    const rule = init('1&2&3&4&5&6');
    const choices = new Array(6).fill(undefined);
    rule.choices = choices;
    it('string, number, Date, Array, Object, Symbol', () => {
      const values = ['string', 213, new Date(), [], {}, Symbol(2)];
      rule.values = values;
      expect(rule.parse()).toBe(true);
    });
    it('undefined, number, Date, Array, Object, Symbol', () => {
      const values = [undefined, 213, new Date(), [], {}, Symbol(2)];
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

  describe('Unexpected choices or values', () => {
    describe('string includes string', () => {
      const rule = init<string>('1A&2B');
      const choices = [
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D']
      ];
      const values = ['A', 'A; B', undefined, undefined];
      rule.choices = choices;
      rule.values = values;

      it('default calculator', () => {
        expect(rule.parse()).toBe(false);
      });
      it('custom calculator', () => {
        rule.calculator = (value, choice) => {
          if (!choice) {
            return false;
          }
          if (value && value.includes(choice)) {
            return true;
          }
          return false;
        };
        expect(rule.parse()).toBe(true);
      });
    });

    describe('keyof(value: object) includes choice', () => {
      const rule = init<string, { [K: string]: unknown }>('1A&2B');
      const choices = [
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D'],
        ['A', 'B', 'C', 'D']
      ];
      it('default calculator', () => {
        const values = [{ A: 1, B: 2 }, { A: 1, B: 2, C: 3, D: 4 }, undefined, undefined];
        rule.choices = choices;
        rule.values = values;
        console.warn = jest.fn();
        expect(() => rule.parse()).toThrowError(CalRuleRequiredError);
      });
      describe('custom calculator', () => {
        it('define calculator', () => {
          rule.calculator = (
            value: { [K: string]: unknown } | undefined,
            choice: string | undefined
          ) => {
            if (value && choice) {
              return Object.keys(value).includes(choice);
            }
            return false;
          };
        });
        it('true&true', () => {
          expect(rule.parse()).toBe(true);
        });
        it('true&false', () => {
          const values = [{ A: 1, B: 2 }, { A: 1, C: 3, D: 4 }, undefined, undefined];
          rule.values = values;
          expect(rule.parse()).toBe(false);
        });
        it('false&true', () => {
          const values = [{ B: 2 }, { A: 1, B: 2, C: 3, D: 4 }, undefined, undefined];
          rule.values = values;
          expect(rule.parse()).toBe(false);
        });
      });
    });
  });
  describe('XSS attack', () => {
    const rule = init('1&2');
    const choices = [undefined, undefined];
    const values = [1, 2];
    rule.choices = choices;
    rule.values = values;
    it('Object.assign unexpected calArr', () => {
      const obj = Object.assign(rule, { calArr: ['', '&(console.log(123)||true)&', ''] });
      expect(() => (obj as unknown as CalRule).parse()).toThrowError(CalRuleXssError);
    });
    it('Object.assign unexpected calArr with "!!"', () => {
      const obj = Object.assign(rule, { calArr: ['!!(', '&', ')'] });
      expect(() => (obj as unknown as CalRule).parse()).toThrowError(CalRuleXssError);
    });
  });
});
