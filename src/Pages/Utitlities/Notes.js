import React, { useState, useContext } from 'react'
import { IconButton, Menu, MenuItem, MenuList } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { FcDownload } from 'react-icons/fc'
import { saveAs } from 'file-saver'
import { AiOutlineDelete } from 'react-icons/ai'
import { FiEdit, FiMoreHorizontal } from 'react-icons/fi'
import ShareDialog from '../../Components/Dialogs/ShareDialog'
import ConfirmDialog from '../../Components/Dialogs/ConfirmDialog'
import { BatchContext } from '../../Context/BatchContext'
import { ConvertTime } from '../../Global/Functions'
import BootstrapTooltip from '../../Components/Tooltips/BootstrapTooltip'
import UploadDialog from '../../Components/Dialogs/UploadDialog'

const Notes = ({
  date,
  allBatchStudents,
  role,
  file,
  name,
  note_id,
  type,
  batch,
}) => {
  const classes = useStyles()
  const [openShareDialog, setOpenShareDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [notesMenu, setNotesMenu] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)
  const openInNewTab = (file_url) => {
    const newWindow = window.open(file_url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
  }
  const handleCloseShareDialog = () => {
    setOpenShareDialog(false)
  }
  const { DeleteNotes } = useContext(BatchContext)
  const handleDeleteNote = async () => {
    await DeleteNotes(note_id, type)
    setOpenShareDialog(false)
  }

  const handleOpenNotesMenu = (event) => {
    setNotesMenu(event.currentTarget)
  }

  const handleCloseNotesMenu = () => {
    setNotesMenu(false)
  }

  const handleMenuClose = () => {
    handleCloseNotesMenu()
    setOpenMenu(false)
  }

  const time = (T) => {
    const arr = T.split(':')
    return `${arr[0]}:${arr[1]} ${arr[2].split(' ')[1] || ''}`
  }

  return (
    <>
      <div className={classes.container}>
        <div className={classes.action}>
          <div
            role="button"
            tabIndex="0"
            onClick={() => openInNewTab(file)}
            onKeyDown={() => openInNewTab(file)}
            className="cursor-pointer"
          >
            <div>
              {name.length < 18 ? (
                <p className={classes.title}>{name}</p>
              ) : (
                <BootstrapTooltip title={name} placement="top">
                  <p className={classes.title}>{`${name.substring(
                    0,
                    18,
                  )}...`}</p>
                </BootstrapTooltip>
              )}
            </div>
            <p className={classes.date}>
              {`${ConvertTime(date).toLocaleDateString()} | ${time(
                ConvertTime(date).toLocaleTimeString(),
              )}` || 'No Date'}
            </p>
          </div>
          <div>
            <BootstrapTooltip title="Save File" placement="bottom">
              <IconButton
                size="small"
                className={classes.icon}
                onClick={() => {
                  saveAs(file)
                }}
              >
                <FcDownload />
              </IconButton>
            </BootstrapTooltip>
            {role === 'T' && (
              <IconButton
                size="small"
                className={classes.icon}
                onClick={(e) => handleOpenNotesMenu(e)}
              >
                <FiMoreHorizontal />
              </IconButton>
            )}
          </div>
        </div>
        <Menu
          id="notes-menu"
          anchorEl={notesMenu}
          keepMounted
          open={Boolean(notesMenu)}
          onClose={handleCloseNotesMenu}
        >
          <MenuList>
            {role === 'T' ? (
              <div>
                <MenuItem onClick={() => setOpenMenu(true)}>
                  <FiEdit className={classes.menuItemStyle} />
                  Edit Title
                </MenuItem>
                <MenuItem onClick={() => setOpenConfirmDialog(true)}>
                  <AiOutlineDelete className={classes.menuItemStyle} />
                  Delete Note
                </MenuItem>
              </div>
            ) : null}
          </MenuList>
        </Menu>
        <UploadDialog
          open={openMenu}
          closeDialog={handleMenuClose}
          title="Note Title"
          id={batch}
          noteId={note_id}
          dialogType="edit"
          note_title={name}
          type={type}
        />
        <ShareDialog
          open={openShareDialog}
          closeDialog={handleCloseShareDialog}
          allBatchStudents={allBatchStudents}
        />
        <ConfirmDialog
          open={openConfirmDialog}
          setOpen={setOpenConfirmDialog}
          title="Delete Note"
          content="Are you sure you want to delete this note?"
          yesAction={handleDeleteNote}
          noAction={() => setOpenConfirmDialog(false)}
        />
      </div>
    </>
  )
}
const useStyles = makeStyles(() =>
  createStyles({
    container: {
      backgroundColor: '#fff',
      padding: '10px 20px',
      boxShadow: '2px 4px 6px 2px rgba(0, 0, 0, 0.06)',
      borderRadius: 8,
    },
    image: {
      backgroundColor: '#D8D8D8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 100,
      borderRadius: '5%',
    },
    action: {
      marginTop: 8,
      padding: '0px 5px',
      display: 'flex',
      alignItems: ' center',
      justifyContent: 'space-between',
      '&:hover': {
        cursor: 'pointer',
      },
    },
    title: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
    },
    date: {
      fontSize: '0.8rem',
      marginTop: 2,
      color: 'grey',
    },
    icon: {
      backgroundColor: '#F2F2FD',
      marginLeft: 10,
    },
    menuItemStyle: {
      padding: '0 5px',
    },
  }),
)
export default Notes
