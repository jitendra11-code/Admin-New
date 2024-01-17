import { BiAlignLeft } from "react-icons/bi";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FilePresentIcon from "@mui/icons-material/FilePresent";
import { DriveFolderUpload } from "@mui/icons-material";
import { Person } from "@mui/icons-material";
import TaskIcon from "@mui/icons-material/Task";
import NightShelterIcon from "@mui/icons-material/NightShelter";
import AssignmentIcon from '@mui/icons-material/Assignment';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { AddBox } from "@mui/icons-material";
import { PanTool } from "@mui/icons-material";
import { ZoomInMap } from "@mui/icons-material";
import { Close } from "@mui/icons-material";
import { Visibility } from "@mui/icons-material";
import { Start } from "@mui/icons-material";
import { SystemUpdateAlt } from "@mui/icons-material";
import { Compare } from "@mui/icons-material";
import { Note } from "@mui/icons-material";
import { RestartAlt } from "@mui/icons-material";
import { Assignment } from "@mui/icons-material";
import { ReceiptLong } from "@mui/icons-material";
import { DocumentScanner } from "@mui/icons-material";
import { Approval } from "@mui/icons-material";
import { Report } from "@mui/icons-material";
import { People } from "@mui/icons-material";
import { Receipt } from "@mui/icons-material";
import { VerifiedUser } from "@mui/icons-material";
import { InsertDriveFile } from "@mui/icons-material";
import { Place } from "@mui/icons-material";
import { Apartment } from "@mui/icons-material";
import { Store } from "@mui/icons-material";
import { ViewComfy } from "@mui/icons-material";
import { SettingsSuggest } from "@mui/icons-material";
import { NetworkCheck } from "@mui/icons-material";
import { Handshake } from "@mui/icons-material";
import { WorkspacePremium } from "@mui/icons-material";
import { Person2 } from "@mui/icons-material";
import { ManageAccounts } from "@mui/icons-material";
import { CurrencyExchange } from "@mui/icons-material";
import { Hd } from "@mui/icons-material";
import { AddBusiness } from "@mui/icons-material";
import { List } from "@mui/icons-material";
import { LocationCity } from "@mui/icons-material";
import { AdminPanelSettings } from "@mui/icons-material";
import { PendingActions } from "@mui/icons-material";
import { Reorder } from "@mui/icons-material";
import { Mail } from "@mui/icons-material";
import { EventNote } from "@mui/icons-material"
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const MenuImageDirectory = [
    {
        iconName: "home",
        iconNode: <HomeOutlinedIcon />
    },
    {
        iconName: "Dashboard",
        iconNode: <DashboardIcon />
    },

    {
        iconName: "myTask",
        iconNode: <AssignmentIcon />
    },
    {
        iconName: "phase",
        iconNode: <FilePresentIcon />
    },
    {
        iconName: "upload",
        iconNode: <DriveFolderUpload />
    },
    {
        iconName: "person",
        iconNode: <Person />
    },
    {
        iconName: "mandate",
        iconNode: <TaskIcon />
    },
    {
        iconName: "property",
        iconNode: <NightShelterIcon />
    },
    //Admin submenu start
    {
        iconName: "addBox",
        iconNode: <AddBox />
    },
    {
        iconName: "panTool",
        iconNode: <PanTool />
    },
    {
        iconName: "zoomInMap",
        iconNode: <ZoomInMap />
    },
    {
        iconName: "close",
        iconNode: <Close />
    },
    {
        iconName: "visibility",
        iconNode: <Visibility />
    },
    {
        iconName: "start",
        iconNode: <Start />
    },
    {
        iconName: "systemUpdateAlt",
        iconNode: <SystemUpdateAlt />
    },
    {
        iconName: "compare",
        iconNode: <Compare />
    },
    {
        iconName: "note",
        iconNode: <Note />
    },
    {
        iconName: "restartAlt",
        iconNode: <RestartAlt />
    },
    {
        iconName: "assignment",
        iconNode: <Assignment />
    },
    {
        iconName: "receiptLong",
        iconNode: <ReceiptLong />
    },
    {
        iconName: "documentScanner",
        iconNode: <DocumentScanner />
    },
    {
        iconName: "approval",
        iconNode: <Approval />
    },
    {
        iconName: "report",
        iconNode: <Report />
    },
    {
        iconName: "people",
        iconNode: <People />
    },
    {
        iconName: "receipt",
        iconNode: <Receipt />
    },
    {
        iconName: "verifiedUser",
        iconNode: <VerifiedUser />
    },
    {
        iconName: "insertDriveFile",
        iconNode: <InsertDriveFile />
    },
    {
        iconName: "place",
        iconNode: <Place />
    },
    {
        iconName: "apartment",
        iconNode: <Apartment />
    },
    {
        iconName: "store",
        iconNode: <Store />
    },
    {
        iconName: "viewComfy",
        iconNode: <ViewComfy />
    },
    {
        iconName: "settingsSuggest",
        iconNode: <SettingsSuggest />
    },
    {
        iconName: "networkCheck",
        iconNode: <NetworkCheck />
    },
    {
        iconName: "handshake",
        iconNode: <Handshake />
    },
    {
        iconName: "person2",
        iconNode: <Person2 />
    },
    {
        iconName: "manageAccounts",
        iconNode: <ManageAccounts />
    },
    {
        iconName: "currencyExchange",
        iconNode: <CurrencyExchange />
    },
    {
        iconName: "hd",
        iconNode: <Hd />
    },
    {
        iconName: "addBusiness",
        iconNode: <AddBusiness />
    },
    {
        iconName: "list",
        iconNode: <List />
    },
    {
        iconName: "locationCity",
        iconNode: <LocationCity />
    },
    {
        iconName: "adminPanelSettings",
        iconNode: <AdminPanelSettings />
    },
    {
        iconName: "pendingActions",
        iconNode: <PendingActions />
    },
    {
        iconName: "reorder",
        iconNode: <Reorder />
    },
    {
        iconName: "workspacePremium",
        iconNode: <WorkspacePremium />
    },
    {
        iconName: "mail",
        iconNode: <Mail />
    },
    {
        iconName: "eventNote",
        iconNode: <EventNote />
    },
    {
        iconName: "groupAddIcon",
        iconNode: <GroupAddIcon />
    },
    {
        iconName: "localShippingIcon",
        iconNode: <LocalShippingIcon />
    },
    {
        iconName: "cloudSyncIcon",
        iconNode: <CloudSyncIcon />
    },
    {
        iconName: "taskAltIcon",
        iconNode: <TaskAltIcon />
    }, 
    {
        iconName: "checkCircleOutlineIcon",
        iconNode: <CheckCircleOutlineIcon />
    },

]
export default MenuImageDirectory;