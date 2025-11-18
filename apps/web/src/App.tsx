import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h1>Literate Octo Chainsaw</h1>
      <p>React + TypeScript Frontend</p>
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={() => setCount((count) => count + 1)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer',
            backgroundColor: '#646cff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Count is {count}
        </button>
      </div>
    </div>
  );
}

export default App;
