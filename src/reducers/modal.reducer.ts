import { createSlice } from '@reduxjs/toolkit';

// Modal types
export const MODAL_TYPES = {
  NONE: 'NONE',
  LIBRARY_SETTINGS: 'LIBRARY_SETTINGS',
  CONFIRMATION: 'CONFIRMATION',
  NEW_RECIPE: 'NEW_RECIPE',
  NEW_SONG: 'NEW_SONG'
};

const initialState = {
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
    openModal: (state, action) => {
      const { modalType, data = null, appContext = null } = action.payload;
      state.currentModal = modalType;
      state.modalData = data;
      state.appContext = appContext;
      state.isLoading = false;
      
    },
    
    // Close current modal
    closeModal: (state) => {
      state.currentModal = MODAL_TYPES.NONE;
      state.modalData = null;
      state.appContext = null;
      state.isLoading = false;
    },
    
    // Update modal data without changing which modal is open
    updateModalData: (state, action) => {
      state.modalData = { ...state.modalData, ...action.payload };
    },
    
    // Set loading state for modal operations
    setModalLoading: (state, action) => {
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
export const selectCurrentModal = (state) => state.modal.currentModal;
export const selectModalData = (state) => state.modal.modalData;
export const selectModalLoading = (state) => state.modal.isLoading;
export const selectAppContext = (state) => state.modal.appContext;
export const selectIsModalOpen = (modalType) => (state) => state.modal.currentModal === modalType;

// Thunk actions for common modal operations
export const openLibrarySettingsModal = (appContext, currentSettings = {}) => (dispatch) => {
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
export const openLibraryModal = (appContext, currentSettings = {}) => (dispatch) => {
  return dispatch(openLibrarySettingsModal(appContext, currentSettings));
};

export const openConfirmationModal = (title, message, onConfirm, onCancel = null) => (dispatch) => {
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