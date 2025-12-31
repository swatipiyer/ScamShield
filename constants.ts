
import { SampleMessage } from './types';

export const SAMPLE_MESSAGES: SampleMessage[] = [
  {
    id: 'bank',
    label: 'Bank Account',
    text: "Dear Customer, Your HDFC Bank account will be blocked within 24 hours due to suspicious activity. Click here immediately to verify: bit.ly/hdfc-verify-2024. Call 9876543210 for assistance. - HDFC Bank Security Team"
  },
  {
    id: 'prize',
    label: 'Prize/Lottery',
    text: "Congratulations! You've won ₹25 Lakhs in the Kaun Banega Crorepati lottery! To claim your prize, send your Aadhaar, PAN, and bank details to kbc.winner@gmail.com within 48 hours. Reference: KBC-2024-7789"
  },
  {
    id: 'tax',
    label: 'Tax Refund',
    text: "URGENT: Your Income Tax refund of ₹42,350 is pending. Verify your details to process refund: incometax-refund.com/verify. Failure to respond will result in refund cancellation. - Income Tax Department"
  }
];
