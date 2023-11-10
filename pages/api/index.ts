import { HttpStatusCode } from 'axios';
import ytdl from 'ytdl-core';
import fs from 'fs';
// import ffmpeg from 'fluent-ffmpeg';
import { NextApiRequest, NextApiResponse } from 'next';
import { AUDIO_TYPE } from '../constants';

export const config = {
  api: {
    responseLimit: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST': {
      if (!req.body || req.body.link === '' || req.body.audioType === '')
        return res.status(HttpStatusCode.BadRequest).json(null);
      const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
      const ffmpeg = require('fluent-ffmpeg');
      ffmpeg.setFfmpegPath(ffmpegPath);

      const YOUTUBE_URL = req.body.link;
      const fileTypeChosen = req.body.audioType;

      const videoStream = ytdl(YOUTUBE_URL, {
        filter: 'audioonly',
        quality: 'highestaudio',
      });

      const info = await ytdl.getInfo(YOUTUBE_URL);
      // const fileName = `${info.videoDetails.title}.mp3`;

      const thumbnailUrl =
        info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]
          .url;

      let fileName = '';
      let contentType = '';

      switch (fileTypeChosen) {
        case AUDIO_TYPE.MP3: {
          contentType = 'audio/mpeg';
          fileName = `${info.videoDetails.title}.mp3`;
          const audioStream = ffmpeg(videoStream)
            .audioBitrate('320')
            .toFormat('mp3');
          audioStream.pipe(res, { end: true });
          break;
        }
        case AUDIO_TYPE.WAV: {
          contentType = 'audio/wav';
          fileName = `${info.videoDetails.title}.wav`;
          const audioStream = ffmpeg(videoStream).toFormat('wav');
          audioStream.pipe(res);
          break;
        }
        default:
          return res.status(HttpStatusCode.BadRequest).json(null);
      }

      res.writeHead(HttpStatusCode.Ok, {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=${encodeURIComponent(
          fileName
        )} thumb=${thumbnailUrl}`,
      });

      break;
    }
    default: {
      return res.status(HttpStatusCode.BadRequest).json(null);
    }
  }
};

export default handler;
