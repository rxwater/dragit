import React, { useEffect } from 'react';
import { FormControlLabel, Grid, Switch} from '@material-ui/core';
import { PropsInputProps } from './PropsEditorProps';

export default function BooleanInput(props:PropsInputProps&{
  size?:'small'|'medium'
}){
  const {label, value, xs=6, onChange, size='small', ...rest} = props;
  const [inputValue, setInputValue] = React.useState(!!value);
  
  useEffect(()=>{
    setInputValue(!!value);
  },[value])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.checked
    setInputValue(newValue);
    onChange(newValue);
  };  

  return (
    <Grid item xs = {xs}>
      <FormControlLabel
        control={
          <Switch
            checked={inputValue}
            onChange={handleChange}
            color="primary"
            size={size}
          />
        }
        style={{margin:'2px'}}
        label={<span style={{fontSize:'0.9rem'}}>{label}</span>}
        {...rest}
      />
  </Grid>
  )
}
