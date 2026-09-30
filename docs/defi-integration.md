# USPC DeFi integration guide

## USPC

USPC provides onchain exposure to iUSPC, a tokenized structured credit note linked to an actively managed portfolio of institutional credit and overcollateralized lending strategies. Portfolio investment decisions are managed by Asset Management Switzerland AG, a FINMA-licensed portfolio manager. See [Coinshift](https://coinshift.xyz/) and the [FINMA register](https://www.finma.ch/~/media/finma/dokumente/bewilligungstraeger/pdf/vvtr.pdf?hash=64105F88A345D7728BA9F6CB23E164CE&sc_lang=en).

USPC is non-rebasing: returns affect its value rather than increasing the holder's token balance. It is not fixed at $1, and NAV can fall. Ethereum USPC is an ERC-4626 vault holding iUSPC; Monad USPC represents the Ethereum USPC locked by the bridge.

Use [Coinshift analytics](https://analytics.coinshift.xyz/) for allocations, performance and the liquidity schedule, and [Accountable](https://coinshift.accountable.capital/) for independent reserve and liability disclosures. Redemption timing follows the applicable product terms and available liquidity; underlying portfolio liquidity is distinct from a holder's redemption entitlement. See [product terms](https://coinshift.xyz/legal).

## Token contracts

| Network | USPC token address | Decimals |
| --- | --- | --- |
| Monad mainnet, chain ID 143 | [`0xdAFA800e2C60830cB8D2bd3C022C073e6EC8876E`](https://monadscan.com/address/0xdAFA800e2C60830cB8D2bd3C022C073e6EC8876E#code) | 6 |
| Ethereum mainnet, chain ID 1 | [`0xbF4e3fbE8B60062A00C7a6B1D97d0d49c2971A19`](https://etherscan.io/address/0xbF4e3fbE8B60062A00C7a6B1D97d0d49c2971A19#code) | 6 |

Use the token address on the market's network as collateral. **One USPC = 1,000,000 base units.** Bridge adapter addresses are separate; see [mainnet contracts](../README.md#mainnet-contracts). The [Monad token artifact](../evm/artifacts/monad/USPCMonad.json) includes its ABI.

| Behavior | Monad | Ethereum |
| --- | --- | --- |
| Approvals and transfers | Standard ERC-20; no transfer allowlist, denylist or token-level pause | ERC-20 vault shares; transfers are subject to pause and denylist controls |
| Vault interface | No ERC-4626 deposit or redemption methods | ERC-4626 holding iUSPC, with access controls on withdrawals |
| Primary exit to USDC | Separate redemption process, potentially requiring bridging to Ethereum | Separate from withdrawing iUSPC from the vault |

Monad's [token source](../evm/sources/contracts/USPCMonad.sol) has role-controlled minting and burning. Bridge controls, primary redemption eligibility and settlement terms apply separately.

## NAV and oracle integration

Accountable supplies the NAV data for the [Ethereum Chainlink NAVLink feed](https://data.chain.link/feeds/ethereum/mainnet/uspc-nav). Both addresses below expose `AggregatorV3Interface` and report `USPC NAV` with 18 decimals.

| Network | Chainlink feed proxy | Decimals |
| --- | --- | --- |
| Monad mainnet | [`0xbA62278232b6007960a38F1E20ef68Fe14a03CeF`](https://monadscan.com/address/0xbA62278232b6007960a38F1E20ef68Fe14a03CeF#readContract) | 18 |
| Ethereum mainnet | [`0x02ae69C812DD749c32afb4F1723F6833EeF3d7a3`](https://etherscan.io/address/0x02ae69C812DD749c32afb4F1723F6833EeF3d7a3#readContract) | 18 |

Read `decimals()` and `latestRoundData()`. Dividing `answer` by `10^18` gives the published NAV; `updatedAt` records its publication time. The feeds update independently, so their latest answers and timestamps can differ.

### Price the USPC share

Ethereum's deployed [Pricer](https://etherscan.io/address/0x5eC0C20A83554eC1BBC0F1D3414BB8746a04acD4#readProxyContract) and [Hub](https://etherscan.io/address/0x078ED1b5cd6171c2eB52f2A0c19e5fAb87c675cE#readProxyContract) consume the feed as **USDC per iUSPC**. The vault's underlying asset is [iUSPC](https://etherscan.io/address/0xdc807c3a618B6B1248481783def7ED76700B9eC6). For that denomination:

```text
USPC value in USDC = iUSPC NAV in USDC × iUSPC assets per USPC share
```

Use the Ethereum vault's `convertToAssets()` to calculate the iUSPC assets represented by USPC shares. Apply this conversion exactly once; do not hardcode a permanent 1:1 vault ratio.

The feed's base and quote units determine the required conversion. An iUSPC NAV feed requires the vault share conversion; an already-adjusted USPC feed includes it. A Monad adapter requiring the Ethereum vault ratio needs that data supplied across chains. The feed's display name alone does not establish its units. A USDC-denominated price needs no additional USDC/USD conversion for a USDC loan; a USD-denominated price does.

### Validation and scaling

The lending oracle must reject non-positive answers, missing or future timestamps, and prices older than its configured maximum age. Set that age against the feed's publication schedule, including non-business days, and define bounds and outage behavior. Reading `updatedAt` alone provides no protection.

Morpho's standard [`MorphoChainlinkOracleV2` feed library](https://github.com/morpho-org/morpho-blue-oracles/blob/main/src/morpho-chainlink/libraries/ChainlinkDataFeedLib.sol) rejects negative answers but accepts zero and does not enforce freshness. Required checks must therefore exist in the selected adapter or its upstream feed. A stale-price revert can also block price-dependent borrowing, collateral withdrawals and liquidations.

Morpho expects `price()` scaled by `10^(36 + loanDecimals - collateralDecimals)`. With six-decimal USPC and USDC, return the USDC-per-USPC price at **36 decimals**. An 18-decimal answer that already includes the correct denomination and share conversion scales by `10^18`. See the [Morpho oracle interface](https://github.com/morpho-org/morpho-blue/blob/main/src/interfaces/IOracle.sol).

## Morpho integration

The following contracts are listed in [Morpho's registry](https://docs.morpho.org/developers/contracts/addresses/) and [Circle's USDC registry](https://developers.circle.com/stablecoins/usdc-contract-addresses) for Monad mainnet:

| Contract | Address |
| --- | --- |
| Morpho | [`0xD5D960E8C380B724a48AC59E2DfF1b2CB4a1eAee`](https://monadscan.com/address/0xD5D960E8C380B724a48AC59E2DfF1b2CB4a1eAee#code) |
| Circle USDC, 6 decimals | [`0x754704Bc059F8C67012fEd69BC8A327a5aafb603`](https://monadscan.com/address/0x754704Bc059F8C67012fEd69BC8A327a5aafb603#code) |
| AdaptiveCurveIRM | [`0x09475a3D6eA8c314c592b1a3799bDE044E2F400F`](https://monadscan.com/address/0x09475a3D6eA8c314c592b1a3799bDE044E2F400F#code) |

Morpho fixes the loan token, collateral token, oracle address, interest-rate model and liquidation loan-to-value ratio (LLTV) at market creation. A USPC/USDC market uses the network's USPC token as collateral, USDC as the loan asset, and a Morpho-compatible oracle implementing the pricing and validation described above. The selected IRM and LLTV must be enabled on the Morpho deployment. See [market parameters](https://docs.morpho.org/learn/concepts/blue/).

AdaptiveCurveIRM responds to utilization, so borrowing costs and the spread against USPC yield can change. Borrowers should operate below LLTV to leave room for accrued interest and NAV declines. See the [IRM specification](https://docs.morpho.org/developers/contracts/irm/).

## Liquidity and liquidations

A borrower supplies USPC, borrows USDC, then repays debt and interest to withdraw collateral. A liquidator repays USDC and receives USPC. **NAV is not a guaranteed executable sale price.** Converting seized collateral to USDC needs funded buyers or an eligible redemption route.

Liquidation liquidity depends on available cash, execution prices and settlement times. Primary redemption follows its eligibility and liquidity terms. Exits through Ethereum also depend on bridge fees, pauses and delivery times. These factors affect suitable collateral limits and LLTV.
