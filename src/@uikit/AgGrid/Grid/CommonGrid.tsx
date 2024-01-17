import React, { useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './style.css';

const CommonGrid = ({
    rowData,
    columnDefs,
    suppressRowClickSelection = false,
    onGridReady,
    gridRef,
    defaultColDef,
    onFirstDataRendered = null,
    pagination,
    paginationPageSize,
    onCellEditingStopped = null,
    getRowId = null,
    onCellValueChanged = null,
    rowHeight = null,
    components = null,
    rowSelection = null,
    onRowSelected = null,
    onSelectionChanged = null,
    suppressClickEdit = false,
    getRowStyle = null,
    groupIncludeFooter = false,
    groupIncludeTotalFooter = false,
    autoGroupColumnDef = null,
    suppressRowDeselection = false,
    onRowClicked = null,
    onCellClicked = null,
}) => {
    const containerStyle = useMemo(() => ({ width: 'auto', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

    const getRowHeight = useCallback((params: any) => {
        return params?.data?.rowHeight;
    }, []);
    const rowStyle = { background: '#F4F4F4' };
    const getRowStyleCustom = (params: any) => {
        if (getRowStyle === null) {
            if (params?.node?.rowIndex % 2 === 0) {
                return { background: 'white' };
            }
        } else {
            return { background: 'white' };
        }
    };
    return (
        <div style={containerStyle}>
            <div style={{ height: '100%', boxSizing: 'border-box' }}>
                <div style={gridStyle} className="ag-theme-alpine">
                    <AgGridReact
                        suppressClickEdit={false}
                        getRowId={getRowId}
                        components={components}
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        suppressRowClickSelection={suppressRowClickSelection}
                        onCellValueChanged={onCellValueChanged}
                        onCellEditingStopped={onCellEditingStopped}
                        pagination={pagination ? true : false}
                        paginationPageSize={paginationPageSize ? paginationPageSize : 10}
                        paginationAutoPageSize={false}
                        getRowHeight={getRowHeight}
                        headerHeight={30}
                        suppressRowDeselection={suppressRowDeselection}
                        rowStyle={rowStyle}
                        getRowStyle={getRowStyle !== null ? getRowStyle : getRowStyleCustom}
                        onGridReady={onGridReady}
                        defaultColDef={defaultColDef}
                        rowHeight={rowHeight}
                        stopEditingWhenCellsLoseFocus={true}
                        rowSelection={rowSelection}
                        onSelectionChanged={onSelectionChanged}
                        onRowSelected={onRowSelected}
                        onRowClicked={onRowClicked}
                        onCellClicked={onCellClicked}
                        onFirstDataRendered={onFirstDataRendered}                       
                    ></AgGridReact>
                </div>
            </div>
        </div>
    );
};

export default CommonGrid;
