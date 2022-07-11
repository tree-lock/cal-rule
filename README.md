# simple-rule

## install

```bash
npm install simple-rule
```

## usage

```typescript
import { init } from "simple-rule";

const ruleStr = "1A&2B";

const rule = init(ruleStr);
```

`init` will return an array with length that max number among the `ruleStr`.

| str | return |
| -- | -- |
| `1A&2B` | Array(2) | 
| `1A&3B` | Array(3) |
| `2A&100B` | Array(100) |
