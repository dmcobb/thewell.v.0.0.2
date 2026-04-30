// lib/services/iap.service.ts
import { Platform } from 'react-native';
import { apiClient } from '../api-client';
import { API_ENDPOINTS } from '../constants';

// Constants for IAP
const IAP_PRODUCT_IDS = {
  MONTHLY: 'com.thewell.premium.monthly',
  QUARTERLY: 'com.thewell.premium.quarterly',
  SEMI_ANNUAL: 'com.thewell.premium.semiannual',
} as const;

export type IAPProductId = typeof IAP_PRODUCT_IDS[keyof typeof IAP_PRODUCT_IDS];

export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: number;
  currencyCode: string;
  subscriptionPeriod?: string;
}

export interface IAPPurchaseResult {
  success: boolean;
  message: string;
  transactionId?: string;
  expiresAt?: string;
}

/**
 * In-App Purchase Service for Apple App Store compliance
 * 
 * This service implements StoreKit IAP for iOS to comply with 
 * Apple Guideline 3.1.1 - In-App Purchase requirements.
 * 
 * For iOS, we MUST use StoreKit for digital goods/subscriptions.
 * External payment methods (Square) should only be used for 
 * physical goods or on web/Android platforms.
 */
class IAPService {
  private isAvailable: boolean = false;
  private products: Map<string, IAPProduct> = new Map();

  /**
   * Initialize IAP and check availability
   */
  async initialize(): Promise<boolean> {
    // IAP only available on iOS physical devices
    if (Platform.OS !== 'ios') {
      console.log('[IAPService] IAP only available on iOS');
      return false;
    }

    // Check if we're on a simulator
    if (__DEV__ && !(global as any).nativeModuleExists?.('EXInAppPurchases')) {
      console.log('[IAPService] IAP not available on simulator');
      return false;
    }

    this.isAvailable = true;
    return true;
  }

  /**
   * Check if IAP is available on this device
   */
  isIAPAvailable(): boolean {
    return this.isAvailable && Platform.OS === 'ios';
  }

  /**
   * Get IAP products from App Store
   * Note: This requires expo-in-app-purchases to be installed
   */
  async getProducts(): Promise<IAPProduct[]> {
    if (!this.isIAPAvailable()) {
      return [];
    }

    try {
      // Dynamically import to avoid errors on non-iOS platforms
      const { getProductsAsync } = await import('expo-in-app-purchases');
      
      const productIds = Object.values(IAP_PRODUCT_IDS);
      const result = await getProductsAsync(productIds);
      
      if (result.results) {
        const products: IAPProduct[] = result.results.map((product: any) => ({
          productId: product.productId,
          title: product.title,
          description: product.description,
          price: product.price,
          priceAmountMicros: product.priceAmountMicros || 0,
          currencyCode: product.currencyCode || 'USD',
          subscriptionPeriod: product.subscriptionPeriod,
        }));

        // Cache products
        products.forEach(p => this.products.set(p.productId, p));
        
        return products;
      }
      
      return [];
    } catch (error) {
      console.error('[IAPService] Error getting products:', error);
      return [];
    }
  }

  /**
   * Request a purchase
   */
  async purchaseAsync(productId: string): Promise<IAPPurchaseResult> {
    if (!this.isIAPAvailable()) {
      return {
        success: false,
        message: 'In-App Purchases not available on this device',
      };
    }

    try {
      const { purchaseItemAsync, setPurchaseListener } = await import('expo-in-app-purchases');
      
      return new Promise((resolve) => {
        // Set up purchase listener
        setPurchaseListener(({ responseCode, results, errorCode }) => {
          if (responseCode === 0 && results && results.length > 0) {
            // Purchase successful
            const purchase = results[0];
            
            // Validate receipt with backend
            this.validateReceipt(purchase.orderId, purchase.productId)
              .then((validation) => {
                resolve({
                  success: validation.success,
                  message: validation.message,
                  transactionId: purchase.orderId,
                  expiresAt: validation.expiresAt,
                });
              })
              .catch((err) => {
                resolve({
                  success: false,
                  message: 'Receipt validation failed: ' + err.message,
                });
              });
          } else {
            resolve({
              success: false,
              message: this.getErrorMessage(errorCode || responseCode),
            });
          }
        });

        // Initiate purchase
        purchaseItemAsync(productId);
      });
    } catch (error: any) {
      console.error('[IAPService] Purchase error:', error);
      return {
        success: false,
        message: error.message || 'Purchase failed',
      };
    }
  }

  /**
   * Validate receipt with backend
   */
  private async validateReceipt(
    transactionId: string, 
    productId: string
  ): Promise<{ success: boolean; message: string; expiresAt?: string }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        expires_at?: string;
      }>(API_ENDPOINTS.PAYMENTS.VERIFY_APPLE_RECEIPT, {
        transaction_id: transactionId,
        product_id: productId,
        platform: 'ios',
      });

      return {
        success: response.success,
        message: response.message,
        expiresAt: response.expires_at,
      };
    } catch (error: any) {
      console.error('[IAPService] Receipt validation error:', error);
      return {
        success: false,
        message: 'Failed to validate purchase with server',
      };
    }
  }

  /**
   * Restore previous purchases
   */
   async restorePurchases(): Promise<IAPPurchaseResult[]> {
    if (!this.isIAPAvailable()) {
      return [];
    }

    try {
      const { getPurchaseHistoryAsync, setPurchaseListener } = await import('expo-in-app-purchases');
      
      return new Promise((resolve) => {
        setPurchaseListener(({ responseCode, results, errorCode }) => {
          if (responseCode === 0 && results) {
            // Validate each restored purchase
            const validations = results.map(async (purchase: any) => {
              const validation = await this.validateReceipt(
                purchase.transactionId, 
                purchase.productId
              );
              return {
                success: validation.success,
                message: validation.message,
                transactionId: purchase.transactionId,
                expiresAt: validation.expiresAt,
              };
            });
            
            Promise.all(validations).then(resolve);
          } else {
            resolve([]);
          }
        });

        getPurchaseHistoryAsync();
      });
    } catch (error) {
      console.error('[IAPService] Restore error:', error);
      return [];
    }
  }

  /**
   * Get error message from error code
   */
  private getErrorMessage(errorCode: number): string {
    const errorMessages: Record<number, string> = {
      1: 'User cancelled the purchase',
      2: 'Product not available',
      3: 'Purchase not allowed on this device',
      4: 'Network error - please try again',
      5: 'Payment not valid',
      6: 'Server error - please try again',
      7: 'User is not authorized',
      8: 'Unknown error occurred',
    };
    
    return errorMessages[errorCode] || 'Purchase failed. Please try again.';
  }

  /**
   * Map plan ID to IAP product ID
   */
  getProductIdForPlan(planId: string): string | null {
    const planMap: Record<string, string> = {
      'monthly': IAP_PRODUCT_IDS.MONTHLY,
      'quarterly': IAP_PRODUCT_IDS.QUARTERLY,
      'semi_annual': IAP_PRODUCT_IDS.SEMI_ANNUAL,
    };
    
    return planMap[planId] || null;
  }

  /**
   * Check if we should use IAP for this platform
   */
  shouldUseIAP(): boolean {
    // Only use IAP on iOS for US App Store compliance
    return Platform.OS === 'ios';
  }
}

export const iapService = new IAPService();
export { IAP_PRODUCT_IDS };
