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
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window && window.innerWidth < 768)
    );
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Detect mobile vs laptop on mount and window resize
  useEffect(() => {
    const checkDevice = () => {
      const isMob =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window && window.innerWidth < 768);
      setIsMobileDevice(isMob);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Check available video devices
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          if (videoInputs.length > 1) {
            setHasMultipleCameras(true);
          }
        })
        .catch((e) => console.warn('enumerateDevices error:', e));
    }
  }, []);

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

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Live camera stream is not supported on this browser or requires HTTPS. Use the Upload / Camera option below!'
        );
      }

      let stream: MediaStream | null = null;

      if (!isMobileDevice) {
        // Laptop / Desktop webcam: Widescreen ideal resolution with fallback to video: true
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch (eDesk1) {
          console.warn('Laptop resolution attempt failed, trying video: true:', eDesk1);
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      } else {
        // Mobile device: try rear environment camera first
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: mode },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });
        } catch (e1) {
          console.warn('Mobile attempt 1 with resolution failed, trying basic facingMode:', e1);
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: mode },
              audio: false,
            });
          } catch (e2) {
            console.warn('Mobile attempt 2 failed, falling back to basic video: true:', e2);
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
          }
        }
      }

      if (!stream) {
        throw new Error('Could not open video stream.');
      }

      streamRef.current = stream;
      setFacingMode(mode);
      setStreamActive(true);
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Camera access denied or unavailable. You can use the upload or phone camera button!';
      setCameraError(message);
      setStreamActive(false);
    }
  };

  // Safe binding to the video element
  useEffect(() => {
    if (streamActive && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.muted = true;
      video.play().catch((playErr) => {
        console.warn('Video play error:', playErr);
      });
    }
  }, [streamActive]);

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
          <div
            className="tinker-pill"
            style={{
              background: isMobileDevice ? 'var(--tinker-cyan)' : 'var(--tinker-yellow)',
            }}
          >
            {isMobileDevice ? '📱 PHONE DETECTED • STEP 02 OF 04' : '💻 LAPTOP / BROWSER • STEP 02 OF 04'}
          </div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 900, textTransform: 'uppercase' }}>
            Capture / Upload
          </h2>
          <p className="hand-note">"keep the reference & object beside each other!"</p>
        </div>

        {/* Error notification */}
        {cameraError && <div className="error-banner">ℹ️ {cameraError}</div>}

        {/* Hidden inputs for native mobile camera & file upload */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={nativeCameraInputRef}
          onChange={handleFileUpload}
          className="hidden-input"
        />
        <input
          type="file"
          accept="image/*"
          ref={galleryInputRef}
          onChange={handleFileUpload}
          className="hidden-input"
        />

        {/* Guidelines & Ready State */}
        {!capturedImage && !streamActive && (
          <div className="responsive-two-col" style={{ marginBottom: '1.25rem' }}>
            <div className="guidelines-box" style={{ margin: 0, height: '100%' }}>
              <div className="guidelines-title">
                <span>🎯</span> Measurement Protocol:
              </div>
              <ul className="guidelines-list">
                <li>Place reference (phone / bottle / person) right beside object</li>
                <li>Keep both standing on approximately the same level ground</li>
                <li>Make sure entire reference and object are visible</li>
                <li>If photo appears sideways, tap <strong>Rotate 90°</strong> anytime!</li>
              </ul>
              <div
                style={{
                  marginTop: '0.85rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px dashed #bbb',
                  fontSize: '0.8rem',
                  color: '#444',
                }}
              >
                {isMobileDevice ? (
                  <span>✨ <strong>Phone tip:</strong> Tap the big camera button to open your phone's native camera with full resolution!</span>
                ) : (
                  <span>✨ <strong>Laptop tip:</strong> Click "Open Laptop Webcam" for live stream, or upload a photo from your files!</span>
                )}
              </div>
            </div>

            <div className="brutal-card brutal-card-yellow" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="stamp-badge">READY TO MEASURE</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {isMobileDevice ? 'Mobile Camera Setup' : 'Laptop Camera / File Setup'}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#333', lineHeight: '1.4' }}>
                {isMobileDevice
                  ? 'Works universally on Android & iOS. Direct hardware capture with autofocus and zero latency.'
                  : 'Use your laptop front webcam with 16:9 widescreen or choose an existing photo from your storage.'}
              </p>
            </div>
          </div>
        )}

        {/* Live Video Preview (Adaptive for phone portrait and laptop 16:9 webcam) */}
        {streamActive && !capturedImage && (
          <div className="camera-video-wrapper">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="camera-video"
            />
            {hasMultipleCameras && isMobileDevice && (
              <button
                type="button"
                onClick={toggleFacingMode}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  border: '2px solid #fff',
                  borderRadius: '50%',
                  width: '46px',
                  height: '46px',
                  fontSize: '1.3rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '2px 2px 0px #000',
                }}
                title="Switch Camera (Front / Rear)"
              >
                🔄
              </button>
            )}
          </div>
        )}

        {/* Captured Photo Preview with Rotate Button */}
        {capturedImage && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.65rem',
              }}
            >
              <span style={{ fontSize: '0.95rem', fontWeight: 900, textTransform: 'uppercase' }}>
                📸 Photo Ready:
              </span>
              <button
                type="button"
                className="chip-btn active"
                onClick={handleRotateImage}
                style={{ padding: '6px 14px', fontSize: '0.84rem' }}
              >
                🔄 Rotate 90° Upright
              </button>
            </div>
            <img src={capturedImage} alt="Captured preview" className="captured-image-preview" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
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
              📸 SNAP PHOTO NOW
            </button>
            <button className="btn btn-secondary" onClick={stopCamera}>
              CLOSE CAMERA
            </button>
          </>
        ) : (
          <>
            {isMobileDevice ? (
              // MOBILE BUTTONS
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => nativeCameraInputRef.current?.click()}
                >
                  📸 TAKE PHOTO WITH PHONE CAMERA
                </button>
                <div className="btn-row">
                  <button
                    className="btn btn-secondary"
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    📁 CHOOSE PHOTO
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => startCamera('environment')}
                  >
                    📹 LIVE STREAM
                  </button>
                </div>
              </>
            ) : (
              // LAPTOP / DESKTOP BUTTONS
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => startCamera('user')}
                >
                  📸 OPEN LAPTOP WEBCAM
                </button>
                <div className="btn-row">
                  <button
                    className="btn btn-secondary"
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    📁 UPLOAD PHOTO FILE
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    title="Camera capture dialog"
                  >
                    📷 SYSTEM CAMERA
                  </button>
                </div>
              </>
            )}

            {/* Quick Demo test buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '6px 0' }}>
              <button
                type="button"
                className="chip-btn active"
                style={{ justifyContent: 'center', padding: '9px 12px', fontSize: '0.88rem' }}
                onClick={() => {
                  const img = new Image();
                  img.src = '/sample_balarama.jpg';
                  img.onload = () => {
                    const canvas = document.createElement('canvas');
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
                ⚡ QUICK DEMO 1: Smartphone + Balarama Book
              </button>

              <button
                type="button"
                className="chip-btn"
                style={{
                  justifyContent: 'center',
                  padding: '9px 12px',
                  fontSize: '0.88rem',
                  background: '#ffffff',
                }}
                onClick={() => {
                  setCapturedImage('/sample_tower.jpg');
                }}
              >
                🗼 QUICK DEMO 2: Telecom Tower + Standing Adult
              </button>
            </div>

            <button className="btn btn-secondary" style={{ opacity: 0.7 }} onClick={onBack}>
              BACK
            </button>
          </>
        )}
      </div>
    </div>
  );
};
