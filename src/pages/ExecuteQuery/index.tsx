import {
  Box,
  Button,
  Grid,
  IconButton,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import { executeQueryInitialValues, executeQuerySchema } from "@uikit/schemas";
import { fetchError, showMessage } from "redux/actions";
import { primaryButtonSm } from "shared/constants/CustomColor";
import { GridApi } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import excel from "../../assets/icon/excel.png";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import AppTooltip from "@uikit/core/AppTooltip";
import { AiFillFileExcel } from "react-icons/ai";
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';

const ExecuteQuery = () => {
  const gridRef = React.useRef<AgGridReact>(null);
  const [queryDataList, setQueryDataList] = React.useState<any>([])
  const [flag, setFlag]=React.useState(false)
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const dispatch = useDispatch();

  const {
    values,
    handleBlur,
    setFieldValue,
    handleChange,
    handleSubmit,
    errors,
    touched,
    resetForm,
  } = useFormik({
    initialValues: executeQueryInitialValues,
    validationSchema: executeQuerySchema,
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: (values, action) => {
      setQueryDataList([]);
      var query = values ?.query;
      const formData: any = new FormData();
      formData.append("query", query);

      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/Reports/ExecuteQuery`,
          formData
        )
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Error Occurred !"));
            return;
          }

          if (response ?.data ?.data) {
            if (response ?.data ?.data === "Executed Successfully") {
              dispatch(showMessage("Query Executed Successfully"));
            } else {
              setQueryDataList(JSON.parse(response ?.data ?.data));;
              dispatch(showMessage("Query Executed Successfully with data"));
            }
          }

        })
        .catch((e: any) => {
          dispatch(fetchError("Error Occurred !"));
        });
    },
  });

  const handleDownlodSubmit = async () =>   {
    var query = values ?.query
    const formData: any = new FormData();
      formData.append("query", query);
      formData.append("Download",true);
    axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/Reports/ExecuteQuery`,
          formData
        )
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          console.log('res111',response)
          if (response?.data?.code == 200) {
            var filename = "ExcuteQuery.xlsx";
            console.log('res',response)
          const binaryStr = atob(response?.data?.data);
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

            // Fixes "webkit blob resource error 1"
            setTimeout(function () {
              document.body.removeChild(tempLink);
              window.URL.revokeObjectURL(blobURL);
            }, 200);

            
          }
          dispatch(showMessage("Downloaded Successfully!!")); 
          }

        })
        .catch((e: any) => {
          dispatch(fetchError("Error Occurred !"));
        });
    
  }

  const getDynamicColumn = (obj) => {
    if (obj != null)
      return Object.keys(obj).map(key => ({ field: key }))
  }

  function onGridReady(params) {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    params.api.setColumnDefs(getDynamicColumn(queryDataList ?.[0]))
  }

  return (
    <>
      <div>
        <Box component="h2" className="page-title-heading my-6">
          Execute Query
      </Box>

        <div
          className="card-panal"
          style={{
            border: "1px solid rgba(0, 0, 0, 0.12)",
            height: "83vh",
            padding: "10px",
          }}
        >
          <form>
            <div className="phase-outer">
              <Grid
                marginBottom="30px"
                container
                item
                spacing={5}
                justifyContent="start"
                alignSelf="center"
              >


                <Grid item xs={11} md={11} sx={{ position: "relative" }}>
                  <div className="input-form">
                    <h2 className="phaseLable required">Query</h2>
                    <TextField
                      name="query"
                      id="query"
                      variant="outlined"
                      className="w-85"
                      multiline
                      value={values.query}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.query && errors.query ? (
                      <p className="form-error">{errors.query}</p>
                    ) : null}
                  </div>
                </Grid>

                <Grid item xs={0.5} md={0.5} sx={{ position: "relative" }}>
                  {/* <Button
                    style={primaryButtonSm}
                    sx={{ marginTop: "20px" }}
                    onClick={() => handleSubmit()}
                  > */}
                <AppTooltip title="Execute Query">
                  <IconButton
                    className="icon-btn"
                    sx={{
                      // borderRadius: "50%",
                      // borderTopColor:"green",
                      width: 35,
                      height: 35,
                      marginTop: "20px",
                      // color: (theme) => theme.palette.text.secondary,
                      color: "white",
                      backgroundColor: "green",
                      "&:hover, &:focus": {
                        backgroundColor: "green", // Keep the color green on hover
                      },                  
                    }}
                    onClick={() => {handleSubmit();}}
                    size="large"
                  >
                    <PlayArrowOutlinedIcon />
                  </IconButton>
                </AppTooltip>
                  
               {/* </Button> */}
               </Grid>
               <Grid item xs={0.5} md={0.5} sx={{ position: "relative" }}>
               <AppTooltip title="Export Excel">
                  <IconButton
                    className="icon-btn"
                    sx={{
                      // borderRadius: "50%",
                      // borderTopColor:"green",
                      width: 35,
                      height: 35,
                      marginTop: "20px",
                      // color: (theme) => theme.palette.text.secondary,
                      color: "white",
                      backgroundColor: "green",
                      "&:hover, &:focus": {
                        backgroundColor: "green", // Keep the color green on hover
                      },                  
                    }}
                    onClick={() => {handleDownlodSubmit();}}
                    size="large"
                  >
                    <AiFillFileExcel />
                  </IconButton>
                </AppTooltip>
               {/* <Button
                    variant="outlined"
                    size="medium"
                    sx={{ marginTop: "20px" }}
                    style={{
                      marginLeft: 10,
                      fontSize: 12,
                      padding: "2px 20px",
                      borderRadius: 6,
                      color: "#00316a",
                      borderColor: "#00316a",
                    }}
                    onClick={() => handleDownlodSubmit()}
                  >
                    <img src={excel} alt="" className="icon-size" /> Download
                  </Button> */}
                </Grid>
              </Grid>
            </div>

          </form>
          {queryDataList && queryDataList ?.length > 0 && (
            <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
              <AgGridReact
                defaultColDef={{ flex: 1, resizable: true, width: 150, minWidth: 150, sortable: true }}
                rowData={queryDataList || []}
                onGridReady={onGridReady}
                pagination={false}
                paginationPageSize={10}
              />
            </div>)}
        </div>

      </div>


    </>
  );
};

export default ExecuteQuery;
