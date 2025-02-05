export default ({extras}) => (<footer className="bg-gray-800 text-white text-center py-4 mt-8">
    <p>&copy; {new Date().getFullYear()} Wade Ahlstrom. All rights reserved.</p>
    {extras}
    </footer>);