import { Box, FormControl, FormControlLabel, FormGroup, Switch } from '@mui/material';
import PropTypes from 'prop-types';

export const ConfigBox = ({ controls }) => {
  const { toggleFollowChat, toggleLLMUse } = controls;

  return (
    <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
      <FormControl component="fieldset" sx={{ display: 'flex', gap: 1 }}>
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
    control={
      <Switch
        onChange={toggleFollowChat}
        defaultValue={true}
        defaultChecked={true}
        color="success"
      />
    }
    label="Follow chat"
    labelPlacement="start"
  />
);

FollowChatToggle.propTypes = {
  toggleFollowChat: PropTypes.func.isRequired,
};

const UseLLMToggle = ({ toggleLLMUse }) => (
  <FormControlLabel
    control={
      <Switch onChange={toggleLLMUse} defaultValue={true} defaultChecked={true} color="success" />
    }
    label="Explain moves"
    labelPlacement="start"
  />
);

UseLLMToggle.propTypes = {
  toggleLLMUse: PropTypes.func.isRequired,
};
