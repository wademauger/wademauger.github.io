import logo from '../img/logo.svg';
import { NavLink } from 'react-router';

export default function Header() {
    return <header className="App-header bg-gray-800 text-white py-4">
    <NavLink to="/" className="container mx-auto text-center text-2xl font-bold">
        Secret Stash
    </NavLink>
    <nav className="mt-2 text-center">
        <NavLink to="/recipes" className="text-gray-300 hover:text-white mx-2">Recipes</NavLink>
        <NavLink to="/tabs" className="text-gray-300 hover:text-white mx-2">Ukulele Tabs</NavLink>
        <NavLink to="/patterns" className="text-gray-300 hover:text-white mx-2">Knitting Patterns</NavLink>
        <a className="text-gray-300 hover:text-white mx-2" href='https://www.discogs.com/user/wadeanthony0100/collection' >Record Catalog</a>
        <a className="text-gray-300 hover:text-white mx-2" href='https://www.instagram.com/etiolated_pothos/'>Houseplants</a>
        <a className="text-gray-300 hover:text-white mx-2" href='https://wadeahlstrom.com/'>Professional</a>
    </nav>
</header>
};