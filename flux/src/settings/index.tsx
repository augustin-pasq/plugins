import { ConfigStore } from '@kinvolk/headlamp-plugin/lib';
import { NameValueTable } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import Switch from '@mui/material/Switch';
import { useEffect, useState } from 'react';

function AutoSaveSwitch({ settingKey, onSave, defaultValue, helperText = null }) {
  const [value, setValue] = useState(defaultValue);
  const [timer, setTimer] = useState(null);

  const handleChange = event => {
    const newValue = event.target.checked;
    setValue(newValue);

    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => onSave(settingKey, newValue), 100);
    setTimer(newTimer);
  };

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  return (
    <>
      <Switch checked={value} onChange={handleChange} />
      {helperText && <FormHelperText sx={{ ml: 1.75, mt: 0.5 }}>{helperText}</FormHelperText>}
    </>
  );
}

interface pluginConfig {
  linkHRelToKs: boolean;
  loadCRDsByDefault: boolean;
}

export const store = new ConfigStore<pluginConfig>('@headlamp-k8s/flux');

export function FluxSettings() {
  const [currentConfig, setCurrentConfig] = useState<pluginConfig>(() => store.get());

  function handleSave(key: keyof pluginConfig, value: boolean) {
    const updatedConfig = { ...currentConfig, [key]: value };
    store.set(updatedConfig);
    setCurrentConfig(updatedConfig);
  }

  const settingsRows = [
    {
      name: 'Link HelmReleases to Kustomizations instead of HelmRepositories',
      value: (
        <AutoSaveSwitch
          settingKey="linkHRelToKs"
          defaultValue={currentConfig?.linkHRelToKs}
          onSave={handleSave}
        />
      ),
    },
    {
      name: 'Load Flux CRDs by default',
      value: (
        <AutoSaveSwitch
          settingKey="loadCRDsByDefault"
          defaultValue={currentConfig?.loadCRDsByDefault}
          onSave={handleSave}
          helperText="If enabled, Flux CRDs will be displayed by default. This may impact performance on clusters with many resources."
        />
      ),
    },
  ];

  return (
    <Box style={{ paddingTop: '8vh' }}>
      <Typography variant="h6">Map settings</Typography>
      <NameValueTable rows={settingsRows} />
    </Box>
  );
}
