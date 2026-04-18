import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setConcurrency(4);

// For ProRes output (higher quality, larger file)
// Config.setCodec('prores');
// Config.setProResProfile('4444');
