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

  const size = 512;

  return (
    <>
      <div
        className="relative inline-flex bg-gray-200"
        style={{ width: size, height: size }}
      >
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
            className="rounded-md bg-red-500 px-4 py-2 text-white"
            onClick={() => {
              setScreenshot(null);
            }}
          >
            Take another photo
          </button>
        ) : (
          <button
            type="button"
            className="rounded-md bg-red-500 px-4 py-2 text-white"
            onClick={async () => {
              const sourceCanvas = webcamRef.current!.getCanvas({
                width: webcamRef.current!.video!.videoWidth,
                height: webcamRef.current!.video!.videoHeight,
              })!;

              const destCanvas = fitTo(sourceCanvas, 512, 512);

              const img = new Image(512, 512);
              img.crossOrigin = 'anonymous';
              await new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.src = overlayUrl;
              });
              destCanvas.getContext('2d')!.drawImage(img, 0, 0);

              console.log(destCanvas);

              const dataUrl = destCanvas.toDataURL('image/jpeg', 0.92);

              setScreenshot(dataUrl);

              onCapture(dataUrl);
            }}
          >
            Capture!
          </button>
        )}
      </div>
    </>
  );
};
