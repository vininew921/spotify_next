import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { playlistState } from '../atoms/playlistAtom';
import { currentTrackIdState, isPlayingState } from '../atoms/songAtom';
import useSpotify from '../hooks/useSpotify';
import { utcToBeautifiedDate } from '../lib/date';
import { millisToMinutesAndSeconds } from '../lib/time';

type SongProps = {
    order: number;
    track: SpotifyApi.TrackObjectFull;
};

const Song = ({ track, order }: SongProps) => {
    const spotifyApi = useSpotify();
    const [currentTrackId, setCurrentTrackId] =
        useRecoilState(currentTrackIdState);
    const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
    const playlist = useRecoilState(playlistState);
    const [addedAt, setAddedAt] = useState<string | undefined>(undefined);

    const playSong = async () => {
        setCurrentTrackId(track.id);
        setIsPlaying(true);

        spotifyApi.play({
            context_uri: playlist?.[0]?.uri!,
            offset: { position: order },
        });
    };

    const localTrack = track.uri.includes('local');

    let masterDivStyle = localTrack
        ? 'grid cursor-pointer grid-cols-2 rounded-lg py-4 px-5 text-gray-500 hover:bg-gray-900 opacity-30'
        : 'grid cursor-pointer grid-cols-2 rounded-lg py-4 px-5 text-gray-500 hover:bg-gray-900';

    return (
        <div
            className={masterDivStyle}
            onClick={() => (localTrack ? {} : playSong())}
        >
            <div className='flex items-center space-x-4'>
                <p className='flex w-5 items-center justify-end'>{order + 1}</p>
                <img
                    className='h-10 w-10 object-cover'
                    src={track.album.images[0]?.url ?? ''}
                />
                <div>
                    <p className='w-36 truncate text-white lg:w-64'>
                        {track.name}
                    </p>
                    <p className='w-40 truncate lg:w-64'>
                        {track.artists[0].name}
                    </p>
                </div>
            </div>

            <div className='ml-auto flex items-center justify-between md:ml-0'>
                <p className='hidden w-40 truncate md:inline'>
                    {track.album.name}
                </p>
                <p className='hidden lg:inline'>
                    {utcToBeautifiedDate(
                        playlist[0]?.tracks.items.find(
                            (t) => t.track.id == track.id
                        )?.added_at
                    )}
                </p>
                <p>{millisToMinutesAndSeconds(track.duration_ms)}</p>
            </div>
        </div>
    );
};

export default Song;
