import React from 'react'
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
} from '@material-ui/core'

export default function Select(props) {
  const {
    name,
    label,
    value,
    error = null,
    onChange,
    options,
    style,
    variant,
    children,
    labelStyle,
    ...other
  } = props

  return (
    <FormControl
      variant={variant || 'outlined'}
      {...(error && { error: true })}
      style={style}
    >
      <InputLabel style={labelStyle}>{label}</InputLabel>
      <MuiSelect
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        {...other}
      >
        {children}
        {options.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            {item.title}
          </MenuItem>
        ))}
      </MuiSelect>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  )
}
