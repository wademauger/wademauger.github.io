import { useState, useRef } from 'react';
import './ColorworkDesignerApp.css';
import { Layout, Typography, Button, Space, Card, Row, Col, Modal, List, Avatar } from 'antd';
import { PlusOutlined, ThunderboltOutlined, BgColorsOutlined } from '@ant-design/icons';
import { garments } from '../../data/garments.js';
import { DriveAuthProvider } from './context/DriveAuthContext.jsx';
import ColorworkPanelEditor from '../../components/ColorworkPanelEditor.jsx';
import GoogleSignInButton from './components/GoogleSignInButton.jsx';
import PanelShapeCreator from './PanelShapeCreator.jsx';
import KnittingDesignerApp from '../knitting-designer/KnittingDesignerApp.jsx';

const { Title, Text } = Typography;
const { Content } = Layout;

/**
 * Machine Knitting Panel Designer - Main application for creating and knitting panels
 * Integrates with existing garment shapes and colorwork patterns
 */
const ColorworkDesignerApp = () => {
    const [currentView, setCurrentView] = useState('home'); // 'home', 'editor', 'shape-creator', 'colorwork-creator'
    const [savedPatterns, setSavedPatterns] = useState([]);
    const [currentProject, setCurrentProject] = useState(null);
    const [showGarmentSelector, setShowGarmentSelector] = useState(false);
    const [knittingStage, setKnittingStage] = useState('settings'); // 'settings' or 'knitting'
    const editorRef = useRef(null);
    const [recentProjects] = useState([
        { id: 1, name: 'Raglan Sweater Front', garment: 'cozy-raglan-sweater', panel: 'Front', lastModified: '2 hours ago' },
        { id: 2, name: 'Hat Crown', garment: 'seam-top-hat', panel: 'Hat', lastModified: '1 day ago' }
    ]);

    // Handle selecting a garment panel to knit
    const handleKnitPanel = (garment, panelName, panelShape) => {
        const project = {
            id: Date.now(),
            name: `${garment.title} - ${panelName}`,
            garment: garment,
            panelName: panelName,
            panelShape: panelShape,
            colorwork: null,
            instructions: []
        };
        setCurrentProject(project);
        setCurrentView('editor');
        setShowGarmentSelector(false);
    };

    // Removed unused handleNewProject function

    const handleLoadProject = (project) => {
        // Fix legacy projects that might be missing panelShape data
        const fixedProject = fixLegacyProject(project);
        setCurrentProject(fixedProject);
        setCurrentView('editor');
    };

    const handleSaveProject = (projectData) => {
        const updatedProject = {
            ...currentProject,
            ...projectData,
            modified: new Date().toISOString()
        };
        
        setSavedPatterns(prev => {
            const existing = prev.find(p => p.id === updatedProject.id);
            if (existing) {
                return prev.map(p => p.id === updatedProject.id ? updatedProject : p);
            } else {
                return [...prev, updatedProject];
            }
        });
        
        setCurrentProject(updatedProject);
    };

    const handleBackToHome = () => {
        setCurrentView('home');
        setCurrentProject(null);
        setKnittingStage('settings'); // Reset stage when going back to home
    };

    // Helper function to fix legacy projects missing panelShape data
    const fixLegacyProject = (project) => {
        // If the project already has panelShape data, return it as-is
        if (project.panelShape) {
            return project;
        }

        // Try to reconstruct panelShape from garment data
        if (project.garment && project.panelName && project.garment.shapes) {
            const panelShape = project.garment.shapes[project.panelName];
            if (panelShape) {
                return {
                    ...project,
                    panelShape: panelShape
                };
            }
        }

        // If we can't fix it, return the original project
        // The ColorworkPanelEditor will fall back to the default shape
        console.warn('Could not fix legacy project - missing garment or panel data:', project);
        return project;
    };

    const renderHomeView = () => (
        <div className="colorwork-home">
            <div className="home-header">
                <Title level={1}>Machine Knitting Panel Designer</Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                    Create panel shapes, design colorwork patterns, and generate complete machine knitting instructions.
                </Text>
            </div>

            <Row gutter={[24, 24]} style={{ marginTop: 40 }}>
                <Col xs={24} md={12} lg={8}>
                    <Card
                        hoverable
                        className="action-card"
                        onClick={() => setCurrentView('shape-creator')}
                        style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <PlusOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                            <Title level={4}>Create Panel Shape</Title>
                            <Text type="secondary">Design custom trapezoid shapes for your knitting project</Text>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} md={12} lg={8}>
                    <Card
                        hoverable
                        className="action-card"
                        onClick={() => setCurrentView('colorwork-creator')}
                        style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <BgColorsOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                            <Title level={4}>Create Colorwork Pattern</Title>
                            <Text type="secondary">Design custom colorwork grids and charts</Text>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={12} lg={8}>
                    <Card
                        hoverable
                        className="action-card"
                        onClick={() => setShowGarmentSelector(true)}
                        style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <ThunderboltOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                            <Title level={4}>Knit a Panel</Title>
                            <Text type="secondary">Select from existing garment shapes to start knitting</Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Recent Projects Section */}
            {(recentProjects.length > 0 || savedPatterns.length > 0) && (
                <div style={{ marginTop: 40 }}>
                    <Title level={2}>Recent Projects</Title>
                    <Row gutter={[16, 16]}>
                        <Col xs={24}>
                            {recentProjects.map(project => (
                                <Card 
                                    key={project.id}
                                    hoverable
                                    size="small"
                                    title={project.name}
                                    extra={<Button type="link" onClick={() => {}}>Resume</Button>}
                                    style={{ marginBottom: '12px', cursor: 'pointer' }}
                                    onClick={() => {}}
                                >
                                    <Text type="secondary">
                                        Last modified: {project.lastModified}
                                    </Text>

                                </Card>
                            ))}
                            {savedPatterns.map(pattern => (
                                <Card 
                                    key={pattern.id}
                                    hoverable
                                    size="small"
                                    title={pattern.name}
                                    extra={<Button type="link" onClick={() => handleLoadProject(pattern)}>Open</Button>}
                                    style={{ marginBottom: '12px', cursor: 'pointer' }}
                                    onClick={() => handleLoadProject(pattern)}
                                >
                                    <Text type="secondary">
                                        Modified: {new Date(pattern.modified || pattern.created).toLocaleDateString()}
                                    </Text>
                                </Card>
                            ))}
                        </Col>
                    </Row>
                </div>
            )}

            {/* Garment Selection Modal */}
            <Modal
                title="Select a Garment Panel to Knit"
                open={showGarmentSelector}
                onCancel={() => setShowGarmentSelector(false)}
                footer={null}
                width={800}
            >
                <List
                    itemLayout="vertical"
                    dataSource={garments}
                    renderItem={(garment) => (
                        <List.Item key={garment.permalink}>
                            <List.Item.Meta
                                avatar={<Avatar style={{ backgroundColor: '#1890ff' }}>{garment.title[0]}</Avatar>}
                                title={garment.title}
                                description={garment.description}
                            />
                            <div>
                                <Text strong>Available panels:</Text>
                                <Space wrap style={{ marginTop: 8 }}>
                                    {Object.entries(garment.shapes).map(([panelName, panelShape]) => (
                                        <Button
                                            key={panelName}
                                            onClick={() => handleKnitPanel(garment, panelName, panelShape)}
                                            type="primary"
                                            ghost
                                        >
                                            {panelName}
                                        </Button>
                                    ))}
                                </Space>
                            </div>
                        </List.Item>
                    )}
                />
            </Modal>
        </div>
    );

    const renderEditorView = () => (
        <div className="colorwork-editor-wrapper">
            <div className="editor-toolbar">
                <Button onClick={handleBackToHome}>← Back to Home</Button>
                <Title level={3} style={{ margin: 0, flex: 1 }}>
                    Knitting Options for {currentProject?.name || 'Untitled Project'}
                </Title>
                {knittingStage === 'settings' && (
                    <Button 
                        type="primary" 
                        size="large"
                        onClick={() => {
                            if (editorRef.current && editorRef.current.startKnitting) {
                                editorRef.current.startKnitting();
                                setKnittingStage('knitting');
                            }
                        }}
                    >
                        Start Knitting →
                    </Button>
                )}
            </div>
            
            <ColorworkPanelEditor
                ref={editorRef}
                initialPanel={currentProject?.panel}
                initialColorwork={currentProject?.colorwork}
                project={currentProject}
                onSave={handleSaveProject}
                onCancel={handleBackToHome}
                onStageChange={(stage) => setKnittingStage(stage)}
            />
        </div>
    );

    return (
            <Layout className="colorwork-designer-app">
                <DriveAuthProvider>
                    <Content>
                        {currentView === 'home' && renderHomeView()}
                        {currentView === 'editor' && renderEditorView()}
                        {currentView === 'shape-creator' && (
                            <div className="panel-shape-creator" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                                <div className="editor-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}>
                                    <Button onClick={handleBackToHome}>← Back to Home</Button>
                                    <Title level={3} style={{ margin: 0, flex: 1 }}>Panel Shape Creator</Title>
                                                    <div style={{ marginLeft: 'auto' }}>
                                                        <GoogleSignInButton
                                                            buttonText="Drive"
                                                            onSaveAs={() => window.dispatchEvent(new CustomEvent('colorwork:save-as'))}
                                                            onOpen={() => window.dispatchEvent(new CustomEvent('colorwork:open'))}
                                                        />
                                                    </div>
                                </div>
                                <div style={{ flex: 1, minHeight: 0 }}>
                                    <PanelShapeCreator />
                                </div>
                            </div>
                        )}
                        {currentView === 'colorwork-creator' && (
                            <div className="colorwork-pattern-creator" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="editor-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}>
                                    <Button onClick={handleBackToHome}>← Back to Home</Button>
                                    <Title level={3} style={{ margin: 0, flex: 1 }}>Colorwork Pattern Creator</Title>
                                </div>
                                <div style={{ flex: 1, minHeight: 0 }}>
                                    {/* Embed the same UX as /crafts/colorwork-designer */}
                                    <KnittingDesignerApp />
                                </div>
                            </div>
                        )}
                    </Content>
                </DriveAuthProvider>
            </Layout>
    );
};

export default ColorworkDesignerApp;
