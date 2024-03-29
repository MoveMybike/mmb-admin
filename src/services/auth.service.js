import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL+'/api/auth/';

class AuthService {
  login(username, password) {
    return axios
      .post(API_URL + "signin", {
        username,
        password
      })
      .then(response => {
        if (response.data.jwt) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }

        return response.data;
      });
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(username, email, password,firstname,lastname,mobilenum) {
    return axios.post(API_URL + "signup", {
      username,
      email,
      password,
      firstname,
      lastname,
      mobilenum
    });
  }
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));;
  }
}

export default new AuthService();
