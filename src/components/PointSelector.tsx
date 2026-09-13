import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point } from '../types/measurement';

interface PointSelectorProps {
  mode: 'reference' | 'object';
  imageDataUrl: string;
  referenceName: string;
  onPointsSelected: (bottom: Point, top: Point) => void;
  onRotateImage?: (newImageDataUrl: string) => void;
  onBack: () => void;
  existingReferencePoints?: { bottom: Point; top: Point } | null;
}

export const PointSelector: React.FC<PointSelectorProps> = ({
  mode,
  imageDataUrl,
  referenceName,
  onPointsSelected,
  onRotateImage,
  onBack,
  existingReferencePoints,
}) => {
  const [bottomPoint, setBottomPoint] = useState<Point | null>(null);
  const [topPoint, setTopPoint] = useState<Point | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const isReference = mode === 'reference';

  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.src = imageDataUrl;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
  }, [imageDataUrl]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const scale = Math.max(1, Math.min(canvas.width, canvas.height) / 800);
    const radius = 10 * scale;
    const lineWidth = 3.5 * scale;
    const fontSize = Math.max(14, Math.round(16 * scale));

    ctx.font = `bold ${fontSize}px sans-serif`;

    const drawPoint = (p: Point, color: string, label: string) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius + 4 * scale, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 2 * scale;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius * 0.35, 0, 2 * Math.PI);
      ctx.fillStyle = '#000000';
      ctx.fill();

      const paddingX = 8 * scale;
      const paddingY = 4 * scale;
      const textMetrics = ctx.measureText(label);
      const textWidth = textMetrics.width;
      const pillHeight = fontSize + paddingY * 2;
      const pillWidth = textWidth + paddingX * 2;
      const pillX = p.x + radius + 6 * scale;
      const pillY = p.y - pillHeight / 2;

      ctx.fillStyle = 'rgba(18, 19, 22, 0.9)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 5 * scale);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, pillX + paddingX, pillY + pillHeight / 2);
    };

    const drawLine = (p1: Point, p2: Point, color: string, isDashed = false) => {
      ctx.save();
      ctx.beginPath();
      if (isDashed) {
        ctx.setLineDash([8 * scale, 6 * scale]);
      }
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 6 * scale;
      ctx.stroke();
      ctx.restore();
    };

    if (!isReference && existingReferencePoints) {
      const { bottom, top } = existingReferencePoints;
      drawLine(bottom, top, 'rgba(125, 211, 252, 0.7)', true);
      drawPoint(bottom, '#38bdf8', `${referenceName} Bottom`);
      drawPoint(top, '#38bdf8', `${referenceName} Top`);
    }

    const currentColor = isReference ? '#38bdf8' : '#e09f3e';
    const bottomLabel = isReference ? `${referenceName} Bottom` : 'Object Bottom';
    const topLabel = isReference ? `${referenceName} Top` : 'Object Top';

    if (bottomPoint) {
      drawPoint(bottomPoint, currentColor, bottomLabel);
    }

    if (topPoint) {
      drawPoint(topPoint, currentColor, topLabel);
    }

    if (bottomPoint && topPoint) {
      drawLine(bottomPoint, topPoint, currentColor, false);
    }
  }, [bottomPoint, topPoint, imageLoaded, isReference, existingReferencePoints, referenceName]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleCanvasClick = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    setError(null);

    if (!bottomPoint) {
      setBottomPoint({ x, y });
    } else if (!topPoint) {
      const dist = Math.sqrt(Math.pow(x - bottomPoint.x, 2) + Math.pow(y - bottomPoint.y, 2));
      if (dist < 4) {
        setError('Points cannot be identical. Please tap the top.');
        return;
      }
      setTopPoint({ x, y });
    }
  };

  const handleReset = () => {
    setBottomPoint(null);
    setTopPoint(null);
    setError(null);
  };

  const handleRotate = () => {
    if (!onRotateImage || !imageRef.current) return;
    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalHeight;
    canvas.height = img.naturalWidth;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      handleReset();
      onRotateImage(rotatedDataUrl);
    }
  };

  const handleProceed = () => {
    if (!bottomPoint || !topPoint) {
      setError(
        isReference
          ? `Please mark both bottom and top of the ${referenceName}.`
          : 'Please mark both bottom and top of the object.'
      );
      return;
    }

    onPointsSelected(bottomPoint, topPoint);
  };

  let instructionText = '';
  if (!bottomPoint) {
    instructionText = isReference
      ? `Tap the BOTTOM of the ${referenceName}`
      : 'Tap the BOTTOM of the object';
  } else if (!topPoint) {
    instructionText = isReference
      ? `Tap the TOP of the ${referenceName}`
      : 'Tap the TOP of the object';
  } else {
    instructionText = isReference
      ? `${referenceName} marked! Tap Continue.`
      : 'Object marked! Ready to calculate.';
  }

  const pixelDistance =
    bottomPoint && topPoint
      ? Math.round(Math.sqrt(Math.pow(topPoint.x - bottomPoint.x, 2) + Math.pow(topPoint.y - bottomPoint.y, 2)))
      : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
      <div>
        <div className="brand-header" style={{ marginBottom: '1rem' }}>
          <div className="tinker-pill">{isReference ? 'STEP 03 OF 04' : 'STEP 04 OF 04'}</div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 900, textTransform: 'uppercase' }}>
            {isReference ? `Mark ${referenceName}` : 'Mark Measured Object'}
          </h2>
          <p className="hand-note">
            {isReference
              ? `"click bottom then top of ${referenceName}"`
              : '"now click bottom then top of the object"'}
          </p>
        </div>

        {error && <div className="error-banner">⚠️ {error}</div>}

        <div className="responsive-canvas-layout">
          {/* Canvas Column */}
          <div>
            <div className="canvas-wrapper">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onTouchStart={handleCanvasClick}
                className="measurement-canvas"
              />
            </div>
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
                marginTop: '0.5rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              🖱️ Mouse crosshair on laptop • 👆 Touch tap on phone
            </p>
          </div>

          {/* Controls & Instructions Column */}
          <div className="sticky-panel-desktop" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Step Banner */}
            <div className="step-banner" style={{ margin: 0 }}>
              <span className="step-instruction">{instructionText}</span>
              <span className={`step-tag ${isReference ? 'ref' : 'obj'}`}>
                {isReference ? referenceName.toUpperCase() : 'OBJECT'}
              </span>
            </div>

            {/* Marking Status Card */}
            <div className="brutal-card" style={{ margin: 0, padding: '1rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                📍 Marker Coordinates:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>1. Bottom Point:</span>
                  <span style={{ fontWeight: 800, color: bottomPoint ? '#10b981' : '#888' }}>
                    {bottomPoint ? `(${Math.round(bottomPoint.x)}, ${Math.round(bottomPoint.y)})` : '⏳ Waiting'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>2. Top Point:</span>
                  <span style={{ fontWeight: 800, color: topPoint ? '#10b981' : '#888' }}>
                    {topPoint ? `(${Math.round(topPoint.x)}, ${Math.round(topPoint.y)})` : '⏳ Waiting'}
                  </span>
                </div>
                {pixelDistance !== null && (
                  <div
                    style={{
                      borderTop: '1.5px dashed #ccc',
                      paddingTop: '6px',
                      marginTop: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 800,
                    }}
                  >
                    <span>Span Height:</span>
                    <span style={{ color: 'var(--tinker-pink)' }}>{pixelDistance} px</span>
                  </div>
                )}
              </div>

              {/* Action buttons inside panel */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '0.85rem' }}>
                {isReference && onRotateImage && (
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={handleRotate}
                    style={{ flex: 1, justifyContent: 'center' }}
                    title="Rotate 90 degrees if photo was taken sideways"
                  >
                    🔄 Rotate 90°
                  </button>
                )}
                <button
                  type="button"
                  className="chip-btn"
                  onClick={handleReset}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Reset Points
                </button>
              </div>
            </div>

            {/* Action Buttons for this step */}
            <div className="btn-group">
              <button
                className="btn btn-primary"
                disabled={!bottomPoint || !topPoint}
                onClick={handleProceed}
              >
                {isReference ? 'CONTINUE ➔' : 'CALCULATE HEIGHT ⚡'}
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
