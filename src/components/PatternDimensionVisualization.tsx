// PatternDimensionVisualization.js
// Reusable component for displaying pattern dimensions with engineering-style dimension lines
import React from 'react';
import { Card, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { PanelDiagram } from './PanelDiagram';

const { Text } = Typography;

const PatternDimensionVisualization = ({ 
    panel,
    title = 'Pattern Dimensions',
    subtitle = 'Pattern dimensions with current scaling applied.',
    scaleFactor = 1,
    showInfoText = true,
    infoText = 'Dimension lines show the total pattern dimensions after scaling.',
    containerPadding = '20px 10px',
    diagramSizeMin = 200,
    diagramSizeMax = 500,
    scalingMultiplier = 8,
    ...cardProps
}) => {
    // Validate input
    if (!panel) {
        return (
            <Card title={title} {...cardProps}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '300px',
                    color: '#666',
                    fontSize: '16px'
                }}>
                    No pattern data available
                </div>
            </Card>
        );
    }

    // Calculate actual pattern dimensions using the exact same logic as PanelDiagram
    const calculatePatternDimensions = (shape, scale = 1) => {
        let dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
        
        // Use the same hierarchy rendering logic as PanelDiagram to get accurate dimensions
        const renderHierarchyForDimensions = (trap, scaleParam, xOffset = 0, yOffset = 0) => {
            const trapWidth = Math.max(trap.baseA, trap.baseB) * scaleParam;

            // Compute bounding box of the current trapezoid
            const xTopLeft = xOffset + (trapWidth - trap.baseB * scaleParam) / 2 + (trap.baseBHorizontalOffset || 0) * scaleParam;
            const xTopRight = xOffset + (trapWidth + trap.baseB * scaleParam) / 2 + (trap.baseBHorizontalOffset || 0) * scaleParam;
            const xBottomLeft = xOffset + (trapWidth - trap.baseA * scaleParam) / 2;
            const xBottomRight = xOffset + (trapWidth + trap.baseA * scaleParam) / 2;
            const yTop = yOffset;
            const yBottom = yOffset + trap.height * scaleParam;

            // Update dimensions
            dimensions.minX = Math.min(dimensions.minX, xTopLeft, xTopRight, xBottomLeft, xBottomRight);
            dimensions.maxX = Math.max(dimensions.maxX, xTopLeft, xTopRight, xBottomLeft, xBottomRight);
            dimensions.minY = Math.min(dimensions.minY, yTop, yBottom);
            dimensions.maxY = Math.max(dimensions.maxY, yTop, yBottom);

            if (trap.successors && trap.successors.length > 0) {
                const successorWidths = trap.successors.map((s: any) => Math.max(s.baseA, s.baseB) * scaleParam);
                const totalSuccessorWidth = successorWidths.reduce((sum, w) => sum + w, 0);
                let childXOffset = xOffset + (trapWidth - totalSuccessorWidth) / 2;

                for (let i = trap.successors.length - 1; i >= 0; i--) {
                    const successor = trap.successors[i];
                    renderHierarchyForDimensions(successor, scaleParam, childXOffset, yTop - successor.height * scaleParam);
                    childXOffset += successorWidths[i];
                }
            }
        };

        renderHierarchyForDimensions(shape, scale, 0, 0);
        
        return {
            width: dimensions.maxX - dimensions.minX,
            height: dimensions.maxY - dimensions.minY,
            minX: dimensions.minX,
            maxX: dimensions.maxX,
            minY: dimensions.minY,
            maxY: dimensions.maxY
        };
    };

    // Calculate pattern bounds and visual positioning to match PanelDiagram exactly
    const calculatePanelDiagramBounds = (shape, size, padding = 10) => {
        // First pass: Compute bounding box including negative coordinates (same as PanelDiagram)
        let dimensions = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
        const renderHierarchyForDimensions = (trap, scaleParam, xOffset = 0, yOffset = 0) => {
            const trapWidth = Math.max(trap.baseA, trap.baseB) * scaleParam;
            const xTopLeft = xOffset + (trapWidth - trap.baseB * scaleParam) / 2 + (trap.baseBHorizontalOffset || 0) * scaleParam;
            const xTopRight = xOffset + (trapWidth + trap.baseB * scaleParam) / 2 + (trap.baseBHorizontalOffset || 0) * scaleParam;
            const xBottomLeft = xOffset + (trapWidth - trap.baseA * scaleParam) / 2;
            const xBottomRight = xOffset + (trapWidth + trap.baseA * scaleParam) / 2;
            const yTop = yOffset;
            const yBottom = yOffset + trap.height * scaleParam;

            dimensions.minX = Math.min(dimensions.minX, xTopLeft, xTopRight, xBottomLeft, xBottomRight);
            dimensions.maxX = Math.max(dimensions.maxX, xTopLeft, xTopRight, xBottomLeft, xBottomRight);
            dimensions.minY = Math.min(dimensions.minY, yTop, yBottom);
            dimensions.maxY = Math.max(dimensions.maxY, yTop, yBottom);

            if (trap.successors && trap.successors.length > 0) {
                const successorWidths = trap.successors.map((s: any) => Math.max(s.baseA, s.baseB) * scaleParam);
                const totalSuccessorWidth = successorWidths.reduce((sum, w) => sum + w, 0);
                let childXOffset = xOffset + (trapWidth - totalSuccessorWidth) / 2;

                for (let i = trap.successors.length - 1; i >= 0; i--) {
                    const successor = trap.successors[i];
                    renderHierarchyForDimensions(successor, scaleParam, childXOffset, yTop - successor.height * scaleParam);
                    childXOffset += successorWidths[i];
                }
            }
        };

        renderHierarchyForDimensions(shape, 1, 0, 0);

        const width = dimensions.maxX - dimensions.minX;
        const height = dimensions.maxY - dimensions.minY;

        // Calculate scale factor (same as PanelDiagram)
        const availableWidth = size - 2 * padding;
        const availableHeight = size - 2 * padding;
        const scaleFactor = Math.min(availableWidth / width, availableHeight / height);

        // Calculate scaled dimensions and translation (same as PanelDiagram)
        const scaledWidth = width * scaleFactor;
        const scaledHeight = height * scaleFactor;

        const translateX = (size - scaledWidth) / 2 - dimensions.minX * scaleFactor + padding;
        const translateY = (size - scaledHeight) / 2 - dimensions.minY * scaleFactor + padding;

        return {
            scaledWidth,
            scaledHeight,
            translateX,
            translateY,
            scaleFactor,
            originalWidth: width,
            originalHeight: height
        };
    };

    // Calculate unscaled pattern dimensions for visual sizing
    const visualPatternDimensions = calculatePatternDimensions(panel, 1);
    
    // Calculate scaled pattern dimensions for dimension labels
    const scaledPatternDimensions = calculatePatternDimensions(panel, scaleFactor);

    // Calculate responsive diagram size based on unscaled pattern dimensions for consistent visual size
    const basePatternSize = Math.max(
        visualPatternDimensions.width * scalingMultiplier, 
        visualPatternDimensions.height * scalingMultiplier, 
        diagramSizeMin
    );
    const diagramSize = Math.min(basePatternSize + 80, diagramSizeMax);
    const patternDisplaySize = Math.min(diagramSize - 40, basePatternSize);

    // Calculate the exact positioning used by PanelDiagram
    const panelBounds = calculatePanelDiagramBounds(panel, patternDisplaySize, 10);

    // Pre-calculate dimension values for use in labels
    const patternWidth = scaledPatternDimensions.width;
    const patternHeight = scaledPatternDimensions.height;

    return (
        <Card 
            title={
                <div>
                    <div style={{ fontWeight: 'bold' }}>{title}</div>
                    <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                        {subtitle}
                    </div>
                </div>
            }
            {...cardProps}
        >
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '300px', 
                padding: containerPadding 
            }}>
                <div style={{ position: 'relative', display: 'inline-block', width: `${diagramSize + 120}px` }}>
                    {/* Main pattern container - centered with extra space for dimensions */}
                    <div style={{
                        position: 'relative',
                        width: `${diagramSize}px`,
                        height: `${diagramSize}px`,
                        margin: '0 auto',
                        marginLeft: '60px',
                        marginTop: '40px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        {/* Pattern diagram centered */}
                        <PanelDiagram 
                            shape={panel} 
                            size={patternDisplaySize}
                            padding={10}
                        />
                    </div>
                    
                    {/* Engineering Dimension Lines */}
                    <svg
                        style={{
                            position: 'absolute',
                            top: '0px',
                            left: '0px',
                            width: `${diagramSize + 120}px`,
                            height: `${diagramSize + 80}px`,
                            pointerEvents: 'none',
                            zIndex: 1
                        }}
                    >
                        {/* Define professional arrow markers */}
                        <defs>
                            <marker 
                                id="arrowStart" 
                                markerWidth="8" 
                                markerHeight="8" 
                                refX="2" 
                                refY="3" 
                                orient="auto" 
                                markerUnits="strokeWidth"
                            >
                                <path d="M6,3 L1,1 L1,5 Z" fill="#333" stroke="#333" strokeWidth="0.5" />
                            </marker>
                            <marker 
                                id="arrowEnd" 
                                markerWidth="8" 
                                markerHeight="8" 
                                refX="6" 
                                refY="3" 
                                orient="auto" 
                                markerUnits="strokeWidth"
                            >
                                <path d="M1,3 L6,1 L6,5 Z" fill="#333" stroke="#333" strokeWidth="0.5" />
                            </marker>
                        </defs>
                        
                        {(() => {
                            // Calculate exact pattern bounds using PanelDiagram's positioning logic
                            // The SVG is positioned at (0,0) relative to the entire container
                            // The pattern container has margins: 60px left, 40px top
                            const containerLeft = 60; // marginLeft of pattern container
                            const containerTop = 40;  // marginTop of pattern container
                            const containerWidth = diagramSize;
                            const containerHeight = diagramSize;
                            
                            // PanelDiagram actual size
                            const panelActualWidth = patternDisplaySize;
                            const panelActualHeight = patternDisplaySize;
                            
                            // Flex centering offset within the container
                            const flexCenterX = (containerWidth - panelActualWidth) / 2;
                            const flexCenterY = (containerHeight - panelActualHeight) / 2;
                            
                            // PanelDiagram position within the SVG coordinate system
                            const panelLeft = containerLeft + flexCenterX;
                            const panelTop = containerTop + flexCenterY;
                            
                            // The actual pattern position - use the visual center of the PanelDiagram
                            // instead of relying on translateY which may include extra spacing
                            const panelCenterX = panelLeft + panelActualWidth / 2;
                            const panelCenterY = panelTop + panelActualHeight / 2;
                            
                            // Position pattern around the visual center
                            const patternLeft = panelCenterX - panelBounds.scaledWidth / 2;
                            const patternTop = panelCenterY - panelBounds.scaledHeight / 2;
                            const patternRight = patternLeft + panelBounds.scaledWidth;
                            const patternBottom = patternTop + panelBounds.scaledHeight;
                            
                            // Debug: Add console logging to see where we think the pattern should be
                            console.log('SVG Pattern Position (Fixed):', {
                                patternLeft, patternTop, patternRight, patternBottom,
                                panelCenterX, panelCenterY,
                                panelLeft, panelTop,
                                panelBounds
                            });
                            
                            return (
                                <>
                                    {/* Width dimension line (top) */}
                                    <g>
                                        {/* Connecting lines from pattern to dimension line */}
                                        <line 
                                            x1={patternLeft} 
                                            y1={patternTop} 
                                            x2={patternLeft} 
                                            y2={patternTop - 35} 
                                            stroke="#999" 
                                            strokeWidth="0.6" 
                                            strokeDasharray="1,2" 
                                        />
                                        <line 
                                            x1={patternRight} 
                                            y1={patternTop} 
                                            x2={patternRight} 
                                            y2={patternTop - 35} 
                                            stroke="#999" 
                                            strokeWidth="0.6" 
                                            strokeDasharray="1,2" 
                                        />
                                        
                                        {/* Extension lines */}
                                        <line 
                                            x1={patternLeft} 
                                            y1={patternTop - 35} 
                                            x2={patternLeft} 
                                            y2={patternTop - 40} 
                                            stroke="#666" 
                                            strokeWidth="0.8" 
                                            strokeDasharray="1,1" 
                                        />
                                        <line 
                                            x1={patternRight} 
                                            y1={patternTop - 35} 
                                            x2={patternRight} 
                                            y2={patternTop - 40} 
                                            stroke="#666" 
                                            strokeWidth="0.8" 
                                            strokeDasharray="1,1" 
                                        />
                                        
                                        {/* Main dimension line with arrows */}
                                        <line 
                                            x1={patternLeft} 
                                            y1={patternTop - 37} 
                                            x2={patternRight} 
                                            y2={patternTop - 37} 
                                            stroke="#333" 
                                            strokeWidth="1" 
                                            markerStart="url(#arrowStart)" 
                                            markerEnd="url(#arrowEnd)" 
                                        />
                                        
                                        {/* Dimension text with background */}
                                        <rect 
                                            x={(patternLeft + patternRight) / 2 - 18} 
                                            y={patternTop - 45} 
                                            width="36" 
                                            height="14" 
                                            fill="white" 
                                            stroke="#ddd" 
                                            strokeWidth="0.3" 
                                            rx="1"
                                        />
                                        <text 
                                            x={(patternLeft + patternRight) / 2} 
                                            y={patternTop - 35} 
                                            textAnchor="middle" 
                                            fontSize="11" 
                                            fontWeight="600" 
                                            fill="#333"
                                            fontFamily="Arial, sans-serif"
                                        >
                                            {Math.round(patternWidth)}″
                                        </text>
                                    </g>
                                    
                                    {/* Height dimension line (left) */}
                                    <g>
                                        {/* Connecting lines from pattern to dimension line */}
                                        <line 
                                            x1={patternLeft} 
                                            y1={patternTop} 
                                            x2={patternLeft - 35} 
                                            y2={patternTop} 
                                            stroke="#999" 
                                            strokeWidth="0.6" 
                                            strokeDasharray="1,2" 
                                        />
                                        <line 
                                            x1={patternLeft} 
                                            y1={patternBottom} 
                                            x2={patternLeft - 35} 
                                            y2={patternBottom} 
                                            stroke="#999" 
                                            strokeWidth="0.6" 
                                            strokeDasharray="1,2" 
                                        />
                                        
                                        {/* Extension lines */}
                                        <line 
                                            x1={patternLeft - 35} 
                                            y1={patternTop} 
                                            x2={patternLeft - 40} 
                                            y2={patternTop} 
                                            stroke="#666" 
                                            strokeWidth="0.8" 
                                            strokeDasharray="1,1" 
                                        />
                                        <line 
                                            x1={patternLeft - 35} 
                                            y1={patternBottom} 
                                            x2={patternLeft - 40} 
                                            y2={patternBottom} 
                                            stroke="#666" 
                                            strokeWidth="0.8" 
                                            strokeDasharray="1,1" 
                                        />
                                        
                                        {/* Main dimension line with arrows */}
                                        <line 
                                            x1={patternLeft - 37} 
                                            y1={patternTop} 
                                            x2={patternLeft - 37} 
                                            y2={patternBottom} 
                                            stroke="#333" 
                                            strokeWidth="1" 
                                            markerStart="url(#arrowStart)" 
                                            markerEnd="url(#arrowEnd)" 
                                        />
                                        
                                        {/* Dimension text with background */}
                                        <rect 
                                            x={patternLeft - 55} 
                                            y={(patternTop + patternBottom) / 2 - 7} 
                                            width="36" 
                                            height="14" 
                                            fill="white" 
                                            stroke="#ddd" 
                                            strokeWidth="0.3" 
                                            rx="1"
                                        />
                                        <text 
                                            x={patternLeft - 35} 
                                            y={(patternTop + patternBottom) / 2 + 4} 
                                            textAnchor="middle" 
                                            fontSize="11" 
                                            fontWeight="600" 
                                            fill="#333"
                                            fontFamily="Arial, sans-serif"
                                        >
                                            {Math.round(patternHeight)}″
                                        </text>
                                    </g>
                                    
                                    {/* Center label showing combined dimensions */}
                                    <g>
                                        {/* Calculate actual pattern center */}
                                        {(() => {
                                            const patternCenterX = (patternLeft + patternRight) / 2;
                                            const patternCenterY = (patternTop + patternBottom) / 2;
                                            
                                            return (
                                                <>
                                                    {/* Drop shadow for background rectangle */}
                                                    <rect 
                                                        x={patternCenterX - 38} 
                                                        y={patternCenterY - 11} 
                                                        width="76" 
                                                        height="22" 
                                                        fill="rgba(0, 0, 0, 0.1)" 
                                                        rx="2"
                                                        transform="translate(1, 1)"
                                                    />
                                                    {/* Background rectangle for center label - matching dimension text style */}
                                                    <rect 
                                                        x={patternCenterX - 38} 
                                                        y={patternCenterY - 11} 
                                                        width="76" 
                                                        height="22" 
                                                        fill="white" 
                                                        stroke="#ddd" 
                                                        strokeWidth="0.3" 
                                                        rx="2"
                                                    />
                                                    {/* Center dimension text - enhanced styling */}
                                                    <text 
                                                        x={patternCenterX} 
                                                        y={patternCenterY + 4} 
                                                        textAnchor="middle" 
                                                        fontSize="13" 
                                                        fontWeight="600" 
                                                        fill="#333"
                                                        fontFamily="Arial, sans-serif"
                                                        letterSpacing="0.5px"
                                                    >
                                                        {Math.round(patternWidth)}″ × {Math.round(patternHeight)}″
                                                    </text>
                                                </>
                                            );
                                        })()}
                                    </g>
                                </>
                            );
                        })()}
                    </svg>
                </div>
            </div>
            
            {showInfoText && (
                <div style={{ marginTop: '16px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        <InfoCircleOutlined style={{ marginRight: '4px' }} />
                        {infoText}
                    </Text>
                </div>
            )}
        </Card>
    );
};

export default PatternDimensionVisualization;
