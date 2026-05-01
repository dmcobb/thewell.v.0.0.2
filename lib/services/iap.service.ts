// lib/services/iap.service.ts - RevenueCat Version (Expo SDK 54 Compatible)
// Uses react-native-purchases instead of deprecated expo-in-app-purchases

import { Platform } from 'react-native';
import Purchases, { 
  PurchasesPackage, 
  CustomerInfo,
  PURCHASES_ERROR_CODE
} from 'react-native-purchases';
import { apiClient } from '../api-client';
import { API_ENDPOINTS } from '../constants';

// ============================================================================
// Constants & Configuration
// ============================================================================

const REVENUECAT_API_KEYS = {
  ios: process.env.REVENUECAT_IOS_API_KEY || '',
  android: process.env.REVENUECAT_ANDROID_API_KEY || '',
};

export const IAP_PRODUCT_IDS = {
  MONTHLY: 'com.thewell.premium.monthly',
  QUARTERLY: 'com.thewell.premium.quarterly',
  SEMI_ANNUAL: 'com.thewell.premium.semiannual',
  AD_FREE: 'com.thewell.ad_free',
} as const;

const PLAN_TO_PRODUCT_MAP: Record<string, IAPProductId> = {
  monthly: IAP_PRODUCT_IDS.MONTHLY,
  quarterly: IAP_PRODUCT_IDS.QUARTERLY,
  semi_annual: IAP_PRODUCT_IDS.SEMI_ANNUAL,
} as const;

// ============================================================================
// Type Definitions
// ============================================================================

export type IAPProductId = typeof IAP_PRODUCT_IDS[keyof typeof IAP_PRODUCT_IDS];

export interface IAPProduct {
  productId: IAPProductId;
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
  expiresAt?: string | null;
  productId?: IAPProductId;
}

export interface IAPValidationResult {
  success: boolean;
  message: string;
  expiresAt?: string | null;
}

// ============================================================================
// Custom Error Classes
// ============================================================================

class IAPServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly isRetryable: boolean = false,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'IAPServiceError';
  }
}

// ============================================================================
// Main IAP Service Class
// ============================================================================

class IAPService {
  private isAvailable: boolean = false;
  private isInitialized: boolean = false;
  private products: Map<IAPProductId, IAPProduct> = new Map();
  private customerInfo: CustomerInfo | null = null;

  // ============================================================================
  // Initialization & Lifecycle
  // ============================================================================

  /**
   * Initialize RevenueCat SDK
   * Must be called before any other IAP operations
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return this.isAvailable;
    }

    try {
      // IAP only available on iOS/Android physical devices
      if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        console.log('[IAPService] IAP only available on mobile devices');
        this.isInitialized = true;
        return false;
      }

      // Check if we're on a simulator
      if (__DEV__) {
        const isSimulator = Platform.OS === 'ios' 
          ? !(global as any).nativeModuleExists?.('RNPurchases')
          : false; // Android emulator supports IAP
        
        if (isSimulator) {
          console.log('[IAPService] IAP not available on iOS simulator');
          this.isInitialized = true;
          return false;
        }
      }

      // Configure RevenueCat
      const apiKey = Platform.OS === 'ios' 
        ? REVENUECAT_API_KEYS.ios 
        : REVENUECAT_API_KEYS.android;

      if (!apiKey) {
        console.error('[IAPService] RevenueCat API key not configured');
        this.isInitialized = true;
        this.isAvailable = false;
        return false;
      }

      await Purchases.configure({
        apiKey,
        appUserID: undefined, // RevenueCat will generate anonymous ID
      });

      // Set up listener for purchase updates
      Purchases.addCustomerInfoUpdateListener((info) => {
        this.customerInfo = info;
        this.handleCustomerInfoUpdate(info);
      });

      this.isAvailable = true;
      this.isInitialized = true;
      
      console.log('[IAPService] RevenueCat initialized successfully');
      return true;
    } catch (error) {
      console.error('[IAPService] Initialization failed:', error);
      this.isInitialized = true;
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Check if IAP is available
   */
  isIAPAvailable(): boolean {
    return this.isInitialized && this.isAvailable && 
           (Platform.OS === 'ios' || Platform.OS === 'android');
  }

  /**
   * Get current customer info (entitlements, subscriptions)
   */
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (!this.isIAPAvailable()) {
      return null;
    }

    try {
      const info = await Purchases.getCustomerInfo();
      this.customerInfo = info;
      return info;
    } catch (error) {
      console.error('[IAPService] Failed to get customer info:', error);
      return null;
    }
  }

  // ============================================================================
  // Product Management
  // ============================================================================

  /**
   * Get IAP products from App Store/Play Store
   * RevenueCat handles the product fetching automatically
   */
  async getProducts(): Promise<IAPProduct[]> {
    this.ensureInitialized();
    
    if (!this.isIAPAvailable()) {
      return [];
    }

    try {
      // RevenueCat returns offerings - we need to get the packages
      const offerings = await Purchases.getOfferings();
      
      if (!offerings.current) {
        console.log('[IAPService] No current offerings available');
        return [];
      }

      const packages = offerings.current.availablePackages;
      
      const products: IAPProduct[] = packages.map((pkg: PurchasesPackage) => ({
        productId: pkg.identifier as IAPProductId,
        title: pkg.product.title,
        description: pkg.product.description,
        price: pkg.product.priceString,
        priceAmountMicros: Math.round(pkg.product.price * 1000000),
        currencyCode: pkg.product.currencyCode,
        subscriptionPeriod: pkg.packageType,
      }));

      // Cache products
      products.forEach(p => this.products.set(p.productId, p));
      return products;
    } catch (error) {
      console.error('[IAPService] Error getting products:', error);
      return [];
    }
  }

  // ============================================================================
  // Purchase Operations
  // ============================================================================

  /**
   * Request a purchase
   * RevenueCat handles the purchase flow
   */
  async purchaseAsync(productId: IAPProductId): Promise<IAPPurchaseResult> {
    this.ensureInitialized();

    if (!this.isIAPAvailable()) {
      return {
        success: false,
        message: 'In-App Purchases not available on this device',
      };
    }

    // Validate product ID
    if (!Object.values(IAP_PRODUCT_IDS).includes(productId)) {
      return {
        success: false,
        message: 'Invalid product ID',
      };
    }

    try {
      // Get the package for this product
      const offerings = await Purchases.getOfferings();
      
      if (!offerings.current) {
        return {
          success: false,
          message: 'No offerings available',
        };
      }

      const packageToPurchase = offerings.current.availablePackages.find(
        (pkg: PurchasesPackage) => pkg.identifier === productId
      );

      if (!packageToPurchase) {
        return {
          success: false,
          message: 'Product not found in current offerings',
        };
      }

      // Make the purchase
      const { customerInfo, productIdentifier } = await Purchases.purchasePackage(packageToPurchase);

      // Check if purchase was successful
      if (!customerInfo.entitlements.active['premium']) {
        return {
          success: false,
          message: 'Purchase completed but entitlement not granted',
        };
      }

      // Sync with backend (optional - RevenueCat handles most of this)
      const validation = await this.syncPurchaseWithBackend(
        productIdentifier,
        customerInfo
      );

      // Get expiration date from RevenueCat
      const latestExpiration = this.getLatestExpirationDate(customerInfo);

      return {
        success: true,
        message: 'Purchase successful',
        transactionId: productIdentifier,
        expiresAt: latestExpiration,
        productId: productIdentifier as IAPProductId,
      };

    } catch (error: any) {
      // Handle specific RevenueCat errors
      if (error.userCancelled) {
        return {
          success: false,
          message: 'Purchase cancelled',
        };
      }

      if (error.code === PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR) {
        return {
          success: false,
          message: 'You already own this subscription',
        };
      }

      if (error.code === PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR) {
        return {
          success: false,
          message: 'This product is not available',
        };
      }

      console.error('[IAPService] Purchase error:', error);
      return {
        success: false,
        message: error.message || 'Purchase failed',
      };
    }
  }

  // ============================================================================
  // Restore Purchases
  // ============================================================================

  /**
   * Restore previous purchases
   * RevenueCat handles this automatically
   */
  async restorePurchases(): Promise<IAPPurchaseResult[]> {
    this.ensureInitialized();

    if (!this.isIAPAvailable()) {
      return [];
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      
      // Get all active entitlements
      const results: IAPPurchaseResult[] = [];
      
      for (const [entitlementId, entitlement] of Object.entries(customerInfo.entitlements.active)) {
        results.push({
          success: true,
          message: 'Purchase restored',
          transactionId: entitlement.identifier,
          expiresAt: entitlement.expirationDate,
          productId: entitlement.productIdentifier as IAPProductId,
        });
      }

      // Sync with backend
      if (results.length > 0) {
        await this.syncPurchaseWithBackend(
          results[0].transactionId || '',
          customerInfo
        );
      }

      return results;
    } catch (error: any) {
      console.error('[IAPService] Restore error:', error);
      return [];
    }
  }

  // ============================================================================
  // Backend Sync
  // ============================================================================

  /**
   * Sync purchase with backend for record keeping
   * RevenueCat handles the actual validation, this is just for your records
   */
  private async syncPurchaseWithBackend(
    productId: string,
    customerInfo: CustomerInfo
  ): Promise<IAPValidationResult> {
    try {
      // Get the latest transaction info
      const latestExpiration = this.getLatestExpirationDate(customerInfo);
      
      await apiClient.post(API_ENDPOINTS.PAYMENTS.VERIFY_APPLE_RECEIPT, {
        product_id: productId,
        platform: Platform.OS,
        revenuecat_customer_info: {
          originalAppUserId: customerInfo.originalAppUserId,
          firstSeen: customerInfo.firstSeen,
          latestExpirationDate: latestExpiration,
        },
      });

      return {
        success: true,
        message: 'Purchase synced with backend',
        expiresAt: latestExpiration,
      };
    } catch (error: any) {
      console.error('[IAPService] Backend sync error:', error);
      return {
        success: false,
        message: 'Failed to sync with backend',
      };
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Get the latest expiration date from customer info
   */
  private getLatestExpirationDate(customerInfo: CustomerInfo): string | null {
    let latestDate: Date | null = null;

    for (const entitlement of Object.values(customerInfo.entitlements.active)) {
      if (entitlement.expirationDate) {
        const expDate = new Date(entitlement.expirationDate);
        if (!latestDate || expDate > latestDate) {
          latestDate = expDate;
        }
      }
    }

    return latestDate?.toISOString() || null;
  }

  /**
   * Handle customer info updates (renewals, expirations, etc.)
   */
  private handleCustomerInfoUpdate(customerInfo: CustomerInfo): void {
    console.log('[IAPService] Customer info updated:', {
      originalAppUserId: customerInfo.originalAppUserId,
      entitlements: Object.keys(customerInfo.entitlements.active),
    });

    // You can emit an event here or update app state
    // Example: EventEmitter.emit('iap:customerInfoUpdated', customerInfo);
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    if (!this.isIAPAvailable()) {
      return false;
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return Object.keys(customerInfo.entitlements.active).length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current subscription expiration date
   */
  async getSubscriptionExpiration(): Promise<string | null> {
    if (!this.isIAPAvailable()) {
      return null;
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return this.getLatestExpirationDate(customerInfo);
    } catch (error) {
      return null;
    }
  }

  /**
   * Map plan ID to IAP product ID
   */
  getProductIdForPlan(planId: string): IAPProductId | null {
    return PLAN_TO_PRODUCT_MAP[planId] || null;
  }

  /**
   * Check if we should use IAP for this platform
   */
  shouldUseIAP(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new IAPServiceError('NOT_INITIALIZED', 'IAP service not initialized. Call initialize() first.');
    }
  }

  /**
   * Get RevenueCat purchaser info (for debugging)
   */
  async getDebugInfo(): Promise<Record<string, unknown>> {
    if (!this.isIAPAvailable()) {
      return { error: 'IAP not available' };
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return {
        originalAppUserId: customerInfo.originalAppUserId,
        firstSeen: customerInfo.firstSeen,
        originalApplicationVersion: customerInfo.originalApplicationVersion,
        managementURL: customerInfo.managementURL,
        entitlements: customerInfo.entitlements,
      };
    } catch (error) {
      return { error: String(error) };
    }
  }
}

// ============================================================================
// Export
// ============================================================================

export const iapService = new IAPService();
export { IAPServiceError };