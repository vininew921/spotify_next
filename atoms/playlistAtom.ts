import { atom } from 'recoil';

export const playlistState = atom<SpotifyApi.SinglePlaylistResponse | null>({
    key: 'playlistState',
    default: null,
});

export const selectedPlaylistState = atom<string | null>({
    key: 'selectedPlaylistState',
    default: null,
});
