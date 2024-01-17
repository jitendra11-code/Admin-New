import { SHOW_HIDE_LOADER } from "types/actions/AppLoader";

const INIT_STATE = {
    loaderState: false
};

const UserActionReducer = (
    state = INIT_STATE,
    action
) => {
    switch (action.type) {


        case SHOW_HIDE_LOADER: {
            return {
                ...state,
                loaderState: action?.payload

            }
        }
       

        default:
            return state;
    }
};
export default UserActionReducer;
