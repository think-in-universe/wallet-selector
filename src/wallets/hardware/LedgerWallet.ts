import HardwareWallet from "../types/HardwareWallet";
import LedgerTransportWebHid from "@ledgerhq/hw-transport-webhid";
import { listen } from "@ledgerhq/logs";
import bs58 from "bs58";
import ILedgerWallet from "../../interfaces/ILedgerWallet";
import { getState, updateState } from "../../state/State";
import { providers, transactions, utils } from "near-api-js";
import BN from "bn.js";
<<<<<<< HEAD
import { Emitter } from "../../utils/EventsHandler";
=======
import { CallParams, ViewParams } from "../../interfaces/IWallet";
>>>>>>> 88933653e8377e23c87fe454fc901f24e83ac77c

export default class LedgerWallet
  extends HardwareWallet
  implements ILedgerWallet
{
  private readonly CLA = 0x80;
  private readonly GET_ADDRESS_INS = 0x04;
  private readonly SIGN_INS = 0x02;

  private readonly LEDGER_LOCALSTORAGE_PUBLIC_KEY = "ledgerPublicKey";
  private readonly LEDGER_LOCALSTORAGE_DERIVATION_PATH = "ledgerDerivationPath";

  private debugMode = false;
  private derivationPath = "44'/397'/0'/0'/0'";
  private publicKey: Uint8Array;
  private accountId: string;
  private nonce: number;

  constructor(emitter: Emitter) {
    super(
      emitter,
      "ledgerwallet",
      "Ledger Wallet",
      "Ledger Wallet",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAAYFBMVEX///8zN0aZm6Jwc305PUtiZXGvsbbi4uSmp67n5+m+v8Q1OUdFSVb6+vr19fY+QlDt7e56fYbT1NdTVmPHyMyGiJFqbXdbXmlWWWWgoah7foeSlJx1eIJLT1yztbrw8fKmGsZBAAACeklEQVR4nO3d2XKCMBhAYSIUAUEQt9b1/d+yetPaGshMlp+0nnMN0k8lUGZMkoSIiIiIiIiIiIiIXr6mK+cP6Ta5zp0ruyYkostXa/WjTLfZTPnonBbat8m9ard4OlpAyL19vvTPWOuOFBiiVF34/Y6VO/1xgkOUeu89Oqp24CgCELX48Ob4GDyIBESpg6ev13H4EDIQlXqRDH8eYhB18uCoxg4gBVEzZ0c5dJ7LQtTGFTIw7opDzo6XxtEvliREHd0g2uv5JJCsc3EYPhBJiNv5Pn6GyEJqh4tJ93y/Ox3EZeDKTa8tCtnaQ1ZRQdb2EMOYJQxR1peSxvjSshDr/0yukUEqW0gZGeRiC5lHBsmBAAECBAgQIEBukMxU+zcglgEBAgQIECBAgAABAgQIECBAAkOuM2N/A/J/HgcBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIC8GKRLTWl/MH8x7maZ80/BiYiIiIiIiCiuyjdTO91uuXE37exlW+Nu1hO8BHsclOp2ewv3OAgIECBAgAAB8p8gweags4RYz0HXRQaxvmkMNk+jJcR+Bvk6Loj9jL9pVJDa2pEUUUFW9hDj+CsKsR60bu0jgrQu85SbZi6WhDjMW3wbgA3jliBk4bY+jOF0F4QcnBxJ8x4JpC3dIEk/OlG5HMT9R/ljq3bIQXys2zE2VbkUZO9j9aRm5EZFCLJ2WlfhW3KaGLL347j/aUNnvAjk5HFVrs15MkjrdxKR5TGbBLI4uF4/nuqOmtuVwJBsG2Tdumaz/b3YQkhIvbr4X7Luq2Vf5cVDum36wpT2KUL1sEFe9d5GKiIiIiIiIiIiIqKX6xNYBUsKTAn7+wAAAABJRU5ErkJggg=="
    );

    const ledgerLocalStoragePublicKey = window.localStorage.getItem(this.LEDGER_LOCALSTORAGE_PUBLIC_KEY);

    if (ledgerLocalStoragePublicKey !== null) {
      this.publicKey = this.arrayToBuffer(bs58.decode(ledgerLocalStoragePublicKey).toJSON().data);
    }

    const ledgerLocalStorageDerivationPath = window.localStorage.getItem(this.LEDGER_LOCALSTORAGE_DERIVATION_PATH);

    if (ledgerLocalStorageDerivationPath !== null) {
      this.derivationPath = ledgerLocalStorageDerivationPath;
    }

    listen((log) => {
      if (this.debugMode) {
        console.log(log);
      }
    });
  }

  arrayToBuffer(arr: number[]): Uint8Array {
    const ret = new Uint8Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
      ret[i] = arr[i];
    }
    return ret;
  }

  getPublicKey() {
    return this.publicKey;
  }

  setDerivationPath(path: string) {
    this.derivationPath = path;
  }

  async setAccountId(accountId: string) {
    this.accountId = accountId;
  }

  async checkAccountId(accountId: string, publicKey: string) {
    const state = getState();
    const provider = new providers.JsonRpcProvider(`https://rpc.${state.options.networkId}.near.org`);

    return provider
      .query({
        request_type: "view_access_key",
        finality: "final",
        account_id: accountId,
        public_key: publicKey,
      })
      .then((res: any) => {
        this.nonce = res.nonce;
        return true;
      })
      .catch((err) => {
        console.log(err);

        return false;
      });
  }

  setDebugMode(debugMode: boolean) {
    this.debugMode = debugMode;
  }

  bip32PathToBytes(path: string) {
    const parts = path.split("/");
    return Buffer.concat(
      parts
        .map((part) =>
          part.endsWith(`'`) ? Math.abs(parseInt(part.slice(0, -1))) | 0x80000000 : Math.abs(parseInt(part))
        )
        .map((i32) => Buffer.from([(i32 >> 24) & 0xff, (i32 >> 16) & 0xff, (i32 >> 8) & 0xff, i32 & 0xff]))
    );
  }

  async walletSelected() {
    updateState((prevState) => ({
      ...prevState,
      showWalletOptions: false,
      showLedgerDerivationPath: true,
    }));
  }

  private async sign(transactionData: Uint8Array) {
    if (!this.transport) return;
    const txData = Buffer.from(transactionData);
    // 128 - 5 service bytes
    const CHUNK_SIZE = 123;
    const allData = Buffer.concat([this.bip32PathToBytes(this.derivationPath), txData]);

    for (let offset = 0; offset < allData.length; offset += CHUNK_SIZE) {
      const chunk = Buffer.from(allData.subarray(offset, offset + CHUNK_SIZE));
      const isLastChunk = offset + CHUNK_SIZE >= allData.length;
      const response = await this.transport.send(this.CLA, this.SIGN_INS, isLastChunk ? 0x80 : 0x0, 0x0, chunk);
      if (isLastChunk) {
        return Buffer.from(response.subarray(0, -2));
      }
    }

    return Buffer.from([]);
  }

  async init() {
    if (this.transport) return;

    this.transport = await LedgerTransportWebHid.create().catch((err) => {
      console.log(err);
    });

    if (!this.transport) {
      throw new Error("Could not connect to Ledger device");
    }

    this.transport.setScrambleKey("NEAR");

    this.transport.on("disconnect", (res: any) => {
      console.log(res);
      this.emitter.emit("disconnect", {});
    });

  }

  async disconnect() {
    this.emitter.emit("disconnect", {});
  }

  async isConnected(): Promise<boolean> {
    return false;
  }

  async signIn() {
    await this.init();
    let publicKeyString;
    if (!this.publicKey) {
      const pk = await this.generatePublicKey();
      this.publicKey = pk;
      publicKeyString = this.encodePublicKey(pk);
      window.localStorage.setItem(this.LEDGER_LOCALSTORAGE_PUBLIC_KEY, publicKeyString);
    } else {
      publicKeyString = this.encodePublicKey(this.publicKey);
    }
    window.localStorage.setItem(this.LEDGER_LOCALSTORAGE_DERIVATION_PATH, this.derivationPath);
    const hasPersmission = await this.checkAccountId(this.accountId, "ed25519:" + publicKeyString);

    if (!hasPersmission) {
      throw new Error("You do not have permission to sign transactions for this account");
    }

    this.setWalletAsSignedIn();
    updateState((prevState) => ({
      ...prevState,
      showModal: false
    }))
    this.emitter.emit("signIn", {});
  }

  async generatePublicKey() {
    if (!this.transport) return;

    const response = await this.transport.send(
      this.CLA,
      this.GET_ADDRESS_INS,
      0x0,
      0x0,
      this.bip32PathToBytes(this.derivationPath)
    );

    return response.subarray(0, -2);
  }

  async getAccount() {
    return {
      accountId: this.accountId,
      balance: "99967523358427624000000000",
    };
  }

  encodePublicKey(publicKey: Uint8Array) {
    return bs58.encode(Buffer.from(publicKey));
  }

  async view({ contractId, methodName, args }: ViewParams) {
    const state = getState();

    console.log("LedgerWallet:view", { contractId, methodName, args });

    return await state.walletProviders.nearwallet.view({
      contractId,
      methodName,
      args
    });
  }

  // TODO: Refactor callContract into this new method.
  async call({ receiverId, actions }: CallParams) {
    console.log("LedgerWallet:call", { receiverId, actions });

    // To keep the alias simple, lets just support a single action.
    if (actions.length !== 1) {
      throw new Error("Ledger Wallet implementation currently supports just one action");
    }

    const action = actions[0];

    return this.callContract(
      action.methodName,
      action.args,
      action.gas,
      action.deposit
    );
  }

  async callContract(method: string, args?: any, gas: string = "10000000000000", deposit: string = "0") {
    const state = getState();
    if (!state.signedInWalletId) return;

    if (state.options.contract.viewMethods.includes(method)) {
      return await state.walletProviders.nearwallet.view({
        contractId: state.options.contract.address,
        methodName: method,
        args
      });
    }

    if (!args) args = [];

    const bnGas = new BN(gas.toString());
    const bnDeposit = new BN(deposit.toString());
    const provider = new providers.JsonRpcProvider(`https://rpc.${state.options.networkId}.near.org`);

    const response = await state.nearConnection!.connection.provider.block({
      finality: "final",
    });

    if (!response) return;

    const recentBlockHash = utils.serialize.base_decode(response.header.hash);
    const nonce = ++this.nonce;

    const keyPair = utils.key_pair.KeyPairEd25519.fromRandom();

    const pk = keyPair.getPublicKey();
    pk.data = this.publicKey;

    const actions = [transactions.functionCall(method, args, bnGas, bnDeposit)];

    const transaction = transactions.createTransaction(
      this.accountId,
      pk,
      state.options.contract.address,
      nonce,
      actions,
      recentBlockHash
    );

    const serializedTx = utils.serialize.serialize(transactions.SCHEMA, transaction);

    const signature = await this.sign(serializedTx);

    const signedTransaction = new transactions.SignedTransaction({
      transaction,
      signature: new transactions.Signature({
        keyType: transaction.publicKey.keyType,
        data: signature,
      }),
    });

    const signedSerializedTx = signedTransaction.encode();

    const base64Response: any = await provider.sendJsonRpc("broadcast_tx_commit", [
      Buffer.from(signedSerializedTx).toString("base64"),
    ]);

    if (base64Response.status.SuccessValue === "") {
      return true;
    }

    const res = JSON.parse(Buffer.from(base64Response.status.SuccessValue, "base64").toString());

    return res;
  }
}
