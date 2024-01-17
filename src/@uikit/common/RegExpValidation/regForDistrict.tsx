const regExpressionStringField = (e, name = '') => {
    var reg = /^[a-zA-Z]*$/;
    var space = /^\S*$/;
    if (reg.test(e.key) === false) {
        e.preventDefault();
    }
    if (space.test(e.key) === false && name == 'utr') {
        e.preventDefault();
    }
};
export default regExpressionStringField;
