import api from './axios.js';

export const stripeApi = {
  /**
   * Create a Stripe Checkout Session.
   * Returns { url: string } — redirect the browser to that URL.
   */
  createCheckoutSession: (data) => api.post('/stripe/create-session', data),
};
