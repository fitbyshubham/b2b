import {
  Avatar,
  CardActionArea,
  CardContent,
  CardMedia,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
} from '@material-ui/core'
import React, { useContext, useState } from 'react'
import { CgMore } from 'react-icons/cg'
import { RiDeleteBin6Line } from 'react-icons/ri'
import { FiEdit } from 'react-icons/fi'
import { FcDownload } from 'react-icons/fc'
import { saveAs } from 'file-saver'
import Card from './Card'
import recordedLecture from '../../Assets/Images/recordedLectureBg.png'
import videoProfilePicPlaceholder from '../../Assets/Images/videoProfilePicPlaceholder.png'
import edviLogoBlue from '../../Assets/Images/edvi-logo-blue-small.png'
import { DisplayDate } from '../../Global/Functions'
import BootstrapTooltip from '../Tooltips/BootstrapTooltip'
import UpdateRecordedVideoName from '../Dialogs/UpdateRecordedVideoName'
import { AuthContext } from '../../Context/AuthContext'
import { BatchContext } from '../../Context/BatchContext'
import VideoPlayerDialog from '../Dialogs/VideoPlayerDialog'
import ConfirmDialog from '../Dialogs/ConfirmDialog'

function RecordedVideoCard({
  startedAt,
  endedAt,
  filename,
  title,
  index,
  id,
  batch_id,
}) {
  const classes = useStyles()
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [recordMenu, setRecordMenu] = useState(null)
  const { authState } = useContext(AuthContext)
  const { GetRecordingForPlaying, DeleteRecording, batchByCode } =
    useContext(BatchContext)
  const [videoURL, setVideoURL] = useState(null)
  const [confirmationDialog, setConfirmationDialog] = useState(false)

  const handleOpenMenu = (e) => {
    setRecordMenu(e.currentTarget)
  }

  const handleCloseMenu = () => {
    setRecordMenu(null)
  }

  const handleEditTitle = () => {
    setOpenEditDialog(true)
  }

  const playVideo = async () => {
    const res = await GetRecordingForPlaying(filename)
    if (!res || !res.status === 200) return
    setVideoURL(res.data.url)
  }

  const onClose = () => {
    setVideoURL(null)
  }

  const handleOpenConfirmation = () => {
    setConfirmationDialog(true)
  }

  const deleteNote = async () => {
    await DeleteRecording(id)
  }

  const downloadFile = async () => {
    const res = await GetRecordingForPlaying(filename)
    saveAs(res.data.url)
  }

  return (
    <>
      <Card style={{ height: '100%' }}>
        <CardActionArea onClick={playVideo}>
          <CardMedia
            component="img"
            height="auto"
            alt="thumbnail"
            image={recordedLecture}
          />
          <div className={`flex-column ${classes.contentContainer}`}>
            <Avatar
              src={
                authState.role === 'T'
                  ? authState.avatar
                  : batchByCode.owner_avatar || videoProfilePicPlaceholder
              }
              className={classes.contentImage}
              style={{ width: 70, height: 70 }}
            />

            <p className={`text-align-center bold ${classes.recordedtext}`}>
              Class Recordings by
            </p>
            <p className={`text-align-center bolder ${classes.nametext}`}>
              {authState.role === 'T' ? authState.name : batchByCode.owner_name}
            </p>
          </div>
          <div className={`flex-row ${classes.poweredBy}`}>
            <span className={classes.bluetext}>Powered by</span>
            <img
              src={edviLogoBlue}
              alt="edvi"
              height="17"
              width="40"
              className={classes.logoImg}
            />
          </div>
        </CardActionArea>
        <CardContent className={classes.cardContent}>
          <div
            onClick={playVideo}
            onKeyDown={playVideo}
            role="button"
            tabIndex={0}
            className={classes.nameDiv}
          >
            <div>
              {title ? (
                title.length > 24 ? (
                  <BootstrapTooltip title={title} placement="top">
                    <p className={classes.cardTitle}>{`${title.substring(
                      0,
                      24,
                    )}..`}</p>
                  </BootstrapTooltip>
                ) : (
                  <p className={classes.cardTitle}>{title}</p>
                )
              ) : (
                <p className={classes.cardTitle}>
                  {`Class Recording ${index + 1}`}
                </p>
              )}
            </div>
            <div>
              <p className={classes.cardDate}>
                <span>
                  {Math.ceil((endedAt - startedAt) / 60)}{' '}
                  {Math.ceil((endedAt - startedAt) / 60) > 1 ? 'mins' : 'min'}
                </span>{' '}
                | <span>{DisplayDate(startedAt * 1000, true)}</span>
              </p>
            </div>
          </div>
          <div className="flex-row">
            <div>
              <IconButton
                aria-label="settings"
                className={classes.moreIcon}
                onClick={downloadFile}
              >
                <FcDownload size={18} />
              </IconButton>
            </div>
            {authState.role === 'T' && (
              <div>
                <IconButton
                  aria-label="settings"
                  className={classes.moreIcon}
                  onClick={handleOpenMenu}
                  style={{ marginLeft: '0.5rem' }}
                >
                  <CgMore size={18} />
                </IconButton>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {openEditDialog && authState.role === 'T' && (
        <UpdateRecordedVideoName
          open={openEditDialog}
          setOpen={setOpenEditDialog}
          id={id}
          title={title}
          handleCloseMenu={handleCloseMenu}
          batch_id={batch_id}
        />
      )}
      {authState.role === 'T' && (
        <Menu
          id="batch-menu"
          anchorEl={recordMenu}
          keepMounted
          open={Boolean(recordMenu)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={() => handleEditTitle()}>
            <FiEdit style={{ padding: '0 5px' }} />
            Edit Title
          </MenuItem>
          <MenuItem onClick={() => handleOpenConfirmation()}>
            <RiDeleteBin6Line style={{ padding: '0 5px' }} />
            Delete Recording
          </MenuItem>
        </Menu>
      )}
      {Boolean(videoURL) && (
        <VideoPlayerDialog
          open={Boolean(videoURL)}
          onClose={onClose}
          URL={videoURL}
          title={title}
        />
      )}
      <ConfirmDialog
        open={confirmationDialog}
        setOpen={setConfirmationDialog}
        title="Delete Recording"
        content="Are you sure you want to delete this recording?"
        yesAction={deleteNote}
        noAction={() => setConfirmationDialog(false)}
      />
    </>
  )
}

export default RecordedVideoCard

const useStyles = makeStyles({
  cardContent: {
    padding: '0.5rem 1rem !important',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 600,
  },
  cardDate: {
    color: '#666',
    fontSize: '0.75rem',
  },
  moreIcon: {
    padding: 7,
    backgroundColor: '#f2f5ff',
  },
  nameDiv: {
    width: '100%',
    cursor: 'pointer',
  },
  contentContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -60%)',
    justifyContent: 'center',
  },
  contentImage: {
    margin: '0 auto',
    height: '20%',
    maxHeight: '20%',
  },
  nametext: {
    fontSize: '1.1rem',
    color: '#638ee4',
  },
  bluetext: {
    color: '#2e56a2',
    marginTop: 10,
    marginRight: 3,
    fontSize: 10,
  },
  recordedtext: {
    marginTop: 10,
  },
  poweredBy: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: '2%',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  logoImg: {
    marginBottom: -4,
  },
})
