import { GET_BRANCH_MASTER_ACTION_LIST } from 'types/actions/BranchMasterActionList';

const INIT_STATE = {
    branchMasterActionList: [],
};

const BranchMasterActionReducer = (state = INIT_STATE, action) => {
    switch (action.type) {
        case GET_BRANCH_MASTER_ACTION_LIST: {
            return {
                ...state,
                branchMasterActionList: action?.payload,
            };
        }

        default:
            return state;
    }
};
export default BranchMasterActionReducer;
