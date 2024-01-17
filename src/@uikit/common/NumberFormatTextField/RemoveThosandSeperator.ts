const hasThousandSeparator = (str) => {
    const regex = /[\.,]\d{3}/;
    return regex.test(str);
};
const RemoveThousandSeparator = (value, type) => {
    console.log('bbb', typeof value);
    if (hasThousandSeparator(value)) {
        var _output = value?.replace(/,/g, '');
        console.log('RemoveThousandSeparator', _output);
        if (type === 'int') {
            return (_output && parseInt(_output)) || 0;
        }
        return _output || 0;
    }
    return value;
};
export default RemoveThousandSeparator;
