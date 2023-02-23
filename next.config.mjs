/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,

  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/stepful',
        permanent: false,
      },
    ];
  },
};

export default config;
