import { TimePeriod, toHistoryDuration } from 'appGraphql/data/util'
import { refitChartContentAtom } from 'components/Charts/ChartModel'
import { ChartSkeleton } from 'components/Charts/LoadingState'
import { PriceChart, PriceChartData } from 'components/Charts/PriceChart'
import { LineChart, StackedLineData } from 'components/Charts/StackedLineChart'
import { VolumeChart } from 'components/Charts/VolumeChart'
import { SingleHistogramData } from 'components/Charts/VolumeChart/renderer'
import { ChartType, PriceChartType } from 'components/Charts/utils'
import { AdvancedPriceChartToggle } from 'components/Tokens/TokenDetails/ChartSection/AdvancedPriceChartToggle'
import { ChartTypeDropdown } from 'components/Tokens/TokenDetails/ChartSection/ChartTypeSelector'
import {
  useTDPPriceChartData,
  useTDPTVLChartData,
  useTDPVolumeChartData,
} from 'components/Tokens/TokenDetails/ChartSection/hooks'
import { ChartQueryResult, DataQuality } from 'components/Tokens/TokenDetails/ChartSection/util'
import {
  DISPLAYS,
  ORDERED_TIMES,
  TimePeriodDisplay,
  getTimePeriodFromDisplay,
} from 'components/Tokens/TokenTable/VolumeTimeFrameSelector'
import { useAtomValue } from 'jotai/utils'
import { useTDPContext } from 'pages/TokenDetails/TDPContext'
import { useMemo, useState } from 'react'
import { Trans } from 'react-i18next'
import { ThemeProvider } from 'theme'
import { Flex, SegmentedControl, SegmentedControlOption, styled, useMedia } from 'ui/src'
import { Chain } from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'

export const TDP_CHART_HEIGHT_PX = 356
const TDP_CHART_SELECTOR_OPTIONS = [ChartType.PRICE, ChartType.VOLUME, ChartType.TVL] as const
type TokenDetailsChartType = (typeof TDP_CHART_SELECTOR_OPTIONS)[number]

export const DEFAULT_PILL_TIME_SELECTOR_OPTIONS = ORDERED_TIMES.map((time: TimePeriod) => ({
  value: DISPLAYS[time],
})) as SegmentedControlOption[]

export const ChartActionsContainer = styled(Flex, {
  flexDirection: 'row-reverse',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
  mt: 12,
  $md: {
    flexDirection: 'column',
    gap: 16,
  },
})

/** Represents a variety of query result shapes, discriminated via additional `chartType` field. */
type ActiveQuery =
  | ChartQueryResult<PriceChartData, ChartType.PRICE>
  | ChartQueryResult<SingleHistogramData, ChartType.VOLUME>
  | ChartQueryResult<StackedLineData, ChartType.TVL>

export type TDPChartState = {
  /** Time controls for TDP Charts */
  timePeriod: TimePeriod
  setTimePeriod: (timePeriod: TimePeriod) => void
  /** Selectors for TDP Charts */
  setChartType: (chartType: TokenDetailsChartType) => void
  priceChartType: PriceChartType
  setPriceChartType: (priceChartType: PriceChartType) => void
  activeQuery: ActiveQuery
  /** Special-case: flag to disable candlestick toggle on tokens with invalid OHLC data  */
  disableCandlestickUI: boolean
}

const InvalidChartMessage = () => <Trans i18nKey="chart.error.tokens" />

/** Exported to `TDPContext` to fire queries on pageload. `TDPChartState` should be accessed through `useTDPContext` rather than this hook. */
export function useCreateTDPChartState(tokenDBAddress: string | undefined, currencyChainName: Chain): TDPChartState {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.DAY)

  const [chartType, setChartType] = useState<TokenDetailsChartType>(ChartType.PRICE)
  const [priceChartType, setPriceChartType] = useState<PriceChartType>(PriceChartType.LINE)

  const variables = { address: tokenDBAddress, chain: currencyChainName, duration: toHistoryDuration(timePeriod) }

  const priceQuery = useTDPPriceChartData({ variables, skip: chartType !== ChartType.PRICE, priceChartType })
  const volumeQuery = useTDPVolumeChartData(variables, chartType !== ChartType.VOLUME)
  const tvlQuery = useTDPTVLChartData(variables, chartType !== ChartType.TVL)

  return useMemo(() => {
    const { disableCandlestickUI } = priceQuery
    // eslint-disable-next-line consistent-return
    const activeQuery = (() => {
      switch (chartType) {
        case ChartType.PRICE:
          return priceQuery
        case ChartType.VOLUME:
          return volumeQuery
        case ChartType.TVL:
          return tvlQuery
      }
    })()

    return {
      timePeriod,
      setTimePeriod,
      setChartType,
      priceChartType: disableCandlestickUI ? PriceChartType.LINE : priceChartType,
      setPriceChartType,
      activeQuery,
      disableCandlestickUI,
    }
  }, [chartType, priceQuery, volumeQuery, tvlQuery, timePeriod, priceChartType])
}

export default function ChartSection() {
  const { activeQuery, timePeriod, priceChartType } = useTDPContext().chartState
  const { tokenColor } = useTDPContext()

  // eslint-disable-next-line consistent-return
  const getSection = () => {
    if (activeQuery.dataQuality === DataQuality.INVALID) {
      return (
        <ChartSkeleton
          type={activeQuery.chartType}
          height={TDP_CHART_HEIGHT_PX}
          errorText={activeQuery.loading ? undefined : <InvalidChartMessage />}
        />
      )
    }

    const stale = activeQuery.dataQuality === DataQuality.STALE
    switch (activeQuery.chartType) {
      case ChartType.PRICE:
        return (
          <PriceChart data={activeQuery.entries} height={TDP_CHART_HEIGHT_PX} type={priceChartType} stale={stale} />
        )
      case ChartType.VOLUME:
        return (
          <VolumeChart data={activeQuery.entries} height={TDP_CHART_HEIGHT_PX} timePeriod={timePeriod} stale={stale} />
        )
      case ChartType.TVL:
        return <LineChart data={activeQuery.entries} height={TDP_CHART_HEIGHT_PX} stale={stale} />
    }
  }

  return (
    <ThemeProvider accent1={tokenColor}>
      <Flex
        data-cy={`tdp-${activeQuery.chartType}-chart-container`}
        testID={`tdp-${activeQuery.chartType}-chart-container`}
      >
        {getSection()}
        <ChartControls />
      </Flex>
    </ThemeProvider>
  )
}

function ChartControls() {
  const {
    activeQuery,
    timePeriod,
    setTimePeriod,
    setChartType,
    priceChartType,
    setPriceChartType,
    disableCandlestickUI,
  } = useTDPContext().chartState
  const refitChartContent = useAtomValue(refitChartContentAtom)
  const media = useMedia()
  const isMediumScreen = media.lg
  const showAdvancedPriceChartToggle = activeQuery.chartType === ChartType.PRICE

  return (
    <ChartActionsContainer>
      <Flex
        row
        gap="$gap8"
        $md={{
          width: '100%',
          '$platform-web': {
            display: 'grid',
            gridTemplateColumns: showAdvancedPriceChartToggle ? '1fr 1fr' : '1fr',
          },
        }}
      >
        {showAdvancedPriceChartToggle && (
          <AdvancedPriceChartToggle
            currentChartType={priceChartType}
            onChartTypeChange={setPriceChartType}
            disableCandlestickUI={disableCandlestickUI}
          />
        )}
        <ChartTypeDropdown
          options={TDP_CHART_SELECTOR_OPTIONS}
          currentChartType={activeQuery.chartType}
          onSelectOption={(c) => {
            setChartType(c)
            if (c === ChartType.PRICE) {
              setPriceChartType(PriceChartType.LINE)
            }
          }}
        />
      </Flex>
      <Flex $md={{ width: '100%' }}>
        <SegmentedControl
          fullWidth={isMediumScreen}
          options={DEFAULT_PILL_TIME_SELECTOR_OPTIONS}
          selectedOption={DISPLAYS[timePeriod]}
          onSelectOption={(option) => {
            const time = getTimePeriodFromDisplay(option as TimePeriodDisplay)
            if (time === timePeriod) {
              refitChartContent?.()
            } else {
              setTimePeriod(time)
            }
          }}
        />
      </Flex>
    </ChartActionsContainer>
  )
}
