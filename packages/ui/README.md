# @umbeli/ui

Composants UI React réutilisables pour les applications SaaS Umbeli.

## Installation

```bash
pnpm add @umbeli/ui
```

## Composants

### Button

```tsx
import { Button } from '@umbeli/ui';

<Button variant="primary" size="md">
  Click me
</Button>

<Button variant="secondary" fullWidth>
  Full width button
</Button>

<Button variant="ghost" size="sm">
  Ghost button
</Button>
```

**Props:**
- `variant`: `'primary'` | `'secondary'` | `'ghost'` (default: `'primary'`)
- `size`: `'sm'` | `'md'` | `'lg'` (default: `'md'`)
- `fullWidth`: `boolean` (default: `false`)

### Card

```tsx
import { Card } from '@umbeli/ui';

<Card padding="md" variant="default">
  Card content
</Card>
```

**Props:**
- `padding`: `'sm'` | `'md'` | `'lg'` (default: `'md'`)
- `variant`: `'default'` | `'muted'` (default: `'default'`)

### Icon

```tsx
import { Icon } from '@umbeli/ui';

<Icon name="settings-outline" size={24} color="#333" />
```

**Props:**
- `name`: string (IonIcon name)
- `size`: number | string (default: `20`)
- `color`: string (default: `'currentColor'`)

### Tabs

```tsx
import { Tabs } from '@umbeli/ui';

<Tabs
  tabs={[
    { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
    { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
  ]}
  variant="pills"
  defaultTab="tab1"
  onChange={(tabId) => console.log(tabId)}
/>
```

**Props:**
- `tabs`: Array of `{ id, label, icon?, content }`
- `variant`: `'default'` | `'pills'` (default: `'default'`)
- `defaultTab`: string
- `onChange`: `(tabId: string) => void`

### Skeleton

```tsx
import { Skeleton } from '@umbeli/ui';

<Skeleton style={{ width: 200, height: 20 }} />
```

## Styles

Import styles in your app entry point:

```tsx
import '@umbeli/ui/styles';
```

Or import individual component styles in SCSS:

```scss
@use '@umbeli/ui/src/styles/settings' as *;
```
