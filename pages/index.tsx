import axios from 'axios';
import { ChangeEvent, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Box,
  CardMedia,
  Alert,
  LinearProgress,
} from '@mui/material';

const Homepage = () => {
  const [link, setLink] = useState('');
  const [audio, setAudio] = useState({
    audio: '',
    fileName: '',
  });

  const [downloadInfo, setDownloadInfo] = useState({
    size: '',
    end: false,
    thumb: '',
  });

  const audioRef = useRef<null | HTMLAudioElement>(null);

  const handleChangeLink = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e) return;
    setLink(e.target.value);
  };

  const handleDownload = async () => {
    const data = await axios.post(
      '/api',
      { link },
      {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          setDownloadInfo((prev) => ({
            ...prev,
            size: `${progressEvent.loaded / 1000000}MB`,
          }));
        },
      }
    );

    const disposition = data.headers['content-disposition'];
    const fileName = disposition
      .slice(0, disposition.length - 4)
      .split('filename=')[1]
      .split(';')[0]
      .split(' thumb=')[0];

    console.log(disposition);

    const thumbnailUrl = disposition
      .slice(0, disposition.length - 4)
      .split('thumb=')[1]
      .split(';')[0];

    setDownloadInfo({ size: '', end: true, thumb: thumbnailUrl });

    const blobUrl = URL.createObjectURL(data.data);
    setAudio({ audio: blobUrl, fileName });
  };

  const handleSaveAs = () => {
    saveAs(audio.audio, audio.fileName);
  };

  return (
    <>
      <TextField
        label="Link"
        variant="standard"
        type="text"
        value={link}
        onChange={handleChangeLink}
      />
      <Button variant="contained" onClick={handleDownload}>
        Konwertuj
      </Button>

      {downloadInfo.size.length > 0 && (
        <>
          <Typography variant="h6">
            Pobrano: {parseFloat(downloadInfo.size).toFixed(2)} MB
          </Typography>
          <LinearProgress />
        </>
      )}

      {downloadInfo.end && (
        <Alert severity="success">Pobieranie ukończone</Alert>
      )}

      {downloadInfo.end && (
        <>
          <Card sx={{ display: 'flex' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: '1 0 auto' }}>
                <Typography component="div" variant="h5">
                  {audio.fileName.includes('-')
                    ? audio.fileName
                        .slice(0, audio.fileName.length - 4)
                        .split('-')[1]
                    : audio.fileName}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  component="div"
                >
                  {audio.fileName.includes('-')
                    ? audio.fileName.split('-')[0]
                    : ''}
                </Typography>
              </CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  pl: 1,
                  pb: 1,
                }}
              >
                {audio.audio.length > 0 && <audio controls src={audio.audio} />}
              </Box>
            </Box>
            {downloadInfo.thumb.length > 0 && (
              <CardMedia
                component="img"
                sx={{ width: 151 }}
                image={downloadInfo.thumb}
                alt={`${audio.fileName} cover`}
              />
            )}
          </Card>
          {audio.audio.length > 0 && (
            <Button color="success" variant="contained" onClick={handleSaveAs}>
              Pobierz
            </Button>
          )}
        </>
      )}
    </>
  );
};

export default Homepage;
