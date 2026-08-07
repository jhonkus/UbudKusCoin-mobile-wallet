import React, {createContext, useContext, useState, useCallback, ReactNode} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const ToastProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, {id, type, message}]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{showToast}}>
      {children}
      <View style={styles.toastContainer} pointerEvents="none">
        {toasts.map(toast => (
          <View
            key={toast.id}
            style={[
              styles.toast,
              toast.type === 'success' && styles.toastSuccess,
              toast.type === 'error' && styles.toastError,
              toast.type === 'info' && styles.toastInfo,
            ]}>
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  toastSuccess: {backgroundColor: '#2e7d32'},
  toastError: {backgroundColor: '#c62828'},
  toastInfo: {backgroundColor: '#1565c0'},
  toastText: {color: '#ffffff', fontWeight: 'bold', fontSize: 13},
});
