import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Steps, Layout, Card, Row, Col, Button, message, Space, Upload } from 'antd';
import { SaveOutlined, DownloadOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import PatternSetup from './components/PatternSetup';

// Only import the Redux slice first
import {
  selectCurrentStepInfo,
  selectPatternData,
  selectIsKnittingMode,
  selectIsDirty,
  selectSessionId,
  selectLastSaved,
  nextStep,
  previousStep,
  jumpToStep,
  setKnittingMode,
  updatePatternData,
  loadSession,
  saveSession,
  resetSession
} from '../../store/knittingDesignSlice';
import sessionManager from '../../utils/sessionManager';

import './styles/KnittingDesignApp.css';

const { Content } = Layout;

const KnittingDesignApp = ({ view = 'designer' }) => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const stepInfo = useSelector(selectCurrentStepInfo);
  const patternData = useSelector(selectPatternData);
  const isKnittingMode = useSelector(selectIsKnittingMode);
  const isDirty = useSelector(selectIsDirty);
  const sessionId = useSelector(selectSessionId);
  const lastSaved = useSelector(selectLastSaved);
  
  const { currentStep, steps, canGoNext, canGoPrevious } = stepInfo;

  // Basic handlers without external dependencies
  const handleSave = () => {
    message.success('Pattern saved successfully');
  };

  const handleExport = () => {
    message.success('Pattern exported successfully');
  };

  const handleImport = () => {
    message.success('Pattern imported successfully');
    return false;
  };

  const handleReset = () => {
    dispatch(resetSession());
    message.success('Session reset');
  };

  const handleStepClick = (step) => {
    dispatch(jumpToStep(step));
  };

  return (
    <Layout className="knitting-design-app">
      <Content>
        <div className="design-container">
          {/* Session Management Bar */}
          <Card className="session-bar" size="small">
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <span style={{ color: '#666' }}>
                    {patternData.name || 'Untitled Pattern'}
                  </span>
                  {isDirty && <span style={{ color: '#ff4d4f' }}>●</span>}
                  {lastSaved && (
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      Saved {new Date(lastSaved).toLocaleTimeString()}
                    </span>
                  )}
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    disabled={!isDirty}
                    size="small"
                  >
                    Save
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleExport}
                    size="small"
                  >
                    Export
                  </Button>
                  <Upload
                    accept=".json"
                    beforeUpload={handleImport}
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />} size="small">
                      Import
                    </Button>
                  </Upload>
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={handleReset}
                    danger
                    size="small"
                  >
                    Reset
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Progress Steps */}
          <Card className="progress-card">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Steps
                  current={currentStep}
                  onChange={handleStepClick}
                  items={steps.map((step, index) => ({
                    title: step.title,
                    disabled: false // Allow jumping to any step
                  }))}
                  className="design-steps"
                />
              </Col>
            </Row>
          </Card>

          {/* Step Content */}
          <div className="step-content">
            <Card>
              <h2>Step {currentStep + 1}: {steps[currentStep]?.title}</h2>
              <p>This is a gradual test version without step component imports.</p>
              <p>Pattern data: {JSON.stringify(patternData, null, 2)}</p>
            </Card>
          </div>

          {/* Pattern Setup Component - For Testing */}
          <div className="pattern-setup-test">
            <Card title="Pattern Setup Test">
              <PatternSetup />
            </Card>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default KnittingDesignApp;
