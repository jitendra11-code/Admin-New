import axios from 'axios';
import React, { useState } from "react";
import { fetchError, showMessage } from 'redux/actions';
import { useDispatch } from 'react-redux';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined'
import { AgGridReact } from 'ag-grid-react';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import { _validationMaxFileSizeUpload } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import { Tooltip } from '@mui/material';
declare global {
    interface Navigator {
        msSaveBlob?: (blob: any, defaultName?: string) => boolean;
    }
}

const MAX_COUNT = 8;
const FileUploadAction = ({ params }) => {
    const dispatch = useDispatch()
    const fileInput = React.useRef(null);
    const { user } = useAuthUser();
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [fileLimit, setFileLimit] = useState(false);
    const gridRef = React.useRef<AgGridReact>(null);
    const handleUploadFiles = async (e, files, params) => {
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
                        e.target.value=null;
                        return;
                    }
                }
            });
        if (limitExceeded) {
            dispatch(
                fetchError(`You can only add a maximum of ${MAX_COUNT} files` || "")
            );
            e.target.value=null;
            return;
        }

        if (!limitExceeded) setUploadedFiles(uploaded);
        const formData: any = new FormData();
        formData.append("mandate_id", params?.data?.mandateId);
        formData.append("documenttype", "Staff Documents");
        formData.append("CreatedBy", user?.UserName || "");
        formData.append("ModifiedBy", user?.UserName || "");
        formData.append("entityname", "Staff Documents");
        formData.append("RecordId", params?.data?.id || 0);

        for (var key in uploaded) {
            await formData.append("file", uploaded[key]);
        }

        if (uploaded?.length === 0) {
            setUploadedFiles([]);
            setFileLimit(false);
            e.target.value = null;
            dispatch(fetchError("Error Occurred !"));
            return;
        }

        if (params?.mandate?.id !== undefined) {
            axios
                .post(
                    `${process.env.REACT_APP_BASEURL}/api/ImageStorage/FileUpload`,
                    formData
                )
                .then((response: any) => {
                    if (!response) {
                        setUploadedFiles([]);
                        setFileLimit(false);
                        dispatch(fetchError("Error Occurred !"));
                        return;
                    }
                    if(response?.data?.data == null) {
                        setUploadedFiles([]);
                        setFileLimit(false);
                        dispatch(fetchError("Documents are not uploaded!"));
                        return;
                      }else if (response?.status === 200) {
                        setUploadedFiles([]);
                        setFileLimit(false);
                        dispatch(showMessage("Documents are uploaded successfully!"));
                    }
                    e.target.value = null;
                })
                .catch((err: any) => {
                    e.target.value = null;
                    dispatch(fetchError("Error Occurred !"));
                });
        }
    };

    const handleFileEvent = (e, params) => {
        const chosenFiles = Array.prototype.slice.call(e.target.files);
        if (_validationMaxFileSizeUpload(e, dispatch)) {
            handleUploadFiles(e, chosenFiles, params);
        }
    };

    return (<> <Tooltip
        id={`${params?.data?.id}_tooltipid`}
        className='actionsIcons'
        title="Upload Photos">
        <AddPhotoAlternateOutlinedIcon
            style={{ cursor: 'pointer', fontSize: '20px', color: '#000' }}
            onClick={() => {
                if (params?.data?.planId !== 0)
                    if (params?.mandate?.id === undefined) {
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
            onChange={(e) => handleFileEvent(e, params)}
            disabled={fileLimit}
            accept="image/*"
            type="file"
            style={{ display: "none" }}
        />
    </>
    )
}
export default FileUploadAction
