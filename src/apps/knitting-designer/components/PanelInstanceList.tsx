/**
 * PanelInstanceList - Navigation and management for panel instances
 */

import React from 'react';
import { Button, Typography, Space } from 'antd';
import { CopyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { PanelInstanceListProps } from '../types/patternWizard.types';
import '../styles/PatternWizard.css';

const { Text } = Typography;

export const PanelInstanceList: React.FC<PanelInstanceListProps> = ({
  instances,
  currentIndex,
  coloredInstances,
  onSelectInstance,
  onCopyColorwork
}) => {
  if (instances.length === 0) {
    return null;
  }

  const currentInstance = instances[currentIndex];

  return (
    <div className="panel-instance-list">
      <div className="panel-instance-list-header">
        <Text strong style={{ fontSize: 13 }}>
          Panel Instances:
        </Text>
        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
          {coloredInstances.size} of {instances.length} completed
        </Text>
      </div>

      <div className="panel-instance-list-items">
        {instances.map((instance, index) => {
          const isColored = coloredInstances.has(instance.instanceId);
          const isCurrent = index === currentIndex;
          const canCopyToCurrent = isColored && !isCurrent && currentInstance;

          return (
            <div 
              key={instance.instanceId} 
              className={`panel-instance-item ${isCurrent ? 'panel-instance-item-current' : ''}`}
            >
              <Button
                size="small"
                type={isCurrent ? "primary" : "default"}
                onClick={() => onSelectInstance(index)}
                className="panel-instance-button"
                style={{
                  backgroundColor: isCurrent ? undefined : isColored ? '#f6ffed' : undefined,
                  borderColor: isCurrent ? undefined : isColored ? '#b7eb8f' : undefined,
                }}
              >
                <Space size={4}>
                  {isCurrent && <span className="instance-indicator">●</span>}
                  {isColored && !isCurrent && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  {!isColored && !isCurrent && <span className="instance-indicator">○</span>}
                  <span>{instance.panelName}</span>
                </Space>
              </Button>

              {canCopyToCurrent && (
                <Button
                  size="small"
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={() => onCopyColorwork(instance.instanceId, currentInstance.instanceId)}
                  className="panel-instance-copy-button"
                  title={`Copy colorwork from ${instance.panelName} to ${currentInstance.panelName}`}
                >
                  Copy
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PanelInstanceList;
