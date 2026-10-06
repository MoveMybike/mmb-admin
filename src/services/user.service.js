import axios from 'axios';
import authHeader from './auth-header';

const API_URL = process.env.REACT_APP_BACKEND_URL+'/v1/admin/';
const user = JSON.parse(localStorage.getItem('user'));
const API_CUS_URL = process.env.REACT_APP_BACKEND_URL+'/v1/cus/';

class UserService {
  // getPublicContent() {
  //   return axios.get(API_URL + 'all');
  // }
  getFromCities() {
    return axios.get(API_URL + 'getfromcity', { headers: {Authorization: 'Bearer ' + user.jwt} })
    .then(response => {
      console.log("response", response);
      if (response.data) {
        localStorage.setItem("getfromcity", JSON.stringify(response.data));
      }
      return response.data;
    });
  }
  getToCities() {
    return axios.get(API_URL + 'gettocity', { headers: {Authorization: 'Bearer ' + user.jwt} })
    .then(response => {
      console.log("response", response);
      if (response.data) {
        localStorage.setItem("gettocity", JSON.stringify(response.data));
      }
      return response.data;
    });
  }
  addFromCities(data) {
    return axios.post(API_URL + 'addfromcity', data, { headers: {Authorization: 'Bearer ' + user.jwt} })
    .then(response => {
      if (response.data) {
        localStorage.setItem("addfromcity", JSON.stringify(response.data));
      }
      return response.data;
    });
  }
updateFromCities(data) {
    return axios.put(API_URL + 'updatefromcity', data, { headers: {Authorization: 'Bearer ' + user.jwt} })
    .then(response => {
      if (response.data) {
        localStorage.setItem("updatefromcity", JSON.stringify(response.data));
      }
      return response.data;
    });
  }
  updateToCities(data) {
    return axios.put(API_URL + 'updatetocity', data, { headers: {Authorization: 'Bearer ' + user.jwt} })
    .then(response => {
      if (response.data) {
        localStorage.setItem("updatetocity", JSON.stringify(response.data));
      }
      return response.data;
    });
  }
  addToCities(data) {
    return axios.post(API_URL + 'addtocity', data, { headers: {Authorization: 'Bearer ' + user.jwt} })
    .then(response => {
      if (response.data) {
        localStorage.setItem("addtocity", JSON.stringify(response.data));
      }
      return response.data;
    });
  }
  

  getUserBoard() {
    return axios.get(API_URL + 'user', { headers: authHeader() });
  }

  getModeratorBoard() {
    return axios.get(API_URL + 'mod', { headers: authHeader() });
  }

  getAdminBoard() {
    return axios.get(API_URL + 'admin', { headers: authHeader() });
  }
  // direction: "FROM" (bookings originating in the city) | "TO" (bookings destined for it).
  // Ignored by the backend for city-scoped roles' city, which is locked to their own.
  getAllBookings(page = 0, size = 50, direction = "FROM"){
    return axios.get(API_URL + 'getAllBooking', {
      headers: {Authorization: 'Bearer ' + user.jwt},
      params: { page, size, direction },
    })
    .then(response => {

      if (response.data) {
        localStorage.setItem("AllBooking", JSON.stringify(response.data));
      }
      return response.data;
    });
  }
  getPartialBookings(page = 0, size = 50){
    return axios.get(API_URL + 'getEnq', {
      headers: {Authorization: 'Bearer ' + user.jwt},
      params: { page, size },
    })
    .then(response => {

      if (response.data) {
        localStorage.setItem("EnquiryData", JSON.stringify(response.data));
      }
      return response.data;
    });
  }

  getAllPrices(){
    return axios.get(API_URL + 'getPrice', { headers: {Authorization: 'Bearer ' + user.jwt} })
    .then(response => {
      if (response.data) {
        localStorage.setItem("getPrice", JSON.stringify(response.data));
      }
      return response.data;
    });
  }

  approveBookings(bookingId,trackingStatus,approveStatus,postponedDate,comments){
    const params = {
      bookingID: bookingId,
      trackingStatus: trackingStatus,
      approveStatus: approveStatus,  // Ensure the approveStatus is included here
    };
    if (postponedDate) {
      params.postponedDate = postponedDate;
    }
    if (comments) {
      params.comments = comments;
    }
    return axios.post(API_URL + 'approvebooking',null, { headers: {Authorization: 'Bearer ' + user.jwt},
      params, })
    .then(response => {
      
      if (response.data) {
        localStorage.setItem("AllBooking", JSON.stringify(response.data));
      }
      return response.data;
    });
  }
 
  approveEnqiry(enqId, enqStatus){

    return axios.post(API_URL + 'apporvenquirey',null, { headers: {Authorization: 'Bearer ' + user.jwt},
      params: {
        approveStatus: enqStatus,
        enquiryID: enqId
      }, })
    .then(response => {
      
      if (response.data) {
        localStorage.setItem("EnquiryData", JSON.stringify(response.data));
      }
      return response.data;
    });
  }
  getFromAndToCities() {
    return axios.get(API_CUS_URL + 'home')
    .then(response => {
      if (response.data) {
        localStorage.setItem("cityData", JSON.stringify(response.data));
      }
      return response.data;
    });
  }

  getPricesByFromCity(fromCityId) {
    return axios.get(API_URL + 'fromcityprice', {
      headers: {Authorization: 'Bearer ' + user.jwt},
      params: { fromcityid: fromCityId },
    })
    .then(response => {
      if (response.data) {
        localStorage.setItem("fromCityPrice", JSON.stringify(response.data));
      }
      return response.data;
    });
  }

  updatePrice(priceData) {
    return axios.put(API_URL + 'updatepice', priceData, {
      headers: {Authorization: 'Bearer ' + user.jwt},
    })
    .then(response => response.data);
  }
  
  getFromAndToCitiesPrice = async (fromCityId, toCityId) => {
    try {
      const response = await axios.get(
        `${API_CUS_URL}fromtoprice?tocityId=${toCityId}&fromcityid=${fromCityId}`
      );
      if (response.data) {
        localStorage.setItem("priceData", JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching price details", error);
    }
  };
  

  addBooking(formData){
    return axios.post(API_URL + 'addbooking', formData, {
      headers: {Authorization: 'Bearer ' + user.jwt},
    })
    .then(response => {
      if (response.data) {
        localStorage.setItem("AllBooking", JSON.stringify(response.data));
      }
      return response.data;
    });
  }

  updateBooking(bookingData){
    return axios.put(API_URL + 'editBooking', bookingData, {
      headers: {Authorization: 'Bearer ' + user.jwt},
    })
    .then(response => {
      if (response.data) {
        localStorage.setItem("AllBooking", JSON.stringify(response.data));
      }
      return response.data;
    });
  }

  getDashboardCounts(){
    return axios.get(API_URL + 'dashboardStats', {
      headers: {Authorization: 'Bearer ' + user.jwt},
    })
    .then(response => response.data);
  }

  getBookingsByStatus(bookingStatus){
    return axios.get(API_URL + 'getBookingByStatus', {
      headers: {Authorization: 'Bearer ' + user.jwt},
      params: { bookingStatus },
    })
    .then(response => response.data);
  }

  convertBooking(formData,enqId){
    const payload = {
     formData:formData
    };
    return axios.post(API_URL + 'bookingconvert',formData, { headers: {Authorization: 'Bearer ' + user.jwt},
      params: {
        enquiryID: enqId
      }, })
    .then(response => {
      
      if (response.data) {
        localStorage.setItem("AllBooking", JSON.stringify(response.data));
      }
      return response.data;
    });
  }
  addEnquiry(formData){
    const payload = {
     formData:formData
    };
    return axios.post(API_CUS_URL + "createeq",formData)
    .then(response => {

      if (response.data) {
        localStorage.setItem("NewEnquiry", JSON.stringify(response.data));
      }
      return response.data;
    });
  }

  // ---------------------------------------------------------------------------
  // User management
  // TODO(endpoints): confirm the real paths / payload shapes with the backend.
  // Current assumptions (all under API_URL = `${BACKEND}/v1/admin/`):
  //   GET  listusers?page=&size=&status=    -> { content: [{ id, username,
  //                                              firstname, lastname, email,
  //                                              mobilenum, fromCityId,
  //                                              fromLocation,
  //                                              roles: ["ROLE_ADMIN", ...],
  //                                              status: "Y" | "N" }],
  //                                              totalCount }
  //        status: "Y" (active) | "N" (inactive) | omitted (all)
  //   POST addUser            body: user object (see AddUserPopup)
  //   PUT  updateuser         body: user object with id, WITHOUT username/password
  //   PUT  updateUserStatus?userID=<id>&status=<"Y"|"N">
  // ---------------------------------------------------------------------------
  getUsers(page = 0, size = 50, status){
    const params = { page, size };
    if (status) {
      params.status = status;
    }
    return axios.get(API_URL + 'listusers', {
      headers: {Authorization: 'Bearer ' + user.jwt},
      params,
    })
    .then(response => response.data);
  }

  addUser(userData){
    return axios.post(API_URL + 'addUser', userData, {
      headers: {Authorization: 'Bearer ' + user.jwt},
    })
    .then(response => response.data);
  }

  // Username and password are immutable on edit and are not part of userData.
  updateUser(userData){
    return axios.put(API_URL + 'updateuser', userData, {
      headers: {Authorization: 'Bearer ' + user.jwt},
    })
    .then(response => response.data);
  }

  updateUserStatus(userId, status){
    return axios.put(API_URL + 'updateUserStatus', null, {
      headers: {Authorization: 'Bearer ' + user.jwt},
      params: { userID: userId, status },
    })
    .then(response => response.data);
  }
}


export default new UserService();
