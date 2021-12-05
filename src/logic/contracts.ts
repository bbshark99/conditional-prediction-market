import ConditionalTokens from "../abi/ConditionalTokens.json";
import LMSRMarketMaker from "../abi/LMSRMarketMaker.json";
import DerivedToken from "../abi/DerivedToken.json";
const TruffleContract = require("@truffle/contract");

let contracts: Object | undefined;
let lmsrAddressCache: string | undefined;
let providerAccountCache: string | undefined;

const resetContracts = () => {
  contracts = undefined;
  lmsrAddressCache = undefined;
  providerAccountCache = undefined;
};

const loadLMSRMarketMakerContract = async (web3: any) => {
  let lmsrMarketMakerContract;
  if (!contracts) {
    lmsrMarketMakerContract = TruffleContract(LMSRMarketMaker);
    lmsrMarketMakerContract.setProvider(web3.currentProvider);
  }
  return lmsrMarketMakerContract;
};

const loadConditionalTokensContract = async (web3: any) => {
  let conditionalTokensContract;
  if (!contracts) {
    conditionalTokensContract = TruffleContract(ConditionalTokens);
    conditionalTokensContract.setProvider(web3.currentProvider);
  }
  return conditionalTokensContract;
};

const loadDerivedTokenContract = async (web3: any) => {
  let derivedTokenContract;
  if (!contracts) {
    derivedTokenContract = TruffleContract(DerivedToken);
    derivedTokenContract.setProvider(web3.currentProvider);
  }
  return derivedTokenContract;
};

const loadContracts = async (
  web3: any,
  lmsrAddress: string,
  account: string
) => {
  try {
    if (
      (account && account !== providerAccountCache) ||
      (lmsrAddress && lmsrAddress !== lmsrAddressCache)
    ) {
      resetContracts();
    }
    if (!contracts) {
      providerAccountCache = account;
      lmsrAddressCache = lmsrAddress;

      const LMSRMarketMakerContract = await loadLMSRMarketMakerContract(web3);
      const ConditionalTokensContract = await loadConditionalTokensContract(
        web3
      );
      const DerivedToken = await loadDerivedTokenContract(web3);

      const lmsrMarketMaker = await LMSRMarketMakerContract.at(lmsrAddress);
      const conditionalTokens = await ConditionalTokensContract.at(
        await lmsrMarketMaker.pmSystem()
      );
      const DerivedTokenContract = await DerivedToken.at(
        await lmsrMarketMaker.collateralToken()
      );
      const collateralToken = {
        address: await lmsrMarketMaker.collateralToken(),
        contract: DerivedTokenContract,
        name: await DerivedTokenContract.name(),
        decimals: parseInt(
          (await DerivedTokenContract.decimals()).toString(),
          10
        ),
        symbol: await DerivedTokenContract.symbol(),
      };

      contracts = { lmsrMarketMaker, conditionalTokens, collateralToken };
    }
    return contracts;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export default loadContracts;
