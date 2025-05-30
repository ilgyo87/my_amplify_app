import { Share, Platform } from 'react-native';
import { NativeModules } from 'react-native';

// Define the Printer interface
export interface Printer {
  name: string;
  address: string;
  port: number;
  type: string;
}

class LabelPrinterService {
  private config = {
    labelSize: '62', // 62mm label width
    labelType: 'standard',
  };

  constructor() {}

  /**
   * Share a label image to Brother iPrint&Label app
   * @param imageUri - The URI of the label image to print
   * @returns Promise that resolves when sharing is complete
   */
  async shareLabel(imageUri: string): Promise<void> {
    try {
      // Use the native module to share directly to Brother iPrint&Label
      await NativeModules.BrotherSDKBridge.shareLabel(imageUri);
      console.log('Label shared successfully');
    } catch (error) {
      console.error('Error sharing label:', error);
      throw error;
    }
  }
}

export const labelPrinter = new LabelPrinterService();
