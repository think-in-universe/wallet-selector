import ISenderWallet from "../../interfaces/ISenderWallet";
import InjectedWallet from "../types/InjectedWallet";
import { getState, updateState } from "../../state/State";
import { Emitter } from "../../utils/EventsHandler";


export default class SenderWallet
  extends InjectedWallet
  implements ISenderWallet
{
  private contract: any;

  constructor(emitter: Emitter) {
    super(
      emitter,
      "senderwallet",
      "Sender Wallet",
      "Sender Wallet",
      "https://senderwallet.io/logo.png",
      "wallet"
    );
  }

  async walletSelected() {
    if (!window[this.injectedGlobal]) {
      updateState((prevState) => ({
        ...prevState,
        showWalletOptions: false,
        showSenderWalletNotInstalled: true,
      }));
      return;
    }

    const rpcResponse = await window[this.injectedGlobal].getRpc();
    const state = getState();

    if (state.options.networkId !== rpcResponse.rpc.networkId) {
      updateState((prevState) => ({
        ...prevState,
        showWalletOptions: false,
        showSwitchNetwork: true,
      }));
      return;
    }
    await this.init();
    await this.signIn();
  }

  async signIn() {
    const state = getState();
    const response = await window[this.injectedGlobal].requestSignIn({
      contractId: state.options.contract.address,
    });
    console.log(response);

    if (response.accessKey) {
      this.setWalletAsSignedIn();
      this.emitter.emit("signIn");
      updateState((prevState) => ({
        ...prevState,
        showModal: false
      }))
    }
  }

  async timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async init(): Promise<void> {
    await this.timeout(200);
    const state = getState();
    window[this.injectedGlobal].onAccountChanged((newAccountId: string) => {
      console.log("newAccountId: ", newAccountId);
    });
    window[this.injectedGlobal]
      .init({ contractId: state.options.contract.address })
      .then((res: any) => {
        console.log(res);
      });
  }

  async isConnected(): Promise<boolean> {
    return window[this.injectedGlobal].isSignedIn();
  }

  disconnect() {
    this.emitter.emit("disconnect", {});
    return window[this.injectedGlobal].signOut();
  }

  async getAccount() {
    await this.timeout(300);
    return {
      accountId: window[this.injectedGlobal].getAccountId(),
      balance: "99967523358427624000000000",
    };
  }

  async callContract(
    method: string,
    args?: any,
    gas?: string,
    deposit?: string
  ): Promise<any> {
    if (!this.contract) {
      const state = getState();
      if (!state.nearConnection) return;
      this.contract = await state.nearConnection.loadContract(
        state.options.contract.address,
        {
          viewMethods: state.options.contract.viewMethods,
          changeMethods: state.options.contract.changeMethods,
          sender: window[this.injectedGlobal].getAccountId(),
        }
      );
    }
    console.log(this.contract, method, args, gas, deposit);
    return this.contract[method](args);
  }
}
