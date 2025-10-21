import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Typography, Tag, Space, Button, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { setCurrentRowIndex, addCompletedRow } from '../store/knittingDesignSlice';
import { calculateStepFromRow, getProgressMapping, calculateRowSkipForSteps } from '../utils/knittingProgressUtils';

const { Text, Title } = Typography;
const { confirm } = Modal;

/**
 * RowByRowInstructions - Component for displaying row-by-row knitting instructions
 * with both shaping and colorwork information
 * Now uses Redux for progress tracking with confirmation for multi-row jumps
 */
const RowByRowInstructions = ({ stitchPlan }: { stitchPlan: any }) => {
    const dispatch = useDispatch();
    const knittingProgress = useSelector((state: any) => state.knittingDesign.knittingProgress);
    
    if (!stitchPlan || !stitchPlan.rows || stitchPlan.rows.length === 0) {
        return (
            <div className="row-by-row-instructions">
                <Text type="secondary">No instructions available</Text>
            </div>
        );
    }

    const instructions = stitchPlan.generateKnittingInstructions();
    // Determine machine type from global pattern data if available for better UX
    const machineType = (stitchPlan && stitchPlan.knittingOptions && stitchPlan.knittingOptions.machineType) || 'hand';
    const currentRowIndex = knittingProgress.currentRowIndex;
    
    // Calculate current step from current row
    const currentStepIndex = calculateStepFromRow(currentRowIndex, instructions);
    const progressMapping = getProgressMapping(currentRowIndex, instructions);

    // Get current step data
    const currentStepData = currentStepIndex < instructions.length 
        ? instructions[currentStepIndex]?.stepData 
        : null;

    // Navigate to row with confirmation if jumping multiple rows
    const navigateToRow = (targetRowIndex: number, actionDescription: string) => {
        const rowsToSkip = Math.abs(targetRowIndex - currentRowIndex);
        
        if (rowsToSkip > 1) {
            confirm({
                title: 'Confirm Navigation',
                icon: <ExclamationCircleOutlined />,
                content: `${actionDescription} will skip ${rowsToSkip} rows. Are you sure?`,
                onOk() {
                    dispatch(setCurrentRowIndex(targetRowIndex));
                },
                onCancel() {
                    console.log('Navigation cancelled');
                }
            });
        } else {
            dispatch(setCurrentRowIndex(targetRowIndex));
        }
    };

    // Step navigation handlers
    const handlePreviousStep = () => {
        if (currentStepIndex > 0) {
            const rowSkip = calculateRowSkipForSteps(currentStepIndex, -1, instructions);
            const targetRow = Math.max(0, currentRowIndex + rowSkip);
            navigateToRow(targetRow, 'Going to previous step');
        }
    };

    const handleNextStep = () => {
        if (currentStepIndex < instructions.length - 1) {
            const rowSkip = calculateRowSkipForSteps(currentStepIndex, 1, instructions);
            const targetRow = Math.min(stitchPlan.rows.length - 1, currentRowIndex + rowSkip);
            navigateToRow(targetRow, 'Going to next step');
        }
    };

    // Single row navigation handlers
    const handlePreviousRow = () => {
        if (currentRowIndex > 0) {
            dispatch(setCurrentRowIndex(currentRowIndex - 1));
        }
    };

    const handleNextRow = () => {
        if (currentRowIndex < stitchPlan.rows.length - 1) {
            dispatch(setCurrentRowIndex(currentRowIndex + 1));
            dispatch(addCompletedRow(currentRowIndex));
        }
    };

    return (
        <div className="row-by-row-instructions">
            {/* Mode Toggle */}
            <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #d9d9d9' }}>
                {/* Navigation Controls */}
                <Row gutter={[16, 8]}>
                    <Col span={24}>
                        <Space wrap size="large">
                            {/* Step Navigation */}
                            <Space>
                                <Text strong>Step:</Text>
                                <Button 
                                    type="default"
                                    onClick={handlePreviousStep}
                                    disabled={currentStepIndex === 0}
                                >
                                    ← Prev
                                </Button>
                                <Text>{currentStepIndex + 1} of {instructions.length}</Text>
                                <Button 
                                    type="primary"
                                    onClick={handleNextStep}
                                    disabled={currentStepIndex === instructions.length - 1}
                                >
                                    Next →
                                </Button>
                            </Space>
                            
                            {/* Row Navigation */}
                            <Space>
                                <Text strong>Row:</Text>
                                <Button 
                                    type="default"
                                    size="small"
                                    onClick={handlePreviousRow}
                                    disabled={currentRowIndex === 0}
                                >
                                    ← Prev
                                </Button>
                                <Text>{currentRowIndex + 1} of {stitchPlan.rows.length}</Text>
                                <Button 
                                    type="default"
                                    size="small"
                                    onClick={handleNextRow}
                                    disabled={currentRowIndex === stitchPlan.rows.length - 1}
                                >
                                    Next →
                                </Button>
                            </Space>
                        </Space>
                    </Col>
                </Row>
            </div>

            {/* Progress indicator */}
            <Row style={{ marginBottom: 12 }}>
                <Col span={24}>
                    <div style={{
                        height: '4px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '2px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            backgroundColor: '#1890ff',
                            width: `${((currentStepIndex + 1) / instructions.length) * 100}%`,
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </Col>
            </Row>

            {instructions.map((instruction: any, stepIndex: number) => {
                // Get step data for this instruction
                const stepData = instruction.stepData || null;
                const instrText = instruction.text || String(instruction);
                
                // Check if this is the current step
                const isCurrentStep = stepIndex === currentStepIndex;
                const isCompleted = stepIndex < currentStepIndex;
                
                // For multi-row steps, check if we're on a row within this step
                const stepStartRow = stepData?.startRowIndex ?? stepIndex;
                const stepEndRow = stepData?.endRowIndex ?? stepIndex;
                const isWithinThisStep = currentRowIndex >= stepStartRow && currentRowIndex <= stepEndRow;
                const shouldHighlight = isCurrentStep || isWithinThisStep;
                
                // Determine which row to use for stitch count display
                const rowIndex = stepData ? stepData.endRowIndex : stepIndex;
                const stitchPlanRow = stitchPlan.rows[rowIndex];
                
                // Display label shows step and row range
                const displayLabel = stepData 
                    ? `Step ${stepIndex + 1} (Rows ${stepData.startRowIndex + 1}-${stepData.endRowIndex + 1})`
                    : `Step ${stepIndex + 1}`;
                
                return (
                    <Card 
                        key={stepIndex}
                        size="small"
                        style={{
                            marginBottom: 8,
                            backgroundColor: shouldHighlight ? '#e6f7ff' : isCompleted ? '#f6ffed' : 'white',
                            border: shouldHighlight ? '2px solid #1890ff' : '1px solid #d9d9d9'
                        }}
                    >
                        <Row>
                            <Col span={24}>
                                <Title level={5}>{displayLabel}</Title>
                                <Text style={{ fontSize: '15px', fontWeight: 500 }}>{instrText}</Text>
                            </Col>
                        </Row>
                        {/* Row-by-row instructions for this step */}
                        {Array.isArray(instruction.rows) && instruction.rows.length > 0 && (
                            <div style={{ marginTop: 8, marginBottom: 8 }}>
                                {instruction.rows.map((rowInstr: string, rowIdx: number) => (
                                    <div key={rowIdx} style={{ fontSize: '13px', marginLeft: 12, marginBottom: 2 }}>
                                        {rowInstr}
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Absolute positioning information */}
                        {stepData && stepData.absolutePositioning && (
                            <Row style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                                <Col span={24}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        <strong>Needle Position ({machineType}): </strong>
                                        {stepData.absolutePositioning.needleRange ? (
                                            <>
                                                {stepData.absolutePositioning.description}
                                                {' '}
                                                <Tag style={{ marginLeft: 8 }}>{stepData.absolutePositioning.needleRange}</Tag>
                                            </>
                                        ) : (
                                            <>
                                                {stepData.absolutePositioning.totalStitches} stitches total 
                                                ({stepData.absolutePositioning.leftStitches} left, {stepData.absolutePositioning.rightStitches} right)
                                            </>
                                        )}
                                    </Text>
                                </Col>
                            </Row>
                        )}
                    </Card>
                );
            })}
        </div>
    );
};

/**
 * ColorworkRowChart - Simple visual chart showing colorwork for a single row
 */
const ColorworkRowChart = ({ colorworkInstructions, totalStitches }: { colorworkInstructions: any[], totalStitches: number }) => {
    if (!colorworkInstructions || colorworkInstructions.length === 0) {
        return null;
    }

    const stitchWidth = Math.max(8, Math.min(20, 400 / totalStitches)); // Adaptive stitch width
    const chartWidth = totalStitches * stitchWidth;
    const chartHeight = 20;

    let currentPosition = 0;
    const rectangles = colorworkInstructions.map((segment: any, index: number) => {
        const segmentWidth = segment.stitchCount * stitchWidth;
        const rect = (
            <rect
                key={index}
                x={currentPosition}
                y={0}
                width={segmentWidth}
                height={chartHeight}
                fill={segment.colorHex}
                stroke="#000"
                strokeWidth="0.5"
            />
        );
        currentPosition += segmentWidth;
        return rect;
    });

    return (
        <div style={{ marginTop: 4 }}>
            <Text strong style={{ fontSize: '11px' }}>Visual Pattern:</Text>
            <div style={{ marginTop: 2 }}>
                <svg 
                    width={chartWidth} 
                    height={chartHeight}
                    style={{ border: '1px solid #ddd', borderRadius: '2px' }}
                >
                    {rectangles}
                </svg>
            </div>
        </div>
    );
};

/**
 * Calculate contrast color for text visibility
 */
const getContrastColor = (hexColor: string) => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#ffffff';
};

export default RowByRowInstructions;
