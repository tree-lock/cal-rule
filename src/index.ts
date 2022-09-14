import { config } from './config';
import {
  CalRuleInValidError,
  CalRuleRequiredError,
  CalRuleXssError,
  ChoiceMissingWarning
} from './error';
import versionConfig from './version-config';

const regex = /\d+[A-Z]?/g;
const operatorRegex = /^[()|&!]*$/;
const acceptableRegex = /^([()|&!]|(true)|(false))*$/;

export const defaultCalculator = <Choice = any, Value = Choice>(
  value: Value | undefined,
  choice: Choice | undefined,
  /** useful only when set `other` true and choice is undefined */
  excludes?: Choice[]
): boolean => {
  if (typeof value === 'string' && value.length === 0) {
    if (typeof choice === 'string' && choice === '') return true;
    else return false;
  }
  if (value instanceof Array && value.length === 0) {
    if (choice instanceof Array && choice.length === 0) return true;
    else return false;
  }
  if (typeof value === 'undefined' || value === null) {
    // value empty
    return false;
  }
  // select
  if (typeof choice !== 'undefined') {
    // single-select
    if (typeof value === typeof choice) {
      return (value as unknown) === (choice as unknown);
    }
    // multi-select
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
    if (typeof excludes !== 'undefined') {
      if (typeof value === 'string') {
        return value.trim().length > 0 && !(excludes as unknown[]).includes(value);
      } else if (value instanceof Array) {
        return (
          value.findIndex((item) => {
            return !excludes.includes(item);
          }) > -1
        );
      }
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    } else if (typeof value === 'number') {
      return !isNaN(value);
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
  /**
   * If required choice at `choices[x].length` position missing while `other` option set true,
   * regard it as a checking other option situation;
   *
   * For example,
   *
   * ```typescript
   * const calRule = init('1E');
   * calRule.choices = ['A', 'B', 'C', 'D'];
   * calRule.values = ['some other value'];
   * ```
   *
   * if `calRule.other` is set `false`, it will throw a `ChoiceMissingWarning` with `false` value return;
   *
   * `calRule.other` set `true`, `true` will be returned since `1E` is regarded as checking extra option
   * and `values[0]` meets by it not matching any value among choices;
   *
   * However, if the rule requiring 2 more items larger than length of choices (rule `1F` with choices `['A', 'B', 'C', 'D']`),
   * it will always throw `ChoiceMissingWarning` and return `false` ;
   * */
  other = false;

  calculator!: (
    value: Value | undefined,
    choice: Choice | undefined,
    excludes?: Choice[]
  ) => boolean;

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
      if (str.startsWith('!')) {
        // To make `!true` str valid
        const trimExclamation = (str: string): string => {
          if (str.startsWith('!')) {
            str = str.substring(1);
            return trimExclamation(str);
          } else {
            return str;
          }
        };
        str = trimExclamation(str);
      }
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
    calculator: (
      value: Value | undefined,
      choice: Choice | undefined,
      excludes?: Choice[]
    ) => boolean = this.calculator
  ) {
    if (!this.choices || !this.values || !this.calculator) {
      throw new CalRuleRequiredError(this);
    }
    const checkedArr = this.checkIndex.map((item, index) => {
      const value = this.values[item[0]];
      if (item[1] === -1) {
        // If item[1] === -1, it is a input field, choices should not be provided;
        return calculator(value, undefined);
      } else {
        const choicesItem = this.choices[item[0]];
        // Check if choices exists
        if (typeof choicesItem !== 'undefined') {
          // Choice missing at the exact position
          if (typeof choicesItem[item[1]] === 'undefined') {
            if (this.other && choicesItem.length === item[1]) {
              return calculator(value, undefined, choicesItem);
            }
            ChoiceMissingWarning(item, this.ruleArr[index], this);
            return false;
          }
          return calculator(value, choicesItem[item[1]]);
        } else {
          ChoiceMissingWarning([item[0]], this.ruleArr[index], this);
          return false;
        }
      }
    });
    return this.combine(checkedArr);
  }
}
export const init = <Choice = any, Value = Choice>(
  rule: string,
  options?: {
    other?: true;
  }
) => {
  const ans = new CalRule<Choice, Value>(rule);
  ans.calculator = defaultCalculator;
  if (options) {
    (Object.keys(options) as (keyof typeof options)[]).forEach((option) => {
      ans[option] = true;
    });
  }
  return ans;
};

export default CalRule;

export const version = versionConfig.version;
