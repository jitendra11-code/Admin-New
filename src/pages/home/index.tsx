import React, { useEffect, useState } from "react";
import {
  Button,
  MenuItem,
  Card,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Grid,
} from "@mui/material";
import Dummy from "../common-components/Table";
import Slider from "react-slick";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import Timeline from "pages/common-components/Timeline";
// import img1 from "../../../public/assets/images/logo.png"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./style.css";
import homeImage1 from "./HomePageImages/home1.png";
import homeImage2 from "./HomePageImages/home2.png";
import homeImage3 from "./HomePageImages/home3.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { setUserMenuList, setUserMenuOriginalList } from "redux/actions/MenuAction";
import groupBy from "pages/common-components/jsFunctions/groupBy";
import MenuImageDirectory from "@uikit/common/Menu/MenuImageRepo";
import { useDispatch } from "react-redux";
import { useUrlSearchParams } from "use-url-search-params";

const homepageImages = [
  {
    imageSrc:
      homeImage1
  },
  {
    imageSrc:
      homeImage2
  },
  {
    imageSrc:
      homeImage3
  },
];

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
};

const Home = () => {
  const location = useLocation();
  const [params] = useUrlSearchParams({}, {});
  console.log("location",location,params)
  const defaultModule = localStorage.getItem("defaultModule");
  const moduleList = localStorage.getItem("moduleList");
  var arrayModuleList = moduleList.split(",");
  // const [module,setModule]= useState(()=>{
  //   const storedModule = sessionStorage.getItem('module');
  //   return storedModule ? storedModule : ""
  // });
  const moduleValue = "";
  localStorage.setItem("moduleValue",moduleValue);
  let navigate = useNavigate();
  const dispatch = useDispatch();
  
 

  const _getChildrentMenuList = (menuList, id) => {
    console.log('menuList',menuList,id)
    var item =
      menuList &&
      menuList?.length > 0 &&
      menuList?.filter((item) => item?.Parent_id === id);
      console.log('item',item)
    return item || [];  
  };

  const _generateMenuIcon = (iconName) => {
    var iconNode = null;
    iconNode =
      MenuImageDirectory &&
      MenuImageDirectory?.find((item) => item?.iconName === iconName);
    return (iconNode && iconNode?.iconNode) || null;
  };

  const _generateChildrenList = (list) => {
    var _list = [];
    _list =
      list &&
      list?.length > 0 &&
      list?.map((item) => {
        return {
          id: item?.id,
          title: item?.menuname || "",
          messageId: item?.id || "",
          apiType: item?.apitype || "",
          type: "item",
          exact: false,
          icon: _generateMenuIcon(item?.icons),
          url: item?.menuroute,
        };
      });
    return _list || [];
  };

  const _generateMenuList = async (menuList) => {
    var _json = [];
    var _menulist = groupBy(menuList, "isparent");
    if (_menulist?._parentMenu === null) {
      _json =
        menuList &&
        menuList?.map((item) => {
          return {
            id: item?.id,
            title: item?.menuname || "",
            messageId: item?.id || "",
            apiType: item?.apitype || "",
            exact: false,
            type: "item",
            icon: _generateMenuIcon(item?.icons),
            url: item?.menuroute,
          };
        });

      return _json || [];
    }
    _json =
      _menulist?._parentMenu &&
      _menulist?._parentMenu?.values &&
      _menulist?._parentMenu?.values?.length > 0 &&
      _menulist?._parentMenu?.values?.map((parent, parentKey) => {
        var childMenu = _getChildrentMenuList(
          _menulist?._childMenu?.values,
          parent?.id
        );
        return {
          ...parent,
          children: childMenu && childMenu?.length > 0 ? childMenu : [],
        };
      });
    _json =
      (await _json) &&
      _json?.length > 0 &&
      _json?.map((item, key) => {
        if (item && item?.children && item?.children?.length > 0) {
          return {
            id: item?.id,
            title: item?.menuname || "",
            messageId: item?.id || "",
            apiType: item?.apitype || "",
            type: "collapse",
            exact: false,
            icon: _generateMenuIcon(item?.icons),
            url: item?.menuroute,
            children: _generateChildrenList(item?.children),
          };
        }

        return {
          id: item?.id,
          title: item?.menuname || "",
          messageId: item?.id || "",
          apiType: item?.apitype || "",
          exact: false,
          type: "item",
          icon: _generateMenuIcon(item?.icons),
          url: item?.menuroute,
        };
      });
    return _json || [];
  };

  

  const getMenuList = async () => {
   
    
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/RoleMenuList/RoleMenuList?module=${defaultModule}`)
      .then((response) => {
        if (response?.data && response?.data?.length > 0) {
          var _response = response?.data?.map((item) => {
            return {
              ...item,
              path: item?.menuroute || "",
            };
          });
          dispatch(setUserMenuOriginalList(_response || []));
          _generateMenuList(response?.data).then((res) => {
            dispatch(setUserMenuList(res));
          });
        }
      })
      .catch((err) => { });
   
  };
// console.log('menuList',menuList)
  useEffect(() => {
      if (moduleValue == "" ) {
        getMenuList();
      } 
      // sessionStorage.setItem('module', module); 
  }, [moduleValue])
  
  console.log('module',moduleValue)

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ overflow: "hidden" }}>
        <Slider {...sliderSettings}>
          {homepageImages &&
            homepageImages?.length > 0 &&
            homepageImages?.map((card, index) => (
              <div key={index}>
                <img src={card.imageSrc} />
              </div>
            ))}
        </Slider>
      </div>

      <Grid
        container
        item
        justifyContent="space-between"
        alignSelf="center"
        sx={{ paddingTop: "10px" }}
      >
        <Button disabled = {arrayModuleList.includes("Branch Management") == false}>
          <Card
            sx={arrayModuleList.includes("Branch Management") == false && { opacity: 0.5 }}
            onClick={() => {
              
              // setModule("Branch Management");
              navigate("/home/Branch_Management");
              // getMenuList();
            }}
            className={"BoxOuter"}
          >
            <Typography>
              Branch <br />
              Management
            </Typography>
          </Card>
        </Button>
        <Button disabled = {arrayModuleList.includes("Branch Onboarding") == false}>
          <Card
            sx={arrayModuleList.includes("Branch Onboarding") == false && { opacity: 0.5 }}
            onClick={() => {
              navigate("/home/Branch_Onbording");
              // setModule("Branch Onboarding")
            }}
            className={"BoxOuter" }
          >
            
              <Typography>
                Branch <br />
                Onboarding
              </Typography>
            
          </Card>
        </Button>
        <Button disabled = {arrayModuleList.includes("Asset Management") == false}> 
          <Card
            sx={arrayModuleList.includes("Asset Management") == false && { opacity: 0.5 }}
            onClick={() => {
              navigate("/home/Asset_Management");
              // setModule("Asset Management")
            }}
            className={"BoxOuter"}
          >
            <Typography>
              Asset <br />
              Management
            </Typography>
          </Card>
        </Button>
        <Button disabled> 
          <Card
            sx={{ opacity: 0.5 }}
            onClick={() => {
              // navigate("/list/task");
              // setModule("Budget Management");
            }}
            className="BoxOuter"
          >
            <Typography>
              Budget <br />
              Management
            </Typography>
          </Card>
        </Button>
        <Button disabled = {arrayModuleList.includes("Branch Master") == false}> 
          <Card
            sx={arrayModuleList.includes("Branch Master") == false && { opacity: 0.5 }}
            onClick={() => {
              navigate("/home/Branch_Master");
              // setModule("Asset Management")
            }}
            className={"BoxOuter"}
          >
            <Typography>
             Branch <br />
              Master
            </Typography>
          </Card>
        </Button>
        <Button disabled> 
          <Card
            sx={{ opacity: 0.5 }}
            onClick={() => {
              // navigate("/list/task");
              // setModule("Administration");
            }}
            className="BoxOuter"
          >
            <Typography>Administration 
              <br />
              <br />
            </Typography>
          </Card>
        </Button>
        <Button disabled = {arrayModuleList.includes("Reports") == false}> 
          <Card
            sx={arrayModuleList.includes("Reports") == false && { opacity: 0.5 }}
            onClick={() => {
              navigate("/home/Reports");
              // setModule("Asset Management")
            }}
            className={"BoxOuter"}
          >
            <Typography>
              Reports
              <br />
              <br />
            </Typography>
          </Card>
        </Button>
      </Grid>

    </div>
  );
};
export default Home;
