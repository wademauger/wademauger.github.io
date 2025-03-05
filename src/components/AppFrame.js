import { NavLink, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { garments } from '../data/garments';
import newRecipes from '../data/recipes/index';
import { Layout, Menu, Drawer, Button, ConfigProvider } from 'antd';
import { CloseOutlined, MenuOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { createStyles, useTheme } from 'antd-style';
import '../App.css';
import { useSelector, useDispatch } from 'react-redux';
import { setIsPrintMode } from '../reducers/recipes.reducer';

const { Header, Content, Footer } = Layout;

const useStyle = createStyles(({ token }) => ({
    'custom-drawer-body': {
        background: token.colorPrimary,
    },
    'custom-drawer-header': {
        background: token.colorPrimary,
        color: token.colorTextLightSolid,
    },
    'custom-drawer-close': {
        color: token.colorTextLightSolid,
    },
}));

const MOBILE_NAVIGATION_BREAKPOINT = 900;

export default function AppFrame(props) {
    const location = useLocation();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_NAVIGATION_BREAKPOINT);
    const { styles } = useStyle();
    const token = useTheme();
    const isPrintMode = useSelector((state) => state.recipes.isPrintMode);
    const dispatch = useDispatch();

    const showDrawer = () => {
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= MOBILE_NAVIGATION_BREAKPOINT);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const classNames = {
        body: styles['custom-drawer-body'],
        header: styles['custom-drawer-header'],
        close: styles['custom-drawer-close'],
    };

    const drawerStyles = {
        body: {
            fontSize: token.fontSizeLG,
        },
    };
    const items = [
        {
            key: '/hobbies',
            label: <NavLink to="/hobbies" onClick={closeDrawer}>Super Secret Emporium</NavLink>,
        },
        {
            key: '/hobbies/recipes',
            label: <NavLink to="/hobbies/recipes" onClick={closeDrawer}>Recipes</NavLink>,
            children: Object.keys(newRecipes).map((category, index) => ({
                key: `/hobbies/recipes/${category}`,
                label: category,
                children: newRecipes[category].map(recipe => ({
                    key: `/hobbies/recipes/${recipe.permalink}`,
                    label: <NavLink to={`/hobbies/recipes/${recipe.permalink}`} onClick={closeDrawer}>{recipe.title}</NavLink>,
                })),
            })),
        },
        {
            key: '/hobbies/patterns',
            label: <NavLink to="/hobbies/patterns" onClick={closeDrawer}>Knitting Patterns</NavLink>,
            children: garments.map(pattern => ({
                key: `/hobbies/patterns/${pattern.permalink}`,
                label: <NavLink to={`/hobbies/patterns/${pattern.permalink}`} onClick={closeDrawer}>{pattern.title}</NavLink>,
            })),
        },
        {
            key: '/hobbies/tabs',
            label: <NavLink to="/hobbies/tabs" onClick={closeDrawer}>Ukulele Tabs</NavLink>,
        },
        {
            key: '/hobbies/record-catalog',
            label: <a href="https://www.discogs.com/user/wadeanthony0100/collection" onClick={closeDrawer}>Record Catalog</a>,
        },
        {
            key: '/hobbies/houseplants',
            label: <NavLink to="/hobbies/houseplants" onClick={closeDrawer}>Houseplants</NavLink>,
        },
        {
            key: '/',
            label: <NavLink to="/" onClick={closeDrawer}>Professional</NavLink>,
        }
    ];

    return (
        <ConfigProvider drawer={{
            classNames,
            styles: drawerStyles,
        }}>
            <Layout>
                {!isPrintMode ? (
                    <Header className="app-header print-hide">
                        {isMobile ? (
                            <Drawer
                                placement="left"
                                onClose={closeDrawer}
                                open={drawerVisible}
                                bodyStyle={{ padding: 0 }}
                                headerStyle={{ color: token.colorTextLightSolid }} // Add this line
                                closeIcon={<CloseOutlined style={{ color: token.colorTextLightSolid }} />} // Add this line
                            >
                                <Menu
                                    theme="dark"
                                    mode="inline"
                                    selectedKeys={[location.pathname]}
                                    items={items}
                                />
                            </Drawer>
                        ) : (
                            <Menu
                                theme="dark"
                                mode="horizontal"
                                selectedKeys={[location.pathname]}
                                items={items}
                                className="desktop-menu"
                            />
                        )}
                        <Button
                            type="primary"
                            icon={<MenuOutlined />}
                            onClick={showDrawer}
                            className="menu-button"
                            style={{ display: isMobile ? '' : 'none' }}
                        />
                    </Header>
                ) : (
                    <Header className="app-header print-hide">
                        <Button onClick={() => dispatch(setIsPrintMode(false))} icon={<CloseCircleOutlined />}>Exit</Button>
                    </Header>
                )}
                <Content className="app-content">
                    <div className="content-container">
                        {props.children}
                    </div>
                </Content>
                {!isPrintMode && (
                    <Footer className="app-footer dark-footer">
                        Wade Ahlstrom © {new Date().getFullYear()}
                    </Footer>
                )}
            </Layout>
        </ConfigProvider>
    );
};
