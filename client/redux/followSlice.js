import { createSlice } from '@reduxjs/toolkit';

const followSlice = createSlice({
  name: 'follow',
  initialState: {
    followedArtists: [],
  },
  reducers: {
    followArtist: (state, action) => {
      state.followedArtists = [...state.followedArtists, action.payload];
    },
    unfollowArtist: (state, action) => {
      state.followedArtists = state.followedArtists.filter(id => id !== action.payload);
    },
    setFollowedArtists: (state, action) => {
      state.followedArtists = action.payload;
    },
  },
});

export const { followArtist, unfollowArtist, setFollowedArtists } = followSlice.actions;
export default followSlice.reducer;
