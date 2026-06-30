import { useState } from 'react';
import PixieDustBackground from './PixieDustBackground';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className={`app ${darkMode ? 'is-dark' : 'is-light'}`}>
      <PixieDustBackground darkMode={darkMode} />

      <header className="header">
        <nav className="nav">
          <a href="#">Home</a>
          <a href="#">Projects</a>
          <a href="#">Info</a>
          <a href="#">Contact</a>
        </nav>
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <main className="content">
        <h1>Your Name</h1>
        <p className="subtitle">Designer & Developer</p>
        <p className="description">
          A demo of the Pixie Dust planet background effect, inspired by
          <a href="https://p5aholic.me/" target="_blank" rel="noopener noreferrer"> p5aholic.me</a>.
          Built with React + Three.js + custom GLSL shaders.
        </p>

        <div className="controls">
          <h2>How it works</h2>
          <ul>
            <li>Full-screen plane with an orthographic camera</li>
            <li>Fragment shader with simplex noise + fractal Brownian motion (FBM)</li>
            <li>Domain warping creates the swirling cloud effect</li>
            <li>Procedural grain & blur textures add depth</li>
            <li>Radial alpha falloff creates the "planet" illusion</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;
