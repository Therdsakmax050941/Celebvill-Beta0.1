import React, { Suspense, useEffect } from "react";

// routing
import { Switch, BrowserRouter, Route } from "react-router-dom";
//redux
import { useDispatch, useSelector } from "react-redux";
//types
import { SET_ADMIN, UNSET_ADMIN } from "./store/admin/types";

import { IdleTimeoutManager } from "idle-timer-manager";

//Components
import Login from "./pages/LoginPage";
import UnlockScreenPage from "./pages/UnlockScreenPage";
import Page404 from "./pages/Page404";
import Admin from "./pages/Admin";
import AuthRouter from "./util/AuthRouter";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";

function App() {
  const dispatch = useDispatch();
  const { isAuth } = useSelector((state) => state.admin);
  const token = localStorage.getItem("TOKEN");

  const key = localStorage.getItem("KEY");

  useEffect(() => {
    if (!token && !key) return;
    dispatch({ type: SET_ADMIN, payload: token });
  }, [token, key, dispatch]);

  useEffect(() => {
    const manager = new IdleTimeoutManager({
      timeout: 1800, //30 min (in sec)
      onExpired: (time) => {
        dispatch({ type: UNSET_ADMIN });
        return (window.location.href = "/");
      },
    });

    return () => {
      manager.clear();
    }; //eslint-disable-next-line
  }, []);

  return (
    <div className="App">
      <Suspense fallback={""}>
        <BrowserRouter>
          <Switch>
            <AuthRouter exact path="/" component={Login} />

            <AuthRouter  exact path="/unlock" component={UnlockScreenPage} />
            <Route exact path="/forgot" component={ForgotPassword} />
            <Route
              exact
              path="/changePassword/:id"
              component={ChangePassword}
            />
            {isAuth && <Route path="/admin" component={Admin} />}
            <Route component={Page404} />
          </Switch>
        </BrowserRouter>
      </Suspense>
    </div>
  );
}

export default App;
