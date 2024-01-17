import axios from "axios";
import moment from "moment";
const workflowComplienceFunctionAPICall = (
  runtimeId,
  mandateId,
  TableId,
  remark,
  action,
  navigate,
  user
) => {
  const token = localStorage.getItem("token");
  const body = {
    runtimeId: runtimeId || 0,
    mandateId: mandateId || 0,
    tableId: TableId || 0,
    remark: remark || "",
    createdBy: user?.UserName ,
    createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
    action: action || "",
    userName: user?.UserName ,
  };
  axios({
    method: "post",
    url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.tableId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${remark}&userName=${body?.userName}`,
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((response: any) => {
      if (!response) return;
      if (response?.data >= 1) {
        navigate("/intimation-request-list");
      }
    })
    .catch((e: any) => { });
};

export default workflowComplienceFunctionAPICall;
