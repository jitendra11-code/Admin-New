export default function groupBy(arr, key) {
    var _tempArr = null;
    var _parentMenu = null;
    var _childMenu = null;
    
    _tempArr = arr?.reduce(function (r, a) {
        r[a?.[key]] = r[a?.[key]] || [];
        r[a?.[key]].push(a);
        return r;
    }, Object.create(null));
    var groups = Object.keys(_tempArr).map(function (key) {
        return {group: key, values: _tempArr[key]};
    });
    _childMenu = groups?.[0] || null;
     _parentMenu = groups?.[1] || null;

    return {_parentMenu,_childMenu}

}