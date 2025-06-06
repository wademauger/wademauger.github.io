import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Steps, Layout, Card, Row, Col, Button, message, Space, Upload } from 'antd';
import { SaveOutlined, DownloadOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import PatternSetup from './components/PatternSetup';
import CustomShapeStep from './components/CustomShapeStep';
import SizingStep from './components/SizingStep';
import GaugeStep from './components/GaugeStep';
import ColorworkStep from './components/ColorworkStep';
import PreviewStep from './components/PreviewStep';
import InteractiveKnitting from './components/InteractiveKnitting';
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

  // Load session on mount - simplified for debugging
  useEffect(() => {
    // Generate new session ID
    const newSessionId = `knitting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    dispatch(updatePatternData({ section: null, data: { sessionId: newSessionId } }));
    
    // Set custom pattern as default
    const customPattern = { 
      id: 'custom', 
      name: 'Create Custom Pattern', 
      description: 'Design your own pattern from scratch',
      shapes: null
    };
    dispatch(updatePatternData({ section: null, data: { basePattern: customPattern } }));
  }, [dispatch]);

  // Simplified handlers for debugging
  const handleSave = () => {
    message.success('Save button clicked (debug mode)');
  };

  const handleExport = () => {
    message.success('Export button clicked (debug mode)');
  };

  const handleImport = () => {
    message.success('Import button clicked (debug mode)');
    return false;
  };

  const handleReset = () => {
    dispatch(resetSession());
    message.success('Session reset');
  };

  // Navigation handlers
  const handleNext = () => {
    dispatch(nextStep());
  };

  const handlePrevious = () => {
    dispatch(previousStep());
  };

  const handleStepClick = (step) => {
    dispatch(jumpToStep(step));
  };

  const renderStepContent = () => {
    const currentStepKey = steps[currentStep]?.key;
    
    // Add safety checks for patternData
    if (!patternData) {
      return (
        <Card>
          <h2>Loading...</h2>
          <p>Initializing pattern data...</p>
        </Card>
      );
    }
    
    if (currentStepKey === 'setup') {
      return (
        <PatternSetup
          data={patternData}
          onChange={(data) => dispatch(updatePatternData({ section: null, data }))}
          onNext={handleNext}
        />
      );
    }
    
    if (currentStepKey === 'custom') {
      return (
        <CustomShapeStep
          data={patternData}
          onChange={(data) => dispatch(updatePatternData({ section: null, data }))}
          onNext={handleNext}
          onBack={handlePrevious}
        />
      );
    }
    
    if (currentStepKey === 'sizing') {
      // Transform Redux state to match SizingStep expectations
      // Ensure customDimensions always exists
      const defaultCustomDimensions = {
        chest: 40,
        length: 60,
        armLength: 25
      };
      
      const sizingData = {
        method: patternData.sizing?.method || 'percentage',
        scale: patternData.sizing?.percentage || 100,
        customDimensions: {
          chest: patternData.sizing?.width || defaultCustomDimensions.chest,
          length: patternData.sizing?.height || defaultCustomDimensions.length,
          armLength: patternData.sizing?.armLength || defaultCustomDimensions.armLength
        }
      };

      // Create a modified pattern data that includes custom shapes or base pattern shapes
      const modifiedPatternData = {
        ...patternData,
        basePattern: {
          ...patternData.basePattern,
          shapes: patternData.customShapes && Object.keys(patternData.customShapes).length > 0 
            ? patternData.customShapes 
            : patternData.basePattern?.shapes
        }
      };
      
      return (
        <SizingStep
          data={sizingData}
          patternData={modifiedPatternData}
          onChange={(data) => {
            // Transform back to Redux state format
            const reduxData = {
              method: data.method || 'percentage',
              percentage: data.scale || 100,
              width: data.customDimensions?.chest || 40,
              height: data.customDimensions?.length || 60,
              armLength: data.customDimensions?.armLength || 25
            };
            dispatch(updatePatternData({ section: 'sizing', data: reduxData }));
          }}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      );
    }
    
    if (currentStepKey === 'gauge') {
      return (
        <GaugeStep
          data={patternData}
          onUpdate={(data) => dispatch(updatePatternData({ section: 'gauge', data }))}
          onNext={handleNext}
          onPrev={handlePrevious}
        />
      );
    }
    
    if (currentStepKey === 'colorwork') {
      return (
        <ColorworkStep
          data={patternData.colorwork || { enabled: false, layers: [], type: 'stranded' }}
          onUpdate={(data) => dispatch(updatePatternData({ section: 'colorwork', data }))}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      );
    }
    
    if (currentStepKey === 'preview') {
      return (
        <PreviewStep
          data={patternData}
          onUpdate={(data) => dispatch(updatePatternData({ section: 'preview', data }))}
          onNext={handleNext}
          onPrev={handlePrevious}
          onStartKnitting={() => {
            message.success('Starting interactive knitting mode (debug)');
            handleNext();
          }}
        />
      );
    }
    
    if (currentStepKey === 'knitting') {
      return (
        <InteractiveKnitting
          data={patternData}
          onUpdate={(data) => dispatch(updatePatternData({ section: null, data }))}
          onPrev={handlePrevious}
          onExit={() => {
            message.success('Exiting knitting mode (debug)');
            handlePrevious();
          }}
        />
      );
    }
    
    return (
      <Card>
        <h2>Debug Mode - All Components Loaded Successfully!</h2>
        <p>Current step: {currentStep}</p>
        <p>Step name: {steps[currentStep]?.title}</p>
        <p>Pattern name: {patternData.name || 'No name set'}</p>
        <p>All step components are now imported and working:</p>
        <ul>
          <li>✅ PatternSetup</li>
          <li>✅ PatternEditor (always available as step 2)</li>
          <li>✅ SizingStep</li>
          <li>✅ GaugeStep</li>
          <li>✅ ColorworkStep</li>
          <li>✅ PreviewStep</li>
          <li>✅ InteractiveKnitting</li>
        </ul>
        <p><strong>New Flow:</strong> Users can now edit any pattern in the Pattern Editor step!</p>
      </Card>
    );
  };

  return (
    <Layout className="knitting-design-app">
      <Content>
        <div className="design-container">
          {/* Progress Steps */}
          <Card className="progress-card">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Steps
                  current={currentStep}
                  onChange={handleStepClick}
                  items={steps.map((step, index) => ({
                    title: step.title,
                    disabled: false
                  }))}
                  className="design-steps"
                />
              </Col>
            </Row>
          </Card>

          {/* Step Content */}
          <div className="step-content">
            {renderStepContent()}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default KnittingDesignApp;
