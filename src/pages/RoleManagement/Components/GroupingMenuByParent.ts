const formatObject = (item) => {
    return {
        "menuname": typeof item?.menuname !== 'object' ? item?.menuname : "",
        "parentname": typeof item?.parentname !== 'object' ? item?.parentname : "",
        "menuroute": typeof item?.menuroute !== 'object' ? item?.menuroute : "",
        "isparent": typeof item?.isparent !== 'object' ? item?.isparent : 0,
        "sequence": typeof item?.seq !== 'object' ? item?.seq : 0,
        "Isselect": typeof item?.Isselect !== 'object' ? item?.Isselect : 0,
        "Id": typeof item?.Id !== 'object' ? item?.Id : 0,
        "indeterminate": false,
        "checked": typeof item?.Isselect !== 'object' ? item?.Isselect ? true : false : 0,
        "actions": typeof item?.actions !== 'object' ? item?.actions : "",
        "SelectedAction": typeof item?.SelectedAction !== 'object' ? item?.SelectedAction : ""
    }
}
const assignCustomIds = (items, parentId) => {
    return items && items?.length > 0 && items?.map((item, index) => {
        const itemId = `${parentId}-${index}`;
        const children = assignCustomIds(item.children, itemId);
        return { ...formatObject(item), custom_id: itemId, children };
    });
};

const findMenuByobj = (data, parentname) => {
    var _menu = data && data.find(item => item.parentname === parentname && item.isparent === 1);
    return _menu || null;
}

export default function groupBy(data, key) {
    if (data && data?.length === 0) {
        return [];
    }
    const groupedArray = data && data.reduce((acc, obj) => {
        const parentname = obj.parentname;
        const isparent = obj.isparent
        if (!acc[parentname]) {
            var _tempObj = findMenuByobj(data, parentname)
            acc[parentname] = { ..._tempObj, children: [] };
        } else {
            if (isparent === 0)
                acc[parentname].children.push(obj);
        }
        return acc;
    }, {});

    var _groupdedJson = Object.values(groupedArray);
    _groupdedJson = assignCustomIds(_groupdedJson, "Parent");

    return _groupdedJson || []


}