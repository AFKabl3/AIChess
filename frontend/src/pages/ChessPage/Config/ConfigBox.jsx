import { Box, FormControl, FormControlLabel, FormGroup, FormLabel, Switch } from '@mui/material';
import PropTypes from 'prop-types';

export const ConfigBox = ({ controls }) => {
  const { toggleFollowChat, toggleLLMUse } = controls;

  return (
    <Box sx={{ p: 1 }}>
      <FormControl component="fieldset" sx={{ display: 'flex', gap: 1 }}>
        <FormLabel component="legend" disabled>
          Settings
        </FormLabel>
        <FormGroup row>
          {toggleFollowChat && <FollowChatToggle toggleFollowChat={toggleFollowChat} />}
          {toggleLLMUse && <UseLLMToggle toggleLLMUse={toggleLLMUse} />}
        </FormGroup>
      </FormControl>
    </Box>
  );
};

ConfigBox.propTypes = {
  controls: PropTypes.object.isRequired,
};

const FollowChatToggle = ({ toggleFollowChat }) => (
  <FormControlLabel
    control={<Switch onChange={toggleFollowChat} defaultValue={true} defaultChecked={true} />}
    label="Follow chat"
    labelPlacement="start"
  />
);

FollowChatToggle.propTypes = {
  toggleFollowChat: PropTypes.func.isRequired,
};

const UseLLMToggle = ({ toggleLLMUse }) => (
  <FormControlLabel
    control={<Switch onChange={toggleLLMUse} defaultValue={true} defaultChecked={true} />}
    label="Explain moves"
    labelPlacement="start"
  />
);

UseLLMToggle.propTypes = {
  toggleLLMUse: PropTypes.func.isRequired,
};
