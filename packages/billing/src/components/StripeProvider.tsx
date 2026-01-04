import { ReactNode } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function initStripe(publishableKey: string): Promise<Stripe | null> {
  if (!stripePromise && publishableKey) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise || Promise.resolve(null);
}

interface StripeProviderProps {
  children: ReactNode;
  publishableKey: string;
}

export function StripeProvider({ children, publishableKey }: StripeProviderProps) {
  if (!publishableKey) {
    console.warn('Stripe publishable key not configured');
    return <>{children}</>;
  }

  const stripe = initStripe(publishableKey);

  return (
    <Elements 
      stripe={stripe}
      options={{
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#030174',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}

export { stripePromise };
