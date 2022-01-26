import BrowserWallet from "../types/BrowserWallet";
import INearWallet from "../../interfaces/INearWallet";
import EventHandler from "../../utils/EventHandler";
import {WalletConnection, Contract, transactions} from "near-api-js";
import { getState } from "../../state/State";

export default class NearWallet extends BrowserWallet implements INearWallet {
  private wallet: WalletConnection;
  private contract: Contract;

  constructor() {
    super(
      "nearwallet",
      "Near Wallet",
      "Near Wallet",
      "https://cryptologos.cc/logos/near-protocol-near-logo.png"
    );

    this.init();
  }

  async walletSelected() {
    this.signIn();
  }

  async init() {
    const state = getState();
    if (!state.nearConnection) return;
    this.wallet = new WalletConnection(state.nearConnection, "near_app");
    EventHandler.callEventHandler("init");
  }

  async signIn() {
    const state = getState();
    this.wallet.requestSignIn(state.options.contract.address).then(() => {
      this.setWalletAsSignedIn();
      EventHandler.callEventHandler("signIn");
    });
  }
  async disconnect() {
    if (!this.wallet) return;
    this.wallet.signOut();
    EventHandler.callEventHandler("disconnect");
  }

  async isConnected(): Promise<boolean> {
    if (!this.wallet) return false;
    return this.wallet.isSignedIn();
  }

  async getAccount(): Promise<any> {
    if (!this.isConnected()) return null;
    return {
      accountId: this.wallet.getAccountId(),
      balance: (await this.wallet.account().state()).amount,
    };
  }

  async callContract(
    method: string,
    args?: any,
    gas?: string,
    deposit?: string
  ): Promise<any> {
    console.log("Call Contract");

    if (method === "addMessage") {
      // @ts-ignore
      return await this.wallet.account().signAndSendTransaction({
        receiverId: this.wallet.account().accountId,
        actions: [
          transactions.functionCall(
              method,
              args || {},
              // @ts-ignore.
              gas,
              deposit
          )
        ]
      })
    }

    const state = getState();
    if (!this.contract) {
      this.contract = new Contract(
        this.wallet.account(),
        state.options.contract.address,
        {
          viewMethods: state.options.contract.viewMethods,
          changeMethods: state.options.contract.changeMethods,
        }
      );
    }
    console.log(this.contract, method, args, gas, deposit);
    return this.contract[method](args);
  }
}
