/**
 * Payment validation utilities for standardized input validation
 * Used by both frontend and backend to ensure consistent validation
 */

export interface StandardizedPaymentInput {
  propertyId: string;
  amount: number;
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  errors: string[];
}

/**
 * Validate payment input according to standardized structure
 * Returns validation result with specific field errors
 */
export function validatePaymentInput(input: any): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    missingFields: [],
    errors: []
  };

  // Check propertyId
  if (!input.propertyId || typeof input.propertyId !== 'string' || input.propertyId.trim() === '') {
    result.missingFields.push('propertyId');
    result.errors.push('Property ID is required');
    result.isValid = false;
  }

  // Check amount
  if (!input.amount || typeof input.amount !== 'number' || input.amount <= 0) {
    result.missingFields.push('amount');
    result.errors.push('Valid amount is required');
    result.isValid = false;
  }

  // Check userDetails object
  if (!input.userDetails || typeof input.userDetails !== 'object') {
    result.missingFields.push('userDetails');
    result.errors.push('User details are required');
    result.isValid = false;
  } else {
    // Check userDetails.name
    if (!input.userDetails.name || typeof input.userDetails.name !== 'string' || input.userDetails.name.trim() === '') {
      result.missingFields.push('userDetails.name');
      result.errors.push('User name is required');
      result.isValid = false;
    }

    // Check userDetails.email
    if (!input.userDetails.email || typeof input.userDetails.email !== 'string' || input.userDetails.email.trim() === '') {
      result.missingFields.push('userDetails.email');
      result.errors.push('User email is required');
      result.isValid = false;
    } else if (!isValidEmail(input.userDetails.email)) {
      result.errors.push('Valid email is required');
      result.isValid = false;
    }

    // Check userDetails.phone
    if (!input.userDetails.phone || typeof input.userDetails.phone !== 'string' || input.userDetails.phone.trim() === '') {
      result.missingFields.push('userDetails.phone');
      result.errors.push('User phone is required');
      result.isValid = false;
    } else if (!isValidPhone(input.userDetails.phone)) {
      result.errors.push('Valid phone number is required');
      result.isValid = false;
    }
  }

  return result;
}

/**
 * Basic email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Basic phone validation (Indian format)
 */
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits
  return phoneRegex.test(cleanPhone);
}

/**
 * Frontend pre-validation before payment
 * Returns user-friendly error message or null if valid
 */
export function preValidatePayment(input: any): string | null {
  const validation = validatePaymentInput(input);
  
  if (!validation.isValid) {
    // Return generic user-friendly message (don't expose internal field names)
    return 'Unable to start payment. Please try again or contact support.';
  }
  
  return null; // Valid
}

/**
 * Backend validation with detailed logging
 * Returns standardized error response for API
 */
export function validateForAPI(input: any): { success: boolean; message: string; statusCode: number } {
  const validation = validatePaymentInput(input);
  
  if (!validation.isValid) {
    // Log detailed errors for server debugging
    console.log('❌ Payment validation failed:', {
      missingFields: validation.missingFields,
      errors: validation.errors,
      receivedInput: {
        hasPropertyId: !!input.propertyId,
        hasAmount: !!input.amount,
        hasUserDetails: !!input.userDetails,
        userDetailsKeys: input.userDetails ? Object.keys(input.userDetails) : []
      }
    });
    
    return {
      success: false,
      message: 'Missing required fields', // Generic message for frontend
      statusCode: 400
    };
  }
  
  return {
    success: true,
    message: 'Validation passed',
    statusCode: 200
  };
}