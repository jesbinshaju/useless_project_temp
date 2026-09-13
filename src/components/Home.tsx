import React from 'react';

interface HomeProps {
  onStart: () => void;
}

export const Home: React.FC<HomeProps> = ({ onStart }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
      <div>
        <div className="brand-header" style={{ marginTop: '0.75rem' }}>
          <div className="tinker-pill">
            <span>👾</span> USELESS PROJECTS 3.0
          </div>
          <h1 className="brand-title">A10 METER</h1>
          <p className="brand-subtitle">"how many a10s tall is that?"</p>
        </div>

        {/* Hero Card with Lalettan Cutout Teaser */}
        <div className="brutal-card brutal-card-yellow" style={{ textAlign: 'center', overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div className="stamp-badge">100% POINTLESS</div>

          {/* Floating visual stickers */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '12px', height: '120px', margin: '0.5rem 0' }}>
            <img
              src="/mohanlal.png"
              alt="Lalettan"
              style={{ height: '120px', objectFit: 'contain', filter: 'drop-shadow(3px 3px 0px #111)' }}
            />
            <img
              src="/a10_spadikam.png"
              alt="Spadikam"
              style={{ height: '105px', objectFit: 'contain', filter: 'drop-shadow(3px 3px 0px #111)', transform: 'rotate(4deg)' }}
            />
            <img
              src="/a10_crouch.png"
              alt="A10 Vintage"
              style={{ height: '90px', objectFit: 'contain', filter: 'drop-shadow(3px 3px 0px #111)', transform: 'rotate(-4deg)' }}
            />
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            Brilliantly Impractical Measurement Engine
          </h3>

          <p style={{ fontSize: '0.96rem', color: '#333333', fontWeight: 600, lineHeight: '1.5', maxWidth: '650px', margin: '0 auto' }}>
            Ever looked at a book, your laptop, a coffee mug, or your friend and wondered:
            <em> "How many Lalettans (Mohanlals) tall is that thing?"</em>
          </p>

          <div style={{ marginTop: '0.85rem', padding: '0.45rem', background: '#fff', border: '2px dashed #111', borderRadius: '8px' }}>
            <span className="hand-note hand-note-pink">
              no AI APIs • 100% client side math • pure joy of making &lt;3
            </span>
          </div>
        </div>

        {/* 3 Step How It Works Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <div className="brutal-card" style={{ margin: 0, padding: '0.85rem 0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📏</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 900, textTransform: 'uppercase' }}>1. Stand Phone Beside</div>
            <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '2px' }}>Use smartphone (~15cm) as scale reference</div>
          </div>

          <div className="brutal-card" style={{ margin: 0, padding: '0.85rem 0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📸</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 900, textTransform: 'uppercase' }}>2. Snap Photo</div>
            <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '2px' }}>Use phone camera or laptop webcam</div>
          </div>

          <div className="brutal-card brutal-card-pink" style={{ margin: 0, padding: '0.85rem 0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>👑</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 900, textTransform: 'uppercase' }}>3. Stack Lalettan</div>
            <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '2px' }}>Scales Mohanlal head-to-toe mathematically!</div>
          </div>
        </div>
      </div>

      <div>
        <button className="btn btn-primary" onClick={onStart}>
          MEASURE SOMETHING 🚀
        </button>
      </div>
    </div>
  );
};
