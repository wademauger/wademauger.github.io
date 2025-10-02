import { GoogleDriveErrorHandler } from './GoogleDriveErrorHandler.js';
import { message } from 'antd';

jest.mock('antd', () => ({
  message: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

describe('GoogleDriveErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.group = jest.fn();
    console.error = jest.fn();
    console.groupEnd = jest.fn();
  });

  describe('handleError', () => {
    it('should classify auth errors (401)', () => {
      const error = { status: 401, message: 'Unauthorized' };
      const result = GoogleDriveErrorHandler.handleError(error, 'test context', {
        showUserMessage: false,
        logToConsole: false
      });

      expect(result.type).toBe(GoogleDriveErrorHandler.ErrorTypes.AUTH_ERROR);
      expect(result.title).toBe('Authentication Failed');
    });

    it('should classify access denied errors (403)', () => {
      const error = { status: 403, message: 'Forbidden' };
      const result = GoogleDriveErrorHandler.handleError(error, 'test context', {
        showUserMessage: false,
        logToConsole: false
      });

      expect(result.type).toBe(GoogleDriveErrorHandler.ErrorTypes.ACCESS_DENIED);
      expect(result.title).toBe('Access Denied');
    });

    it('should classify file not found errors (404)', () => {
      const error = { status: 404, message: 'Not found' };
      const result = GoogleDriveErrorHandler.handleError(error, 'test context', {
        showUserMessage: false,
        logToConsole: false
      });

      expect(result.type).toBe(GoogleDriveErrorHandler.ErrorTypes.FILE_NOT_FOUND);
    });

    it('should classify quota exceeded errors (413)', () => {
      const error = { status: 413, message: 'Quota exceeded' };
      const result = GoogleDriveErrorHandler.handleError(error, 'test context', {
        showUserMessage: false,
        logToConsole: false
      });

      expect(result.type).toBe(GoogleDriveErrorHandler.ErrorTypes.QUOTA_EXCEEDED);
    });

    it('should classify rate limit errors (429)', () => {
      const error = { status: 429, message: 'Too many requests' };
      const result = GoogleDriveErrorHandler.handleError(error, 'test context', {
        showUserMessage: false,
        logToConsole: false
      });

      expect(result.type).toBe(GoogleDriveErrorHandler.ErrorTypes.RATE_LIMIT);
    });

    it('should classify network errors from message', () => {
      const error = new Error('Network timeout occurred');
      const result = GoogleDriveErrorHandler.handleError(error, 'test context', {
        showUserMessage: false,
        logToConsole: false
      });

      expect(result.type).toBe(GoogleDriveErrorHandler.ErrorTypes.NETWORK_ERROR);
    });

    it('should classify permission errors from message', () => {
      const error = new Error('Permission denied');
      const result = GoogleDriveErrorHandler.handleError(error, 'test context', {
        showUserMessage: false,
        logToConsole: false
      });

      expect(result.type).toBe(GoogleDriveErrorHandler.ErrorTypes.PERMISSION_ERROR);
    });

    it('should classify invalid file errors from message', () => {
      const error = new Error('JSON parse error');
      const result = GoogleDriveErrorHandler.handleError(error, 'test context', {
        showUserMessage: false,
        logToConsole: false
      });

      expect(result.type).toBe(GoogleDriveErrorHandler.ErrorTypes.INVALID_FILE);
    });

    it('should show user message when requested', () => {
      const error = { status: 401, message: 'Unauthorized' };
      GoogleDriveErrorHandler.handleError(error, 'test context', {
        showUserMessage: true,
        logToConsole: false
      });

      expect(message.error).toHaveBeenCalled();
    });

    it('should log to console when requested', () => {
      const error = { status: 401, message: 'Unauthorized' };
      GoogleDriveErrorHandler.handleError(error, 'test context', {
        showUserMessage: false,
        logToConsole: true
      });

      expect(console.group).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
      expect(console.groupEnd).toHaveBeenCalled();
    });

    it('should include user info when provided', () => {
      const error = { status: 401, message: 'Unauthorized' };
      const userInfo = { email: 'test@example.com', name: 'Test User' };
      const result = GoogleDriveErrorHandler.handleError(error, 'test context', {
        showUserMessage: false,
        logToConsole: false,
        userInfo
      });

      expect(result.userInfo).toEqual(userInfo);
    });

    it('should handle unknown errors', () => {
      const error = new Error('Some unknown error');
      const result = GoogleDriveErrorHandler.handleError(error, 'test context', {
        showUserMessage: false,
        logToConsole: false
      });

      expect(result.type).toBe(GoogleDriveErrorHandler.ErrorTypes.UNKNOWN_ERROR);
    });

    it('should classify errors by string matching for unauthorized', () => {
      const error = new Error('invalid_token');
      const result = GoogleDriveErrorHandler.handleError(error, 'test context', {
        showUserMessage: false,
        logToConsole: false
      });

      expect(result.type).toBe(GoogleDriveErrorHandler.ErrorTypes.AUTH_ERROR);
    });

    it('should classify errors by string matching for storage quota', () => {
      const error = new Error('Storage quota exceeded');
      const result = GoogleDriveErrorHandler.handleError(error, 'test context', {
        showUserMessage: false,
        logToConsole: false
      });

      expect(result.type).toBe(GoogleDriveErrorHandler.ErrorTypes.QUOTA_EXCEEDED);
    });
  });

  describe('handleFileError', () => {
    it('should handle file operation errors', () => {
      const error = { status: 404, message: 'File not found' };
      const result = GoogleDriveErrorHandler.handleFileError(error, 'testfile.json', 'read', null);

      expect(result.type).toBe(GoogleDriveErrorHandler.ErrorTypes.FILE_NOT_FOUND);
      expect(result.context).toContain('testfile.json');
      expect(result.operation).toBe('read');
    });
  });

  describe('handleAuthError', () => {
    it('should handle authentication errors', () => {
      const error = { status: 401, message: 'Unauthorized' };
      const userInfo = { email: 'test@example.com', name: 'Test User' };
      const result = GoogleDriveErrorHandler.handleAuthError(error, userInfo);

      expect(result.type).toBe(GoogleDriveErrorHandler.ErrorTypes.AUTH_ERROR);
      expect(result.operation).toBe('authentication');
      expect(result.userInfo).toEqual(userInfo);
    });
  });

  describe('showSuccess', () => {
    it('should show success message for load operation', () => {
      GoogleDriveErrorHandler.showSuccess('load', 'file.json');
      expect(message.success).toHaveBeenCalledWith(expect.stringContaining('loaded successfully'));
    });

    it('should show success message for save operation', () => {
      GoogleDriveErrorHandler.showSuccess('save', 'file.json');
      expect(message.success).toHaveBeenCalledWith(expect.stringContaining('saved successfully'));
    });

    it('should show success message for create operation', () => {
      GoogleDriveErrorHandler.showSuccess('create');
      expect(message.success).toHaveBeenCalledWith(expect.stringContaining('created successfully'));
    });

    it('should show success message for delete operation', () => {
      GoogleDriveErrorHandler.showSuccess('delete');
      expect(message.success).toHaveBeenCalledWith(expect.stringContaining('deleted successfully'));
    });

    it('should show success message for signin operation', () => {
      GoogleDriveErrorHandler.showSuccess('signin');
      expect(message.success).toHaveBeenCalledWith(expect.stringContaining('signed in'));
    });

    it('should show success message for signout operation', () => {
      GoogleDriveErrorHandler.showSuccess('signout');
      expect(message.success).toHaveBeenCalledWith(expect.stringContaining('signed out'));
    });

    it('should show generic success message for unknown operation', () => {
      GoogleDriveErrorHandler.showSuccess('unknown_op', 'details');
      expect(message.success).toHaveBeenCalledWith(expect.stringContaining('completed successfully'));
    });
  });

  describe('getSuggestions', () => {
    it('should return suggestions for auth errors', () => {
      const suggestions = GoogleDriveErrorHandler.getSuggestions(
        GoogleDriveErrorHandler.ErrorTypes.AUTH_ERROR
      );
      expect(suggestions).toContain('Sign out and sign back in');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should return suggestions for file not found errors', () => {
      const suggestions = GoogleDriveErrorHandler.getSuggestions(
        GoogleDriveErrorHandler.ErrorTypes.FILE_NOT_FOUND
      );
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should return suggestions for access denied errors', () => {
      const suggestions = GoogleDriveErrorHandler.getSuggestions(
        GoogleDriveErrorHandler.ErrorTypes.ACCESS_DENIED
      );
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should return suggestions for quota exceeded errors', () => {
      const suggestions = GoogleDriveErrorHandler.getSuggestions(
        GoogleDriveErrorHandler.ErrorTypes.QUOTA_EXCEEDED
      );
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should return suggestions for network errors', () => {
      const suggestions = GoogleDriveErrorHandler.getSuggestions(
        GoogleDriveErrorHandler.ErrorTypes.NETWORK_ERROR
      );
      expect(suggestions).toContain('Check your internet connection');
    });

    it('should return default suggestions for unknown error types', () => {
      const suggestions = GoogleDriveErrorHandler.getSuggestions('UNKNOWN_TYPE');
      expect(suggestions).toContain('Try refreshing the page');
    });
  });

  describe('generateErrorReport', () => {
    it('should generate error report with grouping', () => {
      const errors = [
        { type: GoogleDriveErrorHandler.ErrorTypes.AUTH_ERROR },
        { type: GoogleDriveErrorHandler.ErrorTypes.AUTH_ERROR },
        { type: GoogleDriveErrorHandler.ErrorTypes.FILE_NOT_FOUND }
      ];

      const report = GoogleDriveErrorHandler.generateErrorReport(errors);

      expect(report.totalErrors).toBe(3);
      expect(report.errorsByType[GoogleDriveErrorHandler.ErrorTypes.AUTH_ERROR]).toBe(2);
      expect(report.errorsByType[GoogleDriveErrorHandler.ErrorTypes.FILE_NOT_FOUND]).toBe(1);
      expect(report.suggestions.length).toBeGreaterThan(0);
    });

    it('should include recent errors in report', () => {
      const errors = Array(20).fill(null).map((_, i) => ({
        type: GoogleDriveErrorHandler.ErrorTypes.AUTH_ERROR,
        index: i
      }));

      const report = GoogleDriveErrorHandler.generateErrorReport(errors);

      expect(report.recentErrors.length).toBe(10);
      expect(report.recentErrors[0].index).toBe(10);
    });

    it('should generate suggestions based on most common error', () => {
      const errors = [
        { type: GoogleDriveErrorHandler.ErrorTypes.NETWORK_ERROR },
        { type: GoogleDriveErrorHandler.ErrorTypes.NETWORK_ERROR },
        { type: GoogleDriveErrorHandler.ErrorTypes.AUTH_ERROR }
      ];

      const report = GoogleDriveErrorHandler.generateErrorReport(errors);

      expect(report.suggestions).toEqual(
        GoogleDriveErrorHandler.getSuggestions(GoogleDriveErrorHandler.ErrorTypes.NETWORK_ERROR)
      );
    });
  });
});
