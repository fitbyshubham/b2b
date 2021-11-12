import axios from 'axios'

const axiosPut = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  method: 'PUT',
})

export default axiosPut
