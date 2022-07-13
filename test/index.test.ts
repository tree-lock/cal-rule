import CalRule, { init } from '../src/index';
describe('', () => {
  let rule: CalRule;
  it('init', () => {
    rule = init('1A&2B');
    expect(rule).toBeDefined();
    expect(rule.calculator).toBeDefined();
    expect(rule.choices).toBeUndefined();
    expect(rule.values).toBeUndefined();
    console.dir(rule);
  });

  describe('1A&2B', () => {
    it('1A&2B', () => {
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
  });
});
