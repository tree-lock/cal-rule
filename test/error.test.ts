import CalRule, { init } from '../src/index';
import { CalRuleInValidError, CalRuleRequiredError, CalRuleXssError } from '../src/error';
import { config } from '../src/config';

describe('error', () => {
  it('Unvalid rule <case: unexpected operator>', () => {
    const rule = '108*23';
    console.warn = jest.fn();
    expect(() => init(rule)).toThrowError(CalRuleInValidError);
    expect(console.warn).toBeCalled();
  });

  it('warning closed', () => {
    const rule = '108*23';
    console.warn = jest.fn();
    config.warning = false;
    expect(() => init(rule)).toThrowError(CalRuleInValidError);
    expect(console.warn).not.toBeCalled();
    config.warning = true;
  });

  it('Unvalid rule <case: parse failed>', () => {
    const rule = '1A&2B)';
    console.warn = jest.fn();
    expect(() => init(rule)).toThrowError(CalRuleInValidError);
    expect(console.warn).toBeCalled();
  });

  it('warning closed', () => {
    const rule = '1A&2B)';
    console.warn = jest.fn();
    config.warning = false;
    expect(() => init(rule)).toThrowError(CalRuleInValidError);
    expect(console.warn).not.toBeCalled();
    config.warning = true;
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
