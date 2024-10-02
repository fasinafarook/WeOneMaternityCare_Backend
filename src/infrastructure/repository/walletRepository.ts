import Wallet from "../../domain/entities/wallet";
import IWalletRepository from "../../interfaces/repositories/IWalletRepository";
import { WalletModel } from "../database/walletModel";
import AppError from "../utils/appError";

class WalletRepository implements IWalletRepository {
  async createWallet(
    ownerId: string,
    ownerType: "user" | "serviceProvider"
  ): Promise<Wallet> {
    const wallet = new WalletModel({
      ownerId,
      ownerType,
      balance: 0,
      transactions: [],
    });
    return await wallet.save();
  }
  async updateWallet(
    ownerId: string,
    amount: number,
    type: "credit" | "debit"
  ): Promise<Wallet> {
    const wallet = await WalletModel.findOne({ ownerId: ownerId });
    if (!wallet) throw new AppError("Wallet not found ", 404);

    console.log(
      `Current balance (before update): ${
        wallet.balance
      }, type: ${typeof wallet.balance}`
    );
    console.log(`type of amount: ${typeof amount}`);

    amount = Number(amount);

    const currentBalance = Number(wallet.balance);
    const newBalance =
      type === "credit" ? currentBalance + amount : currentBalance - amount;
    wallet.balance = newBalance;

    // wallet.balance = type === 'credit' ? Number(wallet.balance) + amount : Number(wallet.balance) - amount;
    wallet.transactions?.push({ amount, type, date: new Date() });
    return await wallet.save();
  }
}

export default WalletRepository;
