import { HttpStatusCode } from 'axios';
import ytdl from 'ytdl-core';
import fs from 'fs';
// import ffmpeg from 'fluent-ffmpeg';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    responseLimit: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST': {
      if (!req.body || req.body.link === '')
        return res.status(HttpStatusCode.BadRequest).json(null);
      const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
      const ffmpeg = require('fluent-ffmpeg');
      ffmpeg.setFfmpegPath(ffmpegPath);

      const YOUTUBE_URL = req.body.link;

      const videoStream = ytdl(YOUTUBE_URL, {
        filter: 'audioonly',
        quality: 'highestaudio',
      });

      const info = await ytdl.getInfo(YOUTUBE_URL);
      const fileName = `${info.videoDetails.title}.mp3`;

      const thumbnailUrl =
        info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]
          .url;

      const audioStream = ffmpeg(videoStream)
        .audioBitrate('320')
        .toFormat('mp3');
      audioStream.pipe(res);

      res.writeHead(HttpStatusCode.Ok, {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename=${fileName} thumb=${thumbnailUrl}`,
      });

      // res.writeHead(HttpStatusCode.Ok, {
      //   'Content-Type': 'audio/mpeg',
      //   'Content-Disposition': `attachment; filename=${fileName}`,
      // });

      break;
    }
    default: {
      return res.status(HttpStatusCode.BadRequest).json(null);
    }
  }
};

export default handler;
