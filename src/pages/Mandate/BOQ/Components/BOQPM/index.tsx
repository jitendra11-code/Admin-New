import { Checkbox } from '@mui/material';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { AgGridReact } from 'ag-grid-react';
import React, { useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom';

const BOQPM = ({ approvalRole, setApprovalRole,
    boqForApprovalData,
    setBOQForApprovalData,
    checked, setChecked,
    setVendor,
    setBOQ }) => {
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = React.useState(null);
    let { id } = useParams();
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const onSelectionChanged = useCallback(() => {
        const selectedRows = gridRef.current.api.getSelectedRows();

    }, []);
    var _dataLength = gridRef?.current?.api?.getDisplayedRowCount();

    React.useEffect(() => {
        if (_dataLength && _dataLength > 0) {
            var flag = new Array(_dataLength).fill(false);
            setChecked(flag)
        }

    }, [_dataLength])
    const onVendorChangeSelection = (params) => {
        setBOQ((state) => ({
            ...state,
            "boqId": params?.data?.id || 0
        }))
        setVendor((state) => ({
            ...state,
            "vendorId": params?.data?.vendorId || 0,
        }))

    }
    useEffect(() => {
        setChecked(false);
      }, [id]);


    let columnDefs = [
        {
            field: "",
            headerName: "Action",
            headerTooltip: "Action",                      
            cellRenderer: params => {
                return (<div style={{ display: "flex", alignItems: "center", margin: '-5px', justifyContent: "center" }}>
                <Checkbox
                    size="small"
                    style={{ fontSize: 10 }}
                    checked={params?.checked?.[params?.rowIndex]}
                    
                    onChange={(e) => {
                        
                        var _data = [...params?.checked];
                        var currentFlag = _data[params?.rowIndex];
                        _data = _data && _data?.map((item, index) => {
                            if (index === params?.rowIndex ) {
                                return !currentFlag
                            } else {
                                return false
                            }
                        })
                        params?.setChecked(_data)
                        params?.onVendorChangeSelection(params)
                    }
                    }
                /></div>)
            },
            cellRendererParams: {
                onVendorChangeSelection: onVendorChangeSelection,
                checked: checked,
                setChecked: setChecked
            },
            sortable: false,
            resizable: true,
            width: 80,
            maxWidth: 80,
            cellStyle: { fontSize: "13px" },


        },
        {
            field: "srno",
            headerName: "Sr. No",
            headerTooltip: "Serial Number",
            cellRenderer: (e: any) => {
                var index = e?.rowIndex
                return index + 1;
            },
            sortable: false,
            resizable: true,
            width: 80,
            maxWidth: 100,
            cellStyle: { fontSize: "13px" },
        },

        {
            field: "vendor_category",
            headerName: "Vendor Category",
            headerTooltip: "Vendor Category",
            sortable: true,
            resizable: true,
            width: 150,
            maxWidth: 200,
            cellStyle: { fontSize: "13px" },

        },
        {
            field: "vendor_name",
            headerName: "Vendor Name",
            headerTooltip: "Vendor Name",
            sortable: true,
            resizable: true,
            width: 150,
            maxWidth: 200,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "contact_number",
            headerName: "Contact No",
            headerTooltip: "Contact Number",
            sortable: true,
            resizable: true,
            maxWidth: 250,
            minWidth: 80,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "remarks",
            headerName: "Remark",
            headerTooltip: "Remark",
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 150,
            cellStyle: { fontSize: "13px" },

        },
        {
            field: "status",
            headerName: "Status",
            headerTooltip: "Status",
            sortable: true,
            resizable: true,
            width: 150,
            maxWidth: 200,
            cellStyle: { fontSize: "13px" },

        },


    ];
    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }
    return (
        <div>
            <div style={{ height: "100px", marginTop: "0px", marginBottom: "0px" }}>
                <CommonGrid
                    rowSelection={'single'}
                    rowHeight={30}
                    defaultColDef={{ flex: 1 }}
                    columnDefs={columnDefs}
                    rowData={boqForApprovalData || []}
                    onGridReady={onGridReady}
                    gridRef={gridRef}
                    pagination={false}
                    paginationPageSize={null}

                />
            </div>


        </div>
    )
}
export default BOQPM;