import React,{ useState }   from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Select, MenuItem,TextField,Box, InputLabel, FormControl } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import userService from "../services/user.service";

const BookingFornFiled = (data,formCityData) => {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // if (name === "fromLocation") {
    //   const fromId = formCityData.find((city) => city.location === value);
    //   setFromCityId(parseInt(fromId.id));
    // } else if (name === "toLocation") {
    //   const toId = toCityData.find((city) => city.location === value);
    //   setToCityId(parseInt(toId.id));
    // } 
  };

 return (
    <>     
  <Box
    sx={{
      display: 'flex', // Enables horizontal layout
      gap: 2,          // Adds space between the fields
      flexWrap: 'wrap', // Wraps to the next row if needed
    }}
    >
  <Box display="flex" flexDirection="column" gap={2} width="400px" mx="auto"></Box>
    <Box sx={{ width: '250px' }}>
       <FormControl fullWidth margin="normal">
      <InputLabel id="fromCity-label">From City</InputLabel>
        <Select
          labelId="fromCity-label"
          name="fromLocation"
          value={formData.fromCity}
          onChange={handleChange}
           // Makes the dropdown read-only
          sx={{ fontWeight: "bold" }} // Apply bold text style
        >
    
          {formCityData.length > 0 ? (
            formCityData.map((fromCity) => (
              <MenuItem key={fromCity.id} value={fromCity.location}>
                {fromCity.location}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No Cities Available</MenuItem>
          )}
        </Select>
      </FormControl>
    </Box>

  </Box>
  </>
 )
//     <Box display="flex" flexDirection="column" gap={2} width="400px" mx="auto"></Box>
  
//     <Box sx={{ width: '250px' }}>
//       <FormControl fullWidth margin="normal">
//       <InputLabel id="fromCity-label">From City</InputLabel>
//         <Select
//           labelId="fromCity-label"
//           name="fromLocation"
//           value={formData.fromCity}
//           onChange={handleChange}
//            // Makes the dropdown read-only
//           sx={{ fontWeight: "bold" }} // Apply bold text style
//         >
    
//           {formCityData.length > 0 ? (
//             formCityData.map((fromCity) => (
//               <MenuItem key={fromCity.id} value={fromCity.location}>
//                 {fromCity.location}
//               </MenuItem>
//             ))
//           ) : (
//             <MenuItem disabled>No Cities Available</MenuItem>
//           )}
//         </Select>
//       </FormControl>
//     </Box>
//     <Box sx={{ width: '250px' }}>
//     <FormControl fullWidth margin="normal">
//     <InputLabel id="toCity-label">To City</InputLabel>
//         <Select
//           labelId="toCity-label"
//           name="toLocation"
//           value={formData.toCity}
//           onChange={handleChange}
//           sx={{ fontWeight: "bold" }}
          
//         >
    
//           {formCityData.length > 0 ? (
//             toCityData.map((toCity) => (
//               <MenuItem key={toCity.id} value={toCity.location}>
//                 {toCity.location}
//               </MenuItem>
//             ))
//           ) : (
//             <MenuItem disabled>No Cities Available</MenuItem>
//           )}
//         </Select>
//       </FormControl>
//     </Box>
// <Box sx={{ width: '250px' }}>
//     <TextField
//       fullWidth
//       label="SenderName"
//       name="senderName"
//       value={formData.Name || ""}
//       onChange={handleChange}
//       margin="normal"
//     />
//   </Box>
//   <Box sx={{ width: '250px' }}>
//     <TextField
//       fullWidth
//       label="Mobile Number"
//       name="senderMobileNumber"
//       value={formData.MobileNumber || ""}
//       onChange={handleChange}
//       margin="normal"
//     />
//   </Box>
//   <Box sx={{ width: '250px' }}>
//           <TextField
//             fullWidth
//             label="Email"
//             name="senderEmail"
//             value={formData.Email || ""}
//             onChange={handleChange}
//             margin="normal"
//           />
//           </Box>
//           <Box sx={{ width: '250px' }}>
//           <TextField
//             fullWidth
//             label="Booking Date"
//             name="bookingDate"
//             value={formData.bookingDate || ""}
//             onChange={handleChange}
//             margin="normal"
//           />
//           </Box>
//         {/* { <Box sx={{ width: '200px' }}>
//         <DatePicker
//           label="Booking Date"
//           value={getDateObject(formData.bookingDate)}
//           name="bookingDate"
//           onChange={handleChange} // Update the date in state
//           renderInput={(params) => <TextField {...params} margin="normal" fullWidth />}
//         />
//       </Box>} */}
//       {/* Booking Type Dropdown */}
//       <Box sx={{ width: '250px' }}>
//         <FormControl fullWidth margin="normal">
//           <InputLabel id="booking-type-label">Booking Type</InputLabel>
//           <Select
//             labelId="booking-type-label"
//             id="booking-type"
//             name="serviceType"
//             value={formData.bookingType}
//             onChange={handleChange}
//           >
//             <MenuItem value="1">Door-Door</MenuItem>
//             <MenuItem value="2">Hub-Hub</MenuItem>
//             <MenuItem value="3">Door-Hub</MenuItem>
//             <MenuItem value="4">Hub-Door</MenuItem>
//           </Select>
//         </FormControl>
//         </Box>
//         <Box sx={{ width: '250px' }}>
//         <TextField
//             fullWidth
//             label="Price"
//             name="totalCharges"
//             value={priceData || 0}
//             onChange={handleChange}
//             margin="normal"
//           />
//   </Box>
//       </Box>

//      </>
//     )
  }
export default  BookingFornFiled