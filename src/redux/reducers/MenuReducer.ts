import { MENU_LIST } from "types/actions/MenuAction";
import { ORIGINAL_MENU_LIST } from "types/actions/MenuAction";
const INIT_STATE = {
  userMenuList: [],
  userOriginalMenuList: []
};

const MenuActionReducer = (
  state = INIT_STATE,
  action
) => {
  switch (action.type) {


    case MENU_LIST: {
      return {
        ...state,
        userMenuList: action?.payload

      }
    }
    case ORIGINAL_MENU_LIST: {
      return {
        ...state,
        userOriginalMenuList: action?.payload

      }
    }

    default:
      return state;
  }
};
export default MenuActionReducer;
