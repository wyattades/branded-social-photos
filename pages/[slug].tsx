import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next';
import * as _ from 'lodash-es';
import React, { useState } from 'react';
import {
  FacebookShareButton,
  LinkedinShareButton,
  FacebookIcon,
  LinkedinIcon,
} from 'react-share';
import Head from 'next/head';

import { cloudinary } from 'lib/images';
import { BrandedWebcam } from 'components/BrandedWebcam';
import { InstagramIcon } from 'components/InstagramIcon';

export const getStaticPaths: GetStaticPaths = async (_ctx) => {
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

  let res;
  try {
    res = await cloudinary.v2.api.resource(`overlays/${slug}`);
  } catch (err) {
    console.error(err);
    return {
      notFound: true,
    };
  }

  return {
    props: {
      brand: {
        overlay_url: res.secure_url,
        slug,
        title: _.startCase(slug),
        link: res.context?.custom?.brand_link || null,
      },
    },
  };
};

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  brand: { title: brandTitle, overlay_url: overlayUrl, link: brandLink },
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

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
            Share with {brandTitle} ♥
          </h1>

          <br />

          <div className="flex flex-col items-center justify-center">
            <BrandedWebcam overlayUrl={overlayUrl} setPhotoUrl={setPhotoUrl} />
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
        <a href={brandLink} target="_blank" rel="noopener noreferrer">
          Powered by <strong>{brandTitle}</strong>
        </a>
      </footer>
    </div>
  );
};

export default Home;
