import axios from 'axios'

const axiosPatch = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  timeout: 30000,
  timeoutErrorMessage:
    'Request timed out, please check your internet connectivity',
  method: 'PATCH',
})

export default axiosPatch
