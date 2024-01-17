import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { fetchError, showMessage, showWarning } from 'redux/actions';
import { useDispatch } from 'react-redux';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
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
const FileUploadAction = ({ assetCode, params, id, transportVendor, installationVendor, setTransportVendor, setInstallationVendor, submitAllVendor, upload, setUpload, docType}) => {
    const dispatch = useDispatch();
    const fileInput = React.useRef(null);
    const { user } = useAuthUser();
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [fileLimit, setFileLimit] = useState(false);
    const [fileLength, setFileLength] = useState(0);
    const [flag, setFlag] = useState(false);
    const gridRef = React.useRef<AgGridReact>(null);
    // const updateFileUploadFlag = (data) => {
    //     axios
    //         .post(`${process.env.REACT_APP_BASEURL}/api/PODetails/UpdatePODetails`, data)
    //         .then((response) => {
    //             if (!response) return;
    //             if (response && response?.status === 200) {
    //                 getData();
    //             }
    //         })
    //         .catch((err) => {});
    // };
    useEffect(() => {
        console.log('useEffect', upload);
        if (params?.data?.id !== 0 && upload) {
            submitAllVendor(true);
            setUpload(false);
        }
    }, [transportVendor, installationVendor]);
    const handleUploadFiles = async (e, files, recId) => {
        const uploaded = [...uploadedFiles];
        let limitExceeded = false;
        files &&
            files?.some((file) => {
                if (uploaded && uploaded?.findIndex((f) => f.name === file.name) === -1) {
                    uploaded.push(file);
                    if (uploaded?.length === MAX_COUNT) setFileLimit(true);
                    if (uploaded?.length > MAX_COUNT) {
                        dispatch(fetchError(`You can only add a maximum of ${MAX_COUNT} files` || ''));
                        setFileLimit(false);
                        limitExceeded = true;
                        return;
                    }
                }
            });

        if (limitExceeded) {
            dispatch(fetchError(`You can only add a maximum of ${MAX_COUNT} files` || ''));

            return;
        }
        if (!limitExceeded) setUploadedFiles(uploaded);
        setFileLength((uploaded && uploaded?.length) || 0);
        const formData: any = new FormData();
        formData.append('assetcode', assetCode?.requestNo || 0);
        formData.append('documenttype', 'Asset Quotation');
        formData.append('CreatedBy', user?.UserName || '');
        formData.append('ModifiedBy', user?.UserName || '');
        formData.append('entityname', params?.data?.vendorCategory);
        formData.append('RecordId', recId || 0);
        formData.append('remarks', '');
        for (var key in uploaded) {
            await formData.append('file', uploaded[key]);
        }

        if (uploaded?.length === 0) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError('Error Occurred !'));
            return;
        }
        if (formData) {
            dispatch(showWarning('Upload is in progress, please check after sometime'));

            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/imagestorage/FileUploadForAssetPool`, formData)
                .then((response: any) => {
                    e.target.value = null;
                    if (!response) {
                        setUploadedFiles([]);
                        setFileLimit(false);
                        dispatch(fetchError('Error Occurred !'));
                        return;
                    }
                    if (response?.data?.data == null) {
                        setUploadedFiles([]);
                        setFileLimit(false);
                        dispatch(fetchError('Documents are not uploaded!'));
                        // getVersionHistoryData();
                        return;
                    } else if (response?.status === 200) {
                        if (params != null) {
                            if (params?.data?.vendorCategory == 'Transport Vendor') {
                                const index = params?.rowIndex;
                                const trans = [...transportVendor];
                                if (params?.data?.id !== 0) {
                                    trans[index] = { ...trans[index], record_Id: recId, isEdit: true };
                                    setTransportVendor(trans);
                                    setUpload(true);
                                } else {
                                    trans[index] = { ...trans[index], record_Id: recId };
                                    setTransportVendor(trans);
                                }
                                // setTransportVendor(trans);
                                // if (params?.data?.id != 0) {
                                //     setFlag(true);
                                // }
                            } else if (params?.data?.vendorCategory == 'Installation Vendor') {
                                const index = params?.rowIndex;
                                const install = [...installationVendor];
                                if (params?.data?.id !== 0) {
                                    install[index] = { ...install[index], record_Id: recId, isEdit: true };
                                    setInstallationVendor(install);
                                    setUpload(true);
                                } else {
                                    install[index] = { ...install[index], record_Id: recId };
                                    console.log('inside upload', params, install);
                                    setInstallationVendor(install);
                                }
                                // setInstallationVendor(install);
                                // if (params?.data?.id != 0) {
                                //     setFlag(true);
                                // }
                            }
                        }
                        console.log('flag33', flag);
                        setUploadedFiles([]);
                        setFileLimit(false);
                        dispatch(showMessage('Documents are uploaded successfully!'));
                        // getVersionHistoryData();
                    }
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
        }
    };
    const handleUploadFilesByGetRecId = (e, files) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Asset/GenerateRecordIdForQotation`)
            .then((response: any) => {
                if (!response) return;
                console.log('recId', response);
                if (response && response?.data && response?.data && response?.status === 200) {
                    var recId = response?.data;
                    handleUploadFiles(e, files, recId);
                } else {
                    e.target.value = null;
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };
    const handleFileEvent = (e) => {
        const chosenFiles = Array.prototype.slice.call(e.target.files);
        if (_validationMaxFileSizeUpload(e, dispatch)) {
            params?.data?.record_Id == null ? handleUploadFilesByGetRecId(e, chosenFiles) : handleUploadFiles(e, chosenFiles, params?.data?.record_Id);
        }
    };
    console.log('$$$', assetCode);
    return (
        <>
            <Tooltip className="actionsIcons" title={'Upload Document'}>
                <AddPhotoAlternateOutlinedIcon
                    style={{ cursor: 'pointer', fontSize: '20px', color: docType == 'Review' ? (params?.data?.id !== 0 ? '#888' : '#000') : '#000' }}
                    onClick={() => {
                        if (docType == 'Review' && params?.data?.id !== 0) {
                            return;
                        }
                        if (id && id === 'noid') {
                            dispatch(fetchError('Please select Request No !!!'));
                            return;
                        }
                        fileInput.current.click();
                    }}
                    fontSize="medium"
                />
            </Tooltip>
            <input ref={fileInput} multiple onChange={(e) => handleFileEvent(e)} disabled={fileLimit} accept="image/*" type="file" style={{ display: 'none' }} />
        </>
    );
};
export default FileUploadAction;
