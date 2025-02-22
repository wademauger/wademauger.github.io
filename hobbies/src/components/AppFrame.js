import { NavLink } from 'react-router-dom'; // Update the import statement
import React from 'react';
import patterns from '../data/patterns';
import recipes from '../data/recipes';
import { Layout, Menu, theme } from 'antd';
const { Header, Content, Footer } = Layout;

const items = [
    {
        key: '1',
        label: <NavLink to="/">Super Secret Emporium</NavLink>,
    }, {
        key: '2',
        label: <NavLink to="/recipes">Recipes</NavLink>,
        children: recipes.map(recipe => ({
            key: recipe.id,
            label: <NavLink to={`/recipes/${recipe.permalink}`}>{recipe.title}</NavLink>,
        })),
    }, {
        key: '3',
        label: <NavLink to="/patterns">Knitting Patterns</NavLink>,
        children: patterns.map(pattern => ({
            key: pattern.id,
            label: <NavLink to={`/patterns/${pattern.permalink}`}>{pattern.title}</NavLink>,
        })),
    }, {
        key: '4',
        label: <NavLink to="/ukulele-tabs">Ukulele Tabs</NavLink>,
    }, {
        key: '5',
        label: <NavLink to="/record-catalog">Record Catalog</NavLink>,
    }, {
        key: '6',
        label: <NavLink to="/houseplants">Houseplants</NavLink>,
    }, {
        key: '7',
        label: <NavLink to="/professional">Professional</NavLink>,
    }
];

export default function AppFrame(props) {
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
                    defaultSelectedKeys={['2']}
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
