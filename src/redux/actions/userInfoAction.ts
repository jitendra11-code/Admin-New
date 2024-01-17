import { SAVE_USER_INFO } from "types/actions/userInfoAction";
export const setUserInfo = (payload: any) => ({
  type: SAVE_USER_INFO,
  payload
})