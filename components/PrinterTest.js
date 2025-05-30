import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { 
  discoverPrinters, 
  printImage, 
  LabelSize,
  NativeEventEmitter,
  NativeModules 
} from '@w3lcome/react-native-brother-printers';

export default function PrinterTest() {
  const [printers, setPrinters] = useState([]);
  const [status, setStatus] = useState('Ready');
  const [selectedPrinter, setSelectedPrinter] = useState(null);

  useEffect(() => {
    // Set up event listener for discovered printers
    const eventEmitter = new NativeEventEmitter(NativeModules.RNBrotherPrinters);
    const subscription = eventEmitter.addListener('onDiscoverPrinters', (discoveredPrinters) => {
      console.log('Discovered printers:', discoveredPrinters);
      setPrinters(discoveredPrinters);
    });

    // Clean up on unmount
    return () => {
      subscription.remove();
    };
  }, []);

  const handleDiscoverPrinters = () => {
    setStatus('Discovering printers...');
    setPrinters([]);
    
    discoverPrinters({
      V6: false, // Set to true if you need IPv6 support
      timeout: 10 // Discovery timeout in seconds
    }).catch(error => {
      console.error('Discovery error:', error);
      setStatus(`Error: ${error.message}`);
    });
  };

  const handlePrintTest = async () => {
    if (!selectedPrinter) {
      setStatus('Please select a printer first');
      return;
    }

    setStatus('Printing test page...');
    
    try {
      // Create a simple test image (red square) as a data URI
      const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAB0UlEQVR4nO3dQU7DMBBAUZtK3P8tO4oQqoQlHvsk9z1pY8eTjC2n2UzTNA0xHt8e4uX9+Wf7/XqMl/fneHp9jMfXh3h8eYiH5/t4eL6P+6e7uHu8jbuHm7i9v4nbu+u4ub2K69vLuLq5iMvri7i4Po/zq7M4uzqNs8uTOL04jpPzozg+O4yjs4M4PN2Pw5O92D/ejf2jndg73I7dg63YOdiM7f2N2Npbi83d1djYWYm17eXY2FmO9Z3lWNteirWtxVjdWoiVzflY3piL5fW5WFqfjcW12VhYm4mF1ZmYX52J+ZXpmF+ZjrmVqZhdnozZpcmYWZqI6cXxmF4Yi6mFsZicH42J+ZEYnxuO8bmhGJsdjNHZgRiZ6Y/h6b4YmuqNwcm7GJjojv7xrugb64ze0Y7oGWmP7uG26Bpqjc6hlugYbI72gaZoG2iM1v7GaOlriObe+mjqqYvG7rpouKqN+ss7qL2oierz6qg6q4rK08qoOKmI8uPyKDsqjdLDkig5KI7i/aIo2iuMwt2CKNjJj/ztvMjbyo3czZzI2ciO7PXsyFzLiozVzEhfyYj05fRIW0qL1MVUSF1IieT55EiaS4rE2cRImEmI+On4iJuKi9jJ2IiZiI3o8ZiIHouOqNHoiBqJjsjhaIgYioqIwcgIH4iIsP6ICO0Lj5De8AjuCYvA7tAI6AqJgM7g8O8IDr/2oPBtCwqf1qDwaQkK7+ag8GoKCs/GwPBoCAz3+sBwqwsM19rAcKkJDOeawHCqDgzHqsBwqAwM+4rAsCsPDNuywLAtDQybksCwLg4Mq6LAsCwMDIuCwDDLDwyz/MAwyQsMk9zAMM4JDKPs/x8yA+O/7/8A6HcT8U8JvC4AAAAASUVORK5CYII=';

      await printImage(selectedPrinter, testImage, {
        labelSize: LabelSize.LabelSizeRollW62RB
      });
      
      setStatus('Print job sent successfully!');
    } catch (error) {
      console.error('Print error:', error);
      setStatus(`Print failed: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Brother Printer Test</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Discover Printers" 
          onPress={handleDiscoverPrinters}
        />
        
        <Button 
          title="Print Test Page" 
          onPress={handlePrintTest}
          disabled={!selectedPrinter}
        />
      </View>
      
      <Text style={styles.status}>Status: {status}</Text>
      
      <ScrollView style={styles.printerList}>
        {printers.map((printer, index) => (
          <View 
            key={index} 
            style={[
              styles.printerItem,
              selectedPrinter?.ipAddress === printer.ipAddress && styles.selectedPrinter
            ]}
            onTouchEnd={() => setSelectedPrinter(printer)}
          >
            <Text style={styles.printerName}>{printer.modelName || 'Unknown Model'}</Text>
            <Text style={styles.printerIp}>{printer.ipAddress}</Text>
            <Text style={styles.printerMac}>{printer.macAddress}</Text>
            <Text style={styles.printerModel}>Serial: {printer.serialNumber}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  status: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    textAlign: 'center',
  },
  printerList: {
    flex: 1,
  },
  printerItem: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedPrinter: {
    borderColor: 'blue',
    borderWidth: 2,
    backgroundColor: '#e6f2ff',
  },
  printerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  printerIp: {
    color: '#666',
    marginBottom: 3,
  },
  printerMac: {
    color: '#666',
    marginBottom: 3,
  },
  printerModel: {
    color: '#666',
    fontStyle: 'italic',
  },
});
