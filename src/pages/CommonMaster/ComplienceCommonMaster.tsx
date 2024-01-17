import React, { useEffect, useMemo, useState } from 'react';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { Stack, Grid, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, TextField, Autocomplete, Select, MenuItem, InputAdornment, IconButton } from '@mui/material';
import { primaryButtonSm } from 'shared/constants/CustomColor';
import { AgGridReact } from 'ag-grid-react';
import { GridApi } from 'ag-grid-community';
import { TbPencil } from 'react-icons/tb';
import axios from 'axios';
import moment from 'moment';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import regExpressionTextField, { textFieldValidationOnPaste } from '@uikit/common/RegExpValidation/regForTextField';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import { fetchError, showMessage } from 'redux/actions';
import { useDispatch } from 'react-redux';
import SearchIcon from '@mui/icons-material/Search';
import AppTooltip from '@uikit/core/AppTooltip';
import { AiFillFileExcel } from 'react-icons/ai';

function ComplianceCommonMaster() {
    const [open, setOpen] = React.useState(false);
    const gridRef = React.useRef<AgGridReact>(null);
    const gridRef2 = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
    const [gridApi2, setGridApi2] = React.useState<GridApi | null>(null);
    const [MasterName, setMasterName] = useState([]);
    const [masterCategoryDropdown, setMasterCategoryDropdown] = useState([]);
    const [parentDropdown, setParentDropdown] = useState([]);
    const [parentSelected, setParentSelected] = useState([]);
    const [parentCategoryDropdown, setParentCategoryDropdown] = useState([]);
    const [selectedParentCategory, setSelectedParentCategory] = useState('');
    const [masterCategoryValidation, setMasterCategoryValidation] = useState(null);
    const [RightMasterData, setRightMasterData] = useState([]);
    const [selectedLeftsideData, setSelectedLeftsideData] = useState<any>({});
    const [editFlag, setEditFlag] = useState(false);
    const [EditMaster, setEditMaster] = useState<any>({});
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedActiveRows, setSelectedActiveRows] = useState([]);
    const [selectedInActiveRows, setSelectedInActiveRows] = useState([]);
    const [parentNameId, setParentNameId] = useState(null);
    const [selectedPendingRows, setSelectedPendingRows] = useState([]);
    const [flag, setFlag] = useState(false);
    const { user } = useAuthUser();
    const dispatch = useDispatch();

    const styling = {
        marginTop: '5px',
        marginBottom: '5px',
    };

    const handleClickOpen = () => {
        setOpen(true);
        setParentDropdown([])
        // setMasterCategoryValidation(EditMaster?.mastercategory);
        setMasterCategoryValidation(selectedLeftsideData?.mastercategory);
        setFieldValue('mastercategory', selectedLeftsideData?.mastercategory);
        setFieldValue('parentMasterCategory', '');
        setSelectedParentCategory('');
    };

    const handleChangeCategory = (event) => {
        const selectedId = event.target.value;
        const selectedParentCategoryObj = parentCategoryDropdown?.find((v) => v?.id === selectedId);
        setFieldValue('parentMasterCategory', event.target.value, true);

        if (selectedParentCategoryObj) {
            setSelectedParentCategory(selectedParentCategoryObj?.mastercategory);
        } else {
            setSelectedParentCategory('');
        }
    };

    const handleClose = () => {
        setOpen(false);
        setTimeout(()=>{
            editFlag ? setEditFlag(false) : setEditFlag(false);
            setParentDropdown([]);
            resetForm();
        },100)
    };

    function onGridReady(params) {
        gridRef.current!.api.sizeColumnsToFit();
        setGridApi(params.api);
    }
    function onGridReady2(params) {
        gridRef.current!.api.sizeColumnsToFit();
        setGridApi(params.api);
    }

    const onFilterTextChange = async (e) => {
        gridApi?.setQuickFilter(e.target.value);
        if (gridApi.getDisplayedRowCount() == 0) {
            dispatch(fetchError('Data not found!'));
        }
    };

    const handleRowSelected = () => {
        // debugger
        if (gridRef2.current && gridRef2.current.api) {
            const selectedNodes = gridRef2.current.api.getSelectedNodes();
            const selectedData = selectedNodes.map((node) => node.data);

            // Check if all selected rows have the same status as 'Active'
            const firstStatus = selectedData.length > 0 ? selectedData[0].status : null;
            const allHaveSameStatus = selectedData.every((item) => item.status === firstStatus);

            if (allHaveSameStatus && firstStatus === 'Active') {
                setSelectedRows(selectedData);
                setSelectedActiveRows(selectedData);
            } else if (allHaveSameStatus && firstStatus === 'In Active') {
                setSelectedRows(selectedData);
                setSelectedInActiveRows(selectedData);
            } else if (allHaveSameStatus && firstStatus === 'Pending') {
                setSelectedRows(selectedData);
                setSelectedPendingRows(selectedData);
            } else if (selectedData.length > 0) {
                // User selected rows with different statuses, show error message and deselect all rows
                dispatch(fetchError('You can only select rows with the same status.'));
                gridRef2.current.api.deselectAll();
                setSelectedInActiveRows([]);
                setSelectedActiveRows([]);
                setSelectedPendingRows([]);
            } else {
                // All rows are deselected, reset everything
                setSelectedRows([]);
                setSelectedActiveRows([]);
                setSelectedInActiveRows([]);
                setSelectedPendingRows([]);
            }
        }
    };

    useEffect(() => {
        // console.log('Selected Rows:', selectedRows);
    }, [selectedRows]);

    const handleStatusChange = async (buttonName) => {
        if (gridRef2.current && gridRef2.current.api) {
            const selectedNodes = gridRef2.current.api.getSelectedNodes();
            const selectedData = selectedNodes.map((node) => ({
                ...node.data,
                // status: "In Active",
                status: buttonName,
            }));
            // const requestBody = {
            //   model: selectedData
            // };
            // console.log('selectedData1', selectedData);
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/UpdateComplianceCommonMasterList`, selectedData)
                .then((response: any) => {
                    if (!response) {
                        dispatch(fetchError('Compliance Masters Status not updated'));
                        return;
                    }
                    if (response && response?.data?.code === 200 && response?.data?.status === true) {
                        setRightMasterData((prevData) =>
                            prevData.map((item) => {
                                const updatedItem = selectedData.find((selectedItem) => selectedItem.id === item.id);
                                return updatedItem || item;
                            }),
                        );
                        dispatch(showMessage('Compliance Masters Status updated successfully'));
                        gridApi.deselectAll();
                        return;
                    } else {
                        dispatch(fetchError('Compliance Masters Status already exists'));
                        return;
                    }
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
        }
    };

    // Call this function when the "Active" button is clicked
    const handleActive = () => {
        setFlag(true);
        handleStatusChange('Active');
    };

    // Call this function when the "In Active" button is clicked
    const handleInactive = () => {
        setFlag(true);
        handleStatusChange('In Active');
    };

    // const getMasterName = async () => {
    //   await axios
    //     .get(
    //       `${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetComplianceCommonMaster?parentId=&mastercategory=`
    //     )
    //     .then((response: any) => {
    //       const distinctData = Array.from(
    //         new Map(
    //           response?.data.map((item: any) => [item.mastercategory, item])
    //         ).values()
    //       );
    //       setMasterName(distinctData || []);
    //       showRightData(distinctData?.[0] || []);
    //     })
    //     .catch((e: any) => {});
    // };

    const getMasterName = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetComplianceCommonMaster?parentId=&mastercategory=`);
            const distinctMap = new Map();
            response.data.forEach((item) => {
                distinctMap.set(item.mastercategory, item);
            });

            const distinctData = Array.from(distinctMap.values()).sort((a, b) => a.createdOn.localeCompare(b.createdOn));

            setMasterName(distinctData || []);
            showRightData(distinctData?.[0] || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getMasterName();
    }, []);

    const getParentCategoryName = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetComplianceCommonMastersByCategory?mastersCategory=${selectedLeftsideData?.mastercategory}`)
            .then((response: any) => {
                const distinctData1 = Array.from(new Map(response?.data.map((item: any) => [item.mastercategory, item])).values());
                console.log('getParentCategoryName', distinctData1);
                setParentCategoryDropdown(distinctData1 || []);
                const id = (distinctData1 as { id?: number }[])[0]?.id || 0;
                setFieldValue('parentMasterCategory', id);
                // setFieldValue('parentCategoryDropdown', distinctData1?.[0]?.id);
            })
            .catch((e: any) => {});
    };

    useEffect(() => {
        getParentCategoryName();
    }, [selectedLeftsideData?.mastercategory, editFlag]);

    const getParentName = async (category) => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetComplianceCommonMaster?mastercategory=${category}`)
            .then((response: any) => {
                const distinctData = Array.from(new Map(response?.data.map((item: any) => [item.masterName, item])).values());

                const arr = [...distinctData];
                const Id = (arr as { id?: number }[]).find((item) => item?.id === EditMaster?.fk_ParentMaster_Id);
                console.log('getParentName', distinctData, Id);
                setParentNameId(Id);
                setParentDropdown(distinctData || []);
                // setFieldValue('masterName', );
                // setParentCategoryDropdown(response?.data || [])
            })
            .catch((e: any) => {});
    };
    useEffect(() => {
        if (parentCategoryDropdown.length > 0) {
            getParentName(parentCategoryDropdown?.[0]?.mastercategory);
        }
    }, [parentCategoryDropdown]);
    useEffect(() => {
        if (selectedParentCategory.length > 0) {
            getParentName(selectedParentCategory);
        }
    }, [selectedParentCategory]);

    useEffect(() => {
        if (gridRef.current && gridRef.current!.api) {
            gridRef.current.api.forEachNode((node, index) => {
                if (index === 0) {
                    node.setSelected(true);
                }
            });
        }
    }, [MasterName]);

    useEffect(() => {
        if (editFlag) {
            setFieldValue('mastercategory', EditMaster?.mastercategory);
            setFieldValue('masterName', EditMaster?.masterName);
            setFieldValue('parentMaster', EditMaster?.parentMaster);
            setMasterCategoryValidation(EditMaster?.mastercategory);
        }
    }, [setEditMaster, editFlag, selectedParentCategory]);
    let columnDefs = [
        {
            field: 'mastercategory',
            headerName: 'Master Category',
            headerTooltip: 'Master Category',

            sortable: true,
            resizable: true,
            width: 279,
            cellStyle: { fontSize: '13px' },
        },
    ];

    let columnDefs2 = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            field: 'Action',
            headerName: 'Actions',
            headerTooltip: 'Actions',
            sortable: false,
            resizable: false,
            pinned: 'left',
            cellRenderer: (params: any) => (
                <>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginRight: '10px',
                        }}
                        className="actions"
                    >
                        <Tooltip title="Edit" className="actionsIcons">
                            <button className="actionsIcons actionsIconsSize">
                                <TbPencil
                                    onClick={() => {
                                        console.log('params', params);
                                        setEditMaster(params?.data);
                                        setSelectedParentCategory('');
                                        setEditFlag(true);
                                        setTimeout(() => {
                                            setOpen(true);
                                        }, 500);
                                        // setOpen(true);
                                    }}
                                />
                            </button>
                        </Tooltip>
                    </div>
                </>
            ),
            width: 120,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'mastercategory',
            headerName: 'Master Category',
            headerTooltip: 'Master Category',

            sortable: true,
            resizable: true,
            width: 200,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'masterName',
            headerName: 'Name',
            headerTooltip: 'Name',

            sortable: true,
            resizable: true,
            width: 200,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'parentMaster',
            headerName: 'Parent Name',
            headerTooltip: 'Parent Name',

            sortable: true,
            resizable: true,
            width: 200,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'status',
            headerName: 'Status',
            headerTooltip: 'Status',

            sortable: true,
            resizable: true,
            width: 150,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdBy',
            headerName: 'Created By',
            headerTooltip: 'Created By',

            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdOn',
            headerName: 'Created Date',
            headerTooltip: 'Created Date',

            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                return moment(e?.data?.createdOn).format('DD/MM/YYYY');
            },
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'updatedBy',
            headerName: 'Modified By',
            headerTooltip: 'Modified By',

            sortable: true,
            resizable: true,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'updatedOn',
            headerName: 'Modified Date',
            headerTooltip: 'Modified Date',

            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                return moment(e?.data?.updatedOn).format('DD/MM/YYYY');
            },
            cellStyle: { fontSize: '13px' },
        },
    ];

    const validateSchema = Yup.object({
        masterName: Yup.string().required('Please enter Master Name'),
        mastercategory: Yup.string().required('Please enter Master Category Name'),
        parentMaster: masterCategoryValidation === 'Notice Category' || masterCategoryValidation === 'Notice Sub Type' ? Yup.string().required('Please enter Parent Name') : null,
        parentMasterCategory: masterCategoryValidation === 'Notice Category' || masterCategoryValidation === 'Notice Sub Type' ? Yup.string().required('Please enter Parent Master Category') : null,
    });

    const { values, handleBlur, setFieldValue, handleChange, handleSubmit, errors, touched, resetForm } = useFormik({
        initialValues: {
            mastercategory: '',
            masterName: '',
            parentMaster: '',
            parentMasterCategory: '',
        },
        validationSchema: validateSchema,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: (values, action) => {
            const body = {
                masterName: values?.masterName || '',
                mastercategory: values?.mastercategory || '',
                parentMaster: values?.parentMaster || '',
                fk_ParentMaster_Id: parentSelected?.[0]?.id || 0,
                status: editFlag ? EditMaster.status : 'Active',
                createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS' || ''),
                createdBy: user?.UserName || 'Admin',
                updatedOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                updatedBy: user?.userName || 'Admin',
                id: editFlag ? EditMaster.id : 0,
                uid: '',
            };
            // console.log('submitting form with data:', JSON.stringify(values), body);

            if (editFlag) {
                axios
                    .post(`${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/InsertUpdateComplianceCommonMaster`, body)
                    .then((response: any) => {
                        if (!response) {
                            dispatch(fetchError('Compliance Masters details not updated'));
                            setOpen(false);
                            setParentDropdown([]);
                            return;
                        }
                        if (response && response?.data?.code === 200 && response?.data?.status === true) {
                            dispatch(showMessage('Compliance Masters details updated successfully'));
                            setOpen(false);
                            showRightData(body);
                            setParentDropdown([]);
                            return;
                        } else {
                            dispatch(fetchError('Compliance Masters details already exists'));
                            setOpen(false);
                            setParentDropdown([]);
                            return;
                        }
                    })
                    .catch((e: any) => {
                        setOpen(false);
                        dispatch(fetchError('Error Occurred !'));
                        setParentDropdown([]);
                    });
            } else {
                axios
                    .post(`${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/InsertUpdateComplianceCommonMaster`, body)
                    .then((response: any) => {
                        if (!response) {
                            dispatch(fetchError('Compliance Masters details not added'));
                            setOpen(false);
                            setParentDropdown([]);
                            return;
                        }
                        if (response && response?.data?.code === 200 && response?.data?.status === true) {
                            dispatch(showMessage('Compliance Masters details added successfully'));
                            setOpen(false);
                            showRightData(body);
                            setParentDropdown([]);
                            return;
                        } else {
                            dispatch(fetchError('Compliance Masters details already exists'));
                            setOpen(false);
                            setParentDropdown([]);
                            return;
                        }
                    })
                    .catch((e: any) => {
                        setOpen(false);
                        dispatch(fetchError('Error Occurred !'));
                        setParentDropdown([]);
                    });
            }
            setTimeout(()=>{
              editFlag ? setEditFlag(false) : setEditFlag(false);
              action.resetForm();
            },1000);
        },
    });

    const showRightData = async (data: any) => {
        setSelectedLeftsideData(data);
        setSelectedParentCategory('');
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetComplianceCommonMaster?parentId=&mastercategory=${data?.mastercategory}`)
            .then((response: any) => {
                setRightMasterData(response?.data || []);

                const distinctData1 = Array.from(new Map(response?.data.map((item: any) => [item.mastercategory, item])).values());
                setMasterCategoryDropdown(distinctData1 || []);
            })
            .catch((e: any) => {});
    };

    const getTitle = () => {
        if (editFlag) {
            return 'Edit Compliance Masters Details';
        } else {
            return 'Add Compliance Masters Details';
        }
    };

    const selectedParentId = () => {
        setParentSelected(parentDropdown.filter((e) => e?.masterName === values?.parentMaster));
    };
    useEffect(() => {
        selectedParentId();
    }, [values?.parentMaster]);

    const handleExportData = () => {
        axios.get(`${process.env.REACT_APP_BASEURL}/api/ComplianceIntimationRequest/GetExcelReportForComplianceCommonMaster?mastercategory=${selectedLeftsideData?.mastercategory}`).then((response) => {
            if (!response) {
                dispatch(fetchError('Error occurred in Export !!!'));
                return;
            }
            if (response?.data) {
                var filename = 'CommonComplianceMaster.xlsx';
                if (filename && filename === '') {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                const binaryStr = atob(response?.data);
                const byteArray = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                    byteArray[i] = binaryStr.charCodeAt(i);
                }

                var blob = new Blob([byteArray], {
                    type: 'application/octet-stream',
                });
                if (typeof window.navigator.msSaveBlob !== 'undefined') {
                    window.navigator.msSaveBlob(blob, filename);
                } else {
                    var blobURL = window.URL && window.URL.createObjectURL ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
                    var tempLink = document.createElement('a');
                    tempLink.style.display = 'none';
                    tempLink.href = blobURL;
                    tempLink.setAttribute('download', filename);
                    if (typeof tempLink.download === 'undefined') {
                        tempLink.setAttribute('target', '_blank');
                    }

                    document.body.appendChild(tempLink);
                    tempLink.click();

                    setTimeout(function () {
                        document.body.removeChild(tempLink);
                        window.URL.revokeObjectURL(blobURL);
                    }, 200);

                    dispatch(showMessage('Compliance Masters Excel downloaded successfully!'));
                }
            }
        });
    };

    console.log('values', values);
    return (
        <>
            <Grid
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                }}
            >
                <Box component="h2" className="page-title-heading mb-0">
                    Compliance Masters
                </Box>
                {/* <div className="rolem-grid"> */}
                <div className="rolem-grid" style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            marginRight: 5,
                        }}
                    >
                        <Stack display="flex" alignItems="flex-end" justifyContent="space-between" flexDirection="row" sx={{ mb: -2 }}>
                            <TextField
                                size="small"
                                sx={{ marginRight: '10px' }}
                                variant="outlined"
                                name="search"
                                onChange={(e) => onFilterTextChange(e)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Stack>
                    </div>
                    <div
                        style={{
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            marginRight: 5,
                        }}
                    >
                        <Stack display="flex" alignItems="flex-end" justifyContent="space-between" flexDirection="row" sx={{ mb: -2 }}>
                            {selectedInActiveRows.length > 0 && (
                                <Button
                                    size="small"
                                    style={primaryButtonSm}
                                    sx={{
                                        color: '#fff',
                                        fontSize: '12px',
                                        justifyContent: 'flex-end',
                                    }}
                                    // onClick={() => handleStatusChange("Active")}
                                    onClick={handleActive}
                                >
                                    Active
                                </Button>
                            )}
                            {selectedActiveRows.length > 0 && (
                                <Button
                                    size="small"
                                    style={primaryButtonSm}
                                    sx={{
                                        color: '#fff',
                                        fontSize: '12px',
                                        justifyContent: 'flex-end',
                                    }}
                                    // onClick={() => handleStatusChange("In Active")}
                                    onClick={handleInactive}
                                >
                                    In Active
                                </Button>
                            )}
                            <Button size="small" style={primaryButtonSm} sx={{ color: '#fff', fontSize: '12px' }} onClick={handleClickOpen}>
                                Add New
                            </Button>
                            <Dialog open={open} onClose={handleClose} aria-describedby="alert-dialog-slide-description" maxWidth="lg" PaperProps={{ style: { borderRadius: '20px' } }}>
                                <form onSubmit={handleSubmit}>
                                    <DialogTitle id="alert-dialog-title" className="title-model">
                                        {getTitle()}
                                    </DialogTitle>
                                    <DialogContent style={{ width: '450px' }}>
                                        <h2 className="phaseLable required" style={styling}>
                                            Master Category
                                        </h2>
                                        <TextField
                                            disabled
                                            id="mastercategory"
                                            name="mastercategory"
                                            variant="outlined"
                                            size="small"
                                            value={values?.mastercategory || ''}
                                            onBlur={handleBlur}
                                            onKeyDown={(e: any) => {
                                                regExpressionTextField(e);
                                            }}
                                            onPaste={(e: any) => {
                                                textFieldValidationOnPaste(e);
                                            }}
                                            onChange={handleChange}
                                        />
                                        <h2 className="phaseLable required" style={styling}>
                                            Master Name
                                        </h2>
                                        <TextField
                                            id="masterName"
                                            name="masterName"
                                            variant="outlined"
                                            size="small"
                                            value={values?.masterName || ''}
                                            onBlur={handleBlur}
                                            // onKeyDown={(e: any) => {
                                            //     regExpressionTextField(e);
                                            // }}
                                            onKeyDown={(e: any) => {
                                                if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                    e.preventDefault();
                                                }
                                              }}
                                            // disabled={values?.masterName === "Open" || values?.masterName === "Compliance Notice"}
                                            onPaste={(e: any) => {
                                                textFieldValidationOnPaste(e);
                                            }}
                                            onChange={handleChange}
                                        />
                                        {touched.masterName && errors.masterName ? <p className="form-error">{errors.masterName}</p> : null}
                                        {(values?.mastercategory === 'Notice Category' || values?.mastercategory === 'Notice Sub Type') &&
                                            (editFlag ? (
                                                <>
                                                    <h2 className="phaseLable required" style={styling}>
                                                        Parent Master Category
                                                    </h2>
                                                    <Select
                                                        displayEmpty
                                                        inputProps={{ 'aria-label': 'Without label' }}
                                                        size="small"
                                                        className="w-85"
                                                        name="parentMasterCategory"
                                                        id="parentMasterCategory"
                                                        value={!editFlag ? values.parentMasterCategory || 0 : parentCategoryDropdown?.[0]?.id}
                                                        onChange={(e) => {
                                                            handleChangeCategory(e);
                                                        }}
                                                        onBlur={handleBlur}
                                                        //   disabled={editFlag}
                                                        //   sx={
                                                        //     editFlag && {
                                                        //       backgroundColor: "#f3f3f3",
                                                        //       borderRadius: "6px",
                                                        //     }
                                                        //   }
                                                    >
                                                        <MenuItem value="" style={{ display: 'none' }}>
                                                            <em>Select Parent Master Category</em>
                                                        </MenuItem>
                                                        {parentCategoryDropdown?.map((v: any) => (
                                                            <MenuItem value={v?.id}>{v?.mastercategory}</MenuItem>
                                                        ))}
                                                    </Select>
                                                    {touched.parentMasterCategory && errors.parentMasterCategory ? <p className="form-error">{errors.parentMasterCategory}</p> : null}
                                                    <h2 className="phaseLable required" style={styling}>
                                                        Parent Name
                                                    </h2>
                                                    <Select
                                                        displayEmpty
                                                        inputProps={{ 'aria-label': 'Without label' }}
                                                        size="small"
                                                        className="w-85"
                                                        name="parentMaster"
                                                        id="parentMaster"
                                                        value={values.parentMaster != '' ? values.parentMaster : parentNameId?.masterName}
                                                        onChange={(e, v) => {
                                                            handleChange(e);
                                                        }}
                                                        onBlur={handleBlur}
                                                        //   disabled={editFlag}
                                                        //   sx={
                                                        //     editFlag && {
                                                        //       backgroundColor: "#f3f3f3",
                                                        //       borderRadius: "6px",
                                                        //     }
                                                        //   }
                                                    >
                                                        <MenuItem value="" style={{ display: 'none' }}>
                                                            <em>Select Parent</em>
                                                        </MenuItem>
                                                        {parentDropdown?.map((v: any) => (
                                                            <MenuItem value={v?.masterName}>{v?.masterName}</MenuItem>
                                                        ))}
                                                    </Select>
                                                    {touched.parentMaster && errors.parentMaster ? <p className="form-error">{errors.parentMaster}</p> : null}
                                                </>
                                            ) : (
                                                <>
                                                    <h2 className="phaseLable required" style={styling}>
                                                        Parent Master Category
                                                    </h2>
                                                    <Select
                                                        displayEmpty
                                                        inputProps={{ 'aria-label': 'Without label' }}
                                                        size="small"
                                                        className="w-85"
                                                        name="parentMasterCategory"
                                                        id="parentMasterCategory"
                                                        value={values.parentMasterCategory || 0}
                                                        onChange={(e) => {
                                                            handleChangeCategory(e);
                                                        }}
                                                        onBlur={handleBlur}
                                                        //   disabled={editFlag}
                                                        //   sx={
                                                        //     editFlag && {
                                                        //       backgroundColor: "#f3f3f3",
                                                        //       borderRadius: "6px",
                                                        //     }
                                                        //   }
                                                    >
                                                        <MenuItem value="" style={{ display: 'none' }}>
                                                            <em>Select Parent Master Category</em>
                                                        </MenuItem>
                                                        {parentCategoryDropdown?.map((v: any) => (
                                                            <MenuItem value={v?.id}>{v?.mastercategory}</MenuItem>
                                                        ))}
                                                    </Select>
                                                    {touched.parentMasterCategory && errors.parentMasterCategory ? <p className="form-error">{errors.parentMasterCategory}</p> : null}
                                                    <h2 className="phaseLable required" style={styling}>
                                                        Parent Name
                                                    </h2>
                                                    <Select
                                                        displayEmpty
                                                        inputProps={{ 'aria-label': 'Without label' }}
                                                        size="small"
                                                        className="w-85"
                                                        name="parentMaster"
                                                        id="parentMaster"
                                                        value={values.parentMaster || ''}
                                                        onChange={(e, v) => {
                                                            handleChange(e);
                                                        }}
                                                        onBlur={handleBlur}
                                                        disabled={editFlag}
                                                        sx={
                                                            editFlag && {
                                                                backgroundColor: '#f3f3f3',
                                                                borderRadius: '6px',
                                                            }
                                                        }
                                                    >
                                                        <MenuItem value="" style={{ display: 'none' }}>
                                                            <em>Select Parent</em>
                                                        </MenuItem>
                                                        {parentDropdown?.map((v: any) => (
                                                            <MenuItem value={v?.masterName}>{v?.masterName}</MenuItem>
                                                        ))}
                                                    </Select>
                                                    {touched.parentMaster && errors.parentMaster ? <p className="form-error">{errors.parentMaster}</p> : null}
                                                </>
                                            ))}
                                    </DialogContent>
                                    <DialogActions className="button-wrap">
                                        <Button className="yes-btn" type="submit">
                                            {editFlag ? 'Update' : 'Submit'}
                                        </Button>
                                        <Button className="no-btn" onClick={handleClose}>
                                            Cancel
                                        </Button>
                                    </DialogActions>
                                </form>
                            </Dialog>
                            <AppTooltip title="Export Excel">
                                <IconButton
                                    className="icon-btn"
                                    sx={{
                                        // borderRadius: "50%",
                                        // borderTopColor:"green",
                                        width: 35,
                                        height: 35,
                                        // color: (theme) => theme.palette.text.secondary,
                                        color: 'white',
                                        backgroundColor: 'green',
                                        '&:hover, &:focus': {
                                            backgroundColor: 'green', // Keep the color green on hover
                                        },
                                    }}
                                    onClick={() => {
                                        handleExportData();
                                    }}
                                    size="large"
                                >
                                    <AiFillFileExcel />
                                </IconButton>
                            </AppTooltip>
                        </Stack>
                    </div>
                </div>
            </Grid>
            <Grid marginBottom="0px" item container spacing={3} justifyContent="start" alignSelf="center">
                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                    <div style={{ height: 'calc(100vh - 200px)', marginTop: '5px' }}>
                        <CommonGrid defaultColDef={null} columnDefs={columnDefs} rowData={MasterName} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} onRowClicked={(e) => showRightData(e?.data)} rowSelection="single" />
                    </div>
                </Grid>
                <Grid item xs={6} md={9} sx={{ position: 'relative' }}>
                    <div
                        style={{
                            height: 'calc(100vh - 200px)',
                            marginTop: '5px',
                            minWidth: '',
                            width: '100%',
                        }}
                    >
                        <CommonGrid defaultColDef={null} columnDefs={columnDefs2} rowData={RightMasterData} onGridReady={onGridReady2} gridRef={gridRef2} pagination={true} paginationPageSize={10} onRowSelected={handleRowSelected} suppressRowClickSelection={true} rowSelection={'multiple'} />
                    </div>
                </Grid>
            </Grid>
        </>
    );
}
export default ComplianceCommonMaster;