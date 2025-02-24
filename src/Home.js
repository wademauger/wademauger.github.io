import './App.css';
import { Outlet } from 'react-router-dom';

function Home() {
  return (
    <>
        <main className="container mx-auto mt-8 px-4">
          <Outlet />
        </main>
    </>
  );
}

export default Home;