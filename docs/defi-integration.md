# USPC DeFi integration guide

## USPC

USPC provides onchain exposure to iUSPC, a tokenized structured credit note linked to an actively managed portfolio of institutional credit and overcollateralized lending strategies. Portfolio investment decisions are managed by Asset Management Switzerland AG, a FINMA-licensed portfolio manager. See [Coinshift](https://coinshift.xyz/) and the [FINMA register](https://www.finma.ch/~/media/finma/dokumente/bewilligungstraeger/pdf/vvtr.pdf?hash=64105F88A345D7728BA9F6CB23E164CE&sc_lang=en).

USPC is non-rebasing: returns affect its value rather than increasing the holder's token balance. It is not fixed at $1, and NAV can fall. Ethereum USPC is an ERC-4626 vault holding iUSPC; Monad and Stellar USPC represent the Ethereum USPC locked by the bridge.

Use [Coinshift analytics](https://analytics.coinshift.xyz/) for allocations, performance and the liquidity schedule, and [Accountable](https://coinshift.accountable.capital/) for independent reserve and liability disclosures. Redemption timing follows the applicable product terms and available liquidity; underlying portfolio liquidity is distinct from a holder's redemption entitlement. See [product terms](https://coinshift.xyz/legal).

## Token contracts

| Network | USPC token address | Decimals |
| --- | --- | --- |
| Monad mainnet, chain ID 143 | [`0xdAFA800e2C60830cB8D2bd3C022C073e6EC8876E`](https://monadscan.com/address/0xdAFA800e2C60830cB8D2bd3C022C073e6EC8876E#code) | 6 |
| Ethereum mainnet, chain ID 1 | [`0xbF4e3fbE8B60062A00C7a6B1D97d0d49c2971A19`](https://etherscan.io/address/0xbF4e3fbE8B60062A00C7a6B1D97d0d49c2971A19#code) | 6 |
| Stellar mainnet | [`CCIMELDVXPSNVYLMZB3YA7X52IIETA63PLHBVQJGQW3WSGEKHUC3EAPC`](https://stellar.expert/explorer/public/contract/CCIMELDVXPSNVYLMZB3YA7X52IIETA63PLHBVQJGQW3WSGEKHUC3EAPC) | 7 |

Use the token address on the market's network as collateral. **One USPC = 1,000,000 base units on Ethereum and Monad, or 10,000,000 on Stellar.** Bridge adapters, the Stellar OFT and SAC Manager have separate addresses; see [mainnet contracts](../README.md#mainnet-contracts). The [Monad token artifact](../evm/artifacts/monad/USPCMonad.json) includes its ABI.

| Behavior | Monad | Ethereum | Stellar |
| --- | --- | --- | --- |
| Approvals and transfers | Standard ERC-20; no transfer allowlist, denylist or token-level pause | ERC-20 vault shares; transfers are subject to pause and denylist controls | SEP-41 token interface and classic asset operations; SAC authorization controls apply |
| Vault interface | No ERC-4626 deposit or redemption methods | ERC-4626 holding iUSPC, with access controls on withdrawals | No ERC-4626 deposit or redemption methods |
| Primary exit to USDC | Separate redemption process, potentially requiring bridging to Ethereum | Separate from withdrawing iUSPC from the vault | Separate redemption process, potentially requiring bridging to Ethereum |

Monad's [token source](../evm/sources/contracts/USPCMonad.sol) has role-controlled minting and burning. Bridge controls, primary redemption eligibility and settlement terms apply separately.

## Stellar integration

Use the **Stellar Asset Contract (SAC)** in the token table for Soroban collateral and token calls. Wallets and classic asset operations identify the same asset by its code and issuer:

| Field | Value |
| --- | --- |
| Asset code | `USPC` |
| Issuer | [`GARSY67GO23LDNMWLB5CWW7E6AGHGPU5TCDZF4EYO5UMBV4V4R5FRBO2`](https://stellar.expert/explorer/public/account/GARSY67GO23LDNMWLB5CWW7E6AGHGPU5TCDZF4EYO5UMBV4V4R5FRBO2) |

The SAC implements [SEP-41](https://developers.stellar.org/docs/tokens/token-interface). Use `soroban_sdk::token::TokenClient` for `balance`, `transfer`, `approve` and `transfer_from`. Amounts use non-negative `i128` integers at 7 decimals. Approval expiry is a ledger number, not a timestamp; use the lending protocol's authorization flow and handle expired allowances. Retain integer precision in clients, such as JavaScript `bigint`.

Classic `G...` accounts need a trustline for this exact asset with sufficient capacity and the required reserve before receiving it. Soroban `C...` contract balances are stored by the SAC and do not use classic trustlines. These are two ways of holding the same asset, with no extra wrapping step. See [Stellar's SAC documentation](https://developers.stellar.org/docs/tokens/stellar-asset-contract).

The [SAC Manager](../stellar/contracts/sac-manager/src/sac_manager.rs) controls minting and exposes role-gated balance authorization, admin changes and clawback methods. Their applicability depends on the asset flags and assigned roles. Authorization revocation can prevent a wallet or protocol from using its balance, including for liquidation. Bridge pauses are separate from local token transfers; read the current asset and bridge controls when assessing collateral risk.

### Bridge transfers

USPC supports **Ethereum ↔ Stellar** and **Ethereum ↔ Monad**. Moving between Stellar and Monad requires two separate transfers through Ethereum. Each leg has its own fee, limits and delivery lifecycle.

The Stellar OFT uses 7 local decimals and 6 shared bridge decimals, so cross-chain amounts have precision of `0.000001 USPC`, equal to 10 Stellar base units. Use `quote_oft` for token amounts and `quote_send` for messaging fees. Express `amount_ld`, `min_amount_ld` and quoted token amounts in the source chain's local units: 7 decimals for a Stellar-origin send, including when the destination is Ethereum. Rounding and any configured token fee affect the result; see the [deployed OFT calculation](../stellar/contracts/oft/src/oft.rs).

Invoke the OFT's `send` method to bridge; an ordinary token transfer does not initiate delivery. The Stellar OFT burns through sender authorization and reports `approval_required() = false`. A classic Stellar recipient must have its USPC trustline ready to receive the bridge credit.

## NAV and oracle integration

Accountable supplies the NAV data for the [Ethereum Chainlink NAVLink feed](https://data.chain.link/feeds/ethereum/mainnet/uspc-nav). Both EVM addresses below expose `AggregatorV3Interface` and report `USPC NAV` with 18 decimals.

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

The feed's base and quote units determine the required conversion. An iUSPC NAV feed requires the vault share conversion; an already-adjusted USPC feed includes it. An integration outside Ethereum that requires the vault ratio needs that data supplied across chains. The feed's display name alone does not establish its units. A USDC-denominated price needs no additional USDC/USD conversion for a USDC loan; a USD-denominated price does.

### Stellar oracles

Stellar USPC uses the same share valuation. A Soroban lending integration needs a compatible oracle supplying the iUSPC NAV and Ethereum vault conversion, or an already-adjusted USPC price. The token bridge does not publish these values on Stellar. This release does not specify a Stellar USPC NAV oracle address or feed ID.

[Chainlink's Stellar interface](https://docs.chain.link/data-feeds/stellar) uses a Soroban proxy and feed-specific `data_id`; the EVM feed addresses and `AggregatorV3Interface` above cannot be called directly from Soroban. Match the selected oracle's denomination and precision to the lending protocol, including USPC's 7 decimals and the loan asset's decimals. Validate freshness of every input, including any relayed vault conversion.
