/**
 * PanelSummary - Floating summary of panel completion status
 */

import React from 'react';
import { Card, Typography, Progress, Space, Button } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { PanelSummaryProps } from '../types/patternWizard.types';
import '../styles/PatternWizard.css';

const { Text, Title } = Typography;

export const PanelSummary: React.FC<PanelSummaryProps> = ({
  totalPanelTypes,
  totalInstances,
  completedInstances,
  isExpanded = false,
  onToggleExpanded
}) => {
  const completionPercent = totalInstances > 0 
    ? Math.round((completedInstances / totalInstances) * 100) 
    : 0;
  
  const isAllComplete = totalInstances > 0 && completedInstances === totalInstances;
  const hasProgress = completedInstances > 0;

  const getStatusColor = () => {
    if (isAllComplete) return '#52c41a';
    if (hasProgress) return '#faad14';
    return '#d9d9d9';
  };

  const getStatusIcon = () => {
    if (isAllComplete) return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />;
    if (hasProgress) return <ClockCircleOutlined style={{ color: '#faad14', fontSize: 18 }} />;
    return <ClockCircleOutlined style={{ color: '#d9d9d9', fontSize: 18 }} />;
  };

  return (
    <Card 
      className={`panel-summary ${isExpanded ? 'panel-summary-expanded' : 'panel-summary-collapsed'}`}
      style={{
        position: 'sticky',
        top: 16,
        zIndex: 10,
        backgroundColor: isAllComplete ? '#f6ffed' : hasProgress ? '#fff7e6' : '#fafafa',
        borderColor: getStatusColor(),
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}
      bodyStyle={{ padding: isExpanded ? 16 : 12 }}
    >
      <div className="panel-summary-header" onClick={onToggleExpanded} style={{ cursor: 'pointer' }}>
        <Space size={12} align="center">
          {getStatusIcon()}
          <div>
            <Title level={5} style={{ margin: 0, fontSize: 14 }}>
              Pattern Progress
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {completedInstances} of {totalInstances} instances completed
            </Text>
          </div>
        </Space>
        {onToggleExpanded && (
          <Button 
            type="text" 
            size="small" 
            icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
          />
        )}
      </div>

      {isExpanded && (
        <div className="panel-summary-details" style={{ marginTop: 16 }}>
          {/* Progress bar */}
          <Progress 
            percent={completionPercent} 
            status={isAllComplete ? 'success' : 'active'}
            strokeColor={getStatusColor()}
            style={{ marginBottom: 12 }}
          />

          {/* Stats */}
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12 }}>Panel Types:</Text>
              <Text strong style={{ fontSize: 12 }}>{totalPanelTypes}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12 }}>Total Instances:</Text>
              <Text strong style={{ fontSize: 12 }}>{totalInstances}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12 }}>Completed:</Text>
              <Text strong style={{ fontSize: 12, color: getStatusColor() }}>
                {completedInstances}
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12 }}>Remaining:</Text>
              <Text strong style={{ fontSize: 12 }}>{totalInstances - completedInstances}</Text>
            </div>
          </Space>

          {/* Status message */}
          <div 
            style={{ 
              marginTop: 12, 
              padding: 8, 
              backgroundColor: 'white',
              borderRadius: 4,
              textAlign: 'center'
            }}
          >
            {isAllComplete && (
              <Text style={{ color: '#52c41a', fontSize: 12 }}>
                ✓ All panels completed! Ready to start knitting.
              </Text>
            )}
            {hasProgress && !isAllComplete && (
              <Text style={{ color: '#d48806', fontSize: 12 }}>
                Keep going! {totalInstances - completedInstances} instance{totalInstances - completedInstances !== 1 ? 's' : ''} remaining.
              </Text>
            )}
            {!hasProgress && totalInstances > 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                No colorwork completed yet. Start editing panels!
              </Text>
            )}
            {totalInstances === 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Add panels to your project to get started.
              </Text>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default PanelSummary;
