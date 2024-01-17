import Mandate from 'pages/Mandate';
import UpdateMandate from 'pages/myTask/Components/UpdateMandate';
import ViewMandate from 'pages/myTask/Components/ViewMandate';
import MyTask from 'pages/myTask';
import Phase from 'pages/phase';
import AddMandate from 'pages/myTask/Components/AddMandate';
import AddPhase from 'pages/phase/AddPhase';
import UpdatePhase from 'pages/phase/UpdatePhase';
import PropertyPool from 'pages/propertyPool';
import ReAssignUsersComponent from 'pages/ReAssignUsersToTaskAndMandate/index';
import Reports from 'pages/Mandate/DocumentUploadMandate/Components/Reports';
import StongRoom from 'pages/Mandate/DocumentUploadMandate/Components/StongRoom';
import LeaseDeed from 'pages/Mandate/DocumentUploadMandate/Components/LeaseDeed';
import LeaseDeedSignCopy from 'pages/Mandate/DocumentUploadMandate/Components/LeaseDeedSignCopy';
import GenerateLOA from 'pages/Mandate/DocumentUploadMandate/Components/GenerateLOA';
import GenerateLOI from 'pages/Mandate/DocumentUploadMandate/Components/GenerateLOI';
import GenerateTSR from 'pages/Mandate/DocumentUploadMandate/Components/GenerateLSR';
import AdditionalDocumentUpload from 'pages/Mandate/DocumentUploadMandate/Components/AdditionalDocuments';
import BranchHandOver from 'pages/Mandate/Branch Handover';
import MandateMyTask from 'pages/myTask/Components/MandateTabs';
import PhaseApprovalNoteEntryMyTask from 'pages/myTask/Components/PhaseApprovalNote/index';
import PropertyProfileEntryMyTask from 'pages/myTask/Components/PropertyFileEntry';
import PropertyDocumentEntryTask from 'pages/myTask/Components/ProperyDocumentEntry';
import Home from 'pages/home';
import HoldPhase from 'pages/phase/HoldPhase';
import ExtendPhase from 'pages/phase/ExtendPhase';
import CancelPhase from 'pages/phase/CancelPhase';
import CancelMandate from 'pages/Mandate/CancelMandate';
import HoldMandate from 'pages/Mandate/HoldMandate';
import ComingSoon from 'pages/errorPages/ComingSoon';
import InitiateLOI from 'pages/home/InitiateLOI';
import PropertyView from 'pages/propertyPool/propertyView';
import PropertyProfile from 'pages/propertyPool/propertyProfile';
import PropertyComparison from 'pages/propertyPool/propertyComparison';
import PreConstruction from 'pages/Mandate/PreConstruction';
import RBIIntimation from 'pages/Mandate/DocumentUploadMandate/Components/RBIIntimation';
import VendorAllocation from 'pages/vendorallocation/vendorAllocation';
import ActivateVendor from 'pages/ActivateVendor';
import Po from 'pages/Po';
import ItAsset from 'pages/ItAsset';
import UpsAvailibility from 'pages/UpsAvailivility';
import NetworkFeasibility from 'pages/networkFeasibility';
import Layout from 'pages/Mandate/Layout/layout';
import BOQ from 'pages/Mandate/BOQ';
import PropertyInDrafts from 'pages/propertyPool/PropertyInDraftsList';
import ProjectManagement from 'pages/Mandate/PropertyManagment';
import LocationNote from 'pages/Mandate/Location';
import Staff from 'pages/Mandate/Staff';
import ElectricityDetails from 'pages/Mandate/ElectricityDetails/ElectricityDetails';
import MeetingNotes from 'pages/Mandate/MeetingNotes/MeetingNotes';
import CertificatesTabs from 'pages/Mandate/Certificates/CertificatesTabs';
import Possession from 'pages/Mandate/Possession/Possession';
import Invoicening from 'pages/Mandate/Invoicening';
import PenaltyCalculation from 'pages/Mandate/Penalty/index';
import QualityPo from 'pages/Mandate/PO';
import QualityAudit from 'pages/Mandate/Quality';
import QualityVerification from 'pages/Mandate/Quality/QualityVerification';
import QualityAuditReport from 'pages/Mandate/Quality/Components/QualityAuditReport';
import QualityAuditDerivedReport from 'pages/Mandate/Quality/Components/QualityAuditDerivedReport';
import NDC from 'pages/Mandate/NDC';
import UtrDetails from 'pages/Mandate/PreConstruction/Components/UtrDetails';
import SelectTask from 'pages/bulkAssignPm/mytaskselect';
import BulkAssignSourcingAssociate from 'pages/BulkAssignSourcingAssociate';
import MandateBulkUpload from 'pages/phase/MandateBulkUpload';
import MandateDocumentList from 'pages/Mandate/DocumentList(BY Mandate)';
import MasterBulkUpload from 'pages/phase/MasterBulkUpload';
import IntimationRequestList from 'pages/IntimationRequestList';
import CreateRequest from 'pages/IntimationRequestList/createRequest';
import MyRequestList from 'pages/IntimationRequestList/MyRequestList';
import BulkSelection from 'pages/BulkSelection';
import UserManagment from 'pages/UserManagment';
import AddUser from '../UserManagment/AddUser';
import Rolemanagement from 'pages/RoleManagement/rolemanagement';
import MyGridComponent from 'pages/phase/MyGridComponent';
import ApprovalBudgetMatrix from 'pages/ApprovalBudgetMatrix';
import LandlordDetails from 'pages/Mandate/Landlord Details';
import PhaseApprovalMatrix from 'pages/PhaseApprovalMatrix/phaseApprovalMatrix';
import LocationApprovalMatrix from 'pages/LocationApprovalMatrix/LocationApprovalMatrix';
import ExecuteQuery from 'pages/ExecuteQuery';
import VendorMaster from 'pages/VendorMaster/VendorMaster';
import VerticalCategoryBranch from 'pages/Vertical-Category-BranchType/VerticalCategoryBranch';
import EditVendor from 'pages/VendorMaster/EditVendor';
import Master from 'pages/CommonMaster/CommonMaster';
import CommonList from 'pages/CommonMaster/CommonList';
import BranchMasterList from 'pages/BranchMaster/BranchMasterList';
// import BranchMaster from 'pages/BranchMaster/BranchMaster';
import UploadBranchMaster from 'pages/BranchMaster/UploadBranchMaster';
import TermAndConditionsMaster from 'pages/TermAndConditionsMaster/TermAndConditionsMaster';
import ComplianceCommonMaster from 'pages/CommonMaster/ComplienceCommonMaster';
import QualityAuditorMatrix from 'pages/QualityAuditorMatrix/QualityAuditorMatrix';
import AdminBussinessMaster from 'pages/AdminBussinessMaster';
import AdminVerticalMaster from 'pages/AdminVerticalMaster/AdminVerticalMaster';
import TierMaster from 'pages/CommonMaster/TierMaster';
import BusinessTypeMaster from 'pages/CommonMaster/BusinessTypeMaster';
import StateMaster from 'pages/Geo Locations/StateMaster';
import DistrictMaster from 'pages/Geo Locations/DistrictMaster';
import CityMaster from 'pages/Geo Locations/CityMaster';
import AdminVerticalList from 'pages/CommonMaster/AdminVerticalList';
import SnagListMaster from 'pages/SnagListMaster/SnagListMaster';
import ComplianceDashboard from 'pages/IntimationRequestList/ComplianceDashboard';
import BranchManagement from 'pages/home/BranchManagement';
import BranchOnbording from 'pages/home/BranchOnbording';
import MailBox from 'pages/MailBox/MailBox';
import AdminReport from 'pages/AdminReport';
import AdminCMView from 'pages/auth/AssetManagement/AdminCMView';
import AssetRequest from 'pages/auth/AssetManagement/AssetRequest';
import AssetRequestList from 'pages/auth/AssetManagement/AssetRequestList';
import AssetRequestReview from 'pages/auth/AssetManagement/AssetRequestReview';
import AssetManagement from 'pages/home/AssetManagement';
import AssetGatePass from 'pages/auth/AssetManagement/AssetGatePass';
import QuoteInput from 'pages/auth/AssetManagement/QuoteInput';
import AssetQuoteInputReview from 'pages/auth/AssetManagement/AssetQuoteInputReview';
import AssetGatePassList from 'pages/auth/AssetManagement/AssetGatePassList';
import CardsMasterTest from 'pages/CommonMaster/cardsMasterTest';
import AssetGateInwardList from 'pages/auth/AssetManagement/AssetGateInwardList';
import ReturnableGatePass from 'pages/auth/AssetManagement/ReturnableGatePass';
import ReturnableGatePassList from 'pages/auth/AssetManagement/ReturnableGatePassList';
import AssetInward from 'pages/auth/AssetManagement/AssetInward';
import AssetQuoteInputList from 'pages/auth/AssetManagement/AssetQuoteInputList';
import ReportManagement from 'pages/home/ReportManagment';
import MandateReportDetail from 'pages/Reports/MandateReportDetail';
import NewCapitalizedAssetDetails from 'pages/auth/AssetManagement/NewCapitalizedAssetDetails';
import CapitalizedPage from 'pages/auth/AssetManagement/CapitalizedPage';
import AssetTaggingReportDetail from 'pages/Reports/AssetTaggingReportDetail';
import AssetBulkUpload from 'pages/auth/AssetManagement/AssetBulkUpload';
import BranchMasterDetails from 'pages/BranchMaster/BranchMasterDetails';
import AssetTaggingValidation from 'pages/auth/AssetManagement/AssetTaggingValidation';
import AssetInsurance from 'pages/auth/AssetManagement/AssetInsurance';
import AssetQuotation from 'pages/auth/AssetManagement/AssetQuotation';
import BranchMasterManagment from 'pages/home/BranchMasterManagment';
// import BranchMasterM from 'pages/BranchMaster/BranchMasterM';
import BranchMasterReportDetails from 'pages/BranchMaster/BranchMasterReportDetails';
import PropertyReportDetail from 'pages/Reports/PropertyReportDetail';
import AssetInwardView from 'pages/auth/AssetManagement/AssetInwardView';
import BranchAdminReview from 'pages/auth/AssetManagement/BranchAdminReview';
// import BranchMastList from 'pages/auth/AssetManagement/BranchMastList';
import PRRequest from 'pages/auth/AssetManagement/PRRequest';
import VendorUTRDetails from 'pages/auth/AssetManagement/VendorUTRDetails';
import AssetAutoUpload from 'pages/auth/AssetManagement/AssetAutoUpload';
import BranchBulkUpload from 'pages/auth/AssetManagement/BranchModal/BranchBulkUpload';
import AssetMyTask from 'pages/auth/AssetManagement/AssetMyTask';
import BranchMasterMyTask from 'pages/auth/BranchMasterMyTask';
import UserAccessReport from 'pages/Reports/UserAccessReport';

// import React from 'react';

// const Mandate = React.lazy(() => import('pages/Mandate'));
// const UpdateMandate = React.lazy(() => import('pages/myTask/Components/UpdateMandate'));
// const ViewMandate = React.lazy(() => import('pages/myTask/Components/ViewMandate'));
// const MyTask = React.lazy(() => import('pages/myTask'));
// const Phase = React.lazy(() => import('pages/phase'));
// const AddMandate = React.lazy(() => import('pages/myTask/Components/AddMandate'));
// const AddPhase = React.lazy(() => import('pages/phase/AddPhase'));
// const UpdatePhase = React.lazy(() => import('pages/phase/UpdatePhase'));
// const PropertyPool = React.lazy(() => import('pages/propertyPool'));
// const ReAssignUsersComponent = React.lazy(() => import('pages/ReAssignUsersToTaskAndMandate/index'));
// const Reports = React.lazy(() => import('pages/Mandate/DocumentUploadMandate/Components/Reports'));
// const StongRoom = React.lazy(() => import('pages/Mandate/DocumentUploadMandate/Components/StongRoom'));
// const LeaseDeed = React.lazy(() => import('pages/Mandate/DocumentUploadMandate/Components/LeaseDeed'));
// const LeaseDeedSignCopy = React.lazy(() => import('pages/Mandate/DocumentUploadMandate/Components/LeaseDeedSignCopy'));
// const GenerateLOA = React.lazy(() => import('pages/Mandate/DocumentUploadMandate/Components/GenerateLOA'));
// const GenerateLOI = React.lazy(() => import('pages/Mandate/DocumentUploadMandate/Components/GenerateLOI'));
// const GenerateTSR = React.lazy(() => import('pages/Mandate/DocumentUploadMandate/Components/GenerateLSR'));
// const AdditionalDocumentUpload = React.lazy(() => import('pages/Mandate/DocumentUploadMandate/Components/AdditionalDocuments'));
// const BranchHandOver = React.lazy(() => import('pages/Mandate/Branch Handover'));
// const MandateMyTask = React.lazy(() => import('pages/myTask/Components/MandateTabs'));
// const PhaseApprovalNoteEntryMyTask = React.lazy(() => import('pages/myTask/Components/PhaseApprovalNote/index'));
// const PropertyProfileEntryMyTask = React.lazy(() => import('pages/myTask/Components/PropertyFileEntry'));
// const PropertyDocumentEntryTask = React.lazy(() => import('pages/myTask/Components/ProperyDocumentEntry'));
// const Home = React.lazy(() => import('pages/home'));
// const HoldPhase = React.lazy(() => import('pages/phase/HoldPhase'));
// const ExtendPhase = React.lazy(() => import('pages/phase/ExtendPhase'));
// const CancelPhase = React.lazy(() => import('pages/phase/CancelPhase'));
// const CancelMandate = React.lazy(() => import('pages/Mandate/CancelMandate'));
// const HoldMandate = React.lazy(() => import('pages/Mandate/HoldMandate'));
// const ComingSoon = React.lazy(() => import('pages/errorPages/ComingSoon'));
// const InitiateLOI = React.lazy(() => import('pages/home/InitiateLOI'));
// const PropertyView = React.lazy(() => import('pages/propertyPool/propertyView'));
// const PropertyProfile = React.lazy(() => import('pages/propertyPool/propertyProfile'));
// const PropertyComparison = React.lazy(() => import('pages/propertyPool/propertyComparison'));
// const PreConstruction = React.lazy(() => import('pages/Mandate/PreConstruction'));
// const RBIIntimation = React.lazy(() => import('pages/Mandate/DocumentUploadMandate/Components/RBIIntimation'));
// const VendorAllocation = React.lazy(() => import('pages/vendorallocation/vendorAllocation'));
// const ActivateVendor = React.lazy(() => import('pages/ActivateVendor'));
// const Po = React.lazy(() => import('pages/Po'));
// const ItAsset = React.lazy(() => import('pages/ItAsset'));
// const UpsAvailibility = React.lazy(() => import('pages/UpsAvailivility'));
// const NetworkFeasibility = React.lazy(() => import('pages/networkFeasibility'));
// const Layout = React.lazy(() => import('pages/Mandate/Layout/layout'));
// const BOQ = React.lazy(() => import('pages/Mandate/BOQ'));
// const PropertyInDrafts = React.lazy(() => import('pages/propertyPool/PropertyInDraftsList'));
// const ProjectManagement = React.lazy(() => import('pages/Mandate/PropertyManagment'));
// const LocationNote = React.lazy(() => import('pages/Mandate/Location'));
// const Staff = React.lazy(() => import('pages/Mandate/Staff'));
// const ElectricityDetails = React.lazy(() => import('pages/Mandate/ElectricityDetails/ElectricityDetails'));
// const MeetingNotes = React.lazy(() => import('pages/Mandate/MeetingNotes/MeetingNotes'));
// const CertificatesTabs = React.lazy(() => import('pages/Mandate/Certificates/CertificatesTabs'));
// const Possession = React.lazy(() => import('pages/Mandate/Possession/Possession'));
// const Invoicening = React.lazy(() => import('pages/Mandate/Invoicening'));
// const PenaltyCalculation = React.lazy(() => import('pages/Mandate/Penalty/index'));
// const QualityPo = React.lazy(() => import('pages/Mandate/PO'));
// const QualityAudit = React.lazy(() => import('pages/Mandate/Quality'));
// const QualityVerification = React.lazy(() => import('pages/Mandate/Quality/QualityVerification'));
// const QualityAuditReport = React.lazy(() => import('pages/Mandate/Quality/Components/QualityAuditReport'));
// const QualityAuditDerivedReport = React.lazy(() => import('pages/Mandate/Quality/Components/QualityAuditDerivedReport'));
// const NDC = React.lazy(() => import('pages/Mandate/NDC'));
// const UtrDetails = React.lazy(() => import('pages/Mandate/PreConstruction/Components/UtrDetails'));
// const SelectTask = React.lazy(() => import('pages/bulkAssignPm/mytaskselect'));
// const BulkAssignSourcingAssociate = React.lazy(() => import('pages/BulkAssignSourcingAssociate'));
// const MandateBulkUpload = React.lazy(() => import('pages/phase/MandateBulkUpload'));
// const MandateDocumentList = React.lazy(() => import('pages/Mandate/DocumentList(BY Mandate)'));
// const MasterBulkUpload = React.lazy(() => import('pages/phase/MasterBulkUpload'));
// const IntimationRequestList = React.lazy(() => import('pages/IntimationRequestList'));
// const CreateRequest = React.lazy(() => import('pages/IntimationRequestList/createRequest'));
// const MyRequestList = React.lazy(() => import('pages/IntimationRequestList/MyRequestList'));
// const BulkSelection = React.lazy(() => import('pages/BulkSelection'));
// const UserManagment = React.lazy(() => import('pages/UserManagment'));
// const AddUser = React.lazy(() => import('../UserManagment/AddUser'));
// const Rolemanagement = React.lazy(() => import('pages/RoleManagement/rolemanagement'));
// const MyGridComponent = React.lazy(() => import('pages/phase/MyGridComponent'));
// const ApprovalBudgetMatrix = React.lazy(() => import('pages/ApprovalBudgetMatrix'));
// const LandlordDetails = React.lazy(() => import('pages/Mandate/Landlord Details'));
// const PhaseApprovalMatrix = React.lazy(() => import('pages/PhaseApprovalMatrix/phaseApprovalMatrix'));
// const LocationApprovalMatrix = React.lazy(() => import('pages/LocationApprovalMatrix/LocationApprovalMatrix'));
// const ExecuteQuery = React.lazy(() => import('pages/ExecuteQuery'));
// const VendorMaster = React.lazy(() => import('pages/VendorMaster/VendorMaster'));
// const VerticalCategoryBranch = React.lazy(() => import('pages/Vertical-Category-BranchType/VerticalCategoryBranch'));
// const EditVendor = React.lazy(() => import('pages/VendorMaster/EditVendor'));
// const Master = React.lazy(() => import('pages/CommonMaster/CommonMaster'));
// const CommonList = React.lazy(() => import('pages/CommonMaster/CommonList'));
// const BranchMasterList = React.lazy(() => import('pages/BranchMaster/BranchMasterList'));
// const BranchMasterDetails = React.lazy(() => import('pages/BranchMaster/BranchMasterDetails'));
// const UploadBranchMaster = React.lazy(() => import('pages/BranchMaster/UploadBranchMaster'));
// const TermAndConditionsMaster = React.lazy(() => import('pages/TermAndConditionsMaster/TermAndConditionsMaster'));
// const ComplianceCommonMaster = React.lazy(() => import('pages/CommonMaster/ComplienceCommonMaster'));
// const QualityAuditorMatrix = React.lazy(() => import('pages/QualityAuditorMatrix/QualityAuditorMatrix'));
// const AdminBussinessMaster = React.lazy(() => import('pages/AdminBussinessMaster'));
// const AdminVerticalMaster = React.lazy(() => import('pages/AdminVerticalMaster/AdminVerticalMaster'));
// const TierMaster = React.lazy(() => import('pages/CommonMaster/TierMaster'));
// const BusinessTypeMaster = React.lazy(() => import('pages/CommonMaster/BusinessTypeMaster'));
// const StateMaster = React.lazy(() => import('pages/Geo Locations/StateMaster'));
// const DistrictMaster = React.lazy(() => import('pages/Geo Locations/DistrictMaster'));
// const CityMaster = React.lazy(() => import('pages/Geo Locations/CityMaster'));
// const AdminVerticalList = React.lazy(() => import('pages/CommonMaster/AdminVerticalList'));
// const SnagListMaster = React.lazy(() => import('pages/SnagListMaster/SnagListMaster'));
// const ComplianceDashboard = React.lazy(() => import('pages/IntimationRequestList/ComplianceDashboard'));
// const BranchManagement = React.lazy(() => import('pages/home/BranchManagement'));
// const BranchOnbording = React.lazy(() => import('pages/home/BranchOnbording'));
// const MailBox = React.lazy(() => import('pages/MailBox/MailBox'));
// const AdminReport = React.lazy(() => import('pages/AdminReport'));
// const AdminCMView = React.lazy(() => import('pages/auth/AssetManagement/AdminCMView'));
// const AssetRequest = React.lazy(() => import('pages/auth/AssetManagement/AssetRequest'));
// const AssetRequestList = React.lazy(() => import('pages/auth/AssetManagement/AssetRequestList'));
// const AssetRequestReview = React.lazy(() => import('pages/auth/AssetManagement/AssetRequestReview'));
// const AssetManagement = React.lazy(() => import('pages/home/AssetManagement'));
// const AssetGatePass = React.lazy(() => import('pages/auth/AssetManagement/AssetGatePass'));
// const QuoteInput = React.lazy(() => import('pages/auth/AssetManagement/QuoteInput'));
// const AssetQuoteInputReview = React.lazy(() => import('pages/auth/AssetManagement/AssetQuoteInputReview'));
// const AssetGatePassList = React.lazy(() => import('pages/auth/AssetManagement/AssetGatePassList'));
// const CardsMasterTest = React.lazy(() => import('pages/CommonMaster/cardsMasterTest'));
// const AssetGateInwardList = React.lazy(() => import('pages/auth/AssetManagement/AssetGateInwardList'));
// const ReturnableGatePass = React.lazy(() => import('pages/auth/AssetManagement/ReturnableGatePass'));
// const ReturnableGatePassList = React.lazy(() => import('pages/auth/AssetManagement/ReturnableGatePassList'));
// const AssetInward = React.lazy(() => import('pages/auth/AssetManagement/AssetInward'));
// const AssetQuoteInputList = React.lazy(() => import('pages/auth/AssetManagement/AssetQuoteInputList'));
// const ReportManagement = React.lazy(() => import('pages/home/ReportManagment'));
// const MandateReportDetail = React.lazy(() => import('pages/Reports/MandateReportDetail'));
// const NewCapitalizedAssetDetails = React.lazy(() => import('pages/auth/AssetManagement/NewCapitalizedAssetDetails'));
// const CapitalizedPage = React.lazy(() => import('pages/auth/AssetManagement/CapitalizedPage'));
// const AssetTaggingReportDetail = React.lazy(() => import('pages/Reports/AssetTaggingReportDetail'));
// const AssetBulkUpload = React.lazy(() => import('pages/auth/AssetManagement/AssetBulkUpload'));
// // const BranchMasterDetails = React.lazy(() => import('pages/auth/AssetManagement/BranchMasterDetails'));
// const AssetTaggingValidation = React.lazy(() => import('pages/auth/AssetManagement/AssetTaggingValidation'));
// const AssetInsurance = React.lazy(() => import('pages/auth/AssetManagement/AssetInsurance'));
// const AssetQuotation = React.lazy(() => import('pages/auth/AssetManagement/AssetQuotation'));
// const BranchMasterManagment = React.lazy(() => import('pages/home/BranchMasterManagment'));
// // const BranchMasterM = React.lazy(() => import('pages/BranchMaster/BranchMasterM'));
// const BranchMasterReportDetails = React.lazy(() => import('pages/BranchMaster/BranchMasterReportDetails'));
// const AssetInwardView = React.lazy(() => import('pages/auth/AssetManagement/AssetInwardView'));
// const BranchAdminReview = React.lazy(() => import('pages/auth/AssetManagement/BranchAdminReview'));
// // const BranchMastList = React.lazy(() => import('pages/auth/AssetManagement/BranchMastList'));
// const PRRequest = React.lazy(() => import('pages/auth/AssetManagement/PRRequest'));
// const VendorUTRDetails = React.lazy(() => import('pages/auth/AssetManagement/VendorUTRDetails'));
// const AssetAutoUpload = React.lazy(() => import('pages/auth/AssetManagement/AssetAutoUpload'));
// const BranchBulkUpload = React.lazy(() => import('pages/auth/AssetManagement/BranchModal/BranchBulkUpload'));
// const AssetMyTask = React.lazy(() => import('pages/auth/AssetManagement/AssetMyTask'));
// const BranchMasterMyTask = React.lazy(() => import('pages/auth/BranchMasterMyTask'));

export const routeConfigs = [
    {
        path: '/home',
        element: <Home />,
    },
    {
        path: '/home/Branch_Management',
        element: <BranchManagement />,
    },
    {
        path: '/home/Branch_Onbording',
        element: <BranchOnbording />,
    },
    {
        path: '/home/Asset_Management',
        element: <AssetManagement />,
    },
    {
        path: '/home/Branch_Master',
        element: <BranchMasterManagment />,
    },
    {
        path: '/home/Reports',
        element: <ReportManagement />,
    },
    {
        path: '/Admin-report',
        element: <AdminReport />,
    },
    {
        path: '/:id/returnable',
        element: <ReturnableGatePass />,
    },
    {
        path: '/returnablegatepass',
        element: <ReturnableGatePassList />,
    },
    {
        path: '/list/task',
        element: <MyTask />,
    },
    {
        path: '/mandate/:id/bulk-assign-pm',
        element: <SelectTask />,
    },
    {
        path: '/mandate/:id/bulk-update-branch-code',
        element: <BulkSelection />,
    },
    {
        path: '/mandate/:id/bulk-assign-sourcing-associate',
        element: <BulkAssignSourcingAssociate />,
    },
    {
        path: '/mandate/:id/mandate-documents',
        element: <MandateDocumentList />,
    },
    {
        path: '/mandate-report-detail',
        element: <MandateReportDetail />,
    },
    {
        path: '/user-access-report',
        element: <UserAccessReport />,
    },
    {
        path: '/list/phase',
        element: <Phase />,
    },
    {
        path: '/phase/add',
        element: <AddPhase />,
    },
    {
        path: 'phase/:id/update',
        element: <UpdatePhase />,
    },
    {
        path: 'phase/:id/mandate-bulk-upload',
        element: <MandateBulkUpload />,
    },
    {
        path: 'phase/:id/master-bulk-upload',
        element: <MasterBulkUpload />,
    },

    {
        path: '/mandate',
        element: <Mandate />,
    },
    {
        path: '/intimation-request-list',
        element: <IntimationRequestList />,
    },
    {
        path: '/intimation/:id/create-request',
        element: <CreateRequest />,
    },
    {
        path: '/intimation-my-request-list',
        element: <MyRequestList />,
    },
    {
        path: 'compliance-dashboard',
        element: <ComplianceDashboard />,
    },
    {
        path: '/mandate/:phaseid/:mandateId/view',
        element: <ViewMandate />,
    },
    {
        path: '/mandate/:phaseid/:mandateId/add',
        element: <AddMandate />,
    },
    {
        path: '/mandate/:id/electricityDetails',
        element: <ElectricityDetails />,
    },

    {
        path: '/mandate/:id/update',
        element: <UpdateMandate />,
    },

    {
        path: '/mandate/:id/Property',
        element: <PropertyPool />,
    },
    {
        path: '/mandate/:id/mandate-action',
        element: <MandateMyTask />,
    },
    {
        path: '/mandate/:id/phase-approval-note',
        element: <PhaseApprovalNoteEntryMyTask />,
    },
    {
        path: '/mandate/:id/phase-approval-note-view',
        element: <PhaseApprovalNoteEntryMyTask />,
    },

    {
        path: '/mandate/:id/final-property',
        element: <PropertyProfileEntryMyTask />,
    },
    {
        path: '/mandate/:id/landlord-details',
        element: <LandlordDetails />,
    },
    {
        path: '/mandate/:id/property-documents',
        element: <PropertyDocumentEntryTask />,
    },

    {
        path: '/phase/:id/hold',
        element: <HoldPhase />,
    },
    {
        path: '/phase/:id/extend',
        element: <ExtendPhase />,
    },
    {
        path: '/phase/:id/cancel',
        element: <CancelPhase />,
    },
    {
        path: '/mandate/:phaseid/:id/cancel',
        element: <CancelMandate />,
    },
    {
        path: '/mandate/:phaseid/:id/hold',
        element: <HoldMandate />,
    },
    {
        path: '/branch-profile',
        element: <ComingSoon />,
    },
    {
        path: '/mandate/:id/initiate-LOI',
        element: <InitiateLOI />,
    },
    {
        path: '/mandate/:id/generate-loa',
        element: <GenerateLOA />,
    },
    {
        path: '/mandate/:id/generate-loi',
        element: <GenerateLOI />,
    },
    {
        path: '/mandate/:id/generate-tsr',
        element: <GenerateTSR />,
    },
    {
        path: '/mandate/:id/rbi-intimation',
        element: <RBIIntimation />,
    },
    {
        path: '/mandate/:id/additional-documents',
        element: <AdditionalDocumentUpload />,
    },
    {
        path: '/branch-profile',
        element: <ComingSoon />,
    },
    {
        path: '/mandate/:id/vendor-allocation',
        element: <VendorAllocation />,
    },
    {
        path: '/mandate/:id/activate-vendor',
        element: <ActivateVendor />,
    },
    {
        path: '/mandate/:id/it-asset-status',
        element: <ItAsset />,
    },
    {
        path: '/mandate/:id/ups-availibility-status',
        element: <UpsAvailibility />,
    },
    {
        path: '/mandate/:id/po',
        element: <Po />,
    },

    {
        path: '/mandate/:id/vendor-assignment',
        element: <ComingSoon />,
    },
    {
        path: '/mandate/:id/project-management',
        element: <ProjectManagement />,
    },
    {
        path: '/mandate/:id/location-note',
        element: <LocationNote />,
    },
    {
        path: '/mandate/:id/structure-stability-report',
        element: <Reports />,
    },
    {
        path: '/mandate/:id/stong-room-feasibility-report',
        element: <StongRoom />,
    },
    {
        path: '/mandate/:id/lease-deed',
        element: <LeaseDeed />,
    },
    {
        path: '/mandate/:id/lease-deed-sign-copy',
        element: <LeaseDeedSignCopy />,
    },
    {
        path: '/mandate/:id/layout',
        element: <Layout />,
    },
    {
        path: '/mandate/:id/asset',
        element: <ComingSoon />,
    },

    {
        path: '/mandate/:id/staff',
        element: <Staff />,
    },
    {
        path: '/mandate/:id/meeting-notes',
        element: <MeetingNotes />,
    },

    {
        path: '/mandate/:id/branch-handover',
        element: <BranchHandOver />,
    },
    {
        path: '/mandate/:id/invoicing',
        element: <Invoicening />,
    },
    {
        path: '/mandate/:id/penalty-calculation',
        element: <PenaltyCalculation />,
    },
    {
        path: '/mandate/:id/ndc',
        element: <NDC />,
    },
    {
        path: '/mandate/:id/quality-po',
        element: <QualityPo />,
    },

    {
        path: '/mandate/:id/quality-audit',
        element: <QualityAudit />,
    },
    {
        path: '/mandate/:id/boq-verification',
        element: <QualityVerification />,
    },
    {
        path: '/mandate/:id/quality-audit-report',
        element: <QualityAuditReport tab={'3'} />,
    },
    {
        path: '/mandate/:id/quality-audit-derived-report',
        element: <QualityAuditDerivedReport />,
    },
    {
        path: '/mandate/:id/network-details',
        element: <ComingSoon />,
    },
    {
        path: '/mandate/:id/certificates',
        element: <CertificatesTabs />,
    },
    {
        path: '/mandate/:id/certificatesAndAdditionalDocuments',
        element: <CertificatesTabs />,
    },
    {
        path: '/mandate/:id/possession',
        element: <Possession />,
    },
    {
        path: '/mandate/:id/payment-detail',
        element: <ComingSoon />,
    },
    {
        path: '/mandate/:id/branch-handover',
        element: <BranchHandOver />,
    },
    {
        path: '/mandate/:id/invoicing',
        element: <Invoicening />,
    },
    {
        path: '/mandate/:id/penalty-calculation',
        element: <PenaltyCalculation />,
    },
    {
        path: '/mandate/:id/ndc',
        element: <NDC />,
    },
    {
        path: '/mandate/:id/quality-po',
        element: <QualityPo />,
    },

    {
        path: '/mandate/:id/quality-audit',
        element: <QualityAudit />,
    },
    {
        path: '/mandate/:id/boq-verification',
        element: <QualityVerification />,
    },
    {
        path: '/mandate/:id/quality-audit-report',
        element: <QualityAuditReport tab={'3'} />,
    },
    {
        path: '/mandate/:id/quality-audit-derived-report',
        element: <QualityAuditDerivedReport />,
    },
    {
        path: '/mandate/:id/network-details',
        element: <ComingSoon />,
    },
    {
        path: '/mandate/:id/certificates',
        element: <CertificatesTabs />,
    },
    {
        path: '/mandate/:id/certificatesAndAdditionalDocuments',
        element: <CertificatesTabs />,
    },
    {
        path: '/mandate/:id/possession',
        element: <Possession />,
    },
    {
        path: '/mandate/:id/payment-detail',
        element: <ComingSoon />,
    },

    {
        path: '/mandate/:id/property-tagging',
        element: <PropertyView pageType="" />,
    },
    {
        path: '/property-pool/:id/add',
        element: <PropertyProfile />,
    },
    {
        path: '/property-pool/:id/view',
        element: <PropertyView pageType="propertyAdd" />,
    },
    {
        path: '/mandate/:id/property-comparision',
        element: <PropertyComparison />,
    },
    {
        path: '/mandate/:id/rtgs',
        element: <PreConstruction />,
    },
    {
        path: '/mandate/:id/utr-details',
        element: <UtrDetails />,
    },
    {
        path: '/mandate/:id/network-feasibility',
        element: <NetworkFeasibility tabs="1" />,
    },
    {
        path: '/mandate/:id/delivery-details',
        element: <NetworkFeasibility tabs="2" />,
    },
    {
        path: '/mandate/:id/boq',
        element: <BOQ />,
    },
    {
        path: '/property-in-drafts',
        element: <PropertyInDrafts />,
    },
    {
        path: '/reassign-users',
        element: <ReAssignUsersComponent />,
    },
    {
        path: '/user-managment',
        element: <UserManagment />,
    },
    {
        path: '/user/add-user',
        element: <AddUser type="add" />,
    },
    {
        path: '/user/:id/upate-user',
        element: <AddUser type="edit" />,
    },
    {
        path: '/rolemanagement',
        element: <Rolemanagement />,
    },
    {
        path: '/defaultGrid',
        element: <MyGridComponent />,
    },
    {
        path: '/approvalBudgetMatrix',
        element: <ApprovalBudgetMatrix />,
    },
    {
        path: '/common-master',
        element: <Master />,
    },
    {
        path: '/compliance-common-master',
        element: <ComplianceCommonMaster />,
    },
    {
        path: '/common-list',
        element: <CommonList />,
    },
    {
        path: '/vendor-master',
        element: <VendorMaster />,
    },
    {
        path: '/vendormaster/:id/update-vendor',
        element: <EditVendor />,
    },
    {
        path: '/Ver-Cat-BranchType',
        element: <VerticalCategoryBranch />,
    },
    {
        path: '/phase-approval-matrix',
        element: <PhaseApprovalMatrix />,
    },
    {
        path: '/location-approval-matrix',
        element: <LocationApprovalMatrix />,
    },
    {
        path: '/quality-auditor-matrix',
        element: <QualityAuditorMatrix />,
    },
    {
        path: '/execute-query',
        element: <ExecuteQuery />,
    },
    {
        path: '/term-and-conditions-master',
        element: <TermAndConditionsMaster />,
    },

    {
        path: '/mandate/:id/property-tagging',
        element: <PropertyView pageType="" />,
    },
    {
        path: '/property-pool/:id/add',
        element: <PropertyProfile />,
    },
    {
        path: '/property-pool/:id/view',
        element: <PropertyView pageType="propertyAdd" />,
    },
    {
        path: '/mandate/:id/property-comparision',
        element: <PropertyComparison />,
    },
    {
        path: '/mandate/:id/rtgs',
        element: <PreConstruction />,
    },
    {
        path: '/mandate/:id/utr-details',
        element: <UtrDetails />,
    },
    {
        path: '/mandate/:id/network-feasibility',
        element: <NetworkFeasibility tabs="1" />,
    },
    {
        path: '/mandate/:id/delivery-details',
        element: <NetworkFeasibility tabs="2" />,
    },
    {
        path: '/mandate/:id/boq',
        element: <BOQ />,
    },
    {
        path: '/property-in-drafts',
        element: <PropertyInDrafts />,
    },
    {
        path: '/reassign-users',
        element: <ReAssignUsersComponent />,
    },
    {
        path: '/user-managment',
        element: <UserManagment />,
    },
    {
        path: '/user/add-user',
        element: <AddUser type="add" />,
    },
    {
        path: '/user/:id/upate-user',
        element: <AddUser type="edit" />,
    },
    {
        path: '/rolemanagement',
        element: <Rolemanagement />,
    },
    {
        path: '/defaultGrid',
        element: <MyGridComponent />,
    },
    {
        path: '/approvalBudgetMatrix',
        element: <ApprovalBudgetMatrix />,
    },
    {
        path: '/common-master',
        element: <Master />,
    },
    {
        path: '/compliance-common-master',
        element: <ComplianceCommonMaster />,
    },
    {
        path: '/common-list',
        element: <CommonList />,
    },
    {
        path: '/branchMasterList',
        element: <BranchMasterList />,
    },
    // {
    //     path: '/:id/BranchMasterDetails',
    //     element: <BranchMaster />,
    // },
    {
        path: '/branchmaster-upload',
        element: <UploadBranchMaster />,
    },
    // {
    //     path: '/branch-master',
    //     element: <BranchMasterM />,
    // },
    {
        path: '/vendor-master',
        element: <VendorMaster />,
    },
    {
        path: '/vendormaster/:id/update-vendor',
        element: <EditVendor />,
    },
    {
        path: '/Ver-Cat-BranchType',
        element: <VerticalCategoryBranch />,
    },
    {
        path: '/phase-approval-matrix',
        element: <PhaseApprovalMatrix />,
    },
    {
        path: '/location-approval-matrix',
        element: <LocationApprovalMatrix />,
    },
    {
        path: '/execute-query',
        element: <ExecuteQuery />,
    },
    {
        path: '/term-and-conditions-master',
        element: <TermAndConditionsMaster />,
    },
    {
        path: '/mandate/admin-bussiness-master',
        element: <AdminBussinessMaster />,
    },
    {
        path: '/admin-vertical-master',
        element: <AdminVerticalMaster />,
    },
    {
        path: '/tier-master',
        element: <TierMaster />,
    },
    {
        path: '/business-type-master',
        element: <BusinessTypeMaster />,
    },
    {
        path: '/state-master',
        element: <StateMaster />,
    },
    {
        path: '/district-master',
        element: <DistrictMaster />,
    },
    {
        path: '/City-master',
        element: <CityMaster />,
    },
    {
        path: '/snag-list-master',
        element: <SnagListMaster />,
    },
    {
        path: '/admin-vertical-list',
        element: <AdminVerticalList />,
    },
    {
        path: '/mail-box',
        element: <MailBox />,
    },
    {
        path: '/user-analytics',
        element: <CardsMasterTest />,
    },
    {
        path: '/assetValidation',
        element: <AssetTaggingValidation />,
    },
    {
        path: '/assetInsurance',
        element: <AssetInsurance />,
    },
    {
        path: '/CapitalizedAsset',
        element: <NewCapitalizedAssetDetails />,
    },
    {
        path: '/CapitalizedPage/:id',
        element: <CapitalizedPage />,
    },
    {
        path: '/assetQuotation',
        element: <AssetQuotation />,
    },
    {
        path: '/assetTaggingReport',
        element: <AssetTaggingReportDetail />,
    },
    {
        path: '/AssetInwardView',
        element: <AssetInwardView />,
    },
    {
        path: '/BranchAdminReview',
        element: <BranchAdminReview />,
    },
    // {
    //     path: '/BranchMasterDetails',
    //     element: <BranchMasterDetails />,
    // },
    {
        path: '/:id/BranchMasterDetails',
        element: <BranchMasterDetails />,
    },
    {
        path: '/BranchMasterDetails',
        element: <BranchMasterDetails />,
    },
    {
        path: '/branchMasterReportDetails',
        element: <BranchMasterReportDetails />,
    },
    // {
    //     path: '/BranchMasterList',
    //     element: <BranchMastList />,
    // },
    {
        path: '/propertyReportDetail',
        element: <PropertyReportDetail />,
    },
    {
        path: '/branchmastertask/task',
        element: <BranchMasterMyTask />,
    },
    {
        path: '/AdminCMView',
        element: <AdminCMView />,
    },
    {
        path: '/AssetRequest',
        element: <AssetRequest />,
    },
    {
        path: '/AssetRequest/:id/Update',
        element: <AssetRequest />,
    },
    {
        path: '/AssetQuoteInput',
        element: <QuoteInput />,
    },
    {
        path: '/:id/AssetQuoteInput',
        element: <QuoteInput />,
    },
    {
        path: '/AssetQuoteInputReview',
        element: <AssetQuoteInputReview />,
    },
    {
        path: '/:id/AssetQuoteInputReview',
        element: <AssetQuoteInputReview />,
    },
    {
        path: '/:id/AssetGatePass',
        element: <AssetGatePass />,
    },
    {
        path: '/:id/AssetInward',
        element: <AssetInward />,
    },
    {
        path: '/AssetGatePassList',
        element: <AssetGatePassList />,
    },
    {
        path: '/AssetGateInwardList',
        element: <AssetGateInwardList />,
    },
    {
        path: '/AssetQuoteInputList',
        element: <AssetQuoteInputList />,
    },

    {
        path: '/AssetRequestList',
        element: <AssetRequestList />,
    },
    {
        path: '/:id/AssetRequestReview',
        element: <AssetRequestReview />,
    },
    {
        path: '/AssetBulkUpload',
        element: <AssetBulkUpload />,
    },
    {
        path: '/AssetAutoUpload',
        element: <AssetAutoUpload />,
    },
    {
        path: '/PR_Request',
        element: <PRRequest />,
    },
    {
        path: '/VendorUTR_Details',
        element: <VendorUTRDetails />,
    },
    {
        path: '/BranchBulkUpload',
        element: <BranchBulkUpload />,
    },
    {
        path: '/Asset/task',
        element: <AssetMyTask />,
    },
];
