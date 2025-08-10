import '@/utils/log';
import { CHAIN_ID, Context } from '@derivation-tech/context';
import { ERC20, ERC20__factory, WrappedNative, WrappedNative__factory } from '@derivation-tech/contracts';
import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';

export class ERC20Worker {
  private static instances: Map<CHAIN_ID, ERC20Worker> = new Map();
  chainId: number;
  chainContext: Context;
  ERC20ContractMap: Map<string, ERC20> = new Map(); // erc20 token address => ERC20Contract
  WrappedNativeContractMap: Map<string, WrappedNative> = new Map(); // wrapped token address => WrappedNative

  constructor(chainId: CHAIN_ID) {
    this.chainId = chainId;
    this.chainContext = new Context(chainId);
  }

  public static getInstance(chainId: CHAIN_ID): ERC20Worker {
    let instance = this.instances.get(chainId);
    if (!instance) {
      instance = new ERC20Worker(chainId);
      this.instances.set(chainId, instance);
    }
    return instance;
  }

  getERC20Contract = (tokenAddr: string, signerOrProvider: Signer | Provider): ERC20 => {
    let erc20Contract = this.ERC20ContractMap.get(tokenAddr);
    if (erc20Contract) {
      return erc20Contract;
    }
    erc20Contract = ERC20__factory.connect(tokenAddr, signerOrProvider);
    this.ERC20ContractMap.set(tokenAddr, erc20Contract);
    return erc20Contract;
  };

  getWrappedNativeContract = (tokenAddr: string, signerOrProvider: Signer | Provider): WrappedNative => {
    let wrappedNativeContract = this.WrappedNativeContractMap.get(tokenAddr);
    if (wrappedNativeContract) {
      return wrappedNativeContract;
    }
    wrappedNativeContract = WrappedNative__factory.connect(tokenAddr, signerOrProvider);
    this.WrappedNativeContractMap.set(tokenAddr, wrappedNativeContract);
    return wrappedNativeContract;
  };
}
