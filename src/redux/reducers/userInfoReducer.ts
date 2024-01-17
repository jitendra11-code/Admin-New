import { SAVE_USER_INFO, SAVE_CURRENT_ROLE } from "types/actions/userInfoAction";

const INIT_STATE = {
    userInfo: [],
    userRole: {}
};

const userInfoReducer = (
    state = INIT_STATE,
    action
) => {
    switch (action.type) {
        case SAVE_USER_INFO: {
            return {
                ...state,
                userInfo: action?.payload

            }
        }
        case SAVE_CURRENT_ROLE: {
            return {
                ...state,
                userRole: action?.payload

            }
        }

        default:
            return state;
    }
};
export default userInfoReducer;
