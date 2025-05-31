import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, LogBox, Alert, ScrollView, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from './amplify_outputs.json';
import BrotherPrinterComponent from './components/BrotherPrinterComponent';
import * as ViewShot from 'react-native-view-shot';

// Configure Amplify
Amplify.configure(outputs);

// Ignore specific warnings
LogBox.ignoreLogs([
  'new NativeEventEmitter', // Ignore the warning about the new NativeEventEmitter
]);

export default function App() {
  const [imageUri, setImageUri] = useState<string>('');
  const [isDevClient, setIsDevClient] = useState(false);

  useEffect(() => {
    // Check if we're running in a custom dev client
    // @ts-ignore
    const isCustomClient = global.expo && !global.expo.modules?.ExpoGo;
    setIsDevClient(isCustomClient);
  }, []);

  // Create a sample label image
  const createSampleLabel = async () => {
    try {
      // For this example, we'll use a placeholder image
      // In a real app, you would generate or capture the actual label image
      const sampleImageUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABrklEQVR4nO3dsQ3CMBCG0RMwACtQMgIjMAIjMAojMAIjULICFiCREg6SG+Lgd+/VS/HJn+4K2/M8z4uu63rvAba69B4AauaFkBAQEgJCQkBIXNd+WJZl8zg7l2o553nO/fc6DiREQEgICAkBISEgJNb+i9Xb2zcWq5ZzXsTaMxESAkJCQEgICAkBIbF7F2tLy7srrVXbuVy9xvuOCQEhISAkBISEgJAQEBJjhzRarfE+vT3mhIRrQkBICAgJASEhICQOuosl/qIJASEhICQEhISAkBAQEmP/i1XT7sqhVeu51sbnSSgMdLzXe+PHMQN9RhMCQkJASAgICQEhcdKABieP/D8CEhxvfLz6f8A/TQgICQEhISAkBISEgJDoNyQsVnWy9Xl2LI5SQu3/NW08YTEhICQEhISAkBAQEgJCou2AfDSzI6O9MhESAkJCQEgICAkBIdFvSMRiRScmBISEgJAQEBICQkJASDTcxQKQhWtCQEgICAkBISEgJASEhICQEBASAkJCQEgICAkBISEgJASEhICQEBASAkJCQEgICAkBISEgJASEhICQEBASAkJCQEgICAkBIfEEPJkZnrVGdGMAAAAASUVORK5CYII=';
      setImageUri(sampleImageUri);
      Alert.alert('Success', 'Sample label created');
    } catch (error) {
      console.error('Error creating sample label:', error);
      Alert.alert('Error', 'Failed to create sample label');
    }
  };

  if (!isDevClient) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Brother Printer Integration</Text>
        <Text style={styles.warning}>
          ⚠️ Brother printer functionality requires a custom development client.
        </Text>
        <Text style={styles.info}>
          To use the Brother printer features:
        </Text>
        <Text style={styles.instructions}>
          1. Run: npx expo prebuild{'\n'}
          2. Run: npx expo run:ios{'\n'}
          3. Test on a physical device or simulator
        </Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Brother Printer Integration</Text>
        
        <View style={styles.section}>
          <Button 
            title="Create Sample Label" 
            onPress={createSampleLabel} 
          />
          
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Text style={styles.sectionTitle}>Label Preview:</Text>
              <Image 
                source={{ uri: imageUri }} 
                style={styles.labelPreview}
              />
            </View>
          ) : null}
        </View>

        <BrotherPrinterComponent defaultImageUri={imageUri} />
        
        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  warning: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  info: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  labelPreview: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
});