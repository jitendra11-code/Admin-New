export const GET_USER_ACTION_LIST = 'GET_USER_ACTION_LIST';


export interface GetUserActionListActions {
  type: typeof GET_USER_ACTION_LIST;
  payload: any | null
}

export type AuthActions = GetUserActionListActions;
