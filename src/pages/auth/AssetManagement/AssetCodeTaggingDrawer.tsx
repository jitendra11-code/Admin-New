import { Button, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip} from '@mui/material';
import React, { useState } from 'react'
import { submit } from 'shared/constants/CustomColor';
import moment from 'moment';

const AssetCodeTaggingDrawer= ({onAssetDrawerData,handleClose}) => {

    console.log('onAssetDrawerData',onAssetDrawerData)
    
  return (
    <>
   
        <div style={{padding : "8px",  maxWidth: '600px',  }}>
        <Grid
                marginBottom="30px"
                marginTop="0px"
                container
                item
                spacing={3}
                justifyContent="start"
                alignSelf="center"
              >
                <Grid item xs={12} md={12} sx={{ position: "relative" }}>
                  <div className="approval-table pl-0" style={{ width: '580px',  }}>
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
                            // style={{ width: '200px !important' }}
                            className="w-50"
                          >
                            Field
                          </TableCell>
                          <TableCell
                            align="center"
                            className="w-50"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                            // style={{ width: '200px !important' }}
                          >
                            Values
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell className="field-bold w-50">Asset Code</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.assetCode}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold w-50">Asset Type</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.assetType}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold w-50">Asset Categorisation</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.assetCategorization}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold w-50">Asset Class Description</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.assetClassDescription}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold w-50">Asset Description</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.assetDescription}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold w-50">PAV Location</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.pavLocation}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold w-50">Book Value</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.bookVal}</TableCell>
                        </TableRow>
                        {/* <TableRow>
                          <TableCell className="field-bold w-50">Balance_Useful_life_as_per_Admin</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.balance_Useful_life_as_per_Admin}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold w-50">Balance_Useful_life_as_per_Finance</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.balance_Useful_life_as_per_Finance}</TableCell>
                        </TableRow> */}
                        <TableRow>
                          <TableCell className="field-bold w-50">Admin Category</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.adminCategory}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold w-50">Branch Code</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.branchCode}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold w-50">Cost Center</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.costCenter}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold w-50">Accum_dep</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.accum_dep}</TableCell>
                        </TableRow>                       
                        <TableRow>
                          <TableCell className="field-bold w-50">Acquis_Value</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.acquis_val}</TableCell>
                        </TableRow>                     
                        
                        <TableRow>
                          <TableCell className="field-bold w-50">Cap_date</TableCell>
                          <TableCell className="w-50" >{moment(new Date(onAssetDrawerData?.capitalizationDate)).format('DD/MM/YYYY')}</TableCell>
                        </TableRow>
                        
                        {/* <TableRow>
                          <TableCell className="field-bold w-50">Created By</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.createdBy}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold w-50">Created Date</TableCell>
                          <TableCell className="w-50" >{moment(new Date(onAssetDrawerData?.createdDate)).format('DD/MM/YYYY')}</TableCell>
                        </TableRow> */}
                        <TableRow>
                          <TableCell className="field-bold w-50">GL Account</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.glAccount}</TableCell>
                        </TableRow>
                        {/* <TableRow>
                          <TableCell className="field-bold w-50">Modified By</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.modifiedBy}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold w-50">Modified Date</TableCell>
                          <TableCell className="w-50" >{moment(new Date(onAssetDrawerData?.modifiedDate)).format('DD/MM/YYYY')}</TableCell>
                        </TableRow> */}
                        <TableRow>
                          <TableCell className="field-bold w-50">Ord_dep_start_date</TableCell>
                          <TableCell className="w-50" >{moment(new Date(onAssetDrawerData?.ord_dep_start_date)).format('DD/MM/YYYY')}</TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell className="field-bold w-50">PO Number</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.poNumber}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold w-50">SAP Location Code</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.sapLocationCode}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="field-bold w-50">Serial_Number</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.serial_number}</TableCell>
                        </TableRow>
                        {/* <TableRow>
                          <TableCell className="field-bold w-50">State</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.state}</TableCell>
                        </TableRow> */}
                        <TableRow>
                          <TableCell className="field-bold w-50">Status</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.status}</TableCell>
                        </TableRow>
                        {/* <TableRow>
                          <TableCell className="field-bold w-50">Used/Unused</TableCell>
                          <TableCell className="w-50" >{onAssetDrawerData?.used_Unused}</TableCell>
                        </TableRow> */}
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
                  <Tooltip title="BACK">
                    <Button
                        variant="contained"
                        type="button"
                        size="small"
                        style={submit}
                        onClick={() => handleClose()}
                        >
                        BACK
                    </Button>
                  </Tooltip>
                </Stack>
            {/* </div> */}
        </div>
    </>
  )
}

export default AssetCodeTaggingDrawer