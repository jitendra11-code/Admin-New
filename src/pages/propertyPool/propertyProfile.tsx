import React, { useState, useEffect, useCallback } from 'react';
import { Button, Grid, Box, Select, MenuItem, FormControl, InputLabel, FormControlLabel } from '@mui/material';
import * as Yup from 'yup';
import Dialog from '@mui/material/Dialog';
import DownloadIcon from '@mui/icons-material/Download';
import { Tooltip } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import NearbyBusinessForm from './nearByBusinessForm';
import { accordionTitle, toggleTitle, imageCard, secondaryButton, toggleTitle1 } from 'shared/constants/CustomColor';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { submit } from '../../shared/constants/CustomColor';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import ToggleSwitch from '@uikit/common/ToggleSwitch';
import DropdownMenu from '@uikit/common/DropdownMenu';
import { useFormik } from 'formik';
import { propertyPoolInitialValues, propertyPoolSchema, propertyPoolSaveAsDraftSchema } from '@uikit/schemas';
import Image from './Image.png';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchError, showMessage } from 'redux/actions';
import MandateInfo from 'pages/common-components/MandateInformation';
import { useUrlSearchParams } from 'use-url-search-params';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import { AppState } from 'redux/store';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import FinalPropertyReadOnly from 'pages/Mandate/FinalPropertyReadyOnly';
import moment from 'moment';
import regExpressionTextField, { textFieldValidationOnPaste, regExpressionRemark } from '@uikit/common/RegExpValidation/regForTextField';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { AgGridReact } from 'ag-grid-react';
import { TbPencil } from 'react-icons/tb';
import blockInvalidChar from 'pages/Mandate/Location/Components/blockInvalidChar ';
import { _validationMaxFileSizeUpload } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import groupByDocumentData from 'pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData';
import FileNameDiaglogList from 'pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox';
import { downloadFile } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
const label = { inputProps: { 'aria-label': 'Same as Present Address' } };

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
        borderBottom: 0,
    },
    '&:before': {
        display: 'none',
    },
}));

const MAX_COUNT = 8;

const AccordionSummary = styled((props: AccordionSummaryProps) => <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />} {...props} />)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(1),
    },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

const PropertyProfile = () => {
    const [openNearBy, setOpenNearBy] = React.useState(false);
    const [docRecordId, setDocRecordId] = React.useState(0);
    const [tableData, setTableData] = useState([]);
    const [fileLength, setFileLength] = useState(0);
    const [docUploadHistory, setDocUploadHistory] = useState([]);
    const [nearByBusinessData, setNearByBusinessData] = useState([]);
    const [imagesNB, setImagesNB] = React.useState<any>({});
    const [isSaveAsDraft, setIsSaveAsDraft] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [imageErrorNB, setImageErrorNB] = React.useState<any>({
        CompetitorImage1: true,
        CompetitorImage2: true,
        CompetitorImage3: true,
        CompetitorImage4: true,
    });
    const [propertyImageDetailsId, setPropertyImageDetailsId] = useState('');
    const [errorMsgNB, setErrorMsgNB] = React.useState<any>({});
    const [imagePreviewNB, setImagePreviewNB] = React.useState<any>({});
    const [deletedBusinessImageList, SetDeleteBusinessImageList] = React.useState<any>([]);
    const [docType, setDocType] = useState<any>(null);
    const [checked, setChecked] = React.useState(false);
    const [AddressCheck, setAddressCheck] = React.useState(false);
    const [mandateInfo, setMandateData] = React.useState(null);
    const [expanded, setExpanded] = React.useState<string | false>('panel1');
    const [pincode, setpincode] = useState('');
    const [landlordError, setLandlordError] = useState({});
    const [nearByError, setNearByError] = useState({});
    const [alignment, setAlignment] = React.useState('yes');
    const [age, setAge] = React.useState('');
    const [currentStatus, setCurrentStatus] = React.useState('');
    const [currentRemark, setCurrentRemark] = React.useState('');
    const [imageUpload, setImageUpload] = React.useState<any>({});
    const [landlordFormData, setLandlordFormData] = React.useState<any>({ securityDeposite: false, rentToBePaid: false });
    const [nearByFormData, setNearByFormData] = React.useState<any>({});
    const fileInput = React.useRef(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [fileLimit, setFileLimit] = useState(false);
    const [imagePreview, setImagePreview] = React.useState<any>({});
    const [toggleSwitch, setToggleSwitch] = React.useState<any>({});
    const [selectedMandate, setSelectedMandate] = useState(null);
    const [removeImagenName, setRemoveImagenName] = useState<any>([]);
    const [removeImagenNameNB, setRemoveImagenNameNB] = useState<any>([]);
    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const [gridApiNb, setGridApiNb] = React.useState(null);
    const [gridColumnApiNb, setGridColumnApiNb] = React.useState(null);
    const [gridApiDU, setGridApiUpload] = React.useState(null);
    const [gridColumnApiDU, setGridColumnApiUpload] = React.useState(null);
    const [imageError, setImageError] = useState<any>({
        PropertyFrontView: true,
        PropertyEntranceView: true,
        InteriorFrontView: true,
        InteriorRearView: true,
        OfficeEntranceView: true,
        Washroom01View: true,
        Washroom02View: true,
        PropertyLeftSideView: true,
        PropertyRightSideView: true,
        PropertyRearSideView: true,
        PropertyOppositeView: true,
        PropertyParkingImage: true,
    });
    const [errorMsg, setErrorMsg] = useState<any>({});
    const [isSuccess, setIsSuccess] = useState<any>(false);
    const location = useLocation();
    const addPropertySource = location?.state?.addPropertySource || '';
    const date = new Date();
    const { user } = useAuthUser();
    const { id } = useParams();
    const [params] = useUrlSearchParams({}, {});
    const [mandateCode, setMandateCode] = useState<any>('');
    const [edit, setEdit] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editNb, setEditNb] = useState(false);
    const [editIndexNb, setEditIndexNb] = useState(null);
    const gridRef = React.useRef<AgGridReact>(null);
    const gridRef2 = React.useRef<AgGridReact>(null);
    const gridRef3 = React.useRef<AgGridReact>(null);
    let path = window.location.pathname?.split('/');
    let module: any = window.location.pathname?.split('/')[path.length - 1];
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);
    const [dropdownList, setDropdownList] = useState<any>({});
    const [FloorNumber, setFloorNumber] = useState([]);
    const [PropertyStatus, setPropertyStatus] = useState([]);
    const [RccStrongRoom, setRccStrongRoom] = useState([]);
    const [Premise, setPremise] = useState([]);
    const [ParkingType, setParkingType] = useState([]);
    const [AggrementRegisterationCharges, setAggrementRegisterationCharges] = useState([]);
    const [WashroomType, setWashroomType] = useState([]);
    const [lessorType, setLessorType] = useState<any>([]);
    const [selectedLessorType, setSelectedLessorType] = useState('');
    const [nameOfOwnership, setnameOfOwnership] = useState([]);
    const [ageOfBuilding, setAgeOfBuilding] = useState([]);
    const [mottgageStatus, setMottgageStatus] = useState([]);
    const [rentToBePaid, setRentToBePaid] = useState(true);
    const [securityDeposite, setSecurityDeposite] = useState(true);
    const [CurrentBranchEntranceType, setCurrentBranchEntranceType] = useState([]);
    const [BusinessType, setBusinessType] = useState([]);
    const [statusP, setStatusP] = useState(null);
    const [editFlagNB, setEditFlagNB] = useState(false);

    useEffect(() => {
        if (tableData.length > 0) {
            setLandlordFormData({ securityDeposite: false, rentToBePaid: false });
        } else {
            setLandlordFormData({ securityDeposite: true, rentToBePaid: true });
        }
    }, [tableData]);

    useEffect(() => {
        if (params?.status) {
            setStatusP(params?.status);
        }
    }, [params]);

    let columnDefsUpload = [
        {
            field: 'srno',
            headerName: 'Sr. No',
            headerTooltip: 'Serial Number',
            cellRenderer: (e: any) => {
                var index = e?.rowIndex;
                return index + 1;
            },

            sortable: true,
            resizable: true,
            width: 80,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'filename',
            headerName: 'File Name',
            headerTooltip: 'File Name',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.filename;
                data = data?.split('.');
                data = data?.[0];
                return data || '';
            },
            width: 400,
            minWidth: 150,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdDate',
            headerName: 'Created Date',
            headerTooltip: 'Created Date',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                return moment(e?.data?.createdDate).format('DD/MM/YYYY');
            },
            width: 150,
            minWidth: 120,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdDate',
            headerName: 'Created Time',
            headerTooltip: 'Created Time',
            cellRenderer: (e: any) => {
                return moment(e?.data?.createdDate).format('h:mm:ss A');
            },
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 120,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdBy',
            headerName: 'Created By',
            headerTooltip: 'Created By',
            sortable: true,
            resizable: true,
            width: 190,
            minWidth: 120,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'Download',
            headerName: 'Download',
            headerTooltip: 'Download',
            resizable: true,
            width: 110,
            minWidth: 100,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (obj: any) => (
                <>
                    <div className="actions">
                        <Tooltip title="Download" className="actionsIcons">
                            <DownloadIcon
                                style={{ fontSize: '15px' }}
                                onClick={() => {
                                    var mandate = { id: mandateCode?.id };
                                    downloadFile(obj?.data, mandate, dispatch);
                                }}
                                className="actionsIcons"
                            />
                        </Tooltip>
                    </div>
                </>
            ),
        },
        {
            field: '',
            headerName: 'View',
            headerTooltip: 'View',
            resizable: true,
            width: 110,
            minWidth: 100,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (obj: any) => (
                <>
                    <div className="actions">
                        <FileNameDiaglogList props={obj} />
                    </div>
                </>
            ),
        },
    ];

    let columnDefs = [
        {
            field: 'srno',
            headerName: 'Sr. No.',
            headerTooltip: 'Serial Number',
            cellRenderer: (e: any) => {
                var index = e?.rowIndex;
                return index + 1;
            },

            sortable: true,
            resizable: true,
            width: 80,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'landlord_full_name',
            headerName: 'Landlords Full Name',
            headerTooltip: 'Landlords Full Name',
            cellRenderer: (e: any) => {
                var data = e.data.landlord_full_name;
                return data || '';
            },
            sortable: true,
            resizable: true,
            width: 130,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'landlord_occupation',
            headerName: 'Landlords Occupation ',
            headerTooltip: 'Landlords Occupation',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.landlord_occupation;
                return data || '';
            },
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },

        {
            field: 'landlord_contact',
            headerName: 'Landlords Primary No.',
            headerTooltip: 'Landlords Primary Number',
            resizable: true,
            width: 120,
            minWidth: 100,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (e: any) => {
                var data = e.data.landlord_contact;
                return data || '';
            },
        },
        {
            field: 'landlord_alternate_contact',
            headerName: 'Landlords Alternate No.',
            headerTooltip: 'Landlords Alternate Number',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.landlord_alternate_contact;
                return data || '';
            },
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'landlord_present_add',
            headerName: 'Landlords Present Address  ',
            headerTooltip: 'Landlords Present Address',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.landlord_present_add;
                return data || '';
            },
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'landlord_permanent_add',
            headerName: 'Landlords Permanent Address ',
            headerTooltip: 'Landlords Permanent Address',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.landlord_permanent_add;
                return data || '';
            },
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'landlord_permanent_emailId',
            headerName: 'Landlords Email Id',
            headerTooltip: 'Landlords Email Id',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.landlord_permanent_emailId;
                return data || '';
            },
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'landlord_pan',
            headerName: 'PAN No.',
            headerTooltip: 'PAN Number',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data?.landlord_pan?.toUpperCase();
                return data || '';
            },
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'landlord_aadhar',
            headerName: 'Aadhaar No.',
            headerTooltip: 'Aadhaar Number',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.landlord_aadhar;
                return data || '';
            },
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'lessor_Type',
            headerName: 'Lessor Type',
            headerTooltip: 'Lessor Type',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data?.lessor_Type || '';
                return lessorType?.find((v, i) => data == i + 1)?.formName || '';
            },
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'rentToBePaid',
            headerName: 'Rent to be paid',
            headerTooltip: 'Rent to be paid',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data?.rentToBePaid ? 'Yes' : 'No';
                return data;
            },
            width: 190,
            minWidth: 130,

            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'securityDeposite',
            headerName: 'Security Deposit',
            headerTooltip: 'Security Deposit',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data?.securityDeposite ? 'Yes' : 'No';
                return data;
            },
            width: 190,
            minWidth: 130,

            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'Action',
            headerName: 'Action',
            headerTooltip: 'Action',
            sortable: true,
            resizable: true,
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
                            <button className="actionsIcons actions-icons-size" disabled={statusP === 'Approve'}>
                                <TbPencil onClick={(e) => editrow(params?.rowIndex)} />
                            </button>
                        </Tooltip>
                    </div>
                </>
            ),
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
    ];

    let columnDefsNb = [
        {
            field: 'Action',
            headerName: 'Action',
            headerTooltip: 'Action',
            sortable: true,
            resizable: true,
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
                            <button className="actionsIcons actions-icons-size">
                                <TbPencil
                                    onClick={(e) => {
                                        setEditFlagNB(true);
                                        editrowNb(params?.rowIndex);
                                    }}
                                />
                            </button>
                        </Tooltip>
                    </div>
                </>
            ),
            width: 200,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'srno',
            headerName: 'Sr. No',
            headerTooltip: 'Serial Number',
            cellRenderer: (e: any) => {
                var index = e?.rowIndex;
                return index + 1;
            },

            sortable: true,
            resizable: true,
            width: 190,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'nearby_outlet',
            headerName: 'Any Nearby Business Outlets',
            headerTooltip: 'Any Nearby Business Outlets',
            cellRenderer: (e: any) => {
                var data = e.data.nearby_outlet;
                return data || '';
            },
            sortable: true,
            resizable: true,
            width: 130,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'same_building',
            headerName: 'Are they in same building',
            headerTooltip: 'Are they in same building',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.same_building;
                return data || '';
            },
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },

        {
            field: 'business_full_name',
            headerName: 'Business Full Name',
            headerTooltip: 'Business Full Name',
            resizable: true,
            width: 130,
            minWidth: 100,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (e: any) => {
                var data = e.data.business_full_name;
                return data || '';
            },
        },
        {
            field: 'business_type',
            headerName: 'Business Type',
            headerTooltip: 'Business Type',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.business_type;
                return data || '';
            },
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },

        {
            field: 'others_business_type',
            headerName: 'Please specify the types of business',
            headerTooltip: 'Please specify the types of business',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.others_business_type;
                return data || '';
            },
            width: 190,
            minWidth: 150,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'floor',
            headerName: 'Floor',
            headerTooltip: 'Floor',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.floor;
                return data || '';
            },
            width: 190,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'carpet_area',
            headerName: 'Carpet Area',
            headerTooltip: 'Carpet Area',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.carpet_area;
                return data || '';
            },
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'monthly_rent',
            headerName: 'Monthly Rent',
            headerTooltip: 'Monthly Rent',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.monthly_rent;
                return data || '';
            },
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'maintenance_amount',
            headerName: 'Monthly Maintenance Amount',
            headerTooltip: 'Monthly Maintenance Amount',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.maintenance_amount;
                return data || '';
            },
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'lease_period',
            headerName: 'Lease Period(In Months)',
            headerTooltip: 'Lease Period(In Months)',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.lease_period;
                return data || '';
            },
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'inception_month_year',
            headerName: 'Inception Month & Year',
            headerTooltip: 'Inception Month & Year',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.inception_month_year;
                return (data && moment(data).isValid() && moment(data).format('DD/MM/yyyy')) || '';
            },
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },

        {
            field: 'distance',
            headerName: 'Distance from proposed location(In meters.)',
            headerTooltip: 'Distance from proposed location(In meters.)',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.distance;
                return data || '';
            },
            width: 190,
            minWidth: 130,
            cellStyle: { fontSize: '13px' },
        },
    ];
    const editrow = (index) => {
        setEdit(true);
        setEditIndex(index);
        setLandlordFormData({ ...tableData[index] });
    };

    async function runAsyncForEach(array, asyncFunction) {
        const promises = array.map(asyncFunction);
        await Promise.all(promises);
    }

    const editrowNb = async (index) => {
        const item = nearByBusinessData[index];
        setEditIndexNb(index);
        var _images = nearByBusinessData[index].images;
        var _imagePreviewNB = nearByBusinessData[index].imagesPreview;
        setImagePreviewNB(_imagePreviewNB);
        if (params?.propertyId === undefined) {
            setImagesNB(_images);
        }
        setNearByFormData({ ...nearByBusinessData[index] });
        setOpenNearBy(true);
        if (params?.propertyId) {
            var imageTypeList = ['CompetitorImage1', 'CompetitorImage2', 'CompetitorImage3', 'CompetitorImage4'];
            await runAsyncForEach(imageTypeList, async (type) => {
                await _getImageNB(item?.id, type);
            });
        }
        setEditNb(true);
    };

    const getHeightForTable = useCallback(() => {
        var height = 0;
        var dataLength = (tableData && tableData?.length) || 0;
        if (dataLength === 0) return '0px';
        height = 45 * dataLength + 57;

        if (height > 0 && dataLength <= 4) return `${height}px`;
        return '200px';
    }, [tableData, docType]);
    const getHeightForTableNb = useCallback(() => {
        var height = 0;
        var dataLength = (nearByBusinessData && nearByBusinessData?.length) || 0;
        if (dataLength === 0) return '0px';
        height = 45 * dataLength + 56;

        if (height > 0 && dataLength <= 4) return `${height}px`;
        return '200px';
    }, [nearByBusinessData]);

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }
    function onGridReady3(params) {
        setGridApiUpload(params.api);
        setGridColumnApiUpload(params.columnApi);
        gridRef3.current!.api.sizeColumnsToFit();
    }
    function onGridReadyNearBy(params) {
        setGridApiNb(params.api);
        setGridColumnApiNb(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }

    React.useEffect(() => {
        if (isSaveAsDraft) {
            setErrors({});
        }
    }, [isSaveAsDraft]);

    React.useEffect(() => {
        if (id && id != 'noid') {
            setMandateCode(id);
        }
        if (params?.propertyId) {
            getPropertyData(params?.propertyId);
        }
        if (params?.propertyId) {
            getPropertyLandlordData(params?.propertyId);
            getPropertyNearbyBusinessData(params?.propertyId);
        }
    }, [id]);

    const getRecordIDForDocUpload = (e, chosenFiles) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/PropertyPool/GetPropertyBasicDetails?pincode=${values?.pinCode || 0}&BuildingName=${values?.nameOfBuilding || ''}`)
            .then((response: any) => {
                if (!response) return;
                if (response && response?.data && response?.status === 200) {
                    setDocRecordId(response?.data || 0);
                    handleUploadFiles(e, chosenFiles, response?.data);
                }
            })
            .catch((e) => {});
    };

    const showTime = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    const [waterSupply, setWaterSupply] = React.useState(moment(date).format());
    const [waterToSupply, setWaterToSupply] = React.useState(moment(date).format());
    const navigate = useNavigate();

    const handleDrop = (e: any, imageKey) => {
        e.preventDefault();

        const droppedFile = e.dataTransfer.files[0];

        if (!droppedFile) {
            return;
        }

        const { name, size } = droppedFile;

        const MIN_FILE_SIZE = 1024;
        const fileSizeKiloBytes = size / 1024;
        if (fileSizeKiloBytes > MIN_FILE_SIZE) {
            setErrorMsg({
                ...errorMsg,
                [imageKey]: 'Please upload less than 1mb file size',
            });
            setIsSuccess(false);
            return;
        } else {
            setImageError({ ...imageError, [imageKey]: true });
            setImageUpload({ ...imageUpload, [imageKey]: droppedFile });
            setRemoveImagenName(removeImagenName?.filter((v) => v !== imageKey));
            let file = droppedFile;
            let fileURL = URL.createObjectURL(file);
            file.fileURL = fileURL;
            setImagePreview({ ...imagePreview, [imageKey]: file.fileURL });
            setIsSuccess(true);
        }
        setErrorMsg({ ...errorMsg, [imageKey]: '' });
    };
    const onImageChange = (e: any) => {
        const { name, value } = e.target;

        const MIN_FILE_SIZE = 1024;
        const fileSizeKiloBytes = e.currentTarget.files[0].size / 1024;
        if (fileSizeKiloBytes > MIN_FILE_SIZE) {
            setErrorMsg({
                ...errorMsg,
                [name]: 'Please upload less than 1mb file size',
            });
            setIsSuccess(false);
            return;
        } else {
            setImageError({ ...imageError, [name]: true });
            setImageUpload({ ...imageUpload, [name]: e.currentTarget.files[0] });
            setRemoveImagenName(removeImagenName?.filter((v) => v !== name));
            let file = e.currentTarget.files[0];
            let fileURL = URL.createObjectURL(file);
            file.fileURL = fileURL;
            setImagePreview({ ...imagePreview, [name]: file.fileURL });
        }
        setErrorMsg({ ...errorMsg, [name]: '' });
        setIsSuccess(true);
    };

    const handleChangeTime = (event) => {
        setWaterSupply(moment(new Date(event)).format());
    };

    const handleChangeToTime = (event) => {
        setWaterToSupply(moment(new Date(event)).format());
    };
    const dispatch = useDispatch();
    const handleChangeToggle = (event: any, newAlignment: string) => {
        setToggleSwitch({
            ...toggleSwitch,
            [newAlignment]: event.target.value === 'true' ? true : false,
        });
    };
    useEffect(() => {
        if (toggleSwitch?.agreementRegistrationApplicability === false) {
            setToggleSwitch({
                ...toggleSwitch,
                ['lockInBfl']: null,
            });
        }
    }, [toggleSwitch?.agreementRegistrationApplicability]);
    useEffect(() => {
        if (toggleSwitch?.washroomAvailablity === false) {
            setToggleSwitch({
                ...toggleSwitch,
                ['toiletSeatTypeInMaleWashroom']: null,
            });

            resetForm({
                values: {
                    ...values,
                    washroomType: '',
                    washroomAvailableCount: '',
                    maleWashroomCount: 0,
                    femaleWashroomCount: 0,
                    urinalsAvailableInMaleWashroom: '',
                    urinalsCountInMaleWashroom: '',
                    toiletSeatCountInMaleWashroom: '',
                    toiletSeatCountInFemaleWashroom: '',
                },
            });
        }
    }, [toggleSwitch?.washroomAvailablity]);

    const handleChangeAccordian = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    React.useEffect(() => {
        if (mandateCode && mandateCode?.id != 'noid' && mandateCode?.id !== undefined && docRecordId !== 0) {
            getVersionHistoryData(docRecordId || 0);
        }
    }, [mandateCode, docRecordId]);
    React.useEffect(() => {
        if (params?.propertyId !== undefined && docRecordId !== 0) {
            getVersionHistoryData(docRecordId || 0);
        }
    }, [params?.propertyId, docRecordId]);

    React.useEffect(() => {
        if (mandateCode && mandateCode?.id != 'noid' && mandateCode?.id !== undefined) {
            if (window.location.pathname?.includes('/property-pool')) {
                if (params?.source === 'list') {
                    navigate(`/property-pool/${mandateCode?.id}/add?source=${params?.source}`, { state: { addPropertySource: addPropertySource } });
                } else {
                    if (params?.propertyId && params?.status === 'Approve') {
                        navigate(`/property-pool/${mandateCode?.id}/add?propertyId=${params?.propertyId}&status=${params?.status}`, { state: { addPropertySource: addPropertySource } });
                    } else if (params?.propertyId) {
                        navigate(`/property-pool/${mandateCode?.id}/add?propertyId=${params?.propertyId}`, { state: { addPropertySource: addPropertySource } });
                    } else {
                        navigate(`/property-pool/${mandateCode?.id}/add`, {
                            state: { addPropertySource: addPropertySource },
                        });
                    }
                }
            }
        }
    }, [mandateCode?.id, setMandateCode]);

    const _getImage = async (id: number, type: string) => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/RetriveImage?ImageId=${id || 0}&ImageType=${type}`)
            .then((response: any) => {
                if (response?.data?.base64String !== undefined) {
                    setImagePreview((state) => ({
                        ...state,
                        [type]: `data:image/png;base64,${response?.data?.base64String}`,
                    }));
                } else {
                    setImagePreview((state) => ({
                        ...state,
                        [type]: null,
                    }));
                }
            })
            .catch((e: any) => {});
    };

    const _getImageNB = async (id: number, type: string) => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/PropertyLandlordDetails/RetriveImage?propBusinessId=${id || 0}&Type=${type}`)
            .then((response: any) => {
                if (response?.data?.base64String !== undefined) {
                    setImagePreviewNB((state) => ({
                        ...state,
                        [type]: `data:image/png;base64,${response?.data?.base64String}`,
                    }));
                }
            })
            .catch((e: any) => {});
    };

    const errorImage = useCallback(
        async (e, v: any) => {
            if (imagePreview) var x = imageError;
            if (x.hasOwnProperty(v)) {
                x[v] = false;
            }
            e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cHJvcGVydHl8ZW58MHx8MHx8&w=1000&q=80';
            await setImageError(x);
        },
        [imagePreview],
    );

    const defineSchemaForSaveAsDraft = (values) => {
        const finalSchema = Yup.object().shape(
            values &&
                Object.keys(values)
                    .filter((key) => values[key] !== '')
                    .reduce((obj, key) => {
                        obj[key] = propertyPoolSchema.fields[key];
                        return obj;
                    }, {}),
        );
        const propertyPoolSaveAsDraftSchemaRequired = Yup.object().shape(propertyPoolSaveAsDraftSchema);
        const mergedSchema = Yup.object().concat(propertyPoolSaveAsDraftSchemaRequired).concat(finalSchema);
        return mergedSchema;
    };

    const { values, handleBlur, handleChange, handleSubmit, setFieldValue, errors, setErrors, touched, resetForm, setFieldError, setValues } = useFormik({
        initialValues: propertyPoolInitialValues,
        validationSchema: isSaveAsDraft ? () => defineSchemaForSaveAsDraft(values) : propertyPoolSchema,
        validateOnChange: true,
        validateOnMount: false,
        validateOnBlur: true,
        onSubmit: async (values, action) => {
            if (!isSaveAsDraft) {
                if (errors && Object.keys(errors).length > 0) {
                    dispatch(fetchError('Please fill all compulsory fields !!!'));
                    return;
                }
                if (tableData?.length === 0) {
                    dispatch(fetchError('Please add at least one Landlord'));
                    return;
                }
                var _nearByBusinessValidation = nearByBusinessData && nearByBusinessData?.length;
                if (toggleSwitch?.nearByBusinessAvailable === true && (_nearByBusinessValidation < 3 || _nearByBusinessValidation > 10)) {
                    dispatch(fetchError('Please add minimum 3 or maximum 10 competitors'));
                    return;
                }
                if (errors && Object.keys(errors).length > 0) return;
            }

            if (errors && Object.keys(errors).length > 0) {
                dispatch(fetchError('Please fill all compulsory fields !!!'));
                return;
            }

            let formData: any = new FormData();
            let formData2: any = new FormData();
            formData.append('RPM', values?.rent || '');
            formData.append('TDSDeductionRPM', values?.tds || '');
            formData.append('IsGSTApplicable', toggleSwitch?.gstApplicable === true ? true : false || '');
            formData.append('gstNo', values?.gstNo || '');
            formData.append('GSTDeductionRPM', toggleSwitch?.gstApplicable === false ? 0 : values?.gstDeduction || 0);
            formData.append('SecurityDepositAmount', values?.securityAmount || '');
            formData.append('MaintenanceCharges', values?.maintenanceCharges || '');
            formData.append('TotalFixedExpensesPerMonth', values?.totalExpencesPerMonth || '');
            formData.append('PropertyTaxes', toggleSwitch?.propertyTaxes === true ? 'BFL' : 'Landlord' || '');
            formData.append('RentFreePeriod', values?.rentFreePeriod || '');
            formData.append('RentEscelationFrequency', values?.rentEscelationFerq || '');
            formData.append('RentEscalation', values?.rentEscelation || '');
            formData.append('NameOfTheBuilding', values?.nameOfBuilding || '');
            formData.append('FloorNumberInBuilding', values?.floorNumberInBuilding || '');
            formData.append('PremisesAddress', values?.premisesAddress || '');
            formData.append('PINCode', values?.pinCode || '');
            formData.append('City', values?.city || '');
            formData.append('Disctrict', values?.district || '');
            formData.append('State', values?.state || '');
            formData.append('Country', values?.propertyCountry || '');
            formData.append('PropertyStatus', values?.propertyStatus?.toString() || '');
            formData.append('PremiseDistanceFromBST', values?.promiseDistanceFromBusStation || '');
            formData.append('PremiseDistanceFromRST', values?.promiseDistanceFromRailwayStation || '');
            formData.append('ShopPresenceWithGeoTag', values?.wineShop?.toString() || '');
            formData.append('NearByBusinessAvailable', toggleSwitch?.nearByBusinessAvailable ?? false);
            formData.append('competitorsPresence', values?.competitorsPresence?.toString() || '');
            formData.append('PermissionOnTerraceForTwoAntennas', toggleSwitch?.permissionAvailable || false);
            formData.append('SpaceForSignage', toggleSwitch?.spaceForSignage || false);
            formData.append('MainGlowSignBoard', toggleSwitch?.glowSignBoard || false);
            formData.append('SideBoard', toggleSwitch?.sideBoard || false);
            formData.append('TickerBoard', toggleSwitch?.tickerBoard || false);
            formData.append('FlangeBoard', toggleSwitch?.flangeBoard || false);
            formData.append('BrandingInStaircase', toggleSwitch?.brandingInStaircase || false);
            formData.append('DirectionBoard', toggleSwitch?.directionBoard || false);
            formData.append('RCCStrongRoomBuildBy', values?.buildBy || '0');
            formData.append('RCCStrongRoomBuildComments', values?.buildComments);

            formData.append('FloorSanction', values?.floorSanction || '0');
            formData.append('TotalConstructedFloorAreaInSFT', values?.totalConstructedFloorArea || '');
            formData.append('TotalCarpetAreaInSFT', values?.totalCarpetArea || '');
            formData.append('ChargeableAreaInSFT', values?.chargeableArea || '');
            formData.append('LandlordProvideVetrifiedFlooring', toggleSwitch?.vetrifiedFlooring ?? false);
            formData.append('CurrentBranchEntranceType', values?.entranceType || '0');
            formData.append('GrilledDoorProvidedByLandlord', values?.providedDoor);
            formData.append('VentilationAvailableInBranch', toggleSwitch?.ventilationAvailable || false);
            formData.append('GrilledWindowsInOfficeArea', toggleSwitch?.grilledWindows || false);
            formData.append('GrilledWindowCountForOfficeArea', values?.grilledWindowCount?.toString() || '');
            formData.append('GrilledWindowNoteForOfficeArea', values?.grilledWindowNote || '');
            formData.append('VentilationInWashroomArea', toggleSwitch?.ventilationInWashroom || false);
            formData.append('GrilledWindowsInWashroomArea', toggleSwitch?.grilledWindowsInWashroom || false);
            formData.append('GrilledWindowCountForWashroomArea', values?.grilledWindowCountW || '');
            formData.append('GrilledWindowNoteForWashroomArea', values?.grilledWindowNoteW || '');
            formData.append('SpaceForACOutdoorUnits', toggleSwitch?.outdoorUnits || false);
            formData.append('spaceForDGSet', toggleSwitch?.spaceForDGSet || false);
            formData.append('PremiseAccessability', toggleSwitch?.premiseAccessability || false);
            formData.append('PremiseAccessabilityNotAvailableReason', values?.premiseAccessabilityNotAvailableReason || '');
            formData.append('ParkingAvailability', toggleSwitch?.parkingAvailability || false);
            formData.append('ParkingType', values?.parkingType?.toString() || '');
            formData.append('NumberOfCarParkingAvailable', values?.numberOfCarParkingAvailable || 0);
            formData.append('NumberOfBikeParkingAvailable', values?.numberOfBikeParkingAvailable || 0);
            formData.append('landlordDetails', values?.landlordDetails);
            formData.append('AgreementRegistrationApplicability', toggleSwitch?.agreementRegistrationApplicability || false);
            formData.append('AgreementDuration', +values?.agreementDuration > 0 ? (+values?.agreementDuration + 2)?.toString() : '');
            formData.append('LockInForPremiseOwner', values?.lockInPremiseOwner?.toString() || '');
            formData.append('IsLockInForBFL', toggleSwitch?.lockInBfl || false);
            formData.append('LockInForBFL', values?.lockInForBfl?.toString() || '');
            formData.append('AgreementRegistrationChargesBornBy', values?.agreementRegistrationChargesBornBy?.toString() || '');
            formData.append('BFLShare', values?.bflShare?.toString() || '');
            formData.append('rcc_bfl_share', values?.rcc_bfl_share || 0);
            formData.append('rcc_landlord_share', values?.rcc_landlord_share || 0);
            formData.append('LandlordShare', values?.landlordShare?.toString() || '');
            formData.append('ElectricityConnectionAvailablity', toggleSwitch?.electricityConnectionAvailablity || false);
            formData.append('ElectricityPowerLoad', !values?.electricityPowerLoad ? '1' : values?.electricityPowerLoad);
            formData.append('ElectricityConnectionBornBy', toggleSwitch?.electricityConnectionBornBy === true ? 'BFL' : 'Landlord' || '');
            formData.append('WaterSupplyAvailability', toggleSwitch?.waterSupplyAvailability === true ? '24X7' : 'Fixed Time' || '');
            formData.append('SelectWaterSupplyTimings', moment(waterSupply).format('LT'));
            formData.append('SelectWaterSupplyTimingsToTime', moment(waterToSupply).format('LT'));
            formData.append('SinkInPantryArea', toggleSwitch?.sinkWithTiles || false);
            formData.append('WashroomAvailablity', toggleSwitch?.washroomAvailablity || false);
            formData.append('WashroomType', values?.washroomType || '');
            formData.append('WashroomAvailableCount', (values?.washroomAvailableCount && values?.washroomAvailableCount) || '');
            formData.append('MaleWashroomCount', (values?.maleWashroomCount && values?.maleWashroomCount?.toString()) || '');
            formData.append('FemaleWashroomCount', (values?.femaleWashroomCount && values?.femaleWashroomCount?.toString()) || '');
            formData.append('UrinalsAvailableInMaleWashroom', values?.urinalsAvailableInMaleWashroom || '');
            formData.append('UrinalsCountInMaleWashroom', (values?.urinalsCountInMaleWashroom && values?.urinalsCountInMaleWashroom) || '');
            formData.append('ToiletSeatTypeInMaleWashroom', toggleSwitch?.toiletSeatTypeInMaleWashroom === undefined ? '' : toggleSwitch?.toiletSeatTypeInMaleWashroom === true ? 'Indian' : 'WC');
            formData.append('ToiletSeatCountInMaleWashroom', (values?.toiletSeatCountInMaleWashroom && values?.toiletSeatCountInMaleWashroom?.toString()) || '');
            formData.append('ToiletSeatCountInFemaleWashroom', (values?.toiletSeatCountInFemaleWashroom && values?.toiletSeatCountInFemaleWashroom?.toString()) || '');
            formData.append('WashBasinAvailableInsideWashrooms', toggleSwitch?.washBasinAvailableInsideWashrooms === undefined ? false : toggleSwitch?.washBasinAvailableInsideWashrooms);
            formData.append('DoorsLockKeyAvailableInwashrooms', toggleSwitch?.keyAvailableInWashrooms === undefined ? false : toggleSwitch?.keyAvailableInWashrooms);
            formData2.append('PropertyFrontView', imageUpload?.PropertyFrontView);
            formData2.append('PropertyEntranceView', imageUpload?.PropertyEntranceView);
            formData2.append('InteriorFrontView', imageUpload?.InteriorFrontView);
            formData2.append('InteriorRearView', imageUpload?.InteriorRearView);
            formData2.append('OfficeEntranceView', imageUpload?.OfficeEntranceView);
            formData2.append('Washroom01View', imageUpload?.Washroom01View);
            formData2.append('Washroom02View', imageUpload?.Washroom02View);
            formData2.append('PropertyLeftSideView', imageUpload?.PropertyLeftSideView);
            formData2.append('PropertyRearSideView', imageUpload?.PropertyRearSideView);
            formData2.append('PropertyRightSideView', imageUpload?.PropertyRightSideView);
            formData2.append('PropertyOppositeView', imageUpload?.PropertyOppositeView);
            formData2.append('PropertyParkingImage', imageUpload?.PropertyParkingImage);

            formData.append('commercial_Status', values?.commercial_remarks || '');
            formData.append('PropertyGeoDetails_Status', values?.property_geo_details_remarks || '');
            formData.append('InfraRequirement_Status', values?.infra_requirement_remarks || '');
            formData.append('PropertyInfraDetails_Status', values?.property_infra_details_remarks || '');
            formData.append('Utility_Status', values?.utility_remarks || '');
            formData.append('Legal_Status', values?.legal_remarks || '');

            formData.append('Ownership_Nature', values?.nameOfOwnership || '');
            formData.append('Mortgage_Status', values?.mottgageStatus || '');
            formData.append('Bank_Finance_Institution', values?.nameOfBank || null);
            formData.append('Age_Of_building', values?.ageOfBuilding || '');

            formData2.append('DeleteImagesList', removeImagenName || []);
            formData2.append('PropertyImageDetailsId', propertyImageDetailsId || 0);
            formData.append('Id', params?.propertyId?.toString() ?? '0');
            formData.append('basicrefid', docRecordId || 0);
            formData.append('SaveAsDraft', isSaveAsDraft ? true : false);
            formData.append('isSubmitted', isSaveAsDraft ? false : true);

            if (params?.propertyId) {
                await axios
                    .post(`${process.env.REACT_APP_BASEURL}/api/PropertyPool/UpdatePropertyPool`, formData)
                    .then(async (response: any) => {
                        if (!response) return;
                        if (response?.data?.status === true) {
                            await submitNearbyBusinessDetails(params?.propertyId);
                            await submitLanlordDetails(params?.propertyId);
                            if (parseInt(propertyImageDetailsId) != 0) {
                                await axios.post(`${process.env.REACT_APP_BASEURL}/api/PropertyPool/UpdatePropertyPoolImages`, formData2).then((re) => {
                                    dispatch(showMessage('Property Successfully Updated!'));
                                    // submitLanlordDetails(params?.propertyId);
                                    // submitNearbyBusinessDetails(params?.propertyId);
                                    action.resetForm();
                                    setImageUpload({});
                                    setImagePreview({});
                                    setToggleSwitch({});
                                    setDocUploadHistory([]);
                                    setWaterSupply(moment(new Date()).format());
                                    setWaterToSupply(moment(new Date()).format());
                                    setPropertyImageDetailsId('');
                                    setTimeout(() => {
                                        navigate('/property-pool/undefined/add');
                                    }, 1000);
                                    setValues(propertyPoolInitialValues);
                                });
                            } else {
                                formData2.append('propertypoolID', params?.propertyId);
                                await axios.post(`${process.env.REACT_APP_BASEURL}/api/PropertyPool/InsertImagesForProperty`, formData2).then((re) => {
                                    dispatch(showMessage('Property Successfully Updated!'));
                                    action.resetForm();
                                    setImageUpload({});
                                    setImagePreview({});
                                    setToggleSwitch({});
                                    setDocUploadHistory([]);
                                    setWaterSupply(moment(new Date()).format());
                                    setWaterToSupply(moment(new Date()).format());
                                    setPropertyImageDetailsId('');
                                    navigate('/property-pool/undefined/add');
                                    setValues(null);
                                });
                            }
                            if (mandateCode && mandateCode?.id !== undefined) {
                                await axios
                                    .post(`${process.env.REACT_APP_BASEURL}/api/PropertyPool/UpdatePropertyPoolStatus?id=${response?.data?.data?.id}&status=${'Assigned'}&MandateId=${mandateCode?.id}`, {})
                                    .then((res: any) => {
                                        dispatch(showMessage('Property Updated Successfully!'));
                                    })
                                    .catch((e: any) => {});
                            }
                        }
                    })
                    .catch((e: any) => {});
            } else {
                formData.append('CreatedBy', user?.UserName);
                formData.append('UpdatedBy', user?.UserName);
                await axios
                    .post(`${process.env.REACT_APP_BASEURL}/api/PropertyPool/InsertPropertyPool`, formData)
                    .then(async (response: any) => {
                        if (!response) return;
                        if (response?.data?.status === true) {
                            formData2.append('propertypoolID', response?.data?.data?.id);
                            await submitNearbyBusinessDetails(response?.data?.data?.id);
                            await submitLanlordDetails(response?.data?.data?.id);
                            await axios.post(`${process.env.REACT_APP_BASEURL}/api/PropertyPool/InsertImagesForProperty`, formData2).then((re) => {
                                dispatch(showMessage('Property Inserted Successfully!'));
                                // submitLanlordDetails(response?.data?.data?.id);
                                // submitNearbyBusinessDetails(response?.data?.data?.id);
                                action.resetForm();
                                setImageUpload({});
                                setImagePreview({});
                                setToggleSwitch({});
                                setDocUploadHistory([]);
                                setWaterSupply(moment(new Date()).format());
                                setWaterToSupply(moment(new Date()).format());
                                setPropertyImageDetailsId('');
                                navigate('/property-pool/undefined/add');
                                setValues(null);
                            });
                            if (mandateCode && mandateCode?.id !== undefined) {
                                await axios
                                    .post(`${process.env.REACT_APP_BASEURL}/api/PropertyPool/UpdatePropertyPoolStatus?id=${response?.data?.data?.id}&status=${'Assigned'}&MandateId=${mandateCode?.id}`, {})
                                    .then((res: any) => {
                                        dispatch(showMessage('Property Inserted Successfully!'));
                                    })
                                    .catch((e: any) => {});
                            }
                        }
                    })
                    .catch((e: any) => {});
            }
        },
    });
    const removeImage = (v: any) => {
        delete imagePreview[v];
        setRemoveImagenName([...removeImagenName, v]);
        let data = { ...imagePreview };
        delete data[v];

        setImagePreview(data);
    };
    const getPropertyLandlordData = async (id: any) => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/PropertyLandlordDetails/GetLandlordDetailsById?Id=${id || 0}`)
            .then((response: any) => {
                if (!response) return;
                if (response && response?.data && response?.data?.length > 0) setTableData(response?.data);
            })
            .catch((e) => {});
    };

    const getPropertyNearbyBusinessData = async (id: any) => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/PropertyLandlordDetails/GetPropertyBusinessDetailsById?Id=${id || 0}`)
            .then((response: any) => {
                if (!response) return;
                if (response && response?.data && response?.data?.length > 0) {
                    var _data = response?.data.map((item) => {
                        return {
                            ...item,
                            nearby_outlet: item?.nearby_outlet || '',
                            same_building: item?.same_building || '',
                            inception_month_year: (moment(item?.inception_month_year).isValid() && moment(item?.inception_month_year).format('YYYY-MM-DDTHH:mm:ss.SSS')) || null,
                        };
                    });
                    setNearByBusinessData(_data);
                } else {
                    setNearByBusinessData([]);
                }
            })
            .catch((e) => {});
    };

    const getPropertyData = async (id: any) => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/PropertyPool/GetPropertyPool?id=${id}`)
            .then(async (response: any) => {
                setDocRecordId(response?.data?.basicrefid || 0);
                setFieldValue('rent', response?.data?.rpm || 0);
                setPropertyImageDetailsId(response?.data?.propertyImageDetailsId || 0);
                setToggleSwitch({
                    ...toggleSwitch,
                    washBasinAvailableInsideWashrooms: response?.data?.washBasinAvailableInsideWashrooms,
                    gstApplicable: response?.data?.isGstApplicable !== '' ? (response?.data?.isGSTApplicable ? true : false) : '',
                    keyAvailableInWashrooms: response?.data?.doorsLockKeyAvailableInwashrooms,
                    propertyTaxes: response?.data?.propertyTaxes !== '' ? (response?.data?.propertyTaxes?.toString() === 'BFL' ? true : false) : '',
                    nearByBusinessAvailable: response?.data?.nearByBusinessAvailable || false,
                    permissionAvailable: response?.data?.permissionOnTerraceForTwoAntennas,
                    spaceForSignage: response?.data?.spaceForSignage,
                    glowSignBoard: response?.data?.mainGlowSignBoard,
                    sideBoard: response?.data?.sideBoard,
                    tickerBoard: response?.data?.tickerBoard,
                    flangeBoard: response?.data?.flangeBoard,
                    brandingInStaircase: response?.data?.brandingInStaircase,
                    directionBoard: response?.data?.directionBoard,
                    vetrifiedFlooring: response?.data?.landlordProvideVetrifiedFlooring || false,
                    ventilationAvailable: response?.data?.ventilationAvailableInBranch,
                    grilledWindows: response?.data?.grilledWindowsInOfficeArea,
                    ventilationInWashroom: response?.data?.ventilationInWashroomArea,
                    grilledWindowsInWashroom: response?.data?.grilledWindowsInWashroomArea,
                    outdoorUnits: response?.data?.spaceForACOutdoorUnits,
                    spaceForDGSet: response?.data?.spaceForDGSet === false ? false : true,
                    premiseAccessability: response?.data?.premiseAccessability,
                    parkingAvailability: response?.data?.parkingAvailability || false,
                    agreementRegistrationApplicability: response?.data?.agreementRegistrationApplicability,
                    lockInBfl: response?.data?.isLockInForBFL === false ? false : true,
                    electricityConnectionAvailablity: response?.data?.electricityConnectionAvailablity,
                    electricityConnectionBornBy: response?.data?.electricityConnectionBornBy !== '' ? (response?.data?.electricityConnectionBornBy === 'BFL' ? true : false) : '',
                    waterSupplyAvailability: response?.data?.waterSupplyAvailability !== '' ? (response?.data?.waterSupplyAvailability?.trim() === 'Fixed Time' ? false : true) : '',
                    sinkWithTiles: response?.data?.sinkInPantryArea,
                    washroomAvailablity: response?.data?.washroomAvailablity,
                    toiletSeatTypeInMaleWashroom: response?.data?.toiletSeatTypeInMaleWashroom?.trim() === 'Indian' ? true : false,
                });
                setFieldValue('gstApplicable', response?.data?.isGSTApplicable === true ? true : false);
                setFieldValue('tds', response?.data?.tdsDeductionRPM || '');
                setFieldValue('gstNo', response?.data?.gstNo || '');
                setFieldValue('commercial_remarks', response?.data?.commercial_Status || '');
                setIsSubmitted(response?.data?.isSubmitted);
                setIsSaveAsDraft(response?.data?.saveAsDraft);
                setFieldValue('infra_requirement_remarks', response?.data?.infraRequirement_Status || '');
                setFieldValue('property_geo_details_remarks', response?.data?.propertyGeoDetails_Status || '');
                setFieldValue('property_infra_details_remarks', response?.data?.propertyInfraDetails_Status || '');
                setFieldValue('legal_remarks', response?.data?.legal_Status || '');
                setFieldValue('utility_remarks', response?.data?.utility_Status || '');
                setFieldValue('gstDeduction', response?.data?.gstDeductionRPM || 0);
                setFieldValue('securityAmount', response?.data?.securityDepositAmount || '');
                setFieldValue('maintenanceCharges', response?.data?.maintenanceCharges || 0);
                setFieldValue('totalExpencesPerMonth', response?.data?.totalFixedExpensesPerMonth || '');
                setFieldValue('propertyTaxes', response?.data?.propertyTaxes || '');
                setFieldValue('rentFreePeriod', response?.data?.rentFreePeriod || '');
                setFieldValue('rentEscelationFerq', response?.data?.rentEscelationFrequency || '');
                setFieldValue('rentEscelation', response?.data?.rentEscalation || '');
                setFieldValue('nameOfBuilding', response?.data?.nameOfTheBuilding || '');
                setFieldValue('floorNumberInBuilding', response?.data?.floorNumberInBuilding || '');
                setFieldValue('premisesAddress', response?.data?.premisesAddress || '');
                setFieldValue('pinCode', response?.data?.pinCode || '');
                setFieldValue('city', response?.data?.city || '');
                setFieldValue('state', response?.data?.state || '');
                setFieldValue('district', response?.data?.disctrict || '');
                setFieldValue('propertyCountry', response?.data?.country || '');
                setFieldValue('propertyStatus', response?.data?.propertyStatus || '');
                setFieldValue('promiseDistanceFromBusStation', response?.data?.premiseDistanceFromBST || '');
                setFieldValue('promiseDistanceFromRailwayStation', response?.data?.premiseDistanceFromRST || '');
                setFieldValue('wineShop', response?.data?.shopPresenceWithGeoTag || '');
                setFieldValue('competitorsPresence', response?.data?.competitorsPresence || '');
                setFieldValue('nearByBusinessAvailable', response?.data?.nearByBusinessAvailable ?? false);
                setFieldValue('permissionAvailable', response?.data?.permissionOnTerraceForTwoAntennas || false);
                setFieldValue('spaceForSignage', response?.data?.spaceForSignage || false);
                setFieldValue('glowSignBoard', response?.data?.mainGlowSignBoard || false);
                setFieldValue('sideBoard', response?.data?.sideBoard || false);
                setFieldValue('tickerBoard', response?.data?.tickerBoard || false);
                setFieldValue('flangeBoard', response?.data?.flangeBoard || false);
                setFieldValue('brandingInStaircase', response?.data?.brandingInStaircase || false);
                setFieldValue('directionBoard', response?.data?.directionBoard || false);
                setFieldValue('buildBy', (response?.data?.rccStrongRoomBuildBy && parseInt(response?.data?.rccStrongRoomBuildBy)) || 0);
                setFieldValue('buildComments', response?.data?.rccStrongRoomBuildComments || '');
                setFieldValue('floorSanction', (response?.data?.floorSanction && parseInt(response?.data?.floorSanction)) || 0);
                setFieldValue('totalConstructedFloorArea', response?.data?.totalConstructedFloorAreaInSFT || '');
                setFieldValue('totalCarpetArea', response?.data?.totalCarpetAreaInSFT || '');
                setFieldValue('chargeableArea', response?.data?.chargeableAreaInSFT || '');
                setFieldValue('vetrifiedFlooring', response?.data?.landlordProvideVetrifiedFlooring ?? false);
                setFieldValue('entranceType', (response?.data?.currentBranchEntranceType && parseInt(response?.data?.currentBranchEntranceType)) || 0);
                setFieldValue('providedDoor', response?.data?.grilledDoorProvidedByLandlord || 'true');
                setFieldValue('ventilationAvailable', response?.data?.ventilationAvailableInBranch || false);
                setFieldValue('grilledWindows', response?.data?.grilledWindowsInOfficeArea || false);
                setFieldValue('grilledWindowCount', response?.data?.grilledWindowCountForOfficeArea ?? 0);
                setFieldValue('grilledWindowNote', response?.data?.grilledWindowNoteForOfficeArea || '');
                setFieldValue('ventilationInWashroom', response?.data?.ventilationInWashroomArea || false);
                setFieldValue('grilledWindowsInWashroom', response?.data?.grilledWindowsInWashroomArea || false);
                setFieldValue('grilledWindowCountW', response?.data?.grilledWindowCountForWashroomArea ?? 0);
                setFieldValue('grilledWindowNoteW', response?.data?.grilledWindowNoteForWashroomArea || '');
                setFieldValue('outdoorUnits', response?.data?.spaceForACOutdoorUnits || 'true');
                setFieldValue('spaceForDGSet', response?.data?.spaceForDGSet);
                setFieldValue('premiseAccessability', response?.data?.premiseAccessability);
                setFieldValue('premiseAccessabilityNotAvailableReason', response?.data?.premiseAccessabilityNotAvailableReason);
                setFieldValue('parkingAvailability', response?.data?.parkingAvailability || false);
                setFieldValue('parkingType', response?.data?.parkingType || '');
                setFieldValue('numberOfCarParkingAvailable', response?.data?.numberOfCarParkingAvailable || 0);
                setFieldValue('numberOfBikeParkingAvailable', response?.data?.numberOfBikeParkingAvailable || 0);
                setFieldValue('landlordDetails', response?.data?.landlordDetails);

                setFieldValue('agreementRegistrationApplicability', response?.data?.agreementRegistrationApplicability);
                setFieldValue('agreementDuration', (+response?.data?.agreementDuration - 2)?.toString() || '');
                setFieldValue('lockInPremiseOwner', response?.data?.lockInForPremiseOwner?.toString() || '');
                setFieldValue('lockInBfl', response?.data?.isLockInForBFL === true ? true : false);
                setFieldValue('lockInForBfl', response?.data?.lockInForBFL?.toString() || '');
                setFieldValue('agreementRegistrationChargesBornBy', response?.data?.agreementRegistrationChargesBornBy);
                setFieldValue('bflShare', response?.data?.bflShare ?? 0);
                setFieldValue('landlordShare', response?.data?.landlordShare ?? 0);

                setFieldValue('rcc_bfl_share', response?.data?.rcc_bfl_share ?? 0);
                setFieldValue('rcc_landlord_share', response?.data?.rcc_landlord_share ?? 0);

                setFieldValue('electricityConnectionAvailablity', response?.data?.electricityConnectionAvailablity || false);
                setFieldValue('electricityPowerLoad', response?.data?.electricityPowerLoad == 0 ? 1 : response?.data?.electricityPowerLoad ? response?.data?.electricityPowerLoad : 1);
                setFieldValue('electricityConnectionBornBy', response?.data?.electricityConnectionBornBy);
                setFieldValue('waterSupplyAvailability', response?.data?.waterSupplyAvailability);
                setWaterSupply(moment(response?.data?.selectWaterSupplyTimings).format());
                setWaterToSupply(moment(response?.data?.selectWaterSupplyTimingsToTime).format());
                setFieldValue('waterSupply', moment(response?.data?.selectWaterSupplyTimings).format('LT'));
                setFieldValue('waterToSupply', moment(response?.data?.selectWaterSupplyTimingsToTime).format('LT'));
                setFieldValue('sinkWithTiles', response?.data?.sinkInPantryArea);
                setFieldValue('washroomAvailablity', response?.data?.washroomAvailablity);
                setFieldValue('washroomType', response?.data?.washroomType);
                setFieldValue('washroomAvailableCount', response?.data?.washroomAvailableCount ?? 0);
                setFieldValue('maleWashroomCount', response?.data?.maleWashroomCount ?? 0);
                setFieldValue('femaleWashroomCount', response?.data?.femaleWashroomCount || '');
                setFieldValue('urinalsAvailableInMaleWashroom', response?.data?.urinalsAvailableInMaleWashroom);
                setFieldValue('urinalsCountInMaleWashroom', response?.data?.urinalsCountInMaleWashroom ?? 0);
                setFieldValue('toiletSeatTypeInMaleWashroom', response?.data?.toiletSeatTypeInMaleWashroom !== '' ? (response?.data?.toiletSeatTypeInMaleWashroom === 'Indian' ? true : false) : '');
                setFieldValue('nameOfOwnership', response?.data?.ownership_Nature ?? '');
                setFieldValue('mottgageStatus', response?.data?.mortgage_Status ?? '');
                setFieldValue('nameOfBank', response?.data?.bank_Finance_Institution ?? '');
                setFieldValue('ageOfBuilding', response?.data?.age_Of_building ?? '');
                setFieldValue('toiletSeatCountInMaleWashroom', response?.data?.toiletSeatCountInMaleWashroom ?? 0);
                setFieldValue('toiletSeatCountInFemaleWashroom', response?.data?.toiletSeatCountInFemaleWashroom ?? 0);

                var imageTypeList = [
                    'PropertyFrontView',
                    'PropertyEntranceView',
                    'InteriorFrontView',
                    'InteriorRearView',
                    'OfficeEntranceView',
                    'PropertyLeftSideView',
                    'PropertyRightSideView',
                    'PropertyRearSideView',
                    'PropertyOppositeView',
                    // "",
                    'Washroom01View',
                    'Washroom02View',
                    'PropertyParkingImage',
                ];
                imageTypeList &&
                    imageTypeList?.map((item) => {
                        return _getImage(response?.data?.propertyImageDetailsId, item);
                    });
            })
            .catch((e) => {});
    };

    const handleLandlordChange = (e: any) => {
        var { name, value } = e?.target;
        if (name === 'landlord_permanent_add' && value !== landlordFormData['landlord_present_add']) {
            setChecked(false);
        }
        if (name === 'landlord_present_add' && value !== tableData && tableData[0]?.landlord_present_add) {
            setAddressCheck(false);
        }

        if (value?.replaceAll(' ', '') === '' && ['landlord_permanent_emailId', 'landlord_pan', 'landlord_aadhar', 'landlord_alternate_contact'].includes(name) == false) {
            setLandlordError({
                ...landlordError,
                [name]: `Please enter ${name?.replaceAll('_', ' ')}`,
            });
        }
        if (landlordError[name]) {
            delete landlordError[name];
            setLandlordError({ ...landlordError });
        }

        setLandlordFormData({ ...landlordFormData, [name]: value });
    };

    const handleLessorType = (e) => {
        if (landlordError[e.target.name]) {
            delete landlordError[e.target.name];
            setLandlordError({ ...landlordError });
        }
    };

    useEffect(() => {
        if (mandateInfo && mandateInfo !== null) {
            var _mandateInfo = mandateInfo && mandateInfo?.[0];
            setFieldValue('city', mandateInfo?.city || values?.city || '');
            setFieldValue('state', mandateInfo?.state || values?.state || '');
            setFieldValue('propertyCountry', mandateInfo?.country || values?.country || '');
            setFieldValue('district', mandateInfo?.district || values?.district || '');
        }
    }, [mandateInfo]);

    const submitLanlordForm = () => {
        // let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
        let regex = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
        let regexPan = new RegExp(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/);
        let regexAdhar = new RegExp(/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/);

        const err = {};

        if (!landlordFormData?.landlord_first_name || landlordFormData?.landlord_first_name?.replaceAll(' ', '') === '') {
            err['landlord_first_name'] = 'Please enter First Name';
        }
        if (!landlordFormData?.lessor_Type || landlordFormData?.lessor_Type?.replaceAll(' ', '') === '') {
            err['lessor_Type'] = 'Please select Lessor Type';
        }

        if (!landlordFormData?.landlord_contact || landlordFormData?.landlord_contact?.trim() === '') {
            err['landlord_contact'] = 'Please enter Landlords Primary Contact';
        }
        if (!landlordFormData?.landlord_present_add || landlordFormData?.landlord_present_add?.trim() === '') {
            err['landlord_present_add'] = 'Please enter Landlords_Present_Address ';
        }
        if (!landlordFormData?.landlord_permanent_add || landlordFormData?.landlord_permanent_add?.trim() === '') {
            err['landlord_permanent_add'] = 'Please enter Landlords_Permanent_Address ';
        }
        if (landlordFormData?.landlord_aadhar && landlordFormData?.landlord_aadhar?.length !== 12) {
            err['landlord_aadhar'] = 'Adhar card number must be 12 digits';
        }
        if (landlordFormData?.landlord_pan && landlordFormData?.landlord_pan?.length !== 10) {
            err['landlord_pan'] = 'Pancard number must be 10 digits';
        }

        if (landlordFormData?.landlord_contact && landlordFormData?.landlord_contact?.length !== 10) {
            err['landlord_contact'] = 'Contact number must be 10 digits';
        }

        if (landlordFormData?.landlord_contact?.[0] == '6' || landlordFormData?.landlord_contact?.[0] == '7' || landlordFormData?.landlord_contact?.[0] == '8' || landlordFormData?.landlord_contact?.[0] == '9') {
        } else {
            if (landlordFormData?.landlord_contact?.length) {
                err['landlord_contact'] = 'Contact number should start with 6,7,8,9';
            }
        }
        if (landlordFormData?.landlord_contact == '') {
            err['landlord_contact'] = 'Please enter Landlords Primary Contact';
        }
        if (landlordFormData?.landlord_contact?.[0] == '-') {
            err['landlord_contact'] = 'Invalid mobile number';
        }

        if (landlordFormData?.landlord_alternate_contact && landlordFormData?.landlord_alternate_contact?.length !== 10) {
            err['landlord_alternate_contact'] = 'Alternate Contact number must be 10 digits';
        }
        if (landlordFormData?.landlord_alternate_contact) {
            if (landlordFormData?.landlord_alternate_contact?.[0] == '6' || landlordFormData?.landlord_alternate_contact?.[0] == '7' || landlordFormData?.landlord_alternate_contact?.[0] == '8' || landlordFormData?.landlord_alternate_contact?.[0] == '9') {
            } else if (landlordFormData?.landlord_alternate_contact?.[0] == '-') {
                err['landlord_alternate_contact'] = 'Invalid mobile number';
            } else {
                err['landlord_alternate_contact'] = ' Alternate Contact number should start with 6,7,8,9';
            }
        }
        if (landlordFormData?.landlord_aadhar) {
            if (regexAdhar.test(landlordFormData?.landlord_aadhar) === false) {
                err['landlord_aadhar'] = 'Invalid Aadhaar Number ';
            } else {
            }
        }

        if (landlordFormData?.landlord_permanent_emailId && regex.test(landlordFormData?.landlord_permanent_emailId) === false) {
            err['landlord_permanent_emailId'] = 'Please enter valid Landlords Email Id';
        }
        if (landlordFormData?.landlord_pan && regexPan.test(landlordFormData?.landlord_pan?.toUpperCase()) === false) {
            err['landlord_pan'] = 'Please enter valid PAN Number';
        }
        if (Object.keys(err).length) {
            setLandlordError({ ...landlordError, ...err });
            return;
        }
        setChecked(false);
        setAddressCheck(false);
        landlordFormData['landlord_full_name'] = (landlordFormData?.landlord_first_name || '') + ' ' + (landlordFormData?.landlord_middle_name || '') + ' ' + (landlordFormData?.landlord_last_name || '');
        if (!edit) {
            landlordFormData['id'] = 0;
            landlordFormData['uid'] = '';
            landlordFormData['status'] = 'active';
            landlordFormData['createdBy'] = '';
            landlordFormData['modifiedBy'] = '';
            landlordFormData['createdOn'] = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
            landlordFormData['modifiedOn'] = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
            setTableData([...tableData, { ...landlordFormData }]);
            setLandlordFormData({ securityDeposite: false, rentToBePaid: false });
        } else {
            tableData[editIndex] = { ...landlordFormData };

            setTableData([...tableData]);
            gridRef.current.api.setRowData(tableData);
            setLandlordFormData({ securityDeposite: false, rentToBePaid: false });
            setEdit(false);

            gridRef.current.api.setRowData(tableData);
        }
    };

    useEffect(() => {}, [landlordFormData]);

    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    function readFiles(files) {
        const promises = [];
        const _fileData = Object.values(files);
        const _fileKeys = Object.keys(files);
        for (const key in files) {
            if (files.hasOwnProperty(key)) {
                promises.push(readFile(files[key]));
            }
        }
        return Promise.all(promises).then((results) => {
            if (results?.length === 0) return [];
            const fileContents = [];
            for (let i = 0; i < results?.length; i++) {
                const fileContent = results[i];
                const fileInfo: any = _fileData[i];
                const key = _fileKeys[i];
                fileContents.push({
                    imageType: key || '',
                    fileName: fileInfo?.name || '',
                    fileType: fileInfo?.type || '',
                    fileData: fileContent?.split(',')[1] || '',
                });
            }

            return fileContents;
        });
    }

    const submitNearByBusinessForm = async () => {
        const err = {};
        if (!nearByFormData?.nearby_outlet) {
            err['nearby_outlet'] = 'Please select Any Nearby Business Outlet';
        }
        if (!nearByFormData?.same_building) {
            err['same_building'] = 'Please select Are they in same building';
        }
        if (!nearByFormData?.business_type) {
            err['business_type'] = 'Please select Business Type';
        }
        if (!nearByFormData?.business_full_name) {
            err['business_full_name'] = 'Please enter Business Full Name';
        }
        if (!nearByFormData?.others_business_type && nearByFormData?.business_type_value?.formName === 'Others') {
            err['others_business_type'] = 'Please enter Specify The Type Of Business';
        }
        if (!nearByFormData?.floor) {
            err['floor'] = 'Please select Floor';
        }
        if (!nearByFormData?.carpet_area) {
            err['carpet_area'] = 'Please enter Carpet Area';
        }
        if (!nearByFormData?.monthly_rent) {
            err['monthly_rent'] = 'Please enter Monthly Rent';
        }
        if (!nearByFormData?.maintenance_amount) {
            err['maintenance_amount'] = 'Please enter Monthly Maintenance Amount';
        }

        if (!nearByFormData?.lease_period) {
            err['lease_period'] = 'Please enter Lease Period(In Months)';
        }
        if (!nearByFormData?.inception_month_year) {
            err['inception_month_year'] = 'Please enter Inception Month & Year';
        }
        if (nearByFormData?.inception_month_year && !moment(nearByFormData?.inception_month_year).isValid()) {
            err['inception_month_year'] = 'Please enter valid Inception Month & Year';
        }
        if (!nearByFormData?.distance) {
            err['distance'] = 'Please enter Distance from proposed location(In meters)';
        }

        if (Object.keys(err).length) {
            setNearByError({ ...nearByError, ...err });
            return;
        }

        if (!editNb) {
            nearByFormData['id'] = 0;
            nearByFormData['uid'] = '';
            nearByFormData['status'] = 'active';
            nearByFormData['createdBy'] = '';
            nearByFormData['modifiedBy'] = '';
            nearByFormData['createdOn'] = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
            nearByFormData['modifiedOn'] = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
            nearByFormData['images'] = imagesNB;
            nearByFormData['imagesPreview'] = imagePreviewNB;
            nearByFormData['businessImagesDeleted'] = removeImagenNameNB;
            nearByFormData['businessImages'] = await readFiles(imagesNB);
            setNearByBusinessData([...nearByBusinessData, { ...nearByFormData }]);
            // setNearByFormData({});
            // setImagesNB({});
            // setErrorMsgNB({});
            // setImagePreviewNB({});
        } else {
            nearByFormData['images'] = imagesNB;
            nearByFormData['imagesPreview'] = imagePreviewNB;
            nearByFormData['businessImages'] = await readFiles(imagesNB);
            nearByFormData['businessImagesDeleted'] = removeImagenNameNB;
            nearByBusinessData[editIndexNb] = { ...nearByFormData };
            setNearByBusinessData([...nearByBusinessData]);
            gridRef2.current.api.setRowData(nearByBusinessData);
            // setNearByFormData({});
            // setNearByFormData({});
            // setImagesNB({});
            // setErrorMsgNB({});
            // setImagePreviewNB({});
            setEditNb(false);
            gridRef2.current.api.setRowData(nearByBusinessData);
        }
        setOpenNearBy(false);
        setEditFlagNB(false);
        setNearByFormData({});
        setImagesNB({});
        setErrorMsgNB({});
        setImagePreviewNB({});
    };
    console.log('nearbyBusiness', nearByBusinessData);
    const submitLanlordDetails = async (Id) => {
        tableData?.map((item) => {
            item['fk_property_id'] = Id;
            !item['landlord_occupation'] && (item['landlord_occupation'] = '');
            !item['landlord_permanent_emailId'] && (item['landlord_permanent_emailId'] = '');
            !item['landlord_alternate_contact'] && (item['landlord_alternate_contact'] = '');
            !item['landlord_pan'] && (item['landlord_pan'] = '');
            !item['landlord_aadhar'] && (item['landlord_aadhar'] = '');
            !item['landlord_last_name'] && (item['landlord_last_name'] = '');
            !item['landlord_middle_name'] && (item['landlord_middle_name'] = '');
            !item['rentToBePaid'] && (item['rentToBePaid'] = false);
            !item['securityDeposite'] && (item['securityDeposite'] = false);
        });

        await axios
            .post(`${process.env.REACT_APP_BASEURL}/api/PropertyLandlordDetails/InsertUpdateLandlordDetails`, tableData)
            .then(async (response: any) => {
                setTableData([]);
                if (!response) return;
            })
            .catch((e: any) => {});
    };

    const getVersionHistoryData = (recId) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${mandateCode?.id || 0}&documentType=Property Documents&recordId=${recId || 0}`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response?.data && response?.data && response?.data?.length > 0) {
                    var data = groupByDocumentData(response?.data, 'versionNumber');
                    setDocUploadHistory(data || []);
                }
                if (response && response?.data?.length === 0) {
                    setDocUploadHistory([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    const getMasterData = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName`)
            .then((response: any) => {
                setFloorNumber(response?.data?.filter((v) => v?.masterName == 'Floor Number'));
                setPropertyStatus(response?.data?.filter((v) => v?.masterName == 'Property Status'));
                setRccStrongRoom(response?.data?.filter((v) => v?.masterName == 'RCC Strong room to be build by'));
                setPremise(response?.data?.filter((v) => v?.masterName == 'Premise'));
                setParkingType(response?.data?.filter((v) => v?.masterName == 'Parking Type'));
                setAggrementRegisterationCharges(response?.data?.filter((v) => v?.masterName == 'Aggrement registeration charges'));
                setWashroomType(response?.data?.filter((v) => v?.masterName == 'Washroon Type'));
                setLessorType(response?.data?.filter((v) => v?.masterName == 'Lessor Type'));
                setnameOfOwnership(response?.data?.filter((v) => v?.masterName == 'Nature of Ownership'));
                setAgeOfBuilding(response?.data?.filter((v) => v?.masterName == 'Age of the Building'));
                setMottgageStatus(response?.data?.filter((v) => v?.masterName == 'Mortgage Status'));
                setCurrentBranchEntranceType(response?.data?.filter((v) => v?.masterName == 'Current Branch Entrance Type' && v?.status === 'Active'));
                setBusinessType(response?.data?.filter((v) => v?.masterName == 'Business Type'));
            })
            .catch((e: any) => {});
    };

    useEffect(() => {
        getMasterData();
    }, []);

    const handleUploadFiles = async (e, files, id) => {
        const uploaded = [...uploadedFiles];
        e.target.value = null;
        let limitExceeded = false;
        files &&
            files?.some((file) => {
                if (uploaded && uploaded?.findIndex((f) => f.name === file.name) === -1) {
                    uploaded.push(file);
                    if (uploaded?.length === MAX_COUNT) setFileLimit(true);
                    if (uploaded?.length > MAX_COUNT) {
                        dispatch(fetchError(`You can only add a maximum of ${MAX_COUNT} files` || ''));
                        setFileLimit(false);
                        e.target.value = null;
                        limitExceeded = true;
                        return;
                    }
                }
            });
        if (limitExceeded) {
            dispatch(fetchError(`You can only add a maximum of ${MAX_COUNT} files` || ''));
            e.target.value = null;

            return;
        }

        if (!limitExceeded) setUploadedFiles(uploaded);
        setFileLength((uploaded && uploaded?.length) || 0);
        const formData: any = new FormData();

        formData.append('mandate_id', mandateCode?.id || 0);
        formData.append('documenttype', 'Property Documents');
        formData.append('CreatedBy', user?.UserName || '');
        formData.append('ModifiedBy', user?.UserName || '');
        formData.append('entityname', 'Property Documents');
        formData.append('RecordId', id || 0);
        formData.append('remarks', 'Property Document Upload');

        uploaded &&
            uploaded?.map((file) => {
                formData.append('file', file);
            });
        if (uploaded?.length === 0) {
            e.target.value = null;
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError('Error Occurred !'));
            return;
        }

        if (id !== undefined) {
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/FileUpload`, formData)
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
                        getVersionHistoryData(id || 0);
                        return;
                    } else if (response?.status === 200) {
                        setUploadedFiles([]);
                        setFileLimit(false);
                        dispatch(showMessage('Documents are uploaded successfully!'));
                        getVersionHistoryData(id || 0);
                    }
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
        }
    };

    const handleFileEvent = (e) => {
        if (values?.pinCode == '' || values?.nameOfBuilding == '') {
            dispatch(fetchError('Please enter Pincode and Name of Building !'));
            e.target.value = null;
            return;
        }
        const chosenFiles = Array.prototype.slice.call(e.target.files);
        if (_validationMaxFileSizeUpload(e, dispatch)) {
            if (docRecordId !== null && docRecordId !== 0) {
                handleUploadFiles(e, chosenFiles, docRecordId);
            } else {
                getRecordIDForDocUpload(e, chosenFiles);
            }
        }
    };

    const onPrint = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/PropertyPool/GetPropertyPoolPDF?id=${params?.propertyId || 0}&mandateid=${mandateCode?.id || 0}`)
            .then((res) => {
                console.log('res', res);
                if (!res) {
                    dispatch(fetchError('Download Failed!'));
                    return;
                }
                if (res && res?.data) {
                    const linkSource = `data:application/pdf;base64,${res?.data}`;
                    const downloadLink = document.createElement('a');
                    const fileName = `Property_${params?.propertyId}.pdf`;

                    downloadLink.href = linkSource;
                    downloadLink.download = fileName;
                    downloadLink.click();
                    dispatch(showMessage('Download Property Successfull!'));
                } else {
                    dispatch(fetchError('Download Failed!'));
                    return;
                }
            })
            .catch((err) => {});
    };

    const submitNearbyBusinessDetails = async (Id) => {
        var _data =
            nearByBusinessData &&
            nearByBusinessData.map((item) => {
                return {
                    ...item,
                    nearby_outlet: item?.nearby_outlet || '',
                    business_full_name: item?.business_full_name || '',
                    same_building: item?.same_building || '',
                    carpet_area: (item?.carpet_area && parseInt(item?.carpet_area)) || 0,
                    monthly_rent: (item?.monthly_rent && parseInt(item?.monthly_rent)) || 0,
                    maintenance_amount: (item?.maintenance_amount && parseInt(item?.maintenance_amount)) || 0,
                    lease_period: (item?.lease_period && parseInt(item?.lease_period)) || 0,
                    distance: (item?.distance && parseInt(item?.distance)) || 0,
                    fk_property_id: Id || 0,
                    inception_month_year: (moment(item?.inception_month_year).isValid() && moment(item?.inception_month_year).format('YYYY-MM-DDTHH:mm:ss.SSS')) || null,
                    businessImages: item?.businessImages || [],
                    businessImagesDeleted: item?.businessImagesDeleted || [],
                };
            });

        await axios
            .post(`${process.env.REACT_APP_BASEURL}/api/PropertyLandlordDetails/InsertUpdatePropertyBusinessDetails`, _data)
            .then(async (response: any) => {
                if (!response) return;
                setNearByBusinessData([]);
            })
            .catch((e: any) => {});
    };
    useEffect(() => {
        if (mandateCode?.id && pincode !== undefined) {
            setFieldValue('pinCode', pincode || '');
        }
    }, [mandateCode, setMandateCode]);

    useEffect(() => {
        if (pincode !== undefined) setFieldValue('pinCode', pincode || '');
    }, [pincode, setpincode]);

    const handleAddressChekbox = (event) => {
        setAddressCheck(event.target.checked);
        if (event.target.checked) {
            setLandlordFormData({
                ...landlordFormData,
                ['landlord_present_add']: tableData.length && tableData[0]?.landlord_present_add,
            });
            delete landlordError['landlord_present_add'];
            setLandlordError({ ...landlordError });
        } else {
            setLandlordFormData({
                ...landlordFormData,
                ['landlord_present_add']: '',
            });
            setLandlordError({
                ...landlordError,
                ['landlord_present_add']: 'Please enter Landlords_Present_Address',
            });
        }
    };
    const handleChekbox = (event) => {
        setChecked(event.target.checked);
        if (event.target.checked) {
            setLandlordFormData({
                ...landlordFormData,
                ['landlord_permanent_add']: landlordFormData?.landlord_present_add,
            });
            delete landlordError['landlord_permanent_add'];
            setLandlordError({ ...landlordError });
        } else {
            setLandlordFormData({
                ...landlordFormData,
                ['landlord_permanent_add']: '',
            });
            setLandlordError({
                ...landlordError,
                ['landlord_permanent_add']: 'Please enter Landlords_Permanent_Address',
            });
        }
    };
    useEffect(() => {
        resetForm({
            values: {
                ...values,
                nameOfBank: '',
            },
        });
    }, [values?.mottgageStatus]);
    useEffect(() => {
        if (toggleSwitch?.grilledWindows === true) {
            resetForm({
                values: {
                    ...values,
                    grilledWindowNote: '',
                },
            });
        } else {
            resetForm({
                values: {
                    ...values,
                    grilledWindowCount: '',
                },
            });
        }
    }, [toggleSwitch?.grilledWindows]);
    useEffect(() => {
        if (toggleSwitch?.grilledWindowsInWashroom === true) {
            resetForm({
                values: {
                    ...values,
                    grilledWindowNoteW: '',
                },
            });
        } else {
            resetForm({
                values: {
                    ...values,
                    grilledWindowCountW: '',
                },
            });
        }
    }, [toggleSwitch?.grilledWindowsInWashroom]);

    return (
        <>
            <Dialog
                className="dialog-wrap"
                open={openNearBy}
                fullWidth
                maxWidth="xl"
                onClose={() => {
                    setNearByFormData({});
                    setOpenNearBy(false);
                }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" style={{ paddingRight: 20, fontSize: 16, color: '#000' }}>
                    {editFlagNB ? 'Update Competitors' : 'Add Competitors'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <NearbyBusinessForm
                            removeImagenNameNB={removeImagenNameNB}
                            setRemoveImagenNameNB={setRemoveImagenNameNB}
                            imagesNB={imagesNB}
                            setImagesNB={setImagesNB}
                            imageErrorNB={imageErrorNB}
                            setImageErrorNB={setImageErrorNB}
                            errorMsgNB={errorMsgNB}
                            deletedBusinessImageList={deletedBusinessImageList}
                            SetDeleteBusinessImageList={SetDeleteBusinessImageList}
                            setErrorMsgNB={setErrorMsgNB}
                            imagePreviewNB={imagePreviewNB}
                            setImagePreviewNB={setImagePreviewNB}
                            editNb={editNb}
                            setNearByError={setNearByError}
                            nearByError={nearByError}
                            nearByFormData={nearByFormData}
                            setNearByFormData={setNearByFormData}
                            dropdownList={dropdownList}
                            statusP={statusP}
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions className="button-wrap">
                    {statusP !== 'Approve' ? (
                        <Button
                            className="yes-btn"
                            onClick={() => {
                                if (nearByBusinessData?.length >= 10) {
                                    dispatch(fetchError('Maximum 10 records can be added'));
                                    return;
                                }
                                submitNearByBusinessForm();
                            }}
                        >
                            {editFlagNB ? 'Update' : 'Add'}
                        </Button>
                    ) : null}
                    <Button
                        className="no-btn"
                        onClick={() => {
                            setOpenNearBy(false);
                            setNearByFormData({});
                            setNearByError({});
                            setEditFlagNB(false);
                            setImagesNB({});
                            setErrorMsgNB({});
                            setImagePreviewNB({});
                        }}
                        autoFocus
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
            <Grid
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {!window.location.pathname.includes('final-property') && (
                    <Box component="h2" className="page-title-heading my-6">
                        {statusP === 'Approve' ? 'View Property' : 'Add Property'}
                    </Box>
                )}
            </Grid>
            <div style={{ backgroundColor: '#fff', padding: '0px', borderRadius: '5px' }}>
                <MandateInfo
                    mandateCode={mandateCode}
                    source=""
                    pageType="propertyAdd"
                    redirectSource={`${params?.source}`}
                    setMandateCode={setMandateCode}
                    setMandateData={setMandateData}
                    setpincode={setpincode}
                    setCurrentStatus={setCurrentStatus}
                    setCurrentRemark={setCurrentRemark}
                    disabledStatus={statusP === 'Approve' ? true : false}
                    propertyId={+params?.propertyId}
                />
                <div className="inside-scroll-268">
                    {window.location.pathname?.includes('/final-property') ? (
                        <FinalPropertyReadOnly />
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="profile inside-scroll-269">
                                <Accordion defaultExpanded={true} expanded={expanded === 'panel1'} onChange={handleChangeAccordian('panel1')}>
                                    <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                                        <Typography style={accordionTitle}>COMMERCIAL</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid marginBottom="30px" container item spacing={5} justifyContent="start" alignSelf="center">
                                            <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Rent per month
                                                </Typography>
                                                <TextField
                                                    defaultValue="1800"
                                                    autoComplete="off"
                                                    size="small"
                                                    name="rent"
                                                    id="rent"
                                                    value={values?.rent || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        setFieldValue('securityAmount', +e.target.value * 3);
                                                        setFieldValue('totalExpencesPerMonth', +e.target.value + +e.target.value * (+values?.gstDeduction / 100) + +values?.maintenanceCharges);
                                                    }}
                                                    // onKeyDown={(e: any) => {
                                                    //   blockInvalidChar(e);
                                                    //   if (!/[0-9]/.test(e.key)) {
                                                    //     e.preventDefault();
                                                    //   }
                                                    //   regExpressionTextField(e);
                                                    //   if (e.which === 32 && !e.target.value.length)
                                                    //     e.preventDefault();
                                                    // }}
                                                    onKeyDown={(e: any) => {
                                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                            e.preventDefault();
                                                        }
                                                        if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {touched?.rent && errors?.rent ? <p className="form-error">{errors?.rent}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    TDS deduction % @ rent/month
                                                </Typography>
                                                <TextField
                                                    defaultValue="1800"
                                                    autoComplete="off"
                                                    size="small"
                                                    name="tds"
                                                    id="tds"
                                                    value={values?.tds || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={(e: any) => {
                                                        if (e.target.value >= 0) {
                                                            handleChange(e);
                                                        }
                                                    }}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {touched?.tds && errors?.tds ? <p className="form-error">{errors?.tds}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    GST Applicable
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.gstApplicable}
                                                    handleChange={(e: any) => {
                                                        setFieldValue('gstApplicable', e.target.value === 'true' ? true : false);
                                                        handleChangeToggle(e, 'gstApplicable');
                                                        if (e.target.value === 'false') {
                                                            setFieldValue('gstNo', '');
                                                        }
                                                        setFieldValue('totalExpencesPerMonth', (e.target.value === 'false' ? 0 : +values?.rent * (+values?.gstDeduction / 100)) + +values?.rent + +values?.maintenanceCharges);
                                                    }}
                                                    yes={'yes'}
                                                    no={'no'}
                                                    name={'gstApplicable'}
                                                    id="gstApplicable"
                                                    onBlur={handleBlur}
                                                    disabled={statusP === 'Approve'}
                                                    bold={'true'}
                                                />
                                                {touched?.gstApplicable && errors?.gstApplicable ? <p className="form-error">{errors?.gstApplicable}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                                                <Typography className={'add-prop-bold'} sx={toggleTitle}>
                                                    GST Number
                                                </Typography>
                                                <TextField
                                                    autoComplete="off"
                                                    size="small"
                                                    name="gstNo"
                                                    type="text"
                                                    id="gstNo"
                                                    value={values?.gstNo || ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    disabled={toggleSwitch?.gstApplicable === false || statusP === 'Approve'}
                                                    onKeyDown={(e: any) => {
                                                        blockInvalidChar(e);
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {toggleSwitch?.gstApplicable === true && touched?.gstNo && errors?.gstNo ? <p className="form-error">{errors?.gstNo}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                                                <Typography className={toggleSwitch?.gstApplicable === true ? 'add-prop-bold required' : 'add-prop-bold'} sx={toggleTitle}>
                                                    GST Deduction % @ rent/month
                                                </Typography>
                                                <TextField
                                                    defaultValue="1800"
                                                    size="small"
                                                    name="gstDeduction"
                                                    id="gstDeduction"
                                                    value={toggleSwitch?.gstApplicable === false ? 0 : values?.gstDeduction}
                                                    disabled={toggleSwitch?.gstApplicable === false || statusP === 'Approve'}
                                                    onChange={(e: any) => {
                                                        if (e.target.value >= 0) {
                                                            handleChange(e);
                                                            setFieldValue('totalExpencesPerMonth', +values?.rent * (toggleSwitch?.gstApplicable === false ? 0 : +e.target.value / 100) + +values?.rent + +values?.maintenanceCharges);
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {toggleSwitch?.gstApplicable === true && touched?.gstDeduction && errors?.gstDeduction ? <p className="form-error">{errors?.gstDeduction}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Security Deposit Amount
                                                </Typography>
                                                <TextField
                                                    defaultValue={+values?.rent * 3}
                                                    size="small"
                                                    name="securityAmount"
                                                    type="number"
                                                    id="securityAmount"
                                                    value={values?.securityAmount || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={(e: any) => {
                                                        if (e.target.value >= 0) {
                                                            handleChange(e);
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        blockInvalidChar(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {touched?.securityAmount && errors?.securityAmount ? <p className="form-error">{errors?.securityAmount}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Maintenance Charges
                                                </Typography>
                                                <TextField
                                                    defaultValue="5400"
                                                    size="small"
                                                    name="maintenanceCharges"
                                                    id="maintenanceCharges"
                                                    value={values?.maintenanceCharges}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        setFieldValue('totalExpencesPerMonth', +e.target.value + +values?.rent + +values?.rent * (+values?.gstDeduction / 100));
                                                    }}
                                                    onBlur={handleBlur}
                                                    // onKeyDown={(e: any) => {
                                                    //   regExpressionTextField(e);
                                                    //   if (e.which === 32 && !e.target.value.length)
                                                    //     e.preventDefault();
                                                    // }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onKeyDown={(e: any) => {
                                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                            e.preventDefault();
                                                        }
                                                        if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                />
                                                {touched?.maintenanceCharges && errors?.maintenanceCharges ? <p className="form-error">{errors?.maintenanceCharges}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Total fixed expenses per month(Inc Taxes)
                                                </Typography>
                                                <TextField
                                                    defaultValue={+values?.rent + +values?.gstDeduction + +values?.maintenanceCharges}
                                                    size="small"
                                                    name="totalExpencesPerMonth"
                                                    type="number"
                                                    id="totalExpencesPerMonth"
                                                    value={values?.totalExpencesPerMonth || ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    disabled={true}
                                                />
                                                {touched?.totalExpencesPerMonth && errors?.totalExpencesPerMonth ? <p className="form-error">{errors?.totalExpencesPerMonth}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Property Taxes
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.propertyTaxes}
                                                    handleChange={(e: any) => {
                                                        handleChangeToggle(e, 'propertyTaxes');
                                                        setFieldValue('propertyTaxes', e.target.value === 'true' ? true : false);
                                                    }}
                                                    yes={'BFL'}
                                                    no={'Landlord'}
                                                    name="propertyTaxes"
                                                    id="propertyTaxes"
                                                    onBlur={handleBlur}
                                                    disabled={statusP === 'Approve'}
                                                    bold="true"
                                                />
                                                {touched?.propertyTaxes && errors?.propertyTaxes ? <p className="form-error">{errors?.propertyTaxes}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Rent Free Period(in days)
                                                </Typography>
                                                <TextField
                                                    defaultValue="5400"
                                                    size="small"
                                                    name="rentFreePeriod"
                                                    id="rentFreePeriod"
                                                    value={values?.rentFreePeriod || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    // onKeyDown={(e: any) => {
                                                    //   regExpressionTextField(e);
                                                    //   if (e.which === 32 && !e.target.value.length)
                                                    //     e.preventDefault();
                                                    // }}
                                                    onKeyDown={(e: any) => {
                                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                            e.preventDefault();
                                                        }
                                                        if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {touched?.rentFreePeriod && errors?.rentFreePeriod ? <p className="form-error">{errors?.rentFreePeriod}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Rent escalation freq.(In years)
                                                </Typography>
                                                <TextField
                                                    defaultValue="5400"
                                                    size="small"
                                                    name="rentEscelationFerq"
                                                    id="rentEscelationFerq"
                                                    value={values?.rentEscelationFerq || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    // onKeyDown={(e : any) => {
                                                    //   regExpressionTextField(e);
                                                    //   if (e.which === 32 && !e.target.value.length)
                                                    //     e.preventDefault();
                                                    // }}
                                                    onKeyDown={(e: any) => {
                                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                            e.preventDefault();
                                                        }
                                                        if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {touched?.rentEscelationFerq && errors?.rentEscelationFerq ? <p className="form-error">{errors?.rentEscelationFerq}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Rent escalation (%)
                                                </Typography>
                                                <TextField
                                                    defaultValue="5400"
                                                    size="small"
                                                    name="rentEscelation"
                                                    id="rentEscelation"
                                                    value={values?.rentEscelation || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    // onKeyDown={(e:any) => {
                                                    //   regExpressionTextField(e);
                                                    //   if (e.which === 32 && !e.target.value.length)
                                                    //     e.preventDefault();
                                                    // }}
                                                    onKeyDown={(e: any) => {
                                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                            e.preventDefault();
                                                        }
                                                        if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {touched?.rentEscelation && errors?.rentEscelation ? <p className="form-error">{errors?.rentEscelation}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={4} lg={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Remarks
                                                </Typography>
                                                <TextField
                                                    multiline
                                                    type="text"
                                                    defaultValue="5400"
                                                    size="small"
                                                    name="commercial_remarks"
                                                    id="commercial_remarks"
                                                    value={values?.commercial_remarks || ''}
                                                    disabled={statusP === 'Approve'}
                                                    sx={statusP === 'Approve' ? { backgroundColor: '#f3f3f3' } : null}
                                                    onChange={handleChange}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionRemark(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.commercial_remarks && errors?.commercial_remarks ? <p className="form-error">{errors?.commercial_remarks}</p> : null}
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel2'} onChange={handleChangeAccordian('panel2')}>
                                    <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
                                        <Typography style={accordionTitle}>PROPERTY GEO DETAILS</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid marginBottom="30px" container item spacing={5} justifyContent="start" alignSelf="center">
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Name of Building/Complex
                                                </Typography>
                                                <TextField
                                                    id="nameOfBuilding"
                                                    name="nameOfBuilding"
                                                    autoComplete="false"
                                                    defaultValue="Name"
                                                    size="small"
                                                    value={values?.nameOfBuilding || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={handleChange}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.nameOfBuilding && errors?.nameOfBuilding ? <p className="form-error">{errors?.nameOfBuilding}</p> : null}
                                            </Grid>

                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Floor Number
                                                </Typography>
                                                <DropdownMenu
                                                    state={values?.floorNumberInBuilding}
                                                    handleChange={handleChange}
                                                    title=""
                                                    menu={FloorNumber?.map((v: any) => v?.formName)}
                                                    name="floorNumberInBuilding"
                                                    id="floorNumberInBuilding"
                                                    value={values?.floorNumberInBuilding || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.floorNumberInBuilding && errors?.floorNumberInBuilding ? <p className="form-error">{errors?.floorNumberInBuilding}</p> : null}
                                            </Grid>

                                            <Grid item xs={6} md={6} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Premises Address
                                                </Typography>
                                                <TextField
                                                    id="premisesAddress"
                                                    name="premisesAddress"
                                                    autoComplete="true"
                                                    defaultValue="Ground floor Mantri matket..."
                                                    size="small"
                                                    value={values?.premisesAddress || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={handleChange}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.premisesAddress && errors?.premisesAddress ? <p className="form-error">{errors?.premisesAddress}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Pin Code
                                                </Typography>
                                                <TextField
                                                    id="pinCode"
                                                    name="pinCode"
                                                    autoComplete="false"
                                                    defaultValue="411014"
                                                    type="text"
                                                    size="small"
                                                    disabled={mandateInfo?.pincode && mandateCode?.id !== undefined ? true : statusP === 'Approve' ? true : false}
                                                    value={values?.pinCode || ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    InputProps={{ inputProps: { min: 0, maxLength: 6 } }}
                                                    onKeyDown={(event) => {
                                                        if (!/[0-9]/.test(event.key) && event.key != 'Backspace') {
                                                            event.preventDefault();
                                                        }
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {touched?.pinCode && errors?.pinCode ? <p className="form-error">{errors?.pinCode}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    City
                                                </Typography>
                                                <TextField
                                                    id="city"
                                                    name="city"
                                                    autoComplete="false"
                                                    defaultValue="Pune"
                                                    size="small"
                                                    disabled={(mandateInfo?.city && mandateCode?.id !== undefined) || statusP === 'Approve'}
                                                    value={values?.city || ''}
                                                    onChange={handleChange}
                                                    InputProps={{ inputProps: { min: 0, maxLength: 20 } }}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        if (/[0-9]/.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.city && errors?.city ? <p className="form-error">{errors?.city}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    District
                                                </Typography>
                                                <TextField
                                                    id="district"
                                                    name="district"
                                                    value={values?.district || ''}
                                                    disabled={(mandateInfo?.district && mandateCode?.id !== undefined) || statusP === 'Approve'}
                                                    defaultValue="5400"
                                                    autoComplete="off"
                                                    size="small"
                                                    onChange={handleChange}
                                                    InputProps={{ inputProps: { min: 0, maxLength: 20 } }}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        if (/[0-9]/.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.district && errors?.district ? <p className="form-error">{errors?.district}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    State
                                                </Typography>
                                                <TextField
                                                    id="state"
                                                    name="state"
                                                    autoComplete="true"
                                                    defaultValue="Maharastra"
                                                    size="small"
                                                    disabled={(mandateInfo?.state && mandateCode?.id !== undefined) || statusP === 'Approve'}
                                                    value={values?.state || ''}
                                                    onChange={handleChange}
                                                    InputProps={{ inputProps: { min: 0, maxLength: 20 } }}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        if (/[0-9]/.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.state && errors?.state ? <p className="form-error">{errors?.state}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Country
                                                </Typography>
                                                <TextField
                                                    id="propertyCountry"
                                                    autoComplete="true"
                                                    name="propertyCountry"
                                                    defaultValue="5400"
                                                    size="small"
                                                    disabled={(mandateInfo?.country && mandateCode?.id !== undefined) || statusP === 'Approve'}
                                                    value={values?.propertyCountry || ''}
                                                    onChange={handleChange}
                                                    InputProps={{ inputProps: { min: 0, maxLength: 20 } }}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        if (/[0-9]/.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.propertyCountry && errors?.propertyCountry ? <p className="form-error">{errors?.propertyCountry}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Property Status
                                                </Typography>
                                                <DropdownMenu
                                                    state={values?.propertyStatus || ''}
                                                    handleChange={handleChange}
                                                    title=""
                                                    menu={PropertyStatus?.map((v: any) => v?.formName)}
                                                    name="propertyStatus"
                                                    id="propertyStatus"
                                                    value={values?.propertyStatus || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.propertyStatus && errors?.propertyStatus ? <p className="form-error">{errors?.propertyStatus}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold10" sx={toggleTitle}>
                                                    Distance from Bus Stand (In Meters)
                                                </Typography>
                                                <TextField
                                                    id="promiseDistanceFromBusStation"
                                                    name="promiseDistanceFromBusStation"
                                                    defaultValue="1 Km"
                                                    size="small"
                                                    value={values?.promiseDistanceFromBusStation || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={handleChange}
                                                    // onKeyDown={(e: any) => {
                                                    //   regExpressionTextField(e);
                                                    //   if (e.which === 32 && !e.target.value.length)
                                                    //     e.preventDefault();
                                                    // }}
                                                    onKeyDown={(e: any) => {
                                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                            e.preventDefault();
                                                        }
                                                        if (!/[a-zA-Z0-9]+/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.promiseDistanceFromBusStation && errors?.promiseDistanceFromBusStation ? <p className="form-error">{errors?.promiseDistanceFromBusStation}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold10" sx={toggleTitle}>
                                                    Distance from Railway Station (In Meters)
                                                </Typography>
                                                <TextField
                                                    id="promiseDistanceFromRailwayStation"
                                                    name="promiseDistanceFromRailwayStation"
                                                    defaultValue="2 Km"
                                                    size="small"
                                                    value={values?.promiseDistanceFromRailwayStation || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={handleChange}
                                                    // onKeyDown={(e: any) => {
                                                    //   regExpressionTextField(e);
                                                    //   if (e.which === 32 && !e.target.value.length)
                                                    //     e.preventDefault();
                                                    // }}
                                                    onKeyDown={(e: any) => {
                                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                            e.preventDefault();
                                                        }
                                                        if (!/[a-zA-Z0-9]+/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.promiseDistanceFromRailwayStation && errors?.promiseDistanceFromRailwayStation ? <p className="form-error">{errors?.promiseDistanceFromRailwayStation}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold10" sx={toggleTitle}>
                                                    Wine bar/shop presence with geo tag
                                                </Typography>
                                                <TextField
                                                    id="wineShop"
                                                    name="wineShop"
                                                    size="small"
                                                    value={values?.wineShop || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={handleChange}
                                                    // onKeyDown={(e: any) => {
                                                    //   regExpressionTextField(e);
                                                    //   if (e.which === 32 && !e.target.value.length)
                                                    //     e.preventDefault();
                                                    // }}
                                                    onKeyDown={(e: any) => {
                                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                            e.preventDefault();
                                                        }
                                                        if (!/[a-zA-Z0-9]+/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.wineShop && errors?.wineShop ? <p className="form-error">{errors?.wineShop}</p> : null}
                                            </Grid>
                                            <Grid item xs={9} md={9} lg={9} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Remarks
                                                </Typography>
                                                <TextField
                                                    multiline
                                                    type="text"
                                                    defaultValue="5400"
                                                    size="small"
                                                    name="property_geo_details_remarks"
                                                    id="property_geo_details_remarks"
                                                    value={values?.property_geo_details_remarks || ''}
                                                    disabled={statusP === 'Approve'}
                                                    sx={statusP === 'Approve' ? { backgroundColor: '#f3f3f3' } : null}
                                                    onChange={handleChange}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionRemark(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.property_geo_details_remarks && errors?.property_geo_details_remarks ? <p className="form-error">{errors?.property_geo_details_remarks}</p> : null}
                                            </Grid>

                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Nature of Ownership
                                                </Typography>
                                                <DropdownMenu
                                                    state={values?.nameOfOwnership}
                                                    handleChange={handleChange}
                                                    title=""
                                                    name="nameOfOwnership"
                                                    id="nameOfOwnership"
                                                    value={values?.nameOfOwnership || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onBlur={handleBlur}
                                                    menu={nameOfOwnership?.map((v: any) => v?.formName)}
                                                />
                                                {touched?.nameOfOwnership && errors?.nameOfOwnership ? <p className="form-error">{errors?.nameOfOwnership}</p> : null}
                                            </Grid>

                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className=" add-prop-bold" sx={toggleTitle}>
                                                    Mortgage Status
                                                </Typography>
                                                <DropdownMenu
                                                    state={values?.mottgageStatus}
                                                    handleChange={handleChange}
                                                    title=""
                                                    name="mottgageStatus"
                                                    id="mottgageStatus"
                                                    value={values?.mottgageStatus || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onBlur={handleBlur}
                                                    menu={mottgageStatus?.map((v: any) => v?.formName)}
                                                />
                                                <p style={{ fontSize: '10px' }}>
                                                    {values?.mottgageStatus == '1'
                                                        ? 'Please note you have to produce NOC from Bank/Financial Institution recent of last 07 days once your property is finalized with BFL in order to initiate LOI'
                                                        : values?.mottgageStatus == '2'
                                                        ? 'Please note original property documents will be verified during TSR once your property is finalized with BFL'
                                                        : ''}
                                                </p>
                                            </Grid>
                                            {values?.mottgageStatus == '1' && (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <Typography className=" add-prop-bold" sx={toggleTitle}>
                                                        Name of Bank/Financial Institution
                                                    </Typography>
                                                    <TextField label="" id="nameOfBank" name="nameOfBank" defaultValue="" type="text" size="small" value={values?.nameOfBank || ''} disabled={statusP === 'Approve'} onChange={handleChange} onBlur={handleBlur} />
                                                </Grid>
                                            )}

                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className=" add-prop-bold" sx={toggleTitle}>
                                                    Age of the Building (In Years)
                                                </Typography>
                                                <DropdownMenu
                                                    state={values?.ageOfBuilding}
                                                    handleChange={handleChange}
                                                    title=""
                                                    name="ageOfBuilding"
                                                    id="ageOfBuilding"
                                                    value={values?.ageOfBuilding || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onBlur={handleBlur}
                                                    menu={ageOfBuilding?.map((v: any) => v?.formName)}
                                                />
                                            </Grid>

                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold10" sx={toggleTitle}>
                                                    Add Competitors Available
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.nearByBusinessAvailable}
                                                    handleChange={(e: any) => handleChangeToggle(e, 'nearByBusinessAvailable')}
                                                    yes={'yes'}
                                                    no={'no'}
                                                    name="nearByBusinessAvailable"
                                                    id="nearByBusinessAvailable"
                                                    onBlur={handleBlur}
                                                    disabled={statusP === 'Approve'}
                                                    bold="true"
                                                />
                                                {touched?.nearByBusinessAvailable && errors?.nearByBusinessAvailable ? <p className="form-error">{errors?.nearByBusinessAvailable}</p> : null}
                                            </Grid>

                                            {toggleSwitch?.nearByBusinessAvailable === true ? (
                                                <Grid item xs={1} md={1} sx={{ position: 'relative' }}>
                                                    <Button
                                                        onClick={() => {
                                                            setOpenNearBy(true);
                                                            setNearByFormData({});
                                                            setNearByError({});
                                                            setImagesNB({});
                                                            setErrorMsgNB({});
                                                            setImagePreviewNB({});
                                                        }}
                                                        style={{ minWidth: '100px', width: '180px' }}
                                                        className="list-button"
                                                        // sx={
                                                        //   toggleSwitch?.nearByBusinessAvailable ===
                                                        //   false && { backgroundColor: "#f3f3f3" }
                                                        // }
                                                        disabled={statusP === 'Approve'}
                                                    >
                                                        <AddCircleIcon style={{ fontSize: '22px' }} />
                                                        Add Competitors
                                                    </Button>
                                                </Grid>
                                            ) : (
                                                <Grid item xs={1} md={1} sx={{ position: 'relative' }}>
                                                    <Button
                                                        onClick={() => {
                                                            setOpenNearBy(true);
                                                            setNearByFormData({});
                                                            setNearByError({});
                                                            setImagesNB({});
                                                            setErrorMsgNB({});
                                                            setImagePreviewNB({});
                                                        }}
                                                        style={{ minWidth: '100px', width: '180px' }}
                                                        className="list-button"
                                                        disabled
                                                        sx={toggleSwitch?.nearByBusinessAvailable === false && { backgroundColor: '#f3f3f3' }}
                                                    >
                                                        <AddCircleIcon style={{ fontSize: '22px' }} />
                                                        Add Competitors
                                                    </Button>
                                                </Grid>
                                            )}
                                        </Grid>
                                        <div
                                            style={{
                                                marginTop: '10px',
                                            }}
                                        >
                                            {toggleSwitch?.nearByBusinessAvailable === true ? (
                                                <div
                                                    style={{
                                                        height: getHeightForTableNb(),
                                                    }}
                                                >
                                                    <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefsNb} rowData={nearByBusinessData || []} onGridReady={onGridReadyNearBy} gridRef={gridRef2} pagination={false} paginationPageSize={null} />
                                                </div>
                                            ) : (
                                                ''
                                            )}
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel3'} onChange={handleChangeAccordian('panel3')}>
                                    <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
                                        <Typography style={accordionTitle}>INFRA REQUIREMENT</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid marginBottom="30px" container item spacing={5} justifyContent="start" alignSelf="center" className="addProperty">
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold10" sx={toggleTitle}>
                                                    Perm. ava. on terrace for two ant.(30ft.)
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.permissionAvailable}
                                                    handleChange={(e: any) => handleChangeToggle(e, 'permissionAvailable')}
                                                    yes={'yes'}
                                                    no={'no'}
                                                    name="permissionAvailable"
                                                    id="permissionAvailable"
                                                    onBlur={handleBlur}
                                                    // disabled={false}
                                                    disabled={statusP === 'Approve'}
                                                    bold="true"
                                                />
                                                {touched?.permissionAvailable && errors?.permissionAvailable ? <p className="form-error">{errors?.permissionAvailable}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Space for signage
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.spaceForSignage}
                                                    handleChange={(e: any) => handleChangeToggle(e, 'spaceForSignage')}
                                                    yes={'yes'}
                                                    no={'no'}
                                                    name="spaceForSignage"
                                                    id="spaceForSignage"
                                                    onBlur={handleBlur}
                                                    disabled={statusP === 'Approve'}
                                                    bold="true"
                                                />
                                                {touched?.spaceForSignage && errors?.spaceForSignage ? <p className="form-error">{errors?.spaceForSignage}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold10" sx={toggleTitle}>
                                                    Main Glow Sign Board (St. Size 20 x 4 ft.)
                                                </Typography>
                                                <ToggleSwitch alignment={toggleSwitch?.glowSignBoard} handleChange={(e: any) => handleChangeToggle(e, 'glowSignBoard')} yes={'yes'} no={'no'} name="glowSignBoard" id="glowSignBoard" onBlur={handleBlur} disabled={statusP === 'Approve'} bold="true" />
                                                {touched?.glowSignBoard && errors?.glowSignBoard ? <p className="form-error">{errors?.glowSignBoard}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold10" sx={toggleTitle}>
                                                    Side Board - (Standard Size 10 x 4 ft.)
                                                </Typography>
                                                <ToggleSwitch alignment={toggleSwitch?.sideBoard} handleChange={(e: any) => handleChangeToggle(e, 'sideBoard')} yes={'yes'} no={'no'} name="sideBoard" id="sideBoard" onBlur={handleBlur} disabled={statusP === 'Approve'} bold="true" />
                                                {touched?.sideBoard && errors?.sideBoard ? <p className="form-error">{errors?.sideBoard}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Ticker Board - (St. Size 20 x 1 ft.)
                                                </Typography>
                                                <ToggleSwitch alignment={toggleSwitch?.tickerBoard} handleChange={(e: any) => handleChangeToggle(e, 'tickerBoard')} yes={'yes'} no={'no'} name="tickerBoard" id="tickerBoard" onBlur={handleBlur} disabled={statusP === 'Approve'} bold="true" />
                                                {touched?.tickerBoard && errors?.tickerBoard ? <p className="form-error">{errors?.tickerBoard}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold10" sx={toggleTitle}>
                                                    Lollypop/Flange Board - (St. Size 2 Nos)
                                                </Typography>
                                                <ToggleSwitch alignment={toggleSwitch?.flangeBoard} handleChange={(e: any) => handleChangeToggle(e, 'flangeBoard')} yes={'yes'} no={'no'} name="flangeBoard" id="flangeBoard" onBlur={handleBlur} disabled={statusP === 'Approve'} bold="true" />
                                                {touched?.flangeBoard && errors?.flangeBoard ? <p className="form-error">{errors?.flangeBoard}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Branding in Staircase
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.brandingInStaircase}
                                                    handleChange={(e: any) => handleChangeToggle(e, 'brandingInStaircase')}
                                                    yes={'yes'}
                                                    no={'no'}
                                                    name="brandingInStaircase"
                                                    id="brandingInStaircase"
                                                    onBlur={handleBlur}
                                                    disabled={statusP === 'Approve'}
                                                    bold="true"
                                                />
                                                {touched?.brandingInStaircase && errors?.brandingInStaircase ? <p className="form-error">{errors?.brandingInStaircase}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Direction Board - 2 Nos
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.directionBoard}
                                                    handleChange={(e: any) => handleChangeToggle(e, 'directionBoard')}
                                                    yes={'yes'}
                                                    no={'no'}
                                                    name="directionBoard"
                                                    id="directionBoard"
                                                    onBlur={handleBlur}
                                                    disabled={statusP === 'Approve'}
                                                    bold="true"
                                                />
                                                {touched?.directionBoard && errors?.directionBoard ? <p className="form-error">{errors?.directionBoard}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <DropdownMenu
                                                    state={values?.buildBy}
                                                    handleChange={(e) => {
                                                        handleChange(e);
                                                        setFieldValue('rcc_bfl_share', '');
                                                        setFieldValue('rcc_landlord_share', '');
                                                    }}
                                                    title="RCC Strong room to be build by"
                                                    menu={RccStrongRoom?.map((v: any) => v?.formName)}
                                                    name="buildBy"
                                                    disabled={(mandateInfo && mandateInfo?.glCategoryName !== 'WITH GOLD LOAN') || statusP === 'Approve'}
                                                    id="buildBy"
                                                    value={values?.buildBy || ''}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.buildBy && errors?.buildBy ? <p className="form-error">{errors?.buildBy}</p> : null}
                                            </Grid>

                                            <Grid item xs={6} md={3}>
                                                <TextField
                                                    label="BFL Share %"
                                                    id="rcc_bfl_share"
                                                    name="rcc_bfl_share"
                                                    type="number"
                                                    defaultValue=""
                                                    size="small"
                                                    value={values?.rcc_bfl_share || ''}
                                                    disabled={(!(values?.buildBy === 3) && values?.buildBy === 2) || statusP === 'Approve'}
                                                    onChange={(e: any) => (+e.target.value > 100 ? e.preventDefault() : e.target.value >= 0 ? handleChange(e) : null)}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        blockInvalidChar(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                />
                                                {touched?.rcc_bfl_share && errors?.rcc_bfl_share ? <p className="form-error">{errors?.rcc_bfl_share}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <TextField
                                                    label="Landlord Share %"
                                                    id="rcc_landlord_share"
                                                    name="rcc_landlord_share"
                                                    type="number"
                                                    defaultValue=""
                                                    size="small"
                                                    value={values?.rcc_landlord_share || ''}
                                                    disabled={(!(values?.buildBy === 3) && values?.buildBy === 1) || statusP === 'Approve'}
                                                    onChange={(e: any) => (+e.target.value > 100 ? e.preventDefault() : e.target.value >= 0 ? handleChange(e) : null)}
                                                    onBlur={handleBlur}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        blockInvalidChar(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                />
                                                {touched?.rcc_landlord_share && errors?.rcc_landlord_share ? <p className="form-error">{errors?.rcc_landlord_share}</p> : null}
                                            </Grid>
                                            {values?.buildBy === 3 ? (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <Typography className="add-prop-bold" sx={toggleTitle}>
                                                        RCC Strong room build Comments
                                                    </Typography>
                                                    <TextField
                                                        id="buildComments"
                                                        name="buildComments"
                                                        defaultValue=""
                                                        size="small"
                                                        value={values?.buildComments || ''}
                                                        disabled={statusP === 'Approve'}
                                                        onChange={handleChange}
                                                        onKeyDown={(e: any) => {
                                                            regExpressionTextField(e);
                                                            if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        }}
                                                        onPaste={(e: any) => {
                                                            if (!textFieldValidationOnPaste(e)) {
                                                                dispatch(fetchError('You can not paste Spacial characters'));
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                    />
                                                    {touched?.buildComments && errors?.buildComments ? <p className="form-error">{errors?.buildComments}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <Typography className="add-prop-bold" sx={toggleTitle}>
                                                        RCC Strong room build Comments
                                                    </Typography>
                                                    <TextField
                                                        id="buildComments"
                                                        name="buildComments"
                                                        defaultValue=""
                                                        size="small"
                                                        value={values?.buildComments || ''}
                                                        onChange={handleChange}
                                                        onKeyDown={(e: any) => {
                                                            regExpressionTextField(e);
                                                            if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        }}
                                                        onPaste={(e: any) => {
                                                            if (!textFieldValidationOnPaste(e)) {
                                                                dispatch(fetchError('You can not paste Spacial characters'));
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        disabled
                                                    />
                                                    {touched?.buildComments && errors?.buildComments ? <p className="form-error">{errors?.buildComments}</p> : null}
                                                </Grid>
                                            )}
                                            <Grid item xs={6} md={6} lg={6} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Remarks
                                                </Typography>
                                                <TextField
                                                    multiline
                                                    type="text"
                                                    defaultValue="5400"
                                                    size="small"
                                                    name="infra_requirement_remarks"
                                                    id="infra_requirement_remarks"
                                                    value={values?.infra_requirement_remarks || ''}
                                                    disabled={statusP === 'Approve'}
                                                    sx={statusP === 'Approve' ? { backgroundColor: '#f3f3f3' } : null}
                                                    onChange={handleChange}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionRemark(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.infra_requirement_remarks && errors?.infra_requirement_remarks ? <p className="form-error">{errors?.infra_requirement_remarks}</p> : null}
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel4'} onChange={handleChangeAccordian('panel4')}>
                                    <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
                                        <Typography style={accordionTitle}>PROPERTY INFRA DETAILS</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid marginBottom="30px" container item spacing={5} justifyContent="start" alignSelf="center" className="addProperty">
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <DropdownMenu
                                                    state={values?.floorSanction}
                                                    handleChange={handleChange}
                                                    title="Premise / Floor sanction "
                                                    menu={Premise?.map((v: any) => v?.formName)}
                                                    name="floorSanction"
                                                    id="floorSanction"
                                                    value={values?.floorSanction}
                                                    disabled={statusP === 'Approve'}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.floorSanction && errors?.floorSanction ? <p className="form-error">{errors?.floorSanction}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold10" sx={toggleTitle}>
                                                    Total Constructed Floor Area in SqFt{' '}
                                                </Typography>
                                                <TextField
                                                    id="totalConstructedFloorArea"
                                                    name="totalConstructedFloorArea"
                                                    type="number"
                                                    defaultValue=""
                                                    size="small"
                                                    value={values?.totalConstructedFloorArea}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={(e: any) => {
                                                        if (e.target.value >= 0) {
                                                            handleChange(e);
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        blockInvalidChar(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {touched?.totalConstructedFloorArea && errors?.totalConstructedFloorArea ? <p className="form-error">{errors?.totalConstructedFloorArea}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Total Carpet Area in SqFt
                                                </Typography>
                                                <TextField
                                                    id="totalCarpetArea"
                                                    name="totalCarpetArea"
                                                    type="number"
                                                    defaultValue=""
                                                    size="small"
                                                    value={values?.totalCarpetArea || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={(e: any) => {
                                                        if (e.target.value >= 0) {
                                                            handleChange(e);
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        blockInvalidChar(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {touched?.totalCarpetArea && errors?.totalCarpetArea ? <p className="form-error">{errors?.totalCarpetArea}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Chargeable Area in SqFt
                                                </Typography>
                                                <TextField
                                                    id="chargeableArea"
                                                    name="chargeableArea"
                                                    type="number"
                                                    defaultValue=""
                                                    size="small"
                                                    value={values?.chargeableArea || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={(e: any) => {
                                                        if (e.target.value >= 0) {
                                                            handleChange(e);
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        blockInvalidChar(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {touched?.chargeableArea && errors?.chargeableArea ? <p className="form-error">{errors?.chargeableArea}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold10" sx={toggleTitle}>
                                                    Landlord to provide Verified Flooring
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.vetrifiedFlooring}
                                                    handleChange={(e: any) => handleChangeToggle(e, 'vetrifiedFlooring')}
                                                    yes={'yes'}
                                                    no={'no'}
                                                    name="vetrifiedFlooring"
                                                    id="vetrifiedFlooring"
                                                    onBlur={handleBlur}
                                                    disabled={statusP === 'Approve'}
                                                    bold="true"
                                                />
                                                {touched?.vetrifiedFlooring && errors?.vetrifiedFlooring ? <p className="form-error">{errors?.vetrifiedFlooring}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <DropdownMenu
                                                    state={values?.entranceType}
                                                    handleChange={handleChange}
                                                    title="Current Branch Entrance type"
                                                    menu={CurrentBranchEntranceType?.map((v: any) => v?.formName)}
                                                    name="entranceType"
                                                    id="entranceType"
                                                    value={values?.entranceType}
                                                    disabled={statusP === 'Approve'}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.entranceType && errors?.entranceType ? <p className="form-error">{errors?.entranceType}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <DropdownMenu
                                                    state={values?.providedDoor}
                                                    handleChange={handleChange}
                                                    title="Door Type to be provided by Landlord"
                                                    menu={['Shutter Door', 'Collapsible Grill Gate', 'Both']}
                                                    name="providedDoor"
                                                    id="providedDoor"
                                                    value={values?.providedDoor}
                                                    disabled={!values?.entranceType || statusP === 'Approve'}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.providedDoor && errors?.providedDoor ? <p className="form-error">{errors?.providedDoor}</p> : null}
                                            </Grid>

                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Ventilation ava. in Branch
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.ventilationAvailable}
                                                    handleChange={(e: any) => handleChangeToggle(e, 'ventilationAvailable')}
                                                    yes={'yes'}
                                                    no={'no'}
                                                    name="ventilationAvailable"
                                                    id="ventilationAvailable"
                                                    onBlur={handleBlur}
                                                    disabled={statusP === 'Approve'}
                                                    bold="true"
                                                />
                                                {touched?.ventilationAvailable && errors?.ventilationAvailable ? <p className="form-error">{errors?.ventilationAvailable}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Grilled Windows in Office Area
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.grilledWindows}
                                                    handleChange={(e: any) => handleChangeToggle(e, 'grilledWindows')}
                                                    yes={'yes'}
                                                    no={'no'}
                                                    name="grilledWindows"
                                                    id="grilledWindows"
                                                    onBlur={handleBlur}
                                                    disabled={statusP === 'Approve'}
                                                    bold="true"
                                                />
                                                {touched?.grilledWindows && errors?.grilledWindows ? <p className="form-error">{errors?.grilledWindows}</p> : null}
                                            </Grid>
                                            {toggleSwitch?.grilledWindows === true ? (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Grilled Window Count(in Office Area)"
                                                        id="grilledWindowCount"
                                                        name="grilledWindowCount"
                                                        defaultValue=""
                                                        type="number"
                                                        size="small"
                                                        value={values?.grilledWindowCount || ''}
                                                        onChange={(e: any) => {
                                                            if (e.target.value >= 0) {
                                                                handleChange(e);
                                                            }
                                                        }}
                                                        disabled={statusP === 'Approve'}
                                                        onBlur={handleBlur}
                                                        onKeyDown={(e: any) => {
                                                            regExpressionTextField(e);
                                                            blockInvalidChar(e);
                                                            if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        }}
                                                    />
                                                    {touched?.grilledWindowCount && errors?.grilledWindowCount ? <p className="form-error">{errors?.grilledWindowCount}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Grilled Window Count(in Office Area)"
                                                        id="grilledWindowCount"
                                                        name="grilledWindowCount"
                                                        defaultValue=""
                                                        type="number"
                                                        size="small"
                                                        value={values?.grilledWindowCount || ''}
                                                        onChange={handleChange}
                                                        sx={{ backgroundColor: '#f3f3f3' }}
                                                        onBlur={handleBlur}
                                                        disabled
                                                    />
                                                </Grid>
                                            )}
                                            {toggleSwitch?.grilledWindows === false ? (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Grilled Window Note(in Office Area)"
                                                        id="grilledWindowNote"
                                                        name="grilledWindowNote"
                                                        defaultValue=""
                                                        size="small"
                                                        value={values?.grilledWindowNote || ''}
                                                        disabled={statusP === 'Approve'}
                                                        onChange={handleChange}
                                                        onKeyDown={(e: any) => {
                                                            regExpressionTextField(e);
                                                            if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        }}
                                                        onPaste={(e: any) => {
                                                            if (!textFieldValidationOnPaste(e)) {
                                                                dispatch(fetchError('You can not paste Spacial characters'));
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                    />
                                                    {touched?.grilledWindowNote && errors?.grilledWindowNote ? <p className="form-error">{errors?.grilledWindowNote}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Grilled Window Note(in Office Area)"
                                                        id="grilledWindowNote"
                                                        name="grilledWindowNote"
                                                        defaultValue=""
                                                        size="small"
                                                        value={values?.grilledWindowNote || ''}
                                                        onChange={handleChange}
                                                        sx={{ backgroundColor: '#f3f3f3' }}
                                                        onBlur={handleBlur}
                                                        disabled
                                                    />
                                                </Grid>
                                            )}
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Ventilation in Washroom Area
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.ventilationInWashroom}
                                                    handleChange={(e: any) => handleChangeToggle(e, 'ventilationInWashroom')}
                                                    yes={'yes'}
                                                    no={'no'}
                                                    name="ventilationInWashroom"
                                                    id="ventilationInWashroom"
                                                    onBlur={handleBlur}
                                                    disabled={statusP === 'Approve'}
                                                    bold="true"
                                                />
                                                {touched?.ventilationInWashroom && errors?.ventilationInWashroom ? <p className="form-error">{errors?.ventilationInWashroom}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold10" sx={toggleTitle}>
                                                    Grilled Windows in Washroom Area
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.grilledWindowsInWashroom}
                                                    handleChange={(e: any) => handleChangeToggle(e, 'grilledWindowsInWashroom')}
                                                    yes={'yes'}
                                                    no={'no'}
                                                    name="grilledWindowsInWashroom"
                                                    id="grilledWindowsInWashroom"
                                                    onBlur={handleBlur}
                                                    disabled={statusP === 'Approve'}
                                                    bold="true"
                                                />
                                                {touched?.grilledWindowsInWashroom && errors?.grilledWindowsInWashroom ? <p className="form-error">{errors?.grilledWindowsInWashroom}</p> : null}
                                            </Grid>
                                            {toggleSwitch?.grilledWindowsInWashroom === true ? (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Grilled Window Count(in Washroom Area)"
                                                        id="grilledWindowCountW"
                                                        name="grilledWindowCountW"
                                                        defaultValue=""
                                                        type="number"
                                                        size="small"
                                                        value={values?.grilledWindowCountW || ''}
                                                        onChange={(e: any) => {
                                                            if (e.target.value >= 0) {
                                                                handleChange(e);
                                                            }
                                                        }}
                                                        disabled={statusP === 'Approve'}
                                                        onBlur={handleBlur}
                                                        onKeyDown={(e: any) => {
                                                            regExpressionTextField(e);
                                                            blockInvalidChar(e);
                                                            if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        }}
                                                    />
                                                    {touched?.grilledWindowCountW && errors?.grilledWindowCountW ? <p className="form-error">{errors?.grilledWindowCountW}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Grilled Window Count(in Washroom Area)"
                                                        id="grilledWindowCountW"
                                                        name="grilledWindowCountW"
                                                        defaultValue=""
                                                        type="number"
                                                        size="small"
                                                        value={values?.grilledWindowCountW || ''}
                                                        onChange={handleChange}
                                                        sx={{ backgroundColor: '#f3f3f3' }}
                                                        onBlur={handleBlur}
                                                        disabled
                                                    />
                                                </Grid>
                                            )}
                                            {toggleSwitch?.grilledWindowsInWashroom === false ? (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Grilled Window Note(in Washroom Area)"
                                                        id="grilledWindowNoteW"
                                                        name="grilledWindowNoteW"
                                                        defaultValue=""
                                                        size="small"
                                                        value={values?.grilledWindowNoteW || ''}
                                                        disabled={statusP === 'Approve'}
                                                        onChange={handleChange}
                                                        onKeyDown={(e: any) => {
                                                            regExpressionTextField(e);
                                                            if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        }}
                                                        onPaste={(e: any) => {
                                                            if (!textFieldValidationOnPaste(e)) {
                                                                dispatch(fetchError('You can not paste Spacial characters'));
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                    />
                                                    {touched?.grilledWindowNoteW && errors?.grilledWindowNoteW ? <p className="form-error">{errors?.grilledWindowNoteW}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Grilled Window Note(in Washroom Area)"
                                                        id="grilledWindowNoteW"
                                                        name="grilledWindowNoteW"
                                                        defaultValue=""
                                                        size="small"
                                                        value={values?.grilledWindowNoteW || ''}
                                                        onChange={handleChange}
                                                        sx={{ backgroundColor: '#f3f3f3' }}
                                                        onBlur={handleBlur}
                                                        disabled
                                                    />
                                                </Grid>
                                            )}

                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Space for AC Outdoor Units
                                                </Typography>
                                                <ToggleSwitch alignment={toggleSwitch?.outdoorUnits} handleChange={(e: any) => handleChangeToggle(e, 'outdoorUnits')} yes={'yes'} no={'no'} name="outdoorUnits" id="outdoorUnits" onBlur={handleBlur} disabled={statusP === 'Approve'} bold="true" />
                                                {touched?.outdoorUnits && errors?.outdoorUnits ? <p className="form-error">{errors?.outdoorUnits}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Space for DG Set
                                                </Typography>
                                                <ToggleSwitch alignment={toggleSwitch?.spaceForDGSet} handleChange={(e: any) => handleChangeToggle(e, 'spaceForDGSet')} yes={'yes'} no={'no'} name="spaceForDGSet" id="spaceForDGSet" onBlur={handleBlur} disabled={statusP === 'Approve'} bold="true" />
                                                {touched?.spaceForDGSet && errors?.spaceForDGSet ? <p className="form-error">{errors?.spaceForDGSet}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Premise Accessibility (24*7)
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.premiseAccessability}
                                                    handleChange={(e: any) => handleChangeToggle(e, 'premiseAccessability')}
                                                    yes={'yes'}
                                                    no={'no'}
                                                    disabled={statusP === 'Approve'}
                                                    name="premiseAccessability"
                                                    id="premiseAccessability"
                                                    onBlur={handleBlur}
                                                    bold="true"
                                                />
                                                {touched?.premiseAccessability && errors?.premiseAccessability ? <p className="form-error">{errors?.premiseAccessability}</p> : null}
                                            </Grid>
                                            {toggleSwitch?.premiseAccessability === false ? (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Premise Accessibility (24*7) not available Reason"
                                                        id="premiseAccessabilityNotAvailableReason"
                                                        name="premiseAccessabilityNotAvailableReason"
                                                        defaultValue=""
                                                        size="small"
                                                        value={values?.premiseAccessabilityNotAvailableReason || ''}
                                                        disabled={statusP === 'Approve'}
                                                        onChange={handleChange}
                                                        onKeyDown={(e: any) => {
                                                            regExpressionTextField(e);
                                                            if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        }}
                                                        onPaste={(e: any) => {
                                                            if (!textFieldValidationOnPaste(e)) {
                                                                dispatch(fetchError('You can not paste Spacial characters'));
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                    />
                                                    {touched?.premiseAccessabilityNotAvailableReason && errors?.premiseAccessabilityNotAvailableReason ? <p className="form-error">{errors?.premiseAccessabilityNotAvailableReason}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Premise Accessibility (24*7) not available Reason"
                                                        id="premiseAccessabilityNotAvailableReason"
                                                        name="premiseAccessabilityNotAvailableReason"
                                                        defaultValue=""
                                                        size="small"
                                                        value={values?.premiseAccessabilityNotAvailableReason || ''}
                                                        onChange={handleChange}
                                                        sx={{ backgroundColor: '#f3f3f3' }}
                                                        onBlur={handleBlur}
                                                        disabled
                                                    />
                                                </Grid>
                                            )}
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Parking Availability
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={values?.parkingAvailability}
                                                    handleChange={(e: any) => {
                                                        setFieldValue('parkingAvailability', e.target.value === 'true' ? true : false);
                                                        handleChangeToggle(e, 'parkingAvailability');
                                                    }}
                                                    yes={'yes'}
                                                    no={'no'}
                                                    disabled={statusP === 'Approve'}
                                                    name="parkingAvailability"
                                                    id="parkingAvailability"
                                                    onBlur={handleBlur}
                                                    bold="true"
                                                />
                                                {touched?.parkingAvailability && errors?.parkingAvailability ? <p className="form-error">{errors?.parkingAvailability}</p> : null}
                                            </Grid>
                                            {toggleSwitch?.parkingAvailability === true ? (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <DropdownMenu
                                                        state={values?.parkingType}
                                                        handleChange={handleChange}
                                                        title="Parking Type "
                                                        menu={ParkingType?.map((v: any) => v?.formName)}
                                                        name="parkingType"
                                                        id="parkingType"
                                                        value={values?.parkingType || 0}
                                                        disabled={statusP === 'Approve'}
                                                        onBlur={handleBlur}
                                                    />
                                                    {touched?.parkingType && errors?.parkingType ? <p className="form-error">{errors?.parkingType}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <FormControl sx={{ mt: 1, ml: 1, minWidth: 120 }} size="small">
                                                        <InputLabel className="InputLabelProperty" id="demo-select-small">
                                                            Parking Type
                                                        </InputLabel>
                                                        <Select name="parkingType" size="small" sx={{ backgroundColor: '#f3f3f3' }} id="parkingType" value={values?.parkingType || 0} label="Parking Type" disabled>
                                                            <MenuItem value={['1']}>1</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            )}
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className={toggleSwitch?.parkingAvailability === true ? 'add-prop-bold required' : 'add-prop-bold'} sx={toggleTitle}>
                                                    Number of Car Parking Available
                                                </Typography>
                                                <TextField
                                                    id="numberOfCarParkingAvailable"
                                                    name="numberOfCarParkingAvailable"
                                                    type="number"
                                                    defaultValue=""
                                                    disabled={toggleSwitch?.parkingAvailability === false || statusP === 'Approve'}
                                                    size="small"
                                                    value={values?.numberOfCarParkingAvailable}
                                                    onChange={(e: any) => {
                                                        if (e.target.value >= 0) {
                                                            handleChange(e);
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        blockInvalidChar(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {touched?.numberOfCarParkingAvailable && errors?.numberOfCarParkingAvailable ? <p className="form-error">{errors?.numberOfCarParkingAvailable}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className={toggleSwitch?.parkingAvailability === true ? 'add-prop-bold required' : 'add-prop-bold'} sx={toggleTitle}>
                                                    Number of Bike Parking Available
                                                </Typography>
                                                <TextField
                                                    id="numberOfBikeParkingAvailable"
                                                    name="numberOfBikeParkingAvailable"
                                                    type="number"
                                                    defaultValue=""
                                                    size="small"
                                                    disabled={toggleSwitch?.parkingAvailability === false || statusP === 'Approve'}
                                                    value={values?.numberOfBikeParkingAvailable}
                                                    onChange={(e: any) => {
                                                        if (e.target.value >= 0) {
                                                            handleChange(e);
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        blockInvalidChar(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {touched?.numberOfBikeParkingAvailable && errors?.numberOfBikeParkingAvailable ? <p className="form-error">{errors?.numberOfBikeParkingAvailable}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={6} lg={6} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Remarks
                                                </Typography>
                                                <TextField
                                                    multiline
                                                    type="text"
                                                    defaultValue="5400"
                                                    size="small"
                                                    name="property_infra_details_remarks"
                                                    id="property_infra_details_remarks"
                                                    value={values?.property_infra_details_remarks || ''}
                                                    disabled={statusP === 'Approve'}
                                                    sx={statusP === 'Approve' ? { backgroundColor: '#f3f3f3' } : null}
                                                    onChange={handleChange}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionRemark(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.property_infra_details_remarks && errors?.property_infra_details_remarks ? <p className="form-error">{errors?.property_infra_details_remarks}</p> : null}
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel5'} onChange={handleChangeAccordian('panel5')}>
                                    <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
                                        <Typography style={accordionTitle}>LEASSOR DETAILS</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid marginBottom="30px" container item spacing={5} justifyContent="start" alignSelf="center">
                                            <Grid item xs={6} md={3} sx={{ marginTop: '-15px' }}>
                                                <Typography className="required add-prop-bold" sx={{ fontSize: '13px' }}>
                                                    Landlords First Name
                                                </Typography>
                                                <TextField
                                                    id="landlord_first_name"
                                                    name="landlord_first_name"
                                                    type="text"
                                                    size="small"
                                                    value={landlordFormData?.landlord_first_name || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={handleLandlordChange}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        if (/[0-9]/.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {landlordError['landlord_first_name'] !== undefined ? <p className="form-error">{landlordError['landlord_first_name']?.replaceAll('_', ' ')}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative', marginTop: '-15px' }} className="add-prop-bold">
                                                <Typography sx={{ fontSize: '13px' }} className="add-prop-bold">
                                                    Landlords Middle Name
                                                </Typography>
                                                <TextField
                                                    id="landlord_middle_name"
                                                    name="landlord_middle_name"
                                                    type="text"
                                                    defaultValue=""
                                                    size="small"
                                                    value={landlordFormData?.landlord_middle_name || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={handleLandlordChange}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        if (/[0-9]/.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative', marginTop: '-15px' }}>
                                                <Typography sx={{ fontSize: '13px' }} className="add-prop-bold">
                                                    Landlords Last Name
                                                </Typography>
                                                <TextField
                                                    id="landlord_last_name"
                                                    name="landlord_last_name"
                                                    type="text"
                                                    defaultValue=""
                                                    size="small"
                                                    value={landlordFormData?.landlord_last_name || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={handleLandlordChange}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        if (/[0-9]/.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative', marginTop: '-15px' }}>
                                                <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                                                    Landlords Full Name
                                                </Typography>
                                                <TextField
                                                    id="landlord_full_name"
                                                    name="landlord_full_name"
                                                    defaultValue=""
                                                    size="small"
                                                    disabled={true}
                                                    value={(landlordFormData?.landlord_first_name || '') + ' ' + (landlordFormData?.landlord_middle_name || '') + ' ' + (landlordFormData?.landlord_last_name || '')}
                                                />
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative', marginTop: '-15px' }}>
                                                <Typography sx={{ fontSize: '13px' }} className="add-prop-bold">
                                                    Landlords Occupation
                                                </Typography>
                                                <TextField
                                                    id="landlord_occupation"
                                                    name="landlord_occupation"
                                                    type="text"
                                                    defaultValue=""
                                                    size="small"
                                                    value={landlordFormData?.landlord_occupation || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={handleLandlordChange}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative', marginTop: '-15px' }}>
                                                <Typography className="required add-prop-bold" sx={{ fontSize: '13px' }}>
                                                    Landlords Primary Contact
                                                </Typography>
                                                <TextField
                                                    id="landlord_contact"
                                                    name="landlord_contact"
                                                    type="number"
                                                    inputProps={{
                                                        maxLength: 11,
                                                    }}
                                                    defaultValue=""
                                                    size="small"
                                                    value={landlordFormData?.landlord_contact || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={(e) => e.target.value.length <= 10 && +e.target.value >= 0 && handleLandlordChange(e)}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        blockInvalidChar(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {landlordError['landlord_contact'] !== undefined ? <p className="form-error">{landlordError['landlord_contact']?.replaceAll('_', ' ')}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative', marginTop: '-15px' }}>
                                                <Typography sx={{ fontSize: '13px' }} className="add-prop-bold">
                                                    Landlords Alternate Contact
                                                </Typography>
                                                <TextField
                                                    id="landlord_alternate_contact"
                                                    name="landlord_alternate_contact"
                                                    type="number"
                                                    defaultValue=""
                                                    size="small"
                                                    value={landlordFormData?.landlord_alternate_contact || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={(e) => e.target.value.length <= 10 && +e.target.value >= 0 && handleLandlordChange(e)}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        blockInvalidChar(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {landlordError['landlord_alternate_contact'] !== undefined ? <p className="form-error">{landlordError['landlord_alternate_contact']?.replaceAll('_', ' ')}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative', marginTop: '-15px' }}>
                                                <Typography sx={{ fontSize: '13px' }} className="add-prop-bold">
                                                    Landlords Email Id
                                                </Typography>
                                                <TextField
                                                    id="landlord_permanent_emailId"
                                                    name="landlord_permanent_emailId"
                                                    defaultValue=""
                                                    size="small"
                                                    value={landlordFormData?.landlord_permanent_emailId || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onKeyDown={(e: any) => {
                                                        if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                            e.preventDefault();
                                                        }
                                                        if (e.code === 'Space') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onChange={handleLandlordChange}
                                                />
                                                {landlordError['landlord_permanent_emailId'] !== undefined ? <p className="form-error">{landlordError['landlord_permanent_emailId']?.replaceAll('_', ' ')}</p> : null}
                                            </Grid>

                                            <Grid item xs={6} md={3} sx={{ position: 'relative', marginTop: '-15px' }}>
                                                <Typography className="required add-prop-bold" sx={{ fontSize: '13px' }}>
                                                    Landlords Present Address
                                                </Typography>
                                                <TextField
                                                    id="landlord_present_add"
                                                    name="landlord_present_add"
                                                    defaultValue=""
                                                    size="small"
                                                    value={landlordFormData?.landlord_present_add || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={handleLandlordChange}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {landlordError['landlord_present_add'] !== undefined ? <p className="form-error">{landlordError['landlord_present_add']?.replaceAll('_', ' ')}</p> : null}
                                                <FormControlLabel control={<Checkbox checked={AddressCheck} onChange={handleAddressChekbox} />} label="Same as First LL" />
                                            </Grid>

                                            <Grid item xs={6} md={3} sx={{ position: 'relative', marginTop: '-15px' }}>
                                                <Typography className="required add-prop-bold" sx={{ fontSize: '13px' }}>
                                                    Landlords Permanent Address
                                                </Typography>
                                                <TextField
                                                    id="landlord_permanent_add"
                                                    name="landlord_permanent_add"
                                                    defaultValue=""
                                                    size="small"
                                                    value={landlordFormData?.landlord_permanent_add || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={handleLandlordChange}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {landlordError['landlord_permanent_add'] !== undefined ? <p className="form-error">{landlordError['landlord_permanent_add']?.replaceAll('_', ' ')}</p> : null}

                                                <FormControlLabel control={<Checkbox checked={checked} onChange={handleChekbox} />} label="Same as Present " />
                                            </Grid>

                                            <Grid item xs={6} md={3} sx={{ position: 'relative', marginTop: '-15px' }}>
                                                <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                                                    PAN Number
                                                </Typography>
                                                <TextField
                                                    id="landlord_pan"
                                                    name="landlord_pan"
                                                    defaultValue=""
                                                    size="small"
                                                    value={landlordFormData?.landlord_pan?.toUpperCase() || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={handleLandlordChange}
                                                    InputProps={{ inputProps: { min: 0, maxLength: 10 } }}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                                {landlordError['landlord_pan'] !== undefined ? <p className="form-error">{landlordError['landlord_pan']?.replaceAll('_', ' ')}</p> : null}
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={landlordFormData?.rentToBePaid}
                                                            onChange={(e) =>
                                                                setLandlordFormData({
                                                                    ...landlordFormData,
                                                                    rentToBePaid: e.target.checked,
                                                                })
                                                            }
                                                            disabled={tableData?.length == 0}
                                                        />
                                                    }
                                                    label="Rent to be paid"
                                                />
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative', marginTop: '-15px' }} className="add-prop-bold">
                                                <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                                                    Aadhaar Number
                                                </Typography>
                                                <TextField
                                                    id="landlord_aadhar"
                                                    name="landlord_aadhar"
                                                    type="text"
                                                    defaultValue=""
                                                    InputProps={{ inputProps: { min: 0, maxLength: 12 } }}
                                                    size="small"
                                                    value={landlordFormData?.landlord_aadhar || ''}
                                                    disabled={statusP === 'Approve'}
                                                    onChange={handleLandlordChange}
                                                    onKeyDown={(event) => {
                                                        if (!/[0-9]/.test(event.key) && event.key != 'Backspace' && event.key !== 'Delete' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
                                                            event.preventDefault();
                                                        }
                                                    }}
                                                />
                                                {landlordError['landlord_aadhar'] !== undefined ? <p className="form-error">{landlordError['landlord_aadhar']?.replaceAll('_', ' ')}</p> : null}
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={landlordFormData?.securityDeposite}
                                                            onChange={(e) =>
                                                                setLandlordFormData({
                                                                    ...landlordFormData,
                                                                    securityDeposite: e.target.checked,
                                                                })
                                                            }
                                                            disabled={tableData?.length == 0}
                                                        />
                                                    }
                                                    label="Security Deposit "
                                                />
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" style={{ top: 0 }} sx={toggleTitle1}>
                                                    Lessor Type
                                                </Typography>
                                                <div>
                                                    <DropdownMenu
                                                        state={landlordFormData?.lessor_Type || ''}
                                                        handleChange={(e) => {
                                                            setLandlordFormData({
                                                                ...landlordFormData,
                                                                lessor_Type: e.target.value?.toString(),
                                                            });
                                                            handleLessorType(e);
                                                        }}
                                                        title=""
                                                        name="lessor_Type"
                                                        id="lessor_Type"
                                                        value={landlordFormData?.lessor_Type || ''}
                                                        disabled={statusP === 'Approve'}
                                                        onBlur={handleBlur}
                                                        menu={lessorType?.map((v: any) => v?.formName)}
                                                    />
                                                    {landlordError['lessor_Type'] !== undefined ? <p className="form-error">{landlordError['lessor_Type']?.replaceAll('_', ' ')}</p> : null}
                                                </div>
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative', marginTop: '-15px' }} className="add-prop-bold">
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        alignContent: 'center',
                                                        justifyContent: 'space-between',
                                                        marginTop: '12px',
                                                    }}
                                                >
                                                    <div>
                                                        {statusP !== 'Approve' ? (
                                                            <Button variant="outlined" size="medium" onClick={() => submitLanlordForm()} style={submit} className="add-landlord">
                                                                {edit ? 'Update Landlord' : 'Add Landlord'}
                                                            </Button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </Grid>

                                            <Grid></Grid>
                                        </Grid>
                                        <div
                                            style={{
                                                marginTop: '10px',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: getHeightForTable(),
                                                    marginTop: '10px',
                                                }}
                                            >
                                                <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={tableData || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={null} />
                                            </div>
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel6'} onChange={handleChangeAccordian('panel6')}>
                                    <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
                                        <Typography style={accordionTitle}>LEGAL</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid marginBottom="30px" container item spacing={5} justifyContent="start" alignSelf="center" className="addProperty lockinbfl">
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold10" sx={toggleTitle}>
                                                    Agreement Registration Applicability
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.agreementRegistrationApplicability}
                                                    handleChange={(e: any) => {
                                                        handleChangeToggle(e, 'agreementRegistrationApplicability');
                                                        resetForm({
                                                            values: {
                                                                ...values,
                                                                agreementDuration: '',
                                                                lockInPremiseOwner: '',
                                                                lockInForBfl: '',
                                                                lockInBfl: false,
                                                            },
                                                        });
                                                    }}
                                                    yes={'yes'}
                                                    no={'no'}
                                                    name="agreementRegistrationApplicability"
                                                    id="agreementRegistrationApplicability"
                                                    onBlur={handleBlur}
                                                    disabled={statusP === 'Approve'}
                                                    bold="true"
                                                />
                                                {touched?.agreementRegistrationApplicability && errors?.agreementRegistrationApplicability ? <p className="form-error">{errors?.agreementRegistrationApplicability}</p> : null}
                                            </Grid>
                                            {toggleSwitch?.agreementRegistrationApplicability === true ? (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <DropdownMenu
                                                        state={values?.agreementDuration}
                                                        handleChange={handleChange}
                                                        title="Agreement Duration (In Years)"
                                                        menu={[
                                                            // "1",
                                                            // "2",
                                                            '3',
                                                            '4',
                                                            '5',
                                                            '6',
                                                            '7',
                                                            '8',
                                                            '9',
                                                            '10',
                                                            '11',
                                                            '12',
                                                            '13',
                                                            '14',
                                                            '15',
                                                            '16',
                                                            '17',
                                                            '18',
                                                            '19',
                                                            '20',
                                                            '21',
                                                            '22',
                                                            '23',
                                                            '24',
                                                            '25',
                                                        ]}
                                                        name="agreementDuration"
                                                        id="agreementDuration"
                                                        value={values?.agreementDuration}
                                                        disabled={statusP === 'Approve'}
                                                        onBlur={handleBlur}
                                                    />
                                                    {touched?.agreementDuration && errors?.agreementDuration ? <p className="form-error">{errors?.agreementDuration}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <FormControl sx={{ mt: 1, ml: 1, minWidth: 120 }} size="small">
                                                        <InputLabel className="InputLabelProperty" id="demo-select-small">
                                                            Agreement Duration (In Years)
                                                        </InputLabel>
                                                        <Select name="agreementDuration" size="small" sx={{ backgroundColor: '#f3f3f3' }} id="agreementDuration" value={values?.agreementDuration} displayEmpty label="Agreement Duration (In Years)" disabled>
                                                            <MenuItem value={''}>1</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            )}
                                            {toggleSwitch?.agreementRegistrationApplicability === true ? (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <DropdownMenu
                                                        state={values?.lockInPremiseOwner}
                                                        handleChange={handleChange}
                                                        title="Lock in for premise owner (In Years) "
                                                        menu={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25']}
                                                        name="lockInPremiseOwner"
                                                        id="lockInPremiseOwner"
                                                        value={values?.lockInPremiseOwner}
                                                        disabled={statusP === 'Approve'}
                                                        onBlur={handleBlur}
                                                    />
                                                    {touched?.lockInPremiseOwner && errors?.lockInPremiseOwner ? <p className="form-error">{errors?.lockInPremiseOwner}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <FormControl sx={{ mt: 1, ml: 1, minWidth: 120 }} size="small">
                                                        <InputLabel className="InputLabelProperty" id="demo-select-small">
                                                            Lock in for premise owner (In Years)
                                                        </InputLabel>
                                                        <Select name="lockInPremiseOwner" size="small" sx={{ backgroundColor: '#f3f3f3' }} id="lockInPremiseOwner" value={values?.lockInPremiseOwner} displayEmpty label="Lock in for premise owner (In Years)" disabled>
                                                            <MenuItem value={''}>1</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                    {touched?.lockInPremiseOwner && errors?.lockInPremiseOwner ? <p className="form-error">{errors?.lockInPremiseOwner}</p> : null}
                                                </Grid>
                                            )}

                                            {toggleSwitch?.agreementRegistrationApplicability === true ? (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <Typography sx={toggleTitle}>Lock in for BFL</Typography>
                                                    <ToggleSwitch
                                                        alignment={toggleSwitch?.lockInBfl}
                                                        handleChange={(e: any) => {
                                                            handleChangeToggle(e, 'lockInBfl');
                                                            if (toggleSwitch?.lockInBfl === false) {
                                                                setFieldValue('lockInForBfl', '');
                                                            }
                                                        }}
                                                        yes={'yes'}
                                                        no={'no'}
                                                        disabled={statusP === 'Approve'}
                                                        name="lockInBfl"
                                                        id="lockInBfl"
                                                        onBlur={handleBlur}
                                                        bold="true"
                                                    />
                                                    {touched?.lockInBfl && errors?.lockInBfl ? <p className="form-error">{errors?.lockInBfl}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <Typography className="add-prop-bold10" sx={toggleTitle}>
                                                        Lock in for BFL
                                                    </Typography>
                                                    <ToggleSwitch alignment={alignment} handleChange={(e: any) => handleChangeToggle(e, 'lockInBfl')} yes={'yes'} no={'no'} name="lockInBfl" id="lockInBfl" onBlur={handleBlur} disabled={true} bold="true" />
                                                </Grid>
                                            )}

                                            {toggleSwitch?.agreementRegistrationApplicability === true && toggleSwitch?.lockInBfl === true ? (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <DropdownMenu
                                                        state={values?.lockInForBfl}
                                                        handleChange={handleChange}
                                                        title="Lock in for BFL (In Years) "
                                                        menu={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25']}
                                                        name="lockInForBfl"
                                                        id="lockInForBfl"
                                                        value={values?.lockInForBfl}
                                                        disabled={statusP === 'Approve'}
                                                        onBlur={handleBlur}
                                                    />
                                                    {touched?.lockInForBfl && errors?.lockInForBfl ? <p className="form-error">{errors?.lockInForBfl}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <FormControl sx={{ mt: 1, ml: 1, minWidth: 120 }} size="small">
                                                        <InputLabel className="InputLabelProperty" id="demo-select-small">
                                                            Lock in for BFL (In Years){' '}
                                                        </InputLabel>
                                                        <Select name="lockInForBfl" size="small" sx={{ backgroundColor: '#f3f3f3' }} id="lockInForBfl" value={values?.lockInForBfl} displayEmpty label="Lock in for BFL (In Years)" disabled>
                                                            <MenuItem value={''}>1</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                    {touched?.lockInForBfl && errors?.lockInForBfl ? <p className="form-error">{errors?.lockInForBfl}</p> : null}
                                                </Grid>
                                            )}
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <DropdownMenu
                                                    state={values?.agreementRegistrationChargesBornBy}
                                                    handleChange={(e) => {
                                                        handleChange(e);
                                                        setFieldValue('bflShare', '');
                                                        setFieldValue('landlordShare', '');
                                                    }}
                                                    title="Agreement registration charges born by "
                                                    menu={AggrementRegisterationCharges?.map((v: any) => v?.formName)}
                                                    name="agreementRegistrationChargesBornBy"
                                                    id="agreementRegistrationChargesBornBy"
                                                    value={values?.agreementRegistrationChargesBornBy}
                                                    disabled={statusP === 'Approve'}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.agreementRegistrationChargesBornBy && errors?.agreementRegistrationChargesBornBy ? <p className="form-error">{errors?.agreementRegistrationChargesBornBy}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <TextField
                                                    className="InputLabelProperty"
                                                    label="BFL Share %"
                                                    id="bflShare"
                                                    name="bflShare"
                                                    type="number"
                                                    defaultValue=""
                                                    size="small"
                                                    value={values?.bflShare || ''}
                                                    disabled={(!(values?.agreementRegistrationChargesBornBy === 3) && values?.agreementRegistrationChargesBornBy === 2) || statusP === 'Approve'}
                                                    onChange={(e: any) => (+e.target.value > 999 ? e.preventDefault() : e.target.value >= 0 ? handleChange(e) : null)}
                                                    onBlur={handleBlur}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        blockInvalidChar(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                />
                                                {touched?.bflShare && errors?.bflShare ? <p className="form-error">{errors?.bflShare}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <TextField
                                                    className="InputLabelProperty"
                                                    label="Landlord Share %"
                                                    id="landlordShare"
                                                    name="landlordShare"
                                                    type="number"
                                                    defaultValue=""
                                                    size="small"
                                                    value={values?.landlordShare || ''}
                                                    disabled={(!(values?.agreementRegistrationChargesBornBy === 3) && values?.agreementRegistrationChargesBornBy === 1) || statusP === 'Approve'}
                                                    onChange={(e: any) => (+e.target.value > 999 ? e.preventDefault() : e.target.value >= 0 ? handleChange(e) : null)}
                                                    onBlur={handleBlur}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionTextField(e);
                                                        blockInvalidChar(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                />
                                                {touched?.landlordShare && errors?.landlordShare ? <p className="form-error">{errors?.landlordShare}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={6} lg={6} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Remarks
                                                </Typography>
                                                <TextField
                                                    multiline
                                                    type="text"
                                                    defaultValue="5400"
                                                    size="small"
                                                    name="legal_remarks"
                                                    id="legal_remarks"
                                                    value={values?.legal_remarks || ''}
                                                    disabled={statusP === 'Approve'}
                                                    sx={statusP === 'Approve' ? { backgroundColor: '#f3f3f3' } : null}
                                                    onChange={handleChange}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionRemark(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.legal_remarks && errors?.legal_remarks ? <p className="form-error">{errors?.legal_remarks}</p> : null}
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel7'} onChange={handleChangeAccordian('panel7')}>
                                    <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
                                        <Typography style={accordionTitle}>PROPERTY IMAGE DETAILS</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid marginBottom="30px" container item spacing={5} justifyContent="start" alignSelf="center">
                                            <Grid item xs={12} md={3} style={{ position: 'relative' }}>
                                                <label htmlFor="PropertyFrontView" className="">
                                                    <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                                                        Building/Property front View
                                                    </Typography>
                                                    {(!imagePreview?.PropertyFrontView || !imageError?.PropertyFrontView) && (
                                                        <>
                                                            {statusP !== 'Approve' ? (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'PropertyFrontView')}>
                                                                    <span>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'PropertyFrontView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        <p style={{ marginTop: 10 }}> Drag your image here, </p>
                                                                        <p style={{ marginLeft: 35 }}>or Browse</p>
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            ) : (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard}>
                                                                    <span style={{ marginRight: '15px', marginTop: '15px' }}>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'PropertyFrontView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        {/* <p style={{ marginTop: 10 }}>
                                      {" "}
                                      Image{" "}
                                    </p> */}
                                                                        {/* <p style={{ marginLeft: 35 }}>or Browse</p> */}
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            )}
                                                            <input type="file" id="PropertyFrontView" name="PropertyFrontView" accept=".png, .jpg, .jpeg" hidden onChange={onImageChange} disabled={statusP === 'Approve'} />
                                                        </>
                                                    )}
                                                </label>
                                                {imagePreview?.PropertyFrontView && imageError?.PropertyFrontView && (
                                                    <>
                                                        <img
                                                            onError={(e) => errorImage(e, 'PropertyFrontView')}
                                                            id="PropertyFrontView"
                                                            src={imagePreview?.PropertyFrontView}
                                                            style={{
                                                                width: '100%',
                                                                height: 150,
                                                                borderRadius: '4px',
                                                            }}
                                                            draggable="false"
                                                            onDragStart={(e) => e.preventDefault()}
                                                        />
                                                        {statusP !== 'Approve' ? (
                                                            <IoIosCloseCircleOutline className="closeIocns" onClick={() => removeImage('PropertyFrontView')} />
                                                        ) : (
                                                            <IoIosCloseCircleOutline
                                                                className="closeIocns"
                                                                // onClick={() => removeImage("PropertyFrontView")}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                                {errorMsg?.PropertyFrontView && <p className="form-error">{errorMsg?.PropertyFrontView}</p>}
                                            </Grid>
                                            <Grid item xs={12} md={3} style={{ position: 'relative' }}>
                                                <label htmlFor="PropertyEntranceView" className="">
                                                    <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                                                        Building/Property Entrance View
                                                    </Typography>
                                                    {(!imagePreview?.PropertyEntranceView || !imageError?.PropertyEntranceView) && (
                                                        <>
                                                            {' '}
                                                            {statusP !== 'Approve' ? (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'PropertyEntranceView')}>
                                                                    <span>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'PropertyEntranceView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        <p style={{ marginTop: 10 }}> Drag your image here, </p>
                                                                        <p style={{ marginLeft: 35 }}>or Browse</p>
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            ) : (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard}>
                                                                    <span style={{ marginRight: '15px', marginTop: '15px' }}>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'PropertyEntranceView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        {/* <p style={{ marginTop: 10 }}>
                                      {" "}
                                      Image{" "}
                                    </p> */}
                                                                        {/* <p style={{ marginLeft: 35 }}>or Browse</p> */}
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            )}
                                                            <input type="file" id="PropertyEntranceView" name="PropertyEntranceView" accept=".png, .jpg, .jpeg" hidden onChange={onImageChange} disabled={statusP === 'Approve'} />
                                                        </>
                                                    )}
                                                </label>
                                                {imagePreview?.PropertyEntranceView && imageError?.PropertyEntranceView && (
                                                    <>
                                                        <img
                                                            onError={(e) => errorImage(e, 'PropertyEntranceView')}
                                                            src={imagePreview?.PropertyEntranceView}
                                                            style={{
                                                                width: '100%',
                                                                height: 150,
                                                                borderRadius: '4px',
                                                            }}
                                                            draggable="false"
                                                            onDragStart={(e) => e.preventDefault()}
                                                        />
                                                        {statusP !== 'Approve' ? <IoIosCloseCircleOutline className="closeIocns" onClick={() => removeImage('PropertyEntranceView')} /> : <IoIosCloseCircleOutline className="closeIocns" />}
                                                    </>
                                                )}
                                                {errorMsg?.PropertyEntranceView && <p className="form-error">{errorMsg?.PropertyEntranceView}</p>}
                                            </Grid>
                                            <Grid item xs={12} md={3} style={{ position: 'relative' }}>
                                                <label htmlFor="InteriorFrontView" className="">
                                                    <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                                                        Interior front view
                                                    </Typography>
                                                    {(!imagePreview?.InteriorFrontView || !imageError?.InteriorFrontView) && (
                                                        <>
                                                            {statusP !== 'Approve' ? (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'InteriorFrontView')}>
                                                                    <span>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'InteriorFrontView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        <p style={{ marginTop: 10 }}> Drag your image here, </p>
                                                                        <p style={{ marginLeft: 35 }}>or Browse</p>
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            ) : (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard}>
                                                                    <span style={{ marginRight: '15px', marginTop: '15px' }}>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'InteriorFrontView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        {/* <p style={{ marginTop: 10 }}>
                                      {" "}
                                      Image{" "}
                                    </p> */}
                                                                        {/* <p style={{ marginLeft: 35 }}>or Browse</p> */}
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            )}
                                                            <input type="file" id="InteriorFrontView" name="InteriorFrontView" accept=".png, .jpg, .jpeg" hidden onChange={onImageChange} disabled={statusP === 'Approve'} />
                                                        </>
                                                    )}
                                                </label>
                                                {imagePreview?.InteriorFrontView && imageError?.InteriorFrontView && (
                                                    <>
                                                        <img
                                                            onError={(e) => errorImage(e, 'InteriorFrontView')}
                                                            src={imagePreview?.InteriorFrontView}
                                                            style={{
                                                                width: '100%',
                                                                height: 150,
                                                                borderRadius: '4px',
                                                            }}
                                                            draggable="false"
                                                            onDragStart={(e) => e.preventDefault()}
                                                        />
                                                        {statusP !== 'Approve' ? <IoIosCloseCircleOutline className="closeIocns" onClick={() => removeImage('InteriorFrontView')} /> : <IoIosCloseCircleOutline className="closeIocns" />}
                                                    </>
                                                )}
                                                {errorMsg?.InteriorFrontView && <p className="form-error">{errorMsg?.InteriorFrontView}</p>}
                                            </Grid>
                                            <Grid item xs={12} md={3} style={{ position: 'relative' }}>
                                                <label htmlFor="InteriorRearView" className="">
                                                    <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                                                        Interior rear view
                                                    </Typography>
                                                    {(!imagePreview?.InteriorRearView || !imageError?.InteriorRearView) && (
                                                        <>
                                                            {statusP !== 'Approve' ? (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'InteriorRearView')}>
                                                                    <span>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'InteriorRearView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        <p style={{ marginTop: 10 }}> Drag your image here, </p>
                                                                        <p style={{ marginLeft: 35 }}>or Browse</p>
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            ) : (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard}>
                                                                    <span style={{ marginRight: '15px', marginTop: '15px' }}>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'InteriorRearView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        {/* <p style={{ marginTop: 10 }}>
                                      {" "}
                                      Image{" "}
                                    </p> */}
                                                                        {/* <p style={{ marginLeft: 35 }}>or Browse</p> */}
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            )}
                                                            <input type="file" id="InteriorRearView" name="InteriorRearView" accept=".png, .jpg, .jpeg" hidden onChange={onImageChange} disabled={statusP === 'Approve'} />
                                                        </>
                                                    )}
                                                </label>
                                                {imagePreview?.InteriorRearView && imageError?.InteriorRearView && (
                                                    <>
                                                        <img
                                                            onError={(e) => errorImage(e, 'InteriorRearView')}
                                                            src={imagePreview?.InteriorRearView}
                                                            style={{
                                                                width: '100%',
                                                                height: 150,
                                                                borderRadius: '4px',
                                                            }}
                                                            draggable="false"
                                                            onDragStart={(e) => e.preventDefault()}
                                                        />
                                                        {statusP !== 'Approve' ? <IoIosCloseCircleOutline className="closeIocns" onClick={() => removeImage('InteriorRearView')} /> : <IoIosCloseCircleOutline className="closeIocns" />}
                                                    </>
                                                )}
                                                {errorMsg?.InteriorRearView && <p className="form-error">{errorMsg?.InteriorRearView}</p>}
                                            </Grid>
                                            <Grid item xs={12} md={3} style={{ position: 'relative' }}>
                                                <label htmlFor="OfficeEntranceView" className="">
                                                    <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                                                        Office Entrance View
                                                    </Typography>
                                                    {(!imagePreview?.OfficeEntranceView || !imageError?.OfficeEntranceView) && (
                                                        <>
                                                            {statusP !== 'Approve' ? (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'OfficeEntranceView')}>
                                                                    <span>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'OfficeEntranceView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        <p style={{ marginTop: 10 }}> Drag your image here, </p>
                                                                        <p style={{ marginLeft: 35 }}>or Browse</p>
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            ) : (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard}>
                                                                    <span style={{ marginRight: '15px', marginTop: '15px' }}>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'OfficeEntranceView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        {/* <p style={{ marginTop: 10 }}>
                                      {" "}
                                      Image{" "}
                                    </p> */}
                                                                        {/* <p style={{ marginLeft: 35 }}>or Browse</p> */}
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            )}
                                                            <input type="file" id="OfficeEntranceView" name="OfficeEntranceView" accept=".png, .jpg, .jpeg" hidden onChange={onImageChange} disabled={statusP === 'Approve'} />
                                                        </>
                                                    )}
                                                </label>
                                                {imagePreview?.OfficeEntranceView && imageError?.OfficeEntranceView && (
                                                    <>
                                                        <img
                                                            onError={(e) => errorImage(e, 'OfficeEntranceView')}
                                                            src={imagePreview?.OfficeEntranceView}
                                                            style={{
                                                                width: '100%',
                                                                height: 150,
                                                                borderRadius: '4px',
                                                            }}
                                                            draggable="false"
                                                            onDragStart={(e) => e.preventDefault()}
                                                        />
                                                        {statusP !== 'Approve' ? <IoIosCloseCircleOutline className="closeIocns" onClick={() => removeImage('OfficeEntranceView')} /> : <IoIosCloseCircleOutline className="closeIocns" />}
                                                    </>
                                                )}
                                                {errorMsg?.OfficeEntranceView && <p className="form-error">{errorMsg?.OfficeEntranceView}</p>}
                                            </Grid>
                                            <Grid item xs={12} md={3} style={{ position: 'relative' }}>
                                                <label htmlFor="Washroom01View" className="">
                                                    <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                                                        Washroom 01 View
                                                    </Typography>
                                                    {(!imagePreview?.Washroom01View || !imageError?.Washroom01View) && (
                                                        <>
                                                            {' '}
                                                            {statusP !== 'Approve' ? (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'Washroom01View')}>
                                                                    <span>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'Washroom01View')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        <p style={{ marginTop: 10 }}> Drag your image here, </p>
                                                                        <p style={{ marginLeft: 35 }}>or Browse</p>
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            ) : (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard}>
                                                                    <span style={{ marginRight: '15px', marginTop: '15px' }}>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'Washroom01View')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        {/* <p style={{ marginTop: 10 }}>
                                      {" "}
                                      Image{" "}
                                    </p> */}
                                                                        {/* <p style={{ marginLeft: 35 }}>or Browse</p> */}
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            )}
                                                            <input type="file" id="Washroom01View" name="Washroom01View" accept=".png, .jpg, .jpeg" hidden onChange={onImageChange} disabled={statusP === 'Approve'} />
                                                        </>
                                                    )}
                                                </label>
                                                {imagePreview?.Washroom01View && imageError?.Washroom01View && (
                                                    <>
                                                        <img
                                                            onError={(e) => errorImage(e, 'Washroom01View')}
                                                            src={imagePreview?.Washroom01View}
                                                            style={{
                                                                width: '100%',
                                                                height: 150,
                                                                borderRadius: '4px',
                                                            }}
                                                            draggable="false"
                                                            onDragStart={(e) => e.preventDefault()}
                                                        />
                                                        {statusP !== 'Approve' ? <IoIosCloseCircleOutline className="closeIocns" onClick={() => removeImage('Washroom01View')} /> : <IoIosCloseCircleOutline className="closeIocns" />}
                                                    </>
                                                )}
                                                {errorMsg?.Washroom01View && <p className="form-error">{errorMsg?.Washroom01View}</p>}
                                            </Grid>
                                            <Grid item xs={12} md={3} style={{ position: 'relative' }}>
                                                <label htmlFor="Washroom02View" className="">
                                                    <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                                                        Washroom 02 View
                                                    </Typography>
                                                    {(!imagePreview?.Washroom02View || !imageError?.Washroom02View) && (
                                                        <>
                                                            {statusP !== 'Approve' ? (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'Washroom02View')}>
                                                                    <span>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'Washroom02View')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        <p style={{ marginTop: 10 }}> Drag your image here, </p>
                                                                        <p style={{ marginLeft: 35 }}>or Browse</p>
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            ) : (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard}>
                                                                    <span style={{ marginRight: '15px', marginTop: '15px' }}>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'Washroom02View')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        {/* <p style={{ marginTop: 10 }}>
                                      {" "}
                                      Image{" "}
                                    </p> */}
                                                                        {/* <p style={{ marginLeft: 35 }}>or Browse</p> */}
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            )}
                                                            <input type="file" id="Washroom02View" name="Washroom02View" accept=".png, .jpg, .jpeg" hidden onChange={onImageChange} disabled={statusP === 'Approve'} />
                                                        </>
                                                    )}
                                                </label>
                                                {imagePreview?.Washroom02View && imageError?.Washroom02View && (
                                                    <>
                                                        <img
                                                            onError={(e) => errorImage(e, 'Washroom02View')}
                                                            src={imagePreview?.Washroom02View}
                                                            style={{
                                                                width: '100%',
                                                                height: 150,
                                                                borderRadius: '4px',
                                                            }}
                                                            draggable="false"
                                                            onDragStart={(e) => e.preventDefault()}
                                                        />
                                                        {statusP !== 'Approve' ? <IoIosCloseCircleOutline className="closeIocns" onClick={() => removeImage('Washroom02View')} /> : <IoIosCloseCircleOutline className="closeIocns" />}
                                                    </>
                                                )}
                                                {errorMsg?.Washroom02View && <p className="form-error">{errorMsg?.Washroom02View}</p>}
                                            </Grid>
                                            <Grid item xs={12} md={3} style={{ position: 'relative' }}>
                                                <label htmlFor="PropertyLeftSideView" className="">
                                                    <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                                                        Building/Property Left side View
                                                    </Typography>
                                                    {(!imagePreview?.PropertyLeftSideView || !imageError?.PropertyLeftSideView) && (
                                                        <>
                                                            {' '}
                                                            {statusP !== 'Approve' ? (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'PropertyLeftSideView')}>
                                                                    <span>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'PropertyLeftSideView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        <p style={{ marginTop: 10 }}> Drag your image here, </p>
                                                                        <p style={{ marginLeft: 35 }}>or Browse</p>
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            ) : (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard}>
                                                                    <span style={{ marginRight: '15px', marginTop: '15px' }}>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'PropertyLeftSideView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        {/* <p style={{ marginTop: 10 }}>
                                      {" "}
                                      Image{" "}
                                    </p> */}
                                                                        {/* <p style={{ marginLeft: 35 }}>or Browse</p> */}
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            )}
                                                            <input type="file" id="PropertyLeftSideView" name="PropertyLeftSideView" accept=".png, .jpg, .jpeg" hidden onChange={onImageChange} disabled={statusP === 'Approve'} />
                                                        </>
                                                    )}
                                                </label>
                                                {imagePreview?.PropertyLeftSideView && imageError?.PropertyLeftSideView && (
                                                    <>
                                                        <img
                                                            onError={(e) => errorImage(e, 'PropertyLeftSideView')}
                                                            src={imagePreview?.PropertyLeftSideView}
                                                            style={{
                                                                width: '100%',
                                                                height: 150,
                                                                borderRadius: '4px',
                                                            }}
                                                            draggable="false"
                                                            onDragStart={(e) => e.preventDefault()}
                                                        />
                                                        {statusP !== 'Approve' ? <IoIosCloseCircleOutline className="closeIocns" onClick={() => removeImage('PropertyLeftSideView')} /> : <IoIosCloseCircleOutline className="closeIocns" />}
                                                    </>
                                                )}
                                                {errorMsg?.PropertyLeftSideView && <p className="form-error">{errorMsg?.PropertyLeftSideView}</p>}
                                            </Grid>
                                            <Grid item xs={12} md={3} style={{ position: 'relative' }}>
                                                <label htmlFor="PropertyRightSideView" className="">
                                                    <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                                                        Building/Property Right side View
                                                    </Typography>
                                                    {(!imagePreview?.PropertyRightSideView || !imageError?.PropertyRightSideView) && (
                                                        <>
                                                            {statusP !== 'Approve' ? (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'PropertyRightSideView')}>
                                                                    <span>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'PropertyRightSideView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        <p style={{ marginTop: 10 }}> Drag your image here, </p>
                                                                        <p style={{ marginLeft: 35 }}>or Browse</p>
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            ) : (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard}>
                                                                    <span style={{ marginRight: '15px', marginTop: '15px' }}>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'PropertyRightSideView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        {/* <p style={{ marginTop: 10 }}>
                                      {" "}
                                      Image{" "}
                                    </p> */}
                                                                        {/* <p style={{ marginLeft: 35 }}>or Browse</p> */}
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            )}
                                                            <input type="file" id="PropertyRightSideView" name="PropertyRightSideView" accept=".png, .jpg, .jpeg" hidden onChange={onImageChange} disabled={statusP === 'Approve'} />
                                                        </>
                                                    )}
                                                </label>
                                                {imagePreview?.PropertyRightSideView && imageError?.PropertyRightSideView && (
                                                    <>
                                                        <img
                                                            onError={(e) => errorImage(e, 'PropertyRightSideView')}
                                                            src={imagePreview?.PropertyRightSideView}
                                                            style={{
                                                                width: '100%',
                                                                height: 150,
                                                                borderRadius: '4px',
                                                            }}
                                                            draggable="false"
                                                            onDragStart={(e) => e.preventDefault()}
                                                        />
                                                        {statusP !== 'Approve' ? <IoIosCloseCircleOutline className="closeIocns" onClick={() => removeImage('PropertyRightSideView')} /> : <IoIosCloseCircleOutline className="closeIocns" />}
                                                    </>
                                                )}
                                                {errorMsg?.PropertyRightSideView && <p className="form-error">{errorMsg?.PropertyRightSideView}</p>}
                                            </Grid>
                                            <Grid item xs={12} md={3} style={{ position: 'relative' }}>
                                                <label htmlFor="PropertyRearSideView" className="">
                                                    <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                                                        Building/Property Rear side View
                                                    </Typography>
                                                    {(!imagePreview?.PropertyRearSideView || !imageError?.PropertyRearSideView) && (
                                                        <>
                                                            {statusP !== 'Approve' ? (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'PropertyRearSideView')}>
                                                                    <span>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'PropertyRearSideView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        <p style={{ marginTop: 10 }}> Drag your image here, </p>
                                                                        <p style={{ marginLeft: 35 }}>or Browse</p>
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            ) : (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard}>
                                                                    <span style={{ marginRight: '15px', marginTop: '15px' }}>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'PropertyRearSideView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        {/* <p style={{ marginTop: 10 }}>
                                      {" "}
                                      Image{" "}
                                    </p> */}
                                                                        {/* <p style={{ marginLeft: 35 }}>or Browse</p> */}
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            )}
                                                            <input type="file" id="PropertyRearSideView" name="PropertyRearSideView" accept=".png, .jpg, .jpeg" hidden onChange={onImageChange} disabled={statusP === 'Approve'} />
                                                        </>
                                                    )}
                                                </label>
                                                {imagePreview?.PropertyRearSideView && imageError?.PropertyRearSideView && (
                                                    <>
                                                        <img
                                                            onError={(e) => errorImage(e, 'PropertyRearSideView')}
                                                            src={imagePreview?.PropertyRearSideView}
                                                            style={{
                                                                width: '100%',
                                                                height: 150,
                                                                borderRadius: '4px',
                                                            }}
                                                            draggable="false"
                                                            onDragStart={(e) => e.preventDefault()}
                                                        />
                                                        {statusP !== 'Approve' ? <IoIosCloseCircleOutline className="closeIocns" onClick={() => removeImage('PropertyRearSideView')} /> : <IoIosCloseCircleOutline className="closeIocns" />}
                                                    </>
                                                )}
                                                {errorMsg?.PropertyRearSideView && <p className="form-error">{errorMsg?.PropertyRearSideView}</p>}
                                            </Grid>
                                            <Grid item xs={12} md={3} style={{ position: 'relative' }}>
                                                <label htmlFor="PropertyOppositeView" className="">
                                                    <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                                                        Building/Property Opposite View
                                                    </Typography>
                                                    {(!imagePreview?.PropertyOppositeView || !imageError?.PropertyOppositeView) && (
                                                        <>
                                                            {statusP !== 'Approve' ? (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'PropertyOppositeView')}>
                                                                    <span>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'PropertyOppositeView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        <p style={{ marginTop: 10 }}> Drag your image here, </p>
                                                                        <p style={{ marginLeft: 35 }}>or Browse</p>
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            ) : (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard}>
                                                                    <span style={{ marginRight: '15px', marginTop: '15px' }}>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'PropertyOppositeView')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        {/* <p style={{ marginTop: 10 }}>
                                      {" "}
                                      Image{" "}
                                    </p> */}
                                                                        {/* <p style={{ marginLeft: 35 }}>or Browse</p> */}
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            )}
                                                            <input type="file" id="PropertyOppositeView" name="PropertyOppositeView" accept=".png, .jpg, .jpeg" hidden onChange={onImageChange} disabled={statusP === 'Approve'} />
                                                        </>
                                                    )}
                                                </label>
                                                {imagePreview?.PropertyOppositeView && imageError?.PropertyOppositeView && (
                                                    <>
                                                        <img
                                                            onError={(e) => errorImage(e, 'PropertyOppositeView')}
                                                            src={imagePreview?.PropertyOppositeView}
                                                            style={{
                                                                width: '100%',
                                                                height: 150,
                                                                borderRadius: '4px',
                                                            }}
                                                            draggable="false"
                                                            onDragStart={(e) => e.preventDefault()}
                                                        />
                                                        {statusP !== 'Approve' ? <IoIosCloseCircleOutline className="closeIocns" onClick={() => removeImage('PropertyOppositeView')} /> : <IoIosCloseCircleOutline className="closeIocns" />}
                                                    </>
                                                )}
                                                {errorMsg?.PropertyOppositeView && <p className="form-error">{errorMsg?.PropertyOppositeView}</p>}
                                            </Grid>
                                            <Grid item xs={12} md={3} style={{ position: 'relative' }}>
                                                <label htmlFor="PropertyParkingImage" className="">
                                                    <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                                                        Building/Property Parking Image
                                                    </Typography>
                                                    {(!imagePreview?.PropertyParkingImage || !imageError?.PropertyParkingImage) && (
                                                        <>
                                                            {statusP !== 'Approve' ? (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'PropertyParkingImage')}>
                                                                    <span>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'PropertyParkingImage')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        <p style={{ marginTop: 10 }}> Drag your image here, </p>
                                                                        <p style={{ marginLeft: 35 }}>or Browse</p>
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            ) : (
                                                                <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard}>
                                                                    <span style={{ marginRight: '15px', marginTop: '15px' }}>
                                                                        <img
                                                                            onError={(e) => errorImage(e, 'PropertyParkingImage')}
                                                                            src={Image}
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                marginLeft: 45,
                                                                                marginTop: 10,
                                                                            }}
                                                                        />
                                                                        <br />
                                                                        {/* <p style={{ marginTop: 10 }}>
                                      {" "}
                                      Image{" "}
                                    </p> */}
                                                                        {/* <p style={{ marginLeft: 35 }}>or Browse</p> */}
                                                                        <p
                                                                            style={{
                                                                                marginTop: 10,
                                                                                fontSize: 10,
                                                                                marginLeft: 20,
                                                                                color: '#848181',
                                                                            }}
                                                                        >
                                                                            Supports: JPG or PNG
                                                                        </p>
                                                                    </span>
                                                                </Box>
                                                            )}
                                                            <input type="file" id="PropertyParkingImage" name="PropertyParkingImage" accept=".png, .jpg, .jpeg" hidden onChange={onImageChange} disabled={statusP === 'Approve'} />
                                                        </>
                                                    )}
                                                </label>
                                                {imagePreview?.PropertyParkingImage && imageError?.PropertyParkingImage && (
                                                    <>
                                                        <img
                                                            onError={(e) => errorImage(e, 'PropertyParkingImage')}
                                                            src={imagePreview?.PropertyParkingImage}
                                                            style={{
                                                                width: '100%',
                                                                height: 150,
                                                                borderRadius: '4px',
                                                            }}
                                                            draggable="false"
                                                            onDragStart={(e) => e.preventDefault()}
                                                        />
                                                        {statusP !== 'Approve' ? <IoIosCloseCircleOutline className="closeIocns" onClick={() => removeImage('PropertyParkingImage')} /> : <IoIosCloseCircleOutline className="closeIocns" />}
                                                    </>
                                                )}
                                                {errorMsg?.PropertyParkingImage && <p className="form-error">{errorMsg?.PropertyParkingImage}</p>}
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel8'} onChange={handleChangeAccordian('panel8')}>
                                    <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
                                        <Typography style={accordionTitle}>UTILITY</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid marginBottom="30px" container item spacing={5} justifyContent="start" alignSelf="center" className="addProperty">
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Electricity Connection Availability
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.electricityConnectionAvailablity}
                                                    handleChange={(e: any) => handleChangeToggle(e, 'electricityConnectionAvailablity')}
                                                    yes={'yes'}
                                                    no={'no'}
                                                    disabled={statusP === 'Approve'}
                                                    name="electricityConnectionAvailablity"
                                                    id="electricityConnectionAvailablity"
                                                    onBlur={handleBlur}
                                                    bold="true"
                                                />
                                                {touched?.electricityConnectionAvailablity && errors?.electricityConnectionAvailablity ? <p className="form-error">{errors?.electricityConnectionAvailablity}</p> : null}
                                            </Grid>
                                            {toggleSwitch?.electricityConnectionAvailablity === true ? (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Electricity Power Load (In KVA)"
                                                        id="electricityPowerLoad"
                                                        name="electricityPowerLoad"
                                                        type="number"
                                                        defaultValue={0}
                                                        size="small"
                                                        value={values?.electricityPowerLoad || ''}
                                                        disabled={statusP === 'Approve'}
                                                        onChange={(e: any) => {
                                                            if (e.target.value >= 0) {
                                                                handleChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        onKeyDown={(e: any) => {
                                                            regExpressionTextField(e);
                                                            blockInvalidChar(e);
                                                            if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        }}
                                                    />
                                                    {touched?.electricityPowerLoad && errors?.electricityPowerLoad ? <p className="form-error">{errors?.electricityPowerLoad}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Electricity Power Load (In KVA)"
                                                        id="electricityPowerLoad"
                                                        name="electricityPowerLoad"
                                                        type="number"
                                                        defaultValue={0}
                                                        size="small"
                                                        sx={{ backgroundColor: '#f3f3f3' }}
                                                        value={toggleSwitch?.electricityConnectionAvailablity === true ? values?.electricityPowerLoad : ''}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        disabled
                                                    />
                                                    {touched?.electricityPowerLoad && errors?.electricityPowerLoad ? <p className="form-error">{errors?.electricityPowerLoad}</p> : null}
                                                </Grid>
                                            )}

                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Electricity Connection Born By
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.electricityConnectionBornBy}
                                                    handleChange={(e: any) => handleChangeToggle(e, 'electricityConnectionBornBy')}
                                                    yes={'BFL'}
                                                    no={'Landlord'}
                                                    disabled={statusP === 'Approve'}
                                                    name="electricityConnectionBornBy"
                                                    id="electricityConnectionBornBy"
                                                    onBlur={handleBlur}
                                                    bold="true"
                                                />
                                                {touched?.electricityConnectionBornBy && errors?.electricityConnectionBornBy ? <p className="form-error">{errors?.electricityConnectionBornBy}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Water Supply Availability
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.waterSupplyAvailability}
                                                    handleChange={(e: any) => handleChangeToggle(e, 'waterSupplyAvailability')}
                                                    yes={'24X7'}
                                                    no={'Fixed Time'}
                                                    disabled={statusP === 'Approve'}
                                                    name="waterSupplyAvailability"
                                                    id="waterSupplyAvailability"
                                                    onBlur={handleBlur}
                                                    bold="true"
                                                />
                                                {touched?.waterSupplyAvailability && errors?.waterSupplyAvailability ? <p className="form-error">{errors?.waterSupplyAvailability}</p> : null}
                                            </Grid>
                                            {toggleSwitch?.waterSupplyAvailability === false ? (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <TimePicker label="Select Water Supply From Timings" value={waterSupply} disabled={statusP === 'Approve'} onChange={handleChangeTime} renderInput={(params) => <TextField {...params} size="small" />} />
                                                    </LocalizationProvider>
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ backgroundColor: '#f3f3f3' }}>
                                                        <TimePicker label="Select Water Supply From Timings" value={waterSupply} disabled onChange={handleChangeTime} renderInput={(params) => <TextField {...params} size="small" sx={{ backgroundColor: '#f3f3f3' }} />} />
                                                    </LocalizationProvider>
                                                </Grid>
                                            )}
                                            {toggleSwitch?.waterSupplyAvailability === false ? (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <TimePicker label="Select Water Supply To Timings" value={waterToSupply} disabled={statusP === 'Approve'} onChange={handleChangeToTime} renderInput={(params) => <TextField {...params} size="small" />} />
                                                    </LocalizationProvider>
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ backgroundColor: '#f3f3f3' }}>
                                                        <TimePicker label="Select Water Supply To Timings" value={waterToSupply} disabled onChange={handleChangeToTime} renderInput={(params) => <TextField {...params} size="small" sx={{ backgroundColor: '#f3f3f3' }} />} />
                                                    </LocalizationProvider>
                                                </Grid>
                                            )}
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Sink with tiles Ava. in Pantry Area
                                                </Typography>
                                                <ToggleSwitch alignment={toggleSwitch?.sinkWithTiles} handleChange={(e: any) => handleChangeToggle(e, 'sinkWithTiles')} yes={'yes'} no={'no'} disabled={statusP === 'Approve'} name="sinkWithTiles" id="sinkWithTiles" onBlur={handleBlur} bold="true" />
                                                {touched?.sinkWithTiles && errors?.sinkWithTiles ? <p className="form-error">{errors?.sinkWithTiles}</p> : null}
                                            </Grid>
                                            <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                <Typography className="add-prop-bold" sx={toggleTitle}>
                                                    Washroom Availability
                                                </Typography>
                                                <ToggleSwitch
                                                    alignment={toggleSwitch?.washroomAvailablity}
                                                    handleChange={(e: any) => handleChangeToggle(e, 'washroomAvailablity')}
                                                    yes={'yes'}
                                                    no={'no'}
                                                    disabled={statusP === 'Approve'}
                                                    name="washroomAvailablity"
                                                    id="washroomAvailablity"
                                                    onBlur={handleBlur}
                                                    bold="true"
                                                />
                                                {touched?.washroomAvailablity && errors?.washroomAvailablity ? <p className="form-error">{errors?.washroomAvailablity}</p> : null}
                                            </Grid>

                                            {toggleSwitch?.washroomAvailablity === true ? (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <DropdownMenu
                                                        state={values?.washroomType}
                                                        handleChange={handleChange}
                                                        title="Washroom Type"
                                                        name="washroomType"
                                                        id="washroomType"
                                                        value={values?.washroomType || ''}
                                                        disabled={statusP === 'Approve'}
                                                        onBlur={handleBlur}
                                                        menu={WashroomType?.map((v: any) => v?.formName)}
                                                    />
                                                    {touched?.washroomType && errors?.washroomType ? <p className="form-error">{errors?.washroomType}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <FormControl sx={{ mt: 1, ml: 1, minWidth: 120 }} size="small">
                                                        <InputLabel id="demo-select-small">Washroom Type</InputLabel>
                                                        <Select name="washroomType" size="small" sx={{ backgroundColor: '#f3f3f3' }} id="washroomType" value={values?.washroomType || ''} label="Washroom Type" disabled>
                                                            <MenuItem value={['1']}>1</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            )}

                                            {toggleSwitch?.washroomAvailablity === true ? (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Washroom Available Count"
                                                        id="washroomAvailableCount"
                                                        name="washroomAvailableCount"
                                                        type="number"
                                                        defaultValue=""
                                                        size="small"
                                                        value={values?.washroomAvailableCount || ''}
                                                        disabled={statusP === 'Approve'}
                                                        onChange={(e: any) => {
                                                            if (e.target.value >= 0) {
                                                                handleChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        onKeyDown={(e: any) => {
                                                            regExpressionTextField(e);
                                                            blockInvalidChar(e);
                                                            if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        }}
                                                    />
                                                    {touched?.washroomAvailableCount && errors?.washroomAvailableCount ? <p className="form-error">{errors?.washroomAvailableCount}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Washroom Available Count"
                                                        id="washroomAvailableCount"
                                                        name="washroomAvailableCount"
                                                        type="number"
                                                        defaultValue=""
                                                        size="small"
                                                        value={values?.washroomAvailableCount || ''}
                                                        sx={{ backgroundColor: '#f3f3f3' }}
                                                        onChange={(e: any) => {
                                                            if (e.target.value >= 0) {
                                                                handleChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        disabled
                                                        onKeyDown={(e: any) => {
                                                            regExpressionTextField(e);
                                                            if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        }}
                                                    />
                                                </Grid>
                                            )}

                                            {toggleSwitch?.washroomAvailablity === true ? (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        className="InputLabelProperty"
                                                        label="Male Washroom Count"
                                                        id="maleWashroomCount"
                                                        name="maleWashroomCount"
                                                        type="number"
                                                        defaultValue=""
                                                        size="small"
                                                        value={values?.maleWashroomCount || ''}
                                                        disabled={statusP === 'Approve'}
                                                        onChange={(e: any) => {
                                                            if (e.target.value >= 0) {
                                                                handleChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        onKeyDown={(e: any) => {
                                                            regExpressionTextField(e);
                                                            blockInvalidChar(e);
                                                            if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        }}
                                                    />
                                                    {touched?.maleWashroomCount && errors?.maleWashroomCount ? <p className="form-error">{errors?.maleWashroomCount}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        className="InputLabelProperty"
                                                        label="Male Washroom Count"
                                                        id="maleWashroomCount"
                                                        name="maleWashroomCount"
                                                        type="number"
                                                        defaultValue=""
                                                        size="small"
                                                        value={0}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        disabled
                                                        sx={{ backgroundColor: '#f3f3f3' }}
                                                    />
                                                </Grid>
                                            )}
                                            {toggleSwitch?.washroomAvailablity === true ? (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        className="InputLabelProperty"
                                                        label="Female Washroom Count"
                                                        id="femaleWashroomCount"
                                                        name="femaleWashroomCount"
                                                        type="number"
                                                        defaultValue=""
                                                        size="small"
                                                        value={values?.femaleWashroomCount || ''}
                                                        disabled={statusP === 'Approve'}
                                                        onChange={(e: any) => {
                                                            if (e.target.value >= 0) {
                                                                handleChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        onKeyDown={(e: any) => {
                                                            regExpressionTextField(e);
                                                            blockInvalidChar(e);
                                                            if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        }}
                                                    />
                                                    {touched?.femaleWashroomCount && errors?.femaleWashroomCount ? <p className="form-error">{errors?.femaleWashroomCount}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        className="InputLabelProperty"
                                                        label="Female Washroom Count"
                                                        id="femaleWashroomCount"
                                                        name="femaleWashroomCount"
                                                        type="number"
                                                        defaultValue=""
                                                        size="small"
                                                        value={0}
                                                        sx={{ backgroundColor: '#f3f3f3' }}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        disabled
                                                    />
                                                </Grid>
                                            )}

                                            {toggleSwitch?.washroomAvailablity === true ? (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <DropdownMenu
                                                        state={values?.urinalsAvailableInMaleWashroom}
                                                        handleChange={(e) => {
                                                            handleChange(e);
                                                            if (e?.target?.value > 1) {
                                                                setFieldValue('urinalsCountInMaleWashroom', '');
                                                            }
                                                        }}
                                                        title=" Urinals Ava. in Male Washroom"
                                                        name="urinalsAvailableInMaleWashroom"
                                                        id="urinalsAvailableInMaleWashroom"
                                                        value={values?.urinalsAvailableInMaleWashroom || ''}
                                                        disabled={statusP === 'Approve'}
                                                        onBlur={handleBlur}
                                                        menu={['Yes', 'No', 'Not Applicable']}
                                                    />
                                                    {touched?.urinalsAvailableInMaleWashroom && errors?.urinalsAvailableInMaleWashroom ? <p className="form-error">{errors?.urinalsAvailableInMaleWashroom}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <FormControl sx={{ mt: 1, ml: 1, minWidth: 120 }} size="small">
                                                        <InputLabel id="demo-select-small">Urinals Ava. in Male Washroom</InputLabel>
                                                        <Select name="urinalsAvailableInMaleWashroom" size="small" sx={{ backgroundColor: '#f3f3f3' }} id="urinalsAvailableInMaleWashroom" value={values?.urinalsAvailableInMaleWashroom || ''} label="Urinals Ava. in Male Washroom" disabled>
                                                            <MenuItem value={['1']}>1</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            )}

                                            {toggleSwitch?.washroomAvailablity === true && values?.urinalsAvailableInMaleWashroom == '1' ? (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Urinals count In Male Washroom "
                                                        id="urinalsCountInMaleWashroom"
                                                        name="urinalsCountInMaleWashroom"
                                                        type="number"
                                                        defaultValue=""
                                                        size="small"
                                                        value={values?.urinalsCountInMaleWashroom || ''}
                                                        disabled={statusP === 'Approve'}
                                                        onChange={(e: any) => {
                                                            if (e.target.value >= 0) {
                                                                handleChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        onKeyDown={(e: any) => {
                                                            regExpressionTextField(e);
                                                            blockInvalidChar(e);
                                                            if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        }}
                                                    />
                                                    {touched?.urinalsCountInMaleWashroom && errors?.urinalsCountInMaleWashroom ? <p className="form-error">{errors?.urinalsCountInMaleWashroom}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Urinals count In Male Washroom "
                                                        id="urinalsCountInMaleWashroom"
                                                        name="urinalsCountInMaleWashroom"
                                                        type="number"
                                                        defaultValue=""
                                                        size="small"
                                                        value={values?.urinalsCountInMaleWashroom || ''}
                                                        sx={{ backgroundColor: '#f3f3f3' }}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        disabled
                                                    />
                                                </Grid>
                                            )}
                                            {toggleSwitch?.washroomAvailablity === true ? (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <Typography className="add-prop-bold" sx={toggleTitle}>
                                                        Toilet Seat Type In Male Washroom
                                                    </Typography>
                                                    <ToggleSwitch
                                                        alignment={toggleSwitch?.toiletSeatTypeInMaleWashroom}
                                                        handleChange={(e: any) => handleChangeToggle(e, 'toiletSeatTypeInMaleWashroom')}
                                                        yes={'Indian'}
                                                        no={'WC'}
                                                        name="toiletSeatTypeInMaleWashroom"
                                                        id="toiletSeatTypeInMaleWashroom"
                                                        onBlur={handleBlur}
                                                        disabled={statusP === 'Approve'}
                                                        bold="true"
                                                    />
                                                    {touched?.toiletSeatTypeInMaleWashroom && errors?.toiletSeatTypeInMaleWashroom ? <p className="form-error">{errors?.toiletSeatTypeInMaleWashroom}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <Typography className="add-prop-bold" sx={toggleTitle}>
                                                        Toilet Seat Type In Male Washroom
                                                    </Typography>
                                                    <ToggleSwitch
                                                        alignment={''}
                                                        handleChange={(e: any) => handleChangeToggle(e, 'toiletSeatTypeInMaleWashroom')}
                                                        yes={'Indian'}
                                                        no={'WC'}
                                                        name="toiletSeatTypeInMaleWashroom"
                                                        id="toiletSeatTypeInMaleWashroom"
                                                        onBlur={handleBlur}
                                                        disabled={true}
                                                        bold="true"
                                                    />
                                                    {touched?.toiletSeatTypeInMaleWashroom && errors?.toiletSeatTypeInMaleWashroom ? <p className="form-error">{errors?.toiletSeatTypeInMaleWashroom}</p> : null}
                                                </Grid>
                                            )}

                                            {toggleSwitch?.washroomAvailablity === true ? (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Toilet Seat count In Male Washroom "
                                                        id="toiletSeatCountInMaleWashroom"
                                                        name="toiletSeatCountInMaleWashroom"
                                                        defaultValue=""
                                                        type="number"
                                                        size="small"
                                                        value={values?.toiletSeatCountInMaleWashroom || ''}
                                                        disabled={statusP === 'Approve'}
                                                        onChange={(e: any) => {
                                                            if (e.target.value >= 0) {
                                                                handleChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        onKeyDown={(e: any) => {
                                                            regExpressionTextField(e);
                                                            blockInvalidChar(e);
                                                            if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        }}
                                                    />
                                                    {touched?.toiletSeatCountInMaleWashroom && errors?.toiletSeatCountInMaleWashroom ? <p className="form-error">{errors?.toiletSeatCountInMaleWashroom}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Toilet Seat count In Male Washroom "
                                                        id="toiletSeatCountInMaleWashroom"
                                                        name="toiletSeatCountInMaleWashroom"
                                                        defaultValue=""
                                                        type="number"
                                                        size="small"
                                                        value={values?.toiletSeatCountInMaleWashroom || ''}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        sx={{ backgroundColor: '#f3f3f3' }}
                                                        disabled
                                                    />
                                                </Grid>
                                            )}

                                            {toggleSwitch?.washroomAvailablity === true ? (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Toilet Seat count In Female Washroom "
                                                        id="toiletSeatCountInFemaleWashroom"
                                                        name="toiletSeatCountInFemaleWashroom"
                                                        type="number"
                                                        defaultValue=""
                                                        size="small"
                                                        value={values?.toiletSeatCountInFemaleWashroom || ''}
                                                        disabled={statusP === 'Approve'}
                                                        onChange={(e: any) => {
                                                            if (e.target.value >= 0) {
                                                                handleChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        onKeyDown={(e: any) => {
                                                            regExpressionTextField(e);
                                                            blockInvalidChar(e);
                                                            if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                        }}
                                                    />
                                                    {touched?.toiletSeatCountInFemaleWashroom && errors?.toiletSeatCountInFemaleWashroom ? <p className="form-error">{errors?.toiletSeatCountInFemaleWashroom}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3}>
                                                    <TextField
                                                        label="Toilet Seat count In Female Washroom "
                                                        id="toiletSeatCountInFemaleWashroom"
                                                        name="toiletSeatCountInFemaleWashroom"
                                                        type="number"
                                                        defaultValue=""
                                                        size="small"
                                                        sx={{ backgroundColor: '#f3f3f3' }}
                                                        value={values?.toiletSeatCountInFemaleWashroom || ''}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        disabled
                                                    />
                                                </Grid>
                                            )}
                                            {toggleSwitch?.washroomAvailablity === true ? (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <Typography className="add-prop-bold10" sx={toggleTitle}>
                                                        Wash Basin Ava. inside washrooms
                                                    </Typography>
                                                    <ToggleSwitch
                                                        alignment={toggleSwitch?.washBasinAvailableInsideWashrooms}
                                                        handleChange={(e: any) => handleChangeToggle(e, 'washBasinAvailableInsideWashrooms')}
                                                        yes={'Yes'}
                                                        no={'No'}
                                                        name="washBasinAvailableInsideWashrooms"
                                                        id="washBasinAvailableInsideWashrooms"
                                                        onBlur={handleBlur}
                                                        disabled={statusP === 'Approve'}
                                                        bold="true"
                                                    />
                                                    {touched?.washBasinAvailableInsideWashrooms && errors?.washBasinAvailableInsideWashrooms ? <p className="form-error">{errors?.washBasinAvailableInsideWashrooms}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <Typography className="add-prop-bold10" sx={toggleTitle}>
                                                        Wash Basin Ava. inside washrooms
                                                    </Typography>
                                                    <ToggleSwitch
                                                        alignment={alignment}
                                                        handleChange={(e: any) => handleChangeToggle(e, 'washBasinAvailableInsideWashrooms')}
                                                        yes={'Yes'}
                                                        no={'No'}
                                                        name="washBasinAvailableInsideWashrooms"
                                                        id="washBasinAvailableInsideWashrooms"
                                                        onBlur={handleBlur}
                                                        disabled={true}
                                                        bold="true"
                                                    />
                                                </Grid>
                                            )}
                                            {toggleSwitch?.washroomAvailablity === true ? (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <Typography className="add-prop-bold10" sx={toggleTitle}>
                                                        Doors, Lock and Key Ava. in washrooms
                                                    </Typography>
                                                    <ToggleSwitch
                                                        alignment={toggleSwitch?.keyAvailableInWashrooms}
                                                        handleChange={(e: any) => handleChangeToggle(e, 'keyAvailableInWashrooms')}
                                                        yes={'Yes'}
                                                        no={'No'}
                                                        name="keyAvailableInWashrooms"
                                                        id="keyAvailableInWashrooms"
                                                        onBlur={handleBlur}
                                                        disabled={statusP === 'Approve'}
                                                        bold="true"
                                                    />
                                                    {touched?.keyAvailableInWashrooms && errors?.keyAvailableInWashrooms ? <p className="form-error">{errors?.keyAvailableInWashrooms}</p> : null}
                                                </Grid>
                                            ) : (
                                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                                    <Typography className="add-prop-bold10" sx={toggleTitle}>
                                                        Doors, Lock and Key Ava. in washrooms
                                                    </Typography>
                                                    <ToggleSwitch alignment={alignment} handleChange={(e: any) => handleChangeToggle(e, 'keyAvailableInWashrooms')} yes={'Yes'} no={'No'} name="keyAvailableInWashrooms" id="keyAvailableInWashrooms" onBlur={handleBlur} disabled={true} bold="true" />
                                                    {touched?.keyAvailableInWashrooms && errors?.keyAvailableInWashrooms ? <p className="form-error">{errors?.keyAvailableInWashrooms}</p> : null}
                                                </Grid>
                                            )}
                                            <Grid item xs={6} md={6} lg={6} sx={{ position: 'relative' }}>
                                                <Typography className="required add-prop-bold" sx={toggleTitle}>
                                                    Remarks
                                                </Typography>
                                                <TextField
                                                    type="text"
                                                    multiline
                                                    defaultValue="5400"
                                                    size="small"
                                                    name="utility_remarks"
                                                    id="utility_remarks"
                                                    value={values?.utility_remarks || ''}
                                                    disabled={statusP === 'Approve'}
                                                    sx={statusP === 'Approve' ? { backgroundColor: '#f3f3f3' } : null}
                                                    onChange={handleChange}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionRemark(e);
                                                        if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                                {touched?.utility_remarks && errors?.utility_remarks ? <p className="form-error">{errors?.utility_remarks}</p> : null}
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={expanded === 'panel9'} onChange={handleChangeAccordian('panel9')}>
                                    <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
                                        <Typography style={accordionTitle}>PROPERTY ADDITIONAL DOCUMENTS</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid item xs={6} md={6}>
                                            <div>
                                                <Button
                                                    onClick={() => {
                                                        fileInput.current.click();
                                                    }}
                                                    variant="outlined"
                                                    size="medium"
                                                    style={statusP !== 'Approve' ? secondaryButton : { backgroundColor: '#f3f3f3' }}
                                                    disabled={statusP === 'Approve'}
                                                >
                                                    Upload
                                                </Button>
                                                <input
                                                    ref={fileInput}
                                                    multiple
                                                    onChange={handleFileEvent}
                                                    disabled={fileLimit}
                                                    accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,
text/plain, application/pdf, image/*"
                                                    type="file"
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                        </Grid>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginTop: '10px',
                                            }}
                                        >
                                            <Typography>Version History</Typography>{' '}
                                        </div>
                                        <div style={{ height: '150px', marginBottom: '0px' }}>
                                            <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefsUpload} rowData={docUploadHistory || []} onGridReady={onGridReady3} gridRef={gridRef3} pagination={false} paginationPageSize={null} />
                                        </div>
                                    </AccordionDetails>
                                </Accordion>

                                <div className="bottom-fix-btn">
                                    {statusP !== 'Approve' && (!params?.propertyId || (params?.propertyId && !isSubmitted)) && (
                                        <Button
                                            variant="outlined"
                                            size="medium"
                                            type="submit"
                                            onClick={() => {
                                                setErrors({});
                                                setIsSaveAsDraft(true);
                                            }}
                                            style={{
                                                padding: '2px 20px',
                                                borderRadius: 6,
                                                color: '#00316a',
                                                borderColor: '#00316a',
                                            }}
                                        >
                                            Save As Draft
                                        </Button>
                                    )}
                                    {statusP !== 'Approve' && (
                                        <Button
                                            variant="outlined"
                                            size="medium"
                                            type="reset"
                                            style={{
                                                cursor: 'pointer',
                                                marginLeft: 10,
                                                padding: '2px 20px',
                                                borderRadius: 6,
                                                color: '#00316a',
                                                borderColor: '#00316a',
                                            }}
                                            onClick={() => resetForm()}
                                        >
                                            Reset
                                        </Button>
                                    )}
                                    {statusP !== 'Approve' && (
                                        <Button
                                            variant="outlined"
                                            type="submit"
                                            size="medium"
                                            onClick={() => {
                                                setIsSaveAsDraft(false);
                                            }}
                                            style={{
                                                cursor: 'pointer',
                                                marginLeft: 10,
                                                padding: '2px 20px',
                                                borderRadius: 6,
                                                color: '#fff',
                                                borderColor: '#00316a',
                                                backgroundColor: '#00316a',
                                            }}
                                        >
                                            Submit
                                        </Button>
                                    )}
                                    {params?.propertyId && (
                                        <Button
                                            variant="outlined"
                                            type="button"
                                            onClick={() => onPrint()}
                                            size="medium"
                                            style={{
                                                cursor: 'pointer',
                                                marginLeft: 10,
                                                padding: '2px 20px',
                                                borderRadius: 6,
                                                color: '#fff',
                                                borderColor: '#00316a',
                                                backgroundColor: '#00316a',
                                            }}
                                        >
                                            Print
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

export default PropertyProfile;
