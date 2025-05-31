import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  NativeEventEmitter,
  NativeModules,
  Platform
} from 'react-native';
import { labelPrinter, Printer } from '../services/LabelPrinterService';

interface BrotherPrinterComponentProps {
  defaultImageUri: string;
}

const BrotherPrinterComponent: React.FC<BrotherPrinterComponentProps> = ({
  defaultImageUri = '',
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);

  const discoverPrinters = async () => {
    try {
      setIsDiscovering(true);
      setError(null);
      setPrinters([]);
      
      console.log('Starting printer discovery...');
      const discoveredPrinters = await labelPrinter.discoverAvailablePrinters();
      
      if (discoveredPrinters.length === 0) {
        setError('No printers found. Make sure your Brother printer is on the same network.');
      } else {
        setPrinters(discoveredPrinters);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to discover printers. Please try again.';
      console.error('Discovery error:', error);
      setError(errorMessage);
    } finally {
      setIsDiscovering(false);
    }
  };

  useEffect(() => {
    // Initial printer discovery when component mounts
    discoverPrinters();
  }, []);

  // Handle printer selection
  const handleSelectPrinter = (printer: Printer) => {
    setSelectedPrinter(printer);
    labelPrinter.setSelectedPrinter(printer);
    setError(null);
  };

  // Handle print action
  const handlePrint = async () => {
    if (!selectedPrinter) {
      setError('Please select a printer first');
      return;
    }

    if (!defaultImageUri) {
      setError('No image to print');
      return;
    }

    try {
      setIsPrinting(true);
      setError(null);
      
      console.log('Printing label...');
      await labelPrinter.printLabel(defaultImageUri);
      
      Alert.alert('Success', 'Label printed successfully');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to print label';
      console.error('Print error:', error);
      setError(errorMessage);
      Alert.alert('Print Error', errorMessage);
    } finally {
      setIsPrinting(false);
    }
  };

  // Handle share action (fallback)
  const handleShare = async () => {
    if (!defaultImageUri) {
      setError('No image to share');
      return;
    }

    try {
      setError(null);
      await labelPrinter.shareLabel(defaultImageUri);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to share label';
      console.error('Share error:', error);
      setError(errorMessage);
    }
  };

  // Render printer item
  const renderPrinterItem = ({ item }: { item: Printer }) => (
    <TouchableOpacity
      style={[
        styles.printerItem,
        selectedPrinter?.ipAddress === item.ipAddress && styles.selectedPrinter
      ]}
      onPress={() => handleSelectPrinter(item)}
    >
      <Text style={styles.printerName}>{item.modelName || 'Unknown Model'}</Text>
      <Text style={styles.printerAddress}>IP: {item.ipAddress}</Text>
      {item.macAddress && <Text style={styles.printerAddress}>MAC: {item.macAddress}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Brother Label Printer</Text>

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.button, isDiscovering && styles.buttonDisabled]}
          onPress={discoverPrinters}
          disabled={isDiscovering}
        >
          {isDiscovering ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Discover Printers</Text>
          )}
        </TouchableOpacity>
      </View>

      {printers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Printers:</Text>
          <FlatList
            data={printers}
            renderItem={renderPrinterItem}
            keyExtractor={(item) => item.ipAddress}
            style={styles.printerList}
          />
        </View>
      )}

      {selectedPrinter && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Printer:</Text>
          <Text style={styles.selectedPrinterText}>
            {selectedPrinter.modelName} ({selectedPrinter.ipAddress})
          </Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.printButton,
            (!selectedPrinter || isPrinting) && styles.buttonDisabled
          ]}
          onPress={handlePrint}
          disabled={!selectedPrinter || isPrinting}
        >
          {isPrinting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Print Label</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.shareButton]}
          onPress={handleShare}
        >
          <Text style={styles.buttonText}>Share Label</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonDisabled: {
    backgroundColor: '#90C6FF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  printButton: {
    flex: 1,
    marginRight: 5,
  },
  shareButton: {
    flex: 1,
    marginLeft: 5,
    backgroundColor: '#34C759',
  },
  printerList: {
    maxHeight: 200,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  printerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  selectedPrinter: {
    backgroundColor: '#E3F2FD',
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
  selectedPrinterText: {
    fontSize: 14,
    color: '#007AFF',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
});

export default BrotherPrinterComponent;