enum TransactionType {
  CREDIT = "credit",
  DEBIT = "debit",
}

interface Transaction {
  amount: number;
  type: "credit" | "debit";
  date: Date;
}

interface Wallet {
  _id?: string;
  ownerId: string; // ID of user or service provider
  ownerType: "user" | "serviceProvider"; // Type of owner
  balance: number;
  transactions?: Transaction[];
}

export default Wallet;
