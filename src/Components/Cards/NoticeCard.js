import React, { useContext, useState } from 'react'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import { FiEdit, FiMoreHorizontal } from 'react-icons/fi'
import { Menu, MenuItem, MenuList } from '@material-ui/core'
import { RiDeleteBin6Line } from 'react-icons/ri'
import { BiStopwatch } from 'react-icons/bi'
import { ReturnMonth } from '../../Global/Functions'
import Card from './Card'
import ConfirmDialog from '../Dialogs/ConfirmDialog'
import { BatchContext } from '../../Context/BatchContext'
import AddNoticeDialog from '../Dialogs/AddNoticeDialog'

const NoticeCard = ({
  noticeTime,
  notice,
  role,
  id,
  batchId,
  fetchData,
  type,
  status,
}) => {
  const classes = useStyles()

  const [noticeMenu, setNoticeMenu] = useState(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [openEditNotice, setOpenEditNotice] = useState(false)

  const { DeleteNotice, GetCurrentBatchNotices } = useContext(BatchContext)

  const getDateTime = () => {
    const date = new Date(noticeTime * 1000)
    const day = date.getDate()
    const month = ReturnMonth(date.getMonth())
    const year = date.getFullYear()
    const time = formatAMPM(date)
    return `${day} ${month}, ${year} | ${time}`
  }

  const formatAMPM = (date) => {
    let hours = date.getHours()
    let minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours %= 12
    hours = hours || 12
    minutes = minutes < 10 ? `0${minutes}` : minutes
    return `${hours}:${minutes} ${ampm}`
  }

  const handleOpenNoticeMenu = (event) => {
    setNoticeMenu(event.currentTarget)
  }

  const handleCloseNoticeMenu = () => {
    setNoticeMenu(null)
  }

  const openDeleteDialog = () => {
    setShowDeleteConfirmation(true)
  }

  const handleDeleteNotice = async () => {
    const isDeleted = await DeleteNotice(id)
    handleCloseNoticeMenu()
    if (isDeleted) {
      GetCurrentBatchNotices(batchId)
    }
  }

  const handleEditNotice = () => {
    setOpenEditNotice(true)
    handleCloseNoticeMenu()
  }

  return (
    <>
      <Menu
        id="batch-menu"
        anchorEl={noticeMenu}
        keepMounted
        open={Boolean(noticeMenu)}
        onClose={handleCloseNoticeMenu}
      >
        <MenuList>
          <div>
            <MenuItem onClick={() => handleEditNotice()}>
              <FiEdit className={classes.menuItemStyle} />
              Edit Notice
            </MenuItem>
            <MenuItem onClick={() => openDeleteDialog()}>
              <RiDeleteBin6Line className={classes.menuItemStyle} />
              Delete Notice
            </MenuItem>
          </div>
        </MenuList>
      </Menu>
      <ConfirmDialog
        open={showDeleteConfirmation}
        setOpen={setShowDeleteConfirmation}
        title="Delete Notice"
        content="Are you sure you want to Delete this Notice?"
        yesAction={handleDeleteNotice}
        noAction={() => {}}
      />
      {openEditNotice && (
        <AddNoticeDialog
          notice={notice}
          noticeTime={noticeTime}
          batchId={batchId}
          noticeId={id}
          open={openEditNotice}
          setOpen={setOpenEditNotice}
          fetchData={fetchData}
          mode="Edit"
        />
      )}
      <Card className={classes.card}>
        <div className={classes.heading}>
          {type === 'scheduled' && (
            <BiStopwatch className={classes.icon} size={60} />
          )}
          <div>
            <h3 className={classes.notice}>{notice}</h3>
            <small className={classes.timeStamp}>
              {type === 'scheduled' && 'Scheduled For : '}
              {getDateTime()}
            </small>
          </div>
        </div>
        {role === 'T' && status === 'D' && (
          <div>
            <IconButton aria-label="settings" onClick={handleOpenNoticeMenu}>
              <FiMoreHorizontal />
            </IconButton>
          </div>
        )}
      </Card>
    </>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      paddingInlineStart: 15,
      paddingInlineEnd: 15,
      paddingBlock: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    notice: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    timeStamp: {
      fontSize: 13,
      color: 'grey',
    },
    menuItemStyle: {
      padding: '0 5px',
    },
    heading: {
      display: 'flex',
      alignItems: 'center',
    },
    icon: {
      margin: '0px 10px 0px 0px',
    },
  }),
)

export default NoticeCard
