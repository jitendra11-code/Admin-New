import axios from "axios";
import React, {
  useState
  } from "react";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch } from "react-redux";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import { AgGridReact } from "ag-grid-react";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { _validationMaxFileSizeUpload } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import { Tooltip } from "@mui/material";
declare global {
  interface Navigator {
    msSaveBlob?: (blob: any, defaultName?: string) => boolean;
  }
}

const MAX_COUNT = 8;
const FileUploadAction = ({ mandateId, index, params }) => {
  const dispatch = useDispatch();
  const fileInput = React.useRef(null);
  const { user } = useAuthUser();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileLimit, setFileLimit] = useState(false);
  const [fileLength, setFileLength] = useState(0);
  const gridRef = React.useRef<AgGridReact>(null);
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
    const form: any = new FormData();
    form.append("mandate_id", mandateId?.id || 0);
    form.append("documenttype", "BOQ Verification");
    form.append("CreatedBy", user?.UserName || "");
    form.append("ModifiedBy", user?.UserName || "");
    form.append("entityname", "BOQ Verification");
    form.append("RecordId", params?.data?.id || 0);
    form.append("remarks", params?.pM_remarks || "");

    for (var key in uploaded) {
      await form.append("file", uploaded[key]);
    }

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
          form
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
            return;
          } else if (response?.status === 200) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(showMessage("Documents are uploaded successfully!"));
          }
        })
        .catch((e: any) => {
          e.target.value = null;
          dispatch(fetchError("Error Occurred !"));
        });
    }
  };

  const handleFileEvent = (e) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    if (_validationMaxFileSizeUpload(e, dispatch)) {
      handleUploadFiles(e, chosenFiles);
    }
  };
  return (
    <>
      <Tooltip
        className="actionsIcons"
        title="Upload Photos"
      >
        <AddPhotoAlternateOutlinedIcon
          style={{ cursor: "pointer", fontSize: "20px", color: "#000" }}
          onClick={() => {
            if (mandateId && mandateId?.id === undefined) {
              dispatch(fetchError("Please select Mandate !!!"));
              return;
            }
            fileInput.current.click();
          }}
          fontSize="medium"
        />
      </Tooltip>
      <input
        ref={fileInput}
        multiple
        onChange={(e) => handleFileEvent(e)}
        disabled={fileLimit}
        accept="image/*"
        type="file"
        style={{ display: "none" }}
      />
    </>
  );
};
export default FileUploadAction;
