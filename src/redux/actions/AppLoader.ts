import { SHOW_HIDE_LOADER } from "types/actions/AppLoader"

export const setLoaderActionList = (payload : any) =>({
    type:SHOW_HIDE_LOADER,
    payload
  })
  