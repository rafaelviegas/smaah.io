import FusePageSimple from '@fuse/core/FusePageSimple';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Box } from '@mui/system';
import axios from 'axios';
import { useEffect, useState } from 'react';
import  MeasurementsWidget  from './widgets/Measurements';


function Dashboard(props) {
  
  const [clients, setClient] = useState({selectedClient: null, all: []});

  useEffect(async() => {

    let mounted = true;

    await axios.get(process.env.REACT_APP_API_URL+'/users/6281b78d049fd9336713bdf0/clients')
      .then((items)=>{
        if(mounted){

          setClient({ selectedClient: items.data[0],  all: items.data});
        
        }
      })
    return () => mounted = false;
  },[]);

  function handleChangeProject(_id) {
    setClient({
      selectedClient: { _id, 
        client_id: clients.selectedClient.client_id,
        humidity: clients.selectedClient.humidity,
        soilMoisture: clients.selectedClient.soilMoisture,
        temperature: clients.selectedClient.temperature, 
        updated_on: clients.selectedClient.updated_on, 
        user_id: clients.selectedClient.user_id,
        menuEl: null
      },
      all: clients.all
    });
  }

  function handleOpenProjectMenu(event) {
    setClient({
      selectedClient: {
        _id: clients.selectedClient._id,
        client_id: clients.selectedClient.client_id,
        humidity: clients.selectedClient.humidity,
        soilMoisture: clients.selectedClient.soilMoisture,
        temperature: clients.selectedClient.temperature, 
        updated_on: clients.selectedClient.updated_on, 
        user_id: clients.selectedClient.user_id,
        menuEl: event.currentTarget
      },
      all: clients.all
    });
  }

  function handleCloseProjectMenu() {
    setClient({
      selectedClient: {
        _id: clients.selectedClient._id,
        client_id: clients.selectedClient.client_id,
        humidity: clients.selectedClient.humidity,
        soilMoisture: clients.selectedClient.soilMoisture,
        temperature: clients.selectedClient.temperature, 
        updated_on: clients.selectedClient.updated_on, 
        user_id: clients.selectedClient.user_id,
        menuEl: null,
      },
      all: clients.all
    });
  }


  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };



  return (
<FusePageSimple
      header={
        <div className="flex flex-col justify-between flex-1 min-w-0 px-24 pt-24">

            <div className="flex items-center mb-4">
              <Icon className="text-18" color="action">home</Icon>
              <Icon className="text-16" color="action">chevron_right</Icon>
              <Typography color="textSecondary" className="font-medium">Dashboard</Typography>
            </div>

            <Typography variant="h6" className="text-18 sm:text-24 font-semibold">
              Dispositivos
            </Typography>  
            
     
          <div className="flex items-end">
            <div className="flex items-center">
              <Box>
                  {_.find(clients.all, ['_id', clients.selectedClient?._id])?.client_id}
              </Box>

              <IconButton className="h-40 w-40 p-0" aria-haspopup="true" onClick={handleOpenProjectMenu} size="large">
                <Icon>more_horiz</Icon>
              </IconButton>

              <Menu
                id="project-menu"
                anchorEl={clients.selectedClient?.menuEl}
                open={Boolean(clients.selectedClient?.menuEl)}
                onClose={handleCloseProjectMenu}
              >
                {clients &&
                  clients.all.map((client) => (
                    <MenuItem
                      key={client._id}
                      onClick={(ev) => {
                        handleChangeProject(client._id);
                      }}
                    >
                      {client.client_id}
                    </MenuItem>
                  ))}
              </Menu>
            </div>
          </div>
        </div>
      }
    
      content={
        <div className="py-24 max-w-2xl mx-auto">
           <div className="flex flex-wrap w-full md:w-320 pt-16">
              <div className="mb-32 w-full sm:w-1/2 md:w-full">
                <motion.div variants={item} className="widget w-full p-16">
                  <MeasurementsWidget data={clients?.selectedClient} />
                </motion.div>
              </div>

              {/* <div className="mb-32 w-full sm:w-1/2 md:w-full">
                <Typography
                  component={motion.div}
                  variants={item}
                  className="px-16 pb-8 text-18 font-medium"
                  color="textSecondary"
                >
                  How are your sales?
                </Typography>

                <motion.div variants={item} className="widget w-full p-16">
                  <Widget8 data={widgets.widget8} />
                </motion.div>
              </div> */}

              {/* <div className="mb-32 w-full sm:w-1/2 md:w-full">
                <Typography
                  component={motion.div}
                  variants={item}
                  className="px-16 pb-8 text-18 font-medium lg:pt-0"
                  color="textSecondary"
                >
                  What are your top campaigns?
                </Typography>
                <motion.div variants={item} className="widget w-full p-16">
                  <Widget9 data={widgets.widget9} />
                </motion.div>
              </div> */}
        </div>
        </div>
      }
    />
  );
}

export default Dashboard;
