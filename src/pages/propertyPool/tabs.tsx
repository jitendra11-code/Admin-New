import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import PropertyProfile from './propertyProfile';
import PropertyComparison from './propertyComparison';
import PropertyView from './propertyView';
import { useLocation } from 'react-router-dom';

const PropertyTabs = () => {
  const location = useLocation()
  const [value, setValue] = useState(location?.search?.split("=")[1] ? "3" : '1');
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  return (
    <div style={{ backgroundColor: "#fff", padding: "0px", border: "1px solid #0000001f", borderRadius: "5px" }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Property Profile" value="1" />
            <Tab label="Property Comparison" value="2" />
            <Tab label="Property View" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <PropertyProfile />
        </TabPanel>
        <TabPanel value="2"><PropertyComparison /> </TabPanel>
        <TabPanel value="3"><PropertyView setValue={setValue} /> </TabPanel>
      </TabContext>
    </div>
  )
}

export default PropertyTabs;