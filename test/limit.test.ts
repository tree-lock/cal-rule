import CalRule, { init } from '../src/index';

describe('check 0, "", [] value', () => {
  describe('0', () => {
    const rule: CalRule = init('1D');
    const choices = [
      [-3, -2, -1, 0],
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16]
    ];
    it('0', () => {
      rule.choices = choices;
      rule.values = [0, 1, 5, 9];
      expect(rule.parse()).toBe(true);
    });
  });

  describe('0', () => {
    const rule: CalRule = init('1D');

    it('0 => true', () => {
      const choices = [
        [-3, -2, -1, 0],
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16]
      ];
      rule.choices = choices;
      rule.values = [0, 1, 5, 9];
      expect(rule.parse()).toBe(true);
    });

    it('0 => false', () => {
      const choices = [
        [-3, -2, -1, 0.5],
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16]
      ];
      rule.choices = choices;
      rule.values = [0, 1, 5, 9];
      expect(rule.parse()).toBe(false);
    });
  });

  describe('""', () => {
    const rule: CalRule = init('1D');

    it('"" => true', () => {
      const choices = [
        ['-3', '-2', '-1', ''],
        ['1', '2', '3', '4'],
        ['5', '6', '7', '8'],
        ['9', '10', '11', '12'],
        ['13', '14', '15', '16']
      ];
      rule.choices = choices;
      rule.values = ['', '1', '5', '9'];
      expect(rule.parse()).toBe(true);
    });

    it('"" => false', () => {
      const choices = [
        ['-3', '-2', '-1', '1'],
        ['1', '2', '3', '4'],
        ['5', '6', '7', '8'],
        ['9', '10', '11', '12'],
        ['13', '14', '15', '16']
      ];
      rule.choices = choices;
      rule.values = ['', '1', '5', '9'];
      expect(rule.parse()).toBe(false);
    });
  });

  describe('[]', () => {
    const rule: CalRule = init('1D');
    it('[] => true', () => {
      const choices = [[[1], [2], [3], []]];
      rule.choices = choices;
      rule.values = [[]];
      expect(rule.parse()).toBe(true);
    });

    it('[] => false', () => {
      const choices = [[[1], [2], [3], [4]]];
      rule.choices = choices;
      rule.values = [[]];
      expect(rule.parse()).toBe(false);
    });
  });
});
