import _ from '@lodash';
import Slider from '@mui/material/Slider';
import { memo, useState, useEffect } from 'react';
import axios from 'axios';

function SoilMoistureSlider(props) {

    const [value, setValue] = useState(props.value);

    useEffect(() => {    
        setValue(props.value);
    }, [props.value]);

    console.log("value",value);
    
    const marks = [
        {
          value: 0,
          label: '0%'
        },
        {
          value: 100,
          label: '100%'
        },
      ];

         
      //console.log(props.client_id);

    function valuetext(value) {
        return `${value}%`;
    }

    const handleChange = (event, newValue) => {
        
        if(value !== newValue){            
            
            axios.put(process.env.REACT_APP_API_URL+'/clients/'+props.client_id,{
                minimumSoilMoisture: newValue
            })
            .then((res) => console.log(res.data));
        }
        
    };

  return (
        <Slider
            key="slider-1"
            value={value}
            getAriaValueText={valuetext}
            valueLabelFormat={valuetext}
            step={10}
            valueLabelDisplay="auto"
            marks={marks}
            onChange={handleChange}
        />
  );
}

export default memo(SoilMoistureSlider);
