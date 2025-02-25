import './App.css';
import { Outlet } from 'react-router-dom';

function Home() {
  return (
    <>
        <main className="container mx-auto px-4 py-4">
          <Outlet />
        </main>
    </>
  );
}

export default Home;