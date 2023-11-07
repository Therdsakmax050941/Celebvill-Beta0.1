import axios from "axios";
import { Toast } from "../../util/Toast";

import { SET_ADMIN, UNSET_ADMIN, UPDATE_PROFILE } from "./types";

export const login = (data) => (dispatch) => {
  axios
    .post("admin/login", data)
    .then((res) => {
      if (res.data.status) {
        Toast("success", "You have successfully logged in Rayzi.");
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 3000);
        dispatch({ type: SET_ADMIN, payload: res.data.token });
      } else {
        Toast("error", res.data.message);
      }
    })
    .catch((error) =>{
    });
};

export const sendEmail = (data) => (dispatch) => {
  axios
    .post("admin/sendEmail", data)
    .then((res) => {
      if (res.data.status) {
        Toast(
          "success",
          "Mail has been sent successfully. Sometimes mail has been landed on your spam!"
        );
      } else {
        Toast("error", res.data.message);
      }
    })
    .catch((error) => Toast("error", error.message));
};

export const getProfile = () => (dispatch) => {
  axios
    .get("admin/profile")
    .then((res) => {
    
      if (res.data.status) {
        dispatch({ type: UPDATE_PROFILE, payload: res.data.admin });
      } else {
        Toast("error", res.data.message);
      }
    })
    .catch((error) => {
      console.log("error", error.message);
    });
};

export const changePassword = (data) => (dispatch) => {
  axios
    .put("admin", data)
    .then((res) => {
      if (res.data.status) {
        Toast("success", "Password changed successfully.");
        setTimeout(() => {
          dispatch({ type: UNSET_ADMIN });
          window.location.href = "/";
        }, [3000]);
      } else {
        Toast("error", res.data.message);
      }
    })
    .catch((error) => Toast("error", error.message));
};
export const updateNameEmail = (data) => (dispatch) => {
  axios
    .patch("admin", data)
    .then((res) => {
      if (res.data.status) {
        Toast("success", "Profile updated successfully.");
        dispatch({ type: UPDATE_PROFILE, payload: res.data.admin });
      } else {
        Toast("error", res.data.message);
      }
    })
    .catch((error) => Toast("error", error.message));
};
