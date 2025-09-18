import React, { useState, useRef, useCallback } from 'react';
import { Layout, Typography, Space, Segmented, Card, message } from 'antd';
import { 
    ToolOutlined, 
    BuildOutlined, 
    BgColorsOutlined
} from '@ant-design/icons';
import ColorworkPanelEditor from '../../components/ColorworkPanelEditor.js';
import GarmentComposer from '../../components/GarmentComposer.js';
import PanelShapeCreator from './PanelShapeCreator.js';
import KnittingDesignerApp from '../knitting-designer/KnittingDesignerApp.js';
import { Gauge } from '../../models/Gauge.js';
import './UnifiedDesignerApp.css';

const { Title, Text } = Typography;
const { Content } = Layout;

/**
 * Unified Designer App - Combined panel creation and garment composition
 * Features pill navigation to switch between different design modes
 */
const UnifiedDesignerApp = () => {
    // Main navigation state
    const [activeTab, setActiveTab] = useState('panels');
    
    // Shared state between tabs
    const [savedPanels, setSavedPanels] = useState(() => [
        // Sample panels for testing
        {
            id: 1,
            name: 'Front Panel',
            shape: {
                height: 20,
                baseA: 25,
                baseB: 25,
                successors: []
            },
            created: new Date().toISOString(),
            type: 'panel',
            metadata: {
                yarnWeight: 200,
                estimatedTime: 8
            }
        },
        {
            id: 2,
            name: 'Back Panel',
            shape: {
                height: 20,
                baseA: 25,
                baseB: 25,
                successors: []
            },
            created: new Date().toISOString(),
            type: 'panel',
            metadata: {
                yarnWeight: 200,
                estimatedTime: 8
            }
        },
        {
            id: 3,
            name: 'Left Sleeve',
            shape: {
                height: 15,
                baseA: 12,
                baseB: 18,
                successors: []
            },
            created: new Date().toISOString(),
            type: 'panel',
            metadata: {
                yarnWeight: 120,
                estimatedTime: 5
            }
        },
        {
            id: 4,
            name: 'Right Sleeve',
            shape: {
                height: 15,
                baseA: 12,
                baseB: 18,
                successors: []
            },
            created: new Date().toISOString(),
            type: 'panel',
            metadata: {
                yarnWeight: 120,
                estimatedTime: 5
            }
        }
    ]);
    const [savedGarments, setSavedGarments] = useState([]);
    const [currentProject, setCurrentProject] = useState(null);
    const [defaultGauge] = useState(new Gauge(19, 30, 1.0));

    // Panel creation state
    const [panelView, setPanelView] = useState('shape-creator'); // 'shape-creator', 'colorwork-editor', 'pattern-designer'
    
    // Garment composition state
    const [selectedGarment, setSelectedGarment] = useState(null);

    // Navigation options
    const navigationOptions = [
        {
            label: 'Create Panels',
            value: 'panels',
            icon: <ToolOutlined />
        },
        {
            label: 'Compose Garments',
            value: 'garments',
            icon: <BuildOutlined />
        }
    ];

    // Panel creation sub-navigation
    const panelSubNavigation = [
        {
            label: 'Shape Creator',
            value: 'shape-creator',
            icon: <ToolOutlined />
        },
        {
            label: 'Colorwork Designer',
            value: 'colorwork-editor',
            icon: <BgColorsOutlined />
        },
        {
            label: 'Pattern Designer',
            value: 'pattern-designer',
            icon: <BgColorsOutlined />
        }
    ];

    // Handle panel creation completion
    const handlePanelCreated = useCallback((panel) => {
        setSavedPanels(prev => [...prev, {
            ...panel,
            id: Date.now(),
            created: new Date().toISOString(),
            type: 'panel'
        }]);
        
        message.success('Panel saved successfully!');
        
        // Optionally switch to garment composer to use the new panel
        setActiveTab('garments');
    }, []);

    // Handle garment creation completion
    const handleGarmentSaved = useCallback((garment) => {
        setSavedGarments(prev => [...prev, {
            ...garment,
            id: Date.now(),
            saved: new Date().toISOString(),
            type: 'garment'
        }]);
        
        message.success('Garment saved successfully!');
    }, []);

    // Render panel creation interface
    const renderPanelCreation = () => (
        <div className="panel-creation-container">
            <div className="sub-navigation">
                <Segmented
                    options={panelSubNavigation}
                    value={panelView}
                    onChange={setPanelView}
                    size="large"
                />
            </div>
            
            <div className="panel-content">
                {panelView === 'shape-creator' && (
                    <PanelShapeCreator
                        onShapeCreated={(shape) => {
                            handlePanelCreated({ shape, name: 'New Panel Shape' });
                        }}
                        onContinueToColorwork={(shape) => {
                            setCurrentProject({ shape, name: 'New Panel' });
                            setPanelView('colorwork-editor');
                        }}
                    />
                )}
                
                {panelView === 'colorwork-editor' && (
                    <ColorworkPanelEditor
                        initialProject={currentProject}
                        gauge={defaultGauge}
                        onSave={handlePanelCreated}
                        onBack={() => setPanelView('shape-creator')}
                    />
                )}
                
                {panelView === 'pattern-designer' && (
                    <KnittingDesignerApp />
                )}
            </div>
        </div>
    );

    // Render garment composition interface
    const renderGarmentComposition = () => (
        <div className="garment-composition-container">
            <GarmentComposer
                availablePanels={savedPanels}
                initialGarment={selectedGarment}
                onSave={handleGarmentSaved}
                onCancel={() => setSelectedGarment(null)}
            />
        </div>
    );

    // Render main content based on active tab
    const renderMainContent = () => {
        switch (activeTab) {
            case 'panels':
                return renderPanelCreation();
            case 'garments':
                return renderGarmentComposition();
            default:
                return renderPanelCreation();
        }
    };

    return (
        <Layout className="unified-designer-app">
            <Content>
                {/* Main Navigation */}
                <div className="main-navigation">
                    <div className="nav-header">
                        <Title level={2} style={{ margin: 0 }}>
                            Knitting Designer Studio
                        </Title>
                        <Text type="secondary">
                            Create panels and compose garments in one integrated workspace
                        </Text>
                    </div>
                    
                    <Segmented
                        options={navigationOptions}
                        value={activeTab}
                        onChange={setActiveTab}
                        size="large"
                        style={{ marginTop: 16 }}
                    />
                </div>

                {/* Main Content Area */}
                <div className="main-content">
                    {renderMainContent()}
                </div>
            </Content>
        </Layout>
    );
};

export default UnifiedDesignerApp;
