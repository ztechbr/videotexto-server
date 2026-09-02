'use strict';

const path = require('path');
const { createCache } = require('./cache');
const { imageToMosaic } = require('../videotex/image2mosaic');

const SAMPLE_PATH = path.join(__dirname, '..', '..', 'assets', 'sample-logo.png');

const cache = createCache({
  label: 'logo de exemplo (PNG -> mosaico)',
  fetcher: () => imageToMosaic(SAMPLE_PATH, 16, 12),
  ttlMs: 24 * 60 * 60 * 1000, // arquivo local: praticamente nunca muda
});

module.exports = { cache };
