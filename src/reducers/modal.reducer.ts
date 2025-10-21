import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store.types';

// Modal types
export const MODAL_TYPES = {
  NONE: 'NONE',
  LIBRARY_SETTINGS: 'LIBRARY_SETTINGS',
  CONFIRMATION: 'CONFIRMATION',
  NEW_RECIPE: 'NEW_RECIPE',
  NEW_SONG: 'NEW_SONG'
} as const;

type ModalType = typeof MODAL_TYPES[keyof typeof MODAL_TYPES];
type AppContext = 'songs' | 'recipes' | null;

interface ModalState {
  currentModal: ModalType;
  modalData: Record<string, unknown> | null;
  isLoading: boolean;
  appContext: AppContext;
}

const initialState: ModalState = {
  // Current open modal
  currentModal: MODAL_TYPES.NONE,
  
  // Modal-specific data
  modalData: null,
  
  // UI state
  isLoading: false,
  
  // App context for modals that need to know which app they're in
  appContext: null // 'songs' | 'recipes'
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    // Open a modal
    openModal: (state: ModalState, action: PayloadAction<{
      modalType: ModalType;
      data?: Record<string, unknown> | null;
      appContext?: AppContext;
    }>) => {
      const { modalType, data = null, appContext = null } = action.payload;
      state.currentModal = modalType;
      state.modalData = data;
      state.appContext = appContext;
      state.isLoading = false;
      
    },
    
    // Close current modal
    closeModal: (state: ModalState) => {
      state.currentModal = MODAL_TYPES.NONE;
      state.modalData = null;
      state.appContext = null;
      state.isLoading = false;
    },
    
    // Update modal data without changing which modal is open
    updateModalData: (state: ModalState, action: PayloadAction<Record<string, unknown>>) => {
      state.modalData = { ...state.modalData, ...action.payload };
    },
    
    // Set loading state for modal operations
    setModalLoading: (state: ModalState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  }
});

export const {
  openModal,
  closeModal,
  updateModalData,
  setModalLoading
} = modalSlice.actions;

// Selectors
export const selectCurrentModal = (state: RootState) => state.modal.currentModal;
export const selectModalData = (state: RootState) => state.modal.modalData;
export const selectModalLoading = (state: RootState) => state.modal.isLoading;
export const selectAppContext = (state: RootState) => state.modal.appContext;
export const selectIsModalOpen = (modalType: ModalType) => (state: RootState) => state.modal.currentModal === modalType;

// Thunk actions for common modal operations
export const openLibrarySettingsModal = (appContext: AppContext, currentSettings: Record<string, unknown> = {}) => (dispatch: (action: unknown) => void) => {
  dispatch(openModal({
    modalType: MODAL_TYPES.LIBRARY_SETTINGS,
    appContext,
    data: {
      currentSettings,
      userInfo: null // Will be set by the component
    }
  }));
};

// New alias for a more generic name
export const openLibraryModal = (appContext: AppContext, currentSettings: Record<string, unknown> = {}) => (dispatch: (action: unknown) => void) => {
  return dispatch(openLibrarySettingsModal(appContext, currentSettings));
};

export const openConfirmationModal = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel: (() => void) | null = null
) => (dispatch: (action: unknown) => void) => {
  dispatch(openModal({
    modalType: MODAL_TYPES.CONFIRMATION,
    data: {
      title,
      message,
      onConfirm,
      onCancel
    }
  }));
};

export default modalSlice.reducer;