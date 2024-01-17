import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { AgGridReact } from "ag-grid-react";
import { GridApi } from "ag-grid-community";
import Box from "@mui/material/Box";
import { IconButton, List, ListItem, ListItemText,alpha } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Checkbox, DialogTitle, FormControlLabel, Grid, Stack, Typography, Tooltip } from "@mui/material";
import Button from "@mui/material/Button";
import groupBy from "./Components/GroupingMenuByParent";
import { primaryButtonSm } from "shared/constants/CustomColor";
import TextField from '@mui/material/TextField';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useFormik } from "formik";
import * as Yup from "yup";
import DeleteRole from "./Components/DeleteRole";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchError, showMessage } from "redux/actions";
import regExpressionTextField, { regExpressionRemark, textFieldValidationOnPaste } from "@uikit/common/RegExpValidation/regForTextField";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { TbPencil } from "react-icons/tb";
import { AiFillFileExcel } from "react-icons/ai";
import AppTooltip from "@uikit/core/AppTooltip";
const bfsSearch = (graph, targetId) => {
  const queue = [...graph];

  while (queue.length > 0) {
    const currNode = queue.shift();
    if (currNode?.custom_id === targetId) {
      return currNode;
    }
    if (currNode.children) {
      queue.push(...currNode.children);
    }
  }
  return []; // Target node not found
};
export default function Rolemanagement() {
  const [roleData, setRole] = useState([]);
  const [roleMenuData, setRoleMenuList] = useState([]);
  const [indeterminateNodes, setIndeterminateNodes] = useState([]);
  const { user } = useAuthUser();
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleNameGrid, setRoleNameGrid] = useState("");
  const [deleteModal, setDeleteModal] = useState<Boolean>(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [flag, setFlag] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = React.useState(false);
  const [editModal, setEditModal] = React.useState(false);
  const [editRole, setEditRole] = useState<any>({});
  const handleExpandClick = (event) => {
    event.stopPropagation();
  };
  const [openPermissin, setOpenPermission] = React.useState(false);
  const [checkedItems, setCheckedItems] = React.useState([]);

  const handleClickOpenPermission = () => {
    setOpenPermission(true);
  };

  const handleClosePermissin = () => {
    setOpenPermission(false);
  };

  const handleToggle = (value) => () => {
    const currentIndex = checkedItems.indexOf(value);
    const newCheckedItems = [...checkedItems];

    if (currentIndex === -1) {
      newCheckedItems.push(value);
    } else {
      newCheckedItems.splice(currentIndex, 1);
    }

    setCheckedItems(newCheckedItems);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleCloseDelete = () => {
    setDeleteModal(false)
  }

  const handleCloseEdit = () => {
    setEditModal(false)
  }

  const handleEditName = (e) => {
    let value = e.target.value;
    setEditRole({ ...editRole, role_Name: value });
  }

  const handleActionChange = (e, node) => {
    const newData = roleMenuData && roleMenuData.map((parent) => {
      if (node.isparent === 1) {
        if (parent.custom_id === node.custom_id) {
          return { ...parent, SelectedAction: e.target.value };
        }
        return parent;
      } else {
        if (parent?.children)
          var newChildren = parent?.children?.map((child) => {
            if (child.custom_id === node.custom_id) {
              return { ...child, SelectedAction: e.target.value };
            }
            return child;
          });

        return { ...parent, children: newChildren };
      }
    });
    setRoleMenuList(newData);
  }

  const handleChange = (node) => {
    const updatedTree = updateNode(roleMenuData, node?.custom_id, node.checked);
    setRoleMenuList(updatedTree);
  };
  const renderTree = (nodes, handleChange) => (
    <TreeItem
      key={nodes?.custom_id}
      nodeId={nodes?.custom_id.toString()}
      label={<>
        <div style={{
          display: "flex",
          justifyContent: "flex-start",
          alignContent: "center",
          alignItems: "center"
        }}>
          <Checkbox
            checked={nodes?.checked || false}
            onChange={() => handleChange(nodes)}
          />
          <Typography style={{ marginLeft: 10, fontSize: 13, width: "100%" }}>{nodes?.menuname || ""}</Typography>
          <FormControl sx={{ m: 1, minWidth: 40 }} size="small">
            <Select
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              defaultValue={nodes?.SelectedAction || ""}
              style={{ height: 20, width: 120, fontSize: 10, cursor: "pointer" }}
              value={nodes?.SelectedAction || ""}
              onChange={(e) => handleActionChange(e, nodes)}
            >
              {nodes?.actions && nodes?.actions && _generateActionOptions(nodes?.actions)?.map((action) => (
                <MenuItem
                  key={action}
                  value={action}>
                  {action}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div>
            <Dialog fullWidth open={openPermissin} onClose={handleClosePermissin}>
              <DialogTitle>Permissions</DialogTitle>
              <DialogContent>
                <List>
                  {['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 1', 'Item 2', 'Item 3', 'Item 4'].map((item) => {
                    const labelId = `checkbox-list-label-${item}`;

                    return (
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={4} md={3} key={item}>
                          <ListItem key={item} dense onClick={handleToggle(item)}>
                            <Checkbox
                              defaultChecked={true}
                              edge="start"
                              onChange={handleToggle(item)}
                              checked={checkedItems.indexOf(item) !== -1}
                              tabIndex={-1}
                              disableRipple
                              inputProps={{ 'aria-labelledby': labelId }}
                            />
                            <ListItemText id={labelId} primary={item} />
                          </ListItem>
                        </Grid>
                      </Grid>
                    );
                  })}
                </List>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </>
      }
    >
      {Array.isArray(nodes?.children)
        ? nodes?.children && nodes.children?.length > 0 && nodes.children.map((node) => renderTree(node, handleChange))
        : null}
    </TreeItem>
  );

  const updateNode = (tree, nodeId, checked) => {
    return tree.map((node) => {
      if (node?.custom_id === nodeId) {

        node.checked = !checked;
        node.indeterminate = false;
        if (Array.isArray(node.children)) {
          node.children = node.children.map((childNode) => {
            childNode.checked = !checked;
            childNode.indeterminate = false;
            return childNode;
          });
        }
      } else if (Array.isArray(node.children)) {
        node.children = updateNode(node.children, nodeId, checked);
        const selectedCount = node.children.filter((childNode) => childNode.checked).length;
        node.checked = selectedCount === node.children.length;
        node.indeterminate = selectedCount > 0 && selectedCount < node.children.length;
      }
      return node;
    });
  };


  const flattenArray = (arr) => {
    const flattenedData = arr.reduce((acc, parent) => {
      acc.push(parent);
      if (parent.children && parent.children.length > 0) {
        acc.push(...parent.children);
      }
      return acc;
    }, []);
    return flattenedData || []
  };

  const onSaveRole = () => {
    var excludedKey = 'children';
    var _flattenArray = flattenArray(roleMenuData);
    const filteredData = _flattenArray.map(obj => {
      const { [excludedKey]: excluded, ...rest } = obj;
      return rest;
    });
    var payload = filteredData && filteredData.map((item) => {
      return {
        ...item,
        isDeleted: item?.checked ? false : true,
        roleName: roleNameGrid || ""
      }
    })

    payload = payload && payload.map((item) => {
      return {
        "menuname": item?.menuname || "",
        "parentname": item?.parentname || "",
        "menuroute": item?.menuroute || "",
        "isparent": item?.isparent || 0,
        "Id": item?.Id || 0,
        "sequence": item?.sequence || 0,
        "rolename": item?.roleName || "",
        "isDeleted": item?.isDeleted || false,
        "action": item?.SelectedAction || ""
      }
    })

    axios
      .post(
        `${process.env.REACT_APP_BASEURL
        }/api/RoleMenuList/InsertUpdateRoleMenuList`,
        payload
      )
      .then((response: any) => {
        if (!response) {
          getRoleMenuListByRole(roleNameGrid)
          dispatch(fetchError("Role Menus are not created"));
          return
        };
        if (response && response?.data?.code === 200 && response?.data?.status === true) {
          dispatch(showMessage("Role Menus are created sucessfully"));
          getRoleMenuListByRole(roleNameGrid)
          return
        } else {
          dispatch(fetchError("Role Menus are not created"));
          getRoleMenuListByRole(roleNameGrid)
          return
        }
      })
      .catch((e: any) => {
        getRoleMenuListByRole(roleNameGrid)
        dispatch(fetchError("Role Menus are not created"));
      });

  }

  const getRole = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/User/UserManagementRoleList`)
      .then((response: any) => {
        setRole(response?.data || []);
      })
      .catch((e: any) => { });
  };


  const _generateMenuList = async (menuList) => {
    var _menulist = groupBy(menuList, "parentname")
    return _menulist || [];

  }

  const _generateActionOptions = (actions) => {
    var _options = [];
    if (actions === undefined || actions === "") {
      return []
    }
    const separator = ',';
    _options = actions.split(separator);
    return _options || []

  }


  const getRoleMenuListByRole = async (roleName) => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/RoleMenuList/RoleMenuListByRoleName?roleName=${roleName || ""}`)
      .then((response: any) => {
        _generateMenuList(response?.data).then(res => {
          setRoleMenuList(res)
        })
      })
      .catch((e: any) => { });
  };

  const deleteRole = (id) => {
    axios
      .post(
        `${process.env.REACT_APP_BASEURL
        }/api/Role/DeleteRole?id=${id || 0}`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Role is not deleted"));
          getRole();
          setDeleteModal(false)
          return
        };
        if (response && response?.data?.code === 200 && response?.data?.status === true) {
          dispatch(showMessage("Role is deleted sucessfully"));
          getRole();
          setDeleteModal(false)
          return
        } else {
          dispatch(fetchError("Role is not deleted"));
          getRole();
          setDeleteModal(false)
          return
        }
      })
      .catch((e: any) => {
        setDeleteModal(false)
        dispatch(fetchError("Error Occurred !"));
      });
  }


  const changeRoleName = (e) => {
    let value = e.target.value;
    setRoleName(value);

  }
  const SaveRole = (payload) => {
    axios
      .post(
        `${process.env.REACT_APP_BASEURL
        }/api/Role/SaveRole`
        , payload
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Role is not created"));
          return
        };
        if (response && response?.data?.code === 200 && response?.data?.status === true) {
          dispatch(showMessage("Role is created sucessfully"));
          setOpen(false);
          getRole();
          return
        } else {
          dispatch(fetchError("Role is not created"));
          return
        }
      })
      .catch((e: any) => {
        setOpen(false);
        dispatch(fetchError("Error Occurred !"));
      });
  }

  const UpdateRole = () => {
    const payload = {
      ...editRole,
      "UpdatedOn": moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      "UpdatedBy": user?.UserName,
    }

    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/Role/UpdateRoleByName`, payload
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Role is not updated"));
          setEditModal(false);
          return;
        };
        if (response && response?.data?.code === 200 && response?.data?.status === true) {
          dispatch(showMessage("Role is updated successfully"));
          setEditModal(false);
          getRole();
          return;
        } else {
          dispatch(fetchError("Role is not updated"));
          setEditModal(false);
          return;
        }
      })
      .catch((e: any) => {
        setEditModal(false);
        dispatch(fetchError("Error Occurred !"));
      });
  }
  const handleSubmit = () => {
    const payload = {
      "Id": 0,
      "Role_ID": "",
      "User_ID": 0,
      "Role_Type": "",
      "Role_Name": roleName || "",
      "Active": "Active",
      "Role_Description": roleName || "",
      "CreatedOn": moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      "UpdatedOn": moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      "CreatedBy": user?.UserName,
      "UpdatedBy": user?.UserName,
    }
    SaveRole(payload)
  }

  useEffect(() => {
    getRole();
  }, []);


  let columnDefs = [
    {
      field: "Action",
      headerName: "Actions",
      headerTooltip: "Actions",
      sortable: false,
      resizable: false,
      pinned: "left",
      cellRenderer: (params: any) => (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginRight: "10px",
            }}
            className="actions"
          >
            <DeleteRole
              params={params}
              deleteRole={deleteRole}
              setDeleteModal={setDeleteModal}
              open={deleteModal}
              handleClose={handleCloseDelete} />

            <Tooltip title="Edit User" className="actionsIcons">
              <button className="actionsIcons actionsIconsSize" >
                <TbPencil onClick={() => { setEditRole(params?.data); setEditModal(true); }} />
              </button>
            </Tooltip>
          </div>
        </>
      ),
      width: 120,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "role_Name",
      headerName: "Role Name",
      headerTooltip: "Role Name",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
    },

  ]

  function onGridReady(params) {
    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);
  }

  useEffect(() => {
    if (roleData && roleData?.length > 0) {
      setRoleNameGrid(roleData?.[0]?.role_Name || "");
      getRoleMenuListByRole(roleData?.[0]?.role_Name || "");
    }

  }, [roleData, setRole])

  const onSectionChangeSelection = (params) => {
    const field = params.colDef.field;
    if (field !== "Action") {
      setRoleNameGrid(params?.data?.role_Name || "")
      getRoleMenuListByRole(params?.data?.role_Name || "");
    }
  };

  const handleExportData = () => {
    axios
    .get(
      `${process.env.REACT_APP_BASEURL}/api/User/GetExcelForUserManagementRoleList`
    )
      .then((response) => {
        if (!response) {
          dispatch(fetchError("Error occurred in Export !!!"));
          return;
        }
        if (response?.data) {
          var filename = "RoleManagement.xlsx";
          if (filename && filename === "") {
            dispatch(fetchError("Error Occurred !"));
            return;
          }
          const binaryStr = atob(response?.data);
          const byteArray = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            byteArray[i] = binaryStr.charCodeAt(i);
          }

          var blob = new Blob([byteArray], {
            type: "application/octet-stream",
          });
          if (typeof window.navigator.msSaveBlob !== "undefined") {
            window.navigator.msSaveBlob(blob, filename);
          } else {
            var blobURL =
              window.URL && window.URL.createObjectURL
                ? window.URL.createObjectURL(blob)
                : window.webkitURL.createObjectURL(blob);
            var tempLink = document.createElement("a");
            tempLink.style.display = "none";
            tempLink.href = blobURL;
            tempLink.setAttribute("download", filename);
            if (typeof tempLink.download === "undefined") {
              tempLink.setAttribute("target", "_blank");
            }

            document.body.appendChild(tempLink);
            tempLink.click();

            // Fixes "webkit blob resource error 1"
            setTimeout(function () {
              document.body.removeChild(tempLink);
              window.URL.revokeObjectURL(blobURL);
            }, 200);

            dispatch(
              showMessage("Role Management data downloaded successfully!")
            );
          }
        }
      });
  };


  return (
    <>
      <Grid
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <Box component="h2" className="page-title-heading mb-0">
          Role Management
        </Box>
        <div className="rolem-grid">
          <Stack
            display="flex"
            alignItems="flex-end"
            justifyContent="space-between"
            flexDirection="row"
            sx={{ mb: -2 }}
          >
            <Button
              size="small"
              style={primaryButtonSm}
              sx={{ color: "#fff", fontSize: "12px" }}
              onClick={handleClickOpen}
            >
              Add New Role
            </Button>
            <AppTooltip title="Export Excel">
              <IconButton
                className="icon-btn"
                sx={{
                  // borderRadius: "50%",
                  // borderTopColor:"green",
                  width: 35,
                  height: 35,
                  // color: (theme) => theme.palette.text.secondary,
                  color: "white",
                  backgroundColor: "green",
                  "&:hover, &:focus": {
                    backgroundColor: "green", // Keep the color green on hover
                  },                  
                }}
                onClick={() => {handleExportData();}}
                size="large"
              >
                <AiFillFileExcel />
              </IconButton>
            </AppTooltip>
            <Dialog open={open} onClose={handleClose} aria-describedby="alert-dialog-slide-description" maxWidth="lg" >
              <DialogTitle id="alert-dialog-title" className="title-model">
                Add Role
              </DialogTitle>
              <DialogContent style={{ width: "450px" }}>
                <TextField
                  id="rolename"
                  name="rolename"
                  variant="outlined"
                  type="text"
                  value={roleName || ""}
                  size="small"                
                  onKeyDown={(e: any) => {                    
                    regExpressionTextField(e)
                  }}
                  onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                      dispatch(fetchError("You can not paste Spacial characters"))
                    }
                  }}
                  onChange={changeRoleName}
                />
                {error && <p className="err">{error}</p>}
              </DialogContent>
              <DialogActions className="button-wrap">
                <Button className="yes-btn" onClick={handleSubmit}>Submit</Button>
                <Button className="no-btn" onClick={handleClose}>Cancel</Button>
              </DialogActions>
            </Dialog>
          </Stack>
        </div>
      </Grid>
      <div style={{
        display: "flex",
        justifyContent: "flex-start",
        margin: '10px 15px 10px 15px'
      }}>
        <Grid
          item
          xs={6}
          md={3}
          sx={{ position: "relative" }}
        >
          <div style={{ minWidth: "25vw", height: "65vh" }}>

            <CommonGrid
              onFirstDataRendered={(params) => {
                params?.api
                  ?.getDisplayedRowAtIndex(0)
                  ?.setSelected(true);
              }}
              defaultColDef={{ flex: 1 }}
              columnDefs={columnDefs}
              rowData={roleData}
              getRowId={(params) => {
                return params?.data?.id;
              }}
              rowSelection={"single"}
              
              onCellClicked={(params) => {
                onSectionChangeSelection(params);
              }}
              onGridReady={onGridReady}
              gridRef={gridRef}
              pagination={false}
              paginationPageSize={null}
            />
          </div>
        </Grid>
        <Grid item
          xs={9}
          md={9}
          sx={{ position: "relative" }}
          style={{ paddingLeft: "10px" }}>
          <Box style={{ height: "65vh", minWidth: "56vw", width: "100%", padding: 10 }} border={2} borderColor="grey.300" borderRadius={4} padding={2}>
            <h3>Role Menu List</h3>
            <div style={{ height: 445, overflowY: 'auto' }}>
              <TreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
              >
                {roleMenuData && roleMenuData?.length > 0 && roleMenuData?.map((node) => renderTree(node, handleChange))}
              </TreeView>
            </div>
          </Box>
        </Grid>
      </div>
      <Box sx={{ textAlign: "center" }}>
        <Button
          variant="outlined"
          size="medium"
          onClick={() => {
            onSaveRole()
          }}
          style={{
            cursor: "pointer",
            marginLeft: 10,
            padding: "2px 20px",
            borderRadius: 6,
            color: "#fff",
            borderColor: "#00316a",
            backgroundColor: "#00316a",
          }}
        >
          Submit
        </Button>
     
      </Box >
      <Dialog open={editModal} onClose={handleCloseEdit} aria-describedby="alert-dialog-slide-description" maxWidth="lg" >
        <DialogTitle id="alert-dialog-title" className="title-model">
          Edit Role
        </DialogTitle>
        <DialogContent style={{ width: "450px" }}>
          <TextField
            id="editname"
            name="editname"
            variant="outlined"
            type="text"
            value={editRole?.role_Name || ""}
            size="small"
            onChange={handleEditName}
          />
        </DialogContent>
        <DialogActions className="button-wrap">
          <Button className="yes-btn" onClick={UpdateRole}
          >Submit</Button>
          <Button className="no-btn" onClick={handleCloseEdit}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}