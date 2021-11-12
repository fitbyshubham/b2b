import showErrorSnackbar from '../../Components/Snackbar/errorSnackbar'
import { ErrorCodes } from './errorCodes'

export default function handleError(enqueueSnackbar, err) {
  if (err?.response?.data?.code) {
    const { code } = err.response.data
    if (ErrorCodes[code].status.toString().charAt(0) === '5') {
      window.location.replace(
        `${window.location.protocol}//${window.location.hostname}${
          window.location.port ? `:${window.location.port}` : ''
        }/internal-error`,
      )
    } else {
      showErrorSnackbar(enqueueSnackbar, ErrorCodes[code].detail)
    }
  }
  // backward compatibility starts
  else if (err?.response?.status === 401) {
    if (
      err?.response?.data?.detail !== 'Given token not valid for any token type'
    )
      showErrorSnackbar(enqueueSnackbar, err.response.data.detail)
  } else if (err?.response?.status === 400) {
    const values = Object.values(err.response.data)
    values.forEach((value) => {
      showErrorSnackbar(enqueueSnackbar, value)
    })
  } else if (err?.response?.status === 404) {
    showErrorSnackbar(enqueueSnackbar, err.response.data.detail)
  } else if (err?.response?.status.toString().charAt(0) === '5') {
    window.location.replace(
      `${window.location.protocol}//${window.location.hostname}${
        window.location.port ? `:${window.location.port}` : ''
      }/internal-error`,
    )
  }
  // backward compatibility ends
  else if (!err?.response) {
    showErrorSnackbar(enqueueSnackbar, 'Your request has timed out')
  } else {
    showErrorSnackbar(
      enqueueSnackbar,
      'Something went wrong, please try contacting support!',
    )
  }
}
