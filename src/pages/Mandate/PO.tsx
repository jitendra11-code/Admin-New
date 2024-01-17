import {
  Autocomplete,
  Box,
  Grid,
  Tab,
  TextField,
} from "@mui/material";
import React, { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchError, showMessage } from "redux/actions";
import axios from "axios";
import {
  _validationMaxFileSizeUpload,
} from "./DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import groupByDocumentData from "./DocumentUploadMandate/Components/Utility/groupByDocumentData";
import { AgGridReact } from "ag-grid-react";
import moment from "moment";
import { useParams } from "react-router-dom";
import TabContext from "@mui/lab/TabContext";
import { Link } from "react-router-dom";
import TabList from "@mui/lab/TabList";
import MandateInfo from "pages/common-components/MandateInformation";
import PoTable from "../Po/PoTable";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
import { useUrlSearchParams } from "use-url-search-params";

const MAX_COUNT = 8;

const bOQValue = {
  key: "PO",
  name: "PO",
};
const PO = () => {
  const dispatch = useDispatch();
  let { id } = useParams();
  const [vendor, setVendor] = React.useState<any>({
    vendorname: "",
    vendorId: 0,
    id: 0,
    vendorcategory: "",
  });
  const [params] = useUrlSearchParams({}, {});

  const [vendorInformation, setVendorInformation] = React.useState([]);
  const [vendorCatInformation, setVendorCatInformation] = React.useState([]);
  const [mandateId, setMandateId] = React.useState(null);
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [mandateData, setMandateData] = React.useState({});
  const [projectPlanData, setProjectPlanData] = useState([]);
  const [boqDrp, setBoQ] = React.useState<any>(bOQValue);
  const [docType, setDocType] = React.useState<any>(null);
  const fileInput = React.useRef(null);
  const [fileLimit, setFileLimit] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [fileLength, setFileLength] = React.useState(0);
  const [docUploadHistory, setDocUploadHistory] = React.useState([]);
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const { user } = useAuthUser();

  const [formData, setFormData] = React.useState<any>({
    id: 0,
    uid: "string",
    mandateId: 0,
    vendor_Id: 0,
    vendor_category: "",
    vendor_code: "",
    vendor_name: "",
    po_number: "",
    po_amount: "",
    po_release_date: new Date().toISOString().substring(0, 10),
    is_file_upload: false,
    remarks: "",
    status: "",
    createdby: user?.UserName,
    createddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
    modifiedby: user?.UserName,
    modifieddate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
  });
  const [tableData, setTableData] = React.useState<any>([]);

  const [value, setValue] = React.useState("2");

  useEffect(() => {
    if (
      mandateId &&
      mandateId?.id !== undefined &&
      mandateId?.id !== "noid" &&
      user &&
      user?.role === "Vendor"
    ) {
      const obj = { vendorcategory: user?.vendorType || "" };
      const data = [
        {
          vendorcategoryKey: user?.vendorType || "",
          vendorcategory: user?.vendorType || "",
        },
      ];
      setVendor((state) => ({
        ...state,
        vendorcategoryKey: user?.vendorType || "",
        vendorcategory: user?.vendorType || "",
      }));
      setVendorCatInformation([...data]);
      handelCategoryChange("e", obj);
    }
  }, [mandateId?.id]);
  const handelCategoryChange = (e, value) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PODetails/GetVendorDropDown?mandateId=${mandateId?.id}&vendorCategory=${value?.vendorcategory}`
      )
      .then((response) => {
        if (!response) return;
        if (
          user?.role === "Vendor" &&
          response?.data &&
          response?.data?.length === 1
        ) {
          setVendor({
            vendorname: response?.data?.[0]?.vendorname || "",
            vendorId: response?.data?.[0]?.id || 0,
            id: response?.data?.[0]?.id || 0,
            vendorcategory: user?.vendorType || "",
          });
        }
        if (
          user?.role !== "Vendor" &&
          response?.data &&
          response?.data?.length === 1
        ) {
          setVendor({
            vendorname: response?.data?.[0]?.vendorname || "",
            vendorId: response?.data?.[0]?.id || 0,
            id: response?.data?.[0]?.id || 0,
            vendorcategory: response?.data?.[0]?.vendorcategory || 0,
          });
        }
        setVendorInformation(response?.data);
      })
      .catch((err) => {});
  };

  const getVendorCategory = () => {
    axios
      .get(
        `${
          process.env.REACT_APP_BASEURL
        }/api/PODetails/GetVendorCategoryByMandateId?mandateId=${
          mandateId?.id === undefined ? mandateId : mandateId?.id
        }`
      )
      .then((response) => {
        setVendorCatInformation(response?.data);
      })
      .catch((err) => {});
  };
  useEffect(() => {
    if (
      mandateId &&
      mandateId?.id !== undefined &&
      mandateId?.id !== "noid" &&
      user &&
      user?.role !== "Vendor"
    ) {
      getVendorCategory();
    }
  }, [mandateId?.id]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const getData = () => {
    if (vendor?.vendorcategory) {
      axios
        .get(
          `${
            process.env.REACT_APP_BASEURL
          }/api/PODetails/GetPODetails?mandateId=${
            mandateId?.id || 0
          }&vendor_category=${vendor?.vendorcategory || 0}`
        )
        .then((response) => {
          if (response && response?.data) {
            const vendorIds = {};
            const updatevendorname = response?.data?.map((item, ind) => {
              vendorIds[item.partnerName] = item.fk_VendorPartnerMaster_id;
            });
            setTableData([...response?.data]);
          }
        })
        .catch((err) => {});
    } else {
      axios
        .get(
          `${
            process.env.REACT_APP_BASEURL
          }/api/PODetails/GetPODetails?mandateId=${
            mandateId?.id || 0
          }&vendor_id=${vendor?.vendorId || 0}`
        )
        .then((response) => {
          if (response && response?.data) {
            const vendorIds = {};
            const updatevendorname = response?.data?.map((item, ind) => {
              vendorIds[item.partnerName] = item.fk_VendorPartnerMaster_id;
            });
            setTableData([...response?.data]);
          }
        })
        .catch((err) => {});
    }
  };
  React.useEffect(() => {
    if (mandateId?.id !== undefined && mandateId?.id !== "noid") {
      getData();
    }
  }, [mandateId?.id, vendor]);

  React.useEffect(() => {
    if (id !== "noid" && id) {
      setMandateId(id);
    }
  }, []);

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
    formData.append("mandate_id", mandateId?.id);
    formData.append("documenttype", "PO");
    formData.append("CreatedBy", user?.UserName || "");
    formData.append("ModifiedBy", user?.UserName || "");
    formData.append("entityname", "PO");
    formData.append("RecordId", mandateId?.id);

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

    if (mandateId?.id !== undefined) {
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
            dispatch(showMessage("Documents are uploaded successfully!"));
            getVersionHistoryData();
          }
        })
        .catch((e: any) => {
          e.target.value = null;
          dispatch(fetchError("Error Occurred !"));
        });
    }
  };
  const getVersionHistoryData = () => {
    axios
      .get(
        `${
          process.env.REACT_APP_BASEURL
        }/api/PODetails/GetPODetails?mandateId=${
          mandateId?.id || 0
        }&vendor_id=${vendor?.vendorId || 0}`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }

        if (response?.data && response?.data && response?.data?.length > 0) {
          var data = groupByDocumentData(response?.data, "versionNumber");
          setDocUploadHistory(data || []);
        }
        if (response && response?.data?.length === 0) {
          setDocUploadHistory([]);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };
  useEffect(() => {
    if (mandateId?.id !== undefined) {
      getVersionHistoryData();
    }
  }, [mandateId?.id]);

  const handleFileEvent = (e) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    if (_validationMaxFileSizeUpload(e, dispatch)) {
      handleUploadFiles(e, chosenFiles);
    }
  };

  const defineStatusOfUploadByUser = useCallback(
    (user) => {
      var status = false;
      if (docType?.documentName === "Additional Document") {
        return false;
      } else if (
        user?.role === "Compliance Associate" &&
        docType?.documentName !== "RBI Intimation"
      ) {
        return true;
      } else if (
        user?.role === "Compliance Associate" &&
        docType?.documentName === "RBI Intimation"
      ) {
        return false;
      } else if (
        user?.role === "Sourcing Associate" &&
        docType?.documentName === "LOA"
      ) {
        return true;
      } else if (
        user?.role === "Sourcing Associate" &&
        docType?.documentName !== "LOA"
      ) {
        return false;
      } else if (
        user?.role === "Legal Associate" &&
        docType?.documentName === "LOA"
      ) {
        return false;
      } else if (
        user?.role === "Legal Associate" &&
        docType?.documentName !== "LOA"
      ) {
        return true;
      }

      return false;
    },
    [user, docType, setDocType]
  );

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

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
      maxWidth: 80,

      cellStyle: { fontSize: "13px" },
    },
    {
      field: "vendor_name",
      headerName: "Vendor Name",
      headerTooltip: "Vendor Name",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "vendor_category",
      headerName: "Vendor Category",
      headerTooltip: "Vendor Category",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "po_number",
      headerName: "PO Number",
      headerTooltip: "PO Number",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      headerTooltip: "Created Date",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        return moment(e?.data?.createdDate).format("DD/MM/YYYY");
      },
      width: 150,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "createdBy",
      headerName: "Created By",
      headerTooltip: "Created By",
      sortable: true,
      resizable: true,
      width: 190,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
  ];

  const getHeightForTable = useCallback(() => {
    var height = 0;
    var dataLength = (docUploadHistory && docUploadHistory?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 57;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [docUploadHistory, docType]);
  const getHeightForProjectPlan = useCallback(() => {
    var height = 0;
    var dataLength = (projectPlanData && projectPlanData?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 56;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [projectPlanData, docType]);

  return (
    <>
      <div className="invoicing">
        <Box component="h2" className="page-title-heading my-6">
          Invoicing
        </Box>

        <div
          style={{
            backgroundColor: "#fff",
            padding: "0px",
            border: "1px solid #0000001f",
            borderRadius: "5px",
          }}
          className="card-panal inside-scroll-194-invoicing"
        >
          <div style={{ padding: "10px" }}>
            <MandateInfo
              mandateCode={mandateId}
              setMandateData={setMandateData}
              source=""
              pageType=""
              redirectSource={"list" || `${params?.source}`}
              setMandateCode={setMandateId}
              setCurrentStatus={setCurrentStatus}
              setCurrentRemark={setCurrentRemark}
              setpincode={() => {}}
            />
          </div>
          <div className="phase-outer" style={{ paddingLeft: "10px" }}>
            <Grid
              marginBottom="2px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Vendor Category</h2>

                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    sx={
                      user?.role === "Vendor" && {
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }
                    }
                    getOptionLabel={(option) => {
                      return option?.vendorcategory?.toString() || "";
                    }}
                    disabled={user?.role === "Vendor"}
                    disableClearable
                    options={vendorCatInformation || []}
                    placeholder="Vendor Category"
                    onChange={(e, value: any) => {
                      setVendor((state) => ({
                        ...state,
                        vendorname: value?.vendorname || "",
                        vendorId: value?.id || 0,
                        id: value?.id || 0,
                        vendorcategory: value?.vendorcategory || "",
                      }));
                      handelCategoryChange(e, value);
                    }}
                    value={vendor || null}
                    renderInput={(params) => (
                      <TextField
                        name="vendor_category"
                        id="vendor_category"
                        {...params}
                        InputProps={{
                          ...params.InputProps,
                          style: { height: `35 !important` },
                        }}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Vendor Name</h2>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    sx={
                      user?.role === "Vendor" &&
                      vendorInformation &&
                      vendorInformation?.length === 1 && {
                        backgroundColor: "#f3f3f3",
                        borderRadius: "6px",
                      }
                    }
                    disabled={
                      user?.role === "Vendor" &&
                      vendorInformation &&
                      vendorInformation?.length === 1
                    }
                    getOptionLabel={(option) => {
                      return option?.vendorname?.toString() || "";
                    }}
                    disableClearable
                    options={vendorInformation || []}
                    onChange={(e, value: any) => {
                      setVendor((state) => ({
                        ...state,
                        vendorname: value?.vendorname || "",
                        vendorId: value?.id || 0,
                        id: value?.id || 0,
                        vendorcategory: value?.vendorcategory || "",
                      }));
                    }}
                    value={
                      user?.role === "Vendor" &&
                      vendorInformation &&
                      vendorInformation?.length === 1
                        ? vendorInformation?.[0]
                        : vendor || null
                    }
                    placeholder="Vendor Name"
                    renderInput={(params) => (
                      <TextField
                        name="vendor_name"
                        id="vendor_name"
                        {...params}
                        InputProps={{
                          ...params.InputProps,
                          style: { height: `35 !important` },
                        }}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  />
                </div>
              </Grid>
            </Grid>
          </div>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={handleChange}
                aria-label="lab API tabs example"
              >
                <Tab
                  label="Invoice"
                  value="1"
                  to={`/mandate/${id}/invoicing`}
                  component={Link}
                />
                <Tab
                  label="PO"
                  value="2"
                  to={`/mandate/${id}/quality-po`}
                  component={Link}
                />
                <Tab
                  label="NDC"
                  value="3"
                  to={`/mandate/${id}/ndc`}
                  component={Link}
                />
                <Tab
                  label="PENALTY CALCULATION"
                  value="4"
                  to={`/mandate/${id}/penalty-calculation`}
                  component={Link}
                />
              </TabList>
            </Box>
          </TabContext>
          <div style={{ padding: "10px", paddingTop: "0px" }}>
           
            <div style={{ marginTop: "10px" }}>
              {tableData && tableData?.length > 0 && (
                <PoTable
                  getData={() => {
                    getData();
                  }}
                  formData={formData}
                  setFormData={setFormData}
                  mandateId={mandateId}
                  data={tableData}
                  setTableData={setTableData}
                  editrow={() => {}}
                  deleterow={() => {}}
                />
              )}
            </div>
          </div>
          {mandateId && mandateId?.id && mandateId?.id !== undefined && (
            <div className="bottom-fix-history">
              <MandateStatusHistory
                mandateCode={mandateId?.id}
                accept_Reject_Remark={currentRemark}
                accept_Reject_Status={currentStatus}
              />
            </div>
          )}
        </div>
       
      </div>
    </>
  );
};

export default PO;
