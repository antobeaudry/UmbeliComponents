/**
 * Simple toast hook stub for compatibility with AuthProvider
 * Replace with a full toast implementation as needed
 */

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    // Simple console log for now - replace with actual toast UI
    if (options.variant === 'destructive') {
      console.error(`[Toast Error] ${options.title}: ${options.description}`);
    } else {
      console.log(`[Toast] ${options.title}: ${options.description}`);
    }
  };

  return { toast };
}
