import { useState, useRef, useMemo, useEffect, lazy, Suspense, useCallback } from 'react';
import './ColorworkDesignerApp.css';
import { Layout, Typography, Button, Space, Card, Row, Col } from 'antd';
import { PlusOutlined, ThunderboltOutlined, BgColorsOutlined } from '@ant-design/icons';
import { garments } from '../../data/garments';
import { DriveAuthProvider } from './context/DriveAuthContext';
import { useDropdown } from '../../components/DropdownProvider';
import { useDispatch, useSelector } from 'react-redux';
import { updatePatternData } from '@/store/knittingDesignSlice';
import { selectPatternData } from '@/store/knittingDesignSlice';
import { selectFullLibrary } from '@/store/librarySlice';
import { loadFullLibrary } from '@/store/librarySlice';
import { Input, InputNumber } from 'antd';
import { generateProjectTitle } from '../knitting-designer/utils/ProjectTitlePlaceholderHelper';
import { openLibrarySettingsModal } from '../../reducers/modal.reducer';
import LibraryOpenDialog from '../../components/LibraryOpenDialog';
import LibrarySaveDialog from '../../components/LibrarySaveDialog';
import { OpenModal, SaveAsModal } from '@/components/modals';
import { emitEvent } from '../../store/uiEventsSlice';
import ColorworkPanelEditor from '../../components/ColorworkPanelEditor';
// Google sign-in now rendered by the page header; per-editor buttons removed
import PanelShapeCreator from './PanelShapeCreator';
// Lazy-load the knitting designer and wizard to avoid circular import evaluation at module load time
const KnittingDesignerApp = lazy(() => import('../knitting-designer/KnittingDesignerApp'));
const WizardView = lazy(() => import('../knitting-designer/components/WizardView'));
const InteractiveKnittingPage = lazy(() => import('../../pages/InteractiveKnittingPage'));
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

const { Title, Text } = Typography;
const { Content } = Layout;

/**
 * Machine Knitting Panel Designer - Main application for creating and knitting panels
 * Integrates with existing garment shapes and colorwork patterns
 */
const ColorworkDesignerApp = () => {
    // Lightweight local types for incremental work
    const [savedPatterns, setSavedPatterns] = useState<any[]>([]);
    const [currentProject, setCurrentProject] = useState<any | null>(null);
    // removed local modal flow; navigation will be used instead
    const [knittingStage, setKnittingStage] = useState<string>('settings'); // 'settings' or 'knitting'
    const editorRef = useRef<any>(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    
    const cachedPlaceholderTitle = useMemo(() => generateProjectTitle(), []);
    
    // Cast the imported editor to any to avoid prop-type friction during the focused pass
    const AnyColorworkPanelEditor: any = ColorworkPanelEditor;
    
    // Get the full library data from Redux
    const libraryData: any = useSelector(selectFullLibrary);
    
    // Load library on mount
    useEffect(() => {
        dispatch(loadFullLibrary() as any);
    }, [dispatch]);
    
    // Get real knitting projects from the library instead of dummy data
    const recentProjects = useMemo(() => {
        const projects = libraryData?.knittingProjects || [];
        // Create a copy before sorting (Redux arrays are immutable/frozen)
        return [...projects].sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });
    }, [libraryData]);

    // Handle selecting a garment panel to knit
    const handleKnitPanel = (garment: any, panelName: any, panelShape: any) => {
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
            // Navigate to the pattern-designer route so the Knitting Designer (and Wizard) are rendered.
            // Pass the selected project in location.state so the editor can read it if needed.
            navigate('colorwork-pattern-designer', { state: { project } });
    };

    // Removed unused handleNewProject function

    const handleLoadProject = (project: any) => {
        // Fix legacy projects that might be missing panelShape data
        const fixedProject = fixLegacyProject(project);
        setCurrentProject(fixedProject);
        // Navigate to interactive knitting page to show row-by-row instructions
        navigate('interactive-knitting', { state: { project: fixedProject } });
    };

    const handleSaveProject = (projectData: any) => {
        const updatedProject = {
            ...currentProject,
            ...projectData,
            modified: new Date().toISOString()
        };
        
        setSavedPatterns(prev => {
            const existing = prev.find((p: any) => p.id === updatedProject.id);
            if (existing) {
                return prev.map((p: any) => p.id === updatedProject.id ? updatedProject : p);
            } else {
                return [...prev, updatedProject];
            }
        });
        
        setCurrentProject(updatedProject);
    };

    // Helper function to fix legacy projects missing panelShape data
    const fixLegacyProject = (project: any) => {
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

    // Small toolbar component that mirrors the Step 0 UI moved from WizardView
    const PatternToolbar = () => {
        const dispatch = useDispatch();
        const patternData: any = useSelector(selectPatternData);
        const [name, setName] = useState<string>(patternData?.name || '');

        const persistGauge = useCallback((nextFields: Partial<{ stitchesPerInch: number; rowsPerInch: number; scaleFactor: number }>) => {
            const current = (patternData && patternData.gauge) || {};
            const merged = { ...current, ...nextFields } as { stitchesPerInch?: number; rowsPerInch?: number; scaleFactor?: number };
            const scale = typeof merged.scaleFactor === 'number' ? merged.scaleFactor : (merged.scaleFactor ?? 1);
            const sPerInch = typeof merged.stitchesPerInch === 'number' ? merged.stitchesPerInch : (current.stitchesPerInch || 0);
            const rPerInch = typeof merged.rowsPerInch === 'number' ? merged.rowsPerInch : (current.rowsPerInch || 0);
            const stitchesPerFourInches = sPerInch * 4;
            const rowsPerFourInches = rPerInch * 4;

            const toPersist = {
                stitchesPerInch: sPerInch,
                rowsPerInch: rPerInch,
                scaleFactor: scale,
                stitchesPerFourInches,
                rowsPerFourInches
            };

            dispatch(updatePatternData({ section: 'gauge', data: toPersist }) as any);
        }, [dispatch, patternData]);

        const onGaugeChange = (field: 'stitchesPerInch' | 'rowsPerInch', value: number | null) => {
            if (value == null) return;
            const perInchValue = value / 4;
            persistGauge({ [field]: perInchValue } as any);
        };

        const onScaleChange = (value: number | null) => {
            if (value == null) return;
            persistGauge({ scaleFactor: value });
        };

        const onNameChange = (e: any) => {
            const v = e.target.value;
            setName(v);
            dispatch(updatePatternData({ section: 'meta', data: { name: v } }) as any);
        };

        return (
            <div style={{ padding: 8, display: 'flex', gap: 12, alignItems: 'center', width: '100%' }}>
                <div style={{ flex: '1 1 320px', minWidth: 220 }}>
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>Pattern name</label>
                    <Input placeholder={cachedPlaceholderTitle} value={name} onChange={onNameChange} />
                </div>

                <div style={{ flex: '0 0', minWidth: 200, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 13 }}>Stitches per 4":</label>
                        <InputNumber min={1} value={patternData?.gauge?.stitchesPerFourInches} onChange={(v: number | null) => onGaugeChange('stitchesPerInch', v)} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 13 }}>Rows per 4":</label>
                        <InputNumber min={1} value={patternData?.gauge?.rowsPerFourInches} onChange={(v: number | null) => onGaugeChange('rowsPerInch', v)} />
                    </div>
                </div>

                <div style={{ flex: '0 0 120px', minWidth: 100, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 13 }}>Scale</label>
                        <InputNumber min={0.1} step={0.1} value={patternData?.gauge?.scaleFactor ?? 1} onChange={(v: number | null) => onScaleChange(v)} />
                    </div>
                </div>
            </div>
        );
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
                        onClick={() => navigate('panel-shape-creator')}
                        style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <PlusOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                            <Title level={4}>Create Panel Shape</Title>
                            <Text type="secondary">Design custom shapes for your knitting project</Text>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} md={12} lg={8}>
                    <Card
                        hoverable
                        className="action-card"
                        onClick={() => navigate('colorwork-pattern-designer')}
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
                        onClick={() => navigate('pattern-wizard')}
                        style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <ThunderboltOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                            <Title level={4}>Make a Knitting Pattern</Title>
                            <Text type="secondary">Create a plan to knit your project</Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Recent Projects Section */}
            {(recentProjects.length > 0 || savedPatterns.length > 0) && (
                <div style={{ marginTop: 40 }}>
                    <Title level={2}>Projects</Title>
                    <Row gutter={[16, 16]}>
                        <Col xs={24}>
                            {recentProjects.map((project: any) => {
                                // Format the creation date
                                const createdDate = project.createdAt ? new Date(project.createdAt) : null;
                                const formattedDate = createdDate ? createdDate.toLocaleDateString() : 'Unknown date';
                                
                                // Count the number of panels in the project
                                const panelCount = project.panels?.length || 0;
                                
                                const interactiveKnittingPageRoute = `interactive-knitting`;
                                return (
                                    <Card 
                                        key={project.id}
                                        hoverable
                                        size="small"
                                        title={project.name}
                                        extra={<Button type="link" onClick={(e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            navigate(interactiveKnittingPageRoute, { state: { project: project } });
                                        }}>Open Project</Button>}
                                        style={{ marginBottom: '12px', cursor: 'pointer' }}
                                        onClick={() => navigate(interactiveKnittingPageRoute, { state: { project: project } })}
                                    >
                                        <Space direction="vertical" size="small">
                                            <Text type="secondary">
                                                Created: {formattedDate}
                                            </Text>
                                            <Text type="secondary">
                                                {panelCount} panel{panelCount !== 1 ? 's' : ''}
                                            </Text>
                                            {project.gauge && (
                                                <Text type="secondary" style={{ fontSize: 11 }}>
                                                    Gauge: {project.gauge.stitchesPerFourInches || (project.gauge.stitchesPerInch * 4)?.toFixed(0)} sts × {project.gauge.rowsPerFourInches || (project.gauge.rowsPerInch * 4)?.toFixed(0)} rows per 4"
                                                </Text>
                                            )}
                                        </Space>
                                    </Card>
                                );
                            })}
                            {savedPatterns.map((pattern: any) => (
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

            {/* Garment selection modal removed - navigation to colorwork-pattern-designer route now used */}
        </div>
    );

    const renderEditorView = () => (
        <div className="colorwork-editor-wrapper">
            <div className="editor-toolbar">
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
                            }
                        }}
                    >
                        Start Knitting →
                    </Button>
                )}
            </div>
            
                <AnyColorworkPanelEditor
                ref={editorRef}
                initialPanel={currentProject?.panel}
                initialColorwork={currentProject?.colorwork}
                project={currentProject}
                stage={knittingStage}
                onSave={handleSaveProject}
                    onStageChange={(stage: any) => setKnittingStage(stage)}
            />
        </div>
    );

    // Register header dropdown items for Colorwork Designer based on current sub-route
    const { setMenuItems } = useDropdown();
    const [showOpenDialog, setShowOpenDialog] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showPatternOpen, setShowPatternOpen] = useState(false);
    const [showPatternSaveAs, setShowPatternSaveAs] = useState(false);
    const [currentPatternData, setCurrentPatternData] = useState<any>(null);

    // Listen for pattern data from KnittingDesignerApp
    useEffect(() => {
        const handlePatternData = (event: any) => {
            const { pattern, gridSize, colors } = event.detail;
            setCurrentPatternData({ pattern, gridSize, colors });
            setShowPatternSaveAs(true);
        };

        window.addEventListener('colorwork:pattern-data', handlePatternData);
        return () => window.removeEventListener('colorwork:pattern-data', handlePatternData);
    }, []);

    useEffect(() => {
        const path = location.pathname || '';
        let items: any[] = [];
        if (path.includes('panel-shape-creator')) {
            // PanelShapeCreator now handles its own menu items via DropdownProvider
            // Leave items empty to avoid conflicts
            items = [];
        } else if (path.includes('colorwork-pattern-designer')) {
            items = [
                {
                    key: 'colorwork-pattern-save',
                    label: 'Save Pattern',
                    onClick: () => {
                        // Request pattern data from KnittingDesignerApp
                        window.dispatchEvent(new Event('colorwork:request-pattern-data'));
                    }
                },
                {
                    key: 'colorwork-pattern-open',
                    label: 'Open Pattern',
                    onClick: () => setShowPatternOpen(true)
                }
            ];
        } else {
            // Default header actions when on the colorwork home
            items = [
                {
                    key: 'colorwork-open-home',
                    label: 'Open...',
                    onClick: () => dispatch(openLibrarySettingsModal('panels', { intent: 'open' }))
                }
            ];
        }

        setMenuItems(items);
        return () => setMenuItems([]);
    }, [setMenuItems, location.pathname, currentProject, dispatch]);

    return (
        <Layout className="colorwork-designer-app">
            <DriveAuthProvider>
                <Content>
                    {/* Simple library dialogs for this app. They emit uiEvents when a file is chosen or saved */}
                    <LibraryOpenDialog visible={showOpenDialog} onClose={() => setShowOpenDialog(false)} onOpen={(lib, fileRef) => {
                        dispatch(emitEvent({ type: 'colorwork:library-opened', payload: { library: lib, fileRef } }));
                        setShowOpenDialog(false);
                    }} />
                    <LibrarySaveDialog visible={showSaveDialog} onClose={() => setShowSaveDialog(false)} onSave={(result) => {
                        // Emit a richer saved event containing the saved fileRef/entry when available
                        dispatch(emitEvent({ type: 'colorwork:library-saved', payload: result || {} }));
                        setShowSaveDialog(false);
                    }} fileId={null} libraryData={currentProject} />

                    <Routes>
                        <Route path="/" element={renderHomeView()} />
                        <Route path="panel-shape-creator" element={(
                            <div className="panel-shape-creator" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                                <div className="editor-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}>
                                    <Title level={3} style={{ margin: 0, flex: 1 }}>Panel Shape Creator</Title>
                                </div>
                                <div style={{ flex: 1, minHeight: 0 }}>
                                    <PanelShapeCreator />
                                </div>
                            </div>
                        )} />
                        <Route path="colorwork-pattern-designer" element={(
                            <div className="colorwork-pattern-designer" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="editor-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}>
                                    <Title level={3} style={{ margin: 0, flex: 1 }}>Colorwork Pattern Designer</Title>
                                </div>
                                <div style={{ flex: 1, minHeight: 0 }}>
                                            <KnittingDesignerApp />
                                        </div>
                                    </div>
                                )} />
                                <Route path="interactive-knitting" element={<InteractiveKnittingPage />} />
                                <Route path="pattern-wizard" element={(
                                    <div className="pattern-wizard" style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div className="editor-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}>
                                            <PatternToolbar />
                                        </div>
                                        <div style={{ flex: 1, minHeight: 0 }}>
                                            <WizardView />
                                        </div>
                                    </div>
                                )} />
                    </Routes>

                    {/* Open Pattern modal for Colorwork Pattern Creator */}
                    <OpenModal
                        visible={showPatternOpen}
                        jsonKey="colorworkPatterns"
                        settingsKey="panels"
                        displayLabel="Pattern"
                        onOpen={(pattern) => {
                            try {
                                // Dispatch a UI event so other parts of the app can react
                                dispatch(emitEvent({ type: 'colorwork:pattern-opened', payload: pattern }));
                            } catch (e) { /* swallow */ }
                            setShowPatternOpen(false);
                        }}
                        onClose={() => setShowPatternOpen(false)}
                    />

                    {/* Save Pattern modal for Colorwork Pattern Creator */}
                    <SaveAsModal
                        visible={showPatternSaveAs}
                        jsonKey="colorworkPatterns"
                        settingsKey="panels"
                        displayLabel="Pattern"
                        entityData={currentPatternData}
                        onSave={async (name: string, patternData: any) => {
                            console.log(`Pattern "${name}" saved successfully`);
                            // The SaveAsModal already saved to Google Drive
                        }}
                        onClose={() => {
                            setShowPatternSaveAs(false);
                            setCurrentPatternData(null);
                        }}
                    />
                </Content>
            </DriveAuthProvider>
        </Layout>
    );
};

export default ColorworkDesignerApp;
