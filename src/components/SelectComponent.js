import React from "react";
import { UserContext, UserDispatchContext } from "../Context/MyContext";
import { useContext } from "react";

import { Input, FormGroup } from "reactstrap";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const CustomSelect = ({ options, fieldtype, value1, inval, sh }) => {
  const userDetails = React.useContext(UserContext);
  const setUserDetails = useContext(UserDispatchContext);
  const [selectedOption, setSelectedOption] = React.useState(value1 === 'fromLocation' ? userDetails.fromCityId : userDetails.toCityId);
  React.useEffect(() => {
    setSelectedOption(value1 === 'fromLocation' ? userDetails.fromLocation : userDetails.toLocation);
  });
  // alert(selectedOption+'---------------------')
  const update = (e) => {
    const newValue = e.target.value;
    const newID = options.find((city) => city.location === newValue);

    if (e.target.value !== "select") {
      setSelectedOption(e.target.value);
      const updateItem = {
        ...userDetails,
        [fieldtype]: newID.id,
        [value1]: newValue,
        [sh]: newID.shortcode,
      };
      setUserDetails(updateItem);
    }
  };

  return (
    <div>
      <FormControl fullWidth
        variant="standard" margin="normal">
        <InputLabel id="from-city-label">{value1 === 'fromLocation' ? "From" : "To"} City</InputLabel>
        <Select
          name="frequency"
          id="frequency"
          value={selectedOption}
          onChange={e => update(e)}
          focused
          defaultValue={'Select'}
        >
          {options.length > 0 ? (
            options.map((fromCity) => (
              <MenuItem key={fromCity.id} value={fromCity.location} shortcode={fromCity.shortcode}>
                {fromCity.location}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No Cities Available</MenuItem>
          )}
        </Select>
      </FormControl>
    </div>
  );
};
export default CustomSelect;
