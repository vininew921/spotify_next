import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { currentTrackIdState } from '../atoms/songAtom';
import useSpotify from './useSpotify';

const useSongInfo = () => {
    const spotifyApi = useSpotify();
    const [currentTrackId, setCurrentTrackId] =
        useRecoilState(currentTrackIdState);

    const [songInfo, setSongInfo] = useState<
        undefined | SpotifyApi.SingleTrackResponse
    >(undefined);

    useEffect(() => {
        const fetchSongInfo = async () => {
            if (currentTrackId) {
                setSongInfo((await spotifyApi.getTrack(currentTrackId)).body);
            }
        };

        fetchSongInfo();
    }, [currentTrackId, spotifyApi]);

    return songInfo;
};

export default useSongInfo;
