import { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const fitTo = (sourceCanvas: HTMLCanvasElement, w: number, h: number) => {
  const destCanvas = document.createElement('canvas');
  destCanvas.width = w;
  destCanvas.height = h;

  const ctx = destCanvas.getContext('2d')!;

  const scale = Math.max(
    destCanvas.width / sourceCanvas.width,
    destCanvas.height / sourceCanvas.height,
  );

  ctx.setTransform(
    scale,
    0,
    0,
    scale,
    destCanvas.width / 2,
    destCanvas.height / 2,
  );

  ctx.drawImage(
    sourceCanvas,
    -sourceCanvas.width / 2,
    -sourceCanvas.height / 2,
    sourceCanvas.width,
    sourceCanvas.height,
  );

  ctx.setTransform(1, 0, 0, 1, 0, 0);

  return destCanvas;
};

export const BrandedWebcam: React.FC<{
  overlayUrl: string;
  onCapture: (dataUrl: string) => void;
}> = ({ overlayUrl, onCapture }) => {
  const webcamRef = useRef<Webcam>(null);

  const [screenshot, setScreenshot] = useState<string | null>(null);

  const previewSize = { width: 512, height: 512 };
  const resultSize = { width: 512, height: 512 };

  const capture = async () => {
    const sourceCanvas = webcamRef.current!.getCanvas({
      width: webcamRef.current!.video!.videoWidth,
      height: webcamRef.current!.video!.videoHeight,
    })!;

    const destCanvas = fitTo(sourceCanvas, resultSize.width, resultSize.height);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = overlayUrl;
    });

    const ctx = destCanvas.getContext('2d')!;
    if (img.width !== resultSize.width || img.height !== resultSize.height) {
      ctx.scale(resultSize.width / img.width, resultSize.height / img.height);
    }
    ctx.drawImage(img, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const dataUrl = destCanvas.toDataURL('image/jpeg', 0.92);

    setScreenshot(dataUrl);

    onCapture(dataUrl);
  };

  return (
    <>
      <div className="relative inline-flex bg-gray-200" style={previewSize}>
        {screenshot ? (
          <img src={screenshot} style={{ objectFit: 'cover' }} />
        ) : (
          <>
            <Webcam
              mirrored
              width={720}
              height={720}
              // width={256}
              // height={256}
              screenshotFormat="image/png"
              style={{ objectFit: 'cover' }}
              videoConstraints={{
                width: 720,
                height: 720,
                facingMode: 'user',
              }}
              ref={webcamRef}
            />
            <img
              src={overlayUrl}
              className="absolute top-0 left-0 h-full w-full"
            />
          </>
        )}
      </div>
      <hr className="my-8 w-full" />
      <div className="SocialButtons space-x-4">
        {screenshot ? (
          <button
            type="button"
            className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
            onClick={() => {
              setScreenshot(null);
            }}
          >
            Take another photo
          </button>
        ) : (
          <button
            type="button"
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            onClick={capture}
          >
            Capture!
          </button>
        )}
      </div>
    </>
  );
};
