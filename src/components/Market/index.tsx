import React, { useState, useEffect } from 'react'
import loadConditionalTokensRepo from 'src/logic/ConditionalTokens'
import loadMarketMakersRepo from 'src/logic/MarketMakers'
import { getConditionId, getPositionId } from 'src/utils/markets'
import BigNumber from 'bignumber.js'
import Layout from './Layout'

BigNumber.config({ EXPONENTIAL_AT: 50 })

const markets = require('src/conf/config.local.json')

type MarketProps = {
  web3: any
  account: string
}

enum MarketStage {
  Running = 0,
  Paused = 1,
  Closed = 2,
}

let conditionalTokensRepo: any
let marketMakersRepo: any

const Market: React.FC<MarketProps> = ({ web3, account }) => {
  const [isConditionLoaded, setIsConditionLoaded] = useState<boolean>(false)
  const [selectedAmount, setSelectedAmount] = useState<string>('')
  const [selectedOutcomeToken, setSelectedOutcomeToken] = useState<number>(0)
  const [marketInfo, setMarketInfo] = useState<any>(undefined)

  useEffect(() => {
    const init = async () => {
      try {
        conditionalTokensRepo = await loadConditionalTokensRepo(web3, markets.lmsrAddress, account)
        marketMakersRepo = await loadMarketMakersRepo(web3, markets.lmsrAddress, account)
        await getMarketInfo()
        setIsConditionLoaded(true)
      } catch (err) {
        setIsConditionLoaded(false)
        console.error(err)
      }
    }

    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  const getMarketInfo = async () => {
    if (!process.env.REACT_APP_ORACLE_ADDRESS) return
    const collateral = await marketMakersRepo.getCollateralToken()
    const conditionId = getConditionId(
      process.env.REACT_APP_ORACLE_ADDRESS,
      markets.markets[0].questionId,
      markets.markets[0].outcomes.length,
    )
    const payoutDenominator = await conditionalTokensRepo.payoutDenominator(conditionId)

    // Get Funding info
    const volume = await marketMakersRepo.volume();
    const funding = await marketMakersRepo.funding();
    const fee = await marketMakersRepo.fee();
    const liquidity = await collateral.contract.balanceOf(conditionalTokensRepo.conditionalTokens.address);

    const outcomes = []
    for (let outcomeIndex = 0; outcomeIndex < markets.markets[0].outcomes.length; outcomeIndex++) {
      const indexSet = (outcomeIndex === 0
        ? 1
        : parseInt(Math.pow(10, outcomeIndex).toString(), 2)
      ).toString()
      const collectionId = await conditionalTokensRepo.getCollectionId(
        `0x${'0'.repeat(64)}`,
        conditionId,
        indexSet,
      )
      const positionId = getPositionId(collateral.address, collectionId)
      const probability = await marketMakersRepo.calcMarginalPrice(outcomeIndex)

      const balance = await conditionalTokensRepo.balanceOf(account, positionId)
      const payoutNumerator = await conditionalTokensRepo.payoutNumerators(
        conditionId,
        outcomeIndex,
      )

      const outcome = {
        index: outcomeIndex,
        title: markets.markets[0].outcomes[outcomeIndex].title,
        probability: new BigNumber(probability)
          .dividedBy(Math.pow(2, 64))
          .multipliedBy(100)
          .toFixed(2),
        balance: new BigNumber(balance).dividedBy(Math.pow(10, collateral.decimals)),
        payoutNumerator: payoutNumerator,
      }
      outcomes.push(outcome)
    }

    const marketData = {
      lmsrAddress: markets.lmsrAddress,
      title: markets.markets[0].title,
      deployer: process.env.REACT_APP_OPERATOR_ADDRESS,
      resolver: process.env.REACT_APP_ORACLE_ADDRESS,
      volume: (new BigNumber(volume).dividedBy(Math.pow(10, collateral.decimals))).toFixed(2),
      outcomes,
      stage: MarketStage[await marketMakersRepo.stage()],
      questionId: markets.markets[0].questionId,
      conditionId: conditionId,
      payoutDenominator: payoutDenominator.toString(),
      funding: (new BigNumber(funding).dividedBy(Math.pow(10, collateral.decimals))).toFixed(2),
      fee: (new BigNumber(fee)).toString(),
      liquidity: (new BigNumber(liquidity).dividedBy(Math.pow(10, collateral.decimals))).toFixed(2),
      collateral: {
        name: collateral.name,
        symbol: collateral.symbol,
      },
    }

    setMarketInfo(marketData)
  }

  const buy = async () => {
    const collateral = await marketMakersRepo.getCollateralToken()
    const formatedAmount = new BigNumber(selectedAmount).multipliedBy(
      new BigNumber(Math.pow(10, collateral.decimals)),
    )

    const outcomeTokenAmounts = Array.from(
      { length: marketInfo.outcomes.length },
      (value: any, index: number) =>
        index === selectedOutcomeToken ? formatedAmount : new BigNumber(0),
    ).map(value => value.toString())

    const cost = await marketMakersRepo.calcNetCost(outcomeTokenAmounts)

    const collateralAllowance = await collateral.contract.allowance(account, marketInfo.lmsrAddress);
    if (cost.gt(collateralAllowance)) {
      const collateralBalance = await collateral.contract.balanceOf(account)

      await collateral.contract.approve(marketInfo.lmsrAddress, collateralBalance.toString(), {
        from: account,
      })
    }

    const tx = await marketMakersRepo.trade(outcomeTokenAmounts, cost, account)
    console.log({ tx })

    await getMarketInfo()
  }

  const sell = async () => {
    const collateral = await marketMakersRepo.getCollateralToken()
    const formatedAmount = new BigNumber(selectedAmount).multipliedBy(
      new BigNumber(Math.pow(10, collateral.decimals)),
    )

    const isApproved = await conditionalTokensRepo.isApprovedForAll(account, marketInfo.lmsrAddress)
    if (!isApproved) {
      await conditionalTokensRepo.setApprovalForAll(marketInfo.lmsrAddress, true, account)
    }

    const outcomeTokenAmounts = Array.from({ length: marketInfo.outcomes.length }, (v, i) =>
      i === selectedOutcomeToken ? formatedAmount : new BigNumber(0),
    ).map(value => value.toString())
    const profit = (await marketMakersRepo.calcNetCost(outcomeTokenAmounts)).neg()

    const tx = await marketMakersRepo.trade(outcomeTokenAmounts, profit, account)
    console.log({ tx })

    await getMarketInfo()
  }

  const redeem = async () => {
    const collateral = await marketMakersRepo.getCollateralToken()

    const indexSets = Array.from({ length: marketInfo.outcomes.length }, (v, i) =>
      i === 0 ? 1 : parseInt(Math.pow(10, i).toString(), 2),
    )

    const tx = await conditionalTokensRepo.redeemPositions(
      collateral.address,
      `0x${'0'.repeat(64)}`,
      marketInfo.conditionId,
      indexSets,
      account,
    )
    console.log({ tx })

    await getMarketInfo()
  }

  const close = async () => {
    const tx = await marketMakersRepo.close(account)
    console.log({ tx })

    await getMarketInfo()
  }

  const resolve = async (resolutionOutcomeIndex: number) => {
    const payouts = Array.from(
      { length: marketInfo.outcomes.length },
      (value: any, index: number) => (index === resolutionOutcomeIndex ? 1 : 0),
    )

    const tx = await conditionalTokensRepo.reportPayouts(marketInfo.questionId, payouts, account)
    console.log({ tx })

    await getMarketInfo()
  }

  const isMarketClosed =
    isConditionLoaded && MarketStage[marketInfo.stage].toString() === MarketStage.Closed.toString()
  return (
    <Layout
      account={account}
      isConditionLoaded={isConditionLoaded}
      isMarketClosed={isMarketClosed}
      marketInfo={marketInfo}
      setSelectedAmount={setSelectedAmount}
      selectedAmount={selectedAmount}
      setSelectedOutcomeToken={setSelectedOutcomeToken}
      selectedOutcomeToken={selectedOutcomeToken}
      buy={buy}
      sell={sell}
      redeem={redeem}
      close={close}
      resolve={resolve}
    />
  )
}

export default Market
