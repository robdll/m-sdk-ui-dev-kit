## feat: Custom HTML chart tooltip with dataset-colored values

### Summary

Migrates the miningOS tooltip design to the SDK as a reusable `buildChartTooltip` utility. The tooltip renders as an external HTML element that follows the real mouse cursor (not data-point snapping), with labels in neutral white and values colored to match the dataset line/bar color.

### What changed

- **New file**: `packages/core/src/utils/chart-tooltip.ts`
  - `buildChartTooltip(config)` — returns Chart.js external tooltip options
  - `ChartTooltipConfig` type — configurable label/value colors, value formatter, background, font size, min width, interaction mode
  - Tooltip positioning driven by a `mousemove` listener on the chart container (matches the miningOS `handleCrosshairMove` approach), not by Chart.js's `caretX`/`caretY`
  - `mouseleave` hides the tooltip immediately

- **Updated chart components** — added optional `tooltip?: ChartTooltipConfig` prop to:
  - `BarChart`
  - `LineChart`
  - `AreaChart`
  - `DoughnutChart`

- **Updated `buildBarChartOptions`** — accepts optional `tooltip` config

- **Updated demo examples** — all chart demos (except the first basic LineChart) now showcase the custom tooltip

### Design decisions

| Aspect | Implementation |
|---|---|
| Label color | Neutral white (`#D9D9D9`) by default, configurable via `labelColor` |
| Value color | Dataset color by default (`'dataset'`), configurable via `valueColor` |
| Border radius | None (0px), per design spec |
| Positioning | Real mouse cursor + 10px gap (right or left based on space) |
| Font | JetBrains Mono, matching the design system |
| Background | `#10100F` (DARK_BLACK) |
| Layout | Flex column with `gap: 8px` (no trailing margin) |
| Value formatting | Optional `valueFormatter(value, item)` function |

### Usage

```tsx
<LineChart
  data={data}
  tooltip={{
    valueFormatter: (v) => `${v.toFixed(2)} PH/s`,
  }}
/>
```

The tooltip is opt-in — charts without a `tooltip` prop keep their default Chart.js tooltip behavior.

### Screenshots

| Before (default Chart.js tooltip) | After (custom HTML tooltip) |
|---|---|
| Default tooltip with color boxes | Labels in white, values in dataset color, dark bg, no border radius |

### Test plan

- [x] Line chart tooltip follows mouse smoothly, shows correct values
- [x] Bar chart tooltip works with stacked, grouped, and horizontal variants
- [x] Area chart tooltip tracks mouse and shows formatted values
- [x] Doughnut chart tooltip shows per-slice values with correct colors
- [x] Tooltip flips to left side when near right edge
- [x] Tooltip stays within chart bounds vertically
- [x] Tooltip hides on mouse leave
- [x] Charts without `tooltip` prop keep default behavior (first basic LineChart)
- [x] `valueFormatter` correctly formats displayed values
- [x] `labelColor: 'dataset'` option colors labels to match dataset
- [x] No TypeScript errors, lint passes
