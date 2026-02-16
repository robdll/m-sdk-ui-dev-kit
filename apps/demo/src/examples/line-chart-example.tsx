import { ChartContainer, computeStats, LineChart } from '@mining-sdk/core'
import React from 'react'
import {
  LINE_CHART_DAILY_REVENUE,
  LINE_CHART_HASH_RATE,
  LINE_CHART_REVENUE_BASIC,
  LINE_CHART_TEMPERATURE,
} from '../constants/demo-chart-data'

export const LineChartExample: React.FC = () => {
  const hashRatePrimaryData = (LINE_CHART_HASH_RATE.datasets[0]?.data ?? []) as number[]
  const hashRateStats = computeStats(hashRatePrimaryData)

  const temperatureData = (LINE_CHART_TEMPERATURE.datasets[0]?.data ?? []) as number[]
  const temperatureStats = computeStats(temperatureData)

  const dailyRevenueData = (LINE_CHART_DAILY_REVENUE.datasets[0]?.data ?? []) as number[]
  const dailyRevenueStats = computeStats(dailyRevenueData)

  return (
    <div className="demo-section__charts">
      <section>
        <h3>Basic</h3>
        <ChartContainer title="Revenue over time">
          <LineChart height={250} data={LINE_CHART_REVENUE_BASIC} />
        </ChartContainer>
      </section>
      <section>
        <h3>Hash Rate style</h3>
        <ChartContainer
          title="Hash Rate"
          footer={
            <span>
              Min {hashRateStats.min.toFixed(2)} PH/s · Max {hashRateStats.max.toFixed(2)} PH/s ·
              Avg {hashRateStats.avg.toFixed(2)} PH/s
            </span>
          }
        >
          <LineChart
            height={250}
            formatYLabel={(v) => `${v.toFixed(2)} PH/s`}
            data={LINE_CHART_HASH_RATE}
          />
        </ChartContainer>
      </section>
      <section>
        <h3>With points + footer</h3>
        <ChartContainer
          title="Temperature"
          footer={
            <span>
              Min {temperatureStats.min}°C · Max {temperatureStats.max}°C · Avg{' '}
              {temperatureStats.avg.toFixed(1)}°C
            </span>
          }
        >
          <LineChart
            height={250}
            showPoints
            formatYLabel={(v) => `${v}°C`}
            data={LINE_CHART_TEMPERATURE}
          />
        </ChartContainer>
      </section>
      <section>
        <h3>Currency format</h3>
        <ChartContainer
          title="Daily revenue"
          footer={
            <span>
              Min ${dailyRevenueStats.min.toLocaleString()} · Max $
              {dailyRevenueStats.max.toLocaleString()} · Avg ${dailyRevenueStats.avg.toFixed(0)}
            </span>
          }
        >
          <LineChart
            height={250}
            formatYLabel={(v) => `$${(v / 1000).toFixed(1)}k`}
            data={LINE_CHART_DAILY_REVENUE}
          />
        </ChartContainer>
      </section>
    </div>
  )
}
