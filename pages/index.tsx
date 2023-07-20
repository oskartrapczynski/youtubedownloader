import axios from 'axios';
import { ChangeEvent, useEffect, useState } from 'react';
import { saveAs } from 'file-saver';

import { TextField, Button, Typography } from '@mui/material';
import Image from 'next/image';

const Homepage = () => {
  const [link, setLink] = useState(
    'https://www.youtube.com/watch?v=50DEtvLTE34'
  );
  const [audio, setAudio] = useState({
    audio: '',
    fileName: '',
  });

  const [downloadInfo, setDownloadInfo] = useState({
    size: '',
    end: false,
    thumb: '',
  });

  // const fetchData = async () => {
  //   // const data = await axios.get('/api/test');
  //   const { data } = await axios.get('/api');
  //   console.log(data);

  //   setAudio(data);
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

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
          // console.log(`${progressEvent.loaded / 1000000}MB`);
          setDownloadInfo((prev) => ({
            ...prev,
            size: `${progressEvent.loaded / 1000000}MB`,
          }));
        },
      }
    );

    // console.log(data);

    const disposition = data.headers['content-disposition'];
    const fileName = disposition
      .slice(0, disposition.length - 4)
      .split('filename=')[1]
      .split(';')[0];

    const thumbnailUrl = disposition
      .slice(0, disposition.length - 4)
      .split('thumb=')[1]
      .split(';')[0];

    setDownloadInfo({ size: '', end: true, thumb: thumbnailUrl });

    // console.log(thumbnailUrl);

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
      {audio.audio.length > 0 && <audio controls src={audio.audio} />}
      {audio.audio.length > 0 && (
        <Button color="success" variant="contained" onClick={handleSaveAs}>
          Pobierz
        </Button>
      )}
      {downloadInfo.size.length > 0 && (
        <Typography variant="h6">
          Pobrano: {parseFloat(downloadInfo.size).toFixed(2)} MB
        </Typography>
      )}
      {downloadInfo.end && (
        <Typography color="success.main" variant="h6">
          Pobieranie ukończone
        </Typography>
      )}
      {downloadInfo.thumb.length > 0 && (
        <img
          style={{ width: '30%' }}
          src={downloadInfo.thumb}
          alt={`${audio.fileName} thumb`}
        />
      )}
    </>
  );
};

export default Homepage;
