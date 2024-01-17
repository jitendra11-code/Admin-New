import { authRouteConfig } from "./auth";
import { initialUrl } from "shared/constants/AppConst";
import Error403 from "./errorPages/Error403";
import { errorPagesConfigs } from "./errorPages";
import { routeConfigs } from "pages/Routes";
import { profilePage } from "./profile";

const authorizedStructure = {
  fallbackPath: "/signin",
  unAuthorizedComponent: <Error403 />,
  routes: [...routeConfigs, ...profilePage],
};

const unAuthorizedStructure = {
  fallbackPath: initialUrl,
  routes: authRouteConfig,
};

const anonymousStructure = {
  routes: errorPagesConfigs,
};

export { authorizedStructure, unAuthorizedStructure, anonymousStructure };
