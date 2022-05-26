import { createEntityAdapter, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getClients = createAsyncThunk('dashboard/clients/getClients',async (userId) => {
    const response = await axios.get(process.env.REACT_APP_API_URL+'/users/'+userId+"/clients");
    return response.data;
  }
);

const clientsAdapter = createEntityAdapter({});

export const {
  selectAll: selectClients,
  selectEntities: selectClientsEntities,
  selectById: selectClientById,
} = clientsAdapter.getSelectors((state) => {



    return state.dashboard?.clients;
});

const clientsSlice = createSlice({name: 'dashboard/clients',initialState: clientsAdapter.getInitialState(),
  reducers: {},
  extraReducers: {
    [getClients.fulfilled]: clientsAdapter.setAll,
  },
});

export default clientsSlice.reducer;
