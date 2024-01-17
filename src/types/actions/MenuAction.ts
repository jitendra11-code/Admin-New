export const MENU_LIST = 'MENU_LIST';
export const ORIGINAL_MENU_LIST = 'ORIGINAL_MENU_LIST'

export interface GetUserMenuListActions {
  type: typeof MENU_LIST;
  payload: any | null
}

export interface GetUserMenuOriginalListActions {
  type: typeof ORIGINAL_MENU_LIST;
  payload: any | null
}

