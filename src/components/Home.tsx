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
        <div className="brutal-card brutal-card-yellow" style={{ textAlign: 'center', overflow: 'hidden' }}>
          <div className="stamp-badge">100% POINTLESS</div>

          {/* Floating visual stickers */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '8px', height: '110px', margin: '0.5rem 0' }}>
            <img
              src="/mohanlal.png"
              alt="Lalettan"
              style={{ height: '110px', objectFit: 'contain', filter: 'drop-shadow(2px 2px 0px #111)' }}
            />
            <img
              src="/a10_spadikam.png"
              alt="Spadikam"
              style={{ height: '95px', objectFit: 'contain', filter: 'drop-shadow(2px 2px 0px #111)', transform: 'rotate(4deg)' }}
            />
            <img
              src="/a10_crouch.png"
              alt="A10 Vintage"
              style={{ height: '80px', objectFit: 'contain', filter: 'drop-shadow(2px 2px 0px #111)', transform: 'rotate(-4deg)' }}
            />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            Brilliantly Impractical Measurement
          </h3>

          <p style={{ fontSize: '0.92rem', color: '#333333', fontWeight: 600, lineHeight: '1.5' }}>
            Ever looked at a book, a laptop, a friend, or a coconut tree and wondered:
            <em> "How many Lalettans tall is that thing?"</em>
          </p>

          <div style={{ marginTop: '0.85rem', padding: '0.45rem', background: '#fff', border: '2px dashed #111', borderRadius: '8px' }}>
            <span className="hand-note hand-note-pink">
              no AI APIs • no pitch decks • pure joy of making &lt;3
            </span>
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
