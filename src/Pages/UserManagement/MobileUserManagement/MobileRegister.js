import React from 'react'
import SwitchAuth from '../../../Components/SwitchAuth/SwitchAuth'
import MasterForm from '../Register/MasterForm/MasterForm'

const MobileRegister = ({ openDrawer, setOpen }) => (
  <>
    <MasterForm openDrawer={openDrawer} setOpen={setOpen} />
    <SwitchAuth authType="login" />
  </>
)

export default MobileRegister
