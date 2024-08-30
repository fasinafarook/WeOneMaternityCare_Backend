import Wallet from "../../domain/entities/wallet"


interface IWalletRepository {
    createWallet(ownerId: string ,ownerType: 'user' | 'serviceProvider'): Promise<Wallet>
    updateWallet(ownerId: string, amount: number, type: 'credit' | 'debit'): Promise<Wallet>
}

export default IWalletRepository