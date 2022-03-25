import type { NextApiRequest, NextApiResponse } from 'next';

import { cloudinary } from 'lib/images';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { data_url } = req.body;

    const { secure_url } = await cloudinary.v2.uploader.upload(data_url, {
      folder: 'uploads',
    });

    res.status(200).json({ url: secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({});
  }
}
