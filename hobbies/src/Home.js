import Header from './components/header';
import Footer from './components/footer';
import Tips from './components/tips';
import './App.css';

function Home() {
  return (
    <>
        <Header />
        <main className="container mx-auto mt-8 px-4">
          <section className="text-center mb-8">
            <h2 className="text-2xl font-semibold">About Me</h2>
            <p className="mt-2">I enjoy knitting, cooking, and playing the ukulele. These pages have some of my favorite patterns, songs, and recipes!</p>
          </section>
          <section className="bg-gray-800 p-4 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-semibold">Featured Content</h2> I'm workin' on it, eh!
          </section>
        </main>
        <Footer extras={< Tips/>} />
    </>
  );
}

export default Home;