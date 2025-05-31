import { Platform, NativeEventEmitter } from 'react-native';
import { 
  discoverPrinters, 
  printImage, 
  LabelSize
} from '@w3lcome/react-native-brother-printers';
import { NativeModules } from 'react-native';

// Import the native module
const { RNBrotherPrinters } = NativeModules;

// Define the Printer interface based on the library's Device type
export interface Printer {
  ipAddress: string;
  modelName: string;  // Required by the library
  macAddress: string;  // Required by the library
  serialNumber: string; // Required by the library
  nodeName: string;    // Required by the library
  location?: string;   // Optional
  printerName?: string; // Optional
  port?: number;       // Optional port number
  protocol?: string;   // Optional protocol
}

export interface PrinterDiscoveryOptions {
  V6?: boolean;
  timeout?: number;
}

class LabelPrinterService {
  private selectedPrinter: Printer | null = null;
  private discoveryInProgress: boolean = false;

  constructor() {}

  /**
   * Discover available Brother printers on the network
   * @returns Promise that resolves with array of discovered printers
   */
  async discoverAvailablePrinters(): Promise<Printer[]> {
    if (this.discoveryInProgress) {
      console.log('Discovery already in progress');
      return [];
    }

    return new Promise((resolve) => {
      try {
        this.discoveryInProgress = true;
        console.log('Starting printer discovery...');
        
        const options: PrinterDiscoveryOptions = {
          V6: false, // IPv6 support
          timeout: 10 // Reduced timeout to 10 seconds
        };

        // Set a timeout to ensure we don't hang if no printers are found
        const discoveryTimeout = setTimeout(() => {
          console.log('Printer discovery timed out');
          this.discoveryInProgress = false;
          resolve([]);
        }, 15000); // 15 seconds total timeout

        // Check if the native module is available
        if (!RNBrotherPrinters) {
          console.error('RNBrotherPrinters native module is not available');
          clearTimeout(discoveryTimeout);
          this.discoveryInProgress = false;
          resolve([]);
          return;
        }

        // Set up a one-time listener for printer discovery
        const eventEmitter = new NativeEventEmitter(RNBrotherPrinters);
        const subscription = eventEmitter.addListener('onDiscoverPrinters', (printers: Printer[]) => {
          console.log('Discovered printers:', printers);
          clearTimeout(discoveryTimeout);
          subscription.remove();
          this.discoveryInProgress = false;
          resolve(printers);
        });

        // Start the discovery
        discoverPrinters(options);

        // Cleanup function in case the component unmounts
        return () => {
          clearTimeout(discoveryTimeout);
          subscription.remove();
          this.discoveryInProgress = false;
        };
      } catch (error) {
        console.error('Error in printer discovery:', error);
        this.discoveryInProgress = false;
        resolve([]);
      }
    });
  }

  /**
   * Set the currently selected printer
   * @param printer - The printer to select
   */
  setSelectedPrinter(printer: Printer | null) {
    this.selectedPrinter = printer;
    console.log('Selected printer:', printer);
  }

  /**
   * Get the currently selected printer
   * @returns The selected printer or null
   */
  getSelectedPrinter(): Printer | null {
    return this.selectedPrinter;
  }

  /**
   * Print a label image to the selected printer
   * @param imageUri - The URI of the label image to print
   * @returns Promise that resolves when printing is complete
   */
  async printLabel(imageUri: string): Promise<void> {
    if (!this.selectedPrinter) {
      throw new Error('No printer selected');
    }

    if (!imageUri) {
      throw new Error('No image URI provided');
    }

    try {
      console.log('Printing to:', this.selectedPrinter.modelName, 'at', this.selectedPrinter.ipAddress);
      
      // Print the image with supported options
      await printImage(this.selectedPrinter, imageUri, {
        labelSize: LabelSize.LabelSizeRollW62RB, // 62mm roll
        autoCut: true,
        isHighQuality: true // Using high quality for better print results
      });
      
      console.log('Print job sent successfully');
    } catch (error) {
      console.error('Error printing label:', error);
      throw error;
    }
  }

  /**
   * Share a label image (fallback method using native sharing)
   * This is a fallback for when direct printing isn't available
   * @param imageUri - The URI of the label image to share
   * @returns Promise that resolves when sharing is complete
   */
  async shareLabel(imageUri: string): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        // For iOS, we can use the native share sheet
        const { Share } = require('react-native');
        
        const result = await Share.share({
          url: imageUri,
          title: 'Print Label',
          message: 'Print this label using Brother iPrint&Label app'
        });

        if (result.action === Share.sharedAction) {
          console.log('Label shared successfully');
        } else if (result.action === Share.dismissedAction) {
          console.log('Share dismissed');
        }
      } else {
        throw new Error('Share not implemented for this platform');
      }
    } catch (error) {
      console.error('Error sharing label:', error);
      throw error;
    }
  }

  /**
   * Check if printing is supported on this device
   * @returns Whether printing is supported
   */
  isPrintingSupported(): boolean {
    // The Brother printer SDK is only available in custom dev clients
    // It won't work in Expo Go
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }
}

export const labelPrinter = new LabelPrinterService();