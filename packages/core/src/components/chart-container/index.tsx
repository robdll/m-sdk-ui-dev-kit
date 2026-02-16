import * as React from 'react'

import { cn } from '../../utils'

function legendFillColor(color: string): string {
  if (color.startsWith('hsl')) {
    return color.replace(')', ' / 0.25)')
  }
  return `${color}40`
}

export type RangeSelectorOption = {
  label: string
  value: string
}

export type RangeSelectorProps = {
  options: RangeSelectorOption[]
  value: string
  onChange: (value: string) => void
}

export type HighlightedValueProps = {
  /** The main value (e.g. "3.590") - rendered prominently in primary color */
  value: string | number
  /** Optional unit (e.g. "PH/s") - rendered smaller in muted color */
  unit?: string
}

export type LegendItem = {
  label: string
  color: string
}

export type ChartContainerProps = {
  /** Chart title */
  title?: string
  /** Custom header (overrides title if both provided) */
  header?: React.ReactNode
  /** Legend items when using grid layout (chart must hide its built-in legend via showLegend={false}) */
  legendData?: LegendItem[]
  /** Highlighted value displayed in top right (e.g. current/latest metric) */
  highlightedValue?: HighlightedValueProps
  /** Time range selector buttons (e.g. 5 Min, 30 Min, 3 H, 1 D) */
  rangeSelector?: RangeSelectorProps
  /** Show loading state */
  loading?: boolean
  /** Show empty state */
  empty?: boolean
  /** Message when empty */
  emptyMessage?: string
  /** Footer content (e.g. Min/Max/Avg stats) */
  footer?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/**
 * ChartContainer - Common wrapper for charts with title, loading, and empty states
 *
 * @example
 * ```tsx
 * <ChartContainer title="Revenue" loading={isLoading} empty={!data.length}>
 *   <LineChart data={data} options={options} />
 * </ChartContainer>
 * ```
 */
export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  (
    {
      title,
      header,
      legendData,
      highlightedValue,
      rangeSelector,
      loading,
      empty,
      emptyMessage = 'No data available',
      footer,
      className,
      children,
    },
    ref,
  ) => {
    const useGridLayout = (legendData && legendData.length > 0) || highlightedValue || rangeSelector
    const hasHeaderRow1 = header ?? title ?? (rangeSelector && rangeSelector.options.length > 0)
    const hasLegendRow = legendData && legendData.length > 0

    return (
      <div
        ref={ref}
        className={cn(
          'mining-sdk-chart-container',
          useGridLayout && 'mining-sdk-chart-container--grid',
          className,
        )}
      >
        {useGridLayout ? (
          <>
            <div className="mining-sdk-chart-container__title-area">
              {hasHeaderRow1 &&
                (header ??
                  (title && <h3 className="mining-sdk-chart-container__title">{title}</h3>))}
            </div>
            <div className="mining-sdk-chart-container__range-area">
              {rangeSelector && rangeSelector.options.length > 0 && (
                <div
                  className="mining-sdk-chart-container__range-selector"
                  role="group"
                  aria-label="Time range"
                >
                  {rangeSelector.options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={rangeSelector.value === opt.value}
                      className={cn(
                        'mining-sdk-chart-container__range-btn',
                        rangeSelector.value === opt.value &&
                          'mining-sdk-chart-container__range-btn--active',
                      )}
                      onClick={() => rangeSelector.onChange(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mining-sdk-chart-container__legend-area">
              {hasLegendRow && (
                <div className="mining-sdk-chart-container__legend">
                  {legendData!.map((item, i) => (
                    <div key={i} className="mining-sdk-chart-container__legend-item">
                      <span
                        className="mining-sdk-chart-container__legend-box"
                        style={{
                          backgroundColor: legendFillColor(item.color),
                          borderColor: item.color,
                        }}
                      />
                      <span className="mining-sdk-chart-container__legend-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mining-sdk-chart-container__highlight-area">
              {highlightedValue && (
                <div className="mining-sdk-chart-container__highlighted-value">
                  <span className="mining-sdk-chart-container__highlighted-value__number">
                    {highlightedValue.value}
                  </span>
                  {highlightedValue.unit && (
                    <span className="mining-sdk-chart-container__highlighted-value__unit">
                      {highlightedValue.unit}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="mining-sdk-chart-container__chart-area">
              {loading && (
                <div className="mining-sdk-chart-container__loading">
                  <span className="mining-sdk-chart-container__spinner" aria-hidden="true" />
                </div>
              )}
              {empty && !loading && (
                <div className="mining-sdk-chart-container__empty">{emptyMessage}</div>
              )}
              {!loading && !empty && children}
            </div>
          </>
        ) : (
          <>
            {hasHeaderRow1 && (
              <div className="mining-sdk-chart-container__header-row">
                <div className="mining-sdk-chart-container__header-left">
                  {header ??
                    (title && <h3 className="mining-sdk-chart-container__title">{title}</h3>)}
                </div>
              </div>
            )}
            <div className="mining-sdk-chart-container__body">
              {loading && (
                <div className="mining-sdk-chart-container__loading">
                  <span className="mining-sdk-chart-container__spinner" aria-hidden="true" />
                </div>
              )}
              {empty && !loading && (
                <div className="mining-sdk-chart-container__empty">{emptyMessage}</div>
              )}
              {!loading && !empty && children}
            </div>
          </>
        )}
        {footer && !loading && !empty && (
          <div className="mining-sdk-chart-container__footer">{footer}</div>
        )}
      </div>
    )
  },
)
ChartContainer.displayName = 'ChartContainer'
