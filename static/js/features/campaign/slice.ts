import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface IChainState {
  selectedLeaderboardCampaignId: number | null;
}

const initialState: IChainState = {
  selectedLeaderboardCampaignId: null,
};

export const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    setSelectedLeaderboardCampaignId: (
      state,
      { payload: { selectedLeaderboardCampaignId } }: PayloadAction<{ selectedLeaderboardCampaignId: number | null }>,
    ) => {
      state.selectedLeaderboardCampaignId = selectedLeaderboardCampaignId;
    },
  },
});

export const { setSelectedLeaderboardCampaignId } = campaignSlice.actions;

export const campaignReducer = campaignSlice.reducer;
