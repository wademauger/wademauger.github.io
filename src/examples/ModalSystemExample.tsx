import React, { useState } from 'react';
import { Button, Space, message } from 'antd';
import { SettingOutlined, FolderOpenOutlined, SaveOutlined } from '@ant-design/icons';
import { LibrarySettingsModal, OpenModal, SaveAsModal } from '@/components/modals';
import { Panel } from '@/models/Panel';

/**
 * Example: Using the new modal system in any app
 * 
 * This shows the minimal code needed to add library
 * functionality to any component.
 */
export default function ExampleAppWithModals() {
  // 1. State for your app
  const [currentPanel, setCurrentPanel] = useState<any>(null);
  
  // 2. State for modals
  const [showSettings, setShowSettings] = useState(false);
  const [showOpen, setShowOpen] = useState(false);
  const [showSaveAs, setShowSaveAs] = useState(false);

  // 3. Handler for opening an entity
  const handleOpenPanel = (panelData: any) => {
    try {
      const panel = Panel.fromObject(panelData);
      setCurrentPanel(panel);
      message.success(`Loaded: ${panelData.name}`);
    } catch (err) {
      message.error('Failed to load panel');
    }
  };

  // 4. Handler for saving an entity (optional - modal handles the save)
  const handleSavePanel = async (name: string, panelData: any) => {
    console.log(`Panel "${name}" was saved successfully`);
    // The SaveAsModal already saved to Google Drive
    // This callback is just for any additional actions you need
  };

  // 5. Render buttons and modals
  return (
    <div>
      <h1>My App</h1>
      
      {/* Your app UI */}
      <div>
        {currentPanel ? (
          <div>Current Panel: {currentPanel.name}</div>
        ) : (
          <div>No panel loaded</div>
        )}
      </div>

      {/* Action buttons */}
      <Space>
        <Button 
          icon={<SettingOutlined />}
          onClick={() => setShowSettings(true)}
        >
          Library Settings
        </Button>
        
        <Button 
          icon={<FolderOpenOutlined />}
          onClick={() => setShowOpen(true)}
        >
          Open
        </Button>
        
        <Button 
          icon={<SaveOutlined />}
          onClick={() => setShowSaveAs(true)}
          disabled={!currentPanel}
        >
          Save As
        </Button>
      </Space>

      {/* Modals - that's it! */}
      <LibrarySettingsModal
        visible={showSettings}
        jsonKey="panels"
        displayLabel="Panel"
        onClose={() => setShowSettings(false)}
      />

      <OpenModal
        visible={showOpen}
        jsonKey="panels"
        displayLabel="Panel"
        onOpen={handleOpenPanel}
        onClose={() => setShowOpen(false)}
      />

      <SaveAsModal
        visible={showSaveAs}
        jsonKey="panels"
        displayLabel="Panel"
        entityData={currentPanel?.toJSON()}
        onSave={handleSavePanel}
        onClose={() => setShowSaveAs(false)}
      />
    </div>
  );
}

/**
 * To use with different entity types, just change the jsonKey and displayLabel:
 * 
 * For Songs:
 * <OpenModal jsonKey="songs" displayLabel="Song" ... />
 * 
 * For Recipes:
 * <OpenModal jsonKey="recipes" displayLabel="Recipe" ... />
 * 
 * For Patterns:
 * <OpenModal jsonKey="colorworkPatterns" displayLabel="Pattern" ... />
 */
