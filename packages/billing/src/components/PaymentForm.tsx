import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@umbeli/ui';

interface PaymentFormProps {
  mode: 'subscription' | 'one-time';
  planId?: string;
  amount?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentForm({ mode, planId: _planId, amount, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'Une erreur est survenue');
        setLoading(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/parametres?payment=success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Échec du paiement');
      } else {
        onSuccess();
      }
    } catch (_err) {
      setError('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="umbeli-payment-form">
      <PaymentElement 
        options={{
          layout: 'tabs',
        }}
      />
      
      {error && (
        <div className="umbeli-payment-form__error">
          {error}
        </div>
      )}

      <div className="umbeli-payment-form__actions">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!stripe || loading}
        >
          {loading ? 'Traitement...' : mode === 'subscription' ? 'S\'abonner' : `Payer ${amount}€`}
        </Button>
      </div>
    </form>
  );
}

export default PaymentForm;
