import { message } from 'antd';

/**
 * Enhanced Google Drive Error Handler
 * Provides specific error messages and logging for different Google Drive scenarios
 */
export class GoogleDriveErrorHandler {
   
  static ErrorTypes = {
    AUTH_ERROR: 'AUTH_ERROR',
    ACCESS_DENIED: 'ACCESS_DENIED', 
    FILE_NOT_FOUND: 'FILE_NOT_FOUND',
    QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
    NETWORK_ERROR: 'NETWORK_ERROR',
    INVALID_FILE: 'INVALID_FILE',
    PERMISSION_ERROR: 'PERMISSION_ERROR',
    RATE_LIMIT: 'RATE_LIMIT',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  };

  static ErrorMessages = {
    AUTH_ERROR: {
      title: 'Authentication Failed',
      message: 'Unable to authenticate with Google Drive. Please sign in again.',
      action: 'Sign out and sign back in to refresh your credentials.'
    },
    ACCESS_DENIED: {
      title: 'Access Denied', 
      message: 'You don\'t have permission to access this file or folder.',
      action: 'Check your Google Drive permissions or contact the file owner.'
    },
    FILE_NOT_FOUND: {
      title: 'File Not Found',
      message: 'The requested file could not be found in your Google Drive.',
      action: 'Use the settings to configure the correct file location.'
    },
    QUOTA_EXCEEDED: {
      title: 'Storage Limit Exceeded',
      message: 'Your Google Drive storage is full.',
      action: 'Free up space in your Google Drive or upgrade your storage plan.'
    },
    NETWORK_ERROR: {
      title: 'Network Error',
      message: 'Unable to connect to Google Drive. Check your internet connection.',
      action: 'Verify your internet connection and try again.'
    },
    INVALID_FILE: {
      title: 'Invalid File Format',
      message: 'The file format is not supported or the file is corrupted.',
      action: 'Check that the file is a valid JSON format.'
    },
    PERMISSION_ERROR: {
      title: 'Permission Error', 
      message: 'Insufficient permissions to perform this operation.',
      action: 'Grant the application permission to access your Google Drive files.'
    },
    RATE_LIMIT: {
      title: 'Rate Limit Exceeded',
      message: 'Too many requests. Please wait and try again.',
      action: 'Wait a few minutes before trying again.'
    },
    UNKNOWN_ERROR: {
      title: 'Unknown Error',
      message: 'An unexpected error occurred.',
      action: 'Try refreshing the page or contact support if the problem persists.'
    }
  };

  /**
   * Classify and handle Google Drive API errors
   * @param {Error|Object} error - The error object from Google Drive API
   * @param {string} context - Additional context about where the error occurred
   * @param {Object} options - Options for error handling
   * @returns {Object} Structured error information
   */
  static handleError(error, context = '', options = {}) {
    const { 
      showUserMessage = true, 
      logToConsole = true,
      userInfo = null,
      operation = 'unknown'
    } = options;

    let errorType = this.ErrorTypes.UNKNOWN_ERROR;
    let details = {};
    let originalError = error;

    // Analyze the error to determine type
    if (error) {
      const errorString = error.toString().toLowerCase();
      const status = error.status || error.code;
      
      // Authentication errors
      if (status === 401 || errorString.includes('unauthorized') || errorString.includes('invalid_token')) {
        errorType = this.ErrorTypes.AUTH_ERROR;
      }
      // Access denied
      else if (status === 403 || errorString.includes('access denied') || errorString.includes('forbidden')) {
        errorType = this.ErrorTypes.ACCESS_DENIED;
      }
      // File not found
      else if (status === 404 || errorString.includes('not found') || errorString.includes('file not found')) {
        errorType = this.ErrorTypes.FILE_NOT_FOUND;
      }
      // Quota exceeded
      else if (status === 413 || errorString.includes('quota') || errorString.includes('storage')) {
        errorType = this.ErrorTypes.QUOTA_EXCEEDED;
      }
      // Rate limiting
      else if (status === 429 || errorString.includes('rate limit') || errorString.includes('too many requests')) {
        errorType = this.ErrorTypes.RATE_LIMIT;
      }
      // Network errors
      else if (errorString.includes('network') || errorString.includes('timeout') || errorString.includes('connection')) {
        errorType = this.ErrorTypes.NETWORK_ERROR;
      }
      // Permission errors
      else if (errorString.includes('permission') || errorString.includes('scope')) {
        errorType = this.ErrorTypes.PERMISSION_ERROR;
      }
      // Invalid file format
      else if (errorString.includes('parse') || errorString.includes('json') || errorString.includes('format')) {
        errorType = this.ErrorTypes.INVALID_FILE;
      }

      details = {
        status: status,
        message: error.message || error.toString(),
        stack: error.stack,
        response: error.response
      };
    }

    const errorInfo = {
      type: errorType,
      context: context,
      operation: operation,
      userInfo: userInfo ? { email: userInfo.email, name: userInfo.name } : null,
      details: details,
      timestamp: new Date().toISOString(),
      ...this.ErrorMessages[errorType]
    };

    // Log to console if requested
    if (logToConsole) {
      console.group(`🚨 Google Drive Error - ${errorInfo.title}`);
      console.error('Error Type:', errorType);
      console.error('Context:', context);
      console.error('Operation:', operation);
      console.error('User:', userInfo?.email || 'Unknown');
      console.error('Original Error:', originalError);
      console.error('Details:', details);
      console.groupEnd();
    }

    // Show user-friendly message if requested
    if (showUserMessage) {
      message.error({
        content: `${errorInfo.title}: ${errorInfo.message} - ${errorInfo.action}`,
        duration: 8
      });
    }

    return errorInfo;
  }

  /**
   * Handle file operation errors specifically
   */
  static handleFileError(error, fileName, operation, userInfo = null) {
    const context = `File operation: ${operation} on ${fileName}`;
    return this.handleError(error, context, { 
      operation, 
      userInfo,
      showUserMessage: true 
    });
  }

  /**
   * Handle authentication errors specifically
   */
  static handleAuthError(error, userInfo = null) {
    const context = 'Google Drive authentication';
    return this.handleError(error, context, { 
      operation: 'authentication', 
      userInfo,
      showUserMessage: true 
    });
  }

  /**
   * Create a success message for operations
   */
  static showSuccess(operation, details = '') {
    const messages = {
      'load': `Data loaded successfully from Google Drive${details ? ` - ${details}` : ''}`,
      'save': `Data saved successfully to Google Drive${details ? ` - ${details}` : ''}`,
      'create': `File created successfully in Google Drive${details ? ` - ${details}` : ''}`,
      'delete': `File deleted successfully from Google Drive${details ? ` - ${details}` : ''}`,
      'signin': 'Successfully signed in to Google Drive',
      'signout': 'Successfully signed out of Google Drive'
    };

    message.success(messages[operation] || `Operation completed successfully${details ? ` - ${details}` : ''}`);
  }

  /**
   * Get user-friendly suggestions based on error type
   */
  static getSuggestions(errorType) {
    const suggestions = {
      [this.ErrorTypes.AUTH_ERROR]: [
        'Sign out and sign back in',
        'Clear browser cache and cookies',
        'Check if Google account is still active'
      ],
      [this.ErrorTypes.FILE_NOT_FOUND]: [
        'Use the settings button to configure file locations',
        'Check if the file exists in your Google Drive',
        'Verify the file name spelling and path'
      ],
      [this.ErrorTypes.ACCESS_DENIED]: [
        'Check Google Drive sharing permissions',
        'Ensure the app has necessary scopes',
        'Contact the file owner for access'
      ],
      [this.ErrorTypes.QUOTA_EXCEEDED]: [
        'Delete unnecessary files from Google Drive',
        'Empty Google Drive trash',
        'Upgrade your Google storage plan'
      ],
      [this.ErrorTypes.NETWORK_ERROR]: [
        'Check your internet connection',
        'Try again in a few minutes',
        'Disable VPN if using one'
      ]
    };

    return suggestions[errorType] || ['Try refreshing the page', 'Contact support if the problem persists'];
  }

  /**
   * Create a detailed error report for debugging
   */
  static generateErrorReport(errors) {
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: errors.length,
      errorsByType: {},
      recentErrors: errors.slice(-10),
      suggestions: []
    };

    // Group errors by type
    errors.forEach(error => {
      if (!report.errorsByType[error.type]) {
        report.errorsByType[error.type] = 0;
      }
      report.errorsByType[error.type]++;
    });

    // Generate suggestions based on most common errors
    const mostCommonError = Object.keys(report.errorsByType)
      .reduce((a, b) => report.errorsByType[a] > report.errorsByType[b] ? a : b);
    
    report.suggestions = this.getSuggestions(mostCommonError);

    return report;
  }
}

export default GoogleDriveErrorHandler;