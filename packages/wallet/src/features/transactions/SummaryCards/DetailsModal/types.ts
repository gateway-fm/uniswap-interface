import {
  BridgeTransactionInfo,
  CollectFeesTransactionInfo,
  ConfirmedSwapTransactionInfo,
  CreatePairTransactionInfo,
  CreatePoolTransactionInfo,
  ExactInputSwapTransactionInfo,
  ExactOutputSwapTransactionInfo,
  LiquidityDecreaseTransactionInfo,
  LiquidityIncreaseTransactionInfo,
  LocalOffRampTransactionInfo,
  LocalOnRampTransactionInfo,
  OffRampSaleInfo,
  OnRampPurchaseInfo,
  OnRampTransferInfo,
  Permit2ApproveTransactionInfo,
  RemoveDelegationTransactionInfo,
  SendCallsTransactionInfo,
  UnknownTransactionInfo,
  WrapTransactionInfo,
} from 'uniswap/src/features/transactions/types/transactionDetails'

export type SwapTypeTransactionInfo =
  | ExactInputSwapTransactionInfo
  | ExactOutputSwapTransactionInfo
  | ConfirmedSwapTransactionInfo

import {
  ApproveTransactionInfo,
  NFTApproveTransactionInfo,
  NFTMintTransactionInfo,
  NFTTradeTransactionInfo,
  ReceiveTokenTransactionInfo,
  SendTokenTransactionInfo,
  TransactionType,
  TransactionTypeInfo,
  WCConfirmInfo,
} from 'uniswap/src/features/transactions/types/transactionDetails'

export function isApproveTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is ApproveTransactionInfo {
  return typeInfo.type === TransactionType.Approve
}

export function isOnRampPurchaseTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is OnRampPurchaseInfo {
  return typeInfo.type === TransactionType.OnRampPurchase
}

export function isOnRampTransferTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is OnRampTransferInfo {
  return typeInfo.type === TransactionType.OnRampTransfer
}

export function isOffRampSaleTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is OffRampSaleInfo {
  return typeInfo.type === TransactionType.OffRampSale
}

export function isLocalOnRampTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is LocalOnRampTransactionInfo {
  return typeInfo.type === TransactionType.LocalOnRamp
}

export function isLocalOffRampTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is LocalOffRampTransactionInfo {
  return typeInfo.type === TransactionType.LocalOffRamp
}

export function isNFTApproveTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is NFTApproveTransactionInfo {
  return typeInfo.type === TransactionType.NFTApprove
}

export function isNFTMintTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is NFTMintTransactionInfo {
  return typeInfo.type === TransactionType.NFTMint
}

export function isNFTTradeTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is NFTTradeTransactionInfo {
  return typeInfo.type === TransactionType.NFTTrade
}

export function isReceiveTokenTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is ReceiveTokenTransactionInfo {
  return typeInfo.type === TransactionType.Receive
}

export function isSendTokenTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is SendTokenTransactionInfo {
  return typeInfo.type === TransactionType.Send
}

export function isSwapTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is SwapTypeTransactionInfo {
  return typeInfo.type === TransactionType.Swap
}

export function isBridgeTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is BridgeTransactionInfo {
  return typeInfo.type === TransactionType.Bridge
}

export function isWCConfirmTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is WCConfirmInfo {
  return typeInfo.type === TransactionType.WCConfirm
}

export function isWrapTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is WrapTransactionInfo {
  return typeInfo.type === TransactionType.Wrap
}

export function isUnknownTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is UnknownTransactionInfo {
  return typeInfo.type === TransactionType.Unknown
}

export function isSendCallsTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is SendCallsTransactionInfo {
  return typeInfo.type === TransactionType.SendCalls
}

export function isLiquidityIncreaseTransactionInfo(
  typeInfo: TransactionTypeInfo,
): typeInfo is LiquidityIncreaseTransactionInfo {
  return typeInfo.type === TransactionType.LiquidityIncrease
}

export function isLiquidityDecreaseTransactionInfo(
  typeInfo: TransactionTypeInfo,
): typeInfo is LiquidityDecreaseTransactionInfo {
  return typeInfo.type === TransactionType.LiquidityDecrease
}

export function isCollectFeesTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is CollectFeesTransactionInfo {
  return typeInfo.type === TransactionType.CollectFees
}

export function isCreatePairTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is CreatePairTransactionInfo {
  return typeInfo.type === TransactionType.CreatePair
}

export function isCreatePoolTransactionInfo(typeInfo: TransactionTypeInfo): typeInfo is CreatePoolTransactionInfo {
  return typeInfo.type === TransactionType.CreatePool
}

export function isPermit2ApproveTransactionInfo(
  typeInfo: TransactionTypeInfo,
): typeInfo is Permit2ApproveTransactionInfo {
  return typeInfo.type === TransactionType.Permit2Approve
}

export function isRemoveDelegationTransactionInfo(
  typeInfo: TransactionTypeInfo,
): typeInfo is RemoveDelegationTransactionInfo {
  return typeInfo.type === TransactionType.RemoveDelegation
}

export type TransactionParticipantRowProps = {
  onClose: () => void
  address: string
  isSend?: boolean
}
