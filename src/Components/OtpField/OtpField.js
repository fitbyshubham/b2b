import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core'
import Controls from '../Controls/Controls'

const OtpField = ({ otp, setOtp, handleChange }) => {
  const classes = useStyles()
  return (
    <>
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        <Grid item>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={12} className={classes.item}>
              {otp.map((data, index) => (
                <input
                  className={classes.input}
                  type="number"
                  name="otp"
                  maxLength="1"
                  key={`Input- ${index + 1}`}
                  value={data}
                  inputProps={{ maxLength: 1 }}
                  onChange={(e) => {
                    handleChange(e.target, index)
                  }}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Controls.Button onClick={() => setOtp([...otp.map(() => '')])}>
            Clear
          </Controls.Button>
        </Grid>
      </Grid>
    </>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    input: {
      maxWidth: 40,
      width: 'calc(100% - 12px)',
      height: 40,
      textAlign: 'center',
      margin: '10px 5px',
      fontSize: 20,
      fontWeight: 'bold',
      borderRadius: 5,
      border: '1px solid grey',
      '&:focus': {
        outline: 'none',
      },
    },
    item: {
      display: 'flex',
      flexWrap: 'no-wrap',
    },
  }),
)

export default OtpField
