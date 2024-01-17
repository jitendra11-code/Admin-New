import { GET_BRANCH_MASTER_ACTION_LIST } from 'types/actions/BranchMasterActionList';
export const setBranchMasterActionList = (payload: any) => ({
    type: GET_BRANCH_MASTER_ACTION_LIST,
    payload,
});
