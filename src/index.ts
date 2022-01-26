import NearWalletSelector from "./core/NearWalletSelector";
import getConfig from "./config";
import {connect, keyStores } from "near-api-js";
import State from "./state/State";
import Options from "./types/Options";


export default async function init(options?: Options) {
  const nearConfig = getConfig(process.env.NODE_ENV || "gent.testnet");
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();
  State.nearConnection = await connect({ keyStore, ...nearConfig, header: {} });
  return new NearWalletSelector(options);
}
