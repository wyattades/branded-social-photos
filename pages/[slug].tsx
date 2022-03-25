import type {
  GetServerSidePropsContext,
  GetStaticPaths,
  GetStaticProps,
  GetStaticPropsContext,
  InferGetServerSidePropsType,
  InferGetStaticPropsType,
  NextPage,
} from 'next';
import * as _ from 'lodash-es';
import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import {
  FacebookShareButton,
  LinkedinShareButton,
  FacebookIcon,
  LinkedinIcon,
} from 'react-share';

import { cloudinary } from 'lib/images';
import Head from 'next/head';

export const getStaticPaths: GetStaticPaths = async (ctx) => {
  const res = await cloudinary.v2.api.resources({
    prefix: 'overlays/',
    type: 'upload',
    resource_type: 'image',
  });

  return {
    paths: res.resources.map((r: any) => ({
      params: {
        slug: r.public_id.replace('overlays/', ''),
      },
    })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const slug = ctx.params!.slug as string;

  let overlay_url;
  try {
    const res = await cloudinary.v2.api.resource(`overlays/${slug}`);

    overlay_url =
      process.env.NODE_ENV === 'development' ? res.url : res.secure_url;
  } catch (err) {
    console.error(err);
    return {
      notFound: true,
    };
  }

  return {
    props: {
      brand: {
        overlay_url,
        slug,
        title: _.startCase(slug),
      },
    },
  };
};

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

const InstagramIcon: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="4 4 40 40" {...props}>
      <radialGradient
        id="yOrnnhliCrdS2gy~4tD8ma"
        cx="19.38"
        cy="42.035"
        r="44.899"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#fd5" />
        <stop offset=".328" stopColor="#ff543f" />
        <stop offset=".348" stopColor="#fc5245" />
        <stop offset=".504" stopColor="#e64771" />
        <stop offset=".643" stopColor="#d53e91" />
        <stop offset=".761" stopColor="#cc39a4" />
        <stop offset=".841" stopColor="#c837ab" />
      </radialGradient>
      <path
        fill="url(#yOrnnhliCrdS2gy~4tD8ma)"
        d="M34.017,41.99l-20,0.019c-4.4,0.004-8.003-3.592-8.008-7.992l-0.019-20 c-0.004-4.4,3.592-8.003,7.992-8.008l20-0.019c4.4-0.004,8.003,3.592,8.008,7.992l0.019,20 C42.014,38.383,38.417,41.986,34.017,41.99z"
      />
      <radialGradient
        id="yOrnnhliCrdS2gy~4tD8mb"
        cx="11.786"
        cy="5.54"
        r="29.813"
        gradientTransform="matrix(1 0 0 .6663 0 1.849)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#4168c9" />
        <stop offset=".999" stopColor="#4168c9" stopOpacity="0" />
      </radialGradient>
      <path
        fill="url(#yOrnnhliCrdS2gy~4tD8mb)"
        d="M34.017,41.99l-20,0.019c-4.4,0.004-8.003-3.592-8.008-7.992l-0.019-20 c-0.004-4.4,3.592-8.003,7.992-8.008l20-0.019c4.4-0.004,8.003,3.592,8.008,7.992l0.019,20 C42.014,38.383,38.417,41.986,34.017,41.99z"
      />
      <path
        fill="#fff"
        d="M24,31c-3.859,0-7-3.14-7-7s3.141-7,7-7s7,3.14,7,7S27.859,31,24,31z M24,19c-2.757,0-5,2.243-5,5 s2.243,5,5,5s5-2.243,5-5S26.757,19,24,19z"
      />
      <circle cx="31.5" cy="16.5" r="1.5" fill="#fff" />
      <path
        fill="#fff"
        d="M30,37H18c-3.859,0-7-3.14-7-7V18c0-3.86,3.141-7,7-7h12c3.859,0,7,3.14,7,7v12 C37,33.86,33.859,37,30,37z M18,13c-2.757,0-5,2.243-5,5v12c0,2.757,2.243,5,5,5h12c2.757,0,5-2.243,5-5V18c0-2.757-2.243-5-5-5H18z"
      />
    </svg>
  );
};

const upload = async (dataUrl: string) => {
  const r = await fetch('/api/upload', {
    method: 'POST',
    body: JSON.stringify({
      data_url: dataUrl,
    }),
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
  });
  if (r.ok) {
    const { url } = await r.json();
    return url;
  }
  return null;
};

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  brand: { title: brandTitle, overlay_url: overlayUrl },
}) => {
  const webcamRef = useRef<Webcam>(null);

  const [screenshot, setScreenshot] = useState<string | null>(null);

  const size = 512;

  const [photoUrl, setPhotoUrl] = useState(null);

  return (
    <div className="flex min-h-screen flex-col items-stretch">
      <Head>
        <title>Share to {brandTitle}</title>
      </Head>

      <main className="flex-1">
        <div
          className="mx-auto w-full px-20 py-32"
          style={{ maxWidth: '100rem' }}
        >
          <h1 className="mb-8 text-center text-5xl font-bold">
            Share to {brandTitle}
          </h1>

          <br />

          <div className="flex flex-col items-center justify-center">
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

                    upload(dataUrl).then((url) => {
                      if (url) {
                        // setScreenshot(url);
                        setPhotoUrl(url);
                      }
                    });
                  }}
                >
                  Capture!
                </button>
              )}
            </div>
            {photoUrl && (
              <>
                <p className="my-4 text-gray-600">{photoUrl}</p>
                <br />
                <div className="flex items-center justify-center space-x-4">
                  <button
                    className="rounded-md bg-gray-200 px-4 py-2 font-bold hover:bg-gray-300 active:bg-gray-400"
                    onClick={() => {
                      navigator.clipboard.writeText(photoUrl);
                    }}
                  >
                    Copy Link
                  </button>
                  <button
                    className="rounded-full"
                    style={{
                      width: 38,
                      height: 38,
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(photoUrl);

                      window.open('https://instagram.com', '_blank');
                    }}
                    aria-label="Open Instagram"
                  >
                    <InstagramIcon />
                  </button>
                  <FacebookShareButton url={photoUrl}>
                    <FacebookIcon
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 99,
                      }}
                    />
                  </FacebookShareButton>
                  <LinkedinShareButton url={photoUrl}>
                    <LinkedinIcon
                      className="icon"
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 99,
                      }}
                    />
                  </LinkedinShareButton>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t">
        <a
          className="flex items-center justify-center gap-2"
          href="#"
          rel="noopener noreferrer"
        >
          Powered by ♥
        </a>
      </footer>
    </div>
  );
};

export default Home;
