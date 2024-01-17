import axios from "axios"
import moment from "moment";

const workflowFunctionAPICall = (runtimeId, mandateId, remark, action, navigate, user) => {
  const token = localStorage.getItem("token")
  const body = {
    runtimeId: runtimeId || 0,
    mandateId: mandateId || 0,
    tableId: mandateId || 0,
    remark: remark || "",
    createdBy: user?.UserName,
    createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
    action: action || ""
  };
  axios({
    method: 'post',
    url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${remark}`,
    headers: { 'Authorization': `Bearer ${token}` }
  }).then((response: any) => {
    if (!response) return;
    if (response?.data === true) {
      navigate("/list/task")
    }
  })
    .catch((e: any) => {
    });
}

export default workflowFunctionAPICall;