# cal-rule

[![LICENSE](https://img.shields.io/npm/l/cal-rule.svg?sanitize=true)](https://github.com/darkXmo/cal-rule/blob/main/LICENSE)
[![NPM version](https://img.shields.io/npm/v/cal-rule.svg?style=flat)](https://npmjs.com/package/cal-rule)
[![CircleCI](https://circleci.com/gh/darkXmo/cal-rule.svg?style=shield)](https://circleci.com/gh/darkXmo/cal-rule)
[![Codecov](https://badgen.net/codecov/c/github/darkXmo/cal-rule)](https://app.codecov.io/gh/darkXmo/cal-rule)
[![install size](https://badgen.net/packagephobia/install/cal-rule)](https://packagephobia.now.sh/result?p=cal-rule)

A simple javascript/typescript calculating rule solution.

> `1A&2B|!(3C&4D)`

operator `&` `|` `!` `()` are supported.

`select` and `input` are supported.

> - `1A` means choose the first item of first choice;
> - `1` means first value is valid;
> - `1B&2A` means choose second option of first question **and** first options of second question.
> - `1B|2A` means choose second option of first question **or** first options of second question.
> - `!` means reverse, if `1A` parsed to true, `!1A` will parsed to false.
> - You can customize your own strategy as well;

## install

```bash
npm install cal-rule
```

```bash
yarn add cal-rule
```

```bash
pnpm add cal-rule
```

## usage

### init

```javascript
import { init } from 'cal-rule';

const ruleStr = '1A&2B';

const rule = init(ruleStr);
```

While using typescript, you can also appoint the value type of `rule`.

```typescript
const rule = init<string>(ruleStr);
```

if `ruleStr` is invalid, `init` will throw a `Error`;

### choices & values & parse

`cal-rule` requires choices and values to calculate, `choices[0][0]` will be considered as `1A`.

```typescript
const rule = init(ruleStr);

const choices = [
  ['option1A', 'option1B', 'option1C'],
  ['option2A', 'option2B', 'option2C', 'option2D'],
  ['option3A', 'option3B']
];

const values = ['option1A', 'option2B', undefined];

// since the ruleStr only infer to the value of position [0] and [1], choices[2] and values[2] will be ignored.
rule.choices = choices;
rule.values = values;

// true
const ans: boolean = rule.parse();
```

If there is a `input` value instead of `select`, which means no choices can be provided, `undefined` is ok to be passed as an item of `choices`.

```typescript
const ruleStr = '1A&2';

const rule = init(ruleStr);

const choices = [['option1A', 'option1B', 'option1C'], undefined, ['option3A', 'option3B']];

const values = ['option1A; option1B; option1C', 'input value', undefined];

rule.choices = choices;
rule.values = values;

// true
const ans: boolean = rule.parse();
```

`parse` provide a functional param to cover the default calculator;

```typescript
const choices = [
  ['option1A', 'option1B', 'option1C'],
  ['option2A', 'option2B', 'option2C', 'option2D'],
  ['option3A', 'option3B']
];

const values = ['option1A; option1B; option1C', 'option2B; option2D', undefined];

rule.choices = choices;
rule.values = values;

// true
const ans: boolean = rule.parse((value, choice): boolean => {
  if (value) {
    return value.includes(choice);
  }
  return false;
});
```

The second param `choice` is defined by ruleStr and choices. `1A` means `choices[0][0]`, while `2B` means `choices[1][1]`

In `1A&2B` case:

| serial | value                            | choice       | rule    | ans                      |
| ------ | -------------------------------- | ------------ | ------- | ------------------------ |
| 0      | `'option1A; option1B; option1C'` | `'option1A'` | `1A`    | true                     |
| 1      | `'option2B; option2D'`           | `'option2B'` | `2B`    | true                     |
| 2      | values                           | choices      | `1A&2B` | ans[0] & ans[1] === true |

Default function pass to parse ↓

```typescript
const defaultCalculator = <Choice = any, Value = Choice>(
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
```

### calculator

`cal-rule` allows developer to customize the default calculator.

```typescript
rule.calculator = (value, choice): boolean => {
  if (value) {
    return value.includes(choice);
  }
  return false;
};
```

### other

`cal-rule` can check extra choice that is not includes in choices but checked by rule.

```typescript
const rule: CalRule = init('1E');
const choices = [['A', 'B', 'C', 'D']];
it('other option', () => {
  rule.choices = choices;
  rule.values = ['other'];
  // return false
  rule.parse();
});
```

`1E` infer to `choices[0][4]`, which does not exist, so `parse` should return a `false`.

However, sometimes you may have **extra value** that is not included in choices

```typescript
const definedChoices = ['OptionA', 'OptionB', 'OptionC', 'OptionD'];
const realChoices = ['OptionA', 'OptionB', 'OptionC', 'OptionD', 'Custom Input Value: Other'];

rule.choices = definedChoices;
```

`cal-rule` can regard such **extra value** as a **other choice**.

```typescript
/** set config other true */
const rule: CalRule = init('1E', {
  other: true
});
const choices = [['A', 'B', 'C', 'D']];
it('other option', () => {
  rule.choices = choices;
  rule.values = ['other'];
  // return true
  rule.parse();
});
```

because of `1E` meaning `choices[0][4]` and `4 === choices[0].length + 1`, `cal-rule` will check if `value[0]` is a valid extra value.

> inValid extra value: `''`, `NaN`, `undefined`, `null`, `[]`.

> rule `1E` exactly responses to `choices[0].length + 1`;
> in case of rule `1F`, will only works when `choices[0].length === 5`;

## Project Actives

![Alt](https://repobeats.axiom.co/api/embed/070ab5736ffbb0afce1a6c9ebe598032c60730a8.svg 'Repobeats analytics image')
