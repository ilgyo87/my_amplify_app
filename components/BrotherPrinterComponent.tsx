import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet
} from 'react-native';
import { labelPrinter } from '../services/LabelPrinterService';

interface BrotherPrinterComponentProps {
  defaultImageUri: string;
}

const BrotherPrinterComponent: React.FC<BrotherPrinterComponentProps> = ({
  defaultImageUri = '',
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle print action
  const handlePrint = async () => {
    if (!defaultImageUri) {
      setError('No image to print');
      return;
    }

    try {
      setIsPrinting(true);
      setError(null);
      
      console.log('Sharing label for printing...');
      await labelPrinter.shareLabel(defaultImageUri);
      console.log('Label shared successfully');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to share label';
      console.error('Print error:', error);
      setError(errorMessage);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Brother Label Printer</Text>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      <TouchableOpacity
        style={[
          styles.button,
          isPrinting && styles.buttonDisabled
        ]}
        onPress={handlePrint}
        disabled={isPrinting}
      >
        <Text style={styles.buttonText}>
          {isPrinting ? 'Sharing...' : 'Share Label'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#90C6FF',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  list: {
    flex: 1,
  },
  printerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  selectedPrinter: {
    backgroundColor: '#F2F2F7',
  },
  printerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  printerAddress: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  noPrintersText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 16,
  },
});

export default BrotherPrinterComponent;
