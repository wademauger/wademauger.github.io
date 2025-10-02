import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Radio, Collapse, Steps } from 'antd';

const { Panel: AntPanel } = Collapse;
const { Step } = Steps;

const PatternInstructions = ({ patternId, panelId, instructions = [], isKnitting, setIsKnitting, handleCancel }) => {
    const [currentStep, setCurrentStep] = useState(0); // State of which knitting instruction the user is on
    const [isCompleted, setIsCompleted] = useState(false); // State to control the completion message
    const [activeKey, setActiveKey] = useState([]); // State to control the collapse panel, initially empty to keep it closed
    const currentStepRef = useRef(null); // Create a ref for the current step element

    const handleNextStep = useCallback(() => {
        if (currentStep + 1 === instructions.length) {
            setIsCompleted(true);
            handleCancel(true); // Pass true to skip confirmation
        } else {
            setCurrentStep(prevStep => (prevStep + 1) % instructions.length);
        }
    }, [currentStep, instructions.length, handleCancel]);

    const handlePreviousStep = useCallback(() => {
        setCurrentStep(prevStep => (prevStep - 1 + instructions.length) % instructions.length);
    }, [instructions.length]);

    useEffect(() => {
        if (!isKnitting) return;

        const handleKeyPress = (event) => {
            if (event.key === 'ArrowRight') {
                handleNextStep();
            }
            if (event.key === 'ArrowLeft') {
                handlePreviousStep();
            }
        };
        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [isKnitting, handleNextStep, handlePreviousStep]);

    useEffect(() => {
        // Reset currentStep and isCompleted when the pattern or panel changes
        setCurrentStep(0);
        setIsCompleted(false);
    }, [patternId, panelId]);

    useEffect(() => {
        // Scroll the current step element into view when the step changes
        if (currentStepRef.current) {
            currentStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentStep]);

    const getKnittingControls = () => (isKnitting ? (
        <div className="row flex knitting-controls sticky-controls">
            <Radio.Group buttonStyle="solid">
                <Radio.Button onClick={handlePreviousStep}>Step Back</Radio.Button>
                <Radio.Button onClick={handleNextStep}> Next Step</Radio.Button>
                <Radio.Button onClick={() => handleCancelClick(false)}>Cancel</Radio.Button>
            </Radio.Group>
        </div>
    ) : null);

    const handleButtonClick = (event) => {
        event.stopPropagation(); // Prevent collapse from toggling
        setIsKnitting(`${patternId}-${panelId}`, setCurrentStep);
        setIsCompleted(false);
        setActiveKey(['1']); // Ensure the collapse is open
    };

    const handleCancelClick = (skipConfirm) => {
        handleCancel(skipConfirm);
        setActiveKey([]); // Close the collapse
    };

    return (
        <div className="panel-instructions">
            <Collapse size="large" activeKey={activeKey} onChange={setActiveKey}>
                <AntPanel
                    header={
                        <div className="panel-header">
                            {panelId}
                            {!isKnitting && (
                                <Button
                                    type="primary"
                                    className="start-knitting-button spaced-button"
                                    onClick={handleButtonClick}
                                >
                                    Start Knitting
                                </Button>
                            )}
                        </div>
                    }
                    key="1"
                >
                    {getKnittingControls()}
                    <Steps size="small" current={currentStep} direction="vertical">
                        {instructions.map((step, index) => (
                            <Step key={index} title={step} ref={index === currentStep ? currentStepRef : null} />
                        ))}
                    </Steps>
                    {isCompleted && (
                        <div className="completion-message">
                            You have completed the panel!
                        </div>
                    )}
                </AntPanel>
            </Collapse>
        </div>
    );
};

export default PatternInstructions;