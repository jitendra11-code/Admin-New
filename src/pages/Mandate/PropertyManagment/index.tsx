import { Box, Grid, IconButton, Stack, alpha } from '@mui/material'
import React, { useState } from "react";
import UploadDocuments from "./Components/UploadFile";
import AppTooltip from '@uikit/core/AppTooltip';
import { AiFillFileExcel } from 'react-icons/ai';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { fetchError, showMessage } from 'redux/actions';

const PropertyManagment = () => {
  const [MandateID, setMID] = React.useState(null);
  const [projectPlanData, setProjectPlanData] = React.useState([])
  const [projectPlanAPIData, setProjectPlanAPIData] = React.useState([])
  const [activityFlg, setActivityFlag] = React.useState(false)
  const dispatch = useDispatch();
  const getActivityCompletedStatus = () => {

    if (projectPlanAPIData && projectPlanAPIData?.length > 0 && projectPlanData && projectPlanData?.length > 0) {
      var status_completed = projectPlanAPIData && projectPlanAPIData?.filter(item => item?.status_percentage && parseInt(item?.status_percentage) === 100);
      if (status_completed?.length === 0) {
        setActivityFlag(false)
      }
      if (status_completed?.length === projectPlanAPIData?.length) {
        setActivityFlag(true)

      }
      setActivityFlag(true)
    }

  }

  const handleExportData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ProjectPlan/GetExcelDownloadProjectPlan?mandateId=${MandateID}`
      )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "ProjectPlan.xlsx";
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
              showMessage("Project Plan data downloaded successfully!")
            );
          }
        }
      });
  };


  return (
    <div>
      <Grid
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          component="h2"
          className="page-title-heading my-6"
        >
          Project Plan
        </Box>
        <Stack
          display="flex"
          alignItems="flex-end"
          justifyContent="space-between"
          flexDirection="row"
          sx={{ mb: -2, marginBottom: "5px" }}
        >
          {/* <AppTooltip title="Export Excel">
            <IconButton
              className="icon-btn"
              sx={{
                // borderRadius: "50%",
                // borderTopColor:"green",
                width: 35,
                height: 35,
                // color: (theme) => theme.palette.text.secondary,
                color: "white",
                backgroundColor: "green",
                "&:hover, &:focus": {
                  backgroundColor: "green", // Keep the color green on hover
                },
              }}
              onClick={() => { handleExportData(); }}
              size="large"
            >
              <AiFillFileExcel />
            </IconButton>
          </AppTooltip> */}
        </Stack>
      </Grid>
      <div className="inside-scroll-198-project-plan" style={{ backgroundColor: "#fff", padding: "10px", border: "1px solid #0000001f", borderRadius: "5px" }}>
        <UploadDocuments

          documentType={'Project Plan'}
          setMID={setMID} />
      </div>
    </div>

  )
}

export default PropertyManagment