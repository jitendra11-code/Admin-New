import { Button, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow} from '@mui/material';
import React, { useState } from 'react'
import { submit } from 'shared/constants/CustomColor';
import moment from 'moment';

const AssetCodeDrawer= ({onAssetDrawerData,handleClose}) => {

    console.log('onAssetDrawerData',onAssetDrawerData)
    
  return (
    <>
   
        <div style={{padding : "8px"}}>
        <Grid
                marginBottom="30px"
                marginTop="0px"
                container
                item
                spacing={3}
                justifyContent="start"
                alignSelf="center"
              >
                <Grid item xs={6} md={6} sx={{ position: "relative" }}>
                  <div className="approval-table pl-0" style= {{width:"550px"}}>
                    <Table
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: "1px solid rgba(0, 0, 0, 0.12)",
                        },
                        mt: 0,
                        mb: 0,
                      }}
                      aria-label="spanning table"
                    >
                      <TableHead>
                        <TableRow sx={{ lineHeight: "0.5rem" }}>
                          <TableCell align="center" colSpan={2}>
                            Asset Details View
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            align="center"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                            style={{ width: '200px' }}
                          >
                            Field
                          </TableCell>
                          <TableCell
                            align="center"
                            className="w-75"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                            style={{ width: '200px' }}
                          >
                            Values
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell className="field-bold">Asset Code</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.assetCode}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">Asset Type</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.assetType}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">Asset Categorization</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.assetCategorization}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">Asset Class Description</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.assetClassDescription}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">Asset Description</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.assetDescription}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">Location Code</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.locationCode}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">Vertical</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.vertical}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">State</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.state}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">PAV Location</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.pavLocation}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">Book Value</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.bookVal}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">Admin Category</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.adminCategory}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">Branch Code</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.branchCode}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">Cost Center</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.costCenter}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">Accum_dep</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.accum_dep}</TableCell>
                        </TableRow>                       
                        <TableRow>
                          <TableCell className="field-bold">Acquis_Value</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.acquis_val}</TableCell>
                        </TableRow>                     
                        
                        <TableRow>
                          <TableCell className="field-bold">Capitalization Date</TableCell>
                          <TableCell className="w-71" >{moment(new Date(onAssetDrawerData?.capitalizationDate)).format('DD/MM/YYYY')}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">GL Account</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.glAccount}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">Ord_dep_start_date</TableCell>
                          <TableCell className="w-71" >{moment(new Date(onAssetDrawerData?.ord_dep_start_date)).format('DD/MM/YYYY')}</TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell className="field-bold">PO Number</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.poNumber}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">SAP Location Code</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.sapLocationCode}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold">Serial Number</TableCell>
                          <TableCell className="w-71" >{onAssetDrawerData?.serial_number}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </Grid>
            </Grid>
            {/* <div className="bottom-fix-btn"> */}
                <Stack
                    display="flex"
                    flexDirection="row"
                    justifyContent="center"
                    sx={{ margin: "10px" }}
                    style={{
                    marginTop: "20px",
                    position: "fixed",
                    bottom: "-5px",
                    left: "90%"
                    }}
                >
                    <Button
                        variant="contained"
                        type="button"
                        size="small"
                        style={submit}
                        onClick={() => handleClose()}
                        >
                        BACK
                    </Button>
                </Stack>
            {/* </div> */}
        </div>
    </>
  )
}

export default AssetCodeDrawer