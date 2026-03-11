// src/App.jsx
import React, { useState } from 'react';
import CameraView from './scene/CameraView';
import SetupView from './scene/SetupView';

export default function App() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          background: '#2d2822',
          padding: '16px 24px',
          color: '#e8dfd6',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #3d3530',
        }}
      >
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
          Studio Simulator
        </h1>
        
        <button
          onClick={() => setShowHelp(true)}
          style={{
            background: 'transparent',
            border: '1px solid #3d3530',
            color: '#e8dfd6',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#3d3530';
            e.target.style.borderColor = '#d4a574';
            e.target.style.color = '#d4a574';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.borderColor = '#3d3530';
            e.target.style.color = '#e8dfd6';
          }}
        >
          How to use
        </button>
      </div>

      {/* Two Views Side by Side */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left: Camera View */}
        <div style={{ flex: 1, position: 'relative', borderRight: '2px solid #3d3530' }}>
          <div
            style={{
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
            }}
          >
            Camera View
          </div>
          <CameraView />
        </div>

        {/* Right: Setup View */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div
            style={{
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
            }}
          >
            Setup View
          </div>
          <SetupView />
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(26, 22, 18, 0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowHelp(false)}
        >
          <div
            style={{
              background: '#2d2822',
              borderRadius: '12px',
              padding: '0',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              border: '1px solid #3d3530',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #3d3530',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '20px', color: '#e8dfd6', fontWeight: '600' }}>
                How to Use Studio Simulator
              </h2>
              <button
                onClick={() => setShowHelp(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9b8a7a',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#3d3530';
                  e.target.style.color = '#e8dfd6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#9b8a7a';
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', color: '#e8dfd6' }}>
              {/* Setup View Section */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  color: '#e8dfd6', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  marginTop: 0
                }}>
                  Setup View (Right Side)
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>Overhead view of your studio setup</li>
                  <li>Orange pyramid shows camera position and field of view</li>
                  <li>White sphere shows light position</li>
                  <li>Grid helps with spatial reference</li>
                  <li>Drag to rotate view, scroll to zoom</li>
                </ul>
              </div>

              {/* Camera View Section */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  color: 'white', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  marginTop: 0
                }}>
                  Camera View (Left Side)
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>Shows what the photographer's camera captures</li>
                  <li><strong>Locked mode:</strong> Fixed camera position, see exact final photo</li>
                  <li><strong>Free mode:</strong> Explore and inspect from any angle</li>
                  <li>Toggle switch to change between modes</li>
                </ul>
              </div>

              {/* Controls Section */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  color: 'white', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  marginTop: 0
                }}>
                  Mouse Controls
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li><strong>Left click + drag:</strong> Rotate view</li>
                  <li><strong>Scroll wheel:</strong> Zoom in/out</li>
                  <li><strong>Right click + drag:</strong> Pan camera</li>
                </ul>
              </div>

              {/* Visual Guide Section */}
              <div>
                <h3 style={{ 
                  color: 'white', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  marginTop: 0
                }}>
                  Visual Guide
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li><strong>Orange lines:</strong> Camera viewing frustum</li>
                  <li><strong>White sphere:</strong> Light position</li>
                  <li><strong>Blue cube:</strong> Product being photographed</li>
                  <li><strong>Grid:</strong> Floor reference (each square = 1 unit)</li>
                  <li><strong>Colored axes:</strong> Red (X), Green (Y), Blue (Z)</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #3d3530',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setShowHelp(false)}
                style={{
                  background: '#d4a574',
                  border: 'none',
                  color: '#1a1612',
                  padding: '10px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#c99564';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#d4a574';
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}