import { Autocomplete, Box, Button, Stack, TextField, DialogTitle, InputAdornment, IconButton } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import AppTooltip from '@uikit/core/AppTooltip';
import { GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
// import { IconButton } from 'material-ui';
import React, { useCallback, useEffect, useState } from 'react';
import { AiFillFileExcel } from 'react-icons/ai';
import { TbPencil } from 'react-icons/tb';
import { Grid, Tooltip } from '@mui/material';
import { primaryButtonSm } from 'shared/constants/CustomColor';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import { fetchError, showMessage } from 'redux/actions';
import * as Yup from 'yup';
const AdminBussiness = () => {
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
    const [open, setOpen] = React.useState(false);
    const [adminData, setAdminData] = React.useState([]);
    const [bussinessOptions, setBusinessOptions] = useState([]);
    const [geoVerticalOptions, setGeoVerticalOptions] = useState([]);
    const [bussinessAssociateOptions, setBusinessAssociateOptions] = useState([]);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const [data, setdata] = useState(null);
    const [params, setparams] = useState(null);
    const [flag, setflag] = useState(false);
    const Aray = [
        { key: 1, status: 'Active' },
        { key: 2, status: 'In Active' },
    ];
    const [statusOptions, setStatusOptions] = useState(Aray);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [editFlag, setEditFlag] = useState(false);
    const [Id, setId] = useState(null);
    const styling = {
        marginTop: '5px',
        marginBottom: '5px',
    };
    const dispatch = useDispatch();
    const validateSchema = Yup.object({
        business_Assocate_Email: Yup.string().email('Invalid email format').required('Please enter Email Id'),
        geO_Vertical: Yup.object().nullable().required('Please select Geo Vertical'),
        business_Type: Yup.object().nullable().required('Please select Business Type'),
        business_Associate_Name: Yup.object().nullable().required('Please select Business Associate Name'),
        status: Yup.object().nullable().required('Please select status'),
        gL_Category: Yup.object().nullable().required('Please select GL Category'),
    });
    function objectsHaveSameKeyValuePairs(obj1, obj2) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1?.length !== keys2?.length) {
            return false;
        }

        for (const key of keys1) {
            if (obj1[key] !== obj2[key]) {
                return false;
            }
        }

        return true;
    }
    const onFilterTextChange = (e) => {
        gridApi?.setQuickFilter(e?.target?.value);
        if (gridApi.getDisplayedRowCount() == 0) {
            dispatch(fetchError('Data not found!'));
        }
    };
    const { values, handleBlur, setFieldValue, handleChange, handleSubmit, errors, touched, resetForm } = useFormik({
        initialValues: {
            geO_Vertical: null,
            business_Type: null,
            business_Associate_Name: null,
            business_Assocate_Email: '',
            status: null,
            gL_Category: null,
        },
        validationSchema: validateSchema,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: (values, action) => {
            console.log('Submit', values);
            const body = {
                fk_vertcal_id: values?.geO_Vertical?.id,
                fk_business_type: values?.business_Type?.id,
                fk_gl_catregory: values?.gL_Category?.id,
                fk_business_ass_name: values?.business_Associate_Name?.id,
                geO_Vertical: values?.geO_Vertical?.verticalName,
                business_Type: values?.business_Type?.business_type,
                business_Associate_Name: values?.business_Associate_Name?.userFullName,
                business_Assocate_Email: values?.business_Assocate_Email,
                gL_Category: values?.gL_Category?.glCategoryName,
                status: values?.status?.status,
                createdBy: 'sysadmin',
                createdDate: '2023-08-08T11:17:10',
                modifiedBy: 'sysadmin',
                modifiedDate: '2023-08-08T11:17:10',
                id: editFlag ? Id : 0,
                Uid: '',
            };
            const extractedPairs = Object.entries(body).slice(0, 10);

            const extractedObject = Object.fromEntries(extractedPairs);
            console.log('compare', data === extractedObject, data, extractedObject);
            // JSON.stringify(data) === JSON.stringify(extractedObject)
            if (editFlag && objectsHaveSameKeyValuePairs(data, extractedObject)) {
                dispatch(fetchError('Admin Business Master Already Exist'));
                setOpen(false);
                setTimeout(() => {
                    editFlag ? setEditFlag(false) : setEditFlag(false);
                    action.resetForm();
                }, 300);
                return;
            }
    //         axios
    //             .post(`${process.env.REACT_APP_BASEURL}/api/AdminBusinessMaster/InsertUpdateAdminBusinessMaster`, body)
    //             .then((response: any) => {
    //                 if (!response) {
    //                     dispatch(fetchError('Admin Business Master not added'));
    //                     setOpen(false);
    //                     return;
    //                 }
    //                 console.log('ttt', response);

    //                 if (response && response?.status === 200) {
    //                     if (editFlag) {
    //                         dispatch(showMessage('Admin Business Master update successfully'));
    //                         setOpen(false);
    //                         setEditFlag(false);
    //                     } else {
    //                         dispatch(showMessage('Admin Business Master added successfully'));
    //                     }
    //                     setOpen(false);
    //                     getAllAdmin();
    //                 } else {
    //                     dispatch(fetchError('admin business not added'));
    //                     setOpen(false);
    //                 }
    //             })
    //             .catch((e: any) => {
    //                 setOpen(false);
    //                 dispatch(fetchError('Error Occurred !'));
    //             });
    //         setTimeout(() => {
    //             editFlag ? setEditFlag(false) : setEditFlag(false);
    //             action.resetForm();
    //         }, 500);
    //     },
    // });
    if(editFlag)
    {
      axios
      .post(`${process.env.REACT_APP_BASEURL}/api/AdminBusinessMaster/InsertUpdateAdminBusinessMaster`, body)
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Admin Business Master not updated"));
          setOpen(false);
          return;
        };
        if (response && response?.status === 200) {
          dispatch(showMessage("Admin Business Master updated successfully"));
          setOpen(false);
          getAllAdmin();
          return;
        } else {
          dispatch(fetchError("Admin Business Master already exists"));
          setOpen(false);
          return;
        }
      })
      .catch((e: any) => {
        setOpen(false);
        dispatch(fetchError("Error Occurred !"));
      });
    }
    else
    {
      axios
      .post(`${process.env.REACT_APP_BASEURL}/api/AdminBusinessMaster/InsertUpdateAdminBusinessMaster`, body)
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Admin Business Master not added"));
          setOpen(false);
          return;
        };
        if (response && response?.status === 200) {
          dispatch(showMessage("Admin Business Master added successfully"));
          setOpen(false);
          getAllAdmin();
          return;
        } else {
          dispatch(fetchError("Admin Business Master already exists"));
          setOpen(false);
          return;
        }
      })
      .catch((e: any) => {
        setOpen(false);
        dispatch(fetchError("Error Occurred !"));
      });
    }

    setTimeout(()=>{
      editFlag ? setEditFlag(false) : setEditFlag(false);
      action.resetForm();
    },1000);
  },
});

    const getAllAdmin = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/AdminBusinessMaster/GetAdminBusinessMasterList`)
            .then((response: any) => {
                setAdminData(response?.data || []);
            })
            .catch((e: any) => {});
    };

    const getBusinessType = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/BusinessType/GetBusinessTypeList`)
            .then((response: any) => {
                console.log('res type', response);
                setBusinessOptions(response?.data || []);
            })
            .catch((e: any) => {});
    };
    const getGeoVertical = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=VerticalMaster&conditions=`)
            .then((response: any) => {
                console.log('res geo', response);
                setGeoVerticalOptions(response?.data?.data || []);
            })
            .catch((e: any) => {});
    };
    const getBusinessAssociate = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/user/GetUserListByRole?rolename=Business Associate`)
            .then((response: any) => {
                console.log('res ass', response);
                setBusinessAssociateOptions(response?.data || []);
            })
            .catch((e: any) => {});
    };
    const getGlCategory = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/GLCategories/GetGLCategoriesByVerticalId?verticalid=${values?.geO_Vertical?.id}`)
            .then((response: any) => {
                console.log('res gl cat', response);
                if (flag) {
                    setFieldValue(
                        'gL_Category',
                        response?.data?.find((item) => item?.id === params?.fk_gl_catregory),
                    );
                }
                const distinctCategoryNames = response?.data?.reduce((acc, obj) => {
                    const existingObject = acc.find((item) => item.glCategoryName === obj.glCategoryName);
                    if (!existingObject) {
                        acc.push(obj);
                    }
                    return acc;
                }, []);
                // if(flag){
                //     setFieldValue(
                //         'gL_Category',
                //         distinctCategoryNames?.find((item) => item?.id === id),
                //     );
                // }
                setCategoryOptions(distinctCategoryNames);
                setflag(false);
                // setCategoryOptions(response?.data?.data || []);
            })
            .catch((e: any) => {});
    };
    console.log('abc', categoryOptions);
    useEffect(() => {
        getAllAdmin();
        getGeoVertical();
        getBusinessType();
        getBusinessAssociate();
    }, []);

    useEffect(() => {
        console.log('abcd1');
        if (values?.geO_Vertical !== null) {
            getGlCategory();
            console.log('abcd2');
        }
    }, [values?.geO_Vertical]);

    const handleUpdate = (params) => {
        setOpen(true);
        setEditFlag(true);
        setId(params?.data?.id);
        setparams(params?.data);
        setflag(true);
        console.log('handleUpdate', params?.data, categoryOptions);
        const editedData = {
            fk_business_ass_name: params?.data?.fk_business_ass_name,
            fk_business_type: params?.data?.fk_business_type,
            fk_gl_catregory: params?.data?.fk_gl_catregory,
            fk_vertcal_id: params?.data?.fk_vertcal_id,
            geO_Vertical: params?.data?.geO_Vertical,
            business_Type: params?.data?.business_Type,
            business_Associate_Name: params?.data?.business_Associate_Name,
            gL_Category: params?.data?.gL_Category,
            status: params?.data?.status,
            business_Assocate_Email: params?.data?.business_Assocate_Email,
        };
        setdata(editedData);
        setFieldValue(
            'geO_Vertical',
            geoVerticalOptions?.find((item) => item?.id === params?.data?.fk_vertcal_id),
        );
        setFieldValue(
            'business_Type',
            bussinessOptions?.find((item) => item?.id === params?.data?.fk_business_type),
        );
        setFieldValue(
            'business_Associate_Name',
            bussinessAssociateOptions?.find((item) => item?.id === params?.data?.fk_business_ass_name),
        );
        setFieldValue(
            'status',
            statusOptions?.find((item) => item?.status === params?.data?.status),
        );
        setFieldValue('business_Assocate_Email', params?.data?.business_Assocate_Email);
        // setFieldValue(
        //     'gL_Category',
        //     categoryOptions?.find((item) => item?.id === params?.data?.fk_gl_catregory),
        // );
        // setTimeout(()=>{
        //     setFieldValue(
        //         'gL_Category',
        //         categoryOptions?.find((item) => item?.id === params?.data?.fk_gl_catregory),
        //     );
        // },2000)
        // getGlCategory(params?.data?.fk_gl_catregory, true);
    };
    let columnDefs = [
        {
            field: '',
            headerName: 'Actions',
            headerTooltip: 'Actions',
            // sortable: true,
            resizable: false,
            width: 90,
            minWidth: 90,
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
                        <Tooltip title={'Edit'} className="actionsIcons">
                            <button className="actionsIcons actionsIconsSize">
                                <TbPencil onClick={() => handleUpdate(params)} />
                            </button>
                        </Tooltip>
                    </div>
                </>
            ),
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'geO_Vertical',
            headerName: 'Geo vertical',
            headerTooltip: 'Geo Vertical',
            sortable: true,
            resizable: true,
            width: 180,
            minWidth: 180,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'business_Type',
            headerName: 'Business Type',
            headerTooltip: 'Business Type',
            sortable: true,
            resizable: true,
            width: 254,
            minWidth: 254,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'business_Associate_Name',
            headerName: 'Business Associate Name',
            headerTooltip: 'Business Associate Name',
            sortable: true,
            resizable: true,
            width: 220,
            minWidth: 220,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'business_Assocate_Email',
            headerName: 'Business Associate Email',
            headerTooltip: 'Business Associate Email',
            sortable: true,
            resizable: true,
            width: 220,
            minWidth: 220,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'status',
            headerName: 'Status',
            headerTooltip: 'Status',
            sortable: true,
            resizable: true,
            width: 120,
            minWidth: 120,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'gL_Category',
            headerName: 'GL Category',
            headerTooltip: 'GL Category',
            sortable: true,
            resizable: true,
            width: 180,
            minWidth: 180,
            cellStyle: { fontSize: '13px' },
        },
    ];
    function onGridReady(params) {
        gridRef.current!.api.sizeColumnsToFit();
        setGridColumnApi(params.columnApi);
        setGridApi(params.api);
    }
    const handleAdd = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
        setTimeout(()=>{
            setEditFlag(false);
            resetForm();
        },100)
    };
    console.log('Errors', errors);

    const handleExportData = () => {
        axios.get(`${process.env.REACT_APP_BASEURL}/api/AdminBusinessMaster/GetExcelReport`).then((response) => {
            if (!response) {
                dispatch(fetchError('Error occurred in Export !!!'));
                return;
            }
            if (response?.data) {
                var filename = 'AdminBusinessMaster.xlsx';
                if (filename && filename === '') {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                const binaryStr = atob(response?.data);
                const byteArray = new Uint8Array(binaryStr?.length);
                for (let i = 0; i < binaryStr?.length; i++) {
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

                    dispatch(showMessage('Admin Business Master Excel downloaded successfully!'));
                }
            }
        });
    };
    const getRowHeight = useCallback((params) => {
        return 37;
    }, []);
    console.log('values?.geO_Vertical', values?.geO_Vertical);
    return (
        <>
            <Grid
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                }}
            >
                <Box component="h2" className="page-title-heading mb-0">
                    Admin Business Master
                </Box>
                <div className="phase-grid">
                    <Stack display="flex" alignItems="flex-end" justifyContent="space-between" flexDirection="row" sx={{ mb: -2, marginBottom: '2px' }}>
                        <TextField
                            size="small"
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

                        <Button id="add" size="small" style={primaryButtonSm} sx={{ color: '#fff', fontSize: '12px' }} onClick={handleAdd}>
                            Add New
                        </Button>

                        <Dialog open={open} aria-describedby="alert-dialog-slide-description" maxWidth="lg" PaperProps={{ style: { borderRadius: '20px' } }}>
                            <form onSubmit={handleSubmit}>
                                <DialogTitle id="alert-dialog-title" className="title-model">
                                    {editFlag ? 'Edit' : 'Add'} Business Master
                                </DialogTitle>
                                <DialogContent style={{ width: '450px' }}>
                                    <div>
                                        <h2 className="phaseLable required" style={styling}>
                                            Geo vertical
                                        </h2>
                                        <Autocomplete
                                            id="combo-box-demo"
                                            getOptionLabel={(option) => option?.verticalName?.toString() || ''}
                                            disableClearable={true}
                                            options={geoVerticalOptions}
                                            onChange={(e, value) => {
                                                console.log('MMM', value);
                                                setFieldValue('geO_Vertical', value);
                                                setFieldValue('gL_Category', null);
                                            }}
                                            value={values?.geO_Vertical || ''}
                                            renderInput={(params) => (
                                                <TextField
                                                    name="geO_Vertical"
                                                    id="geO_Vertical"
                                                    type="string"
                                                    {...params}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        style: { height: `35 !important` },
                                                    }}
                                                    variant="outlined"
                                                    size="small"
                                                    // onBlur={handleBlur}
                                                />
                                            )}
                                        />
                                        {touched.geO_Vertical && errors.geO_Vertical ? <p className="form-error">{String(errors.geO_Vertical)}</p> : null}
                                    </div>

                                    <h2 className="phaseLable required" style={styling}>
                                        Business Type DD
                                    </h2>
                                    <Autocomplete
                                        id="combo-box-demo"
                                        getOptionLabel={(option) => option?.business_type?.toString() || ''}
                                        disableClearable={true}
                                        // disabled={editFlag}
                                        options={bussinessOptions}
                                        onChange={(e, value) => {
                                            setFieldValue('business_Type', value);
                                        }}
                                        value={values?.business_Type || ''}
                                        renderInput={(params) => (
                                            <TextField
                                                name="business_Type"
                                                id="business_Type"
                                                {...params}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    style: { height: `35 !important` },
                                                }}
                                                variant="outlined"
                                                size="small"
                                                // onBlur={handleBlur}
                                            />
                                        )}
                                    />
                                    {touched.business_Type && errors.business_Type ? <p className="form-error">{String(errors.business_Type)}</p> : null}
                                    <h2 className="phaseLable required" style={styling}>
                                        Business Associate Name
                                    </h2>
                                    <Autocomplete
                                        id="combo-box-demo"
                                        getOptionLabel={(option) => option?.userFullName || ''}
                                        disableClearable={true}
                                        // disabled={editFlag}
                                        options={bussinessAssociateOptions}
                                        onChange={(e, value) => {
                                            setFieldValue('business_Associate_Name', value);
                                        }}
                                        value={values?.business_Associate_Name || ''}
                                        renderInput={(params) => (
                                            <TextField
                                                name="business_Associate_Name"
                                                id="business_Associate_Name"
                                                {...params}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    style: { height: `35 !important` },
                                                }}
                                                variant="outlined"
                                                size="small"
                                                // onBlur={handleBlur}
                                            />
                                        )}
                                    />
                                    {touched.business_Associate_Name && errors.business_Associate_Name ? <p className="form-error">{String(errors.business_Associate_Name)}</p> : null}
                                    <h2 className="phaseLable required" style={styling}>
                                        Business Associate Email
                                    </h2>
                                    <TextField
                                        id="business_Assocate_Email"
                                        name="business_Assocate_Email"
                                        variant="outlined"
                                        type="string"
                                        size="small"
                                        value={values?.business_Assocate_Email || ''}
                                        // onBlur={(e: any) => {
                                        //     handleBlur(e);
                                        //     calculateBudget();
                                        // }}
                                        // onKeyDown={(e: any) => {
                                        //     regExpressionTextField(e);
                                        // }}
                                        // onPaste={(e: any) => {
                                        //     textFieldValidationOnPaste(e);
                                        // }}
                                        onChange={(e) => {
                                            setFieldValue('business_Assocate_Email', e?.target?.value);
                                        }}
                                    />
                                    {touched.business_Assocate_Email && errors.business_Assocate_Email ? <p className="form-error">{errors.business_Assocate_Email}</p> : null}
                                    <h2 className="phaseLable required" style={styling}>
                                        Status
                                    </h2>
                                    <Autocomplete
                                        id="combo-box-demo"
                                        getOptionLabel={(option) => option?.status || ''}
                                        disableClearable={true}
                                        options={statusOptions}
                                        onChange={(e, value) => {
                                            console.log('Selected value:', value);
                                            setFieldValue('status', value);
                                        }}
                                        value={values?.status}
                                        renderInput={(params) => (
                                            <TextField
                                                name="status"
                                                id="status"
                                                {...params}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    style: { height: `35 !important` },
                                                }}
                                                variant="outlined"
                                                size="small"
                                                // onBlur={handleBlur}
                                            />
                                        )}
                                    />
                                    {touched.status && errors.status ? <p className="form-error">{String(errors.status)}</p> : null}
                                    <h2 className="phaseLable required" style={styling}>
                                        GL Category
                                    </h2>
                                    <Autocomplete
                                        id="combo-box-demo"
                                        getOptionLabel={(option) => option?.glCategoryName || ''}
                                        disableClearable={true}
                                        // disabled={editFlag}
                                        options={values?.geO_Vertical !== null ? categoryOptions : []}
                                        onChange={(e, value) => {
                                            console.log('Selected value:', value);
                                            setFieldValue('gL_Category', value);
                                        }}
                                        value={values?.gL_Category || ''}
                                        renderInput={(params) => (
                                            <TextField
                                                name="gL_Category"
                                                id="gL_Category"
                                                {...params}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    style: { height: `35 !important` },
                                                }}
                                                variant="outlined"
                                                size="small"
                                                // onBlur={handleBlur}
                                            />
                                        )}
                                    />
                                    {touched.gL_Category && errors.gL_Category ? <p className="form-error">{String(errors.gL_Category)}</p> : null}
                                </DialogContent>
                                <DialogActions className="button-wrap">
                                    <Button className="yes-btn" type="submit">
                                        {editFlag ? 'Update' : 'Submit'}
                                    </Button>
                                    <Button className="no-btn" onClick={onClose}>
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
            </Grid>
            <div style={{ height: 'calc(100vh - 150px)', marginTop: '10px', overflow: 'hidden' }}>
                <CommonGrid defaultColDef={{ flex: 1 }} rowHeight={getRowHeight} columnDefs={columnDefs} rowData={adminData || []} onGridReady={onGridReady} gridRef={gridRef} pagination={true} paginationPageSize={10} />
            </div>
        </>
    );
};
export default AdminBussiness;
