import Stripe from "stripe";
import AppError from "./appError";


const stripe = new Stripe(process.env.STRIPE_API_SECRET || "");

class StripePayment {

  makePayment = async (info: any, previousUrl: string) => {
    // console.log('inside sripe make payment: ', previousUrl)
    try {
      const {
        serviceProviderId,
        to,
        from,
        _id,
        date,
        userId,
        price,
        title,
        description,
        roomId,
        paymentIntentId
      } = info;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          // Define your product details here
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: title,
                description: description,
              },
              unit_amount: price * 100, // Price in cents
            },
            quantity: 1,
          },
        ],
        success_url: `https://weone-maternitycare.online/user/payment-success`,
        cancel_url: `https://weone-maternitycare.online/user/payment-failed`,

        metadata: {
        serviceProviderId,
          to,
          from,
          _id,
          date,
          userId,
          price,
          title,
          description,
          roomId,
          paymentIntentId
        },
      });
      
      return session.url;
    } catch (error) {
      console.error(error);
      throw new AppError("Failed to create stripe session", 500);
    }
  };

  async processRefund(paymentIntentId: string, amount: number): Promise<Stripe.Refund> {
    try {
      console.log('hiii');
      
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount * 100, // amount in cents
        });
        return refund;
    } catch (error) {
        console.error('Stripe Error:', error); // Log the error for debugging
        throw new AppError('Error processing refund with Stripe', 500);
    }
}
  
}

export default StripePayment;