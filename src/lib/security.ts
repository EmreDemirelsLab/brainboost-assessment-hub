// Security utilities for input validation and sanitization
import DOMPurify from 'dompurify';

// Input validation schemas
export const ValidationRules = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  name: /^[a-zA-ZÇĞIİÖŞÜçğıiöşü\s'-]{2,50}$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potential script tags and dangerous HTML
  const cleaned = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
  
  // Additional security: escape special characters
  return cleaned
    .replace(/[<>\"']/g, (match) => {
      const escapeMap: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return escapeMap[match];
    })
    .trim();
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return ValidationRules.email.test(email.toLowerCase());
};

// Validate password strength
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Şifre gereklidir'] };
  }
  
  if (password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermelidir');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Şifre en az bir özel karakter içermelidir (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate name format
export const validateName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  return ValidationRules.name.test(name.trim());
};

// Rate limiting for form submissions
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  canAttempt(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Record this attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    
    return true;
  }
  
  getRemainingTime(identifier: string): number {
    const userAttempts = this.attempts.get(identifier) || [];
    if (userAttempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...userAttempts);
    const remainingTime = this.windowMs - (Date.now() - oldestAttempt);
    
    return Math.max(0, remainingTime);
  }
}

export const authRateLimiter = new RateLimiter();

// Secure form data validation
export const validateFormData = (data: Record<string, any>): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: Record<string, any>;
} => {
  const errors: Record<string, string> = {};
  const sanitizedData: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      const sanitized = sanitizeInput(value);
      
      // Validate specific fields
      switch (key) {
        case 'email':
          if (!validateEmail(sanitized)) {
            errors[key] = 'Geçerli bir e-posta adresi girin';
          }
          break;
        case 'password':
          const passwordValidation = validatePassword(value); // Don't sanitize passwords
          if (!passwordValidation.isValid) {
            errors[key] = passwordValidation.errors.join(', ');
          }
          sanitizedData[key] = value; // Keep original password
          continue;
        case 'firstName':
        case 'lastName':
        case 'name':
          if (!validateName(sanitized)) {
            errors[key] = 'Geçerli bir isim girin (2-50 karakter, sadece harfler)';
          }
          break;
        default:
          // Basic validation for other string fields
          if (sanitized.length > 1000) {
            errors[key] = 'Bu alan çok uzun (maksimum 1000 karakter)';
          }
      }
      
      sanitizedData[key] = sanitized;
    } else {
      sanitizedData[key] = value;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};

// CSRF token generation and validation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Session security utilities
export const validateSession = (session: any): boolean => {
  if (!session || typeof session !== 'object') return false;
  
  // Check if session is expired
  if (session.expires_at && new Date(session.expires_at) < new Date()) {
    return false;
  }
  
  // Validate session structure
  return !!(session.access_token && session.user);
};

// Content Security Policy headers
export const getSecurityHeaders = () => ({
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
});

// Audit logging
export const logSecurityEvent = (event: {
  action: string;
  userId?: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}) => {
  // In production, this would send to a security monitoring service
  console.warn('🔒 Security Event:', {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...event
  });
};