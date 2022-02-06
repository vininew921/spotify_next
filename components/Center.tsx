import { ChevronDownIcon } from '@heroicons/react/outline';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { shuffle } from 'lodash';
import { useRecoilState, useRecoilValue } from 'recoil';
import { playlistState, selectedPlaylistState } from '../atoms/playlistAtom';
import useSpotify from '../hooks/useSpotify';
import Image from 'next/image';
import Songs from './Songs';

const colors: string[] = [
    'from-indigo-500',
    'from-blue-500',
    'from-green-500',
    'from-red-500',
    'from-yellow-500',
    'from-pink-500',
    'from-purple-500',
];

const Center = () => {
    const spotifyApi = useSpotify();
    const { data: session } = useSession();
    const [color, setColor] = useState<string>();
    const [playlist, setPlaylist] = useRecoilState(playlistState);
    const [playlistOwner, setPlaylistOwner] =
        useState<SpotifyApi.UserProfileResponse | null>(null);
    const selectedPlaylist = useRecoilValue(selectedPlaylistState);

    useEffect(() => {
        setColor(shuffle(colors).pop());
    }, [selectedPlaylist]);

    useEffect(() => {
        const updatePlaylistOwner = async () => {
            if (playlist?.owner.id) {
            }
        };

        if (selectedPlaylist) {
            spotifyApi
                .getPlaylist(selectedPlaylist)
                .then((data) => {
                    setPlaylist(data.body);
                    spotifyApi.getUser(data.body.owner.id).then((userData) => {
                        setPlaylistOwner(userData.body);
                    });
                })
                .catch((err) => console.log('Error fetching playlist: ', err));
        }

        updatePlaylistOwner();
    }, [spotifyApi, selectedPlaylist]);

    return (
        <div className='h-screen flex-grow overflow-y-scroll scrollbar-hide'>
            <header className='absolute top-5 right-8'>
                <div
                    className='flex cursor-pointer items-center 
                    space-x-3 rounded-full bg-black p-1 
                    pr-2 opacity-90 hover:opacity-80'
                    onClick={() => signOut()}
                >
                    <img
                        className='h-10 w-10 rounded-full object-cover'
                        src={session?.user.image}
                    />
                    <h2 className='text-white'>{session?.user.name}</h2>
                    <ChevronDownIcon className='h-5 w-5 text-white' />
                </div>
            </header>

            <section
                className={`flex h-80 items-end space-x-7 bg-gradient-to-b 
                p-8 ${color} to-black text-white`}
            >
                <img
                    className='h-44 w-44 object-cover shadow-2xl'
                    src={playlist?.images?.[0].url}
                />
                <div>
                    <p>PLAYLIST</p>
                    <h1 className='text 2xl pb-3 font-bold md:text-3xl xl:text-5xl'>
                        {playlist?.name}
                    </h1>
                    <p className='hidden md:inline'>
                        {playlist?.description?.replace(/<[^>]+>/gi, '')}
                    </p>

                    <div className='hidden items-center pt-3 lg:flex'>
                        <img
                            className='h-8 w-8 rounded-full object-cover'
                            src={playlistOwner?.images?.[0]?.url}
                        />
                        <p className='pl-3 font-bold'>
                            {playlistOwner?.display_name}
                        </p>
                        {playlist?.followers.total &&
                        playlist.followers.total > 0 ? (
                            <p className='pl-1 text-gray-400'>
                                ● {playlist?.followers.total.toLocaleString()}{' '}
                                likes
                            </p>
                        ) : (
                            <></>
                        )}

                        <p className='pl-1 text-gray-400'>
                            ● {playlist?.tracks.total.toLocaleString()} songs{' '}
                        </p>
                    </div>
                </div>
            </section>

            <div>
                <Songs />
            </div>
        </div>
    );
};

export default Center;
