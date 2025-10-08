import MoodAtlas from './components/MoodAtlas';

function App() {
  try {
    return (
      <div className="App">
        <MoodAtlas />
      </div>
    );
  } catch (error) {
    console.error('App Error:', error);
    return (
      <div style={{ padding: '20px', color: 'white', background: '#1a1a1a', height: '100vh' }}>
        <h1>Error Loading App</h1>
        <pre>{String(error)}</pre>
      </div>
    );
  }
}

export default App;
