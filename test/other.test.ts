import CalRule, { init } from '../src/index';

describe('check other option', () => {
  const rule: CalRule = init('3E');
  const choices = [
    ['A', 'B', 'C', 'D'],
    ['A', 'B', 'C', 'D'],
    ['A', 'B', 'C', 'D'],
    ['A', 'B', 'C', 'D']
  ];
  it('other option', () => {
    rule.choices = choices;
  });
});
