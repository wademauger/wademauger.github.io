import { NavLink, useLocation } from 'react-router-dom';
import React from 'react';
import patterns from '../data/patterns';
import newRecipes from '../data/recipes/index';
import { Layout, Menu, theme } from 'antd';
const { Header, Content, Footer } = Layout;

const items = [
    {
        key: '/',
        label: <NavLink to="/">Super Secret Emporium</NavLink>,
    },
    {
        key: '/recipes',
        label: <NavLink to="/recipes">Recipes</NavLink>,
        children: Object.keys(newRecipes).map((category, index) => ({
            key: `/recipes/${category}`,
            label: <NavLink to={`/recipes/${category}`}>{category}</NavLink>,
            children: newRecipes[category].map(recipe => ({
                key: `/recipes/${recipe.permalink}`,
                label: <NavLink to={`/recipes/${recipe.permalink}`}>{recipe.title}</NavLink>,
            })),
        })),
    },
    {
        key: '/patterns',
        label: <NavLink to="/patterns">Knitting Patterns</NavLink>,
        children: patterns.map(pattern => ({
            key: `/patterns/${pattern.permalink}`,
            label: <NavLink to={`/patterns/${pattern.permalink}`}>{pattern.title}</NavLink>,
        })),
    },
    {
        key: '/ukulele-tabs',
        label: <NavLink to="/ukulele-tabs">Ukulele Tabs</NavLink>,
    },
    {
        key: '/record-catalog',
        label: <NavLink to="/record-catalog">Record Catalog</NavLink>,
    },
    {
        key: '/houseplants',
        label: <NavLink to="/houseplants">Houseplants</NavLink>,
    },
    {
        key: '/professional',
        label: <NavLink to="/professional">Professional</NavLink>,
    }
];

export default function AppFrame(props) {
    const location = useLocation();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout>
            <Header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <div className="demo-logo" />
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={items}
                    style={{
                        flex: 1,
                        minWidth: 0,
                    }}
                />
            </Header>
            <Content
                style={{
                    padding: '0 48px',
                }}
            >
                <div
                    style={{
                        marginTop: 24,
                        padding: 24,
                        minHeight: 380,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {props.children}
                </div>
            </Content>
            <Footer
                style={{
                    textAlign: 'center',
                }}
            >
                Wade Ahlstrom © {new Date().getFullYear()}
            </Footer>
        </Layout>
    );
};
