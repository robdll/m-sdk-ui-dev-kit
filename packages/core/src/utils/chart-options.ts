/**
 * Default chart options using theme colors
 */

import type { Chart, TooltipModel } from 'chart.js'
import { defaultChartColors } from '../constants/charts'

export { defaultChartColors }

/** Compute min, max, avg from a flat array of numbers */
// eslint-disable-next-line style/member-delimiter-style
export const computeStats = (values: number[]): { min: number; max: number; avg: number } => {
  if (values.length === 0) return { min: 0, max: 0, avg: 0 }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return { min, max, avg }
}

/** Get all numeric values from chart datasets */
export const getDatasetValues = (datasets: Array<{ data: (number | null)[] }>): number[] =>
  datasets.flatMap((ds) => ds.data.filter((v): v is number => typeof v === 'number'))

/** Add opacity to an HSL color string */
const addColorOpacity = (color: string, opacity: number): string =>
  typeof color === 'string' && color.startsWith('hsl')
    ? color.replace(')', ` / ${opacity})`)
    : color

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Add opacity to a color (HSL or hex) for area fill - uses softer opacity than line */
export const addColorOpacityForFill = (color: string, opacity = 0.15): string => {
  if (typeof color === 'string' && color.startsWith('hsl')) {
    return color.replace(')', ` / ${opacity})`)
  }
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')
  return `${color}${alpha}`
}

type LegendLabelItem = {
  text: string
  fillStyle: string
  strokeStyle: string
  lineWidth: number
  lineDash: number[]
  lineDashOffset: number
  lineCap: CanvasLineCap
  lineJoin: CanvasLineJoin
  hidden: boolean
  datasetIndex: number
  fontColor: string
}

/** Build legend items from chart datasets (avoids Chart.defaults which may be uninitialized at module load) */
const buildLegendLabels = (chart: Chart): LegendLabelItem[] => {
  const datasets = chart.data.datasets ?? []
  const fontColor = 'rgba(255, 255, 255, 0.7)'
  return datasets.map((dataset, i) => {
    const meta = chart.getDatasetMeta(i)
    const strokeStyleRaw = dataset.borderColor ?? dataset.backgroundColor ?? '#888'
    const strokeStyle = typeof strokeStyleRaw === 'string' ? strokeStyleRaw : '#888'
    const fillStyle = addColorOpacity(strokeStyle, 0.25)
    const ds = dataset as unknown as Record<string, unknown>
    return {
      text: (dataset.label as string) ?? '',
      fillStyle,
      strokeStyle,
      lineWidth: (dataset.borderWidth as number) ?? 1,
      lineDash: (ds.borderDash as number[] | undefined) ?? [],
      lineDashOffset: (ds.borderDashOffset as number | undefined) ?? 0,
      lineCap: (ds.borderCapStyle as CanvasLineCap | undefined) ?? 'butt',
      lineJoin: (ds.borderJoinStyle as CanvasLineJoin | undefined) ?? 'miter',
      hidden: meta.hidden,
      datasetIndex: i,
      fontColor,
    }
  })
}

export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: 0,
  },
  plugins: {
    tooltip: {
      enabled: false,
      mode: 'index' as const,
      intersect: false,
      external: (context: { tooltip: TooltipModel<any>; chart: Chart }) => {
        const { tooltip, chart } = context
        let el = document.getElementById('mining-sdk-chart-tooltip')
        if (!el) {
          el = document.createElement('div')
          el.id = 'mining-sdk-chart-tooltip'
          el.style.cssText =
            'position:absolute;padding:10px;background:rgba(0,0,0,0.8);color:#fff;font-size:12px;pointer-events:none;z-index:9999;border:none;border-radius:0'
          document.body.appendChild(el)
        }
        if (tooltip.opacity === 0) {
          el.style.opacity = '0'
          return
        }
        const items = tooltip.dataPoints ?? []
        const body = items
          .map(
            (item: {
              dataset?: { label?: string; borderColor?: unknown; backgroundColor?: unknown }
              formattedValue?: string
            }) => {
              const label = (item.dataset?.label as string) ?? ''
              const value = item.formattedValue ?? ''
              // Use dataset colors (same as legend) for value/unit; labels stay white
              const rawColor = item.dataset?.borderColor ?? item.dataset?.backgroundColor ?? '#888'
              const valueColor = typeof rawColor === 'string' ? rawColor : '#888'
              return `<div style="display:flex;gap:0.5rem;align-items:baseline"><span style="color:#fff">${escapeHtml(label)}:</span> <span style="color:${escapeHtml(valueColor)}">${escapeHtml(value)}</span></div>`
            },
          )
          .join('')
        el.innerHTML = body
        el.style.opacity = '1'
        const rect = chart.canvas.getBoundingClientRect()
        el.style.left = `${rect.left + tooltip.caretX + window.scrollX}px`
        el.style.top = `${rect.top + tooltip.caretY + window.scrollY}px`
        el.style.transform = `translate(-50%, -100%) translateY(-8px)`
      },
    },
    legend: {
      display: true,
      position: 'top' as const,
      align: 'start' as const,
      labels: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: { size: 12 },
        boxWidth: 10,
        boxHeight: 10,
        generateLabels: buildLegendLabels,
      },
    },
  },
  scales: {
    x: {
      display: true,
      grid: { display: false, color: '#4a4a4a' },
      ticks: { color: '#4a4a4a', maxRotation: 0 },
    },
    y: {
      display: true,
      grid: { display: true, color: '#4a4a4a' },
      ticks: { color: '#4a4a4a' },
    },
  },
  elements: {
    point: {
      radius: 0,
      hoverRadius: 4,
    },
  },
}
