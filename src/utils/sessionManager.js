// Session persistence utility for knitting design app
// Handles browser session storage and future Google Drive integration

const SESSION_STORAGE_KEY = 'knittingDesignSession';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

class SessionManager {
  constructor() {
    this.autoSaveInterval = null;
    this.isGoogleDriveEnabled = false; // Future feature
  }

  // Load session from browser storage
  loadSession() {
    try {
      const savedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        // Validate session structure
        if (this.isValidSession(parsed)) {
          return {
            ...parsed,
            loadedAt: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load session from storage:', error);
    }
    return null;
  }

  // Save session to browser storage
  saveSession(sessionData) {
    try {
      const sessionToSave = {
        ...sessionData,
        savedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionToSave));
      
      // Future: Also save to Google Drive if enabled
      if (this.isGoogleDriveEnabled) {
        this.saveToGoogleDrive(sessionToSave);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save session:', error);
      return false;
    }
  }

  // Clear session
  clearSession() {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear session:', error);
      return false;
    }
  }

  // Check if session exists
  hasSession() {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) !== null;
  }

  // Validate session structure
  isValidSession(session) {
    return (
      session &&
      typeof session === 'object' &&
      session.patternData &&
      typeof session.currentStep === 'number' &&
      session.sessionId
    );
  }

  // Start auto-save
  startAutoSave(saveCallback) {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    this.autoSaveInterval = setInterval(() => {
      if (typeof saveCallback === 'function') {
        saveCallback();
      }
    }, AUTO_SAVE_INTERVAL);
  }

  // Stop auto-save
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  // Generate session export data
  exportSession(sessionData) {
    const exportData = {
      ...sessionData,
      exportedAt: new Date().toISOString(),
      version: '1.0',
      type: 'knittingDesignSession'
    };
    
    return {
      data: exportData,
      filename: `knitting-pattern-${sessionData.sessionId || 'export'}-${new Date().toISOString().split('T')[0]}.json`,
      blob: new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    };
  }

  // Import session data
  importSession(jsonData) {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      if (parsed.type === 'knittingDesignSession' && this.isValidSession(parsed)) {
        return {
          ...parsed,
          importedAt: new Date().toISOString(),
          sessionId: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
      } else {
        throw new Error('Invalid session file format');
      }
    } catch (error) {
      console.error('Failed to import session:', error);
      throw error;
    }
  }

  // Future: Google Drive integration
  async saveToGoogleDrive() {
    // This will be implemented when Google Drive integration is added
    console.log('Google Drive save not yet implemented');
    return false;
  }

  async loadFromGoogleDrive() {
    // This will be implemented when Google Drive integration is added
    console.log('Google Drive load not yet implemented');
    return null;
  }

  // Generate auto-pattern name based on garment and gauge
  generatePatternName(patternData) {
    const { basePattern, gauge } = patternData;
    
    if (!basePattern) return 'Untitled Pattern';
    
    let name = basePattern.name || 'Custom Pattern';
    
    if (gauge && gauge.yarnWeight) {
      const yarnWeightNames = {
        'lace': 'Lace Weight',
        'light': 'Light Weight',
        'dk': 'DK Weight',
        'worsted': 'Worsted Weight',
        'chunky': 'Chunky Weight',
        'bulky': 'Bulky Weight'
      };
      
      const weightName = yarnWeightNames[gauge.yarnWeight] || gauge.yarnWeight;
      name += ` (${weightName})`;
    }
    
    if (gauge && gauge.stitchesPerInch) {
      name += ` - ${gauge.stitchesPerInch} spi`;
    }
    
    return name;
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;

// Export utility functions
export const {
  loadSession,
  saveSession,
  clearSession,
  hasSession,
  startAutoSave,
  stopAutoSave,
  exportSession,
  importSession,
  generatePatternName
} = sessionManager;
