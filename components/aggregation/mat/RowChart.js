import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Box, Flex, theme } from 'ooni-components'
import { ResponsiveBarCanvas as Bar } from '@nivo/bar'

import { CustomBarItem } from './CustomBarItem'
import { CustomToolTip } from './CustomTooltip'
import { colorMap } from './colorMap'
import { useDebugContext } from '../DebugContext'
import { useMATContext } from './MATContext'

const keys = [
  'anomaly_count',
  'confirmed_count',
  'failure_count',
  'ok_count',
]

const colorFunc = (d) => colorMap[d.id] || '#ccc'

const barLayers = ['grid', 'axes', 'bars']
export const chartMargins = { top: 4, right: 50, bottom: 4, left: 0 }

const barThemeForTooltip = {
  tooltip: {
    container: {
      pointerEvents: 'initial',
      boxShadow: `1px 1px 4px 1px ${theme.colors.gray6}`
    }
  }
}

const RowChart = ({ data, indexBy, label, height, rowIndex /* width, first, last */}) => {
  const [ { tooltipIndex }, updateMATContext ] = useMATContext()


  const handleClick = useCallback(({ column }) => {
    updateMATContext({ tooltipIndex: [rowIndex, column]}, true)
  }, [rowIndex, updateMATContext])

  // Load the chart with an empty data to avoid
  // react-spring from working on the actual data during
  // first render. This forces an update after 1ms with
  // real data, which appears quick enough with animation disabled
  // const [chartData, setChartData] = useState([])
  // useEffect(() => {
  //   let animation = setTimeout(() => setChartData(data), 1)
  const [chartData, setChartData] = useState([])
  useEffect(() => {
    let animation = setTimeout(() => setChartData(data), 1)

    return () => {
      clearTimeout(animation)
    }
  }, [data])

  const chartProps = useMemo(() => ({
    // NOTE: These dimensions are linked to accuracy of the custom axes rendered in
    // <GridChart />
    margin: chartMargins,
    padding: 0.3,
    borderColor: { from: 'color', modifiers: [ [ 'darker', 1.6 ] ] },
    colors: colorFunc,
    axisTop: null,
    axisRight: {
      enable: true,
      tickSize: 5,
      tickPadding: 5,
      tickValues: 2
    },
    axisBottom: null,
    axisLeft: null,
    enableGridX: true,
    enableGridY: true,
    labelSkipWidth: 100,
    labelSkipHeight: 100,
    labelTextColor: { from: 'color', modifiers: [ [ 'darker', 1.6 ] ] },
    // We send the `showTooltip` boolean into the barComponent to control visibility of tooltip
    motionConfig: {
      duration: 1
    },
    animate: false,
    isInteractive: true,
    layers: barLayers,
  }), [])

  return (
    <Flex alignItems='center' sx={{ position: 'relative' }}>
      <Box width={2/16}>
        {label}
      </Box>
      <Box sx={{ height: height, width: '100%' }}>
        <Bar
          data={chartData}
          keys={keys}
          indexBy={indexBy}
          xScale={{ type: 'time' }}
          tooltip={CustomToolTip}
          onClick={handleClick}
          barComponent={CustomBarItem}
          theme={barThemeForTooltip}
          // HACK: To show the tooltip, we hijack the 
          // `enableLabel` prop to pass in the tooltip coordinates (row, col_index) from `GridChart`
          // `showTooltip` contains `[rowHasTooltip, columnwithTooltip]` e.g `[true, '2022-02-01']`
          enableLabel={tooltipIndex[0] === rowIndex ? tooltipIndex[1] : false}
          {...chartProps}
        />
      </Box>
    </Flex>
  )
}

RowChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    anomaly_count: PropTypes.number,
    confirmed_count: PropTypes.number,
    failure_count: PropTypes.number,
    input: PropTypes.string,
    measurement_count: PropTypes.number,
    measurement_start_day: PropTypes.string,
    ok_count: PropTypes.number,
  })),
  height: PropTypes.number,
  indexBy: PropTypes.string,
  label: PropTypes.node,
  rowIndex: PropTypes.number,
}

RowChart.displayName = 'RowChart'

export default React.memo(RowChart)
