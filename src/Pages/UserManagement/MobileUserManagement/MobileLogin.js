import React from 'react'
import SwitchAuth from '../../../Components/SwitchAuth/SwitchAuth'
import EmailLogin from '../EmailLogin/EmailLogin'

const MobileLogin = () => (
  <>
    <EmailLogin />
    <SwitchAuth authType="register" />
  </>
)

export default MobileLogin
