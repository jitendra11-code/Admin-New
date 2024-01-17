import { Button, Grid, Checkbox, FormControlLabel } from "@mui/material";
import React, { useEffect, useState } from "react";
import { secondaryButton } from "shared/constants/CustomColor";
import { _validationMaxFileSizeUpload } from "../Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import { useDispatch, useSelector } from "react-redux";
import { fetchError, showMessage } from "redux/actions";
import axios from "axios";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import groupByDocumentData from "pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import moment from "moment";
import { AppState } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

const MAX_COUNT = 8;
const PendingList = ({ setVersionHistoryData }) => {
  const dispatch = useDispatch();
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const fileInput = React.useRef(null);
  const [fileLimit, setFileLimit] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [data, setData] = useState([]);
  const [checked, setChecked] = useState({});
  const [selectedData, setSelectedData] = useState([]);
  const [allChecked, setAllChecked] = useState({});
  const [runTimeId, setRunTimeId] = useState({});
  const [wholeData, setWholeData] = useState([]);
  const [selectAllBox, setSelectAllBox] = useState(true);
  const [fileLength, setFileLength] = useState(0);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const gridRef = React.useRef<AgGridReact>(null);

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/BulkPendingAssign?PhaseId=0&WorkItem=Create Branch Code`
      )
      .then((res) => {
        res &&
          res?.data &&
          res?.data?.map((item, index) => {
            checked[index] = true;
            selectedData[index] = { ...item };
            runTimeId[item.id] = item?.runtimeId;
          });
        setRunTimeId({ ...runTimeId });
        setSelectAllBox(true);
        setAllChecked({ ...checked });
        setChecked({ ...checked });
        setWholeData({ ...selectedData });
        setSelectedData({ ...selectedData });
        setData(res?.data);
        getVersionHistoryData();
      })
      .catch((err) => fetchError("error occured"));
  };

  const onHeaderCheckboxChange = (event, params) => {
    if (event.target.checked) {
      gridApi.selectAll();
      params?.setSelectAllBox(true);
      params?.setChecked({ ...allChecked });
      params?.setSelectedData({ ...wholeData });
    } else {
      gridApi.deselectAll();
      params?.setChecked({});
      params?.setSelectedData({});
      params?.setSelectAllBox(false);
    }
  };

  const CustomHeaderCheckbox = ({ selectAllBox, displayName, ...params }) => {
    return (
      <div>
        <span>{displayName}</span>&nbsp;&nbsp;
        <>
          {data && data?.length > 0 && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectAllBox || false}
                  onChange={(e) => onHeaderCheckboxChange(e, params)}
                />
              }
              label=""
            />
          )}
        </>
      </div>
    );
  };

  let columnDefs = [
    {
      field: "medals.bronze",
      headerName: "Action",
      headerTooltip: "Action",
      headerComponent: CustomHeaderCheckbox,
      headerComponentParams: {
        checked: checked,
        setChecked: setChecked,
        selectedData: selectedData,
        selectAllBox: selectAllBox,
        setSelectAllBox: setSelectAllBox,
        setSelectedData: setSelectedData,
      },
      cellRenderer: (e: any) => (
        <>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={checked[e?.rowIndex] || false}
                onChange={(event) => {
                  checked[e?.rowIndex] = event.target.checked;
                  setChecked({ ...checked });
                  if (event.target.checked) {
                    selectedData[e?.rowIndex] = { ...e?.data };
                    if (
                      Object.keys(selectedData).length ===
                      Object.keys(wholeData).length
                    ) {
                      setSelectAllBox(true);
                    }
                    setSelectedData({ ...selectedData });
                  } else {
                    delete selectedData[e?.rowIndex];
                    setSelectAllBox(false);
                    setSelectedData({ ...selectedData });
                  }
                }}
              />
            }
            label=""
          />
        </>
      ),

      sortable: true,
    },
    {
      field: "mandateCode",
      headerName: "Mandate Code",
      headerTooltip: "Mandate Code",
      filter: true,
      width: 160,
      minWidth: 155,
      sortable: true,
      resizable: true,

      cellStyle: { fontSize: "13px" },
    },
    {
      field: "verticalName",
      headerName: "Vertical",
      headerTooltip: "Vertical",
      filter: true,
      sortable: true,
      resizable: true,
      width: 160,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "branchTypeName",
      headerName: "Branch Type",
      headerTooltip: "Branch Type",
      filter: true,
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "glCategoryName",
      headerName: "GL Category",
      headerTooltip: "GL Category",
      sortable: true,
      resizable: true,
      filter: true,
      width: 200,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "state",
      headerName: "State",
      headerTooltip: "State",
      filter: true,
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "location",
      headerName: "Location Name",
      headerTooltip: "Location Name",
      filter: true,
      sortable: true,
      resizable: true,
      width: 140,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "pincode",
      headerName: "Pin Code",
      headerTooltip: "Pin Code",
      sortable: true,
      filter: true,
      resizable: true,
      width: 150,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "branchcode",
      headerName: "Branch Code",
      headerTooltip: "Branch Code",
      sortable: true,
      filter: true,
      resizable: true,
      width: 150,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
  ];

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

  const handleExportData = () => {
    if (Object.keys(selectedData)?.length === 0) {
      dispatch(fetchError("Please  Select Check Box"));
      return;
    }
    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/ExportData`,
        Object.values(selectedData)
      )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "BulkUpdateBranchCode.xlsx";
          if (filename && filename === "") {
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          const binaryStr = atob(response?.data);
          const byteArray = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            byteArray[i] = binaryStr.charCodeAt(i);
          }

          var blob = new Blob([byteArray], {
            type: "application/octet-stream",
          });
          if (typeof window.navigator.msSaveBlob !== "undefined") {
            window.navigator.msSaveBlob(blob, filename);
          } else {
            var blobURL =
              window.URL && window.URL.createObjectURL
                ? window.URL.createObjectURL(blob)
                : window.webkitURL.createObjectURL(blob);
            var tempLink = document.createElement("a");
            tempLink.style.display = "none";
            tempLink.href = blobURL;
            tempLink.setAttribute("download", filename);
            if (typeof tempLink.download === "undefined") {
              tempLink.setAttribute("target", "_blank");
            }

            document.body.appendChild(tempLink);
            tempLink.click();

            setTimeout(function () {
              document.body.removeChild(tempLink);
              window.URL.revokeObjectURL(blobURL);
            }, 200);

            dispatch(
              showMessage("Bulk Update Branch Code downloaded successfully!")
            );
          }
        }
      });
  };

  const getVersionHistoryData = () => {

    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=0&documentType=Create Branch Code`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        if (response?.data && response?.data && response?.data?.length > 0) {
          var data = groupByDocumentData(response?.data, "versionNumber");
          setVersionHistoryData(data || []);
        }
        if (response && response?.data?.length === 0) {
          setVersionHistoryData([]);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  const workFlowMandate = (id) => {
    const token = localStorage.getItem("token");
    const body = {
      runtimeId: runTimeId[id] || 0,
      mandateId: id || 0, 
      tableId: id || 0,
      remark: "Created",
      createdBy: user?.UserName,
      createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      action: "Created", 
    };
    axios({
      method: "post",
      url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId
        }&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${body?.createdBy
        }&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ""
        }`,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response: any) => {
        if (!response) return;
        if (response?.data === true) {
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error failed !!!"));
      });
  };

  async function callMethodOnArrayElements(arr) {
    const promises = arr.map(async (element) => {
      return workFlowMandate(element?.id || 0);
    });
    const results = await Promise.all(promises);
    return results;
  }
  const handleUploadFiles = async (e, files) => {
    const uploaded = [...uploadedFiles];
    let limitExceeded = false;
    files &&
      files?.some((file) => {
        if (
          uploaded &&
          uploaded?.findIndex((f) => f.name === file.name) === -1
        ) {
          uploaded.push(file);
          if (uploaded?.length === MAX_COUNT) setFileLimit(true);
          if (uploaded?.length > MAX_COUNT) {
            dispatch(
              fetchError(
                `You can only add a maximum of ${MAX_COUNT} files` || ""
              )
            );
            setFileLimit(false);
            limitExceeded = true;
            e.target.value = null;
            return;
          }
        }
      });
    if (limitExceeded) {
      dispatch(
        fetchError(`You can only add a maximum of ${MAX_COUNT} files` || "")
      );
      e.target.value = null;
      return;
    }

    if (!limitExceeded) setUploadedFiles(uploaded);
    setFileLength((uploaded && uploaded?.length) || 0);
    const formData: any = new FormData();
    formData.append("mandate_id", 0);
    formData.append("documenttype", "Create Branch Code");
    formData.append("CreatedBy", user?.UserName );
    formData.append("ModifiedBy", user?.UserName );
    formData.append("entityname", "Create Branch Code");
    formData.append("RecordId", 2);
    formData.append("remarks", "Create Branch Code" || "");
    uploaded &&
      uploaded?.map((file) => {
        formData.append("file", file);
      });
    if (uploaded?.length === 0) {
      setUploadedFiles([]);
      setFileLimit(false);
      dispatch(fetchError("Error Occurred !"));
      e.target.value = null;
      return;
    }

    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/FileUpload`,
        formData
      )
      .then((response: any) => {
        e.target.value = null;
        if (!response) {
          setUploadedFiles([]);
          setFileLimit(false);
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        if (response?.data?.data == null) {
          setUploadedFiles([]);
          setFileLimit(false);
          dispatch(fetchError("Documents are not uploaded!"));
          getVersionHistoryData();
          return;
        } else if (response?.status === 200) {
          setUploadedFiles([]);
          setFileLimit(false);
          getVersionHistoryData();
        }
      })
      .catch((e: any) => {
        e.target.value = null;
        dispatch(fetchError("Error Occurred !"));
      });
    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/UploadAndUpdateExcelData`,
        formData
      )
      .then(async (response: any) => {
        if (!response) {
          setUploadedFiles([]);
          setFileLimit(false);
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        if (response?.data?.data == null) {
          setUploadedFiles([]);
          setFileLimit(false);
          dispatch(fetchError("Documents are not uploaded!"));
          return;
        } else if (response?.status === 200) {
          setUploadedFiles([]);
          setFileLimit(false);
          callMethodOnArrayElements(response?.data?.data)
            .then((results) => {
              setTimeout(() => {
                getData();
              }, 1000);
            })
            .catch((error) => {
            });

          dispatch(showMessage("Documents are uploaded successfully."));
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };
  const handleFileEvent = (e) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    if (_validationMaxFileSizeUpload(e, dispatch)) {
      handleUploadFiles(e, chosenFiles);
    }
  };
  return (
    <>
      <Grid
        marginTop="0px"
        container
        item
        spacing={5}
        display="flex"
        justifyContent="flex-end"
      >
        <Grid>
          <div>
            <Button
              onClick={() => {
               
                fileInput.current.click();
              }}
              variant="outlined"
              size="medium"
              style={secondaryButton}
            >
              Import Data
            </Button>
            <input
              ref={fileInput}
              multiple
              onChange={handleFileEvent}
              disabled={fileLimit}
              accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,
text/plain, application/pdf, image/*"
              type="file"
              style={{ display: "none" }}
            />
          </div>
        </Grid>
        <Grid>
          <Button
            onClick={() => {
              handleExportData();
            }}
            variant="outlined"
            size="medium"
            style={secondaryButton}
          >
            Export Data
          </Button>
        </Grid>
      </Grid>
      <div style={{ height: "510px", marginTop: "10px" }}>
        <CommonGrid
          defaultColDef={{ flex: 1 }}
          columnDefs={columnDefs}
          rowData={data || []}
          onGridReady={onGridReady}
          gridRef={gridRef}
          pagination={false}
          paginationPageSize={null}
        />
      </div>
    </>
  );
};
export default PendingList;
