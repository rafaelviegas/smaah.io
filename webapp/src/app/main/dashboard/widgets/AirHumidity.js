import _ from '@lodash';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import { memo, useState } from 'react';


function AirHumidity(props) {


    function getColor(value){
        if(value <= 30) {
            return 'error'
        }
        if(value > 30 && value <= 55){
          return 'warning'
        }
        if(value > 55 && value <= 70){
          return 'success'
        
        } else {
            return 'info'
        }
    }
  return (
    <IconButton className="w-40 h-40" size="large">
        
        <Badge color={getColor(props.value)} variant="dot" >
            Ar
        </Badge>
    </IconButton>
  );
}

export default memo(AirHumidity);
