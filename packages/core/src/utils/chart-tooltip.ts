import type { Chart, TooltipItem, TooltipModel } from 'chart.js'
import { COLOR } from '../constants/colors'

export type ChartTooltipConfig = {
  /** Color for label text. Use 'dataset' to match dataset border color. Defaults to COLOR.LIGHT_GREY */
  labelColor?: string | 'dataset'
  /** Color for value text. Use 'dataset' to match dataset border color. Defaults to 'dataset' */
  valueColor?: string | 'dataset'
  /** Format function for the displayed value. Receives raw value and the tooltip item context. */
  valueFormatter?: (value: number, item: TooltipItem<any>) => string
  /** Background color of the tooltip (default: COLOR.DARK_BLACK / #10100F) */
  backgroundColor?: string
  /** Font size in pixels (default: 12) */
  fontSize?: number
  /** Minimum width in pixels (default: 200) */
  minWidth?: number
  /** Show the chart title row in the tooltip (default: false) */
  showTitle?: boolean
  /** Tooltip interaction mode (default: 'index'). Use 'nearest' for doughnut/pie charts. */
  mode?: 'index' | 'nearest' | 'point' | 'dataset'
  /** Whether tooltip requires direct intersection (default: false) */
  intersect?: boolean
}

const TOOLTIP_CONTAINER_ID = 'mining-sdk-chart-tooltip'

const getOrCreateTooltipEl = (chart: Chart): HTMLDivElement => {
  const canvas = chart.canvas
  const container = canvas.parentElement
  if (!container) throw new Error('Chart canvas must have a parent element')

  let tooltipEl = container.querySelector<HTMLDivElement>(`#${TOOLTIP_CONTAINER_ID}`)

  if (!tooltipEl) {
    tooltipEl = document.createElement('div')
    tooltipEl.id = TOOLTIP_CONTAINER_ID
    tooltipEl.style.position = 'absolute'
    tooltipEl.style.pointerEvents = 'none'
    tooltipEl.style.transition = 'opacity 0.15s ease'
    container.style.position = 'relative'
    container.appendChild(tooltipEl)
  }

  return tooltipEl
}

const resolveDatasetColor = (item: TooltipItem<any>): string => {
  const ds = item.dataset
  const bg = ds.backgroundColor
  const border = ds.borderColor

  if (Array.isArray(bg)) return String(bg[item.dataIndex] ?? bg[0] ?? '#888')
  if (Array.isArray(border)) return String(border[item.dataIndex] ?? border[0] ?? '#888')

  const raw = border ?? bg ?? '#888'
  if (typeof raw === 'string') return raw
  return '#888'
}

/**
 * Creates a Chart.js external tooltip handler matching the miningOS design.
 *
 * @example
 * ```tsx
 * const options = {
 *   plugins: {
 *     tooltip: buildChartTooltip({
 *       valueFormatter: (v) => `${v.toFixed(2)} PH/s`,
 *       valueColor: 'dataset',
 *       labelColor: 'dataset',
 *     }),
 *   },
 * }
 * ```
 */
export const buildChartTooltip = (
  config: ChartTooltipConfig = {},
): {
  enabled: boolean
  external: (context: { chart: Chart; tooltip: TooltipModel<any> }) => void
  mode: string
  intersect: boolean
} => {
  const {
    labelColor = COLOR.LIGHT_GREY,
    valueColor = 'dataset',
    valueFormatter,
    backgroundColor = COLOR.DARK_BLACK,
    fontSize = 12,
    minWidth = 200,
    showTitle = false,
    mode = 'index',
    intersect = false,
  } = config

  const externalHandler = (context: { chart: Chart; tooltip: TooltipModel<any> }): void => {
    const { chart, tooltip } = context
    const tooltipEl = getOrCreateTooltipEl(chart)

    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = '0'
      return
    }

    let innerHtml = '<div style="display: flex; flex-direction: column; gap: 8px;">'

    if (showTitle && tooltip.title?.length) {
      const titleText = tooltip.title.join(' ')
      innerHtml += `<div style="
        font-size: ${fontSize - 2}px;
        color: ${COLOR.LIGHT_GREY};
        opacity: 0.7;
      ">${titleText}</div>`
    }

    const bodyItems = tooltip.dataPoints ?? []
    for (const item of bodyItems) {
      const dsColor = resolveDatasetColor(item)
      const resolvedLabelColor = labelColor === 'dataset' ? dsColor : labelColor
      const resolvedValueColor = valueColor === 'dataset' ? dsColor : valueColor

      const label = item.dataset.label || item.label || ''
      const rawValue =
        typeof item.parsed === 'object'
          ? (item.parsed.y ?? item.parsed.x ?? item.parsed ?? 0)
          : (item.parsed ?? 0)
      const formattedValue = valueFormatter
        ? valueFormatter(Number(rawValue), item)
        : String(rawValue)

      innerHtml += `<div style="
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        font-size: ${fontSize}px;
        line-height: ${fontSize + 4}px;
        gap: 16px;
      ">
        <span style="color: ${resolvedLabelColor}; white-space: nowrap;">${label}</span>
        <span style="color: ${resolvedValueColor}; white-space: nowrap; font-weight: 600;">${formattedValue}</span>
      </div>`
    }

    innerHtml += '</div>'
    tooltipEl.innerHTML = innerHtml

    Object.assign(tooltipEl.style, {
      opacity: '1',
      background: backgroundColor,
      color: COLOR.LIGHT_GREY,
      borderRadius: '0px',
      padding: '12px 16px',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: `${fontSize}px`,
      minWidth: `${minWidth}px`,
      zIndex: '10',
    })

    const { offsetLeft, offsetTop } = chart.canvas
    const tooltipWidth = tooltipEl.offsetWidth
    const tooltipHeight = tooltipEl.offsetHeight
    const canvasWidth = chart.canvas.offsetWidth
    const canvasHeight = chart.canvas.offsetHeight

    let left = offsetLeft + tooltip.caretX + 12
    let top = offsetTop + tooltip.caretY

    if (left + tooltipWidth > offsetLeft + canvasWidth) {
      left = offsetLeft + tooltip.caretX - tooltipWidth - 12
    }
    if (left < offsetLeft) {
      left = offsetLeft
    }
    if (top + tooltipHeight > offsetTop + canvasHeight) {
      top = offsetTop + canvasHeight - tooltipHeight
    }
    if (top < offsetTop) {
      top = offsetTop
    }

    tooltipEl.style.left = `${left}px`
    tooltipEl.style.top = `${top}px`
  }

  return {
    enabled: false,
    external: externalHandler,
    mode,
    intersect,
  }
}
