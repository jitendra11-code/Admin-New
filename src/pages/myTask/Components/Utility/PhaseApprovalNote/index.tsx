const getObjByMandateId = (id, data, item, phaseApprovalNoteData, user) => {
    var obj = null;
    if (
        item?.levels?.trim() === "Prepared By" &&
        phaseApprovalNoteData?.id === undefined
    ) {
        obj = data?.find(
            (item) =>
                item?.userName === user?.UserName &&
                item?.levels?.trim() === "Prepared By"
        );
        return obj || null;
    }
    obj = data?.find((item) => item?.lastselected_id === id);
    return obj || null;
};
const getObjForPreparedBy = (data, item, phaseApprovalNoteData, user) => {
    var obj = null;
    if (item?.levels?.trim() === "Prepared By") {
    }
    if (
        item?.levels?.trim() === "Prepared By" &&
        phaseApprovalNoteData?.id === undefined
    ) {
        obj = item?.options?.find(
            (item) =>
                item?.userName === user?.UserName &&
                item?.levels?.trim() === "Prepared By"
        );
        return obj || null;
    }
    return null;

};

const setOptionData = (data, item, phaseApprovalNoteData, user) => {
    var obj = null;
    if (
        item?.options && item?.options?.length === 1
    ) {
        return item?.options?.[0] || null;
    }
    return null;

};
const _generateData = (data, phaseApprovalNoteData, user) => {
    var _finalJson = [];
    var res = data && data.reduce((acc, d) => {
        const found = acc.find(a => a.levels === d.levels && a.sequence === d.sequence  );
        var value = d.options;
        value.values = d?.lastselected_id && d?.lastselected_id !== 0
            ? getObjByMandateId(d?.lastselected_id, data, d, phaseApprovalNoteData, user)
            : d?.levels?.trim() === "Prepared By"
                ? getObjForPreparedBy(data, d, phaseApprovalNoteData, user)
                : setOptionData(data, d, phaseApprovalNoteData, user);
        let designation = d?.designation;
        if (!found) {
            acc.push({ ...d, options: [value], designation: designation }) 
        }
        else {

            let existingValue = found?.options;
            let existingDesignation = found?.designation;
            let _newdesignation = `${existingDesignation || ""} OR ${designation || ""}`;
            let newValue = value;
            const index = existingValue.indexOf(found?.options);
            let arr = [];
            if (Array.isArray(existingValue?.[0]) && Array.isArray(newValue)){
                
                arr= [...existingValue.slice(0, index),
                    newValue,
                    ...existingValue.slice(index)]
            }
            found.options = arr;
            found.newdesignation = _newdesignation;
            found.values = null

        }
        return acc;
    }, []);
    _finalJson = res

    return _finalJson || [];

}
export const _createOptions = (data) => {
    var _data = data && data.map((item, key) => {
        return item
    })
    return _data
}
export default _generateData;