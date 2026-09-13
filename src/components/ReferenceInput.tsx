import React, { useState } from 'react';
import { POPULAR_REFERENCES } from '../data/config';

interface ReferenceInputProps {
  initialHeightCm: number;
  initialReferenceName: string;
  onContinue: (heightMeters: number, referenceName: string) => void;
  onBack: () => void;
}

export const ReferenceInput: React.FC<ReferenceInputProps> = ({
  initialHeightCm,
  initialReferenceName,
  onContinue,
  onBack,
}) => {
  const [referenceName, setReferenceName] = useState<string>(initialReferenceName);
  const [heightCmStr, setHeightCmStr] = useState<string>(initialHeightCm.toString());
  const [error, setError] = useState<string | null>(null);

  const handleSelectPreset = (name: string, heightCm: number) => {
    setReferenceName(name);
    setHeightCmStr(heightCm.toString());
    setError(null);
  };

  const handleContinue = () => {
    const parsed = parseFloat(heightCmStr);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid positive height for your reference.');
      return;
    }
    if (parsed < 1 || parsed > 3000) {
      setError('Height seems unrealistic. Please enter height in centimeters (e.g. 15 cm for a phone).');
      return;
    }
    setError(null);
    onContinue(parsed / 100, referenceName.trim() || 'Reference Item');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
      <div>
        <div className="brand-header">
          <div className="tinker-pill">STEP 01 OF 04</div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 900, textTransform: 'uppercase' }}>
            Choose Reference
          </h2>
          <p className="hand-note">"what's standing next to your object?"</p>
        </div>

        <div className="responsive-two-col" style={{ marginBottom: '1.5rem' }}>
          {/* Left Column: Presets & Tips */}
          <div>
            <label className="input-label">Quick Pick Known Items:</label>
            <div className="chip-grid">
              {POPULAR_REFERENCES.map((item) => {
                const isSelected = referenceName === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    className={`chip-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(item.name, item.heightCm)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name.split(' (')[0]}</span>
                    <span style={{ opacity: 0.75, fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                      ({item.heightCm}cm)
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                fontSize: '0.88rem',
                color: '#333',
                background: '#fffde6',
                border: 'var(--border-thin)',
                boxShadow: '3px 3px 0px #111',
                padding: '0.85rem',
                borderRadius: '8px',
                marginTop: '1rem',
              }}
            >
              💡 <strong>Lalettan Measurement Tip:</strong> A regular smartphone is ~15 cm. Stand it upright
              on the floor or table right beside the object before snapping the picture!
            </div>
          </div>

          {/* Right Column: Reference Details Form */}
          <div>
            <div className="brutal-card" style={{ margin: 0 }}>
              <div className="input-group" style={{ marginTop: 0 }}>
                <label className="input-label" htmlFor="ref-name-input">
                  Reference Item Name
                </label>
                <div className="input-row">
                  <input
                    id="ref-name-input"
                    type="text"
                    className="text-input"
                    value={referenceName}
                    onChange={(e) => setReferenceName(e.target.value)}
                    placeholder="e.g. Smartphone, Bottle, Book"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="ref-height-input">
                  Known Physical Height
                </label>
                <div className="input-row">
                  <input
                    id="ref-height-input"
                    type="number"
                    step="any"
                    min="0.5"
                    max="3000"
                    className="numeric-input"
                    value={heightCmStr}
                    onChange={(e) => {
                      setHeightCmStr(e.target.value);
                      setError(null);
                    }}
                    placeholder="15"
                  />
                  <span className="input-unit">cm</span>
                </div>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    marginTop: '0.35rem',
                  }}
                >
                  = {((parseFloat(heightCmStr) || 0) / 100).toFixed(3)} meters
                </p>
              </div>

              {error && <div className="error-banner">⚠️ {error}</div>}
            </div>

            <div className="btn-group" style={{ marginTop: '1rem' }}>
              <button className="btn btn-primary" onClick={handleContinue}>
                CONTINUE ➔
              </button>
              <button className="btn btn-secondary" onClick={onBack}>
                BACK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
