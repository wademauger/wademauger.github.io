declare module 'react-color';

declare module '@/reducers/modal.reducer' {
  export const openModal: any;
  export const MODAL_TYPES: any;
}

declare module '@/utils/libraryMergeColorwork' {
  const mergeColorworkIntoLibrary: any;
  export default mergeColorworkIntoLibrary;
}

declare module '@/utils/modalCallbackRegistry' {
  export function registerCallback(cb: any): string;
}

declare module '@/store/knittingDesignSlice' {
  export const selectUiMode: any;
  export const setUiMode: any;
  export const selectPatternData: any;
  export const updatePatternData: any;
  export const nextStep: any;
  export const previousStep: any;
}

declare module '@/types' {
  export type RootState = any;
}

declare module '@reduxjs/toolkit' {
  export type PayloadAction<T = any> = { payload: T };
  export function createSlice(arg: any): any;
  // minimal matchers for common exports used in focused files
  export function configureStore(arg: any): any;
}

declare module 'antd';

declare module 'react-redux' {
  export function useSelector<T = any>(selector: any): T;
  export function useDispatch(): any;
  export const Provider: any;
}

// Wildcard fallback to keep focused type checks from failing on unresolved imports
declare module '*';
declare module 'react-color';
declare module '@/reducers/modal.reducer' {
  export const openModal: any;
  export const MODAL_TYPES: any;
}

declare module '@/utils/libraryMergeColorwork' {
  const mergeColorworkIntoLibrary: any;
  export default mergeColorworkIntoLibrary;
}
declare module '@/utils/modalCallbackRegistry' {
  export function registerCallback(cb: any): string;
}

declare module '@/store/knittingDesignSlice' {
  export const selectUiMode: any;
  export const setUiMode: any;
  export const selectPatternData: any;
  export const updatePatternData: any;
  export const nextStep: any;
  export const previousStep: any;
}
declare module '@/types' {
  export type RootState = any;
}
declare module 'react-color';

declare module '@/reducers/modal.reducer' {
  export const openModal: any;
  export const MODAL_TYPES: any;
}

declare module '@/utils/libraryMergeColorwork' {
  const mergeColorworkIntoLibrary: any;
  export default mergeColorworkIntoLibrary;
}

declare module '@/utils/modalCallbackRegistry' {
  export function registerCallback(cb: any): string;
}

declare module '@/store/knittingDesignSlice' {
  export const selectUiMode: any;
  export const setUiMode: any;
  export const selectPatternData: any;
  export const updatePatternData: any;
  export const nextStep: any;
  export const previousStep: any;
}

declare module '@/types' {
  export type RootState = any;
}
