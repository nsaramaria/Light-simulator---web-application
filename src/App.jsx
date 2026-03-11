// src/App.jsx
import React from 'react';
import CameraView from './scene/CameraView';
import SetupView from './scene/SetupView';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{
        background: '#2d2822',
        padding: '16px 24px',
        color: '#e8dfd6',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        borderBottom: '1px solid #3d3530',
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
          Studio Simulator
        </h1>
      </div>

      {/* two views */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* camera view */}
        <div style={{ flex: 1, position: 'relative', borderRight: '2px solid #3d3530' }}>
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(45, 40, 34, 0.85)',
            color: '#e8dfd6',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            border: '1px solid #3d3530',
          }}>
            Camera View
          </div>
          <CameraView />
        </div>

        {/* setup view */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(45, 40, 34, 0.85)',
            color: '#e8dfd6',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            zIndex: 10,
            border: '1px solid #3d3530',
          }}>
            Setup View
          </div>
          <SetupView />
        </div>
      </div>
    </div>
  );
}