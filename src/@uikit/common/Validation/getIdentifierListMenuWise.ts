import { store } from "redux/store";
export const getIdentifierList = () => {
    let path = window.location.pathname?.split("/");
    let url: any = window.location.pathname?.split("/")?.[path.length - 1];
    var menuList = store?.getState()?.menu?.userOriginalMenuList || [];
    if (menuList && menuList?.length === 0) return []
    var identifireList: any;
    identifireList = menuList && menuList?.length > 0 &&
    menuList.find(item => item?.menuroute && typeof item?.menuroute !== 'object'  && item?.menuroute && item?.menuroute?.split("/")?.[item?.menuroute?.split("/")?.length-1]===url)
    identifireList = identifireList?.componantlist;
    if (identifireList && typeof identifireList !== 'object') {
        identifireList = identifireList && identifireList?.split(',')
        return identifireList || []
    }
    return [];

}