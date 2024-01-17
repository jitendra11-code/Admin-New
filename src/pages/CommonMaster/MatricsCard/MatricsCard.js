import React from "react";
import "./MatricCard.css"
import { MdWeekend, MdMoney,MdPerson,MdLeaderboard,MdEmojiTransportation,MdFlight,MdHotel,MdLocationPin,MdLogin,MdPages,  } from 'react-icons/md';
import Divider from "@mui/material/Divider";
import { Link} from "react-router-dom";
const iconComponents = {
  MdWeekend,
  MdPerson,
  MdMoney,
  MdLeaderboard,
  MdEmojiTransportation,
  MdFlight,
  MdHotel,
  MdLocationPin,
  MdLogin,
  MdPages,
  
};
const MatricsCard = ({itm,metricsdata}) => {
  const IconComponent = iconComponents[itm.iconname];
  return (
    <div className='Matric_card' >
      <Link to={metricsdata.link} style={{textDecoration:"none"}}>
      <div className='Matric_child_1'>
        <div className='child1_icon' style={{background:metricsdata.background}}>
        {IconComponent && <IconComponent color='white' fontSize='1.5rem' />}
        </div>
        <div className='child1_text'>
          <span >{itm.type}</span><h4 >{itm.number}</h4>
        </div>
        
      </div>
      <Divider variant="middle" className="mid-divider" />
      <div className='Matric_child_2'>
        <p>{itm.txt}</p>
      </div>
      </Link>
    </div>
  )
}

export default MatricsCard