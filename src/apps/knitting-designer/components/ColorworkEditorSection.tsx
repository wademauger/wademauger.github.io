/**
 * ColorworkEditorSection - Inline colorwork editor with navigation
 */

import React from 'react';
import { Button, Typography, Space } from 'antd';
import { LeftOutlined, RightOutlined, CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { ColorworkEditorSectionProps } from '../types/patternWizard.types';
import ColorworkPanelEditor from '../../../components/ColorworkPanelEditor';
import PanelInstanceList from './PanelInstanceList';
import { useSelector } from 'react-redux';
import '../styles/PatternWizard.css';

const { Title, Text } = Typography;

export const ColorworkEditorSection: React.FC<ColorworkEditorSectionProps> = ({
  currentInstance,
  panelConfig,
  allInstances,
  coloredInstances,
  onSave,
  onNext,
  onPrevious,
  onClose,
  canGoNext,
  canGoPrevious
}) => {
  const patternData: any = useSelector((state: any) => state?.knittingDesign?.patternData);

  if (!currentInstance) {
    return (
      <div className="colorwork-editor-section">
        <div className="colorwork-editor-empty">
          <Text type="secondary">No panel instance selected</Text>
        </div>
      </div>
    );
  }

  // Get current instance index
  const currentIndex = allInstances.findIndex(inst => inst.instanceId === currentInstance.instanceId);
  const totalInstances = allInstances.length;

  return (
    <div className="colorwork-editor-section">
      <div className="colorwork-editor-header">
        <div className="colorwork-editor-title">
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            Edit Colorwork - {currentInstance.panelName}
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Instance {currentIndex + 1} of {totalInstances}
          </Text>
        </div>

        <Space>
          <Button
            icon={<LeftOutlined />}
            onClick={onPrevious}
            disabled={!canGoPrevious}
          >
            Previous
          </Button>
          <Button
            type="primary"
            icon={canGoNext ? <RightOutlined /> : <SaveOutlined />}
            onClick={canGoNext ? onNext : onSave}
          >
            {canGoNext ? 'Save & Next' : 'Save & Complete'}
          </Button>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
          >
            Close
          </Button>
        </Space>
      </div>

      {/* Instance navigation list */}
      <PanelInstanceList
        instances={allInstances}
        currentIndex={currentIndex}
        coloredInstances={coloredInstances}
        onSelectInstance={(index) => {
          // This will be handled by parent - just trigger the navigation
          const difference = index - currentIndex;
          if (difference > 0) {
            // Move forward
            for (let i = 0; i < difference; i++) {
              onNext();
            }
          } else if (difference < 0) {
            // Move backward
            for (let i = 0; i < Math.abs(difference); i++) {
              onPrevious();
            }
          }
        }}
        onCopyColorwork={(sourceId, targetId) => {
          // This needs to be passed up to parent to handle Redux action
          // For now, we'll handle it in the parent component
          console.log('Copy colorwork from', sourceId, 'to', targetId);
        }}
      />

      {/* Colorwork editor */}
      <div className="colorwork-editor-canvas">
        {(() => {
          // Prepare gauge data for the editor
          const wizardGauge = patternData?.gauge || null;
          const stitchesPerFour = wizardGauge?.stitchesPerFourInches 
            ?? (wizardGauge?.stitchesPerInch ? wizardGauge.stitchesPerInch * 4 : undefined);
          const rowsPerFour = wizardGauge?.rowsPerFourInches 
            ?? (wizardGauge?.rowsPerInch ? wizardGauge.rowsPerInch * 4 : undefined);

          const normalizedGauge = wizardGauge && stitchesPerFour && rowsPerFour
            ? {
                stitchesPerInch: stitchesPerFour / 4,
                rowsPerInch: rowsPerFour / 4,
                stitchesPerFourInches: stitchesPerFour,
                rowsPerFourInches: rowsPerFour,
                scalingFactor: typeof wizardGauge.scaleFactor === 'number' && wizardGauge.scaleFactor > 0 
                  ? wizardGauge.scaleFactor 
                  : 1
              }
            : null;

          const initialPanel = {
            shape: panelConfig.shape || null,
            gauge: normalizedGauge
          };

          return (
            <ColorworkPanelEditor
              key={`${currentInstance.instanceId}-editor`}
              initialPanel={initialPanel as any}
              previewKey={currentInstance.instanceId}
              allSelectedPanelKeys={allInstances.map(inst => inst.instanceId)}
              getPanelLabel={(instanceId: string) => {
                const inst = allInstances.find(i => i.instanceId === instanceId);
                return inst ? inst.panelName : instanceId;
              }}
              onRequestPreviewKeyChange={(instanceId: string | null) => {
                if (!instanceId) return;
                const instanceIndex = allInstances.findIndex(i => i.instanceId === instanceId);
                if (instanceIndex >= 0) {
                  // Navigate to that instance
                  const difference = instanceIndex - currentIndex;
                  if (difference > 0) {
                    for (let i = 0; i < difference; i++) {
                      onNext();
                    }
                  } else if (difference < 0) {
                    for (let i = 0; i < Math.abs(difference); i++) {
                      onPrevious();
                    }
                  }
                }
              }}
            />
          );
        })()}
      </div>
    </div>
  );
};

export default ColorworkEditorSection;
