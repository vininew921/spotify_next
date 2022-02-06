import {
    HomeIcon,
    SearchIcon,
    PlusCircleIcon,
    HeartIcon,
    RssIcon,
    BookOpenIcon,
    LogoutIcon,
} from '@heroicons/react/outline';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { selectedPlaylistState } from '../atoms/playlistAtom';
import useSpotify from '../hooks/useSpotify';

const Sidebar = () => {
    const { data: session, status } = useSession();
    const spotifyAPI = useSpotify();
    const [playlists, setPlaylists] = useState<
        SpotifyApi.PlaylistObjectSimplified[]
    >([]);
    const [selectedPlaylist, setSelectedPlaylist] = useRecoilState(
        selectedPlaylistState
    );

    useEffect(() => {
        if (spotifyAPI.getAccessToken()) {
            spotifyAPI.getUserPlaylists({ limit: 50 }).then((data) => {
                setPlaylists(data.body.items);
            });
        }
    }, [session, spotifyAPI]);

    useEffect(() => {
        if (!selectedPlaylist && playlists.length > 0) {
            setSelectedPlaylist(playlists.at(0)!.id);
        }
    }, [playlists]);

    return (
        <div
            className='hidden h-screen flex-col
            overflow-y-scroll border-r border-gray-900 p-5 pb-28
            text-xs text-gray-500 scrollbar-hide sm:max-w-[12rem] 
            md:inline-flex md:text-sm lg:max-w-[15rem]'
        >
            <div className='space-y-4'>
                <button className='flex items-center space-x-2 hover:text-white'>
                    <HomeIcon className='h-5 w-5' />
                    <p>Home</p>
                </button>
                <button className='flex items-center space-x-2 hover:text-white'>
                    <SearchIcon className='h-5 w-5' />
                    <p>Search</p>
                </button>
                <button className='flex items-center space-x-2 hover:text-white'>
                    <BookOpenIcon className='h-5 w-5' />
                    <p>Your Library</p>
                </button>
                <hr className='border-t-[0.1px] border-gray-900' />
                <button className='flex items-center space-x-2 hover:text-white'>
                    <PlusCircleIcon className='h-5 w-5' />
                    <p>Create Playlist</p>
                </button>
                <button className='flex items-center space-x-2 hover:text-white'>
                    <HeartIcon className='h-5 w-5' />
                    <p>Liked Songs</p>
                </button>
                <button className='flex items-center space-x-2 hover:text-white'>
                    <RssIcon className='h-5 w-5' />
                    <p>Your Episodes</p>
                </button>
                <hr className='border-t-[0.1px] border-gray-900' />

                {playlists.map((playlist) => (
                    <p
                        key={playlist.id}
                        className='cursor-pointer hover:text-white'
                        onClick={() => setSelectedPlaylist(playlist.id)}
                    >
                        {playlist.name}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
