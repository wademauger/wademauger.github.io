import React, { useState } from 'react';
import { Modal, Input, message, Typography, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { saveEntry } from '../store/librarySlice';
import { openLibrarySettingsModal } from '../reducers/modal.reducer';

interface Props {
  visible: boolean;
  onClose: () => void;
  fileId?: string | null;
  libraryData?: any;
  onSave?: (result?: any) => void;
}

export default function LibrarySaveDialog({ visible, onClose, fileId, libraryData, onSave }: Props) {
  const [filename, setFilename] = useState('library.json');
  const [isSaving, setSaving] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const selectedFile = useSelector((state: RootState) => state.library?.selectedFile);

  const handleOpenLibrarySettings = () => {
    // Open the global library settings modal so the user can select/create a library
    dispatch(openLibrarySettingsModal('panels'));
    // close this dialog since user will select a library in the modal
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // If there's an explicit fileId prop, try to save to that file as a full library fallback
      if (fileId) {
        // If the caller passed a fileId we don't have a specialized per-entry helper for that case here.
        // Use the generic approach via saveEntry by temporarily dispatching saveEntry which will attempt
        // to use selectedFile from state; since fileId is provided, the caller should prefer helperSaveToFile.
        // For simplicity, if fileId is provided we'll still attempt to save the payload as a panel entry.
        await dispatch(saveEntry({ entry: libraryData || {}, type: 'panel' })).unwrap();
        message.success('Saved to selected library file');
        onSave && onSave({ success: true });
        onClose();
        return;
      }

      // If a library is selected in global state, save this panel into the library using saveEntry
      if (selectedFile && selectedFile.id) {
        await dispatch(saveEntry({ entry: libraryData || {}, type: 'panel' })).unwrap();
        message.success('Panel saved to current library');
        onSave && onSave({ success: true });
        onClose();
      } else {
        // No library selected — surface guidance and provide a link to open library settings
        message.error('No library selected. Please choose or create a library first.');
      }
    } catch (err: any) {
      message.error('Save failed: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  const noLibrary = !(selectedFile && selectedFile.id) && !fileId;

  return (
    <Modal visible={visible} title={noLibrary ? 'Save Panel' : 'Save to Library'} onCancel={onClose} onOk={handleSave} confirmLoading={isSaving}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {noLibrary ? (
          <div>
            <Typography.Paragraph>
              No library is currently selected. You must select or create a library before saving a panel.
            </Typography.Paragraph>
            <Button type="primary" onClick={handleOpenLibrarySettings}>Open Library Settings</Button>
          </div>
        ) : (
          <div>
            <Typography.Paragraph>
              This will save the current panel into the selected library (<strong>{selectedFile?.name || fileId}</strong>).
            </Typography.Paragraph>
            <Input value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="Optional filename" />
          </div>
        )}
      </div>
    </Modal>
  );
}
