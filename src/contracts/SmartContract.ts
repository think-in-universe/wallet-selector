import State from "../state/State";

export default class SmartContract {
  private contractAddress: string;
  private viewMethods: string[];
  private changeMethods: string[];

  constructor(contractAddress: string, viewMethods: string[], changeMethods: string[]) {
    this.contractAddress = contractAddress;
    this.viewMethods = viewMethods;
    this.changeMethods = changeMethods;
  }

  getContractAddress() {
    return this.contractAddress;
  }

  getViewMethods() {
    return this.viewMethods;
  }

  getChangeMethods() {
    return this.changeMethods;
  }

  async callContract(transaction: any): Promise<any> {
    if (!State.signedInWalletId) {
      return State.walletProviders["nearwallet"].callContract(transaction);
    }
    return State.walletProviders[State.signedInWalletId].callContract(transaction);
  }
}
