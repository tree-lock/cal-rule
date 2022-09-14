import { init } from '../src';
import { choicesA } from './config';

describe('exclamation test', () => {
  it('!1A => false', () => {
    const rule = init('!1A');
    rule.choices = choicesA;
    rule.values = ['A', 'B'];
    expect(rule.parse()).toBe(false);
  });

  it('!1A => true', () => {
    const rule = init('!1A');
    rule.choices = choicesA;
    rule.values = ['C', 'B'];
    expect(rule.parse()).toBe(true);
  });

  it('!1A&2B => false', () => {
    const rule = init('!1A&2B');
    rule.choices = choicesA;
    rule.values = ['A', 'B'];
    expect(rule.parse()).toBe(false);
  });

  it('!1A&2B => true', () => {
    const rule = init('!1A&2B');
    rule.choices = choicesA;
    rule.values = ['C', 'B'];
    expect(rule.parse()).toBe(true);
  });

  it('!1A|2B => true <false|true>', () => {
    const rule = init('!1A|2B');
    rule.choices = choicesA;
    rule.values = ['A', 'B'];
    expect(rule.parse()).toBe(true);
  });

  it('!1A|2B => true <true|true>', () => {
    const rule = init('!1A|2B');
    rule.choices = choicesA;
    rule.values = ['C', 'B'];
    expect(rule.parse()).toBe(true);
  });

  it('!1A|2B => true <true|false>', () => {
    const rule = init('!1A|2B');
    rule.choices = choicesA;
    rule.values = ['C', 'D'];
    expect(rule.parse()).toBe(true);
  });

  it('!1A|2B => false <false|false>', () => {
    const rule = init('!1A|2B');
    rule.choices = choicesA;
    rule.values = ['A', 'D'];
    expect(rule.parse()).toBe(false);
  });
});
