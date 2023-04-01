import axios from 'axios';

import { showAlert, hideAlert } from './alerts';
export const bookTour = async (tourId) => {
  //get session from server
  try {
    const stripe = Stripe(
      'pk_test_51LltdXSC7daSehImyGj0ELcavZKAgFq7mEw1eHGTENHRB0sQfxxduRj7hKZw8JdP5vK3Ha9TrUSsZvqsGYReEL1i00gpYTTPUq'
    );
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    //create checkout form +charge credeit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    showAlert('error', error);
  }
};
