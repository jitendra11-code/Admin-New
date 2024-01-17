import React from 'react'
import { Grid,Box } from "@mui/material";
import Tabs from './tabs';

const PropertyPool = () => {
  

  return (
    <div>
      <Grid sx={{ display: 'flex', alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}>
      <Box
        component="h2"
        sx={{
          fontSize: 15,
          color: "text.primary",
          fontWeight:"600",
          marginBottom:"0 !important",
          mb: {
            xs: 2,
            lg: 4,
          },
        }}
      >
    Branch/Property Pool Profile
      </Box>
      </Grid>
   <Tabs />
  
    </div>
  )
}

export default PropertyPool