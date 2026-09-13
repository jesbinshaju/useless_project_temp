import React, { useRef, useState, useEffect } from 'react';

interface CameraCaptureProps {
  onImageSelected: (imageDataUrl: string) => void;
  onBack: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onImageSelected,
  onBack,
}) => {
  const [streamActive, setStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    try {
      setCameraError(null);
      stopCamera();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Live camera is not supported or requires HTTPS. Use "Take with Phone Camera" or "Upload Image" below!'
        );
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode } },
          audio: false,
        });
      } catch (e) {
        console.warn('Fallback to any video constraint:', e);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play interrupted:', playErr);
        }
      }
      setStreamActive(true);
      setFacingMode(mode);
    } catch (err: unknown) {
      console.warn('Camera access failed:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Camera access denied or unavailable. You can easily use "Take with Phone Camera" below!';
      setCameraError(message);
      setStreamActive(false);
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextMode);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const takePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCapturedImage(dataUrl);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Helper to rotate the image 90 degrees clockwise and update capturedImage dataUrl
  const handleRotateImage = () => {
    if (!capturedImage) return;

    const img = new Image();
    img.src = capturedImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedImage(rotatedDataUrl);
      }
    };
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      onImageSelected(capturedImage);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
      <div>
        <div className="brand-header">
          <span className="brand-badge">Step 2 of 4</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Capture or Upload Photo</h2>
          <p className="brand-subtitle">
            Photo must include both your reference item and the object.
          </p>
        </div>

        {/* Guidelines */}
        {!capturedImage && (
          <div className="guidelines-box">
            <div className="guidelines-title">
              <span>🎯</span> Tips for Best Accuracy:
            </div>
            <ul className="guidelines-list">
              <li>Place the reference (phone/bottle) right beside the object</li>
              <li>Keep both on the same ground level and distance</li>
              <li>Keep entire reference and object visible</li>
              <li>Make sure the photo is upright (use Rotate if needed!)</li>
            </ul>
          </div>
        )}

        {/* Live Video Preview */}
        {streamActive && !capturedImage && (
          <div className="camera-video-wrapper">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="camera-video"
            />
            <button
              type="button"
              onClick={toggleFacingMode}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Flip Camera"
            >
              🔄
            </button>
          </div>
        )}

        {/* Captured Photo Preview with Rotate Button */}
        {capturedImage && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Photo Preview
              </span>
              <button
                type="button"
                className="chip-btn active"
                onClick={handleRotateImage}
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
              >
                🔄 Rotate 90° Upright
              </button>
            </div>
            <img src={capturedImage} alt="Captured preview" className="captured-image-preview" />
          </div>
        )}

        {/* Error notification */}
        {cameraError && <div className="error-banner">ℹ️ {cameraError}</div>}

        {/* 1. Native mobile camera input */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={nativeCameraInputRef}
          onChange={handleFileUpload}
          className="hidden-input"
        />

        {/* 2. Gallery picker input */}
        <input
          type="file"
          accept="image/*"
          ref={galleryInputRef}
          onChange={handleFileUpload}
          className="hidden-input"
        />
      </div>

      {/* Buttons */}
      <div className="btn-group">
        {capturedImage ? (
          <>
            <button className="btn btn-primary" onClick={handleUsePhoto}>
              USE THIS PHOTO ➔
            </button>
            <button className="btn btn-secondary" onClick={handleRetake}>
              RETAKE
            </button>
          </>
        ) : streamActive ? (
          <>
            <button className="btn btn-primary" onClick={takePhotoFromCamera}>
              📸 SNAP PHOTO
            </button>
            <button className="btn btn-secondary" onClick={stopCamera}>
              CLOSE LIVE CAMERA
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-primary"
              onClick={() => nativeCameraInputRef.current?.click()}
            >
              📸 TAKE WITH PHONE CAMERA
            </button>

            <button className="btn btn-secondary" onClick={() => startCamera('environment')}>
              📹 OPEN LIVE IN-BROWSER CAMERA
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => galleryInputRef.current?.click()}
            >
              📁 UPLOAD FROM GALLERY
            </button>

            {/* Quick Test Demo Photo */}
            <button
              className="chip-btn active"
              style={{ justifyContent: 'center', padding: '10px 14px', fontSize: '0.9rem' }}
              onClick={() => {
                const img = new Image();
                img.src = '/sample_balarama.jpg';
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  // The sample photo was taken sideways (1152x2048), so we rotate it 90 deg clockwise to make it perfectly upright!
                  canvas.width = img.height;
                  canvas.height = img.width;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    ctx.rotate((90 * Math.PI) / 180);
                    ctx.drawImage(img, -img.width / 2, -img.height / 2);
                    setCapturedImage(canvas.toDataURL('image/jpeg', 0.92));
                  }
                };
              }}
            >
              ⚡ TRY DEMO PHOTO (Phone + Balarama)
            </button>

            <button className="btn btn-secondary" style={{ opacity: 0.7 }} onClick={onBack}>
              BACK
            </button>
          </>
        )}
      </div>
    </div>
  );
};
