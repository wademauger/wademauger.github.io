import { NavLink, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import patterns from '../data/patterns';
import newRecipes from '../data/recipes/index';
import { Layout, Menu, Drawer, Button, ConfigProvider } from 'antd';
import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
import { createStyles, useTheme } from 'antd-style';
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

const items = [
    {
        key: '/hobbies',
        label: <NavLink to="/hobbies">Super Secret Emporium</NavLink>,
    },
    {
        key: '/hobbies/recipes',
        label: <NavLink to="/hobbies/recipes">Recipes</NavLink>,
        children: Object.keys(newRecipes).map((category, index) => ({
            key: `/hobbies/recipes/${category}`,
            label: category,
            children: newRecipes[category].map(recipe => ({
                key: `/hobbies/recipes/${recipe.permalink}`,
                label: <NavLink to={`/hobbies/recipes/${recipe.permalink}`}>{recipe.title}</NavLink>,
            })),
        })),
    },
    {
        key: '/hobbies/patterns',
        label: <NavLink to="/hobbies/patterns">Knitting Patterns</NavLink>,
        children: patterns.map(pattern => ({
            key: `/hobbies/patterns/${pattern.permalink}`,
            label: <NavLink to={`/hobbies/patterns/${pattern.permalink}`}>{pattern.title}</NavLink>,
        })),
    },
    {
        key: '/hobbies/tabs',
        label: <NavLink to="/tabs">Ukulele Tabs</NavLink>,
    },
    {
        key: '/hobbies/record-catalog',
        label: <NavLink to="/record-catalog">Record Catalog</NavLink>,
    },
    {
        key: '/hobbies/houseplants',
        label: <NavLink to="/houseplants">Houseplants</NavLink>,
    },
    {
        key: '/',
        label: <NavLink to="/">Professional</NavLink>,
    }
];

const MOBILE_NAVIGATION_BREAKPOINT = 900;

export default function AppFrame(props) {
    const location = useLocation();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_NAVIGATION_BREAKPOINT);
    const { styles } = useStyle();
    const token = useTheme();

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

    return (
        <ConfigProvider
            drawer={{
                classNames,
                styles: drawerStyles,
            }}
        >
            <Layout>
                <Header className="app-header">
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
                <Content className="app-content">
                    <div className="content-container">
                        {props.children}
                    </div>
                </Content>
                <Footer className="app-footer">
                    Wade Ahlstrom © {new Date().getFullYear()}
                </Footer>
            </Layout>
        </ConfigProvider>
    );
};
