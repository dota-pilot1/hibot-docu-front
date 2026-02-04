import { Store, useStore } from "@tanstack/react-store";

interface ProfileSheetState {
  isOpen: boolean;
}

export const profileSheetStore = new Store<ProfileSheetState>({
  isOpen: false,
});

export const useProfileSheetStore = <T>(
  selector: (state: ProfileSheetState) => T,
): T => {
  return useStore(profileSheetStore, selector);
};

export const profileSheetActions = {
  open: () => {
    profileSheetStore.setState((state) => ({ ...state, isOpen: true }));
  },
  close: () => {
    profileSheetStore.setState((state) => ({ ...state, isOpen: false }));
  },
  toggle: () => {
    profileSheetStore.setState((state) => ({ ...state, isOpen: !state.isOpen }));
  },
  setOpen: (isOpen: boolean) => {
    profileSheetStore.setState((state) => ({ ...state, isOpen }));
  },
};
