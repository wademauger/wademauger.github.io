/**
 * PanelCard - Self-contained panel card with colorwork controls
 */

import React, { useState } from 'react';
import { Card, InputNumber, Button, Typography, Collapse } from 'antd';
import { EditOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { PanelCardProps } from '../types/patternWizard.types';
import { PanelDiagram } from '../../../components/PanelDiagram';
import '../styles/PatternWizard.css';

const { Text } = Typography;
const { Panel } = Collapse;

export const PanelCard: React.FC<PanelCardProps> = ({
  panelKey,
  panelName,
  quantity,
  shape,
  dimensions,
  isExpanded,
  completedInstances,
  totalInstances,
  onQuantityChange,
  onEditColorwork,
  onExpandToggle
}) => {
  const allCompleted = totalInstances > 0 && completedInstances === totalInstances;
  const hasProgress = completedInstances > 0;
  const needsColorwork = totalInstances > 0 && completedInstances === 0;

  // Progress percentage
  const progressPercent = totalInstances > 0 
    ? Math.round((completedInstances / totalInstances) * 100) 
    : 0;

  // Status color and icon
  const getStatusColor = () => {
    if (allCompleted) return '#52c41a';
    if (hasProgress) return '#faad14';
    return '#d9d9d9';
  };

  const getStatusIcon = () => {
    if (allCompleted) return <CheckCircleOutlined />;
    if (hasProgress) return <ClockCircleOutlined />;
    return <ClockCircleOutlined />;
  };

  return (
    <Card
      className={`panel-card ${isExpanded ? 'panel-card-expanded' : ''} ${allCompleted ? 'panel-card-completed' : ''}`}
      style={{
        borderColor: isExpanded ? '#1890ff' : allCompleted ? '#52c41a' : '#d9d9d9',
        boxShadow: isExpanded 
          ? '0 4px 12px rgba(24, 144, 255, 0.3)' 
          : allCompleted 
            ? '0 2px 8px rgba(82, 196, 26, 0.2)'
            : '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
      bodyStyle={{ padding: 12 }}
    >
      {/* Panel header with name and quantity */}
      <div className="panel-card-header">
        <div className="panel-card-title">
          <Text strong style={{ fontSize: 14 }}>{panelName}</Text>
        </div>
        <div className="panel-card-quantity">
          <Text style={{ fontSize: 12, color: '#666', marginRight: 8 }}>Qty:</Text>
          <InputNumber
            size="small"
            min={0}
            max={20}
            value={quantity}
            onChange={(value) => onQuantityChange(value || 0)}
            style={{ width: 60 }}
          />
        </div>
      </div>

      {/* Panel preview diagram */}
      <div className="panel-card-preview">
        {shape ? (
          <PanelDiagram 
            shape={shape} 
            label="" 
            size={100} 
            padding={8}
          />
        ) : (
          <div className="panel-card-no-preview">
            No Preview
          </div>
        )}
      </div>

      {/* Panel dimensions */}
      {dimensions && (
        <div className="panel-card-dimensions">
          <Text style={{ fontSize: 11, color: '#666' }}>
            {dimensions.totalStitches} × {dimensions.totalRows} stitches
          </Text>
          <br />
          <Text style={{ fontSize: 10, color: '#999' }}>
            ({dimensions.widthInches.toFixed(1)}" × {dimensions.heightInches.toFixed(1)}")
          </Text>
        </div>
      )}

      {/* Colorwork progress indicator */}
      <div 
        className="panel-card-progress"
        style={{
          backgroundColor: allCompleted ? '#f6ffed' : hasProgress ? '#fff7e6' : '#fafafa',
          borderColor: getStatusColor()
        }}
      >
        <div className="panel-card-progress-content">
          <span style={{ color: getStatusColor(), marginRight: 6 }}>
            {getStatusIcon()}
          </span>
          <Text style={{ fontSize: 12, color: allCompleted ? '#389e0d' : hasProgress ? '#d48806' : '#8c8c8c' }}>
            {allCompleted && '✓ All Instances Colored'}
            {hasProgress && !allCompleted && `${completedInstances}/${totalInstances} Colored`}
            {needsColorwork && 'Needs Colorwork'}
            {totalInstances === 0 && 'No instances'}
          </Text>
        </div>
        {totalInstances > 0 && (
          <div className="panel-card-progress-bar">
            <div 
              className="panel-card-progress-fill"
              style={{ 
                width: `${progressPercent}%`,
                backgroundColor: getStatusColor()
              }}
            />
          </div>
        )}
      </div>

      {/* Edit colorwork button */}
      {totalInstances > 0 && (
        <Button
          type={isExpanded ? "primary" : "default"}
          icon={<EditOutlined />}
          onClick={onEditColorwork}
          block
          style={{ marginTop: 12 }}
        >
          {isExpanded ? 'Editing Colorwork' : 'Edit Colorwork'}
        </Button>
      )}
    </Card>
  );
};

export default PanelCard;
