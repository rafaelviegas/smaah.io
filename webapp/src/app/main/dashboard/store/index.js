import { combineReducers } from '@reduxjs/toolkit';
import projects from './clientSlice';

const reducer = combineReducers({ projects });

export default reducer;
