import mongoose, { Model, Schema } from "mongoose";
import Wallet from "../../domain/entities/wallet";

const walletSchema: Schema<Wallet> = new Schema(
  {
    ownerId: { type: String, required: true },
    ownerType: {
      type: String,
      enum: ["user", "serviceProvider"],
      required: true,
    },
    balance: { type: Number, required: true, default: 0 },
    transactions: [
      {
        amount: { type: Number, required: true },
        type: {
          type: String,
          enum: ["credit", "debit"],
          required: true,
        },
        date: { type: Date, required: true, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);
const WalletModel: Model<Wallet> = mongoose.model("Wallet", walletSchema);
export { WalletModel };
