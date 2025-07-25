/* eslint-disable max-lines */
import {
  Direction,
  FiatOnRampTransaction,
  OnChainTransaction,
  OnChainTransactionLabel,
  OnChainTransactionStatus,
  SpamCode as RestSpamCode,
  TokenType,
} from '@uniswap/client-data-api/dist/data/v1/types_pb'
import { getNativeAddress, getWrappedNativeAddress } from 'uniswap/src/constants/addresses'
import { DAI } from 'uniswap/src/constants/tokens'
import { UniverseChainId } from 'uniswap/src/features/chains/types'
import { TransactionType } from 'uniswap/src/features/transactions/types/transactionDetails'
import { SAMPLE_SEED_ADDRESS_1, SAMPLE_SEED_ADDRESS_2 } from 'uniswap/src/test/fixtures'
import extractRestOnChainTransactionDetails from 'wallet/src/features/transactions/history/conversion/extractOnChainTransactionDetails'
import { parseRestApproveTransaction } from 'wallet/src/features/transactions/history/conversion/parseApproveTransaction'
import { parseRestLiquidityTransaction } from 'wallet/src/features/transactions/history/conversion/parseLiquidityTransaction'
import { parseRestNFTMintTransaction } from 'wallet/src/features/transactions/history/conversion/parseMintTransaction'
import { parseRestReceiveTransaction } from 'wallet/src/features/transactions/history/conversion/parseReceiveTransaction'
import { parseRestSendTransaction } from 'wallet/src/features/transactions/history/conversion/parseSendTransaction'
import {
  parseRestSwapTransaction,
  parseRestWrapTransaction,
} from 'wallet/src/features/transactions/history/conversion/parseTradeTransaction'

/**
 * Testing for REST API transaction parsing utils.
 */

const FROM_ADDRESS = SAMPLE_SEED_ADDRESS_1
const TO_ADDRESS = SAMPLE_SEED_ADDRESS_2
const TEST_HASH = '0x00'
const ERC20_ASSET_ADDRESS = DAI.address
const WRAPPED_NATIVE_ADDRESS = getWrappedNativeAddress(UniverseChainId.Mainnet)
const NATIVE_ADDRESS = getNativeAddress(UniverseChainId.Mainnet)

const TRANSACTION_BASE: OnChainTransaction = {
  chainId: UniverseChainId.Mainnet,
  transactionHash: TEST_HASH,
  timestampMillis: BigInt(1000),
  from: FROM_ADDRESS,
  to: TO_ADDRESS,
  label: OnChainTransactionLabel.UNKNOWN,
  status: OnChainTransactionStatus.CONFIRMED,
  transfers: [],
  approvals: [],
} as unknown as OnChainTransaction

/** Asset change response mocks */

const ERC20_TOKEN_MOCK = {
  address: ERC20_ASSET_ADDRESS,
  symbol: 'asset_symbol',
  decimals: 18,
  type: TokenType.ERC20,
  chainId: UniverseChainId.Mainnet,
  metadata: {
    spamCode: RestSpamCode.NOT_SPAM,
  },
}

const NATIVE_TOKEN_MOCK = {
  address: NATIVE_ADDRESS,
  symbol: 'ETH',
  decimals: 18,
  type: TokenType.NATIVE,
  metadata: {
    spamCode: RestSpamCode.NOT_SPAM,
  },
}

const WRAPPED_TOKEN_MOCK = {
  address: WRAPPED_NATIVE_ADDRESS,
  symbol: 'WETH',
  decimals: 18,
  type: TokenType.ERC20,
  metadata: {
    spamCode: RestSpamCode.NOT_SPAM,
  },
}

const SPAM_TOKEN_MOCK = {
  address: ERC20_ASSET_ADDRESS,
  symbol: 'SPAM',
  decimals: 18,
  type: TokenType.ERC20,
  metadata: {
    spamCode: RestSpamCode.SPAM,
  },
}

const NFT_MOCK = {
  tokenId: 'token_id',
  address: 'nft_contract_address',
  name: 'asset_name',
  collectionName: 'collection_name',
  imageUrl: 'image_url',
  isSpam: false,
  chainId: UniverseChainId.Mainnet,
  type: TokenType.ERC721,
}

/** ERC20 Approve */

const MOCK_ERC20_APPROVE: OnChainTransaction = {
  ...TRANSACTION_BASE,
  label: OnChainTransactionLabel.APPROVE,
  approvals: [
    {
      asset: {
        case: 'token',
        value: ERC20_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '1000000000000000000',
      },
    },
  ],
  protocol: {
    name: 'Uniswap',
    logoUrl: 'https://logo.url',
  },
} as OnChainTransaction

describe(parseRestApproveTransaction, () => {
  it('ERC20 approve: handle empty approvals', () => {
    expect(parseRestApproveTransaction(TRANSACTION_BASE)).toBeUndefined()
  })
  it('ERC20 approve: parse valid approval', () => {
    expect(parseRestApproveTransaction(MOCK_ERC20_APPROVE)).toEqual({
      type: TransactionType.Approve,
      tokenAddress: ERC20_ASSET_ADDRESS,
      spender: TO_ADDRESS,
      approvalAmount: '1',
      dappInfo: {
        name: 'Uniswap',
        icon: 'https://logo.url',
      },
    })
  })
})

/** ERC721 Mint  */

const MOCK_721_MINT: OnChainTransaction = {
  ...TRANSACTION_BASE,
  label: OnChainTransactionLabel.MINT,
  transfers: [
    {
      direction: Direction.RECEIVE,
      asset: {
        case: 'nft',
        value: NFT_MOCK,
      },
      amount: {
        amount: 1,
        raw: '1',
      },
      to: TO_ADDRESS,
    },
  ],
  fee: {
    amount: {
      amount: 1,
      raw: '1000000000000000000',
    },
    symbol: 'ETH',
    address: NATIVE_ADDRESS,
  },
} as OnChainTransaction

describe(parseRestNFTMintTransaction, () => {
  it('NFT Mint: handle empty transfers', () => {
    expect(parseRestNFTMintTransaction(TRANSACTION_BASE)).toBeUndefined()
  })
  it('NFT Mint: parse 721 mint', () => {
    expect(parseRestNFTMintTransaction(MOCK_721_MINT)).toEqual({
      type: TransactionType.NFTMint,
      nftSummaryInfo: {
        name: 'asset_name',
        collectionName: 'collection_name',
        imageURL: 'image_url',
        tokenId: 'token_id',
        address: 'nft_contract_address',
      },
      purchaseCurrencyId: `1-nft_contract_address`,
      purchaseCurrencyAmountRaw: '1000000000000000000',
      transactedUSDValue: undefined,
      isSpam: false,
      dappInfo: {
        icon: undefined,
        name: undefined,
      },
    })
  })
})

/** Receive */

const MOCK_ERC20_RECEIVE: OnChainTransaction = {
  ...TRANSACTION_BASE,
  label: OnChainTransactionLabel.RECEIVE,
  transfers: [
    {
      direction: Direction.RECEIVE,
      asset: {
        case: 'token',
        value: ERC20_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '1000000000000000000',
      },
      to: TO_ADDRESS,
      from: FROM_ADDRESS,
    },
  ],
} as OnChainTransaction

const MOCK_ERC20_RECEIVE_SPAM: OnChainTransaction = {
  ...TRANSACTION_BASE,
  label: OnChainTransactionLabel.RECEIVE,
  transfers: [
    {
      direction: Direction.RECEIVE,
      asset: {
        case: 'token',
        value: SPAM_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '1000000000000000000',
      },
      to: TO_ADDRESS,
      from: FROM_ADDRESS,
    },
  ],
} as OnChainTransaction

const MOCK_ERC721_RECEIVE: OnChainTransaction = {
  ...TRANSACTION_BASE,
  label: OnChainTransactionLabel.RECEIVE,
  transfers: [
    {
      direction: Direction.RECEIVE,
      asset: {
        case: 'nft',
        value: NFT_MOCK,
      },
      amount: {
        amount: 1,
        raw: '1',
      },
      to: TO_ADDRESS,
      from: FROM_ADDRESS,
    },
  ],
} as OnChainTransaction

describe(parseRestReceiveTransaction, () => {
  it('Receive : handle empty transfers', () => {
    expect(parseRestReceiveTransaction(TRANSACTION_BASE)).toBeUndefined()
  })
  it('Receive: parse ERC20 receive', () => {
    expect(parseRestReceiveTransaction(MOCK_ERC20_RECEIVE)).toEqual({
      type: TransactionType.Receive,
      assetType: 'currency',
      tokenAddress: ERC20_ASSET_ADDRESS,
      currencyAmountRaw: '1000000000000000000',
      sender: FROM_ADDRESS,
      transactedUSDValue: undefined,
      isSpam: false,
    })
  })
  it('Receive: parse spam ERC20 receive', () => {
    expect(parseRestReceiveTransaction(MOCK_ERC20_RECEIVE_SPAM)).toEqual({
      type: TransactionType.Receive,
      assetType: 'currency',
      tokenAddress: ERC20_ASSET_ADDRESS,
      currencyAmountRaw: '1000000000000000000',
      sender: FROM_ADDRESS,
      transactedUSDValue: undefined,
      isSpam: true,
    })
  })
  it('Receive: parse ERC721 receive', () => {
    expect(parseRestReceiveTransaction(MOCK_ERC721_RECEIVE)).toEqual({
      type: TransactionType.Receive,
      assetType: 'erc-721',
      tokenAddress: 'nft_contract_address',
      sender: FROM_ADDRESS,
      isSpam: false,
      nftSummaryInfo: {
        name: 'asset_name',
        collectionName: 'collection_name',
        imageURL: 'image_url',
        tokenId: 'token_id',
        address: 'nft_contract_address',
      },
    })
  })
})

/** Send */

const MOCK_ERC20_SEND: OnChainTransaction = {
  ...TRANSACTION_BASE,
  label: OnChainTransactionLabel.SEND,
  transfers: [
    {
      direction: Direction.SEND,
      asset: {
        case: 'token',
        value: ERC20_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '1000000000000000000',
      },
      to: TO_ADDRESS,
    },
  ],
} as OnChainTransaction

const MOCK_ERC721_SEND: OnChainTransaction = {
  ...TRANSACTION_BASE,
  label: OnChainTransactionLabel.SEND,
  transfers: [
    {
      direction: Direction.SEND,
      asset: {
        case: 'nft',
        value: NFT_MOCK,
      },
      amount: {
        amount: 1,
        raw: '1',
      },
      to: TO_ADDRESS,
    },
  ],
} as OnChainTransaction

describe(parseRestSendTransaction, () => {
  it('Send : handle empty transfers', () => {
    expect(parseRestSendTransaction(TRANSACTION_BASE)).toBeUndefined()
  })
  it('Send: parse ERC20 send', () => {
    expect(parseRestSendTransaction(MOCK_ERC20_SEND)).toEqual({
      type: TransactionType.Send,
      assetType: 'currency',
      tokenAddress: ERC20_ASSET_ADDRESS,
      recipient: TO_ADDRESS,
      currencyAmountRaw: '1000000000000000000',
      transactedUSDValue: undefined,
      isSpam: false,
    })
  })
  it('Send: parse ERC721 send', () => {
    expect(parseRestSendTransaction(MOCK_ERC721_SEND)).toEqual({
      type: TransactionType.Send,
      assetType: 'erc-721',
      tokenAddress: 'nft_contract_address',
      recipient: TO_ADDRESS,
      currencyAmountRaw: '1',
      transactedUSDValue: undefined,
      isSpam: false,
    })
  })
})

/** Swaps */

const MOCK_ERC20_SWAP: OnChainTransaction = {
  ...TRANSACTION_BASE,
  label: OnChainTransactionLabel.SWAP,
  transfers: [
    {
      direction: Direction.SEND,
      asset: {
        case: 'token',
        value: ERC20_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '1000000000000000000',
      },
      to: TO_ADDRESS,
    },
    {
      direction: Direction.RECEIVE,
      asset: {
        case: 'token',
        value: { ...ERC20_TOKEN_MOCK, address: WRAPPED_NATIVE_ADDRESS, symbol: 'WETH' },
      },
      amount: {
        amount: 1,
        raw: '1000000000000000000',
      },
      to: FROM_ADDRESS,
    },
  ],
} as OnChainTransaction

const MOCK_NATIVE_SWAP: OnChainTransaction = {
  ...TRANSACTION_BASE,
  label: OnChainTransactionLabel.SWAP,
  transfers: [
    {
      direction: Direction.SEND,
      asset: {
        case: 'token',
        value: NATIVE_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '1000000000000000000',
      },
      to: TO_ADDRESS,
    },
    {
      direction: Direction.RECEIVE,
      asset: {
        case: 'token',
        value: ERC20_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '1000000000000000000',
      },
      to: FROM_ADDRESS,
    },
  ],
} as OnChainTransaction

const MOCK_NATIVE_WRAP: OnChainTransaction = {
  ...TRANSACTION_BASE,
  label: OnChainTransactionLabel.WRAP,
  transfers: [
    {
      direction: Direction.SEND,
      asset: {
        case: 'token',
        value: NATIVE_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '1000000000000000000',
      },
      to: TO_ADDRESS,
    },
    {
      direction: Direction.RECEIVE,
      asset: {
        case: 'token',
        value: WRAPPED_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '1000000000000000000',
      },
      to: FROM_ADDRESS,
    },
  ],
} as OnChainTransaction

describe(parseRestSwapTransaction, () => {
  it('Swap : handle empty transfers', () => {
    expect(parseRestSwapTransaction(TRANSACTION_BASE)).toBeUndefined()
  })
  it('Swap: parse token swap', () => {
    expect(parseRestSwapTransaction(MOCK_ERC20_SWAP)).toEqual({
      type: TransactionType.Swap,
      inputCurrencyId: `1-${ERC20_ASSET_ADDRESS}`,
      outputCurrencyId: `1-${WRAPPED_NATIVE_ADDRESS}`,
      transactedUSDValue: undefined,
      inputCurrencyAmountRaw: '1000000000000000000',
      outputCurrencyAmountRaw: '1000000000000000000',
    })
  })
  it('Swap: parse native swap', () => {
    expect(parseRestSwapTransaction(MOCK_NATIVE_SWAP)).toEqual({
      type: TransactionType.Swap,
      inputCurrencyId: `1-${NATIVE_ADDRESS}`,
      outputCurrencyId: `1-${ERC20_ASSET_ADDRESS}`,
      transactedUSDValue: undefined,
      inputCurrencyAmountRaw: '1000000000000000000',
      outputCurrencyAmountRaw: '1000000000000000000',
    })
  })
})

describe(parseRestWrapTransaction, () => {
  it('Wrap: parse wrap', () => {
    expect(parseRestWrapTransaction(MOCK_NATIVE_WRAP)).toEqual({
      type: TransactionType.Wrap,
      unwrapped: false,
      currencyAmountRaw: '1000000000000000000',
    })
  })
})

/** Bridge Transactions */

const ARBITRUM_CHAIN_ID = 42161

const ARBITRUM_TOKEN_MOCK = {
  address: ERC20_ASSET_ADDRESS,
  symbol: 'DAI',
  decimals: 18,
  type: TokenType.ERC20,
  chainId: ARBITRUM_CHAIN_ID,
}

const MOCK_BRIDGE: OnChainTransaction = {
  ...TRANSACTION_BASE,
  label: OnChainTransactionLabel.BRIDGE,
  transfers: [
    {
      direction: Direction.SEND,
      asset: {
        case: 'token',
        value: ERC20_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '1000000000000000000',
      },
      to: TO_ADDRESS,
    },
    {
      direction: Direction.RECEIVE,
      asset: {
        case: 'token',
        value: ARBITRUM_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '950000000000000000',
      },
      from: FROM_ADDRESS,
    },
  ],
} as unknown as OnChainTransaction

// Import the parseRestBridgeTransaction function
import { parseRestBridgeTransaction } from 'wallet/src/features/transactions/history/conversion/parseBridgingTransaction'

describe(parseRestBridgeTransaction, () => {
  it('Bridge: handle empty transfers', () => {
    expect(parseRestBridgeTransaction(TRANSACTION_BASE)).toBeUndefined()
  })
  it('Bridge: parse cross-chain bridge', () => {
    expect(parseRestBridgeTransaction(MOCK_BRIDGE)).toEqual({
      type: TransactionType.Bridge,
      inputCurrencyId: `1-${ERC20_ASSET_ADDRESS}`,
      outputCurrencyId: `${ARBITRUM_CHAIN_ID}-${ERC20_ASSET_ADDRESS}`,
      inputCurrencyAmountRaw: '1000000000000000000',
      outputCurrencyAmountRaw: '950000000000000000',
      transactedUSDValue: undefined,
      routingDappInfo: {
        address: '0x0000000000000000000000000000000000000000',
        icon: 'https://protocol-icons.s3.amazonaws.com/icons/across.jpg',
        name: 'Across API',
      },
    })
  })
})

/** On-ramp Transactions */

const MOCK_ONRAMP_PURCHASE = {
  externalSessionId: 'session_123',
  transactionReferenceId: 'ref_456',
  token: {
    address: ERC20_ASSET_ADDRESS,
    symbol: 'DAI',
    chainId: UniverseChainId.Mainnet,
  },
  tokenAmount: {
    amount: 100,
  },
  fiatCurrency: 'USD',
  fiatAmount: 100,
  serviceProvider: {
    serviceProvider: 'COINBASEPAY',
    name: 'Coinbase',
    url: 'https://www.coinbase.com/',
    logoLightUrl: 'https://logo.io/COINBASEPAY/short_logo_light.png',
    logoDarkUrl: 'https://logo.io/COINBASEPAY/short_logo_dark.png',
    supportUrl: 'https://help.coinbase.com/',
  },
  totalFee: 5,
} as unknown as FiatOnRampTransaction

const MOCK_ONRAMP_TRANSFER = {
  externalSessionId: 'session_789',
  transactionReferenceId: 'ref_101',
  token: {
    address: ERC20_ASSET_ADDRESS,
    symbol: 'DAI',
    chainId: UniverseChainId.Mainnet,
  },
  tokenAmount: {
    amount: 50,
  },
  fiatCurrency: 'DAI', // Same as token symbol = transfer
  fiatAmount: 50,
  serviceProvider: {
    serviceProvider: 'MOONPAY',
    name: 'MoonPay',
    url: 'https://www.moonpay.com/',
    logoLightUrl: 'https://logo.io/MOONPAY/logo_light.png',
    logoDarkUrl: 'https://logo.io/MOONPAY/logo_dark.png',
    supportUrl: 'https://support.moonpay.com/',
  },
  totalFee: 2,
} as unknown as FiatOnRampTransaction

// Import the parseRestOnRampTransaction function
import { parseRestOnRampTransaction } from 'wallet/src/features/transactions/history/conversion/parseOnRampTransaction'

describe(parseRestOnRampTransaction, () => {
  it('OnRamp: handle empty transaction', () => {
    expect(parseRestOnRampTransaction({} as FiatOnRampTransaction)).toBeUndefined()
  })
  it('OnRamp: parse fiat purchase', () => {
    expect(parseRestOnRampTransaction(MOCK_ONRAMP_PURCHASE)).toEqual({
      type: TransactionType.OnRampPurchase,
      id: 'session_123',
      sourceAmount: 100,
      sourceCurrency: 'USD',
      destinationTokenAddress: ERC20_ASSET_ADDRESS,
      destinationTokenAmount: 100,
      destinationTokenSymbol: 'DAI',
      serviceProvider: {
        id: 'COINBASEPAY',
        name: 'Coinbase',
        url: 'https://www.coinbase.com/',
        logoLightUrl: 'https://logo.io/COINBASEPAY/short_logo_light.png',
        logoDarkUrl: 'https://logo.io/COINBASEPAY/short_logo_dark.png',
        supportUrl: 'https://help.coinbase.com/',
      },
      totalFee: 5,
      providerTransactionId: 'ref_456',
    })
  })
  it('OnRamp: parse crypto transfer', () => {
    expect(parseRestOnRampTransaction(MOCK_ONRAMP_TRANSFER)).toEqual({
      type: TransactionType.OnRampTransfer,
      id: 'session_789',
      sourceAmount: 50,
      sourceCurrency: 'DAI',
      destinationTokenAddress: ERC20_ASSET_ADDRESS,
      destinationTokenAmount: 50,
      destinationTokenSymbol: 'DAI',
      serviceProvider: {
        id: 'MOONPAY',
        name: 'MoonPay',
        url: 'https://www.moonpay.com/',
        logoLightUrl: 'https://logo.io/MOONPAY/logo_light.png',
        logoDarkUrl: 'https://logo.io/MOONPAY/logo_dark.png',
        supportUrl: 'https://support.moonpay.com/',
      },
      totalFee: 2,
      providerTransactionId: 'ref_101',
    })
  })
})

/** NFT Purchase and Sell */

// For now, REST parsers don't handle NFT trades

/** Liquidity Transactions */

const MOCK_LIQUIDITY_INCREASE: OnChainTransaction = {
  ...TRANSACTION_BASE,
  label: OnChainTransactionLabel.INCREASE_LIQUIDITY,
  transfers: [
    {
      direction: Direction.SEND,
      asset: {
        case: 'token',
        value: ERC20_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '1000000000000000000',
      },
      to: TO_ADDRESS,
    },
    {
      direction: Direction.SEND,
      asset: {
        case: 'token',
        value: WRAPPED_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '500000000000000000',
      },
      to: TO_ADDRESS,
    },
  ],
  protocol: {
    name: 'Uniswap V3',
    logoUrl: 'https://logo.url',
  },
} as OnChainTransaction

const MOCK_LIQUIDITY_DECREASE: OnChainTransaction = {
  ...TRANSACTION_BASE,
  label: OnChainTransactionLabel.DECREASE_LIQUIDITY,
  transfers: [
    {
      direction: Direction.RECEIVE,
      asset: {
        case: 'token',
        value: ERC20_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '800000000000000000',
      },
      from: TO_ADDRESS,
    },
    {
      direction: Direction.RECEIVE,
      asset: {
        case: 'token',
        value: WRAPPED_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '400000000000000000',
      },
      from: TO_ADDRESS,
    },
  ],
  protocol: {
    name: 'Uniswap V3',
    logoUrl: 'https://logo.url',
  },
} as OnChainTransaction

const MOCK_CREATE_POOL: OnChainTransaction = {
  ...TRANSACTION_BASE,
  label: OnChainTransactionLabel.CREATE_POOL,
  transfers: [
    {
      direction: Direction.SEND,
      asset: {
        case: 'token',
        value: ERC20_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '2000000000000000000',
      },
      to: TO_ADDRESS,
    },
    {
      direction: Direction.SEND,
      asset: {
        case: 'token',
        value: WRAPPED_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '1000000000000000000',
      },
      to: TO_ADDRESS,
    },
  ],
  protocol: {
    name: 'Uniswap V3',
    logoUrl: 'https://logo.url',
  },
} as OnChainTransaction

const MOCK_COLLECT_FEES: OnChainTransaction = {
  ...TRANSACTION_BASE,
  label: OnChainTransactionLabel.CLAIM,
  transfers: [
    {
      direction: Direction.RECEIVE,
      asset: {
        case: 'token',
        value: ERC20_TOKEN_MOCK,
      },
      amount: {
        amount: 1,
        raw: '100000000000000000',
      },
      from: TO_ADDRESS,
    },
  ],
  protocol: {
    name: 'Uniswap',
    logoUrl: 'https://logo.url',
  },
} as OnChainTransaction

describe(parseRestLiquidityTransaction, () => {
  it('Liquidity: handle empty transfers', () => {
    const result = parseRestLiquidityTransaction(TRANSACTION_BASE)
    expect(result.type).toEqual(TransactionType.Unknown)
  })

  it('Liquidity: parse liquidity increase', () => {
    expect(parseRestLiquidityTransaction(MOCK_LIQUIDITY_INCREASE)).toEqual({
      type: TransactionType.LiquidityIncrease,
      inputCurrencyId: `1-${ERC20_ASSET_ADDRESS}`,
      outputCurrencyId: `1-${WRAPPED_NATIVE_ADDRESS}`,
      inputCurrencyAmountRaw: '1000000000000000000',
      outputCurrencyAmountRaw: '500000000000000000',
      isSpam: false,
      dappInfo: {
        name: 'Uniswap V3',
        icon: 'https://logo.url',
      },
    })
  })

  it('Liquidity: parse liquidity decrease', () => {
    expect(parseRestLiquidityTransaction(MOCK_LIQUIDITY_DECREASE)).toEqual({
      type: TransactionType.LiquidityDecrease,
      inputCurrencyId: `1-${ERC20_ASSET_ADDRESS}`,
      outputCurrencyId: `1-${WRAPPED_NATIVE_ADDRESS}`,
      inputCurrencyAmountRaw: '800000000000000000',
      outputCurrencyAmountRaw: '400000000000000000',
      isSpam: false,
      dappInfo: {
        name: 'Uniswap V3',
        icon: 'https://logo.url',
      },
    })
  })

  it('Liquidity: parse create pool', () => {
    expect(parseRestLiquidityTransaction(MOCK_CREATE_POOL)).toEqual({
      type: TransactionType.CreatePool,
      inputCurrencyId: `1-${ERC20_ASSET_ADDRESS}`,
      outputCurrencyId: `1-${WRAPPED_NATIVE_ADDRESS}`,
      inputCurrencyAmountRaw: '2000000000000000000',
      outputCurrencyAmountRaw: '1000000000000000000',
      isSpam: false,
      dappInfo: {
        name: 'Uniswap V3',
        icon: 'https://logo.url',
      },
    })
  })

  it('Liquidity: parse collect fees', () => {
    expect(parseRestLiquidityTransaction(MOCK_COLLECT_FEES)).toEqual({
      type: TransactionType.CollectFees,
      inputCurrencyId: `1-${ERC20_ASSET_ADDRESS}`,
      outputCurrencyId: undefined,
      inputCurrencyAmountRaw: '100000000000000000',
      outputCurrencyAmountRaw: undefined,
      isSpam: false,
      dappInfo: {
        name: 'Uniswap',
        icon: 'https://logo.url',
      },
    })
  })
})

/**
 * Parent extraction util
 */

describe(extractRestOnChainTransactionDetails, () => {
  it('Empty transaction', () => {
    const result = extractRestOnChainTransactionDetails(TRANSACTION_BASE)
    expect(result?.typeInfo.type).toEqual(TransactionType.Unknown)
  })
  it('Approve', () => {
    const txn = extractRestOnChainTransactionDetails(MOCK_ERC20_APPROVE)
    expect(txn?.typeInfo.type).toEqual(TransactionType.Approve)
  })
  it('Send', () => {
    const txn = extractRestOnChainTransactionDetails(MOCK_ERC20_SEND)
    expect(txn?.typeInfo.type).toEqual(TransactionType.Send)
  })
  it('Receive', () => {
    const txn = extractRestOnChainTransactionDetails(MOCK_ERC20_RECEIVE)
    expect(txn?.typeInfo.type).toEqual(TransactionType.Receive)
  })
  it('Swap token', () => {
    const txn = extractRestOnChainTransactionDetails(MOCK_ERC20_SWAP)
    expect(txn?.typeInfo.type).toEqual(TransactionType.Swap)
  })
  it('Wrap', () => {
    const txn = extractRestOnChainTransactionDetails(MOCK_NATIVE_WRAP)
    expect(txn?.typeInfo.type).toEqual(TransactionType.Wrap)
  })
  it('Mint', () => {
    const txn = extractRestOnChainTransactionDetails(MOCK_721_MINT)
    expect(txn?.typeInfo.type).toEqual(TransactionType.NFTMint)
  })
  it('Liquidity Increase', () => {
    const txn = extractRestOnChainTransactionDetails(MOCK_LIQUIDITY_INCREASE)
    expect(txn?.typeInfo.type).toEqual(TransactionType.LiquidityIncrease)
  })
  it('Liquidity Decrease', () => {
    const txn = extractRestOnChainTransactionDetails(MOCK_LIQUIDITY_DECREASE)
    expect(txn?.typeInfo.type).toEqual(TransactionType.LiquidityDecrease)
  })
  it('Create Pool', () => {
    const txn = extractRestOnChainTransactionDetails(MOCK_CREATE_POOL)
    expect(txn?.typeInfo.type).toEqual(TransactionType.CreatePool)
  })
  it('Claim', () => {
    const txn = extractRestOnChainTransactionDetails(MOCK_COLLECT_FEES)
    expect(txn?.typeInfo.type).toEqual(TransactionType.CollectFees)
  })
  it('Bridge', () => {
    const txn = extractRestOnChainTransactionDetails(MOCK_BRIDGE)
    expect(txn?.typeInfo.type).toEqual(TransactionType.Bridge)
  })
  it('Unknown', () => {
    const txn = extractRestOnChainTransactionDetails({
      ...TRANSACTION_BASE,
      label: OnChainTransactionLabel.UNKNOWN,
    } as unknown as OnChainTransaction)
    expect(txn?.typeInfo.type).toEqual(TransactionType.Unknown)
  })
})
