import React, { useState } from 'react';
import { AppStep, Point, MeasurementResult } from './types/measurement';
import { Home } from './components/Home';
import { ReferenceInput } from './components/ReferenceInput';
import { CameraCapture } from './components/CameraCapture';
import { PointSelector } from './components/PointSelector';
import { Result } from './components/Result';
import { MeasurementEngine } from './measurement/MeasurementEngine';

export const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('home');

  // State
  const [referenceName, setReferenceName] = useState<string>('Smartphone (iPhone / Android)');
  const [referenceHeightMeters, setReferenceHeightMeters] = useState<number>(0.15); // 15 cm phone default
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  const [refBottom, setRefBottom] = useState<Point | null>(null);
  const [refTop, setRefTop] = useState<Point | null>(null);

  const [measurementResult, setMeasurementResult] = useState<MeasurementResult | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const startFlow = () => {
    setGlobalError(null);
    setStep('reference-input');
  };

  const handleReferenceHeightSubmitted = (heightMeters: number, name: string) => {
    setReferenceHeightMeters(heightMeters);
    setReferenceName(name);
    setStep('camera-capture');
  };

  const handleImageCaptured = (dataUrl: string) => {
    setImageDataUrl(dataUrl);
    setRefBottom(null);
    setRefTop(null);
    setStep('mark-reference');
  };

  const handleImageRotated = (newRotatedDataUrl: string) => {
    setImageDataUrl(newRotatedDataUrl);
    setRefBottom(null);
    setRefTop(null);
  };

  const handleReferencePointsSelected = (bottom: Point, top: Point) => {
    setRefBottom(bottom);
    setRefTop(top);
    setStep('mark-object');
  };

  const handleObjectPointsSelected = (objBottom: Point, objTop: Point) => {
    if (!refBottom || !refTop) {
      setGlobalError('Reference points were lost. Please mark reference again.');
      setStep('mark-reference');
      return;
    }

    try {
      const result = MeasurementEngine.calculate(
        refBottom,
        refTop,
        objBottom,
        objTop,
        referenceHeightMeters,
        referenceName
      );
      setMeasurementResult(result);
      setStep('result');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error calculating height.';
      setGlobalError(msg);
    }
  };

  const handleMeasureAgain = () => {
    setRefBottom(null);
    setRefTop(null);
    setMeasurementResult(null);
    setGlobalError(null);
    setStep('camera-capture');
  };

  const handleChangeReference = () => {
    setRefBottom(null);
    setRefTop(null);
    setMeasurementResult(null);
    setImageDataUrl(null);
    setGlobalError(null);
    setStep('reference-input');
  };

  return (
    <div className="app-container">
      {globalError && (
        <div className="error-banner" style={{ margin: '0 0 1rem 0' }}>
          ⚠️ {globalError}
        </div>
      )}

      {step === 'home' && <Home onStart={startFlow} />}

      {step === 'reference-input' && (
        <ReferenceInput
          initialHeightCm={Math.round(referenceHeightMeters * 100)}
          initialReferenceName={referenceName}
          onContinue={handleReferenceHeightSubmitted}
          onBack={() => setStep('home')}
        />
      )}

      {step === 'camera-capture' && (
        <CameraCapture
          onImageSelected={handleImageCaptured}
          onBack={() => setStep('reference-input')}
        />
      )}

      {step === 'mark-reference' && imageDataUrl && (
        <PointSelector
          mode="reference"
          referenceName={referenceName}
          imageDataUrl={imageDataUrl}
          onRotateImage={handleImageRotated}
          onPointsSelected={handleReferencePointsSelected}
          onBack={() => setStep('camera-capture')}
        />
      )}

      {step === 'mark-object' && imageDataUrl && (
        <PointSelector
          mode="object"
          referenceName={referenceName}
          imageDataUrl={imageDataUrl}
          existingReferencePoints={refBottom && refTop ? { bottom: refBottom, top: refTop } : null}
          onPointsSelected={handleObjectPointsSelected}
          onBack={() => setStep('mark-reference')}
        />
      )}

      {step === 'result' && measurementResult && (
        <Result
          result={measurementResult}
          imageDataUrl={imageDataUrl}
          onMeasureAgain={handleMeasureAgain}
          onChangeReference={handleChangeReference}
        />
      )}
    </div>
  );
};

export default App;
