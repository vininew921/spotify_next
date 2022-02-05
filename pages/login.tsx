import { GetServerSideProps } from 'next';
import { BuiltInProviderType } from 'next-auth/providers';
import {
    ClientSafeProvider,
    getProviders,
    LiteralUnion,
    signIn,
} from 'next-auth/react';

const Login = ({
    providers,
}: {
    providers: Record<
        LiteralUnion<BuiltInProviderType, string>,
        ClientSafeProvider
    >;
}) => {
    return (
        <div className='flex min-h-screen w-full flex-col items-center justify-center bg-black'>
            <img className='mb-5 w-52' src='https://links.papareact.com/9xl' />
            {Object.values(providers).map((provider) => (
                <div key={provider.name}>
                    <button
                        className='rounded-full bg-[#18D860] p-5 text-white'
                        onClick={() =>
                            signIn(provider.id, { callbackUrl: '/' })
                        }
                    >
                        Login with {provider.name}
                    </button>
                </div>
            ))}
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async () => {
    const providers = await getProviders();

    return {
        props: {
            providers,
        },
    };
};

export default Login;
