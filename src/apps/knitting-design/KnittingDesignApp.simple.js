import React from 'react';
import { useSelector } from 'react-redux';
import { Layout, Card, Steps } from 'antd';
import { 
  selectCurrentStepInfo,
  selectPatternData
} from '../../store/knittingDesignSlice';

const { Content } = Layout;

const KnittingDesignAppSimple = ({ view = 'designer' }) => {
  const stepInfo = useSelector(selectCurrentStepInfo);
  const patternData = useSelector(selectPatternData);
  
  const { currentStep, steps } = stepInfo;
  
  return (
    <Layout className="knitting-design-app">
      <Content>
        <Card>
          <h1>Knitting Design App - Redux Test</h1>
          <p>Testing Redux integration with Ant Design...</p>
          <p>Pattern name: {patternData.name || 'No name set'}</p>
          <p>Current step: {currentStep}</p>
          <p>Total steps: {steps.length}</p>
          
          <Steps
            current={currentStep}
            items={steps.map((step) => ({
              title: step.title,
            }))}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default KnittingDesignAppSimple;
