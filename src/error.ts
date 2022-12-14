import CalRule from '.';
import { config } from './config';

export class CalRuleInValidError extends Error {
  static readonly warning = (str: string) =>
    `If you regard rule '${str}' as a valid rule, please commit your problem on https://github.com/darkXmo/cal-rule/issues`;

  static readonly error = (str: string) => `[cal-rule]: inValid rule '${str}'`;

  constructor(rule: CalRule) {
    const str = rule.rule;
    if (config.warning) {
      console.warn(CalRuleInValidError.warning(str));
    }
    super(CalRuleInValidError.error(str));
  }
}

export class CalRuleRequiredError extends Error {
  static readonly error = (str: string) => `[cal-rule]: ${str} is required`;
  constructor(type: string);
  constructor(rule: CalRule);
  constructor(arg: string | CalRule) {
    if (typeof arg === 'string') {
      super(CalRuleRequiredError.error(arg));
    } else {
      if (!arg.choices) {
        super(CalRuleRequiredError.error('choices'));
      } else if (!arg.values) {
        super(CalRuleRequiredError.error('values'));
      } else if (!arg.calculator) {
        super(CalRuleRequiredError.error('calculator'));
      }
    }
  }
}

export class CalRuleXssError extends Error {
  constructor() {
    super(
      '[CALRULE WARNING!]: It seems like CalRule has been injected an unaccepted rule, There may be insecure codes that has been executed and could lead to XSS attack. please commit your issue to https://github.com/darkXmo/cal-rule'
    );
  }
}

/** There will be a warning out, if choice(s) at `position` is required but not provided */
export const ChoiceMissingWarning = (
  position: readonly number[],
  ruleItem: string,
  rule: CalRule
) => {
  if (config.warning) {
    console.warn(
      `[cal-rule]: ${rule.rule} require choice${
        position.length === 1 ? 's' : ''
      } for position ${position
        .map((i) => `[${i}]`)
        .join(
          ''
        )}, but undefined is provided; Since this reason, rule '${ruleItem}' will always return false`
    );
  }
};
