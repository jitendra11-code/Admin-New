import { MdOutgoingMail } from "react-icons/md";
import "./TimelineCss.css";
import AppTooltip from "@uikit/core/AppTooltip";
import { IconButton, Tooltip } from "@mui/material";
import { BiLinkAlt } from "react-icons/bi";
import moment from "moment";

const TimelineItem = ({ data,setSendMailId ,openConfirmDialog,setOpenConfirmDialog  , index}) => (
  <div className="timeline-item">
    <div className="timeline-item-content">
    <div style={{display : "flex", justifyContent : "space-between", width : "100%" ,alignItems : "center"}}>
    <span style={{
        color: "#333",
        fontSize: "11.5px",
        fontWeight: 500,
        borderRadius: "5px",
        letterSpacing: "1px",
        padding: "5px",
        textTransform: "uppercase",
        marginBottom: "5px",
        backgroundColor: "#efefef",
        order : index%2 == 0 ? 0 : 1
    }}
      
        className= {data?.status?.toLowerCase()?.includes("created")
        ? "normal"
        : data?.status?.toLowerCase()?.includes("approved")
        ? "approve"
        : data?.status?.toLowerCase()?.includes("rejected")
        ? "reject"
        : "tag"}
      >
        {data?.status}
      </span> 
      {/* <div>
        <AppTooltip title="send mail">
        <MdOutgoingMail size={16} style={{cursor :"pointer"}} 
          onClick={() => {setOpenConfirmDialog(!openConfirmDialog); setSendMailId(data?.id)}} />
        </AppTooltip>
        <BiLinkAlt size={16} style={{cursor :"pointer", marginLeft : "10px"}}/>
        </div> */}
        <div className="actions">
        <Tooltip id="button-report" title="Send Mail">
        <IconButton className="actionsIcons actionsIconsSize">
          <MdOutgoingMail size={16} style={{cursor :"pointer"}} 
                          onClick={() => {setOpenConfirmDialog(!openConfirmDialog); setSendMailId(data?.id)}} />
        </IconButton>
        </Tooltip>
        {/* <Tooltip id="button-report" title="Link">
          <IconButton className="actionsIcons actionsIconsSize">
            <BiLinkAlt size={16} />
          </IconButton>
        </Tooltip> */}
        </div>
    </div>
      <h4>{data?.roleName + "(" + data?.userName + ")"}<time>{data?.createdon && moment(data?.createdon).format("DD/MM/YYYY HH:mm:ss")}</time></h4>

      {/* data?.createdon?.replace("T", "  ").slice(0, 17)     */}
      <p>{data?.remarks}</p>

      <span className="circle" />
    </div>
  </div>
);
export default TimelineItem;
