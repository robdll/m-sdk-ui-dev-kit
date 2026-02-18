import { DoughnutChart } from '@mining-sdk/core'
import React from 'react'
import {
  DOUGHNUT_CHART_MINER_STATUS,
  DOUGHNUT_CHART_MINER_TYPES,
  DOUGHNUT_CHART_SITE_DISTRIBUTION,
} from '../constants/demo-chart-data'

export const PieChartExample: React.FC = () => {
  const minerTypeTotal = DOUGHNUT_CHART_MINER_TYPES.reduce((a, d) => a + d.value, 0)

  return (
    <div className="demo-section__charts">
      <section>
        <h3>Miner Types (full card)</h3>
        <DoughnutChart
          data={DOUGHNUT_CHART_MINER_TYPES}
          label="Total Miners"
          value={minerTypeTotal}
        />
      </section>

      <section>
        <h3>Miner Status</h3>
        <DoughnutChart
          data={DOUGHNUT_CHART_MINER_STATUS}
          label="Miner Status"
          value={DOUGHNUT_CHART_MINER_STATUS.reduce((a, d) => a + d.value, 0)}
        />
      </section>

      <section>
        <h3>Site Distribution (auto colors)</h3>
        <DoughnutChart
          data={DOUGHNUT_CHART_SITE_DISTRIBUTION}
          label="Miners per Site"
          value={DOUGHNUT_CHART_SITE_DISTRIBUTION.reduce((a, d) => a + d.value, 0)}
        />
      </section>

      <section>
        <h3>No Header</h3>
        <DoughnutChart data={DOUGHNUT_CHART_MINER_STATUS} />
      </section>
    </div>
  )
}
