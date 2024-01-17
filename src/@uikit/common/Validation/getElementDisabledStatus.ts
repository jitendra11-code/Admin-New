import axios from "axios";

const getElementDisabledStatus = async (mandateId) => {
    var _data;
    try {
        let res = await axios.get(`${process.env.REACT_APP_BASEURL}/api/RoleMenuList/GetValidationData?mandateId=${mandateId}`);
        _data = res.data && res.data.split(",") || []
        return _data || []
    }
    catch (error) {
        return []
    }
}

export default getElementDisabledStatus