import config from './config';

const regex = /\d+[A-Z]?/g;
const operatorRegex = /^(\(|\)|\||&|!)*$/;

export class CalRuleInValidError extends Error {
  static readonly warning = (str: string) =>
    `If you regard rule '${str}' as a valid rule, please commit your problem on https://github.com/darkXmo/cal-rule/issues`;

  static readonly error = (str: string) => `[cal-rule]: inValid rule '${str}'`;

  constructor(rule: CalRule) {
    const str = rule.rule;
    console.warn(CalRuleInValidError.warning(str));
    super(CalRuleInValidError.error(str));
  }
}

export class CalRuleRequiredError extends Error {
  static readonly error = (str: string) => `[cal-rule]: ${str} is required`;
  constructor(rule: CalRule) {
    super(CalRuleRequiredError.error(rule.choices ? 'values' : 'choices'));
  }
}

/** There will be a warning out, if choice(s) at `position` is required but not provided */
export const ChoiceMissingWarning = (position: number[], ruleItem: string, rule: CalRule) => {
  console.warn(
    `[cal-rule]: ${rule.rule} require choice${
      position.length === 1 ? 's' : ''
    } for position ${position
      .map((i) => `[${i}]`)
      .join(
        ''
      )}, but undefined is provided; Since this reason, rule '${ruleItem}' will always return false`
  );
};

class CalRule {
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

  choices!: (string[] | undefined)[];
  values!: (string | undefined)[];

  calculator = (value: typeof this.values[0], choice: typeof this.values[0]) => {
    if (typeof choice !== 'undefined') {
      return value === choice;
    } else {
      if (typeof value !== 'undefined') return value.trim().length > 0;
    }
    return false;
  };

  private combine = (checkedArr: boolean[]) => {
    let str = '';
    this.calArr.forEach((ele, index) => {
      str += ele;
      str += checkedArr[index] ?? '';
    });
    try {
      const ans = Function(`return ${str};`)();
      if (typeof ans !== 'number') {
        throw new Error();
      }
      return !!ans;
    } catch {
      throw new CalRuleInValidError(this);
    }
  };

  parse(
    calculator: (value: string | undefined, choice: string | undefined) => boolean = this.calculator
  ) {
    if (!this.choices) {
      throw new CalRuleRequiredError(this);
    }
    if (!this.values) {
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
export const init = (rule: string) => {
  return new CalRule(rule);
};

export default CalRule;

export const version = config.version;
