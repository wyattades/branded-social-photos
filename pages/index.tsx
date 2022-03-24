import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';

export const getServerSideProps = async (_ctx: GetServerSidePropsContext) => {
  const backendData = { serverTime: new Date().toString() };

  return {
    props: {
      backendData,
    },
  };
};

const Home: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ backendData }) => {
  return (
    <div className="flex min-h-screen flex-col items-stretch">
      <main className="flex-1">
        <div
          className="mx-auto w-full px-20 py-32"
          style={{ maxWidth: '100rem' }}
        >
          <h1 className="mb-8 text-center text-6xl font-bold">Hello World!</h1>

          <pre className="bg-gray-200 p-4">
            {JSON.stringify(backendData, null, 2)}
          </pre>
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
