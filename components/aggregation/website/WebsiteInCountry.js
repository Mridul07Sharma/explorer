/* global process */

import React from 'react'
import { Flex, Box } from 'ooni-components'
import { VictoryChart, VictoryStack, VictoryBar, VictoryAxis, VictoryLabel } from 'victory'
import { theme } from 'ooni-components'
import useSWR from 'swr'

// import wdata from './website-data'  // static data for offline mode
import { Debug } from './Debug'
import { paramsToQuery } from './queryUtils'
import VictoryTheme from '../../VictoryTheme'
import { AppsChartLoader } from '../../country/WebsiteChartLoader'

const AGGREGATION_API = `${process.env.MEASUREMENTS_URL}/api/v1/aggregation?`

const dataFetcher = url => (
  fetch(AGGREGATION_API + url).then(r => r.json())
)

const colorScale = [
  theme.colors.green8,
  theme.colors.gray6,
  theme.colors.yellow9,
  theme.colors.red7,
]

const themeOverride = Object.assign({}, VictoryTheme, {})
themeOverride.axis.style.axis.strokeWidth = 0
themeOverride.axis.style.ticks.size = 0

const WebsiteInCountry = ({ params }) => {

  const query = paramsToQuery(params)

  const { data, error } = useSWR(query, dataFetcher)
  // const data = wdata, error = null

  return (
    <Flex flexDirection='column'>
      {!data && !error && <AppsChartLoader height={200} width={800} xOffset={70} barWidth={13} barHeight={90} />}
      {data &&
      <VictoryChart
        width={800}
        height={200}
        domainPadding={{ x: 30, y: 20 }}
        theme={themeOverride}
      >
        <VictoryStack colorScale={colorScale}>
          {[ 'measurement_count', 'failure_count', 'anomaly_count', 'confirmed_count'].map(key =>
            <VictoryBar
              key={key}
              name={key}
              data={data.result}
              x='measurement_start_day'
              y={d => {
                if (key === 'measurement_count') {
                  return d.measurement_count - (d.anomaly_count + d.failure_count + d.confirmed_count)
                } else {
                  return d[key]
                }
              }}
            />
          )}
        </VictoryStack>
        <VictoryAxis
          scale={{ x: 'time' }}
          fixLabelOverlap
          tickLabelComponent={
            <VictoryLabel angle={270} dy={0} textAnchor='end' verticalAnchor='middle' />
          }
        />
      </VictoryChart>}
      <Debug params={params}>
        <pre>
          {error && <p>{error}</p>}
          {!data && !error && <p> Loading data... </p>}
          {data && JSON.stringify(data, null, 2)}
        </pre>
      </Debug>
    </Flex>
  )
}

export default WebsiteInCountry
