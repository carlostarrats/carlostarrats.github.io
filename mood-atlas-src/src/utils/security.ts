// Security utilities for Apple Music integration

// Data encryption for user library
export class SecurityManager {
  private static readonly STORAGE_KEY = 'moodAtlas_encrypted_data';
  private static readonly TOKEN_KEY = 'moodAtlas_auth_token';

  // Encrypt sensitive data before storing
  static async encryptData(data: any): Promise<string> {
    try {
      // Use Web Crypto API for client-side encryption
      const encoder = new TextEncoder();
      const dataString = JSON.stringify(data);
      const dataBuffer = encoder.encode(dataString);
      
      // Generate a random key for this session
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        dataBuffer
      );
      
      // Store key and IV with encrypted data
      const result = {
        encrypted: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv),
        key: await crypto.subtle.exportKey('raw', key)
      };
      
      return btoa(JSON.stringify(result));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt stored data
  static async decryptData(encryptedData: string): Promise<any> {
    try {
      const decoded = JSON.parse(atob(encryptedData));
      const key = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(decoded.key),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(decoded.iv) },
        key,
        new Uint8Array(decoded.encrypted)
      );
      
      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decrypted));
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Store encrypted user library
  static async storeUserLibrary(library: any[]): Promise<void> {
    try {
      const encrypted = await this.encryptData(library);
      sessionStorage.setItem(this.STORAGE_KEY, encrypted);
    } catch (error) {
      console.error('Failed to store library:', error);
      throw new Error('Failed to store user library securely');
    }
  }

  // Retrieve encrypted user library
  static async getUserLibrary(): Promise<any[] | null> {
    try {
      const encrypted = sessionStorage.getItem(this.STORAGE_KEY);
      if (!encrypted) return null;
      
      return await this.decryptData(encrypted);
    } catch (error) {
      console.error('Failed to retrieve library:', error);
      return null;
    }
  }

  // Clear all stored data
  static clearUserData(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Validate Apple Music developer token
  static validateDeveloperToken(token: string): boolean {
    if (!token || token === 'your_developer_token_here') {
      return false;
    }
    
    // Basic JWT format validation
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    try {
      // Try to decode the header to validate JWT structure
      const header = JSON.parse(atob(parts[0]));
      return header.typ === 'JWT' && header.alg;
    } catch {
      return false;
    }
  }

  // Rate limiting for API calls
  private static readonly RATE_LIMIT_KEY = 'moodAtlas_rate_limit';
  private static readonly MAX_CALLS_PER_MINUTE = 60;

  static checkRateLimit(): boolean {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const key = `${this.RATE_LIMIT_KEY}_${minute}`;
    
    const calls = parseInt(sessionStorage.getItem(key) || '0');
    if (calls >= this.MAX_CALLS_PER_MINUTE) {
      return false;
    }
    
    sessionStorage.setItem(key, (calls + 1).toString());
    return true;
  }

  // Sanitize user input to prevent XSS
  static sanitizeInput(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // Validate HTTPS connection
  static isSecureConnection(): boolean {
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost';
  }
}

// Privacy-focused data handling
export class PrivacyManager {
  // Anonymize user data for analytics
  static anonymizeUserData(userData: any): any {
    return {
      ...userData,
      // Remove personally identifiable information
      userToken: undefined,
      email: undefined,
      // Hash user ID for analytics
      userId: userData.userId ? this.hashString(userData.userId) : undefined,
    };
  }

  // Create hash of string for anonymization
  private static async hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Check if user has consented to data collection
  static hasUserConsent(): boolean {
    return localStorage.getItem('moodAtlas_user_consent') === 'true';
  }

  // Set user consent
  static setUserConsent(consent: boolean): void {
    localStorage.setItem('moodAtlas_user_consent', consent.toString());
  }
}

