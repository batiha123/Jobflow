import { useState } from 'react';
import './App.css';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';

function App() {
  const [modal, setModal] = useState(null);

  return (
    <>
      <div className={`page ${modal ? 'page-blurred' : ''}`} id="top">
        <Header onOpenModal={setModal} />
        <main>
          <Hero />
          <Stats />
          <section className="bottom-banner">
            <span>ILS RECRUTENT LEURS FUTURS TALENTS SUR JOBFLOW</span>
          </section>
        </main>
      </div>
      {modal && (
        <AuthModal
          mode={modal}
          onClose={() => setModal(null)}
          onSwitch={setModal}
        />
      )}
    </>
  );
}

export default App;
