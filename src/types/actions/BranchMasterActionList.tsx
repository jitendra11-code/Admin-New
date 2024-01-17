export const GET_BRANCH_MASTER_ACTION_LIST = 'GET_BRANCH_MASTER_ACTION_LIST';

export interface GetBranchMasterActionList {
    type: typeof GET_BRANCH_MASTER_ACTION_LIST;
    payload: any | null;
}

export type AuthActions = GetBranchMasterActionList;
