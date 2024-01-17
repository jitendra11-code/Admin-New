const groupByDocumentData = (data, key) => {
    var _data = [];
    _data =
        data &&
        data.reduce(
            (result, item) => ({
                ...result,
                [item[key]]: [...(result[item[key]] || []), item],
            }),
            {}
        );

    _data =
        _data &&
        _data !== null &&
        Object.values(_data).map((item, key) => {
            const res =
                item &&
                item.reduce((acc, d) => {
                    const found = acc.find(
                        (a) => a?.VersionNumber?.trim() === d?.VersionNumber?.trim()
                    );
                    const value = { filename: d.filename }; // the element in data property
                    if (!found) {
                        acc.push({ ...d, fileList: [value] }); // not found, so need to add data property
                    } else {
                        found.fileList.push(value);
                    }
                    return acc;
                }, []);
            return res;
        });
    let _finalData = [];
    _data &&
        _data?.length > 0 &&
        _data.forEach((array) => {
            _finalData = _finalData.concat(array);
        });
    return _finalData || [];
};
export default groupByDocumentData;
