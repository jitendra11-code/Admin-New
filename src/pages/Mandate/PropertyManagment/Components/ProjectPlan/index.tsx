import React from 'react';
import { TextField } from '@mui/material';
import Template from 'pages/common-components/AgGridUtility/ColumnHeaderWithAsterick';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayJs, { Dayjs } from 'dayjs';
import { AgGridReact } from 'ag-grid-react';
import { useDispatch } from 'react-redux';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import FileDownloadList from './Actions/FileDownloadList';
import ProjectPlanHistoryData from './Actions/ProjectPlanHistoryData';
import FileUploadAction from './Actions/FileUploadAction';
import StatusValueEditor from './Editors/StatusValueEditor';
import TextEditor from './Editors/TextEditor';
import PMRemarkEditor from './Editors/PMRemarkEditor';
declare global {
    interface Navigator {
        msSaveBlob?: (blob: any, defaultName?: string) => boolean;
    }
}

const ProjectPlan = ({
    mandate,

    getActivityCompletedStatus,
    vendorType,
    getHeightForProjectPlan,
    projectPlanData,
    projectPlanDataUpdated,
    setProjectPlanData,
    setProjectPlanDataUpdated,
}) => {
    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const fileInput = React.useRef(null);
    const dispatch = useDispatch();
    const { user } = useAuthUser();
    const gridRef = React.useRef<AgGridReact>(null);

    const components = {
        ProcessOwnerEditorCmp: TextEditor,
        StatusValueEditorCmp: StatusValueEditor,
        PMRemarkEditorCmp: PMRemarkEditor,
        VendorRemarKEditorCmp: PMRemarkEditor,
    };

    let columnDefs = [
        {
            field: 'Actions',
            headerName: 'Actions',
            headerTooltip: 'Actions',
            sortable: false,
            resizable: true,
            width: 100,
            pinned: 'left',
            minWidth: 100,
            cellStyle: { fontSize: '12px' },
            cellRendererParams: {
                mandate: mandate,
                vendorType: vendorType,
                fileInput: fileInput,
            },
            cellRenderer: (params: any) => (
                <>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginRight: '10px',
                        }}
                        className="actions"
                    >
                        {params?.data?.planId !== 0 && <FileUploadAction params={params} />}
                        <FileDownloadList props={params} mandate={mandate} />

                        <ProjectPlanHistoryData props={params} />
                    </div>
                </>
            ),
        },

        {
            field: 'section',
            headerName: 'Section',
            headerTooltip: 'Section',
            sortable: true,
            pinned: 'left',
            resizable: true,
            width: 140,
            minWidth: 140,
            cellClass: 'cell-padding-section',
            cellStyle: { fontSize: '12px' },
        },
        {
            field: 'vendorType',
            headerName: 'Vendor Type',

            sortable: true,
            hide: user?.role === 'Vendor',
            pinned: 'left',
            headerTooltip: 'Vendor Type',
            resizable: true,
            width: 120,
            minWidth: 120,
            cellClass: 'cell-padding-section',
            cellStyle: { fontSize: '12px' },
        },
        {
            field: 'process_Owner',
            headerName: 'Owner/SPOC',
            headerTooltip: 'Owner/SPOC',
            headerClass: 'header-with-asterisk',
            pinned: 'left',
            sortable: true,
            resizable: true,
            headerComponentParams: {
                template: Template,
            },
            editable: user?.role && user?.role !== 'Vendor',
            width: 140,
            minWidth: 140,
            suppressSizeToFit: true,
            cellClass: 'editTextClass',
            cellClassRules: {
                'rag-red': (params) => {
                    if (user?.role === 'Project Manager') {
                        if (!params?.data?.process_Owner) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    return false;
                },
            },
            cellStyle: { fontSize: '12px', cursor: 'pointer' },

            cellEditor: 'ProcessOwnerEditorCmp',
            cellEditorParams: {
                projectPlanData: projectPlanData,
                setProjectPlanData: setProjectPlanData,
                maxLength: 100,
            },
        },

        {
            field: 'proposed_Start_Date',
            headerName: 'Proposed Start',
            headerTooltip: 'Proposed Start',
            sortable: true,
            resizable: true,
            width: 140,
            minWidth: 140,
            cellClass: 'cell-padding',
            cellStyle: { fontSize: '12px' },
            cellRenderer: (params: any) => (
                <>
                    <div style={{ marginTop: 2 }} className="padd-right">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DesktopDatePicker
                                inputFormat="DD/MM/YYYY"
                                maxDate={projectPlanData?.[params?.rowIndex]?.proposed_End_Date && projectPlanData?.[params?.rowIndex]?.proposed_End_Date}
                                value={projectPlanData?.[params?.rowIndex]?.proposed_Start_Date || null}
                                onChange={(value: Dayjs | null) => {
                                    var currentIndex = params?.rowIndex;
                                    var data = [...params?.projectPlanData];
                                    if (value !== null && dayJs(value).isValid()) data[currentIndex].proposed_Start_Date = value?.toDate();
                                    params?.setProjectPlanData(data);
                                }}
                                disabled={user?.role && user?.role === 'Vendor'}
                                renderInput={(paramsText) => (
                                    <TextField
                                        onKeyDown={(e) => {
                                            e.preventDefault();
                                        }}
                                        sx={{
                                            '.MuiInputBase-input': {
                                                height: '12px !important',
                                                fontSize: '12px',
                                                paddingLeft: '8px',
                                            },
                                            background: user?.role === 'Vendor' ? '#f3f3f3' : '',
                                        }}
                                        {...paramsText}
                                        error={projectPlanData?.[params?.rowIndex]?.proposed_Start_Date !== null ? false : true}
                                        size="small"
                                        name="Proposed Start Date"
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </div>
                </>
            ),
            cellRendererParams: {
                projectPlanData: projectPlanData,
                setProjectPlanData: setProjectPlanData,
            },
        },
        {
            field: 'proposed_End_Date',
            headerName: 'Proposed End',
            headerTooltip: 'Proposed End',
            sortable: true,
            resizable: true,
            cellClass: 'cell-padding',
            width: 140,
            minWidth: 140,
            cellStyle: { fontSize: '12px' },
            cellRenderer: (params: any) => (
                <>
                    <div style={{ marginTop: 2 }} className="padd-right">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DesktopDatePicker
                                inputFormat="DD/MM/YYYY"
                                disabled={user?.role && user?.role === 'Vendor'}
                                minDate={projectPlanData?.[params?.rowIndex]?.proposed_Start_Date && projectPlanData?.[params?.rowIndex]?.proposed_Start_Date}
                                value={projectPlanData?.[params?.rowIndex]?.proposed_End_Date || null}
                                onChange={(value: Dayjs | null) => {
                                    var currentIndex = params?.rowIndex;
                                    var data = [...params?.projectPlanData];
                                    if (value !== null && dayJs(value).isValid()) data[currentIndex].proposed_End_Date = value?.toDate();
                                    params?.setProjectPlanData(data);
                                }}
                                renderInput={(paramsText) => (
                                    <TextField
                                        onKeyDown={(e) => {
                                            e.preventDefault();
                                        }}
                                        sx={{
                                            '.MuiInputBase-input': {
                                                height: '12px !important',
                                                fontSize: '12px',
                                                paddingLeft: '8px',
                                            },
                                            background: user?.role === 'Vendor' ? '#f3f3f3' : '',
                                        }}
                                        {...paramsText}
                                        error={projectPlanData?.[params?.rowIndex]?.proposed_End_Date ? false : true}
                                        size="small"
                                        name="Proposed Start Date"
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </div>
                </>
            ),
            cellRendererParams: {
                projectPlanData: projectPlanData,
                setProjectPlanData: setProjectPlanData,
            },
        },
        {
            field: 'pM_remarks',
            headerName: 'PM Remarks',
            headerTooltip: 'PM Remarks',
            sortable: true,
            tooltipField: 'pM_remarks',
            resizable: true,
            editable: user?.role && user?.role !== 'Vendor',
            width: 140,
            columnType: 'textbox',
            minWidth: 140,
            cellClass: 'cell-padding editTextClass',
            suppressSizeToFit: true,
            cellStyle: {
                fontSize: '12px',
                cursor: 'pointer',
                background: user?.role && user?.role === 'Vendor' && '#EBEBE4',
            },
            cellEditor: 'PMRemarkEditorCmp',
            cellEditorParams: {
                projectPlanData: projectPlanData,
                setProjectPlanData: setProjectPlanData,
                maxLength: 50,
            },
        },

        {
            field: 'actual_Start_Date',
            headerName: 'Actual Start',
            headerTooltip: 'Actual Start',
            sortable: true,
            resizable: true,
            width: 140,
            minWidth: 140,
            cellClass: 'cell-padding',
            cellStyle: { fontSize: '12px' },
            cellRenderer: (params: any) => (
                <>
                    <div style={{ marginTop: 2 }} className="padd-right">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DesktopDatePicker
                                inputFormat="DD/MM/YYYY"
                                disabled={user?.role === 'Project Manager'}
                                value={projectPlanData?.[params?.rowIndex]?.actual_Start_Date || null}
                                onChange={(value: Dayjs | null) => {
                                    var currentIndex = params?.rowIndex;
                                    var data = [...params?.projectPlanData];
                                    if (value !== null && dayJs(value).isValid()) data[currentIndex].actual_Start_Date = value?.toDate();
                                    params?.setProjectPlanData(data);
                                }}
                                maxDate={projectPlanData?.[params?.rowIndex]?.actual_End_Date || dayJs() 
                                    }
                                renderInput={(paramsText) => (
                                    <TextField
                                        onKeyDown={(e) => {
                                            e.preventDefault();
                                        }}
                                        sx={{
                                            '.MuiInputBase-input': {
                                                height: '12px !important',
                                                fontSize: '12px',
                                                paddingLeft: '8px',
                                            },
                                            backgroundColor: user?.role === 'Project Manager' && '#f3f3f3',
                                        }}
                                        {...paramsText}
                                        error={projectPlanData?.[params?.rowIndex]?.actual_Start_Date === null && projectPlanData?.[params?.rowIndex]?.status_percentage > 0 ? true : false}
                                        size="small"
                                        name="Actual Start Date"
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </div>
                </>
            ),
            cellRendererParams: {
                projectPlanData: projectPlanData,
                setProjectPlanData: setProjectPlanData,
            },
        },
        {
            field: 'actual_End_Date',
            headerName: 'Actual End',
            headerTooltip: 'Actual End',
            sortable: true,
            resizable: true,
            cellClass: 'cell-padding',
            width: 180,
            minWidth: 180,
            cellStyle: { fontSize: '12px' },
            cellRenderer: (params: any) => (
                <>
                    <div style={{ marginTop: 2 }} className="padd-right">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DesktopDatePicker
                                disabled={user?.role === 'Project Manager'}
                                minDate={projectPlanData?.[params?.rowIndex]?.actual_Start_Date && projectPlanData?.[params?.rowIndex]?.actual_Start_Date}
                                inputFormat="DD/MM/YYYY"
                                value={projectPlanData?.[params?.rowIndex]?.actual_End_Date || null}
                                onChange={(value: Dayjs | null) => {
                                    var currentIndex = params?.rowIndex;
                                    var data = [...params?.projectPlanData];
                                    if (value !== null && dayJs(value).isValid()) data[currentIndex].actual_End_Date = value?.toDate();
                                    params?.setProjectPlanData(data);
                                }}
                                renderInput={(paramsText) => (
                                    <TextField
                                        onKeyDown={(e) => {
                                            e.preventDefault();
                                        }}
                                        sx={{
                                            '.MuiInputBase-input': {
                                                height: '12px !important',
                                                fontSize: '12px',
                                                padding: '8px',
                                            },
                                            backgroundColor: user?.role === 'Project Manager' && '#f3f3f3',
                                        }}
                                        {...paramsText}
                                        error={projectPlanData?.[params?.rowIndex]?.actual_End_Date === null && projectPlanData?.[params?.rowIndex]?.status_percentage >= 100 ? true : false}
                                        size="small"
                                        name="Proposed Start Date"
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </div>
                </>
            ),
            cellRendererParams: {
                projectPlanData: projectPlanData,
                setProjectPlanData: setProjectPlanData,
            },
        },

        {
            field: 'status_percentage',
            headerName: 'Status(%)',
            headerTooltip: 'Status(%)',
            sortable: true,
            editable: user?.role && user?.role !== undefined && user?.role !== 'Project Manager',
            resizable: true,
            width: 80,
            minWidth: 80,
            cellClass: 'editTextClass',
            cellEditor: 'StatusValueEditorCmp',
            cellEditorParams: {
                projectPlanData: projectPlanData,
                setProjectPlanData: setProjectPlanData,
                user: user,
                maxLength: 3,
                type: 'number',
            },
            cellStyle: { fontSize: '12px', cursor: 'pointer' },
        },
        {
            field: 'vendor_remarks',
            headerName: 'Vendor Remark',
            headerTooltip: 'Vendor Remark',
            sortable: true,
            resizable: true,
            tooltipField: 'vendor_remarks',
            editable: user?.role && user?.role === 'Vendor',
            width: 140,
            minWidth: 140,
            cellClass: 'cell-padding editTextClass',
            suppressSizeToFit: true,

            cellStyle: {
                fontSize: '12px',
                cursor: 'pointer',
                background: user?.role && user?.role !== 'Vendor' && '#EBEBE4',
            },
            cellEditor: 'VendorRemarKEditorCmp',
            cellEditorParams: {
                projectPlanData: projectPlanData,
                setProjectPlanData: setProjectPlanData,
                maxLength: 50,
            },
        },
    ];

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        params.api.sizeColumnsToFit();
    }
    console.log('projectPlanData', projectPlanData);
    return (
        <div>
            <div style={{ height: 'calc(100vh - 380px)' }}>
                <CommonGrid
                    getRowId={(data) => {
                        return data && data?.data?.custom_id;
                    }}
                    getRowStyle={() => {
                        return { background: 'white' };
                    }}
                    components={components}
                    rowHeight={36}
                    defaultColDef={{
                        singleClickEdit: true,
                        flex: 1,
                    }}
                    columnDefs={columnDefs}
                    onCellValueChanged={function (params) {
                        if (params?.colDef?.field === 'status_percentage' && params?.type === 'cellValueChanged') {
                            getActivityCompletedStatus();
                        }
                    }}
                    rowData={projectPlanData || []}
                    onGridReady={onGridReady}
                    gridRef={gridRef}
                    pagination={false}
                    paginationPageSize={5}
                />
            </div>
        </div>
    );
};
export default ProjectPlan;
