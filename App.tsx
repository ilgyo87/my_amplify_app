import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, LogBox, Alert } from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs([
  'new NativeEventEmitter', // Ignore the warning about the new NativeEventEmitter
]);

export default function App() {
  const handlePrintTest = () => {
    Alert.alert('Printer Test', 'Printer test would run here in development client');
  };

  return (
    <View style={styles.container}>
      <Text>Welcome to My Amplify App</Text>
      <Text>Running in Expo Go</Text>
      <Button 
        title="Test Printer (Dev Client Only)" 
        onPress={handlePrintTest} 
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
});
