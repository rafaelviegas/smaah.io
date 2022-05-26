import _ from '@lodash';
import Badge from '@mui/material/Badge';

import IconButton from '@mui/material/IconButton';
import { memo} from 'react';


function Temperature(props) {

  return (
    <IconButton className="w-40 h-40" size="large">
        <Badge> {props.value}°C</Badge>
    </IconButton>
  );
}

export default memo(Temperature);
