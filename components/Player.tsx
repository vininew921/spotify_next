import {
    HeartIcon,
    VolumeUpIcon as VolumeDownIcon,
} from '@heroicons/react/outline';
import {
    RewindIcon,
    FastForwardIcon,
    PauseIcon,
    PlayIcon,
    ReplyIcon,
    VolumeUpIcon,
    SwitchHorizontalIcon,
    VolumeOffIcon,
} from '@heroicons/react/solid';
import { debounce } from 'lodash';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { currentTrackIdState, isPlayingState } from '../atoms/songAtom';
import useSongInfo from '../hooks/useSongInfo';
import useSpotify from '../hooks/useSpotify';

const Player = () => {
    const spotifyApi = useSpotify();
    const { data: session, status } = useSession();
    const [currentTrackId, setCurrentTrackId] =
        useRecoilState(currentTrackIdState);
    const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
    const [volume, setVolume] = useState(50);
    const songInfo = useSongInfo();

    const fetchCurrentSong = (
        ignoreSongInfo = false,
        updateIsPlaying = true
    ) => {
        if (!songInfo || ignoreSongInfo) {
            spotifyApi.getMyCurrentPlayingTrack().then((data) => {
                setCurrentTrackId(data.body?.item?.id);

                spotifyApi.getMyCurrentPlaybackState().then((data) => {
                    if (updateIsPlaying) setIsPlaying(data.body?.is_playing);
                    if (data.body?.device?.volume_percent) {
                        setVolume(data.body?.device?.volume_percent);
                    }
                });
            });
        }
    };

    const handlePlayPause = () => {
        fetchCurrentSong(true, false);
        spotifyApi.getMyCurrentPlaybackState().then((data) => {
            if (data.body.is_playing) {
                spotifyApi.pause();
                setIsPlaying(false);
            } else {
                spotifyApi.play();
                setIsPlaying(true);
            }
        });
    };

    const debouncedAdjustVolume = useCallback(
        debounce((volume: number) => {
            spotifyApi.setVolume(volume).catch((err) => {});
        }, 100),
        []
    );

    useEffect(() => {
        const syncState = () => {
            fetchCurrentSong(true);
            setTimeout(() => {
                syncState();
            }, 3000);
        };

        syncState();
    }, []);

    useEffect(() => {
        if (spotifyApi.getAccessToken() && !currentTrackId) {
            fetchCurrentSong();
        }
    }, [currentTrackId, spotifyApi, session]);

    useEffect(() => {
        if (volume >= 0 && volume <= 100) {
            debouncedAdjustVolume(volume);
        }
    }, [volume]);

    return (
        <div
            className='grid h-24 grid-cols-3 
        bg-gradient-to-b from-black to-gray-900 px-2 
        text-xs text-white md:px-8 md:text-base'
        >
            {/* Left */}
            <div className='flex items-center space-x-4'>
                <img
                    className='hidden h-10 w-10 md:inline'
                    src={songInfo?.album.images?.[0]?.url}
                    alt=''
                />
                <div>
                    <h3>{songInfo?.name}</h3>
                    <p>{songInfo?.artists?.[0].name}</p>
                </div>
            </div>

            {/* Center */}
            <div className='flex items-center justify-evenly'>
                <SwitchHorizontalIcon className='button' />
                <RewindIcon
                    onClick={() => {
                        spotifyApi
                            .skipToPrevious()
                            .then(() => fetchCurrentSong(true))
                            .catch((err) => {});
                    }}
                    className='button'
                />

                {isPlaying ? (
                    <PauseIcon
                        onClick={() => handlePlayPause()}
                        className='button h-10 w-10'
                    />
                ) : (
                    <PlayIcon
                        onClick={() => handlePlayPause()}
                        className='button h-10 w-10'
                    />
                )}

                <FastForwardIcon
                    className='button'
                    onClick={() => {
                        spotifyApi
                            .skipToNext()
                            .then(() => fetchCurrentSong(true))
                            .catch((err) => {});
                    }}
                />
                <ReplyIcon className='button' />
            </div>

            {/* Right */}
            <div className='flex items-center justify-end space-x-3 pr-5 md:space-x-4'>
                {volume == 0 ? (
                    <VolumeOffIcon
                        onClick={() => {
                            setVolume(50);
                        }}
                        className='button'
                    />
                ) : (
                    <VolumeUpIcon
                        onClick={() => {
                            setVolume(0);
                        }}
                        className='button'
                    />
                )}
                <input
                    className='w-14 md:w-28'
                    type='range'
                    value={volume}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(e) => setVolume(Number(e.target.value))}
                />
            </div>
        </div>
    );
};

export default Player;
