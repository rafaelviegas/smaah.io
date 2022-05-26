import _ from '@lodash';
import Card from '@mui/material/Card';
import AirHumidity from './AirHumidity';
import Temperature from './Temperature';
import SoilMoistureSlider from './SoilMoistureSlider';
import Typography from '@mui/material/Typography';
import { memo, useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import socketIOClient from "socket.io-client";

function MeasurementsWidget(props) {

    const chart = {
        series: [0],
        options: {
        labels: ['Umidade do solo'],
        chart: {
            height: '100%',
            type: 'radialBar'
        },
        plotOptions: {
            radialBar: {
            startAngle: -135,
            endAngle: 225,
            hollow: {
                margin: 0,
                size: '70%',
                background: '#fff',
                image: undefined,
                imageOffsetX: 0,
                imageOffsetY: 0,
                position: 'front',
                dropShadow: {
                enabled: true,
                top: 3,
                left: 0,
                blur: 4,
                opacity: 0.24
                }
            },
            track: {
                background: '#fff',
                strokeWidth: '100%',
                margin: 0
            },
            dataLabels: {
                show: true,
                name: {
                offsetY: -10,
                show: true,
                color: '#757575',
                fontSize: '11pt'
                },
                value: {
                formatter: function(val) {
                    return val + "%";
                },
                color: "#252F3E",
                fontSize: '16pt',
                show: true
                }
            }
            },
        },
        stroke: {
            lineCap: 'round'
        },
        fill: {
            colors: [function({ value, seriesIndex, w }) {
                if(value >= 50) {
                    return '#728A00'
                }
                if(value >= 30){
                    return '#FFF310'
                }
                if(value  <= 29){
                    return '#E81403'
                
                } 
            }]
        }
        
        }
    };



    const [clientData, setclientData]= useState({...props.data, ...chart});

   
    useEffect(() => {
    
        chart.series = [getValueInPercentage(props.data?.soilMoisture)]
        setclientData({...props.data, ...chart});
        
        const socket = socketIOClient(process.env.REACT_APP_SOCKET_URL);

        socket.on("connect", () => {
          console.log(`[CLIENT_SOCKET_IO] Connected:`, socket.connected)
        })
        
        socket.on("changeData", payload => {
            
          Object.keys(payload.updateDescription.updatedFields).forEach(function(key) {

              if(key == 'updated_on')
                return;

              if('soilMoisture' == key){
                chart.series = [getValueInPercentage(payload.updateDescription.updatedFields[key])]

              }else
                props.data[key] = payload.updateDescription.updatedFields[key];
            
          });

            setclientData({...props.data, ...chart});      
        });
        
    }, [props.data]);



    function getValueInPercentage(value){

        if(typeof value !== 'undefined'){
            let val = value/4095;
            if(val < 1){
                return parseInt((1-val)*100);
            }
            else
                return 0;
        }
 
        else
            return 0;
    }

  return (
    <Card className="w-full rounded-20 shadow p-20">
      <div className="pb-24">
        <Typography className="h3 font-medium">Indicadores</Typography>
      </div>

      <div className="h-256 relative">
          {clientData ? (
        <ReactApexChart
          options={clientData.options}
          series={clientData.series}
          type={clientData.options.chart.type}
          height={clientData.options.chart.height}
        />)
        : ( <Typography>...</Typography>)}
      </div>

      <div className="flex flex-col items-center justify-between pb-12">
            <Typography>Limite:</Typography>
            <SoilMoistureSlider client_id={clientData._id} value={clientData ? clientData.minimumSoilMoisture : 0}/>
      </div>

      <div className="flex flex-row items-center justify-between">
        <Temperature value={clientData ?  clientData.temperature : 0}/>
        <AirHumidity value={clientData ? clientData.humidity : 0 }/>
      </div>
    </Card>
  );
}

export default memo(MeasurementsWidget);
