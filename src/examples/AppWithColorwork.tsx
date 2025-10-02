import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { 
    ColorworkDesignerApp,
    ColorworkDemo 
} from './colorwork-system';

const { Header, Content } = Layout;

/**
 * Example integration of the colorwork system into an existing app
 * This shows how the new components can be added to your routing structure
 */
const AppWithColorwork = () => {
    return (
        <Router>
            <Layout>
                <Header>
                    <Menu mode="horizontal" theme="dark">
                        <Menu.Item key="home">
                            <Link to="/">Home</Link>
                        </Menu.Item>
                        <Menu.Item key="patterns">
                            <Link to="/patterns">Knitting Patterns</Link>
                        </Menu.Item>
                        <Menu.Item key="colorwork">
                            <Link to="/colorwork">Colorwork Designer</Link>
                        </Menu.Item>
                        <Menu.Item key="demo">
                            <Link to="/colorwork/demo">Demo</Link>
                        </Menu.Item>
                    </Menu>
                </Header>
                
                <Content>
                    <Routes>
                        <Route path="/" element={<div>Home Page</div>} />
                        <Route path="/patterns/*" element={<div>Existing Knitting Patterns</div>} />
                        <Route path="/colorwork" element={<ColorworkDesignerApp />} />
                        <Route path="/colorwork/demo" element={<ColorworkDemo />} />
                    </Routes>
                </Content>
            </Layout>
        </Router>
    );
};

export default AppWithColorwork;
