import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Card, Button } from '@umbeli/ui';
import { 
  CheckmarkOutline, 
  CardOutline, 
  CloseOutline, 
  TrashOutline,
  DownloadOutline,
  AddOutline 
} from 'react-ionicons';
import { PaymentForm } from './PaymentForm';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  created: string;
  pdfUrl: string;
}

interface Subscription {
  plan: string;
  status: string;
  periodEnd: string | null;
  cancelAtPeriodEnd?: boolean;
  limits: {
    postsAnalyzed: number;
    workspaces: number;
    aiRewrites: number;
  };
  planDetails: Plan;
}

interface BillingApi {
  getPlans: () => Promise<{ plans: Plan[] }>;
  getPaymentMethods: () => Promise<{ paymentMethods: PaymentMethod[] }>;
  getInvoices: (limit: number) => Promise<{ invoices: Invoice[] }>;
  createSetupIntent: () => Promise<{ clientSecret: string; customerId: string }>;
  subscribeInApp: (planId: string, paymentMethodId: string) => Promise<{ subscriptionId: string; status: string; clientSecret?: string }>;
  cancelSubscription: (immediately: boolean) => Promise<{ success: boolean; canceledImmediately: boolean }>;
  resumeSubscription: () => Promise<{ success: boolean }>;
  changePlan: (planId: string) => Promise<{ success: boolean; newPlan: string }>;
  deletePaymentMethod: (paymentMethodId: string) => Promise<{ success: boolean }>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<{ success: boolean }>;
}

interface BillingManagerProps {
  subscription: Subscription | null;
  onSubscriptionChange: () => void;
  api: BillingApi;
  stripePublishableKey: string;
}

export function BillingManager({ subscription, onSubscriptionChange, api, stripePublishableKey }: BillingManagerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'payment-methods' | 'invoices' | 'upgrade'>('overview');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

  const fetchPlans = useCallback(async () => {
    try {
      const res = await api.getPlans();
      setPlans(res.plans);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    }
  }, [api]);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const res = await api.getPaymentMethods();
      setPaymentMethods(res.paymentMethods);
    } catch (err) {
      console.error('Failed to fetch payment methods:', err);
    }
  }, [api]);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getInvoices(10);
      setInvoices(res.invoices);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchPlans();
    fetchPaymentMethods();
  }, [fetchPlans, fetchPaymentMethods]);

  useEffect(() => {
    if (activeTab === 'invoices') {
      fetchInvoices();
    }
  }, [activeTab, fetchInvoices]);

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId);
    setLoading(true);
    try {
      if (paymentMethods.length > 0) {
        const defaultMethod = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0];
        const res = await api.subscribeInApp(planId, defaultMethod.id);
        if (res.status === 'active' || res.status === 'trialing') {
          onSubscriptionChange();
          setActiveTab('overview');
        } else if (res.clientSecret) {
          setClientSecret(res.clientSecret);
          setShowPaymentForm(true);
        }
      } else {
        const res = await api.createSetupIntent();
        setClientSecret(res.clientSecret);
        setShowPaymentForm(true);
      }
    } catch (err) {
      console.error('Failed to start upgrade:', err);
      alert('Erreur lors de la mise à niveau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    setActionLoading(`change-${planId}`);
    try {
      await api.changePlan(planId);
      onSubscriptionChange();
    } catch (err) {
      console.error('Failed to change plan:', err);
      alert('Erreur lors du changement de plan.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async (immediately: boolean = false) => {
    const message = immediately 
      ? 'Êtes-vous sûr de vouloir annuler immédiatement ? Vous perdrez l\'accès aux fonctionnalités Pro.'
      : 'Êtes-vous sûr de vouloir annuler ? Vous conserverez l\'accès jusqu\'à la fin de la période.';
    
    if (!confirm(message)) return;

    setActionLoading('cancel');
    try {
      await api.cancelSubscription(immediately);
      onSubscriptionChange();
    } catch (err) {
      console.error('Failed to cancel:', err);
      alert('Erreur lors de l\'annulation.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async () => {
    setActionLoading('resume');
    try {
      await api.resumeSubscription();
      onSubscriptionChange();
    } catch (err) {
      console.error('Failed to resume:', err);
      alert('Erreur lors de la reprise de l\'abonnement.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddPaymentMethod = async () => {
    setLoading(true);
    try {
      const res = await api.createSetupIntent();
      setClientSecret(res.clientSecret);
      setShowPaymentForm(true);
      setSelectedPlan(null);
    } catch (err) {
      console.error('Failed to create setup intent:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm('Supprimer cette méthode de paiement ?')) return;
    
    setActionLoading(`delete-${id}`);
    try {
      await api.deletePaymentMethod(id);
      setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
    } catch (err) {
      console.error('Failed to delete payment method:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    setActionLoading(`default-${id}`);
    try {
      await api.setDefaultPaymentMethod(id);
      setPaymentMethods(prev => prev.map(pm => ({
        ...pm,
        isDefault: pm.id === id,
      })));
    } catch (err) {
      console.error('Failed to set default:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setClientSecret(null);
    setSelectedPlan(null);
    fetchPaymentMethods();
    onSubscriptionChange();
  };

  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'agency';
  const currentPlan = subscription?.planDetails || { 
    name: 'Gratuit', 
    price: 0, 
    features: ['10 posts analysés', 'Feedback basique', 'Streak tracking', '1 workspace'] 
  };

  const renderOverview = () => (
    <div className="umbeli-billing__overview">
      <div className="umbeli-billing__current-plan">
        <div className="umbeli-billing__plan-header">
          <div>
            <h4>Plan {currentPlan.name}</h4>
            <span className="umbeli-billing__price">
              {currentPlan.price === 0 ? 'Gratuit' : `${currentPlan.price}€/mois`}
            </span>
          </div>
          <span className={`umbeli-billing__status umbeli-billing__status--${subscription?.status || 'active'}`}>
            {subscription?.status === 'active' ? 'Actif' : 
             subscription?.status === 'past_due' ? 'Paiement en retard' :
             subscription?.status === 'canceled' ? 'Annulé' : 'Actif'}
          </span>
        </div>

        {subscription?.periodEnd && (
          <p className="umbeli-billing__renewal">
            {subscription.status === 'canceled' || subscription.cancelAtPeriodEnd
              ? `Accès jusqu'au ${new Date(subscription.periodEnd).toLocaleDateString('fr-FR')}`
              : `Prochain renouvellement: ${new Date(subscription.periodEnd).toLocaleDateString('fr-FR')}`
            }
          </p>
        )}

        <div className="umbeli-billing__features">
          <h5>Fonctionnalités incluses</h5>
          <ul>
            {currentPlan.features.map((feature, i) => (
              <li key={i}>
                <CheckmarkOutline color="#16a34a" width="16px" height="16px" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {subscription?.limits && (
          <div className="umbeli-billing__limits">
            <h5>Limites d'utilisation</h5>
            <div className="umbeli-billing__limits-grid">
              <div className="umbeli-billing__limit">
                <span>Posts analysés</span>
                <strong>{subscription.limits.postsAnalyzed === -1 ? 'Illimité' : subscription.limits.postsAnalyzed}</strong>
              </div>
              <div className="umbeli-billing__limit">
                <span>Workspaces</span>
                <strong>{subscription.limits.workspaces === -1 ? 'Illimité' : subscription.limits.workspaces}</strong>
              </div>
              <div className="umbeli-billing__limit">
                <span>Réécritures IA</span>
                <strong>{subscription.limits.aiRewrites === -1 ? 'Illimité' : subscription.limits.aiRewrites}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="umbeli-billing__actions">
          {!isPro ? (
            <Button variant="primary" onClick={() => setActiveTab('upgrade')}>
              Passer à Pro
            </Button>
          ) : (
            <>
              {subscription?.cancelAtPeriodEnd ? (
                <Button 
                  variant="primary" 
                  onClick={handleResumeSubscription}
                  disabled={actionLoading === 'resume'}
                >
                  {actionLoading === 'resume' ? 'Chargement...' : 'Reprendre l\'abonnement'}
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={() => handleCancelSubscription(false)}
                  disabled={actionLoading === 'cancel'}
                >
                  {actionLoading === 'cancel' ? 'Chargement...' : 'Annuler l\'abonnement'}
                </Button>
              )}
              <Button variant="secondary" onClick={() => setActiveTab('upgrade')}>
                Changer de plan
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="umbeli-billing__payment-methods">
      <div className="umbeli-billing__section-header">
        <h4>Méthodes de paiement</h4>
        <Button variant="secondary" size="sm" onClick={handleAddPaymentMethod} disabled={loading}>
          <AddOutline color="currentColor" width="16px" height="16px" />
          Ajouter
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="umbeli-billing__empty">
          <CardOutline color="#9ca3af" width="48px" height="48px" />
          <p>Aucune méthode de paiement enregistrée</p>
          <Button variant="primary" onClick={handleAddPaymentMethod}>
            Ajouter une carte
          </Button>
        </div>
      ) : (
        <div className="umbeli-billing__cards-list">
          {paymentMethods.map(pm => (
            <div key={pm.id} className="umbeli-billing__card-item">
              <div className="umbeli-billing__card-info">
                <CardOutline color="#030174" width="24px" height="24px" />
                <div>
                  <span className="umbeli-billing__card-brand">{pm.brand.toUpperCase()}</span>
                  <span className="umbeli-billing__card-number">•••• {pm.last4}</span>
                  <span className="umbeli-billing__card-expiry">
                    Expire {pm.expMonth.toString().padStart(2, '0')}/{pm.expYear}
                  </span>
                </div>
                {pm.isDefault && (
                  <span className="umbeli-billing__default-badge">Par défaut</span>
                )}
              </div>
              <div className="umbeli-billing__card-actions">
                {!pm.isDefault && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSetDefaultPaymentMethod(pm.id)}
                    disabled={actionLoading === `default-${pm.id}`}
                  >
                    Définir par défaut
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeletePaymentMethod(pm.id)}
                  disabled={actionLoading === `delete-${pm.id}`}
                >
                  <TrashOutline color="#ef4444" width="16px" height="16px" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderInvoices = () => (
    <div className="umbeli-billing__invoices">
      <h4>Historique des factures</h4>

      {loading ? (
        <div className="umbeli-billing__loading">Chargement...</div>
      ) : invoices.length === 0 ? (
        <div className="umbeli-billing__empty">
          <p>Aucune facture disponible</p>
        </div>
      ) : (
        <div className="umbeli-billing__invoices-list">
          {invoices.map(invoice => (
            <div key={invoice.id} className="umbeli-billing__invoice-item">
              <div className="umbeli-billing__invoice-info">
                <span className="umbeli-billing__invoice-number">{invoice.number}</span>
                <span className="umbeli-billing__invoice-date">
                  {new Date(invoice.created).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="umbeli-billing__invoice-amount">
                {invoice.amount.toFixed(2)} {invoice.currency.toUpperCase()}
              </div>
              <span className={`umbeli-billing__invoice-status umbeli-billing__invoice-status--${invoice.status}`}>
                {invoice.status === 'paid' ? 'Payée' : invoice.status === 'open' ? 'En attente' : invoice.status}
              </span>
              {invoice.pdfUrl && (
                <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer" className="umbeli-billing__invoice-download">
                  <DownloadOutline color="#030174" width="18px" height="18px" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUpgrade = () => (
    <div className="umbeli-billing__upgrade">
      <h4>Choisir un plan</h4>
      <div className="umbeli-billing__plans-grid">
        {plans.map(plan => (
          <Card 
            key={plan.id} 
            className={`umbeli-billing__plan-card ${plan.popular ? 'umbeli-billing__plan-card--popular' : ''} ${subscription?.plan === plan.id ? 'umbeli-billing__plan-card--current' : ''}`}
          >
            {plan.popular && <span className="umbeli-billing__popular-badge">Populaire</span>}
            <h5>{plan.name}</h5>
            <div className="umbeli-billing__plan-price">
              {plan.price === 0 ? (
                <span>Gratuit</span>
              ) : (
                <>
                  <span className="umbeli-billing__price-amount">{plan.price}€</span>
                  <span className="umbeli-billing__price-period">/mois</span>
                </>
              )}
            </div>
            <ul className="umbeli-billing__plan-features">
              {plan.features.map((feature, i) => (
                <li key={i}>
                  <CheckmarkOutline color="#16a34a" width="14px" height="14px" />
                  {feature}
                </li>
              ))}
            </ul>
            {subscription?.plan === plan.id ? (
              <Button variant="secondary" disabled>
                Plan actuel
              </Button>
            ) : plan.id === 'free' ? (
              isPro ? (
                <Button 
                  variant="ghost" 
                  onClick={() => handleCancelSubscription(true)}
                  disabled={actionLoading === 'cancel'}
                >
                  Rétrograder
                </Button>
              ) : (
                <Button variant="secondary" disabled>
                  Plan actuel
                </Button>
              )
            ) : isPro && subscription?.plan !== plan.id ? (
              <Button 
                variant="primary" 
                onClick={() => handleChangePlan(plan.id)}
                disabled={actionLoading === `change-${plan.id}`}
              >
                {actionLoading === `change-${plan.id}` ? 'Chargement...' : 'Changer'}
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading}
              >
                {loading && selectedPlan === plan.id ? 'Chargement...' : 'Choisir'}
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="umbeli-billing">
      <div className="umbeli-billing__tabs">
        <button 
          className={`umbeli-billing__tab ${activeTab === 'overview' ? 'umbeli-billing__tab--active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Aperçu
        </button>
        <button 
          className={`umbeli-billing__tab ${activeTab === 'payment-methods' ? 'umbeli-billing__tab--active' : ''}`}
          onClick={() => setActiveTab('payment-methods')}
        >
          Paiement
        </button>
        <button 
          className={`umbeli-billing__tab ${activeTab === 'invoices' ? 'umbeli-billing__tab--active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          Factures
        </button>
        <button 
          className={`umbeli-billing__tab ${activeTab === 'upgrade' ? 'umbeli-billing__tab--active' : ''}`}
          onClick={() => setActiveTab('upgrade')}
        >
          Plans
        </button>
      </div>

      <div className="umbeli-billing__content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'payment-methods' && renderPaymentMethods()}
        {activeTab === 'invoices' && renderInvoices()}
        {activeTab === 'upgrade' && renderUpgrade()}
      </div>

      {showPaymentForm && clientSecret && stripePromise && (
        <div className="umbeli-billing__modal-overlay">
          <Card className="umbeli-billing__modal">
            <div className="umbeli-billing__modal-header">
              <h4>{selectedPlan ? 'Finaliser l\'abonnement' : 'Ajouter une carte'}</h4>
              <button 
                className="umbeli-billing__modal-close"
                onClick={() => {
                  setShowPaymentForm(false);
                  setClientSecret(null);
                }}
              >
                <CloseOutline color="currentColor" width="24px" height="24px" />
              </button>
            </div>
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#030174',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <PaymentForm
                mode={selectedPlan ? 'subscription' : 'one-time'}
                planId={selectedPlan || undefined}
                onSuccess={handlePaymentSuccess}
                onCancel={() => {
                  setShowPaymentForm(false);
                  setClientSecret(null);
                }}
              />
            </Elements>
          </Card>
        </div>
      )}
    </div>
  );
}

export default BillingManager;
