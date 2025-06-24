import { useState, useCallback } from 'react';

interface AlertConfig {
  title?: string;
  message: string;
  buttonText?: string;
  type?: 'error' | 'success' | 'warning' | 'info';
}

interface UseAlertModalReturn {
  isVisible: boolean;
  alertConfig: AlertConfig;
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

export const useAlertModal = (): UseAlertModalReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    message: '',
  });

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
    setIsVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    alertConfig,
    showAlert,
    hideAlert,
  };
};