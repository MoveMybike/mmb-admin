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
    return axios.get(API_CUS_URL + 'getfromcity', { headers: {Authorization: 'Bearer ' + user.jwt} })
    .then(response => {
      if (response.data) {
        localStorage.setItem("getfromcity", JSON.stringify(response.data));
      }
      return response.data;
    });
  }
  getToCities() {
    return axios.get(API_CUS_URL + 'gettocity', { headers: {Authorization: 'Bearer ' + user.jwt} })
    .then(response => {
      if (response.data) {
        localStorage.setItem("gettocity", JSON.stringify(response.data));
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
  getAllBookings(){
    return axios.get(API_URL + 'getAllBooking', { headers: {Authorization: 'Bearer ' + user.jwt} })
    .then(response => {
      
      if (response.data) {
        localStorage.setItem("AllBooking", JSON.stringify(response.data));
      }
      return response.data;
    });
  }
  getPartialBookings(){
    return axios.get(API_URL + 'getPage1ByDays', { headers: {Authorization: 'Bearer ' + user.jwt} })
    .then(response => {
      
      if (response.data) {
        localStorage.setItem("EnquiryData", JSON.stringify(response.data));
      }
      return response.data;
    });
  }
  approveBookings(bookingId,trackingStatus,approveStatus){
    const payload = {
      bookingId: bookingId,
      trackingStatus: trackingStatus,
      approveStatus: approveStatus,
    };
    return axios.post(API_URL + 'approvebooking',null, { headers: {Authorization: 'Bearer ' + user.jwt},
      params: {
        bookingID: bookingId,
        trackingStatus: trackingStatus,
        approveStatus: approveStatus,  // Ensure the approveStatus is included here
      }, })
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


  convertBooking(formData){
    const payload = {
     formData:formData
    };
    return axios.post(API_CUS_URL + 'createorder',formData)
    .then(response => {
      
      if (response.data) {
        localStorage.setItem("AllBooking", JSON.stringify(response.data));
      }
      return response.data;
    });
  }
}


export default new UserService();
