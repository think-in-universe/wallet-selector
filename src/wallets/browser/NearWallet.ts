import BrowserWallet from "../types/BrowserWallet";
import INearWallet from "../../interfaces/INearWallet";
import EventHandler from "../../utils/EventHandler";
import State from "../../state/State";
import { WalletConnection } from "near-api-js";
// import BN from "bn.js";

//const provider = new providers.JsonRpcProvider(`https://rpc.${State.options.networkId}.near.org`);

export default class NearWallet extends BrowserWallet implements INearWallet {
  private wallet: WalletConnection;
  // private contract: Contract;

  constructor() {
    super("nearwallet", "Near Wallet", "Near Wallet", "https://cryptologos.cc/logos/near-protocol-near-logo.png");

    this.init();
  }

  async walletSelected() {
    this.signIn();
  }

  async init() {
    if (!State.nearConnection) return;
    this.wallet = new WalletConnection(State.nearConnection, "near_app");
    EventHandler.callEventHandler("init");
  }

  async signIn() {
    this.wallet.requestSignIn(State.options.contract.address).then(() => {
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

  async callContract(transaction: any): Promise<any> {

    //@ts-ignore
    return await this.wallet.account().signAndSendTransaction(transaction)
    // console.log(method, args, gas, deposit )
    // if (!State.nearConnection) return;
    //   const acc = new Account(State.nearConnection.connection, this.wallet.getAccountId())
    // acc.signAndSendTransaction(
    //   transactions
  //   if (!this.contract) {
  //     this.contract = new Contract(this.wallet.account(), State.options.contract.address, {
  //       viewMethods: State.options.contract.viewMethods,
  //       changeMethods: State.options.contract.changeMethods,
  //     });
  //   }
  //   console.log(this.contract, method, args, gas, deposit);
  //   if(deposit){
  //       return this.contract[method](args, gas, deposit);
  //   }
  //   return this.contract[method](args);
  // }
  }
}
