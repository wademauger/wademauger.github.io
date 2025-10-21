// Minimal shims for repo-local types used during the migration.
// Keep these intentionally small to avoid masking real type issues.

declare module 'react-color';

declare module 'antd';

declare module 'react-redux' {
  export function useSelector<T = any>(selector: any): T;
  export function useDispatch(): any;
  export const Provider: any;
}

declare module '@reduxjs/toolkit' {
  export type PayloadAction<T = any> = { payload: T } & Record<string, any>;
  export function createSlice(arg: any): any;
  export function configureStore(arg: any): any;
  export function createAsyncThunk<T = any>(typePrefix: string, payloadCreator: (...args: any[]) => any): any;
  export function createAction(type: string): any;
}

declare module '*';
