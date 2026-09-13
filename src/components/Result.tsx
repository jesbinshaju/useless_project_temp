import React, { useRef, useEffect, useState } from 'react';
import { MeasurementResult, UnitType } from '../types/measurement';
import { A10_NAME, A10_UNIT_LABEL, A10_HEIGHT_METERS, LALETTAN_SKINS } from '../data/config';

interface ResultProps {
  result: MeasurementResult;
  imageDataUrl: string | null;
  onMeasureAgain: () => void;
  onChangeReference: () => void;
}

export const Result: React.FC<ResultProps> = ({
  result,
  imageDataUrl,
  onMeasureAgain,
  onChangeReference,
}) => {
  const [activeUnit, setActiveUnit] = useState<UnitType>('cm');
  const [selectedSkinUrl, setSelectedSkinUrl] = useState<string>(LALETTAN_SKINS[0].url);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const roundedA10 = result.a10Multiplier.toFixed(2);
  const roundedRefMultiplier = result.referenceMultiplier.toFixed(1);

  const formattedHeight = () => {
    switch (activeUnit) {
      case 'cm':
        return `${result.objectHeightCm.toFixed(1)} cm`;
      case 'm':
        return `${result.objectHeightMeters.toFixed(2)} m`;
      case 'ft':
        return `${result.objectHeightFeet.toFixed(2)} ft`;
    }
  };

  const handleRotateImage = () => {
    setRotationDeg((prev) => (prev + 90) % 360);
  };

  useEffect(() => {
    if (!imageDataUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseImg = new Image();
    baseImg.src = imageDataUrl;

    const mohanlalImg = new Image();
    mohanlalImg.src = selectedSkinUrl;

    let isCancelled = false;

    const render = () => {
      if (isCancelled) return;

      const imgW = baseImg.naturalWidth;
      const imgH = baseImg.naturalHeight;

      const isRotated90or270 = rotationDeg === 90 || rotationDeg === 270;
      canvas.width = isRotated90or270 ? imgH : imgW;
      canvas.height = isRotated90or270 ? imgW : imgH;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw base image with rotation
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotationDeg * Math.PI) / 180);
      ctx.drawImage(baseImg, -imgW / 2, -imgH / 2);
      ctx.restore();

      if (!showOverlay) return;

      const transformPoint = (p: { x: number; y: number }) => {
        const rad = (rotationDeg * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const cx = p.x - imgW / 2;
        const cy = p.y - imgH / 2;

        const rx = cx * cos - cy * sin;
        const ry = cx * sin + cy * cos;

        return {
          x: rx + canvas.width / 2,
          y: ry + canvas.height / 2,
        };
      };

      const scale = Math.max(1, Math.min(canvas.width, canvas.height) / 800);

      // Mathematical Scaling
      const pixelsPerMeter = result.referencePixelHeight / result.referenceHeightMeters;
      const oneMohanlalPxHeight = pixelsPerMeter * A10_HEIGHT_METERS;

      const mAspect =
        mohanlalImg.naturalWidth && mohanlalImg.naturalHeight
          ? mohanlalImg.naturalWidth / mohanlalImg.naturalHeight
          : 0.368;
      const mohanlalWidth = oneMohanlalPxHeight * mAspect;

      const objBottom = transformPoint(result.objBottom);
      const objTop = transformPoint(result.objTop);

      // Draw object marker line
      ctx.save();
      ctx.strokeStyle = '#ffdf00';
      ctx.lineWidth = 4 * scale;
      ctx.setLineDash([8 * scale, 6 * scale]);
      ctx.beginPath();
      ctx.moveTo(objBottom.x, objBottom.y);
      ctx.lineTo(objTop.x, objTop.y);
      ctx.stroke();

      // Draw points
      ctx.fillStyle = '#ffdf00';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(objBottom.x, objBottom.y, 7 * scale, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(objTop.x, objTop.y, 7 * scale, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      const groundY = Math.max(objBottom.y, objTop.y);
      const topY = Math.min(objBottom.y, objTop.y);
      const measuredSpan = groundY - topY;

      // Positioning of the stack
      const objMidX = (objBottom.x + objTop.x) / 2;
      let stackX = objMidX + 24 * scale;
      if (stackX + mohanlalWidth > canvas.width - 20 * scale) {
        stackX = objMidX - mohanlalWidth - 24 * scale;
      }
      stackX = Math.max(15 * scale, Math.min(canvas.width - mohanlalWidth - 15 * scale, stackX));

      const count = result.a10Multiplier;
      const wholeA10s = Math.floor(count);
      const fractionalPart = count - wholeA10s;

      ctx.save();
      let currentY = groundY;

      // 1. If object is smaller than 1 Mohanlal (count < 1.0)
      if (wholeA10s === 0) {
        const destY = groundY - oneMohanlalPxHeight;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 10 * scale;

        ctx.drawImage(
          mohanlalImg,
          0,
          0,
          mohanlalImg.naturalWidth,
          mohanlalImg.naturalHeight,
          stackX,
          destY,
          mohanlalWidth,
          oneMohanlalPxHeight
        );

        ctx.shadowBlur = 0;

        // Sticker pill on Lalettan
        const badgeX = stackX + mohanlalWidth + 6 * scale;
        const badgeY = groundY - measuredSpan / 2;

        ctx.fillStyle = '#ffdf00';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY - 12 * scale, 80 * scale, 24 * scale, 4 * scale);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#111111';
        ctx.font = `bold ${Math.max(12, Math.round(13 * scale))}px "Space Grotesk", sans-serif`;
        ctx.fillText(`${count.toFixed(2)} A10`, badgeX + 8 * scale, badgeY + 5 * scale);

        // Dashed 1 A10 mark
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2 * scale;
        ctx.setLineDash([4 * scale, 4 * scale]);
        ctx.beginPath();
        ctx.moveTo(stackX - 6 * scale, destY);
        ctx.lineTo(stackX + mohanlalWidth + 60 * scale, destY);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.max(10, Math.round(11 * scale))}px sans-serif`;
        ctx.fillText(`1 A10 (172 cm)`, stackX + mohanlalWidth + 8 * scale, destY + 4 * scale);
        ctx.restore();
      } else {
        // 2. Stack whole Mohanlals
        for (let i = 0; i < wholeA10s; i++) {
          const destY = currentY - oneMohanlalPxHeight;

          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 10 * scale;

          ctx.drawImage(
            mohanlalImg,
            0,
            0,
            mohanlalImg.naturalWidth,
            mohanlalImg.naturalHeight,
            stackX,
            destY,
            mohanlalWidth,
            oneMohanlalPxHeight
          );

          ctx.shadowBlur = 0;

          // Sticker badge
          const badgeX = stackX + mohanlalWidth + 6 * scale;
          const badgeY = destY + oneMohanlalPxHeight / 2;

          ctx.fillStyle = '#ffdf00';
          ctx.strokeStyle = '#111111';
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY - 10 * scale, 65 * scale, 20 * scale, 4 * scale);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#111111';
          ctx.font = `bold ${Math.max(11, Math.round(12 * scale))}px "Space Grotesk", sans-serif`;
          ctx.fillText(`A10 #${i + 1}`, badgeX + 6 * scale, badgeY + 4 * scale);

          currentY -= oneMohanlalPxHeight;
        }

        // Fractional top Mohanlal
        if (fractionalPart > 0.04) {
          const fracPxHeight = oneMohanlalPxHeight * fractionalPart;
          const destY = currentY - fracPxHeight;

          const srcCropHeight = mohanlalImg.naturalHeight * fractionalPart;
          const srcCropY = mohanlalImg.naturalHeight - srcCropHeight;

          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 10 * scale;

          ctx.drawImage(
            mohanlalImg,
            0,
            srcCropY,
            mohanlalImg.naturalWidth,
            srcCropHeight,
            stackX,
            destY,
            mohanlalWidth,
            fracPxHeight
          );

          ctx.shadowBlur = 0;

          const badgeX = stackX + mohanlalWidth + 6 * scale;
          const badgeY = destY + fracPxHeight / 2;

          ctx.fillStyle = '#ea34df';
          ctx.strokeStyle = '#111111';
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY - 10 * scale, 85 * scale, 20 * scale, 4 * scale);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(10, Math.round(11 * scale))}px "Space Grotesk", sans-serif`;
          ctx.fillText(`+${fractionalPart.toFixed(2)} A10`, badgeX + 6 * scale, badgeY + 4 * scale);
        }
      }

      ctx.restore();

      // Top height measurement bracket across object top
      ctx.save();
      const topBracketY = topY;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(stackX - 8 * scale, topBracketY);
      ctx.lineTo(stackX + mohanlalWidth + 120 * scale, topBracketY);
      ctx.stroke();

      // Label background pill
      const labelX = stackX;
      const labelY = Math.max(24 * scale, topBracketY - 10 * scale);
      ctx.fillStyle = '#10b981';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY - 16 * scale, 180 * scale, 22 * scale, 4 * scale);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(11, Math.round(12 * scale))}px "Space Grotesk", sans-serif`;
      ctx.fillText(
        `TOTAL: ${count.toFixed(2)} A10 (${result.objectHeightCm.toFixed(1)} cm)`,
        labelX + 8 * scale,
        labelY
      );
      ctx.restore();
    };

    let loadedCount = 0;
    const onAssetLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        render();
      }
    };

    baseImg.onload = onAssetLoaded;
    mohanlalImg.onload = onAssetLoaded;

    return () => {
      isCancelled = true;
    };
  }, [imageDataUrl, result, showOverlay, rotationDeg, selectedSkinUrl]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
      <div>
        <div className="brand-header" style={{ marginBottom: '1.25rem' }}>
          <div className="tinker-pill">VERIFIED RESULT</div>
          <h1 className="brand-title">A10 METER</h1>
          <p className="hand-note">"official lalettan measurement protocol complete"</p>
        </div>

        <div className="responsive-result-layout">
          {/* Left Column: Stacked Mohanlal Photo Canvas & Skin Selector */}
          <div>
            {imageDataUrl && (
              <div className="brutal-card" style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, textTransform: 'uppercase' }}>
                    📸 Mohanlal Scaled On Object
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="chip-btn"
                      onClick={handleRotateImage}
                      style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                      title="Rotate photo 90 degrees"
                    >
                      🔄 Rotate
                    </button>
                    <button
                      type="button"
                      className="chip-btn"
                      onClick={() => setShowOverlay(!showOverlay)}
                      style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                    >
                      {showOverlay ? '👁️ Hide Lalettan' : '👁️ Show Lalettan'}
                    </button>
                  </div>
                </div>

                <div className="canvas-wrapper">
                  <canvas ref={canvasRef} className="measurement-canvas" />
                </div>

                {/* Choose Lalettan Avatar Skin */}
                <div style={{ marginTop: '0.85rem' }}>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      marginBottom: '0.35rem',
                    }}
                  >
                    🎭 Choose Lalettan Avatar:
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {LALETTAN_SKINS.map((skin) => (
                      <button
                        key={skin.id}
                        type="button"
                        className={`chip-btn ${selectedSkinUrl === skin.url ? 'active' : ''}`}
                        onClick={() => setSelectedSkinUrl(skin.url)}
                        style={{ fontSize: '0.78rem', padding: '5px 10px' }}
                      >
                        <span>{skin.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <p
                  style={{
                    fontFamily: 'var(--font-hand)',
                    fontSize: '1.4rem',
                    color: 'var(--text-sketch)',
                    textAlign: 'center',
                    marginTop: '0.65rem',
                  }}
                >
                  "measured strictly to scale using 1 A10 = 172 cm"
                </p>
              </div>
            )}

            {/* Humorous remark */}
            <div className="useless-quote-box" style={{ margin: '0 0 1rem 0' }}>
              ✨ "congratulations. you have measured something nobody asked you to measure."
            </div>

            {/* Disclaimer */}
            <div className="disclaimer-box" style={{ margin: 0 }}>
              <strong>⚠️ Disclaimer:</strong> Built for TinkerHub Useless Projects. Accuracy depends on
              camera angle, keeping the reference and measured object at approximately the same distance and
              ground level. Not for building bridges or space rockets.
            </div>
          </div>

          {/* Right Column: Score, Unit Selector, Meme, Stats & Buttons */}
          <div className="sticky-panel-desktop" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Primary Multiplier & Unit Selector */}
            <div className="result-hero-box" style={{ margin: 0 }}>
              <div className="stamp-badge">VERIFIED USELESS</div>
              <div className="result-multiplier-val">{roundedA10} ×</div>
              <div className="result-multiplier-label">{A10_UNIT_LABEL}</div>
              <div className="result-quote">
                "That's about {roundedA10} {A10_NAME}s tall."
              </div>

              {/* Metric Selector Tabs (cm, m, ft) */}
              <div
                style={{
                  display: 'inline-flex',
                  background: '#ffffff',
                  padding: '3px',
                  borderRadius: '8px',
                  border: 'var(--border-thick)',
                  boxShadow: '3px 3px 0px #111111',
                  marginTop: '1.25rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveUnit('cm')}
                  style={{
                    background: activeUnit === 'cm' ? 'var(--tinker-yellow)' : 'transparent',
                    color: '#111111',
                    fontWeight: 900,
                    fontFamily: 'var(--font-display)',
                    border: activeUnit === 'cm' ? '2px solid #111' : 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  cm
                </button>
                <button
                  type="button"
                  onClick={() => setActiveUnit('m')}
                  style={{
                    background: activeUnit === 'm' ? 'var(--tinker-yellow)' : 'transparent',
                    color: '#111111',
                    fontWeight: 900,
                    fontFamily: 'var(--font-display)',
                    border: activeUnit === 'm' ? '2px solid #111' : 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  m
                </button>
                <button
                  type="button"
                  onClick={() => setActiveUnit('ft')}
                  style={{
                    background: activeUnit === 'ft' ? 'var(--tinker-yellow)' : 'transparent',
                    color: '#111111',
                    fontWeight: 900,
                    fontFamily: 'var(--font-display)',
                    border: activeUnit === 'ft' ? '2px solid #111' : 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  ft
                </button>
              </div>

              <div
                style={{
                  marginTop: '0.75rem',
                  fontSize: '2rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#111111',
                }}
              >
                {formattedHeight()}
              </div>
            </div>

            {/* Reaction Meme Card based on measurement size */}
            <div
              className="brutal-card brutal-card-yellow"
              style={{ margin: 0, padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <img
                src={result.a10Multiplier > 3 ? '/meme_kireedam.webp' : '/meme_barroz.jpg'}
                alt="Reaction"
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '8px',
                  border: '2px solid #111',
                  objectFit: 'cover',
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    color: 'var(--tinker-pink)',
                  }}
                >
                  {result.a10Multiplier > 3 ? '🔴 Kireedam Sethumadhavan Moment' : '🟡 Barroz Reaction'}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-hand)',
                    fontSize: '1.45rem',
                    lineHeight: '1.15',
                    color: '#111',
                  }}
                >
                  {result.a10Multiplier > 3
                    ? '"Ente ponnedaave ithrekkaayirunno ithinte neelam?!"'
                    : '"Pakshe ithu aarkku venam? Athalle useless project!"'}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid-brutal" style={{ margin: 0 }}>
              <div className="stat-card-brutal">
                <div className="stat-card-val">{result.objectHeightCm.toFixed(1)} cm</div>
                <div className="stat-card-lbl">Centimeters</div>
              </div>
              <div className="stat-card-brutal">
                <div className="stat-card-val">{result.objectHeightMeters.toFixed(2)} m</div>
                <div className="stat-card-lbl">Meters</div>
              </div>
            </div>

            <div className="stats-grid-brutal" style={{ margin: 0 }}>
              <div className="stat-card-brutal">
                <div className="stat-card-val">{roundedRefMultiplier}×</div>
                <div className="stat-card-lbl">{result.referenceName.split(' ')[0]}s</div>
              </div>
              <div className="stat-card-brutal">
                <div className="stat-card-val">172 cm</div>
                <div className="stat-card-lbl">1 A10 Unit</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="btn-group" style={{ marginTop: '0.5rem' }}>
              <button className="btn btn-primary" onClick={onMeasureAgain}>
                MEASURE ANOTHER OBJECT 🔄
              </button>
              <button className="btn btn-secondary" onClick={onChangeReference}>
                CHANGE REFERENCE ITEM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
