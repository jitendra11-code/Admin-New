import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import MandateInfo from 'pages/common-components/MandateInformation';
import React, { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useUrlSearchParams } from 'use-url-search-params';
import TextEditor from "./Editor/TextEditor";
import { Box, Button, Stack } from '@mui/material';
import { submit } from 'shared/constants/CustomColor';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import Template from 'pages/common-components/AgGridUtility/ColumnHeaderWithAsterick';
import { AppState } from '@auth0/auth0-react';
import { showMessage } from 'redux/actions';
import workflowFunctionAPICall from "pages/Mandate/workFlowActionFunction";
import { useAuthUser } from '@uikit/utility/AuthHooks';
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';

const LandlordDetails = () => {
  let { id } = useParams();
  const [mandateCode, setMandateCode] = useState<any>(id);
  const [params] = useUrlSearchParams({}, {});
  const [mandateInfo, setMandateData] = React.useState(null);
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [landlord, setLandlord] = useState("");
  const [tableData, setTableData] = useState<any>([]);
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const dispatch = useDispatch();
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const { user } = useAuthUser();
  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const navigate = useNavigate();
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];


  const getPropertyLandlordData = async (id) => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/PropertyLandlordDetails/GetLandlordVendorDetails?mandateId=${id || 0
        }`
      )
      .then((response: any) => {
        if (!response) return;
        if (response && response?.data && response?.data?.length > 0) {
          setTableData(response?.data);
        } else {
          setTableData([]);
        }
      })

      .catch((e) => { });
  };

  React.useEffect(() => {
    if (id) {
      getPropertyLandlordData(id);
    }
  }, [id]);

  const components = {
    TextEditorCmp: TextEditor,
  };

  React.useEffect(() => {
    if (id && id !== undefined) {
      const userAction =
        userActionList &&
        userActionList?.find(
          (item) =>
            item?.mandateId === parseInt(id) &&
            item?.module === module.toString()
        );
      if (apiType === "") {
        setUserAction(userAction);
      } else {
        let action = id;
        setUserAction(action);
      }
      if (params.source === "list") {
        navigate(`/mandate/${id}/${module}?source=list`, {
          state: { apiType: apiType },
        });
      } else {
        navigate(`/mandate/${id}/${module}`, {
          state: { apiType: apiType },
        });
      }
    }
  }, [id]);


  let columnDefs = [
    {
      field: "srno",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },

      sortable: true,
      resizable: true,
      width: 90,
      minWidth: 90,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "landlord_full_name",
      headerName: "Full Name",
      headerTooltip: "Full Name",
      cellRenderer: (e: any) => {
        var data = e.data.landlord_full_name;
        return data || "";
      },
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 130,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "mobile",
      headerName: "Mobile Number",
      headerTooltip: "Mobile Number",
      resizable: true,
      width: 110,
      minWidth: 90,
      cellStyle: { fontSize: "13px" },

      cellRenderer: (e: any) => {
        var data = e.data.mobile;
        return data || "";
      },
    },
   


    {
      field: "email",
      headerName: "Email Id ",
      headerTooltip: "Email Id",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.email;
        return data || "";
      },
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "vendorcode",
      headerName: "Vendor Code ",
      headerTooltip: "Vendor Code",
      
      sortable: true,
      resizable: true,
      
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
      cellClassRules: {
        "rag-red": (params) => {
          if (params?.node?.rowPinned === undefined) {
            if (params?.data?.vendorcode !== undefined) {
              return false;
            }
            return true;
          }
          return false;
        },
      },
      cellClass: (params) =>
        params?.node?.rowPinned === undefined &&
        "cell-padding rag-red editTextClass",
      editable: (params) => {
        if (params?.node?.rowPinned) {
          return false;
        }
        return true;
      },
      cellEditor: "TextEditorCmp",
      cellEditorParams: {
        tableData: tableData,
        setTableData: setTableData,
        maxLength: 30,
        type: "text",
        name: "utr",
      },
    },

  ];
  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }
  const [index, setIndex] = useState<any>();

  const handleSubmit = () => {
    let body = []
    for (let i = 0; i < tableData.length; i++) {
      body.push({
        id: 0,
        uid: "",
        mandateId: parseInt(id) || 0,
        vendor_name: tableData[i].landlord_full_name || "",
        vendor_code: tableData[i].vendorcode || "",
        createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        createdBy: user?.UserName,
        updatedOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        updatedBy: user?.UserName
      })

    }

    axios
      .post(`${process.env.REACT_APP_BASEURL}/api/PropertyLandlordDetails/InsertUpdateLandlordVendorDetails`, body)
      .then((response: any) => {
        if (!response) return
        if (response && response.data) {
          dispatch(showMessage("Record Inserted Successfully!!"));
          workflowFunctionAPICall(
            runtimeId,
            id,
            "Created",
            "Created",
            navigate,
            user
          );
        }

      })
      .catch((e: any) => {
      });
  }

  return (
    <>
      <div>
        <Box
          component="h2"
          className="page-title-heading my-6"
        >
          Landlord Details
        </Box>
      </div>
      <div style={{ backgroundColor: "#fff", padding: "0px", borderRadius: "5px" }}>
        <MandateInfo
          mandateCode={mandateCode}
          source="landlord-details"
          pageType=""
          redirectSource={`${params?.source}`}
          setMandateCode={setMandateCode}
          setMandateData={setMandateData}
          setpincode={() => { }}
          setCurrentStatus={setCurrentStatus}
          setCurrentRemark={setCurrentRemark}
        />
      </div>
      <div style={{ height: "calc(100vh - 315px)" }}>
        <CommonGrid
          components={components}
          defaultColDef={{ flex: 1 }}
          columnDefs={columnDefs}
          rowData={tableData || []}
          onGridReady={onGridReady}
          gridRef={gridRef}
          pagination={false}
          paginationPageSize={null}
        />
      </div>

      <div className="bottom-fix-history">
        {id && id !== undefined && id !== "noid" && (
          <MandateStatusHistory
            mandateCode={id}
            accept_Reject_Status={currentStatus}
            accept_Reject_Remark={currentRemark}
          />
        )}
      </div>

      <Stack
        display="flex"
        flexDirection="row"
        justifyContent="center"
        sx={{ margin: "10px" }}
        style={{
          marginTop: "20px",
          position: "fixed",
          bottom: "10px",
          left: "48%"
        }}
      >
        <Button
          variant="contained"
          onClick={handleSubmit}
          size="small"
          style={submit}
        >
          SUBMIT
        </Button>
      </Stack>


    </>
  )
}

export default LandlordDetails;