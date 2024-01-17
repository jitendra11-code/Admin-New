import { MENU_LIST } from "types/actions/MenuAction"
import { ORIGINAL_MENU_LIST } from "types/actions/MenuAction"

export const setUserMenuList = (payload: any) => ({
  type: MENU_LIST,
  payload
})

export const setUserMenuOriginalList = (payload: any) => ({
  type: ORIGINAL_MENU_LIST,
  payload
})