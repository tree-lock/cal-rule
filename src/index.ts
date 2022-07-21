import versionConfig from './config';

const regex = /\d+[A-Z]?/g;
const operatorRegex = /^[()|&!]*$/;
const acceptableRegex = /^([()|&!]|(true)|(false))*$/;

export const config = {
  warning: true
};

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
export const ChoiceMissingWarning = (position: number[], ruleItem: string, rule: CalRule) => {
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

export const defaultCalculator = <Choice = any, Value = Choice>(
  value: Value | undefined,
  choice: Choice | undefined
): boolean => {
  if (typeof value === 'undefined' || value === null) {
    return false;
  }
  if (typeof choice !== 'undefined') {
    if (typeof value === typeof choice) {
      return (value as unknown) === (choice as unknown);
    }
    if (value instanceof Array) {
      return value.includes(choice);
    } else {
      if (config.warning) {
        console.warn(
          'Default calculator cannot handle this type of value and choice, please define your own calculator by calRule.calculator'
        );
      }
      throw new CalRuleRequiredError('calculator');
    }
  } else {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return true;
  }
};

class CalRule<Choice = any, Value = Choice> {
  readonly rule: string;
  private readonly ruleArr: string[];
  private readonly checkIndex: [number, number][];
  private readonly calArr: string[];

  constructor(rule: string) {
    this.rule = rule;
    this.calArr = this.rule.split(regex).map((item) => item.replace(/ /g, ''));
    const arr = this.rule.match(regex);
    if (!arr || this.calArr.some((item) => !operatorRegex.test(item))) {
      throw new CalRuleInValidError(this);
    }
    this.ruleArr = arr;

    this.checkIndex = arr.map((item) => {
      const numIndex = Number((item.match(/\d+/) as Array<string>)[0]) - 1;
      const alphabet = (item.match(/[A-Z]/) ?? [])[0];
      const alphabetIndex = alphabet ? alphabet.charCodeAt(0) - 'A'.charCodeAt(0) : -1;
      return [numIndex, alphabetIndex];
    });

    this.combine(new Array(this.checkIndex.length).fill(true));
  }

  choices!: (Choice[] | undefined)[];
  values!: (Value | undefined)[];

  calculator!: (value: Value | undefined, choice: Choice | undefined) => boolean;

  private combine = (checkedArr: boolean[]) => {
    let str = '';
    this.calArr.forEach((ele, index) => {
      str += ele;
      str += checkedArr[index] ?? '';
    });
    if (!acceptableRegex.test(str)) {
      throw new CalRuleXssError();
    }
    try {
      const ans = Function(`return ${str};`)();
      if (typeof ans !== 'number' && !['true', 'false'].includes(str)) {
        throw new CalRuleXssError();
      }
      return !!ans;
    } catch (err) {
      if (err instanceof CalRuleXssError) {
        throw err;
      } else {
        throw new CalRuleInValidError(this);
      }
    }
  };

  parse(
    calculator: (value: Value | undefined, choice: Choice | undefined) => boolean = this.calculator
  ) {
    if (!this.choices || !this.values || !this.calculator) {
      throw new CalRuleRequiredError(this);
    }
    const checkedArr = this.checkIndex.map((item, index) => {
      if (item[1] === -1) {
        return calculator(this.values[item[0]], undefined);
      } else {
        const choicesItem = this.choices[item[0]];
        if (choicesItem) {
          if (!choicesItem[item[1]]) {
            ChoiceMissingWarning(item, this.ruleArr[index], this);
            return false;
          }
          return calculator(this.values[item[0]], choicesItem[item[1]]);
        } else {
          ChoiceMissingWarning([item[0]], this.ruleArr[index], this);
          return false;
        }
      }
    });
    return this.combine(checkedArr);
  }
}
export const init = <Choice = any, Value = Choice>(rule: string) => {
  const ans = new CalRule<Choice, Value>(rule);
  ans.calculator = defaultCalculator;
  return ans;
};

export default CalRule;

export const version = versionConfig.version;
