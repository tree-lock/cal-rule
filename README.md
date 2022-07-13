# simple-rule

A simple frontend rule solution.

operator `&` `|` `!` `()` are supported.

`select` and `input` are supported.

## install

```bash
npm install simple-rule
```

## usage

### init

```javascript
import { init } from 'simple-rule';

const ruleStr = '1A&2B';

const rule = init(ruleStr);
```

while using typescript, you can also appoint the value type of `rule`.

```typescript
const rule = init<string>(ruleStr);
```

if `ruleStr` is invalid, `init` will return `undefined`;

### inject & parse

pass the value to rule, parse the

```typescript
const rule = init(ruleStr);

const choices = [
  ['option1A', 'option1B', 'option1C'],
  ['option2A', 'option2B', 'option2C', 'option2D'],
  ['option3A', 'option3B']
];

const values = ['option1A', 'option2B', undefined];

// since the ruleStr only infer to the value of position [0] and [1], choices[2] and values[2] can be passed but ignored.
rule.inject(choices, values);

// true
const ans: boolean = rule.parse();
```

`parse` can pass a function to judge if the values;

```typescript
const choices = [
  ['option1A', 'option1B', 'option1C'],
  ['option2A', 'option2B', 'option2C', 'option2D'],
  ['option3A', 'option3B']
];

const values = ['option1A; option1B; option1C', 'option2B; option2D', undefined];

rule.inject(choices, values);

// true
const ans: boolean = rule.parse((value, choice): boolean => {
  return value.includes(choice);
});
```

The second param `choice` is defined by ruleStr and choices.

In `1A&2B` case:

| serial | value                            | choice       | rule    | ans             |
| ------ | -------------------------------- | ------------ | ------- | --------------- |
| 0      | `'option1A; option1B; option1C'` | `'option1A'` | `1A`    | true            |
| 1      | `'option2B; option2D'`           | `'option2B'` | `2B`    | true            |
| 2      | values                           | choices      | `1A&2B` | ans[0] & ans[1] |

Default function is

```typescript
(value, choice) => {
  return value === choice;
};
```
