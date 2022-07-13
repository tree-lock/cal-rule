import config from './config';

const regex = /\d+[A-Z]?/g;
class CalRule {
  private rule: string;
  private readonly ruleArr: string[];
  private readonly checkIndex: [number, number][];
  private readonly calArr: string[];
  constructor(rule: string) {
    this.rule = rule;
    this.calArr = this.rule.split(regex);
    const arr = this.rule.match(regex);
    if (!arr) {
      throw new Error(`[cal-rule]: inValid rule ${rule}`);
    }
    this.ruleArr = arr;
    this.checkIndex = arr.map((item) => {
      const numIndex = Number((item.match(/\d+/) as Array<string>)[0]) - 1;
      const alphabet = (item.match(/[A-Z]/) as Array<string>)[0];
      const alphabetIndex = alphabet.length > 0 ? alphabet.charCodeAt(0) - 'A'.charCodeAt(0) : -1;
      return [numIndex, alphabetIndex];
    });
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

  parse(
    calculator: (value: string | undefined, choice: string | undefined) => boolean = this.calculator
  ) {
    if (!this.choices) {
      throw new Error('[cal-rule] choices needed');
    }
    if (!this.values) {
      throw new Error('[cal-rule] values needed');
    }
    const checkedArr = this.checkIndex.map((item, index) => {
      if (item[1] === -1) {
        return calculator(this.values[item[0]], undefined);
      } else {
        const choicesItem = this.choices[item[0]];
        if (choicesItem) {
          if (choicesItem[item[1]]) {
            console.warn(
              `[cal-rule] ${this.rule} require choice for position [${item[0]}][${item[1]}], but undefined is provided; Since this reason, rule ${this.ruleArr[index]} will always return false`
            );
            return false;
          }
          return calculator(this.values[item[0]], choicesItem[item[1]]);
        } else {
          console.warn(
            `[cal-rule] ${this.rule} require choices for position [${item[0]}], but undefined is provided;  Since this reason, rule ${this.ruleArr[index]} will always return false`
          );
          return false;
        }
      }
    });
    let ansStr = '';
    this.calArr.forEach((ele, index) => {
      ansStr += ele;
      ansStr += checkedArr[index] ?? '';
    });
    return !!(eval(ansStr) as number);
  }
}
export const init = (rule: string) => {
  return new CalRule(rule);
};

export default CalRule;

export const version = config.version;
